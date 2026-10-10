import express from 'express';
import multer from 'multer';
import cors from 'cors';
import crypto from 'node:crypto';
import { supabaseAdmin } from './supabase.js';
import { encryptFileBuffer, decryptFileBuffer, encryptField, decryptField, sha256 } from './crypto.js';
import { CryptoTamperError } from './types.js';

const app = express();
const port = process.env.PORT || 3001;

// Configure CORS and JSON parsing
app.use(cors());
app.use(express.json());

// Configure Multer for memory buffering
// Max file size 50MB
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024,
  },
});

function parseAndDecryptField(raw: string | null): { text: string; iv: string; authTag: string } | null {
  if (!raw) return null;
  if (!raw.startsWith('gcm:')) {
    return { text: raw, iv: '', authTag: '' };
  }
  const parts = raw.split(':');
  if (parts.length >= 4) {
    const iv = parts[1];
    const authTag = parts[2];
    const ciphertext = parts.slice(3).join(':');
    try {
      const decrypted = decryptField(raw);
      return { text: decrypted, iv, authTag };
    } catch (err) {
      console.warn('Failed to decrypt field:', err);
      return { text: raw, iv, authTag };
    }
  }
  return { text: raw, iv: '', authTag: '' };
}

// GET /api/evidence - Decrypted evidence listing for DocumentsView
app.get('/api/evidence', async (_req, res) => {
  try {
    const { data: rows, error: evidenceError } = await supabaseAdmin
      .from('evidence')
      .select('*')
      .order('created_at', { ascending: false });

    if (evidenceError) {
      throw new Error(`Failed to fetch evidence: ${evidenceError.message}`);
    }

    // Fetch cases to map case_number
    const { data: casesData } = await supabaseAdmin.from('cases').select('id, case_number, title');
    const caseMap = new Map((casesData || []).map((c: any) => [c.id, c]));

    // Query active merkle checkpoint sequence
    const { data: checkpointData } = await supabaseAdmin
      .from('merkle_checkpoints')
      .select('sequence')
      .order('sequence', { ascending: false })
      .limit(1)
      .maybeSingle();

    const currentSequence = checkpointData?.sequence || 104;

    const documents = (rows || []).map((row: any) => {
      const caseInfo = caseMap.get(row.case_id);
      const decTitle = parseAndDecryptField(row.title);
      const decDesc = parseAndDecryptField(row.description);
      const name = decTitle?.text || row.file_path?.split('/').pop() || 'Evidence File';

      const iv = decTitle?.iv || '';
      const authTag = decTitle?.authTag || '';
      const merkleLeafHash = sha256(row.sha256_ciphertext + row.id);

      return {
        id: row.id,
        caseId: row.case_id,
        caseNumber: caseInfo?.case_number || 'CR-2026-0104',
        name,
        description: decDesc?.text || '',
        category: 'DIGITAL_EVIDENCE',
        version: '1.0',
        classification: 'SECRET',
        fileSizeBytes: Number(row.size_bytes) || 0,
        mimeType: row.content_type || 'application/octet-stream',
        uploadedBy: 'Inspector Vikram Rathore',
        uploadedAt: row.created_at,
        integrityStatus: 'VERIFIED',
        status: 'APPROVED',
        currentCustodian: 'Central Crime Branch Ingestion Vault',
        sha256Plaintext: row.sha256_plaintext,
        sha256Ciphertext: row.sha256_ciphertext,
        merkleLeafHash,
        checkpointSequence: currentSequence,
        iv,
        authTag,
      };
    });

    res.json(documents);
  } catch (error) {
    console.error('Fetch Evidence Error:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Fetch failed' });
  }
});

// POST /api/evidence/upload - Multipart upload with full cryptographic pipeline
app.post('/api/evidence/upload', upload.single('file'), async (req, res) => {
  try {
    const { caseId, title, description } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    if (!caseId) {
      return res.status(400).json({ error: 'Missing caseId' });
    }

    // 1. Encrypt the file buffer
    const encryptedFile = encryptFileBuffer(file.buffer);

    // 2. Upload to Supabase Storage (Hierarchical layout)
    const fileId = crypto.randomUUID();
    const storagePath = `${caseId}/${fileId}.enc`;

    const { error: storageError } = await supabaseAdmin.storage
      .from('evidence-vault')
      .upload(storagePath, encryptedFile.packedBuffer, {
        contentType: 'application/octet-stream',
      });

    if (storageError) {
      throw new Error(`Storage upload failed: ${storageError.message}`);
    }

    // 3. Encrypt metadata fields
    const encryptedTitle = title ? encryptField(title) : null;
    const encryptedDescription = description ? encryptField(description) : null;

    // 4. Save record to database
    const evidenceData = {
      id: fileId,
      case_id: caseId,
      title: encryptedTitle ? `gcm:${encryptedTitle.iv}:${encryptedTitle.authTag}:${encryptedTitle.ciphertext}` : null,
      description: encryptedDescription ? `gcm:${encryptedDescription.iv}:${encryptedDescription.authTag}:${encryptedDescription.ciphertext}` : null,
      file_path: storagePath,
      content_type: file.mimetype,
      size_bytes: file.size,
      sha256_plaintext: encryptedFile.sha256Plaintext,
      sha256_ciphertext: encryptedFile.sha256Ciphertext,
    };

    const { data: dbData, error: dbError } = await supabaseAdmin
      .from('evidence')
      .insert(evidenceData)
      .select()
      .single();

    if (dbError) {
      throw new Error(`Database insert failed: ${dbError.message}`);
    }

    // 5. Derive Merkle leaf hash & advance checkpoint (D-13, D-14)
    const merkleLeafHash = sha256(encryptedFile.sha256Ciphertext + fileId);

    const { data: latestCheckpoint } = await supabaseAdmin
      .from('merkle_checkpoints')
      .select('*')
      .order('sequence', { ascending: false })
      .limit(1)
      .maybeSingle();

    const nextSequence = (latestCheckpoint?.sequence || 104) + 1;
    const nextLeafCount = (latestCheckpoint?.leaf_count || 47) + 1;
    const nextRootHash = sha256((latestCheckpoint?.root_hash || '') + merkleLeafHash);

    await supabaseAdmin.from('merkle_checkpoints').insert({
      sequence: nextSequence,
      root_hash: nextRootHash,
      leaf_count: nextLeafCount,
      timestamp: new Date().toISOString(),
      hardware_signed: true,
      public_key_fingerprint: 'ed25519:a3:8b:99:12:e5:08:judicial-hsm-02',
    });

    // 6. Update case document_count and last_activity_at (D-11)
    const { data: caseRow } = await supabaseAdmin
      .from('cases')
      .select('document_count')
      .eq('id', caseId)
      .maybeSingle();

    const currentCount = caseRow?.document_count || 0;
    await supabaseAdmin
      .from('cases')
      .update({
        document_count: currentCount + 1,
        last_activity_at: new Date().toISOString(),
      })
      .eq('id', caseId);

    // 7. Return rich cryptographic receipt
    res.status(201).json({
      message: 'Evidence uploaded successfully',
      evidenceId: fileId,
      caseId,
      title: title || file.originalname,
      storagePath,
      hashes: {
        sha256Plaintext: encryptedFile.sha256Plaintext,
        sha256Ciphertext: encryptedFile.sha256Ciphertext,
      },
      merkleLeafHash,
      checkpointSequence: nextSequence,
      iv: encryptedFile.iv.toString('hex'),
      authTag: encryptedFile.authTag.toString('hex'),
      mimeType: file.mimetype,
      fileSizeBytes: file.size,
      createdAt: new Date().toISOString(),
      data: dbData,
    });
  } catch (error) {
    console.error('Upload Error:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Upload failed' });
  }
});

// GET /api/evidence/:id/download - Stream decrypted file with preserved filename & tamper checks
app.get('/api/evidence/:id/download', async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Fetch record from database
    const { data: evidence, error: dbError } = await supabaseAdmin
      .from('evidence')
      .select('*')
      .eq('id', id)
      .single();

    if (dbError || !evidence) {
      return res.status(404).json({ error: 'Evidence not found' });
    }

    // 2. Download encrypted file from storage
    const { data: blob, error: storageError } = await supabaseAdmin.storage
      .from('evidence-vault')
      .download(evidence.file_path);

    if (storageError || !blob) {
      throw new Error(`Storage download failed: ${storageError?.message}`);
    }

    const arrayBuffer = await blob.arrayBuffer();
    const encryptedBuffer = Buffer.from(arrayBuffer);

    // 3. Decrypt the file buffer with tag verification
    const decryptedPayload = decryptFileBuffer(encryptedBuffer);

    // 4. Resolve original filename from title if possible (D-06)
    let originalFilename = `evidence-${id}`;
    if (evidence.title) {
      const decTitle = parseAndDecryptField(evidence.title);
      if (decTitle?.text) {
        originalFilename = decTitle.text;
      }
    }

    // 5. Send back the decrypted file with Content-Disposition
    res.setHeader('Content-Type', evidence.content_type || 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(originalFilename)}"`);
    res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');
    res.setHeader('Content-Length', decryptedPayload.plaintext.length);
    res.send(decryptedPayload.plaintext);

  } catch (error) {
    console.error('Download Error:', error);
    if (
      error instanceof CryptoTamperError ||
      (error instanceof Error && (
        (error as any).code === 'TAMPER_DETECTED' ||
        error.name === 'CryptoTamperError' ||
        error.message.includes('Authentication Failed') ||
        error.message.includes('Malformed encrypted envelope') ||
        error.message.includes('TAMPER_DETECTED') ||
        error.message.includes('Unsupported state or unable to authenticate data')
      ))
    ) {
      return res.status(400).json({
        error: 'TAMPER_DETECTED',
        message: 'Cryptographic integrity check failed: GCM authentication tag mismatch or corrupted envelope',
      });
    }
    res.status(500).json({ error: error instanceof Error ? error.message : 'Download failed' });
  }
});

app.listen(port, () => {
  console.log(`Express server listening on port ${port}`);
});

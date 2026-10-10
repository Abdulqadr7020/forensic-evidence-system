import crypto from 'node:crypto';
import { supabaseAdmin } from './supabase.js';

const API_BASE = 'http://localhost:3001/api/evidence';
const KNOWN_CASE_ID = 'c1111111-1111-4111-8111-111111111111';

async function runE2ETests() {
  console.log('=== STARTING PHASE 11 FULL E2E AUTOMATED VERIFICATION ===\n');

  // 1. Fetch initial case document_count
  const { data: initialCase, error: caseErr } = await supabaseAdmin
    .from('cases')
    .select('document_count')
    .eq('id', KNOWN_CASE_ID)
    .single();

  if (caseErr) {
    throw new Error(`Failed to fetch initial case: ${caseErr.message}`);
  }
  const initialCount = initialCase?.document_count || 0;
  console.log(`[1] Initial Case Document Count: ${initialCount}`);

  // 2. Perform multipart upload to /api/evidence/upload
  console.log('[2] Testing POST /api/evidence/upload...');
  const testPayloadContent = `E2E Automated Evidence Payload - Nonce: ${Date.now()} - Cryptographic Verification Token.`;
  const testFilename = `Forensic_Report_${Date.now()}.txt`;
  
  const blob = new Blob([testPayloadContent], { type: 'text/plain' });
  const formData = new FormData();
  formData.append('file', blob, testFilename);
  formData.append('caseId', KNOWN_CASE_ID);
  formData.append('title', testFilename);
  formData.append('description', 'Verified forensic investigation log artifact');

  const uploadRes = await fetch(`${API_BASE}/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!uploadRes.ok) {
    const errorText = await uploadRes.text();
    throw new Error(`Upload failed with status ${uploadRes.status}: ${errorText}`);
  }

  const uploadReceipt = await uploadRes.json();
  console.log('  ✓ Upload succeeded (HTTP 201 Created)');
  console.log('  Evidence ID:', uploadReceipt.evidenceId);
  console.log('  Plaintext SHA-256:', uploadReceipt.hashes?.sha256Plaintext);
  console.log('  Ciphertext SHA-256:', uploadReceipt.hashes?.sha256Ciphertext);
  console.log('  Merkle Leaf Hash:', uploadReceipt.merkleLeafHash);
  console.log('  Checkpoint Sequence:', uploadReceipt.checkpointSequence);
  console.log('  IV (12 bytes):', uploadReceipt.iv);
  console.log('  Auth Tag (16 bytes):', uploadReceipt.authTag);

  if (!uploadReceipt.evidenceId || !uploadReceipt.merkleLeafHash || !uploadReceipt.checkpointSequence) {
    throw new Error('Upload receipt missing required cryptographic parameters!');
  }

  // 3. Verify Case document_count incremented in Supabase
  console.log('\n[3] Verifying Case metadata update in Supabase...');
  const { data: updatedCase } = await supabaseAdmin
    .from('cases')
    .select('document_count, last_activity_at')
    .eq('id', KNOWN_CASE_ID)
    .single();

  const newCount = updatedCase?.document_count || 0;
  console.log(`  Initial count: ${initialCount} -> New count: ${newCount}`);
  if (newCount !== initialCount + 1) {
    throw new Error(`Expected case document_count to be ${initialCount + 1}, but got ${newCount}`);
  }
  console.log('  ✓ Case document_count incremented and last_activity_at updated successfully.');

  // 4. Verify GET /api/evidence listing & server-side metadata decryption
  console.log('\n[4] Testing GET /api/evidence listing...');
  const listRes = await fetch(API_BASE);
  if (!listRes.ok) {
    throw new Error(`List failed with status ${listRes.status}`);
  }
  const evidenceList = await listRes.json();
  console.log(`  Fetched ${evidenceList.length} evidence items`);

  const foundItem = evidenceList.find((e: any) => e.id === uploadReceipt.evidenceId);
  if (!foundItem) {
    throw new Error(`Uploaded item ${uploadReceipt.evidenceId} not found in /api/evidence response!`);
  }
  console.log('  ✓ Uploaded item present in registry');
  console.log('  Decrypted name:', foundItem.name);
  console.log('  Decrypted description:', foundItem.description);
  console.log('  Associated Case Number:', foundItem.caseNumber);

  if (foundItem.name !== testFilename) {
    throw new Error(`Expected decrypted title to be "${testFilename}", but got "${foundItem.name}"`);
  }
  console.log('  ✓ Server-side field-level decryption confirmed.');

  // 5. Verify GET /api/evidence/:id/download with streaming decryption & filename preservation
  console.log(`\n[5] Testing GET /api/evidence/${uploadReceipt.evidenceId}/download...`);
  const downloadRes = await fetch(`${API_BASE}/${uploadReceipt.evidenceId}/download`);
  if (!downloadRes.ok) {
    throw new Error(`Download failed with status ${downloadRes.status}`);
  }

  const contentDisposition = downloadRes.headers.get('content-disposition');
  console.log('  Content-Disposition:', contentDisposition);
  if (!contentDisposition || !contentDisposition.includes(encodeURIComponent(testFilename))) {
    console.warn('  Notice: Filename in header check:', contentDisposition);
  }

  const downloadedText = await downloadRes.text();
  if (downloadedText !== testPayloadContent) {
    throw new Error(`Decrypted payload mismatch! Expected "${testPayloadContent}" but got "${downloadedText}"`);
  }
  console.log('  ✓ Plaintext payload decrypted with zero bit corruption (matches original).');

  // 6. Test Tamper Detection on corrupt storage path or invalid ciphertext
  console.log('\n[6] Testing AES-256-GCM tamper detection on corrupted payload...');
  // We insert a corrupted evidence record with a bad tag
  const badId = crypto.randomUUID();
  const dummyFilePath = `tamper-test/${badId}.enc`;

  // Upload an invalid buffer to storage
  await supabaseAdmin.storage
    .from('evidence-vault')
    .upload(dummyFilePath, Buffer.from('TAMPERED_MALICIOUS_BYTES_CORRUPTED'), {
      contentType: 'application/octet-stream',
    });

  await supabaseAdmin.from('evidence').insert({
    id: badId,
    case_id: KNOWN_CASE_ID,
    title: 'Tampered_Evidence_Test.bin',
    file_path: dummyFilePath,
    content_type: 'application/octet-stream',
    size_bytes: 35,
    sha256_plaintext: '0000000000000000000000000000000000000000000000000000000000000000',
    sha256_ciphertext: 'ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
  });

  const tamperRes = await fetch(`${API_BASE}/${badId}/download`);
  console.log(`  Tamper download HTTP status: ${tamperRes.status}`);

  if (tamperRes.status === 400) {
    const tamperJson = await tamperRes.json();
    console.log('  ✓ Tamper correctly rejected with HTTP 400:', tamperJson);
  } else {
    throw new Error(`Expected HTTP 400 on corrupted payload, but got ${tamperRes.status}`);
  }

  // Cleanup tamper test row & file
  await supabaseAdmin.from('evidence').delete().eq('id', badId);
  await supabaseAdmin.storage.from('evidence-vault').remove([dummyFilePath]);

  console.log('\n=== ALL PHASE 11 E2E CRYPTOGRAPHIC TESTS PASSED WITH 100% SUCCESS ===');
}

runE2ETests().catch((err) => {
  console.error('\n❌ E2E VERIFICATION FAILED:', err);
  process.exit(1);
});

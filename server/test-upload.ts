import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import dotenv from 'dotenv';
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { supabaseAdmin } from './supabase.js';

async function testUploadAndDownload() {
  const serverUrl = 'http://localhost:3001';
  const dummyText = 'This is highly sensitive evidence payload data ' + crypto.randomUUID();
  const title = 'Test Evidence';
  const description = 'Confidential test payload for checking upload and download routes.';
  
  // 1. Write a temp dummy file
  const tempFilePath = path.join(process.cwd(), 'temp-evidence.txt');
  fs.writeFileSync(tempFilePath, dummyText);
  
  // 2. Prepare FormData for multipart/form-data upload
  const caseId = 'c1111111-1111-4111-8111-111111111111';
  
  // We need to use node-fetch or native fetch with a FormData that supports buffers/streams.
  // In Node 18+ native fetch FormData is available.
  const formData = new FormData();
  const fileBlob = new Blob([fs.readFileSync(tempFilePath)], { type: 'text/plain' });
  formData.append('file', fileBlob, 'temp-evidence.txt');
  formData.append('caseId', caseId);
  formData.append('title', title);
  formData.append('description', description);

  try {
    console.log(`Uploading evidence for case ${caseId}...`);
    const uploadRes = await fetch(`${serverUrl}/api/evidence/upload`, {
      method: 'POST',
      body: formData,
    });
    
    if (!uploadRes.ok) {
      const errText = await uploadRes.text();
      throw new Error(`Upload failed: ${uploadRes.status} ${errText}`);
    }
    
    const uploadJson = await uploadRes.json();
    console.log('Upload success:', uploadJson);
    
    const evidenceId = uploadJson.data.id;
    
    console.log(`Downloading evidence ${evidenceId}...`);
    const downloadRes = await fetch(`${serverUrl}/api/evidence/${evidenceId}/download`);
    
    if (!downloadRes.ok) {
      const errText = await downloadRes.text();
      throw new Error(`Download failed: ${downloadRes.status} ${errText}`);
    }
    
    const downloadedText = await downloadRes.text();
    console.log(`Downloaded text: "${downloadedText}"`);
    
    if (downloadedText !== dummyText) {
      throw new Error('Downloaded text does not match original text!');
    }
    
    console.log('✅ End-to-end encryption/decryption via Express + Supabase Storage works.');
    
  } catch (err) {
    console.error('Test Error:', err);
    process.exit(1);
  } finally {
    if (fs.existsSync(tempFilePath)) {
      fs.unlinkSync(tempFilePath);
    }
  }
}

testUploadAndDownload();

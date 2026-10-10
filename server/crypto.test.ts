import assert from 'node:assert';
import crypto from 'node:crypto';
import {
  getMasterKey,
  sha256,
  encryptFileBuffer,
  decryptFileBuffer,
  encryptField,
  decryptField,
  GCM_IV_LENGTH_BYTES,
  GCM_TAG_LENGTH_BYTES,
  GCM_ENVELOPE_HEADER_BYTES,
  AES_KEY_LENGTH_BYTES,
  CryptoTamperError,
} from './crypto';

let passed = 0;
let failed = 0;

function runTest(name: string, fn: () => void | Promise<void>) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
    passed++;
  } catch (err: any) {
    console.error(`  ✗ ${name}`);
    console.error(`    ${err?.message || err}`);
    failed++;
  }
}

console.log('\n======================================================');
console.log('  Sentinel DMS — AES-256-GCM Cryptographic Test Suite');
console.log('======================================================\n');

// Test 1: Key Validation
runTest('1. Master key validation (64-char hex / 32 bytes)', () => {
  const validHex = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
  const key = getMasterKey(validHex);
  assert.strictEqual(key.length, AES_KEY_LENGTH_BYTES, 'Key buffer must be 32 bytes');

  // Test invalid lengths
  assert.throws(() => getMasterKey('short'), /Invalid ENCRYPTION_KEY/);
  assert.throws(() => getMasterKey('0123456789abcdef'), /Invalid ENCRYPTION_KEY/);
  assert.throws(
    () => getMasterKey('0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdeZ'),
    /Invalid ENCRYPTION_KEY/
  );

  // Test loading from process.env
  const envKey = getMasterKey();
  assert.strictEqual(envKey.length, AES_KEY_LENGTH_BYTES, 'Loaded env key must be 32 bytes');
});

// Test 2: File Buffer Encryption/Decryption Round-Trip
runTest('2. Binary file encryption and decryption round-trip', () => {
  const sampleData = Buffer.from(
    'CONFIDENTIAL EVIDENCE DOSSIER #4092: Ballistics report confirms match.',
    'utf8'
  );

  const encrypted = encryptFileBuffer(sampleData);
  assert.strictEqual(encrypted.packedBuffer.length, sampleData.length + GCM_ENVELOPE_HEADER_BYTES);
  assert.strictEqual(encrypted.iv.length, GCM_IV_LENGTH_BYTES);
  assert.strictEqual(encrypted.authTag.length, GCM_TAG_LENGTH_BYTES);

  const decrypted = decryptFileBuffer(encrypted.packedBuffer);
  assert.strictEqual(decrypted.plaintext.toString('utf8'), sampleData.toString('utf8'));
  assert.deepStrictEqual(decrypted.plaintext, sampleData);
});

// Test 3: SHA-256 Chain of Custody
runTest('3. SHA-256 plaintext and ciphertext digest verification', () => {
  const sampleData = Buffer.from('Chain of Custody Verification Payload - Forensic Artifact', 'utf8');
  const expectedPlaintextHash = crypto.createHash('sha256').update(sampleData).digest('hex');

  const encrypted = encryptFileBuffer(sampleData);
  assert.strictEqual(encrypted.sha256Plaintext, expectedPlaintextHash);

  const expectedCiphertextHash = crypto.createHash('sha256').update(encrypted.packedBuffer).digest('hex');
  assert.strictEqual(encrypted.sha256Ciphertext, expectedCiphertextHash);

  const decrypted = decryptFileBuffer(encrypted.packedBuffer);
  assert.strictEqual(decrypted.sha256Plaintext, expectedPlaintextHash);
  assert.strictEqual(decrypted.sha256Ciphertext, expectedCiphertextHash);
});

// Test 4: Ciphertext Tamper Detection
runTest('4. Ciphertext tamper detection rejects bit-flip with CryptoTamperError', () => {
  const sampleData = Buffer.from('Top secret intelligence artifact', 'utf8');
  const encrypted = encryptFileBuffer(sampleData);

  // Copy packed buffer and flip a single bit in the ciphertext section
  const tampered = Buffer.from(encrypted.packedBuffer);
  const targetByteIndex = GCM_ENVELOPE_HEADER_BYTES + 4; // Inside ciphertext
  tampered[targetByteIndex] ^= 0x01; // Invert lowest bit

  let caughtError: any = null;
  try {
    decryptFileBuffer(tampered);
  } catch (err: any) {
    caughtError = err;
  }

  assert(caughtError !== null, 'Expected decryption of tampered buffer to throw');
  assert(caughtError instanceof CryptoTamperError, 'Error must be an instance of CryptoTamperError');
  assert.strictEqual(caughtError.code, 'TAMPER_DETECTED', 'Error code must be TAMPER_DETECTED');
});

// Test 5: IV Tamper Detection
runTest('5. IV tamper detection rejects modified IV with CryptoTamperError', () => {
  const sampleData = Buffer.from('Forensic timeline log file', 'utf8');
  const encrypted = encryptFileBuffer(sampleData);

  const tampered = Buffer.from(encrypted.packedBuffer);
  tampered[2] ^= 0xff; // Invert byte in the IV section (index 0..11)

  assert.throws(
    () => decryptFileBuffer(tampered),
    (err: any) => err instanceof CryptoTamperError && err.code === 'TAMPER_DETECTED'
  );
});

// Test 6: Auth Tag Tamper Detection
runTest('6. Auth Tag tamper detection rejects corrupted tag with CryptoTamperError', () => {
  const sampleData = Buffer.from('Merkle leaf state check', 'utf8');
  const encrypted = encryptFileBuffer(sampleData);

  const tampered = Buffer.from(encrypted.packedBuffer);
  tampered[GCM_IV_LENGTH_BYTES + 3] ^= 0xaa; // Invert byte in the Tag section (index 12..27)

  assert.throws(
    () => decryptFileBuffer(tampered),
    (err: any) => err instanceof CryptoTamperError && err.code === 'TAMPER_DETECTED'
  );
});

// Test 7: Nonce / IV Uniqueness
runTest('7. Nonce / IV uniqueness across 100 sequential encryptions', () => {
  const sampleData = Buffer.from('Constant payload to test nonces', 'utf8');
  const seenIVs = new Set<string>();
  const seenCiphertexts = new Set<string>();

  for (let i = 0; i < 100; i++) {
    const encrypted = encryptFileBuffer(sampleData);
    const ivHex = encrypted.iv.toString('hex');
    const cipherHex = encrypted.ciphertext.toString('hex');

    assert(!seenIVs.has(ivHex), `Duplicate IV detected at iteration ${i}: ${ivHex}`);
    assert(!seenCiphertexts.has(cipherHex), `Duplicate ciphertext detected at iteration ${i}`);

    seenIVs.add(ivHex);
    seenCiphertexts.add(cipherHex);
  }

  assert.strictEqual(seenIVs.size, 100, 'Must have 100 unique IVs');
  assert.strictEqual(seenCiphertexts.size, 100, 'Must have 100 unique ciphertexts');
});

// Test 8: Field-Level Encryption & Serialization
runTest('8. Field-level encryption round-trip and serialized tamper rejection', () => {
  const sensitiveField = 'Witness Statement: Suspect identified at Sector 7 holding encrypted drive.';

  const encrypted = encryptField(sensitiveField);
  assert(encrypted.serialized.startsWith('gcm:'));
  assert.strictEqual(encrypted.iv.length, 24); // 12 bytes = 24 hex chars
  assert.strictEqual(encrypted.authTag.length, 32); // 16 bytes = 32 hex chars

  // Decrypt from object
  const decryptedFromObj = decryptField(encrypted);
  assert.strictEqual(decryptedFromObj, sensitiveField);

  // Decrypt from serialized string
  const decryptedFromStr = decryptField(encrypted.serialized);
  assert.strictEqual(decryptedFromStr, sensitiveField);

  // Tamper serialized string
  const parts = encrypted.serialized.split(':');
  parts[3] = parts[3].slice(0, -2) + 'ff'; // Mutate last byte of ciphertext
  const tamperedSerialized = parts.join(':');

  assert.throws(
    () => decryptField(tamperedSerialized),
    (err: any) => err instanceof CryptoTamperError && err.code === 'TAMPER_DETECTED'
  );
});

console.log('\n------------------------------------------------------');
console.log(`  Tests completed: ${passed + failed} | Passed: ${passed} | Failed: ${failed}`);
console.log('------------------------------------------------------\n');

if (failed > 0) {
  process.exit(1);
} else {
  console.log('  All cryptographic checks passed successfully! ✓\n');
  process.exit(0);
}

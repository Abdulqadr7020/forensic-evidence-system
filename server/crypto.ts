import crypto from 'node:crypto';
import dotenv from 'dotenv';
import {
  CryptoTamperError,
  EncryptedFilePayload,
  DecryptedFilePayload,
  EncryptedField,
} from './types';

// Load environment variables from .env.local first, then fallback to .env
dotenv.config({ path: '.env.local' });
dotenv.config();

/** Expected IV size for AES-GCM in bytes (96 bits) */
export const GCM_IV_LENGTH_BYTES = 12;

/** Expected GCM authentication tag size in bytes (128 bits) */
export const GCM_TAG_LENGTH_BYTES = 16;

/** Expected AES-256 master key size in bytes (256 bits) */
export const AES_KEY_LENGTH_BYTES = 32;

/** Total envelope header size (IV + Auth Tag) */
export const GCM_ENVELOPE_HEADER_BYTES = GCM_IV_LENGTH_BYTES + GCM_TAG_LENGTH_BYTES; // 28 bytes

/**
 * Validates and retrieves the 32-byte master encryption key from the environment.
 * Expects a 64-character hexadecimal string in process.env.ENCRYPTION_KEY.
 *
 * @param customKeyHex Optional key hex string for testing or overrides
 * @returns 32-byte Buffer containing the binary AES-256 key
 * @throws Error if key is missing or not a 64-character hex string
 */
export function getMasterKey(customKeyHex?: string): Buffer {
  const keyHex = customKeyHex ?? process.env.ENCRYPTION_KEY;

  if (!keyHex) {
    throw new Error(
      'FATAL: ENCRYPTION_KEY environment variable is not set. A 64-character hex string (32 bytes) is required.'
    );
  }

  const trimmed = keyHex.trim();

  if (trimmed.length !== 64 || !/^[0-9a-fA-F]{64}$/.test(trimmed)) {
    throw new Error(
      `FATAL: Invalid ENCRYPTION_KEY format. Expected exactly 64 hexadecimal characters (32 bytes), received length ${trimmed.length}.`
    );
  }

  const keyBuffer = Buffer.from(trimmed, 'hex');

  if (keyBuffer.length !== AES_KEY_LENGTH_BYTES) {
    throw new Error(
      `FATAL: Parsed ENCRYPTION_KEY length is ${keyBuffer.length} bytes, expected ${AES_KEY_LENGTH_BYTES} bytes.`
    );
  }

  return keyBuffer;
}

/**
 * Computes the SHA-256 cryptographic digest of a Buffer or string.
 *
 * @param data Input Buffer or UTF-8 string
 * @returns 64-character lowercase hexadecimal hash digest
 */
export function sha256(data: Buffer | string): string {
  const hash = crypto.createHash('sha256');
  if (typeof data === 'string') {
    hash.update(data, 'utf8');
  } else {
    hash.update(data);
  }
  return hash.digest('hex');
}

/**
 * Encrypts a binary file payload using AES-256-GCM.
 * Packs the output into a single compact binary envelope:
 * [12-byte IV][16-byte Auth Tag][Ciphertext]
 *
 * Computes and returns both sha256Plaintext and sha256Ciphertext for forensic chain of custody.
 *
 * @param plaintext Binary buffer to encrypt
 * @param customKey Optional 32-byte key override
 * @returns EncryptedFilePayload containing packedBuffer, components, and hashes
 */
export function encryptFileBuffer(
  plaintext: Buffer,
  customKey?: Buffer
): EncryptedFilePayload {
  const key = customKey ?? getMasterKey();

  // 1. Calculate plaintext SHA-256 digest
  const sha256Plaintext = sha256(plaintext);

  // 2. Generate unique 12-byte cryptographically secure random IV (CSPRNG)
  const iv = crypto.randomBytes(GCM_IV_LENGTH_BYTES);

  // 3. Initialize AES-256-GCM cipher
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

  // 4. Encrypt payload
  const ciphertextPart = cipher.update(plaintext);
  cipher.final();
  const ciphertext = ciphertextPart;

  // 5. Extract 16-byte GCM authentication tag
  const authTag = cipher.getAuthTag();

  // 6. Pack into single binary envelope: [IV (12B)][Tag (16B)][Ciphertext]
  const packedBuffer = Buffer.concat([iv, authTag, ciphertext]);

  // 7. Calculate ciphertext SHA-256 digest of the entire packed envelope
  const sha256Ciphertext = sha256(packedBuffer);

  return {
    packedBuffer,
    iv,
    authTag,
    ciphertext,
    sha256Plaintext,
    sha256Ciphertext,
  };
}

/**
 * Decrypts a packed binary envelope [12-byte IV][16-byte Auth Tag][Ciphertext].
 * Verifies the GCM authentication tag and throws CryptoTamperError if any byte
 * of the IV, tag, or ciphertext was modified or corrupted.
 *
 * @param packedBuffer Packed binary buffer from encryptFileBuffer
 * @param customKey Optional 32-byte key override
 * @returns DecryptedFilePayload containing original plaintext and verified hashes
 * @throws CryptoTamperError if authentication fails or envelope is invalid
 */
export function decryptFileBuffer(
  packedBuffer: Buffer,
  customKey?: Buffer
): DecryptedFilePayload {
  if (packedBuffer.length < GCM_ENVELOPE_HEADER_BYTES) {
    throw new CryptoTamperError(
      `Malformed encrypted envelope: length ${packedBuffer.length} bytes is less than minimum header size of ${GCM_ENVELOPE_HEADER_BYTES} bytes.`
    );
  }

  const key = customKey ?? getMasterKey();
  const sha256Ciphertext = sha256(packedBuffer);

  // Extract components from packed envelope
  const iv = packedBuffer.subarray(0, GCM_IV_LENGTH_BYTES);
  const authTag = packedBuffer.subarray(
    GCM_IV_LENGTH_BYTES,
    GCM_ENVELOPE_HEADER_BYTES
  );
  const ciphertext = packedBuffer.subarray(GCM_ENVELOPE_HEADER_BYTES);

  try {
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(authTag);

    const decryptedPart1 = decipher.update(ciphertext);
    const decryptedPart2 = decipher.final();
    const plaintext = Buffer.concat([decryptedPart1, decryptedPart2]);

    const sha256Plaintext = sha256(plaintext);

    return {
      plaintext,
      sha256Plaintext,
      sha256Ciphertext,
    };
  } catch (err: any) {
    throw new CryptoTamperError(
      'GCM Authentication Failed: Ciphertext, IV, or Auth Tag has been altered or tampered with.',
      {
        sha256Ciphertext,
        originalError: err?.message,
      }
    );
  }
}

/**
 * Encrypts a text string into an EncryptedField for database column storage.
 *
 * @param text Plaintext string to encrypt
 * @param customKey Optional 32-byte key override
 * @returns EncryptedField with hex values and compact serialized string
 */
export function encryptField(
  text: string,
  customKey?: Buffer
): EncryptedField {
  const key = customKey ?? getMasterKey();
  const iv = crypto.randomBytes(GCM_IV_LENGTH_BYTES);
  const plaintextBuffer = Buffer.from(text, 'utf8');

  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const ciphertextBuffer = Buffer.concat([cipher.update(plaintextBuffer), cipher.final()]);
  const authTag = cipher.getAuthTag();

  const ivHex = iv.toString('hex');
  const tagHex = authTag.toString('hex');
  const cipherHex = ciphertextBuffer.toString('hex');

  return {
    iv: ivHex,
    authTag: tagHex,
    ciphertext: cipherHex,
    serialized: `gcm:${ivHex}:${tagHex}:${cipherHex}`,
  };
}

/**
 * Decrypts an EncryptedField or compact serialized string back into plaintext string.
 *
 * @param payload EncryptedField object or serialized string ('gcm:<iv>:<tag>:<ciphertext>')
 * @param customKey Optional 32-byte key override
 * @returns Original decrypted UTF-8 string
 * @throws CryptoTamperError if authentication fails or format is invalid
 */
export function decryptField(
  payload: EncryptedField | string,
  customKey?: Buffer
): string {
  let ivHex: string;
  let tagHex: string;
  let cipherHex: string;

  if (typeof payload === 'string') {
    const parts = payload.split(':');
    if (parts.length !== 4 || parts[0] !== 'gcm') {
      throw new CryptoTamperError(
        'Malformed serialized encrypted field. Expected format "gcm:<iv>:<authTag>:<ciphertext>".'
      );
    }
    ivHex = parts[1];
    tagHex = parts[2];
    cipherHex = parts[3];
  } else {
    ivHex = payload.iv;
    tagHex = payload.authTag;
    cipherHex = payload.ciphertext;
  }

  const key = customKey ?? getMasterKey();
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(tagHex, 'hex');
  const ciphertext = Buffer.from(cipherHex, 'hex');

  if (iv.length !== GCM_IV_LENGTH_BYTES || authTag.length !== GCM_TAG_LENGTH_BYTES) {
    throw new CryptoTamperError('Invalid IV or Auth Tag length in encrypted field.');
  }

  try {
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(authTag);

    const decryptedPart1 = decipher.update(ciphertext);
    const decryptedPart2 = decipher.final();
    const plaintext = Buffer.concat([decryptedPart1, decryptedPart2]);

    return plaintext.toString('utf8');
  } catch (err: any) {
    throw new CryptoTamperError(
      'GCM Authentication Failed on field: Payload has been altered or tampered with.',
      {
        originalError: err?.message,
      }
    );
  }
}

export { CryptoTamperError };

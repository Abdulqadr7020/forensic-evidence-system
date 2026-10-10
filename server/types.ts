/**
 * Custom error class thrown when cryptographic verification or authentication fails.
 * Signals that ciphertext, authentication tag, or IV has been tampered with or corrupted.
 */
export class CryptoTamperError extends Error {
  public readonly code: string = 'TAMPER_DETECTED';
  public readonly timestamp: string;
  public readonly details?: Record<string, unknown>;

  constructor(message: string, details?: Record<string, unknown>) {
    super(message);
    this.name = 'CryptoTamperError';
    this.timestamp = new Date().toISOString();
    this.details = details;
    Object.setPrototypeOf(this, CryptoTamperError.prototype);
  }
}

/**
 * Result of encrypting a file buffer with AES-256-GCM.
 */
export interface EncryptedFilePayload {
  /**
   * Compact packed envelope format:
   * [12-byte IV][16-byte Auth Tag][Ciphertext]
   */
  packedBuffer: Buffer;
  /** 12-byte initialization vector (CSPRNG randomBytes) */
  iv: Buffer;
  /** 16-byte GCM authentication tag */
  authTag: Buffer;
  /** Raw AES-256-GCM ciphertext */
  ciphertext: Buffer;
  /** SHA-256 digest of original plaintext bytes */
  sha256Plaintext: string;
  /** SHA-256 digest of the packed binary envelope */
  sha256Ciphertext: string;
}

/**
 * Result of decrypting an encrypted file payload.
 */
export interface DecryptedFilePayload {
  /** Original decrypted plaintext buffer */
  plaintext: Buffer;
  /** SHA-256 digest of the verified plaintext bytes */
  sha256Plaintext: string;
  /** SHA-256 digest of the input packed ciphertext envelope */
  sha256Ciphertext: string;
}

/**
 * Structured representation of an encrypted field for database storage.
 */
export interface EncryptedField {
  /** Hex-encoded 12-byte IV */
  iv: string;
  /** Hex-encoded 16-byte GCM Auth Tag */
  authTag: string;
  /** Hex-encoded ciphertext string */
  ciphertext: string;
  /** Compact serialized representation: 'gcm:<iv>:<authTag>:<ciphertext>' */
  serialized: string;
}

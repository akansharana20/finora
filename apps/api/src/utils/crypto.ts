import * as crypto from 'crypto';

function getEncryptionKey(): Buffer {
  const secret = process.env.HMRC_ENCRYPTION_KEY || process.env.JWT_SECRET || 'finora-hmrc-default-secure-encryption-key-32-chars';
  return crypto.createHash('sha256').update(secret).digest();
}

/**
 * Encrypts sensitive tokens (OAuth access/refresh tokens) using AES-256-GCM.
 * Stored format: "enc:ivHex:authTagHex:cipherHex"
 */
export function encryptToken(plainText: string): string {
  if (!plainText) return plainText;
  try {
    const key = getEncryptionKey();
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

    let encrypted = cipher.update(plainText, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag().toString('hex');

    return `enc:${iv.toString('hex')}:${authTag}:${encrypted}`;
  } catch (error) {
    console.error('Failed to encrypt token:', error);
    return plainText;
  }
}

/**
 * Decrypts AES-256-GCM encrypted tokens.
 * Gracefully returns the original string if it is not in encrypted format (e.g. legacy/mock tokens).
 */
export function decryptToken(cipherText: string): string {
  if (!cipherText || typeof cipherText !== 'string') return cipherText;
  if (!cipherText.startsWith('enc:')) {
    // Unencrypted legacy token or mock token
    return cipherText;
  }

  try {
    const parts = cipherText.split(':');
    if (parts.length !== 4) return cipherText;

    const [, ivHex, authTagHex, encryptedHex] = parts;
    const key = getEncryptionKey();
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');

    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (error) {
    console.error('Failed to decrypt token:', error);
    return cipherText;
  }
}

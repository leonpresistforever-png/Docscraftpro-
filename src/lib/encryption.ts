import CryptoJS from 'crypto-js';

const ENCRYPTION_KEY = (typeof process !== 'undefined' && process.env ? process.env.VITE_ENCRYPTION_KEY : undefined) || import.meta.env.VITE_ENCRYPTION_KEY || 'default-secret-key-12345';

export const encryptData = (text: string): string => {
  if (!text) return '';
  const encrypted = CryptoJS.AES.encrypt(text, ENCRYPTION_KEY).toString();
  return `ENC_V1_${encrypted}`;
};

export const decryptData = (text: string): string => {
  if (!text) return '';
  if (!text.startsWith('ENC_V1_')) {
    return text; // Not encrypted (legacy data)
  }
  const cipherText = text.substring(7); // Remove 'ENC_V1_'
  try {
    const bytes = CryptoJS.AES.decrypt(cipherText, ENCRYPTION_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    console.error("Decryption failed:", error);
    return 'Decryption Error';
  }
};

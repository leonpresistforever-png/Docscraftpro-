import { describe, it, expect } from 'vitest';
import { encryptData, decryptData } from '../encryption';

describe('encryptData', () => {
  it('returns an empty string when given an empty string', () => {
    expect(encryptData('')).toBe('');
  });

  it('encrypts basic text and prepends ENC_V1_', () => {
    const plaintext = 'Hello, World!';
    const encrypted = encryptData(plaintext);

    expect(encrypted).not.toBe(plaintext);
    expect(encrypted.startsWith('ENC_V1_')).toBe(true);
    expect(encrypted.length).toBeGreaterThan('ENC_V1_'.length);
  });

  it('produces ciphertext that can be correctly decrypted to the original text', () => {
    const plaintext = 'Secret Data 123!@#';
    const encrypted = encryptData(plaintext);

    // Verifying encryptData by ensuring its output works with the corresponding decrypt function
    const decrypted = decryptData(encrypted);

    expect(decrypted).toBe(plaintext);
  });

  it('returns empty string when given invalid inputs like null or undefined', () => {
    // @ts-ignore - testing runtime robustness against invalid types
    expect(encryptData(null)).toBe('');
    // @ts-ignore - testing runtime robustness against invalid types
    expect(encryptData(undefined)).toBe('');
  });
});

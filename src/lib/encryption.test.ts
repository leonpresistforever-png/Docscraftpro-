import { describe, it, expect, vi, afterEach } from 'vitest';
import { decryptData, encryptData } from './encryption';

describe('decryptData', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns empty string if text is falsy', () => {
    expect(decryptData('')).toBe('');
    expect(decryptData(null as unknown as string)).toBe('');
    expect(decryptData(undefined as unknown as string)).toBe('');
  });

  it('returns original text if it does not start with ENC_V1_', () => {
    expect(decryptData('plain text')).toBe('plain text');
    expect(decryptData('some legacy data')).toBe('some legacy data');
  });

  it('decrypts correctly encrypted data', () => {
    const originalText = 'secret message';
    const encrypted = encryptData(originalText);
    expect(decryptData(encrypted)).toBe(originalText);
  });

  it('returns "Decryption Error" on decryption failure', () => {
    // Suppress console.error for this specific test
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    // Malformed encrypted string (doesn't have correct base64 padding or block size)
    const malformedEncrypted = 'ENC_V1_bad-data-that-will-fail-decryption!!!';
    expect(decryptData(malformedEncrypted)).toBe('Decryption Error');

    expect(consoleErrorSpy).toHaveBeenCalled();
  });
});

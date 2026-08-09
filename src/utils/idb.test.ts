import { describe, it, expect, beforeEach, vi } from 'vitest';
import { initDB, DOCS_STORE_NAME } from './idb';
import 'fake-indexeddb/auto';

describe('IndexedDB utils', () => {
  beforeEach(() => {
    // Reset databases before each test
    // Not directly possible with standard IndexedDB API without names,
    // but fake-indexeddb auto resets or we can delete it
    const req = window.indexedDB.deleteDatabase('pdfStore');
  });

  it('initDB should open database and create stores', async () => {
    const db = await initDB();

    expect(db.name).toBe('pdfStore');
    expect(db.version).toBe(2);

    expect(db.objectStoreNames.contains('pdfs')).toBe(true);
    expect(db.objectStoreNames.contains(DOCS_STORE_NAME)).toBe(true);

    db.close();
  });

  it('initDB should reject on error', async () => {
    // Mock window.indexedDB to return an error
    const originalIndexedDB = window.indexedDB;

    // We can simulate an error by returning an object with an open method that returns an un-successful request
    const fakeRequest: any = {
      onupgradeneeded: null,
      onsuccess: null,
      onerror: null
    };

    vi.stubGlobal('indexedDB', {
      ...originalIndexedDB,
      open: () => {
        setTimeout(() => {
          if (fakeRequest.onerror) {
            const event: any = { target: { error: new Error('Failed to open DB') } };
            fakeRequest.onerror(event);
          }
        }, 10);
        return fakeRequest;
      }
    });

    await expect(initDB()).rejects.toThrow('Failed to open DB');

    // Restore original
    vi.unstubAllGlobals();
  });
});

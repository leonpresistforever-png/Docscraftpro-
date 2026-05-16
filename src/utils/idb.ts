import { encryptData, decryptData } from '../lib/encryption';

const DB_NAME = 'pdfStore';
const STORE_NAME = 'pdfs';
export const DOCS_STORE_NAME = 'docs';

export const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open(DB_NAME, 2);
    request.onupgradeneeded = (event: any) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(DOCS_STORE_NAME)) {
        db.createObjectStore(DOCS_STORE_NAME, { keyPath: 'id' });
      }
    };
    request.onsuccess = (event: any) => resolve(event.target.result);
    request.onerror = (event: any) => reject(event.target.error);
  });
};

export const savePdfOffline = async (id: string, name: string, data: ArrayBuffer) => {
  const db = await initDB();
  return new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put({
      id,
      name,
      data,
      createdAt: new Date().getTime()
    });
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

export const getAllSavedPdfs = async (): Promise<any[]> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const deleteSavedPdf = async (id: string) => {
  const db = await initDB();
  return new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

export const saveDocOffline = async (doc: any) => {
  const db = await initDB();
  return new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(DOCS_STORE_NAME, 'readwrite');
    const store = transaction.objectStore(DOCS_STORE_NAME);
    doc.savedOfflineAt = new Date().getTime();
    if (doc.content) {
      doc.content = encryptData(doc.content);
    }
    const request = store.put(doc);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

export const getAllSavedDocsOffline = async (): Promise<any[]> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(DOCS_STORE_NAME, 'readonly');
    const store = transaction.objectStore(DOCS_STORE_NAME);
    const request = store.getAll();
    request.onsuccess = () => {
      const results = request.result.map(doc => {
        if (doc.content) {
          try {
            doc.content = decryptData(doc.content);
          } catch (e) {
            // Already decrypted or error
          }
        }
        return doc;
      });
      resolve(results);
    };
    request.onerror = () => reject(request.error);
  });
};

export const deleteSavedDocOffline = async (id: string) => {
  const db = await initDB();
  return new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(DOCS_STORE_NAME, 'readwrite');
    const store = transaction.objectStore(DOCS_STORE_NAME);
    const request = store.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

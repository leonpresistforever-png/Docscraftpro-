import { auth } from '../lib/firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

let cachedSheetsToken: string | null = null;

export function getSheetsToken(): string | null {
  if (!cachedSheetsToken) {
    cachedSheetsToken = sessionStorage.getItem('google_access_token');
  }
  return cachedSheetsToken;
}

export function setSheetsToken(token: string | null) {
  cachedSheetsToken = token;
  if (token) {
    sessionStorage.setItem('google_access_token', token);
  }
}

export async function signInForGoogleSheets(): Promise<string> {
  const provider = new GoogleAuthProvider();
  provider.addScope('https://www.googleapis.com/auth/spreadsheets');
  provider.addScope('https://www.googleapis.com/auth/drive.file');
  
  let result;
  if (auth.currentUser) {
    const { linkWithPopup } = await import('firebase/auth');
    try {
      result = await linkWithPopup(auth.currentUser, provider);
    } catch (linkErr: any) {
      if (linkErr.code === 'auth/credential-already-in-use') {
        result = await signInWithPopup(auth, provider);
      } else {
        throw linkErr;
      }
    }
  } else {
    result = await signInWithPopup(auth, provider);
  }
  
  const credential = GoogleAuthProvider.credentialFromResult(result);
  const token = credential?.accessToken;
  if (!token) {
    throw new Error("Failed to retrieve Google Sheets authorization token.");
  }
  cachedSheetsToken = token;
  return token;
}

export async function createGoogleSheet(title: string, dataRows: string[][], token: string): Promise<string> {
  const response = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      properties: { title }
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Google Sheets creation failed: ${errText || response.statusText}`);
  }

  const sheetData = await response.json();
  const spreadsheetId = sheetData.spreadsheetId;

  // Insert values if present
  if (dataRows && dataRows.length > 0) {
    const updateRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Sheet1!A1:append?valueInputOption=USER_ENTERED`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        values: dataRows
      })
    });

    if (!updateRes.ok) {
      const errText = await updateRes.text();
      throw new Error(`Failed to insert values into Google Sheet: ${errText}`);
    }
  }

  return `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;
}

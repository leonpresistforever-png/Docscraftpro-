import { auth } from '../lib/firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

let cachedDocsToken: string | null = null;

export function getDocsToken(): string | null {
  if (!cachedDocsToken) {
    cachedDocsToken = sessionStorage.getItem('google_access_token');
  }
  return cachedDocsToken;
}

export function setDocsToken(token: string | null) {
  cachedDocsToken = token;
  if (token) {
    sessionStorage.setItem('google_access_token', token);
  }
}

export async function signInForGoogleDocs(): Promise<string> {
  const provider = new GoogleAuthProvider();
  // Request full docs access & Drive backup permissions
  provider.addScope('https://www.googleapis.com/auth/documents');
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
    throw new Error("Failed to retrieve Google Docs authorization token.");
  }
  cachedDocsToken = token;
  return token;
}

export async function createGoogleDoc(title: string, token: string): Promise<string> {
  const response = await fetch('https://docs.googleapis.com/v1/documents', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ title })
  });
  
  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Google Docs creation failed: ${errText || response.statusText}`);
  }
  
  const data = await response.json();
  return data.documentId;
}

interface FormatRequest {
  startIndex: number;
  endIndex: number;
  type: 'h1' | 'h2' | 'h3' | 'bold' | 'link' | 'color' | 'highlight';
  url?: string;
  rgb?: { r: number; g: number; b: number };
}

export async function exportHtmlToGoogleDoc(documentId: string, html: string, token: string) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  
  let docsText = '';
  const formats: FormatRequest[] = [];
  
  // Recurse children of body
  const processElement = (node: Node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      docsText += node.textContent || '';
      return;
    }
    
    if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as HTMLElement;
      const start = docsText.length + 1; // Docs index starts at 1
      
      const tagName = el.tagName.toLowerCase();
      
      if (tagName === 'h1' || tagName === 'h2' || tagName === 'h3') {
        // Elements like headings will get double line-break to separate
        if (docsText.length > 0 && !docsText.endsWith('\n')) {
          docsText += '\n';
        }
        const hStart = docsText.length + 1;
        el.childNodes.forEach(processElement);
        const hEnd = docsText.length + 1;
        formats.push({ startIndex: hStart, endIndex: hEnd, type: tagName as 'h1' | 'h2' | 'h3' });
        docsText += '\n\n';
        return;
      }
      
      if (tagName === 'p' || tagName === 'div') {
        if (docsText.length > 0 && !docsText.endsWith('\n')) {
          docsText += '\n';
        }
        const pStart = docsText.length + 1;
        el.childNodes.forEach(processElement);
        const pEnd = docsText.length + 1;
        // Check for style or inline color details
        const col = el.style.color;
        if (col) {
          const match = col.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
          if (match) {
            formats.push({ 
              startIndex: pStart, 
              endIndex: pEnd, 
              type: 'color', 
              rgb: { r: parseInt(match[1])/255, g: parseInt(match[2])/255, b: parseInt(match[3])/255 } 
            });
          }
        }
        docsText += '\n';
        return;
      }

      if (tagName === 'li') {
        if (docsText.length > 0 && !docsText.endsWith('\n')) {
          docsText += '\n';
        }
        docsText += '• ';
        el.childNodes.forEach(processElement);
        docsText += '\n';
        return;
      }
      
      if (tagName === 'strong' || tagName === 'b') {
        el.childNodes.forEach(processElement);
        const end = docsText.length + 1;
        formats.push({ startIndex: start, endIndex: end, type: 'bold' });
        return;
      }
      
      if (tagName === 'a') {
        el.childNodes.forEach(processElement);
        const end = docsText.length + 1;
        formats.push({ startIndex: start, endIndex: end, type: 'link', url: el.getAttribute('href') || '' });
        return;
      }

      if (tagName === 'mark') {
        el.childNodes.forEach(processElement);
        const end = docsText.length + 1;
        formats.push({ startIndex: start, endIndex: end, type: 'highlight' });
        return;
      }
      
      // Default traverse
      el.childNodes.forEach(processElement);
    }
  };
  
  doc.body.childNodes.forEach(processElement);
  
  // Prepare Docs batch update bodies
  const requests: any[] = [];
  
  // 1. Insert text (index 1)
  if (docsText.length > 0) {
    requests.push({
      insertText: {
        text: docsText,
        location: { index: 1 }
      }
    });
  }

  // 2. Apply typography & style headings block
  formats.forEach(f => {
    if (f.startIndex >= f.endIndex) return;

    if (f.type === 'h1') {
      requests.push({
        updateParagraphStyle: {
          paragraphStyle: {
            namedStyleType: 'HEADING_1',
            spaceAbove: { magnitude: 18, unit: 'PT' },
            spaceBelow: { magnitude: 8, unit: 'PT' }
          },
          fields: 'namedStyleType,spaceAbove,spaceBelow',
          range: { startIndex: f.startIndex, endIndex: f.endIndex }
        }
      });
      // Heading text look styling
      requests.push({
        updateTextStyle: {
          textStyle: {
            bold: true,
            fontSize: { magnitude: 22, unit: 'PT' }
          },
          fields: 'bold,fontSize',
          range: { startIndex: f.startIndex, endIndex: f.endIndex }
        }
      });
    } else if (f.type === 'h2') {
      requests.push({
        updateParagraphStyle: {
          paragraphStyle: {
            namedStyleType: 'HEADING_2',
            spaceAbove: { magnitude: 14, unit: 'PT' },
            spaceBelow: { magnitude: 6, unit: 'PT' }
          },
          fields: 'namedStyleType,spaceAbove,spaceBelow',
          range: { startIndex: f.startIndex, endIndex: f.endIndex }
        }
      });
      requests.push({
        updateTextStyle: {
          textStyle: {
            bold: true,
            fontSize: { magnitude: 16, unit: 'PT' }
          },
          fields: 'bold,fontSize',
          range: { startIndex: f.startIndex, endIndex: f.endIndex }
        }
      });
    } else if (f.type === 'h3') {
      requests.push({
        updateParagraphStyle: {
          paragraphStyle: {
            namedStyleType: 'HEADING_3',
            spaceAbove: { magnitude: 12, unit: 'PT' },
            spaceBelow: { magnitude: 4, unit: 'PT' }
          },
          fields: 'namedStyleType,spaceAbove,spaceBelow',
          range: { startIndex: f.startIndex, endIndex: f.endIndex }
        }
      });
    } else if (f.type === 'bold') {
      requests.push({
        updateTextStyle: {
          textStyle: { bold: true },
          fields: 'bold',
          range: { startIndex: f.startIndex, endIndex: f.endIndex }
        }
      });
    } else if (f.type === 'link') {
      requests.push({
        updateTextStyle: {
          textStyle: {
            link: { url: f.url },
            underline: true,
            foregroundColor: { color: { rgbColor: { red: 0.06, green: 0.33, blue: 0.8 } } }
          },
          fields: 'link,underline,foregroundColor',
          range: { startIndex: f.startIndex, endIndex: f.endIndex }
        }
      });
    } else if (f.type === 'color' && f.rgb) {
      requests.push({
        updateTextStyle: {
          textStyle: {
            foregroundColor: { color: { rgbColor: f.rgb } }
          },
          fields: 'foregroundColor',
          range: { startIndex: f.startIndex, endIndex: f.endIndex }
        }
      });
    } else if (f.type === 'highlight') {
      // Highlight with a subtle background highlight color (e.g. yellow rgb: 1.0, 0.95, 0.6)
      requests.push({
        updateTextStyle: {
          textStyle: {
            backgroundColor: { color: { rgbColor: { red: 1.0, green: 0.93, blue: 0.4 } } }
          },
          fields: 'backgroundColor',
          range: { startIndex: f.startIndex, endIndex: f.endIndex }
        }
      });
    }
  });

  if (requests.length > 0) {
    const updateRes = await fetch(`https://docs.googleapis.com/v1/documents/${documentId}:batchUpdate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ requests })
    });
    
    if (!updateRes.ok) {
      const errText = await updateRes.text();
      throw new Error(`Failed to apply formatting inside Google Doc: ${errText}`);
    }
  }
  
  return `https://docs.google.com/document/d/${documentId}/edit`;
}

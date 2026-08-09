import { extractTextFromPdf } from './pdfjsSetup';

const TEXT_EXTENSIONS = new Set(['.txt', '.csv', '.md', '.html', '.htm', '.xml', '.rtf', '.json']);
const BINARY_EXTENSIONS = new Set(['.xlsx', '.xls', '.pptx', '.ppt', '.zip', '.ods', '.odp', '.odt']);

function getExtension(filename: string): string {
  const dot = filename.lastIndexOf('.');
  return dot >= 0 ? filename.slice(dot).toLowerCase() : '';
}

async function extractImageMetadata(file: File): Promise<string> {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.readAsDataURL(file);
  });

  const dimensions = await new Promise<{ width: number; height: number }>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = () => reject(new Error('Failed to decode image'));
    img.src = dataUrl;
  });

  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
  const divisor = gcd(dimensions.width, dimensions.height) || 1;
  const aspectRatio = `${dimensions.width / divisor}:${dimensions.height / divisor}`;

  return [
    `[IMAGE: ${file.name}]`,
    `Dimensions: ${dimensions.width}x${dimensions.height} pixels`,
    `Aspect ratio: ${aspectRatio}`,
    `MIME type: ${file.type || 'unknown'}`,
    'Note: Use visual context from this image description when converting. For OCR-level accuracy, describe visible text and layout in your output.',
    `Data URL (truncated): ${dataUrl.slice(0, 120)}...`,
  ].join('\n');
}

/** Extract readable text/context from common upload formats. */
export async function parseUploadedFile(file: File): Promise<string> {
  const ext = getExtension(file.name);

  if (ext === '.pdf' || file.type === 'application/pdf') {
    const arrayBuffer = await file.arrayBuffer();
    const text = await extractTextFromPdf(arrayBuffer);
    if (!text) {
      return '[PDF contains no extractable text — it may be scanned or image-based. Consider OCR or manual input.]';
    }
    return text;
  }

  if (ext === '.docx' || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    const mammoth = await import('mammoth');
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value.trim() || '[DOCX file parsed but contained no text.]';
  }

  if (ext === '.png' || ext === '.jpg' || ext === '.jpeg' || ext === '.webp' || ext === '.gif' || file.type.startsWith('image/')) {
    return extractImageMetadata(file);
  }

  if (ext === '.html' || ext === '.htm') {
    const html = await file.text();
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return (doc.body.innerText || doc.body.textContent || '').trim();
  }

  if (ext === '.zip' || BINARY_EXTENSIONS.has(ext)) {
    if (ext === '.zip') {
      const JSZip = await import('jszip');
      const zip = await JSZip.default.loadAsync(file);
      let text = '';
      for (const [filename, zipEntry] of Object.entries(zip.files)) {
        if (!zipEntry.dir && (filename.endsWith('.txt') || filename.endsWith('.md') || filename.endsWith('.json') || filename.endsWith('.csv'))) {
          const content = await zipEntry.async('string');
          text += `\n\n--- ${filename} ---\n\n${content}`;
        }
      }
      if (text.trim()) return text.trim();
    }
    throw new Error(`Binary format (.${ext.slice(1)}) cannot be read as plain text. Convert it to PDF, DOCX, or TXT first.`);
  }

  if (TEXT_EXTENSIONS.has(ext) || file.type.startsWith('text/')) {
    return file.text();
  }

  // Last resort: try reading as text, but reject obvious binary content
  const raw = await file.text();
  const nullBytes = (raw.match(/\0/g) || []).length;
  if (nullBytes > 0 || (raw.length > 0 && nullBytes / raw.length > 0.01)) {
    throw new Error(`Unsupported or binary file format: ${file.name}`);
  }
  return raw;
}

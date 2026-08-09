/** Shared pdfjs-dist worker setup and text extraction helpers. */

let workerConfigured = false;

export async function setupPdfjsWorker(): Promise<typeof import('pdfjs-dist')> {
  const pdfjsLib = await import('pdfjs-dist');

  if (!workerConfigured) {
    const version = pdfjsLib.version || '6.1.200';
    try {
      pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
        'pdfjs-dist/build/pdf.worker.min.mjs',
        import.meta.url
      ).toString();
    } catch {
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${version}/build/pdf.worker.min.mjs`;
    }
    workerConfigured = true;
  }

  return pdfjsLib;
}

export async function extractTextFromPdf(data: ArrayBuffer): Promise<string> {
  const pdfjsLib = await setupPdfjsWorker();
  const pdf = await pdfjsLib.getDocument({ data }).promise;
  let text = '';

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    text += content.items
      .map((item) => ('str' in item ? item.str : ''))
      .join(' ') + '\n\n';
  }

  return text.trim();
}

export async function getPdfPageCount(data: ArrayBuffer): Promise<number> {
  const pdfjsLib = await setupPdfjsWorker();
  const pdf = await pdfjsLib.getDocument({ data }).promise;
  return pdf.numPages;
}

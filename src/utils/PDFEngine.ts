import { PDFDocument, rgb, degrees, StandardFonts } from 'pdf-lib';

export async function rotatePDF(file: File, rotationDegrees: number = 90): Promise<Blob> {
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);
  
  const pages = pdfDoc.getPages();
  for (const page of pages) {
    // Current rotation
    const currentRotation = page.getRotation().angle;
    page.setRotation(degrees(currentRotation + rotationDegrees));
  }
  
  const modifiedPdfBytes = await pdfDoc.save();
  return new Blob([modifiedPdfBytes as any], { type: 'application/pdf' });
}

export async function addWatermark(file: File, text: string = "CONFIDENTIAL"): Promise<Blob> {
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);
  
  const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  
  const pages = pdfDoc.getPages();
  for (const page of pages) {
    const { width, height } = page.getSize();
    const textSize = 60;
    const textWidth = helveticaFont.widthOfTextAtSize(text, textSize);
    
    // Calculate rotation angle diagonally roughly based on page aspect ratio
    const angle = Math.atan(height / width);

    page.drawText(text, {
      x: width / 2 - textWidth / 2,
      y: height / 2 - textSize / 2,
      size: textSize,
      font: helveticaFont,
      color: rgb(0.8, 0.2, 0.2), // Light red watermark
      opacity: 0.3,
      rotate: degrees(45), // standard diagonal
    });
  }
  
  const modifiedPdfBytes = await pdfDoc.save();
  return new Blob([modifiedPdfBytes as any], { type: 'application/pdf' });
}

export async function addPageNumbers(file: File, startPage: number = 1): Promise<Blob> {
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);
  
  const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  
  const pages = pdfDoc.getPages();
  pages.forEach((page, index) => {
    const { width } = page.getSize();
    const currentNumber = startPage + index;
    const totalPagesOffset = startPage + pages.length - 1;
    const text = `Page ${currentNumber} of ${totalPagesOffset}`;
    const textSize = 12;
    const textWidth = helveticaFont.widthOfTextAtSize(text, textSize);
    
    page.drawText(text, {
      x: width / 2 - textWidth / 2,
      y: 20,
      size: textSize,
      font: helveticaFont,
      color: rgb(0, 0, 0),
    });
  });
  
  const modifiedPdfBytes = await pdfDoc.save();
  return new Blob([modifiedPdfBytes as any], { type: 'application/pdf' });
}

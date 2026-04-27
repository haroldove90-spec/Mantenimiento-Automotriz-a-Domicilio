import { jsPDF } from 'jspdf';

export const loadLogoToDoc = async (doc: any, logoUrl: string) => {
  return new Promise((resolve) => {
    if (!logoUrl) return resolve(null);

    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      try {
        // Aumentamos los límites para permitir logos más grandes en el PDF
        const maxWidth = 60; 
        const maxHeight = 30;
        let width = img.width;
        let height = img.height;
        const ratio = width / height;

        if (width > maxWidth) {
          width = maxWidth;
          height = width / ratio;
        }
        if (height > maxHeight) {
          height = maxHeight;
          width = height * ratio;
        }
        
        const format = logoUrl.toLowerCase().includes('.png') ? 'PNG' : 'JPEG';
        doc.addImage(img, format, 14, 10, width, height);
        resolve({ width, height });
      } catch (e) {
        console.error("Error adding image to PDF:", e);
        resolve(null);
      }
    };
    img.onerror = () => {
      console.warn("Could not load logo image, continuing PDF generation without it.");
      resolve(null);
    };
    img.src = logoUrl;
  });
};

import { jsPDF } from 'jspdf';

export const loadLogoToDoc = async (doc: any, logoUrl: string) => {
  return new Promise((resolve) => {
    const img = new Image();
    // Prevenir problemas de CORS
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      try {
        const maxWidth = 50;
        const maxHeight = 25;
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
        
        // Determinar formato
        const format = logoUrl.toLowerCase().includes('.png') ? 'PNG' : 'JPEG';
        doc.addImage(img, format, 14, 10, width, height);
        resolve({ width, height });
      } catch (e) {
        console.error("Error adding image to PDF:", e);
        resolve(null);
      }
    };
    img.onerror = () => {
      console.error("Error loading logo image for PDF:", logoUrl);
      resolve(null);
    };
    img.src = logoUrl;
  });
};

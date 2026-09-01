/* ==========================================
   OCR Service & Scanned PDF Handler
   ========================================== */

const OcrService = {
  isAvailable: false,

  async runOcr(parsedPdf, onProgress) {
    // Guidance fallback for image-based PDFs
    alert('This PDF appears to be scanned or image-based. For best results, please upload a text-searchable PDF, or process page images via OCR.');
    return parsedPdf;
  }
};

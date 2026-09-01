/* ==========================================
   PDF Parser Service (PDF.js Integration)
   ========================================== */

const PdfParserService = {
  async parsePdf(file, onProgress) {
    if (!window.pdfjsLib) {
      throw new Error('PDF.js library is not loaded');
    }

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const numPages = pdf.numPages;

    const pagesText = [];
    let totalCharCount = 0;

    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      if (onProgress) {
        onProgress(pageNum, numPages);
      }

      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      
      const pageLines = [];
      let currentLineY = null;
      let currentLineText = '';

      // Sort items vertically and horizontally
      const items = textContent.items.map(item => ({
        text: item.str,
        x: item.transform[4],
        y: item.transform[5],
        fontName: item.fontName,
        height: item.height
      }));

      // Sort top-to-bottom, left-to-right
      items.sort((a, b) => (b.y - a.y) || (a.x - b.x));

      let lastY = null;
      let lineText = '';

      for (const item of items) {
        if (lastY === null || Math.abs(item.y - lastY) > 5) {
          if (lineText.trim()) {
            pageLines.push(lineText.trim());
          }
          lineText = item.text;
          lastY = item.y;
        } else {
          lineText += ' ' + item.text;
        }
      }
      if (lineText.trim()) {
        pageLines.push(lineText.trim());
      }

      const rawPageText = pageLines.join('\n');
      totalCharCount += rawPageText.length;

      pagesText.push({
        pageNumber: pageNum,
        lines: pageLines,
        text: rawPageText,
        charCount: rawPageText.length
      });
    }

    // Scanned PDF detection: average characters per page < 50
    const avgChars = numPages > 0 ? totalCharCount / numPages : 0;
    const isScanned = avgChars < 40;

    return {
      pdfName: file.name,
      pdfSize: file.size,
      numPages: numPages,
      pages: pagesText,
      isScanned: isScanned,
      avgCharsPerPage: Math.round(avgChars)
    };
  }
};

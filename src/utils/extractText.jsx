import Tesseract from "tesseract.js";
import * as pdfjsLib from "pdfjs-dist";

// Use CDN worker for pdf.js
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

/**
 * Extract text from a File object (PDF or image).
 * @param {File} file
 * @param {string} lang - OCR language code (e.g., "eng")
 * @returns {Promise<string>}
 */
export async function extractTextFromFile(file, lang = "eng") {
  const fileType = file.type;

  if (fileType.startsWith("image/")) {
    return ocrImage(file, lang);
  }

  if (fileType === "application/pdf") {
    return extractTextFromPdf(file, lang);
  }

  throw new Error("Unsupported file type: " + fileType);
}

/**
 * OCR an image file with Tesseract.
 * @param {File} file
 * @param {string} lang
 * @returns {Promise<string>}
 */
async function ocrImage(file, lang) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const { data: { text } } = await Tesseract.recognize(reader.result, lang);
        resolve(text);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

/**
 * Extract text from a PDF file, using embedded text or OCR fallback.
 * @param {File} file
 * @param {string} lang
 * @returns {Promise<string>}
 */
async function extractTextFromPdf(file, lang) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const typedArray = new Uint8Array(reader.result);
        const pdf = await pdfjsLib.getDocument(typedArray).promise;

        let fullText = "";
        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
          const page = await pdf.getPage(pageNum);
          const content = await page.getTextContent();
          const pageText = content.items.map((item) => item.str).join(" ");

          // If embedded text is found, use it
          if (pageText.trim().length > 20) {
            fullText += `\n[Page ${pageNum} Embedded Text]\n${pageText}`;
          } else {
            // Otherwise render the page and OCR it
            const viewport = page.getViewport({ scale: 2.0 });
            const canvas = document.createElement("canvas");
            const context = canvas.getContext("2d");
            canvas.width = viewport.width;
            canvas.height = viewport.height;

            await page.render({ canvasContext: context, viewport }).promise;

            const dataUrl = canvas.toDataURL("image/png");
            const { data: { text: ocrText } } = await Tesseract.recognize(dataUrl, lang);
            fullText += `\n[Page ${pageNum} OCR]\n${ocrText}`;
          }
        }

        resolve(fullText.trim());
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = (err) => reject(err);
    reader.readAsArrayBuffer(file);
  });
}

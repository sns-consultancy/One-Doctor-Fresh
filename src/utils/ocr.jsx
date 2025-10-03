// src/utils/ocr.js
import Tesseract from "tesseract.js";

export async function extractTextFromImage(file) {
  const { data } = await Tesseract.recognize(file, "eng", {
    logger: (m) => console.log(m),
  });
  return data.text;
}

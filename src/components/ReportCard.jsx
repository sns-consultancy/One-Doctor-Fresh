import React, { useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export default function ReportCard({ result, onSpeak, onCopy, onEmail }) {
  if (!result) return null;
  const { ok, analysis, inputs, error } = result;
  const cardRef = useRef(null);

  async function savePdf() {
    const el = cardRef.current;
    const canvas = await html2canvas(el, { scale: 2, useCORS: true });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({ unit: "pt", format: "a4" });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const ratio = pageWidth / canvas.width;
    const imgHeight = canvas.height * ratio;
    pdf.addImage(imgData, "PNG", 0, 20, pageWidth, imgHeight);
    pdf.save("Symptom_Report.pdf");
  }

  return (
    <div ref={cardRef} className="max-w-3xl mx-auto my-6 rounded-2xl border shadow-sm bg-white">
      {/* header */}
      <header className="p-5 border-b flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Symptom Analysis</h2>
          <p className="text-sm text-gray-500">{ok ? "Complete" : "Issue detected"}</p>
        </div>
        <div className="flex gap-2">
          {inputs?.lang && <span className="px-2 py-1 text-xs rounded-full bg-blue-50 text-blue-700 border">lang: {inputs.lang}</span>}
          {inputs?.region && <span className="px-2 py-1 text-xs rounded-full bg-emerald-50 text-emerald-700 border">region: {inputs.region}</span>}
          <span className="px-2 py-1 text-xs rounded-full bg-gray-50 text-gray-600 border">files: {inputs?.files?.length ?? 0}</span>
        </div>
      </header>

      {/* body */}
      <div className="p-5 prose max-w-none">
        {error ? (
          <div className="p-4 border border-red-200 bg-red-50 rounded-lg text-red-700">{error}</div>
        ) : (
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{analysis}</ReactMarkdown>
        )}
      </div>

      {/* footer */}
      <footer className="p-5 border-t flex flex-wrap gap-3">
        <button onClick={() => onSpeak?.(analysis)} className="px-4 py-2 rounded-lg border bg-gray-50 hover:bg-gray-100">🔊 Read Out</button>
        <button onClick={() => onCopy?.(analysis)} className="px-4 py-2 rounded-lg border bg-gray-50 hover:bg-gray-100">📋 Copy</button>
        <button onClick={savePdf} className="px-4 py-2 rounded-lg border bg-gray-50 hover:bg-gray-100">💾 Download PDF</button>
        <button onClick={() => onEmail?.(analysis)} className="px-4 py-2 rounded-lg border bg-gray-50 hover:bg-gray-100">✉️ Email</button>
        <button onClick={() => window.print()} className="ml-auto px-4 py-2 rounded-lg border bg-gray-50 hover:bg-gray-100">🖨️ Print</button>
      </footer>
    </div>
  );
}

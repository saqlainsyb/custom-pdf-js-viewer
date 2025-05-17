'use client';

import { useState, useEffect } from 'react';
import type { PDFDocumentProxy, PDFPageProxy } from 'pdfjs-dist';
import { useResumePdf } from '@/hooks/useResumePdf';
import PdfPage from './pdf-page';

type PdfJsModule = typeof import('pdfjs-dist');

const cMapUrl = '/js/pdfjs-dist/cmaps/';
const wasmUrl = '/js/pdfjs-dist/wasm/';
const iccUrl = '/js/pdfjs-dist/iccs/';
const standardFontDataUrl = '/fonts/pdfjs-dist/';

export const loadPdfDocumentFromBuffer = async (
  buffer: Uint8Array | ArrayBuffer,
  PDFJS: PdfJsModule
): Promise<PDFDocumentProxy> => {
  return PDFJS.getDocument({
    data: buffer,
    cMapUrl,
    wasmUrl,
    iccUrl,
    standardFontDataUrl,
    disableFontFace: false,
    disableAutoFetch: true,
    isEvalSupported: false,
    enableXfa: false,
  }).promise;
};

export default function PdfViewer() {
  const { data: pdfBuffer } = useResumePdf();
  const [pdfDoc, setPdfDoc] = useState<PDFDocumentProxy | null>(null);
  const [pages, setPages] = useState<PDFPageProxy[]>([]);
  const [scale, setScale] = useState(1.0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!pdfBuffer) return;

    const loadAndPrepare = async () => {
      try {
        const PDFJS = await import('pdfjs-dist');
        PDFJS.GlobalWorkerOptions.workerSrc = '/js/pdfjs-dist/build/pdf.worker.min.mjs';

        const buffer = new Uint8Array(await pdfBuffer.arrayBuffer());
        const pdf = await loadPdfDocumentFromBuffer(buffer, PDFJS);
        setPdfDoc(pdf);

        const pageList: PDFPageProxy[] = [];
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          pageList.push(page);
        }
        setPages(pageList);
      } catch (err) {
        setError('Failed to load PDF: ' + (err instanceof Error ? err.message : String(err)));
      }
    };

    loadAndPrepare();
  }, [pdfBuffer]);

  if (error) return <div className="text-red-500">{error}</div>;
  if (!pdfDoc || pages.length === 0) return <div>Loading PDF...</div>;

  return (
    <div className="max-w-4xl mx-auto flex flex-col items-center gap-4 pb-20 h-[900px]">
      <div className="flex gap-6">
        <button
          onClick={() => setScale((s) => Math.min(s + 0.2, 3))}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Zoom In
        </button>
        <button
          onClick={() => setScale((s) => Math.max(s - 0.2, 0.5))}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Zoom Out
        </button>
      </div>

      <div className="flex flex-col gap-4 w-full items-center border-2 border-blue-700 overflow-hidden">
        {pages.map((page, index) => (
          <PdfPage key={index} page={page} scale={scale} />
        ))}
      </div>
    </div>
  );
}

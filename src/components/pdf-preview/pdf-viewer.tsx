"use client";

import { useEffect } from "react";
import type { PDFDocumentProxy } from "pdfjs-dist";
import { useResumePdf } from "@/hooks/useResumePdf";
import 'pdfjs-dist/web/pdf_viewer.css';

type PdfJsModule = typeof import("pdfjs-dist");

const cMapUrl = "/js/pdfjs-dist/cmaps/";
const wasmUrl = "/js/pdfjs-dist/wasm/";
const iccUrl = "/js/pdfjs-dist/iccs/";
const standardFontDataUrl = "/js/standard_fonts/";

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
    disableAutoFetch: true, // only fetch the data needed for the displayed pages
    isEvalSupported: false,
    enableXfa: false,
  }).promise;
};

export default function PdfViewer() {
  const { data: pdfBuffer } = useResumePdf();

  useEffect(() => {
    if (!pdfBuffer) return;

    const setupViewer = async () => {
      const PDFJS = await import("pdfjs-dist");
      const { PDFViewer, EventBus, PDFLinkService, LinkTarget } = await import(
        "pdfjs-dist/web/pdf_viewer.mjs"
      );

      PDFJS.GlobalWorkerOptions.workerSrc =
        "/js/pdfjs-dist/build/pdf.worker.min.mjs";

      const buffer = new Uint8Array(await pdfBuffer.arrayBuffer());

      const pdf = await loadPdfDocumentFromBuffer(buffer, PDFJS)
      console.log("Pdf", pdf)
 
      const eventBus = new EventBus();
      const linkService = new PDFLinkService({
        eventBus,
        externalLinkTarget: LinkTarget.BLANK,
        externalLinkRel: "noopener",
      });

      const viewerContainer = document.querySelector(
        ".pdfjs-viewer"
      ) as HTMLDivElement;

      const viewer = new PDFViewer({
        container: viewerContainer,
        eventBus: eventBus,
        imageResourcesPath: "/images/pdfjs-dist/",
        linkService: linkService,
        annotationMode: PDFJS.AnnotationMode.ENABLE,
        maxCanvasPixels: 8192 * 8192,
        annotationEditorMode: PDFJS.AnnotationEditorType.DISABLE,
      });
      linkService.setViewer(viewer);
      linkService.setDocument(pdf);
      viewer.setDocument(pdf);
    };

    setupViewer();
  }, [pdfBuffer]);

  return (
    <div
      className="pdfjs-viewer border-2 border-amber-400"
      style={{
        height: "900px",
        width: "700px",
        overflow: "auto",
        position: "absolute",
        top: 100,
      }}
    >
      <div className="pdfViewer h-full w-full z-50"></div>
    </div>
  );
}

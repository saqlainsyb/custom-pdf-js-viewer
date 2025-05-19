"use client";

import { useEffect, useState, useRef } from "react";
import type { PDFDocumentProxy } from "pdfjs-dist";
import { useResumePdf } from "@/hooks/useResumePdf";
import "pdfjs-dist/web/pdf_viewer.css";
import type { PDFViewer } from "pdfjs-dist/web/pdf_viewer.mjs";
import PdfToolbar from "./pdf-toolbar";

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
    disableAutoFetch: true,
    isEvalSupported: false,
    enableXfa: false,
  }).promise;
};

export default function PdfViewer() {
  const { data: pdfBuffer } = useResumePdf();
  const [viewer, setViewer] = useState<PDFViewer>();
  const [zoom, setZoom] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const viewerRef = useRef<HTMLDivElement>(null);

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
      const pdf = await loadPdfDocumentFromBuffer(buffer, PDFJS);
      setTotalPages(pdf.numPages);
      const eventBus = new EventBus();
      const linkService = new PDFLinkService({
        eventBus,
        externalLinkTarget: LinkTarget.BLANK,
        externalLinkRel: "noopener",
      });

      const viewerContainer = viewerRef.current!;
      const pdfViewer = new PDFViewer({
        container: viewerContainer,
        eventBus,
        imageResourcesPath: "/images/pdfjs-dist/",
        linkService,
        annotationMode: PDFJS.AnnotationMode.ENABLE,
        maxCanvasPixels: 8192 * 8192,
        annotationEditorMode: PDFJS.AnnotationEditorType.DISABLE,
      });

      linkService.setViewer(pdfViewer);
      linkService.setDocument(pdf);
      pdfViewer.setDocument(pdf);
      setViewer(pdfViewer);
    };

    setupViewer();
  }, [pdfBuffer]);

  useEffect(() => {
    if (!viewer) return;
    viewer.currentScaleValue = `${zoom}`;
  }, [zoom, viewer]); // ✅ This will safely apply zoom

  useEffect(() => {
    if (!viewer || !viewerRef.current) return;

    const container = viewerRef.current;
    const isZoomingRef = { current: false };
    const isScrollingRef = { current: false };
    let scrollTimer: ReturnType<typeof setTimeout> | null = null;

    const MAX_SCALE_FACTOR = 1.2;
    const SCALE_FACTOR_DIVISOR = 20;

    const handleMouseWheel = (event: WheelEvent) => {
      const isZoomGesture = event.ctrlKey || event.metaKey;

      if (isZoomGesture && !isScrollingRef.current) {
        event.preventDefault();

        if (isZoomingRef.current) return;
        isZoomingRef.current = true;

        const scrollMagnitude = Math.abs(event.deltaY);
        const scaleFactorMagnitude = Math.min(
          1 + scrollMagnitude / SCALE_FACTOR_DIVISOR,
          MAX_SCALE_FACTOR
        );

        const previousScale = viewer.currentScale;
        const direction = Math.sign(event.deltaY);
        const scaleFactor =
          direction < 0 ? scaleFactorMagnitude : 1 / scaleFactorMagnitude;

        const rawScale = previousScale * scaleFactor;
        const newScale = Math.max(0.1, Math.round(rawScale * 100) / 100); // ✅ enforce min 0.1

        viewer.currentScale = newScale;
        setZoom(newScale);

        // Zoom centered on mouse position
        const rect = container.getBoundingClientRect();
        const offsetX = event.clientX - rect.left;
        const offsetY = event.clientY - rect.top;

        container.scrollBy({
          left: offsetX * scaleFactor - offsetX,
          top: offsetY * scaleFactor - offsetY,
          behavior: "instant",
        });

        setTimeout(() => {
          isZoomingRef.current = false;
        }, 5);
      } else {
        // Scroll momentum protection
        isScrollingRef.current = true;
        if (scrollTimer) clearTimeout(scrollTimer);
        scrollTimer = setTimeout(() => {
          isScrollingRef.current = false;
        }, 100);
      }
    };

    container.addEventListener("wheel", handleMouseWheel, { passive: false });

    return () => {
      container.removeEventListener("wheel", handleMouseWheel);
      if (scrollTimer) clearTimeout(scrollTimer);
    };
  }, [viewer]);

  const handlePageChange = (page: number) => {
    if (viewer) viewer.currentPageNumber = page;
    setCurrentPage(page);
  };

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 4));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 0.25));

  const downloadPdf = () => {
    if (!pdfBuffer) return;
    const blob = new Blob([pdfBuffer], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "document.pdf";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-screen flex-1/2 grid grid-rows-[50px_1fr]">
      <PdfToolbar
        currentPage={currentPage}
        totalPages={totalPages}
        zoom={zoom}
        onPageChange={handlePageChange}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        downloadPdf={downloadPdf}
      />

      {/* Viewer Container */}
      <div className="relative h-full">
        <div
          className="pdfjs-viewer bg-gray-200"
          ref={viewerRef}
          style={{
            height: "100%",
            width: "100%",
            overflow: "auto",
            position: "absolute",
            top: 0,
            right: 0,
          }}
        >
          <div className="pdfViewer h-full w-full"></div>
        </div>
      </div>
    </div>
  );
}

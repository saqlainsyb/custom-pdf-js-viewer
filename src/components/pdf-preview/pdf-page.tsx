"use client";

import { useEffect, useRef } from "react";
import type { PDFPageProxy } from "pdfjs-dist";

interface PdfPageProps {
  page: PDFPageProxy;
  scale: number;
}

export default function PdfPage({ page, scale }: PdfPageProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let renderTask: ReturnType<PDFPageProxy["render"]> | null = null;
    let isCancelled = false;

    const render = async () => {
      const viewport = page.getViewport({ scale });
      const canvas = canvasRef.current;
      if (!canvas) return;
      const context = canvas.getContext("2d");
      if (!context) return;

      canvas.height = viewport.height;
      canvas.width = viewport.width;

      renderTask = page.render({ canvasContext: context, viewport });

      try {
        await renderTask.promise;
      } catch (err) {
        if (!isCancelled) {
          console.error("Render error:", err);
        }
      }
    };

    render();

    return () => {
      isCancelled = true;
      if (renderTask) {
        renderTask.cancel(); // cancel if it's still running
      }
    };
  }, [page, scale]);

  return (
    <div className="border shadow">
      <canvas ref={canvasRef} />
    </div>
  );
}

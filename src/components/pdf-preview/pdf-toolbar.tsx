import { useEffect, useState } from "react";
import {
  ChevronUp,
  ChevronDown,
  ZoomIn,
  ZoomOut,
  Download,
} from "lucide-react";

export default function PdfToolbar({
  currentPage,
  totalPages,
  zoom,
  onPageChange,
  onZoomIn,
  onZoomOut,
  downloadPdf,
}: {
  currentPage: number;
  totalPages: number;
  zoom: number;
  onPageChange: (page: number) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  downloadPdf: () => void;
}) {
  const [inputPage, setInputPage] = useState(currentPage.toString());

  useEffect(() => {
    setInputPage(currentPage.toString());
  }, [currentPage]);

  const handlePageInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (/^\d*$/.test(val)) {
      setInputPage(val);
    }
  };

  const handlePageEnter = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      let pageNum = Number(inputPage);
      if (isNaN(pageNum) || pageNum < 1) pageNum = 1;
      else if (pageNum > totalPages) pageNum = totalPages;
      setInputPage(pageNum.toString());
      onPageChange(pageNum);
    }
  };

  return (
    <div className="z-50 flex items-center justify-between space-x-2 bg-gray-800 p-1 shadow px-4 text-white">
      <div className="flex space-x-2">
        <button
          className="px-3 py-1.5 bg-violet-600 hover:bg-violet-700 active:bg-violet-800 rounded cursor-pointer font-semibold"
          aria-label="Recompile"
          title="Recompile"
        >
          Recompile
        </button>
        <button
          onClick={downloadPdf}
          className="p-1 hover:bg-gray-700 rounded cursor-pointer self-center"
          aria-label="Download PDF"
          title="Download PDF"
        >
          <Download size={16} />
        </button>
      </div>
      <div className="flex  space-x-2 items-center">
        <div className="flex">
          <button
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            className="p-1 hover:bg-gray-700 cursor-pointer rounded disabled:hover:bg-transparent disabled:cursor-not-allowed"
            aria-label="Previous page"
            title="Previous page"
            disabled={currentPage === 1}
          >
            <ChevronUp size={16} />
          </button>
          <button
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            className="p-1 hover:bg-gray-700 cursor-pointer rounded disabled:hover:bg-transparent disabled:cursor-not-allowed"
            aria-label="Next page"
            title="Next page"
            disabled={currentPage === totalPages}
          >
            <ChevronDown size={16} />
          </button>
        </div>

        {/* Page number input and total */}
        <input
          type="text"
          value={inputPage}
          onChange={handlePageInput}
          onKeyDown={handlePageEnter}
          className="w-8 text-center outline-amber-200 bg-amber-50 text-black"
          aria-label="Current page"
        />
        <span className="select-none">/ {totalPages}</span>

        <span className="border-l border-gray-500 h-6 mx-2"></span>

        {/* Zoom out */}
        <div className="flex">
          <button
            onClick={onZoomOut}
            className="p-1 hover:bg-gray-700 rounded cursor-pointer"
            aria-label="Zoom out"
            title="Zoom out"
          >
            <ZoomOut size={16} />
          </button>

          <button
            onClick={onZoomIn}
            className="p-1 hover:bg-gray-700 rounded cursor-pointer"
            aria-label="Zoom in"
            title="Zoom in"
          >
            <ZoomIn size={16} />
          </button>
        </div>

        {/* Zoom percent display */}
        <span className="select-none min-w-12 text-center">
          {Math.round(zoom * 100)}%
        </span>
      </div>
    </div>
  );
}

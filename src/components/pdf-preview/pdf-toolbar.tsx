import { useEffect, useState } from "react";

export default function PdfToolbar({
  currentPage,
  totalPages,
  zoom,
  onPageChange,
  onZoomIn,
  onZoomOut,
}: {
  currentPage: number;
  totalPages: number;
  zoom: number;
  onPageChange: (page: number) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
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

  const handlePageEnter= (event: React.KeyboardEvent<HTMLInputElement>) => {

    if (event.key === 'Enter') {
      let pageNum = Number(inputPage);
      if (isNaN(pageNum) || pageNum < 1) pageNum = 1;
      else if (pageNum > totalPages) pageNum = totalPages;
      setInputPage(pageNum.toString());
      onPageChange(pageNum);
    }
  };

  return (
    <div
      className="fixed top-2 right-2 z-50 flex items-center space-x-2 bg-white border rounded-md p-1 shadow"
      style={{ minWidth: "180px" }}
    >
      {/* Vertical stack of up/down arrow buttons */}
      <div className="flex space-y-1 items-baseline">
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          className="p-1 hover:bg-gray-200 rounded"
          aria-label="Previous page"
          title="Previous page"
        >
          ▲
        </button>
        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          className="p-1 hover:bg-gray-200 rounded"
          aria-label="Next page"
          title="Next page"
        >
          ▼
        </button>
      </div>

      {/* Page number input and total */}
      <input
        type="text"
        value={inputPage}
        onChange={handlePageInput}
        onKeyDown={handlePageEnter}
        className="w-10 text-center border rounded px-1 py-0.5"
        aria-label="Current page"
      />
      <span className="select-none">/ {totalPages}</span>

      {/* Zoom out */}
      <button
        onClick={onZoomOut}
        className="p-1 hover:bg-gray-200 rounded"
        aria-label="Zoom out"
      >
        −
      </button>

      {/* Zoom in */}
      <button
        onClick={onZoomIn}
        className="p-1 hover:bg-gray-200 rounded"
        aria-label="Zoom in"
      >
        +
      </button>

      {/* Zoom percent display */}
      <span className="select-none w-12 text-right">
        {Math.round(zoom * 100)}%
      </span>
    </div>
  );
}

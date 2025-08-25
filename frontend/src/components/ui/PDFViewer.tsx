import React, { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  ZoomIn,
  ZoomOut,
} from "lucide-react";

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface PDFViewerProps {
  fileUrl: string;
  fileName?: string;
}

export const PDFViewer: React.FC<PDFViewerProps> = ({ fileUrl, fileName }) => {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setLoading(false);
    setError(null);
  };

  const onDocumentLoadError = (error: Error) => {
    setError("Không thể tải file PDF. Vui lòng thử lại.");
    setLoading(false);
    console.error("PDF load error:", error);
  };

  const goToPrevPage = () => {
    setPageNumber((page) => Math.max(1, page - 1));
  };

  const goToNextPage = () => {
    setPageNumber((page) => Math.min(numPages, page + 1));
  };

  const zoomIn = () => {
    setScale((scale) => Math.min(2.0, scale + 0.1));
  };

  const zoomOut = () => {
    setScale((scale) => Math.max(0.5, scale - 0.1));
  };

  const downloadFile = () => {
    const link = document.createElement("a");
    link.href = fileUrl;
    link.download = fileName || "exercise.pdf";
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <svg
              className="h-12 w-12 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={downloadFile}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            <Download className="h-4 w-4 inline mr-2" />
            Tải xuống file PDF
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* PDF Controls */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={goToPrevPage}
              disabled={pageNumber <= 1}
              className="p-2 rounded-md border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <span className="text-sm text-gray-600">
              Trang {pageNumber} / {numPages}
            </span>

            <button
              onClick={goToNextPage}
              disabled={pageNumber >= numPages}
              className="p-2 rounded-md border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={zoomOut}
              className="p-2 rounded-md border border-gray-300 hover:bg-gray-50"
            >
              <ZoomOut className="h-4 w-4" />
            </button>

            <span className="text-sm text-gray-600">
              {Math.round(scale * 100)}%
            </span>

            <button
              onClick={zoomIn}
              className="p-2 rounded-md border border-gray-300 hover:bg-gray-50"
            >
              <ZoomIn className="h-4 w-4" />
            </button>

            <button
              onClick={downloadFile}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              <Download className="h-4 w-4 inline mr-2" />
              Tải xuống
            </button>
          </div>
        </div>
      </div>

      {/* PDF Document */}
      <div className="p-4">
        {loading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-2">Đang tải PDF...</p>
          </div>
        )}

        <div className="flex justify-center">
          <Document
            file={fileUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={onDocumentLoadError}
            loading=""
          >
            <Page
              pageNumber={pageNumber}
              scale={scale}
              renderTextLayer={false}
              renderAnnotationLayer={false}
            />
          </Document>
        </div>
      </div>
    </div>
  );
};

/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useMemo } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  ZoomIn,
  ZoomOut,
} from "lucide-react";

import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { ActionButton } from "./ActionButton";
import { LoadingSpinner } from "./LoadingSpinner";
import { t } from "i18next";

pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";

interface PDFViewerProps {
  fileUrl: string;
  fileName?: string;
  exerciseId?: number;
}

export const PDFViewer: React.FC<PDFViewerProps> = ({
  fileUrl: initialFileUrl,
  fileName,
  exerciseId,
}) => {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [fileSource, setFileSource] = useState<any>(null);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!exerciseId) {
      setLoading(false);
      return;
    }

    let revoked = false;
    const fetchBinary = async () => {
      try {
        setLoading(true);
        const token =
          localStorage.getItem("auth_token") || localStorage.getItem("token");
        if (!token) {
          throw new Error("NO_TOKEN");
        }
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/exercises/${exerciseId}/file`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const arrayBuffer = await res.arrayBuffer();
        if (revoked) return;
        const u8 = new Uint8Array(arrayBuffer);
        setFileSource({ data: u8 });
        const b = new Blob([u8], { type: "application/pdf" });
        const url = URL.createObjectURL(b);
        setBlobUrl(url);
        setError(null);
      } catch (e: unknown) {
        setError("Failed to load PDF");

        console.error("Failed to load PDF", e);
      } finally {
        if (!revoked) setLoading(false);
      }
    };
    fetchBinary();
    return () => {
      revoked = true;
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    };
  }, [exerciseId]);

  const pdfOptions = useMemo(
    () => ({
      cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/cmaps/`,
      cMapPacked: true,
      standardFontDataUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/standard_fonts/`,
    }),
    []
  );

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setLoading(false);
    setError(null);
  };

  const onDocumentLoadError = (error: Error) => {
    setError("Failed to load PDF");
    setLoading(false);
    console.error("Failed to load PDF", error);
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
    const href = blobUrl || initialFileUrl;
    if (!href) return;
    const link = document.createElement("a");
    link.href = href;
    link.download = fileName || "exercise.pdf";
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={goToPrevPage}
              disabled={pageNumber <= 1}
              className="p-2 rounded-md border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              title="Previous Page"
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
              title="Next Page"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={zoomOut}
              className="p-2 rounded-md border border-gray-300 hover:bg-gray-50"
              title="Zoom Out"
            >
              <ZoomOut className="h-4 w-4" />
            </button>

            <span className="text-sm text-gray-600">
              {Math.round(scale * 100)}%
            </span>

            <button
              onClick={zoomIn}
              className="p-2 rounded-md border border-gray-300 hover:bg-gray-50"
              title="Zoom In"
            >
              <ZoomIn className="h-4 w-4" />
            </button>

            <ActionButton
              onClick={downloadFile}
              colorTheme="blue"
              textColor="text-white"
              hasIcon={true}  
              icon={Download}
              text={t("exercises.downloadPDF")}
              className="border border-white/20 backdrop-blur-sm"
              size="md"
            />
          </div>
        </div>
      </div>

      <div className="p-4">
        {loading && (
          <div className="text-center py-8">
            <div className="flex justify-center">
              <LoadingSpinner size="sm" color="border-blue-600" />
            </div>
            <p className="text-gray-600 mt-2">Loading...</p>
          </div>
        )}

        {!loading && !error && (
          <div className="flex justify-center">
            <Document
              file={exerciseId ? fileSource : initialFileUrl}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={onDocumentLoadError}
              loading=""
              options={pdfOptions}
            >
              <Page
                pageNumber={pageNumber}
                scale={scale}
                renderTextLayer={false}
                renderAnnotationLayer={false}
              />
            </Document>
          </div>
        )}
      </div>
    </div>
  );
};

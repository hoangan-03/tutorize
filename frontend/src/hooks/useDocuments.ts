/* eslint-disable @typescript-eslint/no-explicit-any */
import useSWR, { mutate } from "swr";
import { documentService } from "../services/documentService";
import { Document, PaginationParams } from "../types/api";
import { toast } from "react-toastify";

// Get all documents with pagination
export const useDocuments = (params?: PaginationParams) => {
  const { data, error, isLoading } = useSWR(
    ["/documents", params],
    ([url, params]) => documentService.getDocuments(params),
    {
      revalidateOnFocus: false,
    }
  );

  return {
    documents: data?.data || [],
    total: data?.total || 0,
    page: data?.page || 1,
    totalPages: data?.totalPages || 1,
    isLoading,
    error,
    mutate: () => mutate(["/documents", params]),
  };
};

// Get single document
export const useDocument = (id: number | null) => {
  const {
    data: document,
    error,
    isLoading,
  } = useSWR(
    id ? `/documents/${id}` : null,
    () => documentService.getDocument(id!),
    {
      revalidateOnFocus: false,
    }
  );

  return {
    document,
    isLoading,
    error,
    mutate: () => mutate(`/documents/${id}`),
  };
};

// Document management hooks
export const useDocumentManagement = () => {
  const uploadDocument = async (
    file: File,
    metadata: { title: string; description?: string; isPublic?: boolean }
  ) => {
    try {
      const document = await documentService.uploadDocument(file, metadata);
      mutate("/documents");
      toast.success("Tải lên tài liệu thành công!");
      return document;
    } catch (error: any) {
      const message =
        error.response?.data?.error?.message?.[0] ||
        "Tải lên tài liệu thất bại";
      toast.error(message);
      throw error;
    }
  };

  const updateDocument = async (
    id: number,
    documentData: Partial<Document>
  ) => {
    try {
      const document = await documentService.updateDocument(id, documentData);
      mutate(`/documents/${id}`, document, false);
      mutate("/documents");
      toast.success("Cập nhật tài liệu thành công!");
      return document;
    } catch (error: any) {
      const message =
        error.response?.data?.error?.message?.[0] ||
        "Cập nhật tài liệu thất bại";
      toast.error(message);
      throw error;
    }
  };

  const deleteDocument = async (id: number) => {
    try {
      await documentService.deleteDocument(id);
      mutate("/documents");
      toast.success("Xóa tài liệu thành công!");
    } catch (error: any) {
      const message =
        error.response?.data?.error?.message?.[0] || "Xóa tài liệu thất bại";
      toast.error(message);
      throw error;
    }
  };

  const downloadDocument = async (id: number, fileName: string) => {
    try {
      const blob = await documentService.downloadDocument(id);

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("Tải xuống thành công!");
    } catch (error: any) {
      const message =
        error.response?.data?.error?.message?.[0] || "Tải xuống thất bại";
      toast.error(message);
      throw error;
    }
  };

  const approveDocument = async (id: number) => {
    try {
      const document = await documentService.approveDocument(id);
      mutate(`/documents/${id}`, document, false);
      mutate("/documents");
      toast.success("Duyệt tài liệu thành công!");
      return document;
    } catch (error: any) {
      const message =
        error.response?.data?.error?.message?.[0] || "Duyệt tài liệu thất bại";
      toast.error(message);
      throw error;
    }
  };

  return {
    uploadDocument,
    updateDocument,
    deleteDocument,
    downloadDocument,
    approveDocument,
  };
};

// Search documents
export const useDocumentSearch = (
  query: string,
  filters?: {
    type?: string;
    subject?: string;
    grade?: number;
  }
) => {
  const { data, error, isLoading } = useSWR(
    query ? ["/documents/search", query, filters] : null,
    ([url, query, filters]) => documentService.searchDocuments(query, filters),
    {
      revalidateOnFocus: false,
    }
  );

  return {
    documents: data?.data || [],
    total: data?.total || 0,
    isLoading,
    error,
  };
};

// Get document statistics
export const useDocumentStats = () => {
  const {
    data: stats,
    error,
    isLoading,
  } = useSWR("/documents/stats", () => documentService.getDocumentStats(), {
    revalidateOnFocus: false,
  });

  return {
    stats,
    isLoading,
    error,
  };
};

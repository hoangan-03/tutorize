import useSWR, { mutate } from "swr";
import { documentService } from "../services/documentService";
import { Document, PaginationParams } from "../types/api";
import { toast } from "react-toastify";

// Get all documents with pagination
export const useDocuments = (params?: PaginationParams) => {
  const { data, error, isLoading } = useSWR(
    ["/documents", params],
    ([url, params]) => documentService.getDocuments(url, params),
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
    const document = await documentService.uploadDocument(file, metadata);
    mutate("/documents");
    toast.success("Tải lên tài liệu thành công!");
    return document;
  };

  const updateDocument = async (
    id: number,
    documentData: Partial<Document>
  ) => {
    const document = await documentService.updateDocument(id, documentData);
    mutate(`/documents/${id}`, document, false);
    mutate("/documents");
    toast.success("Cập nhật tài liệu thành công!");
    return document;
  };

  const deleteDocument = async (id: number) => {
    await documentService.deleteDocument(id);
    mutate("/documents");
    toast.success("Xóa tài liệu thành công!");
  };

  const downloadDocument = async (id: number, fileName: string) => {
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
  };

  const approveDocument = async (id: number) => {
    const document = await documentService.approveDocument(id);
    mutate(`/documents/${id}`, document, false);
    mutate("/documents");
    toast.success("Duyệt tài liệu thành công!");
    return document;
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
    ([url, query, filters]) =>
      documentService.searchDocuments(url, query, filters),
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

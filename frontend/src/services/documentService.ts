import api from "../lib/api";
import {
  Document,
  PaginationParams,
  PaginatedResult,
  AccessAction,
} from "../types/api";

export const documentService = {
  // Document Management
  async getDocuments(
    url: string,
    params?: PaginationParams
  ): Promise<PaginatedResult<Document>> {
    const response = await api.get<PaginatedResult<Document>>(url, {
      params,
    });
    return response.data;
  },

  async getDocument(id: number): Promise<Document> {
    const response = await api.get<Document>(`/documents/${id}`);
    return response.data;
  },

  async uploadDocument(
    file: File,
    metadata: { title: string; description?: string; isPublic?: boolean }
  ): Promise<Document> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", metadata.title);
    if (metadata.description) {
      formData.append("description", metadata.description);
    }
    if (metadata.isPublic !== undefined) {
      formData.append("isPublic", metadata.isPublic.toString());
    }

    const response = await api.post<Document>("/documents/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  async updateDocument(
    id: number,
    documentData: Partial<Document>
  ): Promise<Document> {
    const response = await api.put<Document>(`/documents/${id}`, documentData);
    return response.data;
  },

  async deleteDocument(id: number): Promise<void> {
    await api.delete(`/documents/${id}`);
  },

  async downloadDocument(id: number): Promise<Blob> {
    const response = await api.get(`/documents/${id}/download`, {
      responseType: "blob",
    });
    return response.data;
  },

  async getDocumentUrl(id: number): Promise<string> {
    // Return the download URL for the document
    return `${api.defaults.baseURL}/documents/${id}/download`;
  },

  async getAccessHistory(
    id: number,
    params?: PaginationParams
  ): Promise<AccessAction[]> {
    const response = await api.get(`/documents/${id}/access-history`, {
      params,
    });
    return response.data;
  },

  async approveDocument(id: number): Promise<Document> {
    const response = await api.post<Document>(`/documents/${id}/approve`);
    return response.data;
  },

  // Search and filter
  async searchDocuments(
    url: string,
    query: string,
    filters?: {
      type?: string;
      subject?: string;
      grade?: number;
    }
  ): Promise<PaginatedResult<Document>> {
    const params = { search: query, ...filters };
    const response = await api.get<PaginatedResult<Document>>(url, {
      params,
    });
    return response.data;
  },
};

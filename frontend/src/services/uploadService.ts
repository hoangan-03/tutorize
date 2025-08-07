import api from "../lib/api";

export class UploadService {
  static async uploadFile(file: File, exerciseId?: number): Promise<string> {
    try {
      const formData = new FormData();
      formData.append("file", file);
      if (exerciseId) {
        formData.append("exerciseId", exerciseId.toString());
      }

      const response = await api.post("/upload/image", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return response.data.cloudinaryUrl;
    } catch (error) {
      console.error("File upload error:", error);
      throw error;
    }
  }

  static async uploadMultipleFiles(
    files: File[],
    exerciseId?: number
  ): Promise<string[]> {
    const uploadPromises = files.map((file) =>
      this.uploadFile(file, exerciseId)
    );
    return Promise.all(uploadPromises);
  }

  static async deleteFile(fileUrl: string): Promise<boolean> {
    try {
      const response = await api.delete("/upload/file", {
        data: { fileUrl },
      });

      return response.data.success;
    } catch (error) {
      console.error("File delete error:", error);
      return false;
    }
  }
}

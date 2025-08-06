import api from "../lib/api";

export class GoogleDriveService {
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

      return response.data.driveLink;
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
}

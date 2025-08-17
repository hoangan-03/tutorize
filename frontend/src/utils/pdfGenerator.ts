import { Exercise } from "../types/api";
import api from "../lib/api";

export interface GeneratePdfOptions {
  selectedFont?: string; // font family name chosen in UI
  showHeader?: boolean; // whether to render header info (title, meta)
}

// Generate exercise PDF; forwards selected font + header option as query params to backend
export const generateExercisePDF = async (
  exercise: Exercise,
  options: GeneratePdfOptions = {}
): Promise<void> => {
  const { selectedFont, showHeader } = options;
  try {
    const response = await api.get(`/pdf/exercise/${exercise.id}`, {
      responseType: "blob",
      params: {
        font: selectedFont,
        showHeader: showHeader !== undefined ? showHeader : true,
      },
    });

    const blob = new Blob([response.data], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${(exercise.name || "exercise").replace(/[<>:"/\\|?*]/g, "_")}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Failed to request PDF:", error);
    alert("Không thể tạo PDF.");
  }
};

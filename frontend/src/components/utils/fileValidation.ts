import { t } from "i18next";

export const validateFiles = (
  files: File[],
  allowedTypes?: string[]
): {
  validFiles: File[];
  invalidFiles: Array<{ file: File; errorMessage: string }>;
} => {
  const validFiles: File[] = [];
  const invalidFiles: Array<{ file: File; errorMessage: string }> = [];

  files.forEach((file) => {
    const sizeValidation = validateFileSize(file);
    if (!sizeValidation.isValid) {
      invalidFiles.push({
        file,
        errorMessage:
          sizeValidation.errorMessage || `${t("common.fileTooLarge")}`,
      });
      return;
    }

    if (allowedTypes && allowedTypes.length > 0) {
      const typeValidation = validateFileType(file, allowedTypes);
      if (!typeValidation.isValid) {
        invalidFiles.push({
          file,
          errorMessage:
            typeValidation.errorMessage ||
            `${t("common.fileTypeIsNotSupported")}`,
        });
        return;
      }
    }

    validFiles.push(file);
  });

  return { validFiles, invalidFiles };
};

export const MAX_FILE_SIZE = parseInt(import.meta.env.VITE_MAX_FILE_SIZE);

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

export const validateFileSize = (
  file: File
): { isValid: boolean; errorMessage?: string } => {
  if (file.size > MAX_FILE_SIZE) {
    return {
      isValid: false,
      errorMessage: `${t("common.fileTooLarge")} ${t(
        "common.maximumSizeIs"
      )} ${formatFileSize(MAX_FILE_SIZE)}`,
    };
  }

  return { isValid: true };
};

export const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const PDF_TYPES = ["application/pdf"];
export const DOCUMENT_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

export const validateFileType = (
  file: File,
  allowedTypes: string[]
): { isValid: boolean; errorMessage?: string } => {
  if (!allowedTypes.includes(file.type)) {
    const extensions = allowedTypes
      .map((type) => {
        switch (type) {
          case "image/jpeg":
            return "JPEG";
          case "image/png":
            return "PNG";
          case "image/webp":
            return "WebP";
          case "application/pdf":
            return "PDF";
          case "application/msword":
            return "DOC";
          case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
            return "DOCX";
          default:
            return type;
        }
      })
      .join(", ");

    return {
      isValid: false,
      errorMessage: `${t("common.fileTypeIsNotSupported")} ${t(
        "common.onlyAccept"
      )} ${extensions}`,
    };
  }

  return { isValid: true };
};

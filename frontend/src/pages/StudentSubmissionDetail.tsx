import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Clock,
  CheckCircle,
  Edit,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import {
  useExerciseSubmission,
  useExerciseSubmissions,
  useModal,
} from "../hooks";
import { uploadService } from "../services/uploadService";
import { SubmissionStatus } from "../types/api";
import { Badge } from "../components/ui";
import {
  formatDateTime,
  validateFiles,
  IMAGE_TYPES,
} from "../components/utils";

import { t } from "i18next";

export const StudentSubmissionDetail: React.FC = () => {
  const { submissionId } = useParams<{ submissionId: string }>();
  const navigate = useNavigate();

  const {
    submission,
    isLoading: loading,
    mutate,
  } = useExerciseSubmission(submissionId ? parseInt(submissionId) : null);
  const { updateSubmission, deleteSubmission } = useExerciseSubmissions();
  const { showSuccess, showError, showConfirm } = useModal();
  const [editing, setEditing] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<
    Array<{
      file: File;
      preview: string;
      uploadStatus: "pending" | "uploading" | "success" | "error";
      cloudinaryUrl?: string;
    }>
  >([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);

  useEffect(() => {
    if (submission) {
      // Parse existing images
      if (submission.submissionUrl) {
        try {
          const imageUrls = JSON.parse(
            submission.submissionUrl as unknown as string
          );
          setExistingImages(Array.isArray(imageUrls) ? imageUrls : []);
        } catch {
          setExistingImages([]);
        }
      }
    }
  }, [submission]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);

    if (files.length === 0) {
      return;
    }

    const { validFiles, invalidFiles } = validateFiles(files, IMAGE_TYPES);

    if (invalidFiles.length > 0) {
      const errorMessages = invalidFiles
        .map(({ file, errorMessage }) => `${file.name}: ${errorMessage}`)
        .join("\n");

      showError(
        `${t("common.someFilesIsNotValid")}\n${errorMessages}`,
        `${t("common.invalidFiles")}`
      );
    }

    if (validFiles.length === 0) {
      return;
    }

    const newImages = validFiles.map((file) => {
      return {
        file,
        preview: URL.createObjectURL(file),
        uploadStatus: "pending" as const,
      };
    });

    setUploadedImages((prev) => {
      const updated = [...prev, ...newImages];
      return updated;
    });

    event.target.value = "";
  };

  const uploadImages = async () => {
    const pendingImages = uploadedImages.filter(
      (img) => img.uploadStatus === "pending"
    );

    for (const image of pendingImages) {
      try {
        setUploadedImages((prev) =>
          prev.map((img) =>
            img.file === image.file
              ? { ...img, uploadStatus: "uploading" }
              : img
          )
        );

        const uploadUrl = await uploadService.uploadFile(
          image.file,
          submission?.exercise?.id
        );

        setUploadedImages((prev) =>
          prev.map((img) =>
            img.file === image.file
              ? { ...img, uploadStatus: "success", cloudinaryUrl: uploadUrl }
              : img
          )
        );
      } catch (error) {
        console.error("Error uploading image:", error);
        setUploadedImages((prev) =>
          prev.map((img) =>
            img.file === image.file ? { ...img, uploadStatus: "error" } : img
          )
        );
      }
    }
  };

  const handleUpdateSubmission = async () => {
    if (!submission) return;

    try {
      await uploadImages();

      const successfulUploads = uploadedImages
        .filter((img) => img.uploadStatus === "success")
        .map((img) => img.cloudinaryUrl!)
        .filter(Boolean);

      const allImageUrls = [...existingImages, ...successfulUploads];

      await updateSubmission(submission.id, allImageUrls);
      setEditing(false);
      setUploadedImages([]);
      mutate();
      showSuccess("Cập nhật bài nộp thành công!", {
        title: "Thành công",
        autoClose: true,
        autoCloseDelay: 2000,
      });
    } catch (error) {
      console.error("Error updating submission:", error);
      showError("Có lỗi xảy ra khi cập nhật bài nộp. Vui lòng thử lại.", "Lỗi");
    }
  };

  const handleDeleteSubmission = async () => {
    if (!submission) return;

    showConfirm(
      "Bạn có chắc chắn muốn xóa bài nộp này? Hành động này không thể hoàn tác.",
      async () => {
        try {
          await deleteSubmission(submission.id);
          showSuccess("Xóa bài nộp thành công!", {
            title: "Thành công",
            autoClose: true,
            autoCloseDelay: 2000,
          });
          navigate("/submissions");
        } catch (error) {
          console.error("Error deleting submission:", error);
          showError("Có lỗi xảy ra khi xóa bài nộp. Vui lòng thử lại.", "Lỗi");
        }
      },
      {
        title: "Xác nhận xóa",
        confirmText: "Xóa",
        cancelText: "Hủy",
      }
    );
  };

  const removeExistingImage = (index: number) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  const removeUploadedImage = (index: number) => {
    setUploadedImages((prev) => {
      const imageToRemove = prev[index];
      if (imageToRemove.preview) {
        URL.revokeObjectURL(imageToRemove.preview);
      }
      return prev.filter((_, i) => i !== index);
    });
  };

  const getStatusBadge = (status: SubmissionStatus) => {
    const statusMap = {
      SUBMITTED: {
        variant: "status" as const,
        className: "bg-blue-100 text-blue-800",
        text: "Đã nộp",
      },
      GRADED: {
        variant: "status" as const,
        className: "bg-green-100 text-green-800",
        text: "Đã chấm điểm",
      },
      RETURNED: {
        variant: "status" as const,
        className: "bg-yellow-100 text-yellow-800",
        text: "Trả lại",
      },
    };

    const statusInfo = statusMap[status as keyof typeof statusMap] || {
      variant: "status" as const,
      className: "bg-gray-100 text-gray-800",
      text: status,
    };

    return (
      <Badge variant={statusInfo.variant} className={statusInfo.className}>
        {statusInfo.text}
      </Badge>
    );
  };

  if (loading) {
    return <div className="flex justify-center p-8">Đang tải...</div>;
  }

  if (!submission) {
    return <div className="text-center p-8">Không tìm thấy bài nộp</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-3 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-4">
        <div className="flex items-start sm:items-center gap-3 sm:gap-4">
          <button
            title="Quay lại"
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-lg flex-shrink-0 mt-1 sm:mt-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl font-bold break-words">
              {submission.exercise?.name}
            </h1>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mt-2">
              {getStatusBadge(submission.status)}
              <div className="flex items-center gap-1 text-gray-600 text-sm sm:text-base">
                <Clock className="w-4 h-4 flex-shrink-0" />
                <span className="break-all">
                  Nộp lúc: {formatDateTime(submission.submittedAt)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {submission.status === "SUBMITTED" && (
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <button
              title="Chỉnh sửa"
              onClick={() => setEditing(!editing)}
              className="px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              <Edit className="w-4 h-4" />
              Chỉnh sửa
            </button>
            <button
              onClick={handleDeleteSubmission}
              className="px-3 sm:px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              <Trash2 className="w-4 h-4" />
              Xóa
            </button>
          </div>
        )}
      </div>

      {/* Score and Feedback */}
      {submission.score !== null && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
            <h3 className="font-semibold text-green-800 text-sm sm:text-base">
              Kết quả chấm điểm
            </h3>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-green-700 mb-2">
            {submission.score}/10 điểm
          </div>
          {submission.feedback && (
            <div>
              <h4 className="font-medium text-green-800 mb-1 text-sm sm:text-base">
                Nhận xét:
              </h4>
              <p className="text-green-700">{submission.feedback}</p>
            </div>
          )}
          {submission.gradedAt && (
            <div className="text-sm text-green-600 mt-2">
              Chấm điểm lúc: {formatDateTime(submission.gradedAt)}
            </div>
          )}
        </div>
      )}

      {/* Images */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Hình ảnh bài làm</h3>
          {editing && (
            <div className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm rounded-lg border border-yellow-200">
              Đang chỉnh sửa
            </div>
          )}
        </div>

        {/* Existing Images */}
        {existingImages.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-md font-medium text-gray-700">
              Ảnh hiện tại ({existingImages.length})
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {existingImages.map((imageUrl, index) => (
                <div key={index} className="relative group">
                  <img
                    src={imageUrl}
                    alt={`Bài làm ${index + 1}`}
                    className="w-full h-48 object-cover rounded-lg border"
                  />
                  {editing && (
                    <button
                      onClick={() => removeExistingImage(index)}
                      className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Xóa ảnh này"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* New Images (when editing) */}
        {editing && (
          <div className="space-y-4 border-t border-gray-200 pt-4">
            <h4 className="text-md font-medium text-gray-700">Thêm ảnh mới</h4>
            <div className="flex items-center gap-4">
              <label className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer flex items-center gap-2 transition-colors">
                <Upload className="w-4 h-4" />
                Thêm ảnh mới
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
              <span className="text-sm text-gray-500">
                Chọn một hoặc nhiều ảnh để thêm vào bài nộp
              </span>
            </div>

            {uploadedImages.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {uploadedImages.map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={image.preview}
                      alt={`Upload ${index + 1}`}
                      className="w-full h-48 object-cover rounded-lg border"
                    />
                    <button
                      title="Xóa ảnh này"
                      onClick={() => removeUploadedImage(index)}
                      className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>

                    {/* Upload Status */}
                    <div className="absolute bottom-2 left-2">
                      {image.uploadStatus === "pending" && (
                        <Badge
                          variant="status"
                          className="bg-gray-100 text-gray-800"
                        >
                          Chờ upload
                        </Badge>
                      )}
                      {image.uploadStatus === "uploading" && (
                        <Badge
                          variant="status"
                          className="bg-blue-100 text-blue-800"
                        >
                          Đang upload...
                        </Badge>
                      )}
                      {image.uploadStatus === "success" && (
                        <Badge
                          variant="status"
                          className="bg-green-100 text-green-800"
                        >
                          Thành công
                        </Badge>
                      )}
                      {image.uploadStatus === "error" && (
                        <Badge
                          variant="status"
                          className="bg-red-100 text-red-800"
                        >
                          Lỗi
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 border-2 border-dashed border-gray-300 rounded-lg">
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">
                  Chưa chọn ảnh mới nào. Nhấn nút "Thêm ảnh mới" ở trên để chọn
                  ảnh.
                </p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleUpdateSubmission}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Lưu thay đổi
              </button>
              <button
                onClick={() => {
                  setEditing(false);
                  setUploadedImages([]);
                }}
                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Hủy
              </button>
            </div>
          </div>
        )}

        {existingImages.length === 0 && !editing && (
          <div className="text-center py-8 text-gray-500">
            Chưa có hình ảnh nào
          </div>
        )}
      </div>
    </div>
  );
};

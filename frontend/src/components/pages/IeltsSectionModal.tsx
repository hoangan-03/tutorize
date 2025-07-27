import React, { useState, useEffect } from "react";
import { IeltsSection } from "../../types/api";
import { X } from "lucide-react";

interface IeltsSectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (sectionData: Partial<IeltsSection>) => void;
  section: Partial<IeltsSection> | null;
}

export const IeltsSectionModal: React.FC<IeltsSectionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  section,
}) => {
  const [sectionData, setSectionData] = useState<Partial<IeltsSection>>({});

  useEffect(() => {
    setSectionData(section || { title: "", order: 1 });
  }, [section]);

  if (!isOpen) return null;

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setSectionData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNumericInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSectionData((prev) => ({ ...prev, [name]: parseInt(value, 10) || 0 }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(sectionData);
  };

  const inputClass =
    "mt-1 block w-full rounded-lg border-gray-200 bg-gray-50 px-3 py-2 text-gray-800 shadow-sm transition-colors focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm";
  const textareaClass = `${inputClass} min-h-[100px]`;

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-60 flex justify-center items-center z-50 transition-opacity duration-300">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4 transform transition-all duration-300 scale-95 animate-in-zoom">
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div className="flex justify-between items-center p-5 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">
              {sectionData.id ? "Chỉnh sửa Phần thi" : "Tạo Phần thi mới"}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
              aria-label="Đóng"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700"
              >
                Tiêu đề
              </label>
              <input
                type="text"
                name="title"
                id="title"
                value={sectionData.title || ""}
                onChange={handleInputChange}
                className={inputClass}
                required
              />
            </div>

            <div>
              <label
                htmlFor="instructions"
                className="block text-sm font-medium text-gray-700"
              >
                Hướng dẫn
              </label>
              <textarea
                name="instructions"
                id="instructions"
                value={sectionData.instructions || ""}
                onChange={handleInputChange}
                rows={3}
                className={textareaClass}
              />
            </div>
            <div>
              <label
                htmlFor="order"
                className="block text-sm font-medium text-gray-700"
              >
                Thứ tự
              </label>
              <input
                type="number"
                name="order"
                id="order"
                value={sectionData.order || 0}
                onChange={handleNumericInputChange}
                className={inputClass}
                required
              />
            </div>
            <div>
              <label
                htmlFor="passageText"
                className="block text-sm font-medium text-gray-700"
              >
                Nội dung / Đoạn văn (Reading)
              </label>
              <textarea
                name="passageText"
                id="passageText"
                value={sectionData.passageText || ""}
                onChange={handleInputChange}
                rows={6}
                className={textareaClass}
              />
            </div>
            <div>
              <label
                htmlFor="audioUrl"
                className="block text-sm font-medium text-gray-700"
              >
                URL Audio (Listening)
              </label>
              <input
                type="text"
                name="audioUrl"
                id="audioUrl"
                value={sectionData.audioUrl || ""}
                onChange={handleInputChange}
                className={inputClass}
              />
            </div>
            <div>
              <label
                htmlFor="imageUrl"
                className="block text-sm font-medium text-gray-700"
              >
                URL Hình ảnh (Diagram)
              </label>
              <input
                type="text"
                name="imageUrl"
                id="imageUrl"
                value={sectionData.imageUrl || ""}
                onChange={handleInputChange}
                className={inputClass}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end items-center p-5 bg-gray-50 border-t border-gray-200 rounded-b-xl space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 shadow-sm"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-sm"
            >
              Lưu thay đổi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

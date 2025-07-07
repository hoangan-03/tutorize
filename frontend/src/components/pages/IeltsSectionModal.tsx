import React, { useState, useEffect } from "react";
import { IeltsSection } from "../../services/ieltsService";

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
    setSectionData(section || {});
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

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 overflow-y-auto h-full w-full z-50">
      <div className="relative top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-8 border w-full max-w-2xl shadow-lg rounded-md bg-white">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">
          {section?.id ? "Chỉnh sửa phần thi" : "Thêm phần thi mới"}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
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
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              required
            />
          </div>
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700"
            >
              Hướng dẫn
            </label>
            <textarea
              name="description"
              id="description"
              value={sectionData.description || ""}
              onChange={handleInputChange}
              rows={3}
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
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
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              required
            />
          </div>
          <div>
            <label
              htmlFor="content"
              className="block text-sm font-medium text-gray-700"
            >
              Nội dung / Đoạn văn (Reading)
            </label>
            <textarea
              name="content"
              id="content"
              value={sectionData.content || ""}
              onChange={handleInputChange}
              rows={8}
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
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
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div className="pt-4 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Lưu
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

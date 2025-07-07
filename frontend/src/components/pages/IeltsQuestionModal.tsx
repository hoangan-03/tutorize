import React, { useState, useEffect } from "react";
import { IeltsQuestion, IeltsQuestionType } from "../../services/ieltsService";
import { TrashIcon, PlusCircleIcon } from "@heroicons/react/24/outline";

interface IeltsQuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (questionData: Partial<IeltsQuestion>) => void;
  question: Partial<IeltsQuestion> | null;
}

const QUESTION_TYPES = [
  "MULTIPLE_CHOICE",
  "IDENTIFYING_INFORMATION",
  "MATCHING",
  "COMPLETION",
  "DIAGRAM_LABELING",
  "SHORT_ANSWER",
  "WRITING_TASK_1",
  "WRITING_TASK_2",
];

export const IeltsQuestionModal: React.FC<IeltsQuestionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  question,
}) => {
  const [questionData, setQuestionData] = useState<Partial<IeltsQuestion>>({});

  useEffect(() => {
    setQuestionData(
      question || {
        type: "MULTIPLE_CHOICE",
        points: 1,
        options: [],
        correctAnswers: [],
      }
    );
  }, [question]);

  if (!isOpen) return null;

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setQuestionData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNumericInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setQuestionData((prev) => ({ ...prev, [name]: parseInt(value, 10) || 0 }));
  };

  const handleListChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number,
    field: "options" | "correctAnswers"
  ) => {
    const newList = [...(questionData[field] || [])];
    newList[index] = e.target.value;
    setQuestionData((prev) => ({ ...prev, [field]: newList }));
  };

  const addListItem = (field: "options" | "correctAnswers") => {
    const newList = [...(questionData[field] || []), ""];
    setQuestionData((prev) => ({ ...prev, [field]: newList }));
  };

  const removeListItem = (
    index: number,
    field: "options" | "correctAnswers"
  ) => {
    const newList = [...(questionData[field] || [])];
    newList.splice(index, 1);
    setQuestionData((prev) => ({ ...prev, [field]: newList }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(questionData);
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 overflow-y-auto h-full w-full z-50">
      <div className="relative top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-8 border w-full max-w-4xl shadow-lg rounded-md bg-white">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">
          {question?.id ? "Chỉnh sửa câu hỏi" : "Thêm câu hỏi mới"}
        </h3>
        <form
          onSubmit={handleSubmit}
          className="space-y-6 max-h-[80vh] overflow-y-auto pr-4"
        >
          {/* Main Question Content */}
          <div>
            <label
              htmlFor="question"
              className="block text-sm font-medium text-gray-700"
            >
              Nội dung câu hỏi / Hướng dẫn
            </label>
            <textarea
              name="question"
              id="question"
              value={questionData.question || ""}
              onChange={handleInputChange}
              rows={4}
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Type */}
            <div>
              <label
                htmlFor="type"
                className="block text-sm font-medium text-gray-700"
              >
                Loại câu hỏi
              </label>
              <select
                name="type"
                id="type"
                value={questionData.type}
                onChange={handleInputChange}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                {QUESTION_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
            {/* Points */}
            <div>
              <label
                htmlFor="points"
                className="block text-sm font-medium text-gray-700"
              >
                Điểm
              </label>
              <input
                type="number"
                name="points"
                id="points"
                value={questionData.points || 1}
                onChange={handleNumericInputChange}
                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            {/* Order */}
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
                value={questionData.order || 1}
                onChange={handleNumericInputChange}
                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
          </div>

          {/* Dynamic Fields */}
          <div className="space-y-6">
            {/* Options for Multiple Choice */}
            {questionData.type === "MULTIPLE_CHOICE" && (
              <div>
                <h4 className="text-md font-medium text-gray-700">
                  Các lựa chọn
                </h4>
                <div className="mt-2 space-y-2">
                  {(questionData.options || []).map((option, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => handleListChange(e, index, "options")}
                        className="flex-grow block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        placeholder={`Lựa chọn ${index + 1}`}
                      />
                      <button
                        type="button"
                        onClick={() => removeListItem(index, "options")}
                        aria-label="Xóa lựa chọn"
                      >
                        <TrashIcon className="h-5 w-5 text-red-500" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addListItem("options")}
                    className="flex items-center text-sm text-indigo-600 hover:text-indigo-800"
                  >
                    <PlusCircleIcon className="h-5 w-5 mr-1" />
                    Thêm lựa chọn
                  </button>
                </div>
              </div>
            )}

            {/* Correct Answers */}
            <div>
              <h4 className="text-md font-medium text-gray-700">Đáp án đúng</h4>
              <p className="text-xs text-gray-500">
                Thêm nhiều đáp án nếu câu hỏi có nhiều câu trả lời (ví dụ: điền
                vào chỗ trống)
              </p>
              <div className="mt-2 space-y-2">
                {(questionData.correctAnswers || []).map((answer, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={answer}
                      onChange={(e) =>
                        handleListChange(e, index, "correctAnswers")
                      }
                      className="flex-grow block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      placeholder={`Đáp án ${index + 1}`}
                    />
                    <button
                      type="button"
                      onClick={() => removeListItem(index, "correctAnswers")}
                      aria-label="Xóa đáp án"
                    >
                      <TrashIcon className="h-5 w-5 text-red-500" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addListItem("correctAnswers")}
                  className="flex items-center text-sm text-indigo-600 hover:text-indigo-800"
                >
                  <PlusCircleIcon className="h-5 w-5 mr-1" />
                  Thêm đáp án
                </button>
              </div>
            </div>

            {/* Explanation */}
            <div>
              <label
                htmlFor="explanation"
                className="block text-sm font-medium text-gray-700"
              >
                Giải thích đáp án
              </label>
              <textarea
                name="explanation"
                id="explanation"
                value={questionData.explanation || ""}
                onChange={handleInputChange}
                rows={3}
                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
          </div>

          <div className="pt-5 border-t border-gray-200 flex justify-end space-x-3">
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

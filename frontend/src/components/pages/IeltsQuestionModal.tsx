import React, { useState, useEffect, useMemo } from "react";
import type {
  IeltsQuestion,
  IeltsQuestionType,
} from "../../services/ieltsService";
import { X } from "lucide-react";

interface IeltsQuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (questionData: Partial<IeltsQuestion>) => void;
  question: Partial<IeltsQuestion> | null;
}

const QUESTION_TYPES: IeltsQuestionType[] = [
  "MULTIPLE_CHOICE",
  "IDENTIFYING_INFORMATION",
  "MATCHING",
  "COMPLETION",
  "SHORT_ANSWER",
];

const typeConfigs: Record<
  IeltsQuestionType,
  {
    subQuestions: { show: boolean; label?: string; placeholder?: string };
    options: { show: boolean; label?: string; placeholder?: string };
    correctAnswers: { label: string; placeholder: string; helpText: string };
  }
> = {
  MULTIPLE_CHOICE: {
    subQuestions: { show: false },
    options: {
      show: true,
      label: "Các lựa chọn trả lời",
      placeholder: "Lựa chọn A\nLựa chọn B...",
    },
    correctAnswers: {
      label: "Đáp án đúng",
      placeholder: "Nhập chính xác nội dung của lựa chọn đúng.",
      helpText: "Nếu có nhiều đáp án đúng, mỗi đáp án một dòng.",
    },
  },
  IDENTIFYING_INFORMATION: {
    subQuestions: {
      show: true,
      label: "Các nhận định cần xác minh",
      placeholder:
        "Ví dụ:\nNhận định 1: The author is a biologist.\nNhận định 2: The study was conducted in Africa.",
    },
    options: {
      show: true,
      label: "Các lựa chọn (Tùy chỉnh)",
      placeholder: "True\nFalse\nNot Given\n(Để trống sẽ dùng mặc định)",
    },
    correctAnswers: {
      label: "Đáp án đúng (theo thứ tự nhận định)",
      placeholder: "True\nNot Given...",
      helpText: "Số lượng đáp án phải khớp với số lượng nhận định.",
    },
  },
  MATCHING: {
    subQuestions: {
      show: true,
      label: "Các mục cần nối (Câu hỏi)",
      placeholder:
        "Ví dụ:\nCâu 1: A reference to a past study\nCâu 2: A description of the methodology",
    },
    options: {
      show: true,
      label: "Các lựa chọn để nối",
      placeholder: "Ví dụ:\nLựa chọn A: Paragraph A\nLựa chọn B: Paragraph B",
    },
    correctAnswers: {
      label: "Đáp án đúng (theo thứ tự câu hỏi)",
      placeholder: "Lựa chọn B\nLựa chọn A...",
      helpText: "Số lượng đáp án phải khớp với số lượng câu hỏi.",
    },
  },
  SHORT_ANSWER: {
    subQuestions: {
      show: true,
      label: "Danh sách câu hỏi",
      placeholder:
        "Ví dụ:\nCâu 1: What was the primary reason?\nCâu 2: In what year...?",
    },
    options: { show: false },
    correctAnswers: {
      label: "Đáp án đúng (theo thứ tự câu hỏi)",
      placeholder: "Đáp án cho câu 1\nĐáp án cho câu 2...",
      helpText: "Số lượng đáp án phải khớp với số lượng câu hỏi.",
    },
  },
  COMPLETION: {
    subQuestions: {
      show: true,
      label: "Các câu/mục cần hoàn thành",
      placeholder: "Ví dụ:\n1. The author is a [__].\n2. He lives in [__].",
    },
    options: { show: false },
    correctAnswers: {
      label: "Đáp án đúng (theo thứ tự)",
      placeholder: "writer\nLondon",
      helpText: "Số lượng đáp án phải khớp với số lượng câu.",
    },
  },
};

export const IeltsQuestionModal: React.FC<IeltsQuestionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  question,
}) => {
  const [questionData, setQuestionData] = useState<Partial<IeltsQuestion>>({});
  const [optionsStr, setOptionsStr] = useState("");
  const [correctAnswersStr, setCorrectAnswersStr] = useState("");
  const [subQuestionsStr, setSubQuestionsStr] = useState("");

  useEffect(() => {
    const initialData = question || {
      type: "MULTIPLE_CHOICE",
      points: 1,
      options: [],
      correctAnswers: [],
      subQuestions: [],
    };
    setQuestionData(initialData);
    setOptionsStr((initialData.options || []).join("\n"));
    setCorrectAnswersStr((initialData.correctAnswers || []).join("\n"));
    setSubQuestionsStr((initialData.subQuestions || []).join("\n"));
  }, [question, isOpen]);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalQuestionData = {
      ...questionData,
      options: optionsStr.split("\n").filter(Boolean),
      correctAnswers: correctAnswersStr.split("\n").filter(Boolean),
      subQuestions: subQuestionsStr.split("\n").filter(Boolean),
    };
    onSave(finalQuestionData);
  };

  const currentConfig = typeConfigs[questionData.type as IeltsQuestionType];

  if (!currentConfig) {
    return null;
  }

  const inputClass =
    "mt-1 block w-full rounded-lg border-gray-200 bg-gray-50 px-3 py-2 text-gray-800 shadow-sm transition-colors focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm";
  const textareaClass = `${inputClass} min-h-[120px]`;

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-60 flex justify-center items-center z-50 transition-opacity duration-300">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl mx-4 transform transition-all duration-300 scale-95 animate-in-zoom">
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div className="flex justify-between items-center p-5 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">
              {questionData.id ? "Chỉnh sửa Câu hỏi" : "Tạo Câu hỏi mới"}
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
          <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Type, Points, Order */}
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
                  className={inputClass}
                >
                  {QUESTION_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  htmlFor="points"
                  className="block text-sm font-medium text-gray-700"
                >
                  Tổng điểm
                </label>
                <input
                  type="number"
                  name="points"
                  id="points"
                  value={questionData.points || 1}
                  onChange={handleNumericInputChange}
                  className={inputClass}
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
                  value={questionData.order || 1}
                  onChange={handleNumericInputChange}
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="question"
                className="block text-sm font-medium text-gray-700"
              >
                Câu hỏi chính / Hướng dẫn chung
              </label>
              <textarea
                name="question"
                id="question"
                value={questionData.question || ""}
                onChange={handleInputChange}
                rows={3}
                className={textareaClass}
                placeholder="Nhập hướng dẫn chung cho nhóm câu hỏi này. Ví dụ: Match each heading with the correct paragraph."
                required
              />
            </div>

            {/* Dynamic Fields based on Type */}
            <div className="space-y-6 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8">
                {/* SubQuestions */}
                {currentConfig.subQuestions.show && (
                  <div>
                    <label
                      htmlFor="subQuestions"
                      className="block text-sm font-bold text-gray-700"
                    >
                      {currentConfig.subQuestions.label}
                    </label>
                    <textarea
                      id="subQuestions"
                      value={subQuestionsStr}
                      onChange={(e) => setSubQuestionsStr(e.target.value)}
                      className={textareaClass}
                      placeholder={currentConfig.subQuestions.placeholder}
                    />
                  </div>
                )}

                {/* Options */}
                {currentConfig.options.show && (
                  <div>
                    <label
                      htmlFor="options"
                      className="block text-sm font-bold text-gray-700"
                    >
                      {currentConfig.options.label}
                    </label>
                    <textarea
                      id="options"
                      value={optionsStr}
                      onChange={(e) => setOptionsStr(e.target.value)}
                      className={textareaClass}
                      placeholder={currentConfig.options.placeholder}
                    />
                  </div>
                )}
              </div>

              {/* Correct Answers (always shown, but might span full width) */}
              <div
                className={
                  currentConfig.subQuestions.show || currentConfig.options.show
                    ? ""
                    : "md:col-span-2"
                }
              >
                <label
                  htmlFor="correctAnswers"
                  className="block text-sm font-bold text-gray-700"
                >
                  {currentConfig.correctAnswers.label}
                </label>
                <textarea
                  id="correctAnswers"
                  value={correctAnswersStr}
                  onChange={(e) => setCorrectAnswersStr(e.target.value)}
                  className={textareaClass}
                  placeholder={currentConfig.correctAnswers.placeholder}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {currentConfig.correctAnswers.helpText}
                </p>
              </div>
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
              Lưu Câu hỏi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

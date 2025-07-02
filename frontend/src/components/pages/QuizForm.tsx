/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { Save, Plus, Trash2, ArrowLeft, Clock, Calendar } from "lucide-react";

interface Question {
  id: number;
  question: string;
  type: "multiple-choice" | "true-false" | "short-answer";
  options: string[];
  correctAnswer: number | string;
  points: number;
}

interface QuizFormData {
  title: string;
  subject: string;
  grade: number;
  description: string;
  timeLimit: number;
  deadline: string;
  status: "draft" | "active";
  questions: Question[];
}

interface QuizFormProps {
  quiz?: any;
  onBack: () => void;
  onSave: (quiz: QuizFormData) => void;
}

export const QuizForm: React.FC<QuizFormProps> = ({ quiz, onBack, onSave }) => {
  const [formData, setFormData] = useState<QuizFormData>({
    title: quiz?.title || "",
    subject: quiz?.subject || "Mathematics",
    grade: quiz?.grade || 6,
    description: quiz?.description || "",
    timeLimit: quiz?.timeLimit || 30,
    deadline: quiz?.deadline || "",
    status: quiz?.status || "draft",
    questions: quiz?.questions || [],
  });

  const [activeQuestionIndex, setActiveQuestionIndex] = useState<number | null>(
    null
  );

  const subjects = [
    "Mathematics",
    "Science",
    "History",
    "English",
    "Geography",
  ];
  const grades = [6, 7, 8, 9, 10, 11, 12];

  const addQuestion = () => {
    const newQuestion: Question = {
      id: Date.now(),
      question: "",
      type: "multiple-choice",
      options: ["", "", "", ""],
      correctAnswer: 0,
      points: 1,
    };

    setFormData((prev) => ({
      ...prev,
      questions: [...prev.questions, newQuestion],
    }));

    setActiveQuestionIndex(formData.questions.length);
  };

  const updateQuestion = (
    index: number,
    updatedQuestion: Partial<Question>
  ) => {
    setFormData((prev) => ({
      ...prev,
      questions: prev.questions.map((q, i) =>
        i === index ? { ...q, ...updatedQuestion } : q
      ),
    }));
  };

  const deleteQuestion = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index),
    }));
    setActiveQuestionIndex(null);
  };

  const updateOption = (
    questionIndex: number,
    optionIndex: number,
    value: string
  ) => {
    const question = formData.questions[questionIndex];
    const newOptions = [...question.options];
    newOptions[optionIndex] = value;

    updateQuestion(questionIndex, { options: newOptions });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const isEditMode = !!quiz;

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="flex items-center text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="h-5 w-5 mr-1" />
            Quay lại
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {isEditMode ? "Chỉnh sửa Quiz" : "Tạo Quiz mới"}
            </h1>
            <p className="text-gray-600 mt-1">
              {isEditMode
                ? "Cập nhật thông tin quiz"
                : "Điền thông tin để tạo quiz mới"}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Quiz Settings */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Thông tin cơ bản
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tiêu đề Quiz *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, title: e.target.value }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Nhập tiêu đề quiz"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Môn học *
              </label>
              <select
                required
                value={formData.subject}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, subject: e.target.value }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {subjects.map((subject) => (
                  <option key={subject} value={subject}>
                    {subject}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lớp *
              </label>
              <select
                required
                value={formData.grade}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    grade: parseInt(e.target.value),
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {grades.map((grade) => (
                  <option key={grade} value={grade}>
                    Lớp {grade}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="inline h-4 w-4 mr-1" />
                Thời gian làm bài (phút) *
              </label>
              <input
                type="number"
                required
                min="5"
                max="180"
                value={formData.timeLimit}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    timeLimit: parseInt(e.target.value),
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="inline h-4 w-4 mr-1" />
                Hạn chót *
              </label>
              <input
                type="datetime-local"
                required
                value={formData.deadline}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, deadline: e.target.value }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Trạng thái
              </label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    status: e.target.value as "draft" | "active",
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="draft">Bản nháp</option>
                <option value="active">Kích hoạt</option>
              </select>
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mô tả
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Mô tả ngắn về quiz"
            />
          </div>
        </div>

        {/* Questions Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Câu hỏi ({formData.questions.length})
            </h2>
            <button
              type="button"
              onClick={addQuestion}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              Thêm câu hỏi
            </button>
          </div>

          {formData.questions.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p>Chưa có câu hỏi nào. Nhấn "Thêm câu hỏi" để bắt đầu.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {formData.questions.map((question, questionIndex) => (
                <div
                  key={question.id}
                  className={`border rounded-lg p-6 ${
                    activeQuestionIndex === questionIndex
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200"
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      Câu hỏi {questionIndex + 1}
                    </h3>
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() =>
                          setActiveQuestionIndex(
                            activeQuestionIndex === questionIndex
                              ? null
                              : questionIndex
                          )
                        }
                        className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                      >
                        {activeQuestionIndex === questionIndex
                          ? "Thu gọn"
                          : "Mở rộng"}
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteQuestion(questionIndex)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {activeQuestionIndex === questionIndex && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nội dung câu hỏi *
                        </label>
                        <textarea
                          required
                          value={question.question}
                          onChange={(e) =>
                            updateQuestion(questionIndex, {
                              question: e.target.value,
                            })
                          }
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Nhập câu hỏi"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Loại câu hỏi
                          </label>
                          <select
                            value={question.type}
                            onChange={(e) =>
                              updateQuestion(questionIndex, {
                                type: e.target.value as
                                  | "multiple-choice"
                                  | "true-false"
                                  | "short-answer",
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="multiple-choice">Trắc nghiệm</option>
                            <option value="true-false">Đúng/Sai</option>
                            <option value="short-answer">Tự luận ngắn</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Điểm
                          </label>
                          <input
                            type="number"
                            min="1"
                            max="10"
                            value={question.points}
                            onChange={(e) =>
                              updateQuestion(questionIndex, {
                                points: parseInt(e.target.value),
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      </div>

                      {question.type === "multiple-choice" && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Các phương án trả lời
                          </label>
                          <div className="space-y-3">
                            {question.options.map((option, optionIndex) => (
                              <div
                                key={optionIndex}
                                className="flex items-center space-x-3"
                              >
                                <input
                                  type="radio"
                                  name={`correct-${questionIndex}`}
                                  checked={
                                    question.correctAnswer === optionIndex
                                  }
                                  onChange={() =>
                                    updateQuestion(questionIndex, {
                                      correctAnswer: optionIndex,
                                    })
                                  }
                                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                />
                                <div className="flex-1">
                                  <input
                                    type="text"
                                    required
                                    value={option}
                                    onChange={(e) =>
                                      updateOption(
                                        questionIndex,
                                        optionIndex,
                                        e.target.value
                                      )
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder={`Phương án ${String.fromCharCode(
                                      65 + optionIndex
                                    )}`}
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {question.type === "true-false" && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Đáp án đúng
                          </label>
                          <div className="flex space-x-4">
                            <label className="flex items-center">
                              <input
                                type="radio"
                                name={`tf-${questionIndex}`}
                                checked={question.correctAnswer === "true"}
                                onChange={() =>
                                  updateQuestion(questionIndex, {
                                    correctAnswer: "true",
                                  })
                                }
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                              />
                              <span className="ml-2">Đúng</span>
                            </label>
                            <label className="flex items-center">
                              <input
                                type="radio"
                                name={`tf-${questionIndex}`}
                                checked={question.correctAnswer === "false"}
                                onChange={() =>
                                  updateQuestion(questionIndex, {
                                    correctAnswer: "false",
                                  })
                                }
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                              />
                              <span className="ml-2">Sai</span>
                            </label>
                          </div>
                        </div>
                      )}

                      {question.type === "short-answer" && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Đáp án mẫu
                          </label>
                          <input
                            type="text"
                            value={question.correctAnswer as string}
                            onChange={(e) =>
                              updateQuestion(questionIndex, {
                                correctAnswer: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Nhập đáp án mẫu"
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={onBack}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Hủy
          </button>
          <button
            type="submit"
            className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Save className="h-5 w-5 mr-2" />
            {isEditMode ? "Cập nhật Quiz" : "Tạo Quiz"}
          </button>
        </div>
      </form>
    </div>
  );
};

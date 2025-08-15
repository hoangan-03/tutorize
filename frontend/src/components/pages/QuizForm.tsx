import React, { useState } from "react";
import { Save, Plus, Trash2, Clock, Calendar } from "lucide-react";
import {
  Question,
  QuestionType,
  Quiz,
  QuizStatus,
  Subject,
} from "../../types/api";
import { getDefaultDeadline } from "../utils";

type FormQuestion = Omit<
  Question,
  "id" | "quizId" | "createdAt" | "updatedAt" | "quiz" | "answers"
> & {
  id?: number;
};

interface QuizFormData {
  title: string;
  subject: Subject;
  grade: number;
  description: string;
  timeLimit: number;
  deadline: string | null;
  status: QuizStatus;
  // Newly added configurable fields
  tags: string[];
  instructions: string;
  maxAttempts: number;
  isAllowedReviewed: boolean;
  isAllowedViewAnswerAfterSubmit: boolean;
  shuffleQuestions: boolean;
  shuffleAnswers: boolean;
  questions: FormQuestion[];
}

interface QuizFormProps {
  quiz?: Quiz;
  onBack: () => void;
  onSave: (quiz: QuizFormData) => void;
}

export const QuizForm: React.FC<QuizFormProps> = ({ quiz, onBack, onSave }) => {
  const formatDateForInput = (
    dateString: string | null | undefined
  ): string => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "";

      // Format to YYYY-MM-DDTHH:mm for datetime-local input
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");

      return `${year}-${month}-${day}T${hours}:${minutes}`;
    } catch (error) {
      console.error("Error formatting date:", error);
      return "";
    }
  };

  const formatDateForAPI = (dateString: string): string => {
    if (!dateString) return "";
    try {
      // Ensure the date string has seconds and timezone
      let formattedDateString = dateString;
      if (!formattedDateString.includes(":")) {
        formattedDateString += ":00";
      }
      if (
        !formattedDateString.includes("Z") &&
        !formattedDateString.includes("+")
      ) {
        // Add timezone offset for local time
        const date = new Date(formattedDateString);
        const offset = date.getTimezoneOffset();
        const hours = Math.abs(Math.floor(offset / 60));
        const minutes = Math.abs(offset % 60);
        const sign = offset > 0 ? "-" : "+";
        formattedDateString += `${sign}${hours
          .toString()
          .padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
      }

      const date = new Date(formattedDateString);
      return date.toISOString();
    } catch (error) {
      console.error("Error converting date:", error);
      return "";
    }
  };

  const [formData, setFormData] = useState<QuizFormData>({
    title: quiz?.title || "Sample Quiz",
    subject: quiz?.subject || Subject.MATH,
    grade: quiz?.grade || 6,
    description: quiz?.description || "Sample description",
    timeLimit: quiz?.timeLimit || 30,
    deadline: quiz?.deadline
      ? formatDateForInput(quiz.deadline)
      : getDefaultDeadline(),
    status: quiz?.status || QuizStatus.DRAFT,
    // Added fields with defaults or existing quiz values
    tags: quiz?.tags || [],
    instructions: quiz?.instructions || "",
    maxAttempts: quiz?.maxAttempts || 1,
    isAllowedReviewed: quiz?.isAllowedReviewed ?? false,
    isAllowedViewAnswerAfterSubmit:
      quiz?.isAllowedViewAnswerAfterSubmit ?? false,
    shuffleQuestions: quiz?.shuffleQuestions ?? false,
    shuffleAnswers: quiz?.shuffleAnswers ?? false,
    questions: (quiz?.questions || []).map((q: Question, index: number) => ({
      id: q.id,
      question: q.question,
      type: q.type,
      options: q.options,
      correctAnswer: q.correctAnswer,
      points: q.points,
      explanation: q.explanation,
      order: q.order || index + 1,
      imageUrl: q.imageUrl,
      audioUrl: q.audioUrl,
    })),
  });

  const [activeQuestionIndex, setActiveQuestionIndex] = useState<number | null>(
    null
  );

  const grades = [6, 7, 8, 9, 10, 11, 12];

  const addQuestion = () => {
    const newQuestion: FormQuestion = {
      question: "",
      type: QuestionType.MULTIPLE_CHOICE,
      options: ["", "", "", ""],
      correctAnswer: "0",
      points: 1,
      order: formData.questions.length + 1,
    };

    setFormData((prev) => ({
      ...prev,
      questions: [...prev.questions, newQuestion],
    }));

    setActiveQuestionIndex(formData.questions.length);
  };

  const updateQuestion = (
    index: number,
    updatedQuestion: Partial<FormQuestion>
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
      questions: prev.questions
        .filter((_, i) => i !== index)
        .map((q, newIndex) => ({
          ...q,
          order: newIndex + 1,
        })),
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

    const quizDataToSave = {
      ...formData,
      deadline: formData.deadline ? formatDateForAPI(formData.deadline) : null,
  // Ensure tags are trimmed and filtered
  tags: formData.tags.map((t) => t.trim()).filter((t) => t.length > 0),
    };

    onSave(quizDataToSave);
  };

  const subjects = Object.values(Subject);

  const subjectDisplayNames = {
    [Subject.MATH]: "Toán học",
    [Subject.PHYSICS]: "Vật lý",
    [Subject.LITERATURE]: "Văn học",
    [Subject.CHEMISTRY]: "Hóa học",
    [Subject.BIOLOGY]: "Sinh học",
    [Subject.NATURAL_SCIENCE]: "Khoa học tự nhiên",
    [Subject.ENGLISH]: "Tiếng Anh",
    [Subject.HISTORY]: "Lịch sử",
    [Subject.GEOGRAPHY]: "Địa lý",
    [Subject.CIVICS]: "Giáo dục công dân",
    [Subject.CAREER_GUIDANCE]: "Hoạt động trải nghiệm - hướng nghiệp",
    [Subject.LOCAL_STUDIES]: "Giáo dục địa phương",
    [Subject.ECONOMICS_LAW]: "GDKT&PL",
    [Subject.TECHNOLOGY]: "Công nghệ",
    [Subject.ART]: "Mỹ thuật",
    [Subject.MUSIC]: "Âm nhạc",
  };

  const isEditMode = !!quiz;

  return (
    <div className="mx-auto p-6 lg:px-16 xl:px-20">
      {/* Header */}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Quiz Settings */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Thông tin cơ bản
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 text-start">
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
              <label className="block text-sm font-medium text-gray-700 mb-2 text-start">
                Môn học *
              </label>
              <select
                aria-label="Môn học"
                required
                value={formData.subject}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    subject: e.target.value as Subject,
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {subjects.map((subject) => (
                  <option key={subject} value={subject}>
                    {subjectDisplayNames[subject]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 text-start">
                Lớp *
              </label>
              <select
                aria-label="Lớp"
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
              <label className="block text-sm font-medium text-gray-700 mb-2 text-start">
                <Clock className="inline h-4 w-4 mr-1" />
                Thời gian làm bài (phút) *
              </label>
              <input
                aria-label="Thời gian làm bài"
                type="number"
                required
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
              <label className="block text-sm font-medium text-gray-700 mb-2 text-start">
                <Calendar className="inline h-4 w-4 mr-1" />
                Hạn chót *
              </label>
              <input
                aria-label="Hạn chót"
                type="datetime-local"
                required={false}
                value={formData.deadline || ""}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, deadline: e.target.value }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 text-start">
                Trạng thái
              </label>
              <select
                aria-label="Trạng thái"
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
            </div> */}
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2 text-start">
              Mô tả
            </label>
            <textarea
              aria-label="Mô tả"
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
          {/* Additional Configurable Fields */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 text-start">
                Tags (phân cách bằng dấu phẩy)
              </label>
              <input
                type="text"
                value={formData.tags.join(", ")}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    tags: e.target.value
                      .split(/[,\n]/)
                      .map((t) => t.trim())
                      .filter((t) => t.length > 0),
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="ví dụ: kiểm tra, chương 1, hình học"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 text-start">
                Số lần làm bài tối đa
              </label>
              <input
                title="Max attempts"
                type="number"
                min={1}
                value={formData.maxAttempts}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    maxAttempts: Math.max(1, parseInt(e.target.value) || 1),
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2 text-start">
              Hướng dẫn làm bài (hiển thị cho học sinh)
            </label>
            <textarea
              value={formData.instructions}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  instructions: e.target.value,
                }))
              }
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Nhập hướng dẫn làm bài (tùy chọn)"
            />
          </div>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.isAllowedReviewed}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    isAllowedReviewed: e.target.checked,
                  }))
                }
                className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                aria-label="Cho phép xem lại bài"
              />
              <span className="text-sm text-gray-700">Cho phép xem lại bài</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.isAllowedViewAnswerAfterSubmit}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    isAllowedViewAnswerAfterSubmit: e.target.checked,
                  }))
                }
                className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                aria-label="Hiển thị đáp án sau khi nộp"
              />
              <span className="text-sm text-gray-700">Hiển thị đáp án sau khi nộp</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.shuffleQuestions}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    shuffleQuestions: e.target.checked,
                  }))
                }
                className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                aria-label="Xáo trộn câu hỏi"
              />
              <span className="text-sm text-gray-700">Xáo trộn câu hỏi</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.shuffleAnswers}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    shuffleAnswers: e.target.checked,
                  }))
                }
                className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                aria-label="Xáo trộn đáp án"
              />
              <span className="text-sm text-gray-700">Xáo trộn đáp án</span>
            </label>
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
                        title="Xóa câu hỏi"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {activeQuestionIndex === questionIndex && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2  text-start">
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
                          <label className="block text-sm font-medium text-gray-700 mb-2 text-start">
                            Loại câu hỏi
                          </label>
                          <select
                            aria-label="Loại câu hỏi"
                            value={question.type}
                            onChange={(e) =>
                              updateQuestion(questionIndex, {
                                type: e.target.value as QuestionType,
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value={QuestionType.MULTIPLE_CHOICE}>
                              Trắc nghiệm
                            </option>
                            <option value={QuestionType.TRUE_FALSE}>
                              Đúng/Sai
                            </option>
                            <option value={QuestionType.FILL_BLANK}>
                              Tự luận ngắn
                            </option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2 text-start">
                            Điểm
                          </label>
                          <input
                            aria-label="Điểm"
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

                      {question.type === QuestionType.MULTIPLE_CHOICE && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2 text-start">
                            Các phương án trả lời
                          </label>
                          <div className="space-y-3">
                            {question.options.map((option, optionIndex) => (
                              <div
                                key={optionIndex}
                                className="flex items-center space-x-3"
                              >
                                <input
                                  aria-label="Đáp án đúng"
                                  type="radio"
                                  name={`correct-${questionIndex}`}
                                  checked={
                                    question.correctAnswer ===
                                    optionIndex.toString()
                                  }
                                  onChange={() =>
                                    updateQuestion(questionIndex, {
                                      correctAnswer: optionIndex.toString(),
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

                      {question.type === QuestionType.TRUE_FALSE && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2 text-start">
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

                      {question.type === QuestionType.FILL_BLANK && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2 text-start">
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

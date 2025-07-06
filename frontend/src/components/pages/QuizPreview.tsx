/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { Clock, CheckCircle, AlertCircle } from "lucide-react";

interface QuizPreviewProps {
  quiz: any;
  onBack: () => void;
}

export const QuizPreview: React.FC<QuizPreviewProps> = ({ quiz }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{
    [key: number]: any;
  }>({});

  const handleAnswerSelect = (questionId: number, answer: any) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  const currentQuestion = quiz.questions?.[currentQuestionIndex];
  const totalQuestions = quiz.questions?.length || 0;

  const nextQuestion = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const prevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const goToQuestion = (index: number) => {
    setCurrentQuestionIndex(index);
  };

  const getAnswerStatus = (questionIndex: number) => {
    const question = quiz.questions?.[questionIndex];
    return question && selectedAnswers[question.id] !== undefined;
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4 text-sm text-gray-500">
          <Clock className="h-4 w-4 mr-1" />
          {quiz.timeLimit} phút
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Question Navigation Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Danh sách câu hỏi
            </h3>
            <div className="space-y-2">
              {quiz.questions?.map((question: any, index: number) => (
                <button
                  key={question.id}
                  onClick={() => goToQuestion(index)}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${
                    currentQuestionIndex === index
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : getAnswerStatus(index)
                      ? "border-green-200 bg-green-50 text-green-700"
                      : "border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Câu {index + 1}</span>
                    {getAnswerStatus(index) && (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    )}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {question.points} điểm
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-6 p-8 bg-blue-50 rounded-lg">
              <div className="text-sm text-blue-600 font-medium">Tổng quan</div>
              <div className="text-xs text-blue-500 mt-1">
                {Object.keys(selectedAnswers).length}/{totalQuestions} câu đã
                trả lời
              </div>
            </div>
          </div>
        </div>

        {/* Main Question Area */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            {/* Question Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  Câu hỏi {currentQuestionIndex + 1} / {totalQuestions}
                </h2>
                <div className="flex items-center text-sm text-orange-600 bg-orange-50 px-3 py-1 rounded-full">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {currentQuestion?.points} điểm
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${
                      ((currentQuestionIndex + 1) / totalQuestions) * 100
                    }%`,
                  }}
                />
              </div>
            </div>

            {/* Question Content */}
            <div className="p-6">
              {currentQuestion && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      {currentQuestion.question}
                    </h3>
                  </div>

                  {/* Multiple Choice Options */}
                  {currentQuestion.type === "MULTIPLE_CHOICE" && (
                    <div className="space-y-3">
                      {currentQuestion.options.map(
                        (option: string, optionIndex: number) => {
                          const isCorrect =
                            currentQuestion.correctAnswer ===
                            optionIndex.toString();

                          return (
                            <label
                              key={optionIndex}
                              className={`flex items-center p-8 border rounded-lg cursor-pointer transition-colors ${
                                isCorrect
                                  ? "border-green-500 bg-green-50"
                                  : selectedAnswers[currentQuestion.id] ===
                                    optionIndex
                                  ? "border-blue-500 bg-blue-50"
                                  : "border-gray-200 hover:bg-gray-50"
                              }`}
                            >
                              <input
                                type="radio"
                                name={`question-${currentQuestion.id}`}
                                checked={
                                  selectedAnswers[currentQuestion.id] ===
                                  optionIndex
                                }
                                onChange={() =>
                                  handleAnswerSelect(
                                    currentQuestion.id,
                                    optionIndex
                                  )
                                }
                                className={`h-4 w-4 focus:ring-2 border-2 ${
                                  isCorrect
                                    ? "text-green-600 focus:ring-green-500 border-green-300"
                                    : "text-blue-600 focus:ring-blue-500 border-gray-300"
                                }`}
                              />
                              <span
                                className={`ml-3 ${
                                  isCorrect ? "text-green-700" : "text-gray-700"
                                }`}
                              >
                                <span className="font-medium mr-2">
                                  {String.fromCharCode(65 + optionIndex)}.
                                </span>
                                {option}
                              </span>
                              {isCorrect && (
                                <span className="ml-auto text-green-600 font-medium text-sm">
                                  Đáp án đúng
                                </span>
                              )}
                            </label>
                          );
                        }
                      )}
                    </div>
                  )}

                  {/* True/False Options */}
                  {currentQuestion.type === "TRUE_FALSE" && (
                    <div className="space-y-3">
                      <label
                        className={`flex items-center p-8 border rounded-lg cursor-pointer transition-colors ${
                          currentQuestion.correctAnswer === "true"
                            ? "border-green-500 bg-green-50"
                            : selectedAnswers[currentQuestion.id] === "true"
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:bg-gray-50"
                        }`}
                      >
                        <input
                          type="radio"
                          name={`question-${currentQuestion.id}`}
                          checked={
                            selectedAnswers[currentQuestion.id] === "true"
                          }
                          onChange={() =>
                            handleAnswerSelect(currentQuestion.id, "true")
                          }
                          className={`h-4 w-4 focus:ring-2 border-2 ${
                            currentQuestion.correctAnswer === "true"
                              ? "text-green-600 focus:ring-green-500 border-green-300"
                              : "text-blue-600 focus:ring-blue-500 border-gray-300"
                          }`}
                        />
                        <span
                          className={`ml-3 font-medium ${
                            currentQuestion.correctAnswer === "true"
                              ? "text-green-700"
                              : "text-gray-700"
                          }`}
                        >
                          Đúng
                        </span>
                        {currentQuestion.correctAnswer === "true" && (
                          <span className="ml-auto text-green-600 font-medium text-sm">
                            Đáp án đúng
                          </span>
                        )}
                      </label>
                      <label
                        className={`flex items-center p-8 border rounded-lg cursor-pointer transition-colors ${
                          currentQuestion.correctAnswer === "false"
                            ? "border-green-500 bg-green-50"
                            : selectedAnswers[currentQuestion.id] === "false"
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:bg-gray-50"
                        }`}
                      >
                        <input
                          type="radio"
                          name={`question-${currentQuestion.id}`}
                          checked={
                            selectedAnswers[currentQuestion.id] === "false"
                          }
                          onChange={() =>
                            handleAnswerSelect(currentQuestion.id, "false")
                          }
                          className={`h-4 w-4 focus:ring-2 border-2 ${
                            currentQuestion.correctAnswer === "false"
                              ? "text-green-600 focus:ring-green-500 border-green-300"
                              : "text-blue-600 focus:ring-blue-500 border-gray-300"
                          }`}
                        />
                        <span
                          className={`ml-3 font-medium ${
                            currentQuestion.correctAnswer === "false"
                              ? "text-green-700"
                              : "text-gray-700"
                          }`}
                        >
                          Sai
                        </span>
                        {currentQuestion.correctAnswer === "false" && (
                          <span className="ml-auto text-green-600 font-medium text-sm">
                            Đáp án đúng
                          </span>
                        )}
                      </label>
                    </div>
                  )}

                  {/* Short Answer */}
                  {currentQuestion.type === "FILL_BLANK" && (
                    <div>
                      <div className="mb-3">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Đáp án mẫu:
                        </label>
                        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                          <span className="text-green-700 font-medium">
                            {currentQuestion.correctAnswer}
                          </span>
                        </div>
                      </div>
                      <textarea
                        value={selectedAnswers[currentQuestion.id] || ""}
                        onChange={(e) =>
                          handleAnswerSelect(currentQuestion.id, e.target.value)
                        }
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Nhập câu trả lời của bạn..."
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Navigation Buttons */}
            <div className="p-6 border-t border-gray-200">
              <div className="flex justify-between">
                <button
                  onClick={prevQuestion}
                  disabled={currentQuestionIndex === 0}
                  className={`px-6 py-2 rounded-lg transition-colors ${
                    currentQuestionIndex === 0
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-gray-600 text-white hover:bg-gray-700"
                  }`}
                >
                  Câu trước
                </button>

                <div className="flex space-x-3">
                  {currentQuestionIndex < totalQuestions - 1 ? (
                    <button
                      onClick={nextQuestion}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Câu tiếp theo
                    </button>
                  ) : (
                    <button className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                      Hoàn thành xem trước
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Preview Notice */}
          <div className="mt-6 p-8 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center flex-row gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-600 mr-2" />
              <div className="flex flex-col text-start">
                <p className="text-sm font-medium text-yellow-800">
                  Chế độ xem trước
                </p>
                <p className="text-xs text-yellow-700 mt-1">
                  Đây là giao diện mà học sinh sẽ nhìn thấy khi làm bài quiz
                  này. Các câu trả lời bạn chọn sẽ không được lưu.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

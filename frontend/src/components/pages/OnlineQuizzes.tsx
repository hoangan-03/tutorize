/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import {
  FileText,
  Clock,
  Trophy,
  CheckCircle,
  XCircle,
  ChevronRight,
  Star,
  PlayCircle,
  Eye,
  Users,
  BarChart3,
} from "lucide-react";
import { quizzesData, sampleQuestions } from "../../data/sampleData";
import { ExercisePublicView } from "./ExercisePublicView";
import { useAuth } from "../../contexts/AuthContext";

export const OnlineQuizzes: React.FC = () => {
  const { isTeacher } = useAuth();

  const [activeTab, setActiveTab] = useState<"quizzes" | "exercises">(
    "quizzes"
  );
  const [currentView, setCurrentView] = useState<
    "list" | "quiz" | "result" | "teacher-view"
  >("list");
  const [currentQuiz, setCurrentQuiz] = useState<any>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [quizResults, setQuizResults] = useState<any>(null);

  const startQuiz = (quiz: any) => {
    setCurrentQuiz(quiz);
    if (isTeacher) {
      setCurrentView("teacher-view");
    } else {
      setCurrentView("quiz");
    }
    setCurrentQuestionIndex(0);
    setSelectedAnswers([]);
    setQuizResults(null);
  };

  const selectAnswer = (answerIndex: number) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestionIndex] = answerIndex;
    setSelectedAnswers(newAnswers);
  };

  const nextQuestion = () => {
    const questions = currentQuiz?.questions || sampleQuestions;
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = () => {
    const questions = currentQuiz?.questions || sampleQuestions;
    const correct = selectedAnswers.reduce((count, answer, index) => {
      const question = questions[index];
      const correctAnswer =
        question.correctAnswer !== undefined
          ? question.correctAnswer
          : question.correct;
      return count + (answer === correctAnswer ? 1 : 0);
    }, 0);

    const results = {
      correct,
      total: questions.length,
      percentage: Math.round((correct / questions.length) * 100),
      passed: correct / questions.length >= 0.7,
    };

    setQuizResults(results);
    setCurrentView("result");
  };

  const resetQuiz = () => {
    setCurrentView("list");
    setCurrentQuiz(null);
    setCurrentQuestionIndex(0);
    setSelectedAnswers([]);
    setQuizResults(null);
  };

  // Teacher View for Quiz with Answers
  if (currentView === "teacher-view" && currentQuiz) {
    const questions = currentQuiz.questions || sampleQuestions;

    return (
      <div className="p-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {currentQuiz.title}
                </h1>
                <p className="text-gray-600 mt-2">
                  Xem chi tiết bài kiểm tra với đáp án
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center text-gray-600">
                  <Clock className="h-5 w-5 mr-2" />
                  <span>{currentQuiz.timeLimit || 15} phút</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Users className="h-5 w-5 mr-2" />
                  <span>{currentQuiz.totalSubmissions || 0} bài nộp</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  <span>{currentQuiz.averageScore || 0}% điểm TB</span>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              {questions.map((question: any, questionIndex: number) => (
                <div key={questionIndex} className="bg-gray-50 rounded-lg p-6">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Câu {questionIndex + 1}: {question.question}
                    </h3>
                    <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2 py-1 rounded">
                      {question.points || 1} điểm
                    </span>
                  </div>

                  <div className="space-y-3">
                    {question.options &&
                      question.options.map(
                        (option: string, optionIndex: number) => {
                          const isCorrect =
                            (question.correctAnswer || question.correct) ===
                            optionIndex;

                          return (
                            <div
                              key={optionIndex}
                              className={`p-3 border rounded-lg ${
                                isCorrect
                                  ? "border-green-500 bg-green-50"
                                  : "border-gray-200 bg-white"
                              }`}
                            >
                              <div className="flex items-center">
                                <div
                                  className={`w-6 h-6 rounded-full border-2 mr-4 flex items-center justify-center ${
                                    isCorrect
                                      ? "border-green-500 bg-green-500"
                                      : "border-gray-300"
                                  }`}
                                >
                                  {isCorrect && (
                                    <CheckCircle className="w-4 h-4 text-white" />
                                  )}
                                </div>
                                <span className="font-medium">
                                  {String.fromCharCode(65 + optionIndex)}.
                                </span>
                                <span className="ml-2">{option}</span>
                                {isCorrect && (
                                  <span className="ml-auto text-green-600 font-medium">
                                    Đáp án đúng
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        }
                      )}
                  </div>

                  {question.explanation && (
                    <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <h4 className="font-medium text-blue-900 mb-2">
                        Giải thích:
                      </h4>
                      <p className="text-blue-800">{question.explanation}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-between mt-8">
              <button
                onClick={resetQuiz}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Quay lại danh sách
              </button>
              <div className="flex space-x-4">
                <button className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Xem thống kê
                </button>
                <button className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center">
                  <Users className="h-4 w-4 mr-2" />
                  Xem bài nộp
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (currentView === "quiz" && currentQuiz) {
    const questions = currentQuiz.questions || sampleQuestions;
    const question = questions[currentQuestionIndex];

    return (
      <div className="p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-2xl font-bold text-gray-900">
                {currentQuiz.title}
              </h1>
              <div className="flex items-center space-x-4">
                <div className="flex items-center text-gray-600">
                  <Clock className="h-5 w-5 mr-2" />
                  <span>{currentQuiz.timeLimit || 15}:00</span>
                </div>
                <div className="text-gray-600">
                  Câu {currentQuestionIndex + 1}/{questions.length}
                </div>
              </div>
            </div>

            <div className="mb-8">
              <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${
                      ((currentQuestionIndex + 1) / questions.length) * 100
                    }%`,
                  }}
                ></div>
              </div>

              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                {question.question}
              </h2>

              <div className="space-y-4">
                {question.options &&
                  question.options.map((option: string, index: number) => (
                    <button
                      key={index}
                      onClick={() => selectAnswer(index)}
                      className={`w-full text-left p-4 border-2 rounded-lg transition-colors ${
                        selectedAnswers[currentQuestionIndex] === index
                          ? "border-blue-500 bg-blue-50 text-blue-900"
                          : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center">
                        <div
                          className={`w-6 h-6 rounded-full border-2 mr-4 flex items-center justify-center ${
                            selectedAnswers[currentQuestionIndex] === index
                              ? "border-blue-500 bg-blue-500"
                              : "border-gray-300"
                          }`}
                        >
                          {selectedAnswers[currentQuestionIndex] === index && (
                            <div className="w-3 h-3 rounded-full bg-white"></div>
                          )}
                        </div>
                        <span className="font-medium">
                          {String.fromCharCode(65 + index)}.
                        </span>
                        <span className="ml-2">{option}</span>
                      </div>
                    </button>
                  ))}
              </div>
            </div>

            <div className="flex justify-between">
              <button
                onClick={resetQuiz}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Thoát
              </button>
              <button
                onClick={nextQuestion}
                disabled={selectedAnswers[currentQuestionIndex] === undefined}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {currentQuestionIndex < questions.length - 1
                  ? "Câu tiếp theo"
                  : "Hoàn thành"}
                <ChevronRight className="h-4 w-4 ml-2" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (currentView === "result" && quizResults) {
    return (
      <div className="p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <div className="mb-8">
              {quizResults.passed ? (
                <div className="text-green-600">
                  <CheckCircle className="h-16 w-16 mx-auto mb-4" />
                  <h1 className="text-3xl font-bold">Chúc mừng!</h1>
                  <p className="text-lg text-gray-600 mt-2">
                    Bạn đã vượt qua bài kiểm tra
                  </p>
                </div>
              ) : (
                <div className="text-red-600">
                  <XCircle className="h-16 w-16 mx-auto mb-4" />
                  <h1 className="text-3xl font-bold">Hãy cố gắng thêm!</h1>
                  <p className="text-lg text-gray-600 mt-2">
                    Bạn cần ôn tập thêm
                  </p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="p-6 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {quizResults.correct}
                </div>
                <div className="text-gray-600">Câu đúng</div>
              </div>
              <div className="p-6 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-600">
                  {quizResults.total}
                </div>
                <div className="text-gray-600">Tổng số câu</div>
              </div>
              <div className="p-6 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {quizResults.percentage}%
                </div>
                <div className="text-gray-600">Điểm số</div>
              </div>
            </div>

            <div className="flex justify-center space-x-4">
              <button
                onClick={resetQuiz}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Về danh sách
              </button>
              <button
                onClick={() => startQuiz(currentQuiz)}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Làm lại
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="max-w-8xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Bài kiểm tra và bài tập
          </h1>
          <p className="text-gray-600 mt-2">
            Thử thách bản thân với các bài kiểm tra và hoàn thành bài tập từ
            giáo viên
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab("quizzes")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "quizzes"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Bài kiểm tra
              </button>
              <button
                onClick={() => setActiveTab("exercises")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "exercises"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Bài tập
              </button>
            </nav>
          </div>
        </div>

        {/* Content based on active tab */}
        {(activeTab as string) === "quizzes" && (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <FileText className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">
                      Bài quiz đã hoàn thành
                    </p>
                    <p className="text-2xl font-semibold text-gray-900">12</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">
                      Điểm trung bình
                    </p>
                    <p className="text-2xl font-semibold text-gray-900">85%</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Trophy className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">
                      Bài quiz xuất sắc
                    </p>
                    <p className="text-2xl font-semibold text-gray-900">8</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Clock className="h-6 w-6 text-orange-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">
                      Thời gian trung bình
                    </p>
                    <p className="text-2xl font-semibold text-gray-900">
                      12 phút
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quizzes Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {quizzesData.map((quiz) => (
                <div
                  key={quiz.id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <FileText className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="flex space-x-1">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <Star className="h-4 w-4 text-gray-300" />
                      </div>
                    </div>

                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {quiz.title}
                    </h3>

                    <div className="flex items-center space-x-4 mb-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <FileText className="h-4 w-4 mr-1" />
                        <span>
                          {quiz.totalQuestions || quiz.questions?.length || 0}{" "}
                          câu hỏi
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        <span>{quiz.timeLimit || 15} phút</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mb-4">
                      <div className="flex space-x-2">
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                          Lớp {quiz.grade}
                        </span>
                        <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm">
                          {quiz.subject}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => startQuiz(quiz)}
                      className={`w-full flex items-center justify-center px-4 py-2 rounded-md transition-colors ${
                        isTeacher
                          ? "bg-green-600 text-white hover:bg-green-700"
                          : "bg-blue-600 text-white hover:bg-blue-700"
                      }`}
                    >
                      {isTeacher ? (
                        <>
                          <Eye className="h-4 w-4 mr-2" />
                          Xem với đáp án
                        </>
                      ) : (
                        <>
                          <PlayCircle className="h-4 w-4 mr-2" />
                          Bắt đầu làm bài
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Exercise Tab Content */}
        {activeTab === "exercises" && (
          <div>
            <ExercisePublicView />
          </div>
        )}
      </div>
    </div>
  );
};

import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { QuizDashboard } from "./QuizDashboard";
import { useQuiz } from "../hooks";
import { ActionButton } from "../components/ui";

export const QuizDashboardPage: React.FC = () => {
  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();
  const parsedQuizId = quizId ? parseInt(quizId) : null;

  const { quiz, isLoading, error } = useQuiz(parsedQuizId);

  const handleBack = () => {
    navigate("/quiz");
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Đang tải thống kê quiz
          </h2>
          <p className="text-gray-600">Vui lòng đợi...</p>
        </div>
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Không tìm thấy quiz
          </h2>
          <p className="text-gray-600 mb-6">
            Quiz này không tồn tại hoặc bạn không có quyền truy cập.
          </p>
          <div className="flex justify-center">
            <ActionButton
              onClick={handleBack}
              colorTheme="blue"
              hasIcon={true}
              icon={ArrowLeft}
              text="Quay lại danh sách"
              size="md"
            />
          </div>
        </div>
      </div>
    );
  }

  return <QuizDashboard quiz={quiz} onBack={handleBack} />;
};

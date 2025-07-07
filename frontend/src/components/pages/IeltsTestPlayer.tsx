import React, { useState, useEffect, useCallback } from "react";
import {
  ieltsService,
  IeltsTest,
  IeltsQuestion,
  IeltsQuestionType,
} from "../../services/ieltsService";

interface IeltsTestPlayerProps {
  testId: number;
  onBack: () => void;
}

const renderQuestionInput = (
  question: IeltsQuestion,
  userAnswer: string | undefined,
  handleAnswerChange: (questionId: number, answer: string) => void
) => {
  const isMultipleCorrect = (question.correctAnswers || []).length > 1;

  switch (question.type) {
    case "MULTIPLE_CHOICE":
      return (
        <div className="space-y-2 mt-2">
          {(question.options || []).map((option, index) => (
            <div key={index} className="flex items-center">
              <input
                id={`q${question.id}-option${index}`}
                name={`q${question.id}`}
                type={isMultipleCorrect ? "checkbox" : "radio"}
                value={option}
                onChange={(e) =>
                  handleAnswerChange(question.id, e.target.value)
                }
                className={
                  isMultipleCorrect
                    ? "h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    : "h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
                }
              />
              <label
                htmlFor={`q${question.id}-option${index}`}
                className="ml-3 block text-sm font-medium text-gray-700"
              >
                {option}
              </label>
            </div>
          ))}
        </div>
      );
    case "IDENTIFYING_INFORMATION":
      return (
        <div className="space-y-2 mt-2">
          {["True", "False", "Not Given"].map((option, index) => (
            <div key={index} className="flex items-center">
              <input
                id={`q${question.id}-option${index}`}
                name={`q${question.id}`}
                type="radio"
                value={option}
                onChange={(e) =>
                  handleAnswerChange(question.id, e.target.value)
                }
                className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <label
                htmlFor={`q${question.id}-option${index}`}
                className="ml-3 block text-sm font-medium text-gray-700"
              >
                {option}
              </label>
            </div>
          ))}
        </div>
      );
    case "COMPLETION":
    case "SHORT_ANSWER":
    default:
      return (
        <input
          type="text"
          value={userAnswer || ""}
          onChange={(e) => handleAnswerChange(question.id, e.target.value)}
          placeholder="Nhập câu trả lời..."
          className="mt-2 block w-full max-w-lg rounded-lg border-gray-200 bg-gray-50 px-4 py-3 text-gray-800 shadow-sm transition-colors focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
      );
  }
};

export const IeltsTestPlayer: React.FC<IeltsTestPlayerProps> = ({
  testId,
  onBack,
}) => {
  const [test, setTest] = useState<IeltsTest | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [timeLeft, setTimeLeft] = useState<number>(0);

  const fetchTest = useCallback(async () => {
    try {
      setLoading(true);
      const testData = await ieltsService.getTest(testId);
      setTest(testData);
      setTimeLeft(testData.timeLimit * 60);
    } catch (err) {
      setError("Không thể tải bài test. Vui lòng thử lại.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [testId]);

  useEffect(() => {
    fetchTest();
  }, [fetchTest]);

  useEffect(() => {
    if (timeLeft <= 0 || !test) return;

    const timer = setInterval(() => {
      setTimeLeft((prevTime) => prevTime - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, test]);

  const handleAnswerChange = (questionId: number, answer: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  const handleSubmit = async () => {
    if (window.confirm("Bạn có chắc chắn muốn nộp bài không?")) {
      setSubmitting(true);
      try {
        const submissionData = Object.entries(answers).map(
          ([questionId, answer]) => ({
            questionId: Number(questionId),
            answer,
          })
        );
        await ieltsService.submitTest(testId, submissionData);
        // TODO: Redirect to result page
        alert("Nộp bài thành công!");
        onBack();
      } catch (err) {
        setError("Có lỗi xảy ra khi nộp bài.");
        console.error(err);
      } finally {
        setSubmitting(false);
      }
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Đang tải bài thi...</div>;
  }

  if (error) {
    return <div className="p-8 text-center text-red-600">{error}</div>;
  }

  if (!test || !test.sections || test.sections.length === 0) {
    return (
      <div className="p-8 text-center">
        Không tìm thấy bài thi hoặc bài thi không có nội dung.
      </div>
    );
  }

  const currentSection = test.sections[currentSectionIndex];
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="bg-white shadow-md rounded-lg p-4 mb-6 sticky top-0 z-10 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{test.title}</h1>
          <p className="mt-1 text-sm text-gray-600">
            Phần {currentSectionIndex + 1} / {test.sections.length}:{" "}
            {currentSection.title}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Thời gian còn lại</p>
          <p className="text-2xl font-bold text-indigo-600">
            {formatTime(timeLeft)}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left side: Passage/Audio */}
        <div className="bg-white p-6 rounded-lg shadow-sm h-full max-h-[70vh] overflow-y-auto">
          <h2 className="text-lg font-semibold mb-4">{currentSection.title}</h2>
          {currentSection.audioUrl && (
            <div className="mb-4">
              <audio controls src={currentSection.audioUrl} className="w-full">
                Your browser does not support the audio element.
              </audio>
            </div>
          )}
          <div
            className="prose max-w-none"
            dangerouslySetInnerHTML={{
              __html: currentSection.passageText || "",
            }}
          />
        </div>

        {/* Right side: Questions */}
        <div className="bg-white p-6 rounded-lg shadow-sm h-full max-h-[70vh] overflow-y-auto">
          <h2 className="text-lg font-semibold mb-4">Câu hỏi</h2>
          <div className="space-y-6">
            {(currentSection.questions || []).map((q) => (
              <div key={q.id}>
                <p className="font-semibold text-gray-800">
                  Câu {q.order}: {q.question}
                </p>
                {renderQuestionInput(q, answers[q.id], handleAnswerChange)}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="mt-8 pt-5 border-t border-gray-200 flex justify-between items-center">
        <div>
          <button
            onClick={() =>
              setCurrentSectionIndex((prev) => Math.max(0, prev - 1))
            }
            disabled={currentSectionIndex === 0}
            className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Phần trước
          </button>
          <button
            onClick={() =>
              setCurrentSectionIndex((prev) =>
                Math.min(test.sections.length - 1, prev + 1)
              )
            }
            disabled={currentSectionIndex === test.sections.length - 1}
            className="ml-3 bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Phần sau
          </button>
        </div>
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {submitting ? "Đang nộp..." : "Nộp bài"}
        </button>
      </div>
    </div>
  );
};

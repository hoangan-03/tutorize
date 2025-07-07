import React, { useState, useEffect } from "react";
import {
  ieltsService,
  IeltsSubmissionResult,
  IeltsQuestion,
} from "../../services/ieltsService";
import {
  CheckCircleIcon,
  XCircleIcon,
  BookOpenIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/solid";

interface IeltsTestResultProps {
  submissionId: number;
  onBack: () => void;
}

const getAnswerDisplay = (
  question: IeltsQuestion & { userAnswer?: string; isCorrect?: boolean }
) => {
  const userAnswer = question.userAnswer || "N/A";
  const correctAnswers = (question.correctAnswers || []).join(", ");

  return (
    <div className="mt-4 space-y-2 text-sm">
      <div className="flex items-start">
        <strong className="w-32 text-gray-600">Câu trả lời của bạn: </strong>
        <span
          className={`font-medium text-start ${
            question.isCorrect ? "text-green-700" : "text-red-700"
          }`}
        >
          {userAnswer}
        </span>
      </div>
      {!question.isCorrect && (
        <div className="flex items-start text-start">
          <strong className="w-32 text-gray-600">Đáp án đúng: </strong>
          <span className="font-medium text-blue-700">{correctAnswers}</span>
        </div>
      )}
      {question.explanation && (
        <div className="flex items-start mt-2 p-2 bg-yellow-50 rounded-md">
          <InformationCircleIcon className="h-5 w-5 text-yellow-500 mr-2 flex-shrink-0" />
          <p className="text-gray-700">{question.explanation}</p>
        </div>
      )}
    </div>
  );
};

export const IeltsTestResult: React.FC<IeltsTestResultProps> = ({
  submissionId,
  onBack,
}) => {
  const [submission, setSubmission] = useState<IeltsSubmissionResult | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSubmission = async () => {
      try {
        setLoading(true);
        const result = await ieltsService.getSubmissionDetails(submissionId);
        setSubmission(result);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to load test results.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSubmission();
  }, [submissionId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-lg">Loading results...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <h2 className="text-xl text-red-600">Error</h2>
        <p>{error}</p>
        <button
          onClick={onBack}
          className="mt-4 px-4 py-2 bg-gray-500 text-white rounded"
        >
          Back
        </button>
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="text-center p-8">
        <p>No submission data found.</p>
        <button
          onClick={onBack}
          className="mt-4 px-4 py-2 bg-gray-500 text-white rounded"
        >
          Back
        </button>
      </div>
    );
  }

  const { test } = submission;

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <div className="flex justify-between items-start">
            <div className="flex flex-col text-start">
              <h1 className="text-3xl font-bold text-gray-900">{test.title}</h1>
              <p className="mt-1 text-sm text-gray-500">
                Kết quả bài làm ngày:{" "}
                {new Date(submission.submittedAt).toLocaleDateString("vi-VN", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })}
              </p>
            </div>
            <button
              type="button"
              onClick={onBack}
              className="block rounded-md bg-indigo-600 px-4 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
            >
              Quay lại
            </button>
          </div>
          <div className="mt-6 flex flex-row gap-4 text-center">
            <div className="bg-blue-100 p-4 rounded-lg">
              <p className="text-sm font-medium text-blue-800">Band Score</p>
              <p className="mt-1 text-3xl font-bold text-blue-900">
                {submission.score.toFixed(1)}
              </p>
            </div>
            <div className="bg-green-100 p-4 rounded-lg text-start">
              <p className="text-sm font-medium text-green-800">Feedback</p>
              <p className="mt-1 text-md text-green-900">
                {submission.feedback}
              </p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="space-y-8">
          {test.sections.map((section, sectionIndex) => (
            <div key={section.id} className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                Section {sectionIndex + 1}: {section.title}
              </h2>

              {section.passageText && (
                <div className="prose max-w-none p-4 bg-gray-50 rounded-md mb-6 text-start flex flex-col gap-2">
                  <h3 className="flex items-center text-lg font-semibold">
                    <BookOpenIcon className="h-6 w-6 mr-2 text-gray-600" />
                    Reading Passage
                  </h3>
                  <div
                    dangerouslySetInnerHTML={{ __html: section.passageText }}
                  />
                </div>
              )}

              {section.audioUrl && (
                <div className="my-4">
                  <h3 className="text-lg font-semibold mb-2">
                    Listening Audio
                  </h3>
                  <audio controls src={section.audioUrl} className="w-full">
                    Your browser does not support the audio element.
                  </audio>
                </div>
              )}

              <div className="space-y-6">
                {section.questions.map((question, questionIndex) => (
                  <div
                    key={question.id}
                    className="border border-gray-200 p-4 rounded-md"
                  >
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        {question.isCorrect ? (
                          <CheckCircleIcon className="h-6 w-6 text-green-500" />
                        ) : (
                          <XCircleIcon className="h-6 w-6 text-red-500" />
                        )}
                      </div>
                      <div className="ml-3 text-start">
                        <p className="font-semibold text-gray-800">
                          Câu {questionIndex + 1}: {question.question}
                        </p>
                        {getAnswerDisplay(question)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

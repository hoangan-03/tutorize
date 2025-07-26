/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ieltsService,
  IeltsSubmission,
  IeltsTest,
  IeltsQuestion,
} from "../../services/ieltsService";
import { useAuth } from "../../hooks/useAuth";
import {
  BookOpenIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowLeftIcon,
  ClockIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";

export const IeltsResult: React.FC = () => {
  const { submissionId } = useParams<{ submissionId: string }>();
  const { user } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [submission, setSubmission] = useState<IeltsSubmission | null>(null);
  const [test, setTest] = useState<IeltsTest | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (submissionId) {
      loadSubmissionResult();
    }
  }, [submissionId]);

  const loadSubmissionResult = async () => {
    try {
      setLoading(true);
      const result = await ieltsService.getSubmissionResult(
        Number(submissionId)
      );
      setSubmission(result);
      setTest(result.test);
    } catch (error) {
      console.error("Error loading submission result:", error);
      navigate("/ielts");
    } finally {
      setLoading(false);
    }
  };

  const handleBackToList = () => {
    navigate("/ielts");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!submission || !test) {
    return (
      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <BookOpenIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Không tìm thấy kết quả bài thi
            </h2>
            <p className="text-gray-600 mb-6">
              Kết quả này không tồn tại hoặc bạn không có quyền truy cập.
            </p>
            <button
              onClick={handleBackToList}
              className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              {t("common.back")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const calculateScore = () => {
    if (!submission.answers) return 0;

    let correctAnswers = 0;
    let totalQuestions = 0;

    test.sections.forEach((section) => {
      section.questions.forEach((question) => {
        totalQuestions++;
        const userAnswer = submission.answers[question.id];

        if (question.type === "MULTIPLE_CHOICE") {
          if (userAnswer === question.correctAnswer) {
            correctAnswers++;
          }
        } else if (question.type === "MATCHING") {
          // For matching questions, check each sub-question
          try {
            const userAnswers = JSON.parse(userAnswer || "{}");
            const correctAnswersObj = JSON.parse(
              question.correctAnswer || "{}"
            );

            Object.keys(correctAnswersObj).forEach((key) => {
              if (userAnswers[key] === correctAnswersObj[key]) {
                correctAnswers++;
              }
            });
          } catch (e) {
            // If parsing fails, treat as incorrect
          }
        }
      });
    });

    return totalQuestions > 0 ? (correctAnswers / totalQuestions) * 9 : 0;
  };

  const score = calculateScore();
  const isPassed = score >= 6.0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
      <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 md:p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleBackToList}
                className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeftIcon className="h-5 w-5 mr-2" />
                {t("common.back")}
              </button>
            </div>
          </div>

          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              {isPassed ? (
                <CheckCircleIcon className="h-16 w-16 text-green-500" />
              ) : (
                <XCircleIcon className="h-16 w-16 text-red-500" />
              )}
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {test.title}
            </h1>
            <p className="text-lg text-gray-600">
              {t("ielts.result.completedOn")}:{" "}
              {new Date(submission.submittedAt).toLocaleString()}
            </p>
          </div>

          {/* Score Display */}
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-6 text-white text-center mb-8">
            <div className="text-4xl font-bold mb-2">{score.toFixed(1)}</div>
            <div className="text-lg opacity-90">
              {t("ielts.result.bandScore")}
            </div>
            <div className="text-sm opacity-75 mt-2">
              {isPassed
                ? t("ielts.result.passed")
                : t("ielts.result.needImprovement")}
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <ClockIcon className="h-8 w-8 text-gray-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">
                {Math.floor((submission.timeSpent || 0) / 60)}:
                {((submission.timeSpent || 0) % 60).toString().padStart(2, "0")}
              </div>
              <div className="text-sm text-gray-600">
                {t("ielts.result.timeSpent")}
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <ChartBarIcon className="h-8 w-8 text-gray-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">
                {test.sections.length}
              </div>
              <div className="text-sm text-gray-600">
                {t("ielts.result.sections")}
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <BookOpenIcon className="h-8 w-8 text-gray-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">
                {test.sections.reduce(
                  (total, section) => total + section.questions.length,
                  0
                )}
              </div>
              <div className="text-sm text-gray-600">
                {t("ielts.result.questions")}
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Results */}
        <div className="space-y-8">
          {test.sections.map((section, sectionIndex) => (
            <div key={section.id} className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                {t("ielts.result.section")} {sectionIndex + 1}: {section.title}
              </h2>

              {section.passageText && (
                <div className="prose max-w-none p-4 bg-gray-50 rounded-md mb-6 text-start flex flex-col gap-2">
                  <h3 className="flex items-center text-lg font-semibold">
                    <BookOpenIcon className="h-6 w-6 mr-2 text-gray-600" />
                    {t("ielts.result.readingPassage")}
                  </h3>
                  <div
                    dangerouslySetInnerHTML={{ __html: section.passageText }}
                  />
                </div>
              )}

              {section.audioUrl && (
                <div className="my-4">
                  <h3 className="text-lg font-semibold mb-2">
                    {t("ielts.result.listeningAudio")}
                  </h3>
                  <audio controls src={section.audioUrl} className="w-full">
                    Your browser does not support the audio element.
                  </audio>
                </div>
              )}

              <div className="space-y-4">
                {section.questions.map((question, questionIndex) => {
                  const userAnswer = submission.answers[question.id];
                  const isCorrect =
                    question.type === "MULTIPLE_CHOICE"
                      ? userAnswer === question.correctAnswer
                      : question.type === "MATCHING"
                      ? (() => {
                          try {
                            const userAnswers = JSON.parse(userAnswer || "{}");
                            const correctAnswers = JSON.parse(
                              question.correctAnswer || "{}"
                            );
                            return Object.keys(correctAnswers).every(
                              (key) => userAnswers[key] === correctAnswers[key]
                            );
                          } catch {
                            return false;
                          }
                        })()
                      : false;

                  return (
                    <div
                      key={question.id}
                      className={`p-4 rounded-lg border-l-4 ${
                        isCorrect
                          ? "bg-green-50 border-green-400"
                          : "bg-red-50 border-red-400"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-800 mb-2">
                            {t("ielts.result.question")} {questionIndex + 1}:
                          </h4>
                          <div
                            className="text-gray-700 mb-3"
                            dangerouslySetInnerHTML={{
                              __html: question.question,
                            }}
                          />

                          {question.type === "MULTIPLE_CHOICE" && (
                            <div className="space-y-2">
                              <p className="text-sm text-gray-600">
                                <strong>{t("ielts.result.yourAnswer")}:</strong>{" "}
                                {userAnswer || t("ielts.result.noAnswer")}
                              </p>
                              <p className="text-sm text-gray-600">
                                <strong>
                                  {t("ielts.result.correctAnswer")}:
                                </strong>{" "}
                                {question.correctAnswer}
                              </p>
                            </div>
                          )}

                          {question.type === "MATCHING" && (
                            <div className="space-y-2">
                              <p className="text-sm text-gray-600">
                                <strong>
                                  {t("ielts.result.yourAnswers")}:
                                </strong>
                              </p>
                              <div className="ml-4">
                                {(() => {
                                  try {
                                    const userAnswers = JSON.parse(
                                      userAnswer || "{}"
                                    );
                                    return Object.entries(userAnswers).map(
                                      ([key, value]) => (
                                        <p key={key} className="text-sm">
                                          {key}:{" "}
                                          {value || t("ielts.result.noAnswer")}
                                        </p>
                                      )
                                    );
                                  } catch {
                                    return (
                                      <p className="text-sm">
                                        {t("ielts.result.invalidAnswer")}
                                      </p>
                                    );
                                  }
                                })()}
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="ml-4">
                          {isCorrect ? (
                            <CheckCircleIcon className="h-6 w-6 text-green-500" />
                          ) : (
                            <XCircleIcon className="h-6 w-6 text-red-500" />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

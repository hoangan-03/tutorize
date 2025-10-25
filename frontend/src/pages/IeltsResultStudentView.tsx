import React, { useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useIeltsReadingSubmissionDetails } from "../hooks";
import { IeltsSubmissionResult } from "../services/ieltsReadingService";
import { Header } from "../components/layout/Header";
import {
  CheckCircleIcon,
  XCircleIcon,
  BookOpenIcon,
} from "@heroicons/react/24/solid";
import { formatDateTime } from "../components/utils";
import { LoadingSpinner, ErrorDisplay } from "../components/ui";

export const IeltsResultStudentView: React.FC = () => {
  const { submissionId } = useParams<{ submissionId: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const {
    submission,
    isLoading: loading,
    error,
  } = useIeltsReadingSubmissionDetails(
    submissionId ? parseInt(submissionId) : null
  );

  const questionNumberOffsets = useMemo(() => {
    if (!submission?.test) return [];
    const offsets = [0];
    let total = 0;
    for (let i = 0; i < submission.test.sections.length - 1; i++) {
      const section = submission.test.sections[i];
      let sectionQuestions = 0;
      (section.questions || []).forEach((q) => {
        sectionQuestions += Math.max(1, (q.subQuestions || []).length);
      });
      total += sectionQuestions;
      offsets.push(total);
    }
    return offsets;
  }, [submission?.test]);

  const handleBack = () => {
    navigate("/ielts");
  };

  if (loading) {
    return (
      <div>
        <Header mobileMenuOpen={false} setMobileMenuOpen={() => {}} />
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Header mobileMenuOpen={false} setMobileMenuOpen={() => {}} />
        <ErrorDisplay
          title={t("ielts.result.errorTitle")}
          message={error}
          onBack={handleBack}
          backText={t("ielts.result.back")}
        />
      </div>
    );
  }

  if (!submission) {
    return (
      <div>
        <Header mobileMenuOpen={false} setMobileMenuOpen={() => {}} />
        <div className="text-center p-8">
          <p>{t("ielts.result.noSubmission")}</p>
          <button
            onClick={handleBack}
            className="mt-4 px-4 py-2 bg-gray-500 text-white rounded"
          >
            {t("ielts.result.back")}
          </button>
        </div>
      </div>
    );
  }

  const renderQuestionResult = (
    questionGroup: IeltsSubmissionResult["test"]["sections"][0]["questions"][0],
    questionNumberOffset: number
  ) => {
    const hasSubQuestions = (questionGroup.subQuestions || []).length > 0;
    const userAnswers = JSON.parse(questionGroup.userAnswer || "{}");

    return (
      <div className="border border-gray-200 p-4 rounded-md">
        <p
          className="font-semibold text-gray-800 text-start"
          dangerouslySetInnerHTML={{ __html: questionGroup.question }}
        />
        <div className="mt-4 space-y-3">
          {(questionGroup.subQuestions || [questionGroup.question]).map(
            (subQ: string, index: number) => {
              const fullQuestionNumber = questionNumberOffset + index + 1;
              const userAnswer = hasSubQuestions
                ? userAnswers[index] || t("ielts.result.notAnswered")
                : questionGroup.userAnswer || t("ielts.result.notAnswered");
              const correctAnswer = (questionGroup.correctAnswers || [])[index];
              const isCorrect = userAnswer === correctAnswer;

              return (
                <div key={index} className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-1">
                    {isCorrect ? (
                      <CheckCircleIcon className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircleIcon className="h-5 w-5 text-red-500" />
                    )}
                  </div>
                  <div className="flex-grow text-sm text-start">
                    <p className="font-semibold text-gray-700">
                      {t("ielts.result.question")} {fullQuestionNumber}:{" "}
                      {hasSubQuestions && (
                        <span dangerouslySetInnerHTML={{ __html: subQ }} />
                      )}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <strong className="text-gray-600 w-28 text-right">
                        {t("ielts.result.userAnswer")}
                      </strong>
                      <span
                        className={`font-medium ${
                          isCorrect ? "text-green-700" : "text-red-700"
                        }`}
                      >
                        {userAnswer}
                      </span>
                    </div>
                    {!isCorrect && (
                      <div className="flex items-center gap-2 mt-1">
                        <strong className="text-gray-600 w-28 text-right">
                          {t("ielts.result.correctAnswer")}
                        </strong>
                        <span className="font-medium text-blue-700">
                          {correctAnswer}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            }
          )}
        </div>
      </div>
    );
  };

  const { test } = submission;

  return (
    <div>
      <Header mobileMenuOpen={false} setMobileMenuOpen={() => {}} />
      <div className="bg-gray-50 min-h-screen">
        <div className="container px-4 lg:px-18">
          {/* Header */}
          <div className="bg-white p-3 lg:p-6 rounded-lg shadow-md mb-8">
            <div className="flex justify-between items-start">
              <div className="flex flex-col text-start">
                <h1 className="text-base md:text-xl lg:text-3xl font-bold text-gray-900">
                  {test.title}
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                  {t("ielts.result.submittedOn")}{" "}
                  {formatDateTime(submission.submittedAt)}
                </p>
              </div>
              <button
                type="button"
                onClick={handleBack}
                className="block rounded-md bg-indigo-600 px-4 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
              >
                {t("ielts.result.back")}
              </button>
            </div>
            <div className="mt-6 flex flex-row gap-4 text-center">
              <div className="bg-blue-100 p-4 rounded-lg flex-shrink-0">
                <p className="text-sm font-medium text-blue-800">
                  {t("ielts.result.bandScore")}
                </p>
                <p className="mt-1 text-base md:text-xl lg:text-3xl font-bold text-blue-900">
                  {submission.score.toFixed(1)}
                </p>
              </div>
              <div className="bg-green-100 p-4 rounded-lg text-start flex-grow">
                <p className="text-sm font-medium text-green-800">
                  {t("ielts.result.feedback")}
                </p>
                <p className="mt-1 text-md text-green-900">
                  {submission.feedback}
                </p>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="space-y-8">
            {test.sections.map((section, sectionIndex) => (
              <div
                key={section.id}
                className="bg-white p-3 lg:p-6 rounded-lg shadow-md"
              >
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                  {t("ielts.result.section")} {sectionIndex + 1}:{" "}
                  {section.title}
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

                <div className="space-y-6">
                  {(section.questions || []).map((question, groupIndex) => {
                    const offsetWithinSection = (section.questions || [])
                      .slice(0, groupIndex)
                      .reduce(
                        (acc, prevQ) =>
                          acc + Math.max(1, (prevQ.subQuestions || []).length),
                        0
                      );

                    const finalOffset =
                      (questionNumberOffsets[sectionIndex] || 0) +
                      offsetWithinSection;
                    return (
                      <div key={question.id}>
                        {renderQuestionResult(question, finalOffset)}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useParams, useNavigate, useBeforeUnload } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import {
  ieltsService,
  IeltsTest,
  IeltsQuestion,
} from "../../services/ieltsService";

// Store complex answers as a JSON string for simplicity
export type Answer = string;
export type AnswerState = Record<number, Answer>;

const QuestionRenderer: React.FC<{
  question: IeltsQuestion;
  userAnswer: Answer | undefined;
  handleAnswerChange: (questionId: number, answer: Answer) => void;
  questionNumberOffset: number;
}> = ({ question, userAnswer, handleAnswerChange, questionNumberOffset }) => {
  const { t } = useTranslation();
  const userAnswersForGroup = useMemo(() => {
    try {
      return userAnswer ? JSON.parse(userAnswer) : {};
    } catch {
      return {}; // Handle cases where answer is not a valid JSON
    }
  }, [userAnswer]);

  const hasSubQuestions = (question.subQuestions || []).length > 0;

  switch (question.type) {
    case "MULTIPLE_CHOICE": {
      // This type does not have sub-questions, it's a single question
      return (
        <div className="space-y-2 mt-2">
          <p className="font-semibold text-gray-800 text-start">
            <span className="font-bold">
              {t("ielts.player.question")} {questionNumberOffset + 1}:
            </span>{" "}
            <span dangerouslySetInnerHTML={{ __html: question.question }} />
          </p>
          {(question.options || []).map((option, index) => (
            <div key={index} className="flex items-center ml-4">
              <input
                id={`q${question.id}-option${index}`}
                name={`q${question.id}`}
                type={"radio"}
                value={option}
                checked={userAnswer === option}
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
    }
    case "IDENTIFYING_INFORMATION":
    case "SHORT_ANSWER":
    case "COMPLETION": {
      if (!hasSubQuestions) {
        // Fallback for single questions of these types
        return (
          <div>
            <p className="font-semibold text-gray-800 text-start">
              <span className="font-bold">
                {t("ielts.player.question")} {questionNumberOffset + 1}:
              </span>{" "}
              <span dangerouslySetInnerHTML={{ __html: question.question }} />
            </p>
            <input
              type="text"
              value={userAnswer || ""}
              onChange={(e) => handleAnswerChange(question.id, e.target.value)}
              placeholder={t("ielts.player.enterAnswer")}
              className="mt-2 block w-full max-w-lg rounded-lg border-gray-200 bg-gray-50 px-4 py-2 text-gray-800 shadow-sm transition-colors focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        );
      }

      const choices =
        question.type === "IDENTIFYING_INFORMATION"
          ? question.options && question.options.length > 0
            ? question.options
            : ["True", "False", "Not Given"]
          : [];

      return (
        <div className="space-y-4">
          <p
            className="font-semibold text-gray-800 text-start"
            dangerouslySetInnerHTML={{ __html: question.question }}
          />
          {(question.subQuestions || []).map((subQ, index) => {
            const fullQuestionNumber = questionNumberOffset + index + 1;
            const answerKey = String(index);
            const currentAnswer = userAnswersForGroup[answerKey] || "";

            const onAnswer = (value: string) => {
              const newAnswers = { ...userAnswersForGroup, [answerKey]: value };
              handleAnswerChange(question.id, JSON.stringify(newAnswers));
            };

            return (
              <div key={index} className="flex items-start gap-4">
                <label
                  htmlFor={`q${question.id}-sub${index}`}
                  className="flex-shrink-0 w-max font-semibold text-gray-800 text-start"
                >
                  {t("ielts.player.question")} {fullQuestionNumber}:
                </label>
                <div className="flex-grow text-start">
                  <p
                    className="text-gray-700"
                    dangerouslySetInnerHTML={{ __html: subQ }}
                  />
                  {question.type === "IDENTIFYING_INFORMATION" ? (
                    <div className="flex flex-wrap gap-x-4 gap-y-2 mt-2">
                      {choices.map((option, optIndex) => (
                        <div key={optIndex} className="flex items-center">
                          <input
                            id={`q${question.id}-sub${index}-opt${optIndex}`}
                            name={`q${question.id}-sub${index}`}
                            type="radio"
                            value={option}
                            checked={currentAnswer === option}
                            onChange={(e) => onAnswer(e.target.value)}
                            className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
                          />
                          <label
                            htmlFor={`q${question.id}-sub${index}-opt${optIndex}`}
                            className="ml-2 block text-sm font-medium text-gray-700"
                          >
                            {option}
                          </label>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <input
                      id={`q${question.id}-sub${index}`}
                      type="text"
                      value={currentAnswer}
                      onChange={(e) => onAnswer(e.target.value)}
                      placeholder={t("ielts.player.enterAnswer")}
                      className="mt-1 block w-full max-w-lg rounded-lg border-gray-200 bg-gray-50 px-4 py-2 text-gray-800 shadow-sm transition-colors focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm"
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      );
    }
    case "MATCHING": {
      if (!hasSubQuestions) return null;
      const options = question.options || [];

      return (
        <div className="space-y-4">
          <p
            className="font-semibold text-gray-800 text-start"
            dangerouslySetInnerHTML={{ __html: question.question }}
          />
          {/* Options List */}
          {options.length > 0 && (
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <ul className="grid grid-cols-2 gap-x-6 gap-y-2">
                {options.map((opt, optIndex) => (
                  <li
                    key={optIndex}
                    className="text-base text-gray-700 text-start"
                  >
                    {opt}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {/* SubQuestions with Selectors */}
          <div className="space-y-3">
            {(question.subQuestions || []).map((subQ, index) => {
              const fullQuestionNumber = questionNumberOffset + index + 1;
              const answerKey = String(index);
              const currentAnswer = userAnswersForGroup[answerKey] || "";

              const handleMatchingChange = (value: string) => {
                const newAnswers = {
                  ...userAnswersForGroup,
                  [answerKey]: value,
                };
                handleAnswerChange(question.id, JSON.stringify(newAnswers));
              };

              return (
                <div
                  key={index}
                  className="grid grid-cols-1 md:grid-cols-3 items-center gap-4"
                >
                  <label
                    htmlFor={`q${question.id}-sub${index}`}
                    className="md:col-span-2 text-gray-800 text-start"
                  >
                    <span className="font-semibold">
                      {t("ielts.player.question")} {fullQuestionNumber}:
                    </span>{" "}
                    <span dangerouslySetInnerHTML={{ __html: subQ }} />
                  </label>
                  <select
                    id={`q${question.id}-sub${index}`}
                    value={currentAnswer}
                    onChange={(e) => handleMatchingChange(e.target.value)}
                    className="col-span-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-base py-2 px-4"
                  >
                    <option value="">{t("ielts.player.selectOption")}</option>
                    {options.map((opt, optIndex) => (
                      <option key={optIndex} value={opt}>
                        {opt.split(":")[0]}
                      </option>
                    ))}
                  </select>
                </div>
              );
            })}
          </div>
        </div>
      );
    }
    default:
      return (
        <div>
          <p className="font-semibold text-red-500">
            {t("ielts.player.unsupportedQuestionType")}
          </p>
        </div>
      );
  }
};

export const IeltsTestPlayer: React.FC = () => {
  const { t } = useTranslation();
  const { testId } = useParams<{ testId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [test, setTest] = useState<IeltsTest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);

  // Key for localStorage
  const storageKey = useMemo(
    () => `ielts-attempt-${user?.id}-${testId}`,
    [user?.id, testId]
  );

  // State initialization from localStorage
  const [answers, setAnswers] = useState<AnswerState>(() => {
    const savedState = localStorage.getItem(storageKey);
    return savedState ? JSON.parse(savedState).answers : {};
  });
  const [timeLeft, setTimeLeft] = useState<number>(() => {
    const savedState = localStorage.getItem(storageKey);
    return savedState ? JSON.parse(savedState).timeLeft : 0;
  });

  // Persist state to localStorage on change
  useEffect(() => {
    if (test) {
      // Only save if the test has loaded
      const stateToSave = { answers, timeLeft };
      localStorage.setItem(storageKey, JSON.stringify(stateToSave));
    }
  }, [answers, timeLeft, storageKey, test]);

  // Clean up localStorage on unload (navigate away, close tab, etc.)
  useBeforeUnload(
    useCallback(() => {
      localStorage.removeItem(storageKey);
    }, [storageKey])
  );

  const fetchTest = useCallback(async () => {
    if (!testId) return;
    try {
      setLoading(true);
      const testData = await ieltsService.getTest(Number(testId));
      setTest(testData);
      const savedState = localStorage.getItem(storageKey);
      if (savedState) {
        setTimeLeft(JSON.parse(savedState).timeLeft);
      } else {
        setTimeLeft(testData.timeLimit * 60);
      }
    } catch (err) {
      setError(t("ielts.player.loadError"));
    } finally {
      setLoading(false);
    }
  }, [testId, storageKey, t]);

  useEffect(() => {
    fetchTest();
  }, [fetchTest]);

  const clearAttemptAndNavigate = useCallback(() => {
    localStorage.removeItem(storageKey);
    navigate("/ielts");
  }, [storageKey, navigate]);

  const handleSubmit = useCallback(
    (isAutoSubmit = false) => {
      if (!isAutoSubmit && !window.confirm(t("ielts.player.submitConfirm"))) {
        return;
      }

      try {
        const submissionData = Object.entries(answers).map(
          ([questionId, answer]) => ({
            questionId: Number(questionId),
            answer,
          })
        );
        ieltsService.submitTest(Number(testId), submissionData);
        alert(t("ielts.player.submitSuccess"));
        clearAttemptAndNavigate();
      } catch (err) {
        setError(t("ielts.player.submitError"));
        // console.error(err);
      }
    },
    [answers, testId, clearAttemptAndNavigate, t]
  );

  // Timer countdown effect
  useEffect(() => {
    if (timeLeft <= 0 || !test) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        const newTime = prev - 1;
        if (newTime <= 0) {
          // Auto-submit when time is up
          handleSubmit(true);
          return 0;
        }
        return newTime;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, test, handleSubmit]);

  const handleExit = () => {
    if (window.confirm(t("ielts.player.exitConfirm"))) {
      clearAttemptAndNavigate();
      if (timeLeft === 1) {
        // Auto-submit when time is up
        handleSubmit(true);
      }
    }
  };

  const questionNumberOffsets = useMemo(() => {
    if (!test) return [];
    const offsets = [0];
    let total = 0;
    for (let i = 0; i < test.sections.length - 1; i++) {
      const section = test.sections[i];
      let sectionQuestions = 0;
      (section.questions || []).forEach((q) => {
        sectionQuestions += Math.max(1, (q.subQuestions || []).length);
      });
      total += sectionQuestions;
      offsets.push(total);
    }
    return offsets;
  }, [test]);

  const currentSection = useMemo(() => {
    if (!test || !test.sections) return null;
    return test.sections[currentSectionIndex];
  }, [test, currentSectionIndex]);

  const handleAnswerChange = useCallback(
    (questionId: number, answer: Answer) => {
      setAnswers((prev) => ({
        ...prev,
        [questionId]: answer,
      }));
    },
    []
  );

  if (loading) {
    return (
      <div className="p-8 text-center">{t("ielts.player.loadingTest")}</div>
    );
  }

  if (error) {
    return <div className="p-8 text-center text-red-600">{error}</div>;
  }

  if (!test || !currentSection) {
    return <div className="p-8 text-center">{t("ielts.player.notFound")}</div>;
  }

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
        <div className="text-start">
          <h1 className="text-2xl font-bold text-gray-900">{test.title}</h1>
          <p className="mt-1 text-sm text-gray-600">
            {t("ielts.player.section")} {currentSectionIndex + 1} /{" "}
            {test.sections.length}: {currentSection.title}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm text-gray-500">
              {t("ielts.player.remainingTime")}
            </p>
            <p className="text-2xl font-bold text-indigo-600">
              {formatTime(timeLeft)}
            </p>
          </div>
          <button
            onClick={handleExit}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 shadow-sm"
            aria-label={t("ielts.player.exit")}
          >
            {t("ielts.player.exit")}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left side: Passage/Audio/Image */}
        <div className="bg-white p-6 rounded-lg shadow-sm h-full max-h-[70vh] overflow-y-auto">
          <h2 className="text-lg font-semibold mb-4">{currentSection.title}</h2>
          {currentSection.audioUrl && (
            <div className="mb-4">
              <audio controls src={currentSection.audioUrl} className="w-full">
                Your browser does not support the audio element.
              </audio>
            </div>
          )}
          {currentSection.imageUrl && (
            <div className="mb-4 p-2 border rounded-md">
              <img
                src={currentSection.imageUrl}
                alt="Illustration for the section"
                className="w-full h-auto rounded-md"
              />
            </div>
          )}
          <div
            className="prose max-w-none text-start"
            dangerouslySetInnerHTML={{
              __html: currentSection.passageText || "",
            }}
          />
        </div>

        {/* Right side: Questions */}
        <div className="bg-white p-6 rounded-lg shadow-sm h-full max-h-[70vh] overflow-y-auto">
          <div className="space-y-8">
            {(currentSection.questions || []).map((q, groupIndex) => {
              const offsetWithinSection = (currentSection.questions || [])
                .slice(0, groupIndex)
                .reduce(
                  (acc, prevQ) =>
                    acc + Math.max(1, (prevQ.subQuestions || []).length),
                  0
                );

              const finalOffset =
                (questionNumberOffsets[currentSectionIndex] || 0) +
                offsetWithinSection;

              return (
                <div
                  key={q.id}
                  className="p-4 border-l-4 border-gray-100 rounded-r-lg"
                >
                  <QuestionRenderer
                    question={q}
                    userAnswer={answers[q.id]}
                    handleAnswerChange={handleAnswerChange}
                    questionNumberOffset={finalOffset}
                  />
                </div>
              );
            })}
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
            {t("ielts.player.previousSection")}
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
            {t("ielts.player.nextSection")}
          </button>
        </div>
        <button
          onClick={() => handleSubmit(false)}
          className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          {t("ielts.player.submit")}
        </button>
      </div>
    </div>
  );
};

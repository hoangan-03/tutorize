import React, { useState, useCallback, useMemo, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useParams, useNavigate } from "react-router-dom";
import {
  IeltsQuestion,
  IeltsQuestionType,
  IeltsReadingTest,
} from "../types/api";
import {
  useAuth,
  useIeltsTest,
  useIeltsTestManagement,
  useModal,
} from "../hooks";
import { ActionButton, LoadingSpinner } from "../components/ui";

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
      return {};
    }
  }, [userAnswer]);

  const hasSubQuestions = (question.subQuestions || []).length > 0;

  switch (question.type) {
    case IeltsQuestionType.MULTIPLE_CHOICE: {
      // does not have sub-questions, it's a single question
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
    case IeltsQuestionType.IDENTIFYING_INFORMATION:
    case IeltsQuestionType.SHORT_ANSWER:
    case IeltsQuestionType.COMPLETION: {
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
        question.type === IeltsQuestionType.IDENTIFYING_INFORMATION
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
                  {question.type ===
                  IeltsQuestionType.IDENTIFYING_INFORMATION ? (
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
    case IeltsQuestionType.MATCHING: {
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
  const { showSuccess, showError, showConfirm } = useModal();
  const { user } = useAuth();

  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [answers, setAnswers] = useState<AnswerState>({});
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [testStartTime, setTestStartTime] = useState<number>(0);
  const [currentTest, setCurrentTest] = useState<IeltsReadingTest | null>(null);

  const {
    test,
    isLoading: loading,
    error,
  } = useIeltsTest(testId ? Number(testId) : null);
  const { submitTest } = useIeltsTestManagement();

  const storageKey = useMemo(() => {
    if (!user || !testId) return null;
    return `ielts-attempt-${user?.id}-${testId}`;
  }, [user, testId]);

  useEffect(() => {
    if (storageKey) {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        try {
          const state = JSON.parse(saved);
          const maxAge = 6 * 60 * 60 * 1000; // 6 hours
          if (state.timestamp && Date.now() - state.timestamp < maxAge) {
            setAnswers(state.answers || {});
            setCurrentSectionIndex(state.currentSectionIndex || 0);
            setTestStartTime(state.testStartTime || Date.now());

            const elapsedSinceLastSave = Math.floor(
              (Date.now() - state.timestamp) / 1000
            );
            const adjustedTimeLeft = Math.max(
              0,
              (state.timeLeft || 0) - elapsedSinceLastSave
            );
            setTimeLeft(adjustedTimeLeft);
          } else {
            localStorage.removeItem(storageKey);
          }
        } catch (error) {
          console.error("Error parsing saved IELTS state:", error);
          localStorage.removeItem(storageKey);
        }
      }
    }
  }, [storageKey]);

  useEffect(() => {
    if (storageKey && currentTest) {
      const stateToSave = {
        answers,
        timeLeft,
        currentSectionIndex,
        testStartTime,
        testId: currentTest.id,
        timestamp: Date.now(),
      };
      localStorage.setItem(storageKey, JSON.stringify(stateToSave));
    }
  }, [
    answers,
    timeLeft,
    currentSectionIndex,
    storageKey,
    currentTest,
    testStartTime,
  ]);

  useEffect(() => {
    if (test && !currentTest) {
      beginIeltsAttempt(test.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [test, currentTest]);

  useEffect(() => {
    if (!testId) {
      setCurrentTest(null);
      setCurrentSectionIndex(0);
      setAnswers({});
      setTimeLeft(0);
    }
  }, [testId]);

  const clearAttemptAndNavigate = useCallback(() => {
    if (storageKey) {
      localStorage.removeItem(storageKey);
    }

    setCurrentTest(null);
    setCurrentSectionIndex(0);
    setAnswers({});
    setTimeLeft(0);

    navigate("/ielts", { replace: true });
  }, [storageKey, navigate]);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (currentTest && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setTimeout(async () => {
              try {
                showSuccess(
                  "Hết giờ làm bài! Hệ thống đang tự động nộp bài...",
                  {
                    title: "Hết thời gian",
                    autoClose: true,
                    autoCloseDelay: 5000,
                  }
                );
                await handleSubmit(true);
              } catch (error) {
                console.error("Error during auto-submit:", error);
                clearAttemptAndNavigate();
              }
            }, 100);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTest, timeLeft]);

  const beginIeltsAttempt = async (id: number) => {
    try {
      if (!id || id <= 0) {
        console.error("Invalid test ID:", id);
        return;
      }
      const detailedTest = test;
      if (!detailedTest) {
        return;
      }

      if (!detailedTest.sections || detailedTest.sections.length === 0) {
        showError("This IELTS test has no sections to complete.");
        clearAttemptAndNavigate();
        return;
      }

      const savedState = storageKey ? localStorage.getItem(storageKey) : null;
      let hasValidSavedState = false;

      if (savedState) {
        try {
          const state = JSON.parse(savedState);
          const maxAge = 6 * 60 * 60 * 1000;
          if (
            state.timestamp &&
            Date.now() - state.timestamp < maxAge &&
            state.testId === id
          ) {
            hasValidSavedState = true;
          }
        } catch (error) {
          console.error("Error checking saved state:", error);
        }
      }

      setCurrentTest(detailedTest);

      if (!hasValidSavedState) {
        setTestStartTime(Date.now());
        setTimeLeft((detailedTest.timeLimit || 15) * 60);
        setCurrentSectionIndex(0);
        setAnswers({});
      }
    } catch (error) {
      console.error("Error beginning IELTS attempt:", error);
    }
  };

  const handleSubmit = useCallback(
    async (isAutoSubmit = false) => {
      if (!isAutoSubmit) {
        showConfirm(t("ielts.player.submitConfirm"), async () => {
          try {
            const submissionData = Object.entries(answers).map(
              ([questionId, answer]) => ({
                questionId: Number(questionId),
                answer,
              })
            );
            await submitTest(Number(testId!), submissionData);
            showSuccess(t("ielts.player.submitSuccess"));
            clearAttemptAndNavigate();
          } catch (err) {
            console.error("Submit error:", err);
            showError("Failed to submit test. Please try again.");
          }
        });
        return;
      }

      try {
        const submissionData = Object.entries(answers).map(
          ([questionId, answer]) => ({
            questionId: Number(questionId),
            answer,
          })
        );
        await submitTest(Number(testId!), submissionData);
        showSuccess(t("ielts.player.submitSuccess"));
        clearAttemptAndNavigate();
      } catch (err) {
        console.error("Submit error:", err);
        showError("Failed to submit test. Please try again.");
      }
    },
    [
      answers,
      testId,
      clearAttemptAndNavigate,
      t,
      submitTest,
      showConfirm,
      showSuccess,
      showError,
    ]
  );

  const handleExit = () => {
    showConfirm(t("ielts.player.exitConfirm"), () => {
      clearAttemptAndNavigate();
    });
  };

  const questionNumberOffsets = useMemo(() => {
    if (!currentTest) return [];
    const offsets = [0];
    let total = 0;
    for (let i = 0; i < (currentTest.sections?.length || 0) - 1; i++) {
      const section = currentTest.sections![i];
      let sectionQuestions = 0;
      (section.questions || []).forEach((q) => {
        sectionQuestions += Math.max(1, (q.subQuestions || []).length);
      });
      total += sectionQuestions;
      offsets.push(total);
    }
    return offsets;
  }, [currentTest]);

  const currentSection = useMemo(() => {
    if (!currentTest || !currentTest.sections) return null;
    return currentTest.sections[currentSectionIndex];
  }, [currentTest, currentSectionIndex]);

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

  if (!currentTest || !currentSection) {
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
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 h-screen">
      {/* Header */}
      <div className="bg-white shadow-md rounded-lg p-4 mb-6 sticky top-0 z-10 flex justify-between items-center">
        <div className="text-start">
          <h1 className="text-2xl font-bold text-gray-900">
            {currentTest.title}
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            {t("ielts.player.section")} {currentSectionIndex + 1} /{" "}
            {currentTest.sections?.length || 0}: {currentSection.title}
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
          <ActionButton
            onClick={handleExit}
            text={t("ielts.player.exit")}
            colorTheme="red"
            hasIcon={false}
            size="md"
          />
        </div>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left side: Passage/Audio/Image */}
        <div className="bg-white p-6 rounded-lg shadow-sm h-full max-h-[60vh] overflow-y-auto">
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
        <div className="bg-white p-6 rounded-lg shadow-sm h-full max-h-[60vh] overflow-y-auto">
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
      <div className="mx-2 py-4 border-t border-gray-200 flex justify-between items-center">
        <div className="flex flex-row gap-1">
          <ActionButton
            onClick={() =>
              setCurrentSectionIndex((prev) => Math.max(0, prev - 1))
            }
            disabled={currentSectionIndex === 0}
            text={t("ielts.player.previousSection")}
            size="sm"
            className="mr-2"
            colorTheme="white"
            hasIcon={false}
            textColor="black"
          />
          <ActionButton
            onClick={() =>
              setCurrentSectionIndex((prev) =>
                Math.min((currentTest.sections?.length || 1) - 1, prev + 1)
              )
            }
            disabled={
              currentSectionIndex === (currentTest.sections?.length || 1) - 1
            }
            text={t("ielts.player.nextSection")}
            colorTheme="white"
            hasIcon={false}
            textColor="black"
            size="sm"
          />
        </div>

        <ActionButton
          onClick={() => handleSubmit(false)}
          text={t("ielts.player.submit")}
          hasIcon={false}
          size="md"
        />
      </div>
    </div>
  );
};

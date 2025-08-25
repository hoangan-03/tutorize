import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  useIeltsTestWithAnswers,
  useIeltsTestManagement,
  useIeltsSectionManagement,
  useIeltsQuestionManagement,
} from "../hooks";
import {
  IeltsReadingTest,
  IeltsSection,
  IeltsQuestion,
  IeltsLevel,
  IeltsQuestionType,
} from "../types/api";
import { IeltsSectionManager } from "./IeltsSectionManager";
import { IeltsSectionModal } from "./IeltsSectionModal";
import { IeltsQuestionModal } from "./IeltsQuestionModal";
import { ArrowLeft } from "lucide-react";

interface IeltsTestFormProps {
  onBack: () => void;
  testId?: number | null;
}

export const IeltsTestForm: React.FC<IeltsTestFormProps> = ({
  onBack,
  testId,
}) => {
  const { t } = useTranslation();
  const {
    test: fetchedTest,
    isLoading: loading,
    error: fetchError,
  } = useIeltsTestWithAnswers(testId || null);
  const { createTest, updateTest } = useIeltsTestManagement();
  const { createSection, updateSection, removeSection } =
    useIeltsSectionManagement();
  const { createQuestion, updateQuestion, removeQuestion } =
    useIeltsQuestionManagement();

  const [test, setTest] = useState<Partial<IeltsReadingTest>>({
    title: "",
    description: "",
    level: IeltsLevel.INTERMEDIATE,
    timeLimit: 60,
    instructions: "",
    sections: [],
  });
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentSection, setCurrentSection] =
    useState<Partial<IeltsSection> | null>(null);

  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [currentQuestion, setCurrentQuestion] =
    useState<Partial<IeltsQuestion> | null>(null);
  const [currentSectionIdForNewQuestion, setCurrentSectionIdForNewQuestion] =
    useState<number | null>(null);

  // Update local state when fetched test changes
  React.useEffect(() => {
    if (fetchedTest) {
      setTest(fetchedTest);
    }
  }, [fetchedTest]);

  // Update error state
  React.useEffect(() => {
    setError(fetchError ? t("ielts.form.error.load") : null);
  }, [fetchError, t]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setTest((prev) => ({ ...prev, [name]: value }));
  };

  const handleNumericInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTest((prev) => ({ ...prev, [name]: parseInt(value, 10) || 0 }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      if (testId) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { sections, ...updateData } = test;
        await updateTest(testId, updateData);
      } else {
        await createTest(test);
      }
      onBack();
    } catch (err) {
      console.error(err);
      setError(t("ielts.form.error.save"));
    }
  };

  // Section Handlers
  const handleAddSection = () => {
    setCurrentSection({
      title: "",
      order: (test.sections?.length || 0) + 1,
      timeLimit: 30, // Default 30 minutes
      instructions: "",
      passageText: "",
      audioUrl: "",
      imageUrl: "",
    });
    setIsModalOpen(true);
  };

  const handleEditSection = (section: IeltsSection) => {
    setCurrentSection(section);
    setIsModalOpen(true);
  };

  const handleDeleteSection = async (sectionId: number) => {
    if (window.confirm(t("ielts.form.confirmDeleteSection"))) {
      try {
        await removeSection(sectionId);
      } catch (err) {
        console.error("Failed to delete section", err);
        setError(t("ielts.form.error.deleteSection"));
      }
    }
  };

  const handleSaveSection = async (sectionData: Partial<IeltsSection>) => {
    if (!testId) return;
    try {
      if (sectionData.id) {
        await updateSection(sectionData.id, sectionData);
      } else {
        await createSection(testId, sectionData);
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error("Failed to save section", err);
      setError(t("ielts.form.error.saveSection"));
    }
  };

  // Question Handlers
  const handleAddQuestion = (sectionId: number) => {
    setCurrentSectionIdForNewQuestion(sectionId);
    setCurrentQuestion({
      question: "",
      type: IeltsQuestionType.MULTIPLE_CHOICE,
      points: 1,
      order:
        (test.sections?.find((s) => s.id === sectionId)?.questions?.length ||
          0) + 1,
      options: [],
      correctAnswers: [],
      subQuestions: [],
      imageUrl: "",
      explanation: "",
    });
    setIsQuestionModalOpen(true);
  };

  const handleEditQuestion = (question: IeltsQuestion) => {
    setCurrentSectionIdForNewQuestion(null);
    setCurrentQuestion(question);
    setIsQuestionModalOpen(true);
  };

  const handleDeleteQuestion = async (questionId: number) => {
    if (window.confirm(t("ielts.form.confirmDeleteQuestion"))) {
      try {
        await removeQuestion(questionId);
      } catch (err) {
        console.error("Failed to delete question", err);
        setError(t("ielts.form.error.deleteQuestion"));
      }
    }
  };

  const handleSaveQuestion = async (questionData: Partial<IeltsQuestion>) => {
    try {
      if (questionData.id) {
        await updateQuestion(questionData.id, questionData);
      } else if (currentSectionIdForNewQuestion) {
        await createQuestion(currentSectionIdForNewQuestion, questionData);
      }
      setIsQuestionModalOpen(false);
    } catch (err) {
      console.error("Failed to save question", err);
      setError(t("ielts.form.error.saveQuestion"));
    }
  };

  if (loading && testId) {
    return <div>{t("ielts.form.loading")}</div>;
  }

  const inputClass =
    "mt-1 block w-full rounded-lg border-gray-200 bg-gray-50 px-3 py-2 text-gray-800 shadow-sm transition-colors focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm";

  return (
    <>
      <div className="bg-gray-50 min-h-screen">
        <form id="test-form" onSubmit={handleSubmit}>
          {/* Header */}
          <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-20">
                <div className="flex items-center space-x-4">
                  <button
                    type="button"
                    onClick={onBack}
                    className="p-2 rounded-full hover:bg-gray-200 transition-colors"
                    aria-label={t("ielts.form.backLabel")}
                  >
                    <ArrowLeft className="h-5 w-5 text-gray-600" />
                  </button>
                  <div>
                    <h1 className="text-xl font-bold text-gray-900">
                      {testId
                        ? t("ielts.form.editTitle")
                        : t("ielts.form.createTitle")}
                    </h1>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    type="button"
                    onClick={onBack}
                    className="px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    {t("ielts.form.cancel")}
                  </button>
                  <button
                    type="submit"
                    form="test-form"
                    disabled={loading}
                    className="px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {loading ? t("ielts.form.saving") : t("ielts.form.save")}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            {error && (
              <div className="mb-6 rounded-md bg-red-50 p-4">
                <p className="text-sm font-medium text-red-800">{error}</p>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              {/* Left Column */}
              <div className="lg:col-span-2 space-y-8">
                {/* Test Details Card */}
                <div className="bg-white shadow-lg border border-gray-100 rounded-xl">
                  <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-lg font-semibold leading-6 text-gray-900 mb-6">
                      {t("ielts.form.generalInfo")}
                    </h3>
                    <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                      <div className="sm:col-span-6">
                        <label
                          htmlFor="title"
                          className="block text-sm font-medium text-gray-700"
                        >
                          {t("ielts.form.title")}
                        </label>
                        <input
                          type="text"
                          name="title"
                          id="title"
                          value={test.title || ""}
                          onChange={handleInputChange}
                          className={inputClass}
                          required
                        />
                      </div>

                      <div className="sm:col-span-6">
                        <label
                          htmlFor="description"
                          className="block text-sm font-medium text-gray-700"
                        >
                          {t("ielts.form.description")}
                        </label>
                        <textarea
                          name="description"
                          id="description"
                          rows={4}
                          value={test.description || ""}
                          onChange={handleInputChange}
                          className={inputClass}
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label
                          htmlFor="skill"
                          className="block text-sm font-medium text-gray-700"
                        >
                          {t("ielts.form.skill")}
                        </label>
                      </div>

                      <div className="sm:col-span-2">
                        <label
                          htmlFor="level"
                          className="block text-sm font-medium text-gray-700"
                        >
                          {t("ielts.form.level")}
                        </label>
                        <select
                          id="level"
                          name="level"
                          value={test.level || "INTERMEDIATE"}
                          onChange={handleInputChange}
                          className={inputClass}
                        >
                          <option value="BEGINNER">
                            {t("ielts.level.beginner")}
                          </option>
                          <option value="INTERMEDIATE">
                            {t("ielts.level.intermediate")}
                          </option>
                          <option value="ADVANCED">
                            {t("ielts.level.advanced")}
                          </option>
                        </select>
                      </div>

                      <div className="sm:col-span-2">
                        <label
                          htmlFor="timeLimit"
                          className="block text-sm font-medium text-gray-700"
                        >
                          {t("ielts.form.timeLimit")}
                        </label>
                        <input
                          type="number"
                          name="timeLimit"
                          id="timeLimit"
                          value={test.timeLimit || 60}
                          onChange={handleNumericInputChange}
                          className={inputClass}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sections Manager - only for edit mode */}
                {testId && (
                  <div className="bg-white shadow-lg border border-gray-100 rounded-xl">
                    <div className="px-4 py-5 sm:p-6">
                      <IeltsSectionManager
                        sections={test.sections || []}
                        onAddSection={handleAddSection}
                        onEditSection={handleEditSection}
                        onDeleteSection={handleDeleteSection}
                        onAddQuestion={handleAddQuestion}
                        onEditQuestion={handleEditQuestion}
                        onDeleteQuestion={handleDeleteQuestion}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column - Instructions/Guide */}
              <div className="lg:col-span-1 space-y-6">
                <div className="bg-white shadow-lg border border-gray-100 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    {t("ielts.form.guidanceTitle")}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {t("ielts.form.guidanceText")}
                  </p>
                </div>
                <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-indigo-900 mb-3">
                    {t("ielts.form.tipTitle")}
                  </h3>
                  <p className="text-sm text-indigo-700">
                    {t("ielts.form.tipText")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>

      {isModalOpen && currentSection && (
        <IeltsSectionModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveSection}
          section={currentSection}
        />
      )}

      {isQuestionModalOpen && currentQuestion && (
        <IeltsQuestionModal
          isOpen={isQuestionModalOpen}
          onClose={() => setIsQuestionModalOpen(false)}
          onSave={handleSaveQuestion}
          question={currentQuestion}
        />
      )}
    </>
  );
};

import React, { useState, useEffect, useCallback } from "react";
import { ieltsService } from "../../services/ieltsService";
import type {
  IeltsTest,
  IeltsSkill,
  IeltsLevel,
  IeltsSection,
  IeltsQuestion,
} from "../../services/ieltsService";
import { IeltsSectionManager } from "./IeltsSectionManager";
import { IeltsSectionModal } from "./IeltsSectionModal";
import { IeltsQuestionModal } from "./IeltsQuestionModal";

interface IeltsTestFormProps {
  onBack: () => void;
  testId?: number | null;
}

export const IeltsTestForm: React.FC<IeltsTestFormProps> = ({
  onBack,
  testId,
}) => {
  const [test, setTest] = useState<Partial<IeltsTest>>({
    title: "",
    description: "",
    skill: "READING",
    level: "INTERMEDIATE",
    timeLimit: 60,
    instructions: "",
    sections: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentSection, setCurrentSection] =
    useState<Partial<IeltsSection> | null>(null);

  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [currentQuestion, setCurrentQuestion] =
    useState<Partial<IeltsQuestion> | null>(null);
  const [currentSectionIdForNewQuestion, setCurrentSectionIdForNewQuestion] =
    useState<number | null>(null);

  const fetchTest = useCallback(async () => {
    if (!testId) return;
    setLoading(true);
    try {
      const data = await ieltsService.getTestWithAnswers(testId);
      setTest(data);
    } catch (err) {
      console.error(err);
      setError("Không thể tải dữ liệu bài test.");
    } finally {
      setLoading(false);
    }
  }, [testId]);

  useEffect(() => {
    fetchTest();
  }, [fetchTest]);

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
    setLoading(true);
    setError(null);
    try {
      if (testId) {
        const { sections, ...updateData } = test;
        await ieltsService.updateTest(testId, updateData);
      } else {
        await ieltsService.createTest(test);
      }
      onBack();
    } catch (err) {
      console.error(err);
      setError("Không thể lưu bài test.");
    } finally {
      setLoading(false);
    }
  };

  // Section Handlers
  const handleAddSection = () => {
    setCurrentSection({ title: "", order: (test.sections?.length || 0) + 1 });
    setIsModalOpen(true);
  };

  const handleEditSection = (section: IeltsSection) => {
    setCurrentSection(section);
    setIsModalOpen(true);
  };

  const handleDeleteSection = async (sectionId: number) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa phần này không?")) {
      try {
        await ieltsService.removeSection(sectionId);
        fetchTest(); // Refresh
      } catch (err) {
        console.error("Failed to delete section", err);
        setError("Không thể xóa phần thi.");
      }
    }
  };

  const handleSaveSection = async (sectionData: Partial<IeltsSection>) => {
    if (!testId) return;
    try {
      if (sectionData.id) {
        await ieltsService.updateSection(sectionData.id, sectionData);
      } else {
        await ieltsService.createSection(testId, sectionData);
      }
      fetchTest(); // Refresh
      setIsModalOpen(false);
    } catch (err) {
      console.error("Failed to save section", err);
      setError("Không thể lưu phần thi.");
    }
  };

  // Question Handlers
  const handleAddQuestion = (sectionId: number) => {
    setCurrentSectionIdForNewQuestion(sectionId);
    setCurrentQuestion({
      question: "",
      type: "MULTIPLE_CHOICE",
      points: 1,
      order:
        (test.sections?.find((s) => s.id === sectionId)?.questions?.length ||
          0) + 1,
    });
    setIsQuestionModalOpen(true);
  };

  const handleEditQuestion = (question: IeltsQuestion) => {
    setCurrentSectionIdForNewQuestion(null);
    setCurrentQuestion(question);
    setIsQuestionModalOpen(true);
  };

  const handleDeleteQuestion = async (questionId: number) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa câu hỏi này không?")) {
      try {
        await ieltsService.removeQuestion(questionId);
        fetchTest(); // Refresh
      } catch (err) {
        console.error("Failed to delete question", err);
        setError("Không thể xóa câu hỏi.");
      }
    }
  };

  const handleSaveQuestion = async (questionData: Partial<IeltsQuestion>) => {
    try {
      if (questionData.id) {
        await ieltsService.updateQuestion(questionData.id, questionData);
      } else if (currentSectionIdForNewQuestion) {
        await ieltsService.createQuestion(
          currentSectionIdForNewQuestion,
          questionData
        );
      }
      fetchTest(); // Refresh
      setIsQuestionModalOpen(false);
    } catch (err) {
      console.error("Failed to save question", err);
      setError("Không thể lưu câu hỏi.");
    }
  };

  if (loading && testId) {
    return <div>Đang tải...</div>;
  }

  return (
    <>
      <div className="bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="md:flex md:items-center md:justify-between pb-6 border-b border-gray-200">
            <div className="flex-1 min-w-0">
              <h1 className="text-3xl font-bold leading-tight text-gray-900">
                {testId ? "Chỉnh sửa bài test IELTS" : "Tạo bài test IELTS mới"}
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Điền các thông tin chi tiết cho bài test.
              </p>
            </div>
            <div className="mt-4 flex md:mt-0 md:ml-4">
              <button
                type="button"
                onClick={onBack}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Quay lại
              </button>
              <button
                type="submit"
                form="test-form"
                disabled={loading}
                className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
              >
                {loading ? "Đang lưu..." : testId ? "Cập nhật" : "Lưu bài test"}
              </button>
            </div>
          </div>

          {error && (
            <div className="mt-4 rounded-md bg-red-50 p-4">
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
          )}

          {/* Form Content */}
          <div className="mt-8">
            <form id="test-form" onSubmit={handleSubmit} className="space-y-8">
              {/* Test Details Card */}
              <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg font-medium leading-6 text-gray-900">
                    Thông tin chung
                  </h3>
                  <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                    <div className="sm:col-span-6">
                      <label
                        htmlFor="title"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Tiêu đề
                      </label>
                      <input
                        type="text"
                        name="title"
                        id="title"
                        value={test.title || ""}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm"
                        required
                      />
                    </div>

                    <div className="sm:col-span-6">
                      <label
                        htmlFor="description"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Mô tả
                      </label>
                      <textarea
                        name="description"
                        id="description"
                        rows={3}
                        value={test.description || ""}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label
                        htmlFor="skill"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Kỹ năng
                      </label>
                      <select
                        id="skill"
                        name="skill"
                        value={test.skill || "READING"}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm"
                      >
                        <option value="READING">Reading</option>
                        <option value="LISTENING">Listening</option>
                        <option value="WRITING">Writing</option>
                        <option value="SPEAKING">Speaking</option>
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label
                        htmlFor="level"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Cấp độ
                      </label>
                      <select
                        id="level"
                        name="level"
                        value={test.level || "INTERMEDIATE"}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm"
                      >
                        <option value="BEGINNER">Beginner</option>
                        <option value="INTERMEDIATE">Intermediate</option>
                        <option value="ADVANCED">Advanced</option>
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label
                        htmlFor="timeLimit"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Thời gian (phút)
                      </label>
                      <input
                        type="number"
                        name="timeLimit"
                        id="timeLimit"
                        value={test.timeLimit || 60}
                        onChange={handleNumericInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Sections Manager */}
              {testId && (
                <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
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
            </form>
          </div>
        </div>
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
          sectionId={currentSectionIdForNewQuestion}
        />
      )}
    </>
  );
};

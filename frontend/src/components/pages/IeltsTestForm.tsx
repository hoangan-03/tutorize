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
import { ArrowLeft } from "lucide-react";

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
                    aria-label="Quay lại"
                  >
                    <ArrowLeft className="h-5 w-5 text-gray-600" />
                  </button>
                  <div>
                    <h1 className="text-xl font-bold text-gray-900">
                      {testId
                        ? "Chỉnh sửa bài test IELTS"
                        : "Tạo bài test IELTS mới"}
                    </h1>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    type="button"
                    onClick={onBack}
                    className="px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    form="test-form"
                    disabled={loading}
                    className="px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {loading ? "Đang lưu..." : "Lưu thay đổi"}
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
                      Thông tin chung
                    </h3>
                    <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
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
                          className={inputClass}
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
                          Kỹ năng
                        </label>
                        <select
                          id="skill"
                          name="skill"
                          value={test.skill || "READING"}
                          onChange={handleInputChange}
                          className={inputClass}
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
                          className={inputClass}
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
                    Hướng dẫn
                  </h3>
                  <p className="text-sm text-gray-600">
                    Điền đầy đủ thông tin cho bài test. Nếu là bài test mới, hãy
                    lưu lại để có thể thêm các phần và câu hỏi.
                  </p>
                </div>
                <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-indigo-900 mb-3">
                    Mẹo
                  </h3>
                  <p className="text-sm text-indigo-700">
                    Sử dụng các loại câu hỏi đa dạng để bài test hấp dẫn hơn.
                    Đừng quên đặt giới hạn thời gian hợp lý cho từng phần.
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
          sectionId={currentSectionIdForNewQuestion}
        />
      )}
    </>
  );
};

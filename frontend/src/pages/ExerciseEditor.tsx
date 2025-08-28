/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Eye,
  Calendar,
  Users,
  BookOpen,
  FileText,
  BookCheck,
  Edit,
  Trash2,
  UserCheck,
  Play,
  Pause,
  Plus,
  CheckCircle,
} from "lucide-react";

import "katex/dist/katex.min.css";
import { ExerciseForm } from "./ExerciseForm";
import { ExercisePreview } from "./ExercisePreview";
import { ExerciseListStudentView } from "./ExerciseListStudentView";
import { TeacherSubmissionsView } from "./TeacherSubmissionsView";
import { ExerciseDashboard } from "./ExerciseDashboard";
import { useAuth } from "../contexts/AuthContext";
import { useTranslation } from "react-i18next";
import { useExercises, useExerciseManagement } from "../hooks";
import { Exercise, Subject, ExerciseStatus } from "../types/api";
import { Badge } from "../components/ui";
import { formatDate, getDefaultDeadline } from "../components/utils";

export const ExerciseEditor: React.FC = () => {
  const { isTeacher, user } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { exercises, isLoading } = useExercises();
  const {
    createExercise,
    updateExercise,
    deleteExercise,
    publishExercise,
    closeExercise,
    uploadFile,
  } = useExerciseManagement();

  // All hooks must be called before any early returns
  const [currentView, setCurrentView] = useState<
    "list" | "create" | "edit" | "preview" | "submissions" | "dashboard"
  >("list");
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(
    null
  );

  // Form state with correct types
  const [formData, setFormData] = useState<Exercise>({
    id: 0,
    name: "Sample Exercise",
    subject: Subject.MATH,
    grade: 6,
    deadline: getDefaultDeadline(),
    note: "Sample note",
    content: "Sample content",
    createdBy: user?.id || 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    submissions: 0,
    status: ExerciseStatus.ACTIVE,
    maxScore: 100,
    allowLateSubmission: false,
    isPublic: true,
  });
  const teacherStats = useMemo(() => {
    return {
      totalExercises: exercises.length,
      activeExercises: exercises.filter(
        (ex) => ex.status === ExerciseStatus.ACTIVE
      ).length,
      draftExercises: exercises.filter(
        (ex) => ex.status === ExerciseStatus.DRAFT
      ).length,
      totalSubmissions: exercises.reduce(
        (sum, ex) => sum + (ex.submissions || 0),
        0
      ),
    };
  }, [exercises]);

  if (!isTeacher) {
    return <ExerciseListStudentView />;
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleExerciseUpdate = (updatedExercise: Exercise) => {
    setFormData(updatedExercise);
    setSelectedExercise(updatedExercise);
  };

  const handleEdit = (exercise: Exercise) => {
    setSelectedExercise(exercise);
    // Convert ISO date to datetime-local format for form input
    const formattedExercise = {
      ...exercise,
      deadline: exercise.deadline
        ? new Date(exercise.deadline).toISOString().slice(0, 16)
        : "",
    };
    setFormData(formattedExercise);
    setCurrentView("edit");
  };

  const handleDelete = async (exercise: Exercise) => {
    if (confirm("Bạn có chắc chắn muốn xóa bài tập này?")) {
      try {
        await deleteExercise(exercise.id!);
        // Clear selected exercise if it was the one being deleted
        if (selectedExercise?.id === exercise.id) {
          setSelectedExercise(null);
          setCurrentView("list");
        }
      } catch (error) {
        console.error("Error deleting exercise:", error);
      }
    }
  };

  const handleToggleStatus = async (exercise: Exercise) => {
    try {
      const newStatus =
        exercise.status === ExerciseStatus.ACTIVE
          ? ExerciseStatus.INACTIVE
          : ExerciseStatus.ACTIVE;
      if (newStatus === ExerciseStatus.ACTIVE) {
        await publishExercise(exercise.id!);
      } else {
        await closeExercise(exercise.id!);
      }
    } catch (error) {
      console.error("Error updating exercise status:", error);
    }
  };

  const handlePreview = (exercise: Exercise) => {
    setSelectedExercise(exercise);
    setFormData(exercise);
    setCurrentView("preview");
  };

  // const handleViewDashboard = (exercise: Exercise) => {
  //   setSelectedExercise(exercise);
  //   setCurrentView("dashboard");
  // };

  const handleFormToggleStatus = async () => {
    if (selectedExercise) {
      try {
        const newStatus =
          selectedExercise.status === ExerciseStatus.ACTIVE
            ? ExerciseStatus.INACTIVE
            : ExerciseStatus.ACTIVE;

        let updatedExercise;
        if (newStatus === ExerciseStatus.ACTIVE) {
          updatedExercise = await publishExercise(selectedExercise.id!);
        } else {
          updatedExercise = await closeExercise(selectedExercise.id!);
        }

        // Update local state to reflect the new status
        setSelectedExercise(updatedExercise);
        setFormData((prev) => ({
          ...prev,
          status: newStatus,
        }));
      } catch (error) {
        console.error("Error updating exercise status:", error);
      }
    }
  };

  const handleCreateExercise = async (selectedFile?: File) => {
    try {
      const exerciseData = {
        name: formData.name,
        subject: formData.subject,
        grade: formData.grade,
        deadline: formData.deadline
          ? new Date(formData.deadline).toISOString()
          : undefined,
        note: formData.note,
        content: formData.content,
        latexContent: formData.latexContent,
        status: formData.status,
      };

      const createdExercise = await createExercise(exerciseData);
      if (selectedFile && createdExercise) {
        try {
          await uploadFile(createdExercise.id, selectedFile);
        } catch (uploadError) {
          console.error("Error uploading file:", uploadError);
        }
      }

      setCurrentView("list");
      resetForm();
    } catch (error) {
      console.error("Error creating exercise:", error);
    }
  };

  const handleEditExercise = async () => {
    try {
      if (!selectedExercise) return;

      // Only include fields that are allowed in UpdateExerciseDto
      const exerciseData = {
        name: formData.name,
        subject: formData.subject,
        grade: formData.grade,
        deadline: formData.deadline
          ? new Date(formData.deadline).toISOString()
          : undefined,
        note: formData.note,
        content: formData.content,
        latexContent: formData.latexContent,
        status: formData.status,
      };

      await updateExercise(selectedExercise.id!, exerciseData);
      setCurrentView("list");
    } catch (error) {
      console.error("Error updating exercise:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      id: 0,
      name: "Sample Exercise",
      subject: Subject.MATH,
      grade: 6,
      deadline: getDefaultDeadline(),
      note: "Sample note",
      content: "Sample content",
      createdBy: user?.id || 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      submissions: 0,
      status: ExerciseStatus.ACTIVE,
      maxScore: 100,
      allowLateSubmission: false,
      isPublic: true,
    });
    setSelectedExercise(null);
  };

  // Create/Edit View
  if (currentView === "create" || currentView === "edit") {
    return (
      <div className="p-18">
        <ExerciseForm
          formData={formData as any}
          onInputChange={handleInputChange}
          onToggleStatus={handleFormToggleStatus}
          onSave={
            currentView === "create" ? handleCreateExercise : handleEditExercise
          }
          onCancel={() => setCurrentView("list")}
          isEdit={currentView === "edit"}
          onExerciseUpdate={handleExerciseUpdate}
        />
      </div>
    );
  }

  // Preview View
  if (currentView === "preview") {
    return (
      <div className="p-18">
        <ExercisePreview
          exercise={formData as any}
          onBack={() => setCurrentView("list")}
          onEdit={() => setCurrentView("edit")}
          isReadOnly={false}
        />
      </div>
    );
  }

  // Submissions View
  if (currentView === "submissions" && selectedExercise) {
    return (
      <TeacherSubmissionsView
        exercise={selectedExercise}
        onBack={() => setCurrentView("list")}
      />
    );
  }

  // Dashboard View
  if (currentView === "dashboard" && selectedExercise) {
    return (
      <ExerciseDashboard
        exercise={selectedExercise}
        onBack={() => setCurrentView("list")}
      />
    );
  }

  // Main List View - Teacher with card layout like student view
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Header Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 mb-8 shadow-xl">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-base md:text-xl lg:text-3xl font-bold text-white">
                    Quản lý bài tập
                  </h1>
                </div>
              </div>
              <p className="text-white/90 text-lg leading-relaxed max-w-3xl text-start">
                Tạo và quản lý bài tập cho học sinh.
              </p>
            </div>

            <div className="flex flex-col items-end space-y-3">
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    resetForm();
                    setCurrentView("create");
                  }}
                  className="flex items-center px-6 py-3 bg-white text-blue-600 rounded-xl hover:bg-gray-50 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  <span>Tạo bài tập mới</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-start">
              <div className="p-3 bg-purple-100 rounded-xl">
                <BookOpen className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4 flex flex-col items-start">
                {" "}
                <p className="text-sm font-medium text-gray-600">
                  Tổng bài tập
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {teacherStats.totalExercises}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-start">
              <div className="p-3 bg-green-100 rounded-xl">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4 flex flex-col items-start">
                {" "}
                <p className="text-sm font-medium text-gray-600">Đang mở</p>
                <p className="text-2xl font-bold text-gray-900">
                  {teacherStats.activeExercises}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-start">
              <div className="p-3 bg-yellow-100 rounded-xl">
                <FileText className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4 flex flex-col items-start">
                <p className="text-sm font-medium text-gray-600">Bản nháp</p>
                <p className="text-2xl font-bold text-gray-900">
                  {teacherStats.draftExercises}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-start">
              <div className="p-3 bg-blue-100 rounded-xl">
                <UserCheck className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4 flex flex-col items-start">
                <p className="text-sm font-medium text-gray-600">Bài nộp</p>
                <p className="text-2xl font-bold text-gray-900">
                  {teacherStats.totalSubmissions}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Exercise List */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {isLoading ? (
            <div className="flex justify-center items-center py-16">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
            </div>
          ) : exercises.length === 0 ? (
            <div className="text-center py-16">
              <BookOpen className="h-20 w-20 text-gray-300 mx-auto mb-6" />
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Chưa có bài tập nào
              </h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Tạo bài tập đầu tiên để bắt đầu quản lý bài tập cho học sinh.
              </p>
              <button
                onClick={() => setCurrentView("create")}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-semibold"
              >
                Tạo bài tập mới
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {exercises.map((exercise: Exercise) => (
                <div
                  key={exercise.id}
                  className="p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <h3 className="text-xl font-semibold text-gray-900">
                          {exercise.name}
                        </h3>
                        <Badge
                          variant="status"
                          className={`${
                            exercise.status === ExerciseStatus.ACTIVE
                              ? "bg-green-100 text-green-800"
                              : exercise.status === ExerciseStatus.DRAFT
                              ? "bg-yellow-100 text-yellow-800"
                              : exercise.status === ExerciseStatus.INACTIVE
                              ? "bg-gray-100 text-gray-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {exercise.status === ExerciseStatus.ACTIVE
                            ? t("status.active")
                            : exercise.status === ExerciseStatus.DRAFT
                            ? t("status.draft")
                            : exercise.status === ExerciseStatus.INACTIVE
                            ? "Đã ngừng"
                            : t("status.inactive")}
                        </Badge>
                        <Badge variant="subject">
                          {t(`subjects.${exercise.subject.toLowerCase()}`)}
                        </Badge>
                        <Badge variant="grade">
                          {t("exercises.class")} {exercise.grade}
                        </Badge>
                      </div>

                      <p className="text-gray-600 mb-4 text-sm leading-relaxed text-start">
                        {exercise.note}
                      </p>

                      <div className="flex items-center space-x-6 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2" />
                          {formatDate(exercise.deadline)}
                        </div>
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-2" />
                          {exercise.submissions || 0} bài nộp
                        </div>
                        <div className="flex items-center">
                          <BookCheck className="h-4 w-4 mr-2" />
                          Điểm tối đa: {exercise.maxScore}
                        </div>
                        <div className="flex items-center">
                          <FileText className="h-4 w-4 mr-2" />
                          {exercise.creator?.profile?.firstName || "Bạn"}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {/* <button
                        onClick={() => handleViewDashboard(exercise)}
                        className="p-3 text-purple-600 hover:bg-purple-50 rounded-xl transition-colors"
                        title="Xem thống kê"
                      >
                        <BarChart3 className="h-5 w-5" />
                      </button> */}
                      <button
                        onClick={() => navigate("/exercises/submissions")}
                        className="p-3 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors"
                        title="Xem bài nộp"
                      >
                        <UserCheck className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handlePreview(exercise)}
                        className="p-3 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                        title="Xem trước"
                      >
                        <Eye className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleEdit(exercise)}
                        className="p-3 text-gray-600 hover:bg-gray-50 rounded-xl transition-colors"
                        title="Chỉnh sửa"
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleToggleStatus(exercise)}
                        className={`p-3 rounded-xl transition-colors ${
                          exercise.status === "ACTIVE"
                            ? "text-orange-600 hover:bg-orange-50"
                            : "text-green-600 hover:bg-green-50"
                        }`}
                        title={
                          exercise.status === "ACTIVE" ? "Lưu trữ" : "Kích hoạt"
                        }
                      >
                        {exercise.status === "ACTIVE" ? (
                          <Pause className="h-5 w-5" />
                        ) : (
                          <Play className="h-5 w-5" />
                        )}
                      </button>
                      <button
                        onClick={() => handleDelete(exercise)}
                        className="p-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                        title="Xóa"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

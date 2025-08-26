import React from "react";
import { Plus, Eye, Edit, Trash2, Calendar, Users } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Badge } from "../components/ui";
import { Exercise, ExerciseStatus } from "../types/api";
import { formatDate } from "../components/utils";

interface ExerciseListProps {
  exercises: Exercise[];
  onEdit: (exercise: Exercise) => void;
  onPreview: (exercise: Exercise) => void;
  onDelete: (id: number) => void;
  onCreateNew: () => void;
}

export const ExerciseList: React.FC<ExerciseListProps> = ({
  exercises,
  onEdit,
  onPreview,
  onDelete,
  onCreateNew,
}) => {
  const { t } = useTranslation();
  return (
    <div className="max-w-8xl mx-auto">
      {/* Enhanced Header Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-8 mb-8 border border-blue-100">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                <Edit className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-base md:text-xl lg:text-3xl font-bold text-gray-900">
                  {t("exerciseEditorUI.title")}
                </h1>
              </div>
            </div>
            <p className="text-gray-600 text-lg leading-relaxed max-w-2xl">
              {t("exerciseEditorUI.description")}
            </p>
            <div className="flex items-center space-x-6 mt-4 text-sm text-gray-500">
              <div className="flex items-center space-x-1">
                <Users className="h-4 w-4" />
                <span>
                  {t("exerciseEditorUI.exerciseCount", {
                    count: exercises.length,
                  })}
                </span>
              </div>
              <div className="flex items-center space-x-1">
                <Calendar className="h-4 w-4" />
                <span>
                  {t("exerciseEditorUI.lastUpdated", {
                    date: new Date().toLocaleDateString("vi-VN"),
                  })}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end space-y-3">
            <button
              onClick={onCreateNew}
              className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg transform hover:scale-105"
            >
              <Plus className="h-5 w-5 mr-2" />
              <span className="font-medium">
                {t("exerciseEditorUI.createNew")}
              </span>
            </button>
            <p className="text-xs text-gray-500 text-right">
              {t("exerciseEditorUI.createButtonHint")}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {exercises.map((exercise) => (
          <div
            key={exercise.id}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {exercise.name}
                </h3>
                <div className="flex items-center space-x-4 text-sm text-gray-500 mb-2">
                  <Badge variant="grade" className="px-2 py-1 text-sm">
                    {t("exerciseEditorUI.grade", { grade: exercise.grade })}
                  </Badge>
                  <Badge variant="subject" className="px-2 py-1 text-sm">
                    {exercise.subject}
                  </Badge>
                </div>
                <div className="flex items-center text-sm text-gray-500 mb-2">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>
                    {t("exerciseEditorUI.deadline", {
                      date: formatDate(exercise.deadline),
                    })}
                  </span>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <Users className="h-4 w-4 mr-1" />
                  <span>
                    {t("exerciseEditorUI.submissions", {
                      count: exercise.submissions,
                    })}
                  </span>
                </div>
              </div>
              <Badge
                variant="status"
                className={`px-2 py-1 text-xs ${
                  exercise.status === ExerciseStatus.ACTIVE
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {exercise.status === ExerciseStatus.ACTIVE
                  ? t("exerciseEditorUI.statusActive")
                  : t("exerciseEditorUI.statusClosed")}
              </Badge>
            </div>

            <p className="text-gray-600 text-sm mb-4 line-clamp-2">
              {exercise.note}
            </p>

            <div className="flex space-x-2">
              <button
                onClick={() => onPreview(exercise)}
                className="flex-1 flex items-center justify-center px-3 py-2 text-sm border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                <Eye className="h-4 w-4 mr-1" />
                {t("exerciseEditorUI.preview")}
              </button>
              <button
                onClick={() => onEdit(exercise)}
                className="flex-1 flex items-center justify-center px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <Edit className="h-4 w-4 mr-1" />
                {t("exerciseEditorUI.edit")}
              </button>
              <button
                onClick={() => onDelete(exercise.id!)}
                className="flex items-center justify-center px-3 py-2 text-sm border border-red-300 text-red-600 rounded-md hover:bg-red-50"
                title={t("exerciseEditorUI.deleteTitle")}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

import React from "react";
import { useTranslation } from "react-i18next";
import {
  BookOpen,
  Book,
  Headphones,
  PenSquare,
  Mic,
  Clock,
  Calendar,
  BarChart3,
  Edit,
  Trash2,
} from "lucide-react";
import { StatCard } from "../ui";
import {
  IeltsTest,
  WritingTask,
  WritingType,
  IeltsSubmission,
} from "../../types/api";
import { getLevelInfo, getSkillInfo } from "../utils";

// Stats Cards Component for Teacher View
interface IeltsStatsProps {
  stats: {
    total: number;
    reading: number;
    listening: number;
    writing: number;
    speaking: number;
    writingTasks: number;
  };
}

export const IeltsStatsCards: React.FC<IeltsStatsProps> = ({ stats }) => {
  const { t } = useTranslation();

  const statCardConfigs = [
    {
      icon: <BookOpen className="h-6 w-6 text-indigo-600" />,
      bgColor: "bg-indigo-100",
      label: t("ielts.teacher.totalTests"),
      value: stats.total,
    },
    {
      icon: <Book className="h-6 w-6 text-blue-600" />,
      bgColor: "bg-blue-100",
      label: t("ielts.teacher.readingTests"),
      value: stats.reading,
    },
    {
      icon: <Headphones className="h-6 w-6 text-purple-600" />,
      bgColor: "bg-purple-100",
      label: t("ielts.teacher.listeningTests"),
      value: stats.listening,
    },
    {
      icon: <PenSquare className="h-6 w-6 text-orange-600" />,
      bgColor: "bg-orange-100",
      label: t("ielts.teacher.writingTests"),
      value: stats.writing,
    },
    {
      icon: <PenSquare className="h-6 w-6 text-green-600" />,
      bgColor: "bg-green-100",
      label: t("ielts.writingTasks.statsLabel"),
      value: stats.writingTasks,
    },
    {
      icon: <Mic className="h-6 w-6 text-teal-600" />,
      bgColor: "bg-teal-100",
      label: t("ielts.teacher.speakingTests"),
      value: stats.speaking,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
      {statCardConfigs.map((config, index) => (
        <StatCard
          key={index}
          icon={config.icon}
          bgColor={config.bgColor}
          label={config.label}
          value={config.value}
        />
      ))}
    </div>
  );
};

// Test Card for Student View
interface IeltsTestCardProps {
  test: IeltsTest;
  highestSubmission: IeltsSubmission | null;
  onStartTest: (id: number) => void;
  onViewResult: (id: number) => void;
}

export const IeltsTestCard: React.FC<IeltsTestCardProps> = ({
  test,
  highestSubmission,
  onStartTest,
  onViewResult,
}) => {
  const { t } = useTranslation();

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 flex flex-col justify-between hover:shadow-xl transition-shadow">
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-2 text-start">
          {test.title}
        </h3>
        <p className="text-sm text-gray-600 line-clamp-3 mb-4 text-start">
          {test.description}
        </p>
      </div>
      <div>
        {highestSubmission ? (
          <div className="mb-4">
            <p className="text-sm text-gray-500">{t("ielts.highestScore")}</p>
            <p className="text-2xl font-bold text-indigo-600">
              {highestSubmission.score.toFixed(1)}
            </p>
          </div>
        ) : (
          <div className="mb-4">
            <p className="text-sm text-gray-500">{t("ielts.notTaken")}</p>
            <p className="text-2xl font-bold text-gray-400">-</p>
          </div>
        )}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onStartTest(test.id)}
            className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
          >
            {highestSubmission ? t("ielts.retake") : t("ielts.start")}
          </button>
          {highestSubmission && (
            <button
              onClick={() => onViewResult(highestSubmission.id)}
              className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50"
            >
              {t("ielts.viewResult")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Writing Task Card for Student View
interface WritingTaskCardProps {
  task: WritingTask;
  onStartTask: (task: WritingTask) => void;
}

export const WritingTaskCard: React.FC<WritingTaskCardProps> = ({
  task,
  onStartTask,
}) => {
  const { t } = useTranslation();

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 flex flex-col justify-between hover:shadow-xl transition-shadow">
      <div>
        <div className="flex items-center space-x-2 mb-2">
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold ${
              task.type === WritingType.IELTS_TASK1
                ? "bg-orange-100 text-orange-800"
                : "bg-orange-100 text-orange-800"
            }`}
          >
            Writing
          </span>
          <span
            className={`px-2 py-1 rounded-full text-xs font-semibold ${
              task.type === WritingType.IELTS_TASK1
                ? "bg-blue-100 text-blue-800"
                : "bg-purple-100 text-purple-800"
            }`}
          >
            {task.type === WritingType.IELTS_TASK1 ? "Task 1" : "Task 2"}
          </span>
          <span className="px-2 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">
            {task.level}
          </span>
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-2 text-start">
          {task.title}
        </h3>
        <div
          className="text-sm text-gray-600 line-clamp-3 mb-4 text-start prose max-w-none"
          dangerouslySetInnerHTML={{ __html: task.prompt }}
        />
      </div>
      <div>
        <div className="mb-4">
          <p className="text-sm text-gray-500">{t("ielts.notTaken")}</p>
          <p className="text-2xl font-bold text-gray-400">-</p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onStartTask(task)}
            className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
          >
            {t("ielts.writingTasks.startTask")}
          </button>
        </div>
      </div>
    </div>
  );
};

// Item Row for Teacher View (both IELTS tests and Writing tasks)
interface IeltsItemRowProps {
  item: IeltsTest | WritingTask;
  type: "test" | "task";
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
  onViewSubmissions?: () => void;
}

export const IeltsItemRow: React.FC<IeltsItemRowProps> = ({
  item,
  type,
  onEdit,
  onDelete,
  onViewSubmissions,
}) => {
  const { t } = useTranslation();

  return (
    <div className="p-6 hover:bg-gray-50 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <h4 className="text-lg font-semibold text-gray-900">
              {type === "test"
                ? (item as IeltsTest).title
                : (item as WritingTask).title}
            </h4>

            {type === "test" && (
              <>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    getSkillInfo((item as IeltsTest).skill, t).color
                  }`}
                >
                  {getSkillInfo((item as IeltsTest).skill, t).label}
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    getLevelInfo((item as IeltsTest).level, t).color
                  }`}
                >
                  {getLevelInfo((item as IeltsTest).level, t).label}
                </span>
              </>
            )}

            {type === "task" && (
              <>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    (item as WritingTask).type === WritingType.IELTS_TASK1
                      ? "bg-blue-100 text-blue-800"
                      : "bg-purple-100 text-purple-800"
                  }`}
                >
                  {(item as WritingTask).type === WritingType.IELTS_TASK1
                    ? "Task 1"
                    : "Task 2"}
                </span>
                <span className="px-2 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">
                  {(item as WritingTask).level}
                </span>
              </>
            )}
          </div>

          {type === "test" && (
            <>
              <p className="text-gray-600 mb-4 text-sm leading-relaxed text-start">
                {(item as IeltsTest).description}
              </p>
              <div className="flex items-center space-x-6 text-sm text-gray-500">
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-2" />
                  {(item as IeltsTest).timeLimit
                    ? t("ielts.teacher.minutes", {
                        count: (item as IeltsTest).timeLimit,
                      })
                    : t("ielts.teacher.unlimitedTime")}
                </div>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  {t("ielts.teacher.createdAt")}:{" "}
                  {new Date(item.createdAt).toLocaleDateString("vi-VN")}
                </div>
              </div>
            </>
          )}

          {type === "task" && (
            <>
              <div
                className="text-gray-600 text-sm line-clamp-2 prose max-w-none"
                dangerouslySetInnerHTML={{
                  __html: (item as WritingTask).prompt,
                }}
              />
              <div className="flex items-center space-x-4 text-sm text-gray-500 mt-2">
                <span>
                  Tạo: {new Date(item.createdAt).toLocaleDateString("vi-VN")}
                </span>
                <span>
                  Submissions: {(item as WritingTask).submissions?.length || 0}
                </span>
              </div>
            </>
          )}
        </div>

        <div className="flex items-center space-x-1">
          {onViewSubmissions && (
            <button
              onClick={onViewSubmissions}
              className="p-3 text-purple-600 hover:bg-purple-50 rounded-xl transition-colors"
              title={t("ielts.teacher.viewSubmissions")}
            >
              <BarChart3 className="h-5 w-5" />
            </button>
          )}
          {onEdit && (
            <button
              onClick={() => onEdit(item.id)}
              className="p-3 text-gray-600 hover:bg-gray-50 rounded-xl transition-colors"
              title={t("ielts.teacher.edit")}
            >
              <Edit className="h-5 w-5" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(item.id)}
              className="p-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
              title={t("ielts.teacher.delete")}
            >
              <Trash2 className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Empty State Component
interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
}) => {
  return (
    <div className="text-center py-12 bg-white rounded-lg shadow-sm">
      <div className="text-gray-300 mb-4 flex justify-center">{icon}</div>
      <h3 className="text-lg font-semibold text-gray-800 mb-2">{title}</h3>
      <p className="text-gray-500 mb-6">{description}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-semibold"
        >
          {action.label}
        </button>
      )}
    </div>
  );
};

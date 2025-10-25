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
import { StatCard, ActionButton } from "../components/ui";
import {
  IeltsReadingTest,
  IeltsWritingTest,
  IeltsWritingType,
  IeltsSubmission,
  IeltsSkill,
  IeltsItemType,
} from "../types/api";
import {
  formatDateTime,
  getLevelInfo,
  getSkillInfo,
} from "../components/utils";

interface IeltsStatsProps {
  stats: {
    total: number;
    reading: number;
    listening: number;
    writing: number;
    speaking: number;
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
      icon: <Mic className="h-6 w-6 text-teal-600" />,
      bgColor: "bg-teal-100",
      label: t("ielts.teacher.speakingTests"),
      value: stats.speaking,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
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

interface IeltsTestCardProps {
  test: IeltsReadingTest;
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
      <div className="flex items-center space-x-2 mb-2">
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-800`}
        >
          {getSkillInfo(IeltsSkill.READING, t).label}
        </span>
        <span
          className={`px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800`}
        >
          {getLevelInfo(test.level, t).label}
        </span>
      </div>
      <h3 className="text-lg font-bold text-gray-900 mb-2 text-start">
        {test.title}
      </h3>
      <p className="text-sm text-gray-600 line-clamp-3 mb-4 text-start">
        {test.description}
      </p>

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
          <ActionButton
            onClick={() => onStartTest(test.id)}
            colorTheme="blue"
            hasIcon={false}
            text={highestSubmission ? t("ielts.retake") : t("ielts.start")}
            size="sm"
            className="w-full"
          />
          {highestSubmission && (
            <ActionButton
              onClick={() => onViewResult(highestSubmission.id)}
              colorTheme="transparent"
              textColor="text-gray-700"
              hasIcon={false}
              text={t("ielts.viewResult")}
              size="sm"
              className="w-full border border-gray-300 bg-white hover:bg-gray-50"
            />
          )}
        </div>
      </div>
    </div>
  );
};

// Writing Task Card for Student View
interface WritingTaskCardProps {
  task: IeltsWritingTest;
  onStartTask: (task: IeltsWritingTest) => void;
}

export const WritingTaskCard: React.FC<WritingTaskCardProps> = ({
  task,
  onStartTask,
}) => {
  const { t } = useTranslation();

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 flex flex-col justify-between hover:shadow-xl transition-shadow">
      <div className="flex items-center space-x-2 mb-2">
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold ${
            task.type === IeltsWritingType.IELTS_TASK1
              ? "bg-orange-100 text-orange-800"
              : "bg-orange-100 text-orange-800"
          }`}
        >
          {getSkillInfo(IeltsSkill.WRITING, t).label}
        </span>
        <span
          className={`px-2 py-1 rounded-full text-xs font-semibold ${
            task.type === IeltsWritingType.IELTS_TASK1
              ? "bg-blue-100 text-blue-800"
              : "bg-purple-100 text-purple-800"
          }`}
        >
          {task.type === IeltsWritingType.IELTS_TASK1 ? "Task 1" : "Task 2"}
        </span>
        <span
          className={`px-2 py-1 rounded-full text-xs font-semibold ${
            getLevelInfo(task.level, t).color
          }`}
        >
          {getLevelInfo(task.level, t).label}
        </span>
      </div>
      <h3 className="text-lg font-bold text-gray-900 mb-2 text-start">
        {task.title}
      </h3>
      <div
        className="text-sm text-gray-600 line-clamp-3 mb-4 text-start prose max-w-none"
        dangerouslySetInnerHTML={{ __html: task.prompt ?? "" }}
      />

      <div>
        <div className="mb-4">
          <p className="text-sm text-gray-500">{t("ielts.notTaken")}</p>
          <p className="text-2xl font-bold text-gray-400">-</p>
        </div>
        <div className="flex items-center space-x-2">
          <ActionButton
            onClick={() => onStartTask(task)}
            colorTheme="blue"
            hasIcon={false}
            text={t("ielts.writingTasks.startTask")}
            size="sm"
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
};

interface IeltsItemRowProps {
  item: IeltsReadingTest | IeltsWritingTest;
  type: IeltsItemType;
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
  onViewSubmissions?: (type: IeltsItemType) => void;
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
              {type === IeltsItemType.READING_TEST
                ? (item as IeltsReadingTest).title
                : (item as IeltsWritingTest).title}
            </h4>

            {type === IeltsItemType.READING_TEST && (
              <>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    getSkillInfo(IeltsSkill.READING, t).color
                  }`}
                >
                  {getSkillInfo(IeltsSkill.READING, t).label}
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    getLevelInfo((item as IeltsReadingTest).level, t).color
                  }`}
                >
                  {getLevelInfo((item as IeltsReadingTest).level, t).label}
                </span>
              </>
            )}

            {type === IeltsItemType.WRITING_TEST && (
              <>
                {" "}
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    getSkillInfo(IeltsSkill.WRITING, t).color
                  }`}
                >
                  {getSkillInfo(IeltsSkill.WRITING, t).label}
                </span>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    (item as IeltsWritingTest).type ===
                    IeltsWritingType.IELTS_TASK1
                      ? "bg-blue-100 text-blue-800"
                      : "bg-purple-100 text-purple-800"
                  }`}
                >
                  {(item as IeltsWritingTest).type ===
                  IeltsWritingType.IELTS_TASK1
                    ? "Task 1"
                    : "Task 2"}
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    getLevelInfo((item as IeltsReadingTest).level, t).color
                  }`}
                >
                  {getLevelInfo((item as IeltsReadingTest).level, t).label}
                </span>
              </>
            )}
          </div>

          {type === IeltsItemType.READING_TEST && (
            <>
              <p className="text-gray-600 mb-4 text-sm leading-relaxed text-start">
                {(item as IeltsReadingTest).description}
              </p>
              <div className="flex items-center space-x-6 text-sm text-gray-500">
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-2" />
                  {(item as IeltsReadingTest).timeLimit
                    ? t("ielts.teacher.minutes", {
                        count: (item as IeltsReadingTest).timeLimit,
                      })
                    : t("ielts.teacher.unlimitedTime")}
                </div>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  {t("ielts.teacher.createdAt")}:{" "}
                  {formatDateTime(item.createdAt)}
                </div>
              </div>
            </>
          )}

          {type === IeltsItemType.WRITING_TEST && (
            <>
              <div
                className="text-gray-600 text-sm line-clamp-2 prose max-w-none text-start"
                dangerouslySetInnerHTML={{
                  __html: (item as IeltsWritingTest).prompt ?? "",
                }}
              />
              <div className="flex items-center space-x-4 text-sm text-gray-500 mt-4">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  {t("ielts.teacher.createdAt")}:{" "}
                  {formatDateTime(item.createdAt)}
                </div>
              </div>
            </>
          )}
        </div>

        <div className="flex items-center space-x-1">
          {onViewSubmissions && (
            <ActionButton
              onClick={() => onViewSubmissions(type)}
              colorTheme="transparent"
              textColor="text-purple-600"
              hasIcon={true}
              icon={BarChart3}
              iconOnly={true}
              title={t("ielts.teacher.viewSubmissions")}
              className="hover:bg-purple-50"
              size="md"
            />
          )}
          {onEdit && (
            <ActionButton
              onClick={() => onEdit(item.id)}
              colorTheme="transparent"
              textColor="text-gray-600"
              hasIcon={true}
              icon={Edit}
              iconOnly={true}
              title={t("ielts.teacher.edit")}
              className="hover:bg-gray-50"
              size="md"
            />
          )}
          {onDelete && (
            <ActionButton
              onClick={() => onDelete(item.id)}
              colorTheme="transparent"
              textColor="text-red-600"
              hasIcon={true}
              icon={Trash2}
              iconOnly={true}
              title={t("ielts.teacher.delete")}
              className="hover:bg-red-50"
              size="md"
            />
          )}
        </div>
      </div>
    </div>
  );
};

import { IeltsLevel, IeltsSkill } from "../../types/api";

export const getLevelInfo = (level: IeltsLevel, t: (key: string) => string) => {
  switch (level) {
    case IeltsLevel.BEGINNER:
      return {
        label: t("ielts.level.beginner"),
        color: "bg-green-100 text-green-800",
      };
    case IeltsLevel.INTERMEDIATE:
      return {
        label: t("ielts.level.intermediate"),
        color: "bg-yellow-100 text-yellow-800",
      };
    case IeltsLevel.ADVANCED:
      return {
        label: t("ielts.level.advanced"),
        color: "bg-red-100 text-red-800",
      };
    default:
      return { label: level, color: "bg-gray-100 text-gray-800" };
  }
};

export const getSkillInfo = (skill: IeltsSkill, t: (key: string) => string) => {
  switch (skill) {
    case IeltsSkill.READING:
      return {
        label: t("ielts.reading"),
        color: "bg-blue-100 text-blue-800",
      };
    case IeltsSkill.LISTENING:
      return {
        label: t("ielts.listening"),
        color: "bg-purple-100 text-purple-800",
      };
    case IeltsSkill.WRITING:
      return {
        label: t("ielts.writing"),
        color: "bg-orange-100 text-orange-800",
      };
    case IeltsSkill.SPEAKING:
      return {
        label: t("ielts.speaking"),
        color: "bg-teal-100 text-teal-800",
      };
    default:
      return { label: skill, color: "bg-gray-100 text-gray-800" };
  }
};
export const getBandScoreColor = (score: number) => {
  if (score >= 7) return "text-green-600 bg-green-50";
  if (score >= 5.5) return "text-yellow-600 bg-yellow-50";
  return "text-red-600 bg-red-50";
};

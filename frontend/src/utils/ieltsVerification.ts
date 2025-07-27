import {
  IeltsSkill,
  IeltsLevel,
  IeltsQuestionType,
  IeltsTest,
  IeltsSection,
  IeltsQuestion,
} from "../types/api";

/**
 * Validates IELTS enum values to ensure they match the backend schema
 */
export const validateIeltsEnums = () => {
  const errors: string[] = [];

  // Validate IeltsSkill enum matches schema
  const validSkills = ["READING", "WRITING", "LISTENING", "SPEAKING"];
  Object.values(IeltsSkill).forEach((skill) => {
    if (!validSkills.includes(skill)) {
      errors.push(`Invalid IeltsSkill: ${skill}`);
    }
  });

  // Validate IeltsLevel enum matches schema
  const validLevels = ["BEGINNER", "INTERMEDIATE", "ADVANCED"];
  Object.values(IeltsLevel).forEach((level) => {
    if (!validLevels.includes(level)) {
      errors.push(`Invalid IeltsLevel: ${level}`);
    }
  });

  // Validate IeltsQuestionType enum matches schema
  const validQuestionTypes = [
    "MULTIPLE_CHOICE",
    "IDENTIFYING_INFORMATION",
    "MATCHING",
    "COMPLETION",
    "SHORT_ANSWER",
  ];
  Object.values(IeltsQuestionType).forEach((type) => {
    if (!validQuestionTypes.includes(type)) {
      errors.push(`Invalid IeltsQuestionType: ${type}`);
    }
  });

  return errors;
};

/**
 * Validates an IELTS test object structure
 */
export const validateIeltsTest = (test: Partial<IeltsTest>): string[] => {
  const errors: string[] = [];

  if (!test.title || test.title.trim().length === 0) {
    errors.push("Test title is required");
  }

  if (!test.skill || !Object.values(IeltsSkill).includes(test.skill)) {
    errors.push("Valid skill is required");
  }

  if (!test.level || !Object.values(IeltsLevel).includes(test.level)) {
    errors.push("Valid level is required");
  }

  if (!test.timeLimit || test.timeLimit <= 0) {
    errors.push("Time limit must be greater than 0");
  }

  return errors;
};

/**
 * Validates an IELTS section object structure
 */
export const validateIeltsSection = (
  section: Partial<IeltsSection>
): string[] => {
  const errors: string[] = [];

  if (!section.title || section.title.trim().length === 0) {
    errors.push("Section title is required");
  }

  if (!section.instructions || section.instructions.trim().length === 0) {
    errors.push("Section instructions are required");
  }

  if (!section.timeLimit || section.timeLimit <= 0) {
    errors.push("Section time limit must be greater than 0");
  }

  if (section.order === undefined || section.order < 0) {
    errors.push("Section order must be a non-negative number");
  }

  return errors;
};

/**
 * Validates an IELTS question object structure
 */
export const validateIeltsQuestion = (
  question: Partial<IeltsQuestion>
): string[] => {
  const errors: string[] = [];

  if (!question.question || question.question.trim().length === 0) {
    errors.push("Question text is required");
  }

  if (
    !question.type ||
    !Object.values(IeltsQuestionType).includes(question.type)
  ) {
    errors.push("Valid question type is required");
  }

  if (!question.correctAnswers || question.correctAnswers.length === 0) {
    errors.push("At least one correct answer is required");
  }

  if (question.points === undefined || question.points <= 0) {
    errors.push("Points must be greater than 0");
  }

  if (question.order === undefined || question.order < 0) {
    errors.push("Question order must be a non-negative number");
  }

  // Type-specific validations
  if (question.type === IeltsQuestionType.MULTIPLE_CHOICE) {
    if (!question.options || question.options.length < 2) {
      errors.push("Multiple choice questions must have at least 2 options");
    }
  }

  if (
    question.type === IeltsQuestionType.MATCHING ||
    question.type === IeltsQuestionType.COMPLETION
  ) {
    if (!question.subQuestions || question.subQuestions.length === 0) {
      errors.push(`${question.type} questions must have sub-questions`);
    }
  }

  return errors;
};

/**
 * Comprehensive validation for complete IELTS test structure
 */
export const validateCompleteIeltsTest = (
  test: Partial<IeltsTest>
): string[] => {
  const errors: string[] = [];

  // Validate test level
  errors.push(...validateIeltsTest(test));

  // Validate sections
  if (!test.sections || test.sections.length === 0) {
    errors.push("Test must have at least one section");
  } else {
    test.sections.forEach((section, index) => {
      const sectionErrors = validateIeltsSection(section);
      sectionErrors.forEach((error) => {
        errors.push(`Section ${index + 1}: ${error}`);
      });

      // Validate questions in section
      if (!section.questions || section.questions.length === 0) {
        errors.push(`Section ${index + 1}: Must have at least one question`);
      } else {
        section.questions.forEach((question, qIndex) => {
          const questionErrors = validateIeltsQuestion(question);
          questionErrors.forEach((error) => {
            errors.push(
              `Section ${index + 1}, Question ${qIndex + 1}: ${error}`
            );
          });
        });
      }
    });
  }

  return errors;
};

/**
 * Utility function to check if IELTS data is properly structured for API calls
 */
export const prepareIeltsDataForAPI = <T extends Record<string, unknown>>(
  data: T
): T => {
  // Remove undefined values and ensure proper enum values
  const cleaned = Object.fromEntries(
    Object.entries(data).filter(([, value]) => value !== undefined)
  ) as T;

  return cleaned;
};

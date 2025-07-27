import api from "../lib/api";
import {
  PaginationParams,
  PaginatedResult,
  IeltsTest,
  IeltsSection,
  IeltsQuestion,
  IeltsSubmission,
} from "../types/api";

export interface IeltsSubmissionResult extends IeltsSubmission {
  test: IeltsTest & {
    sections: (IeltsSection & {
      questions: (IeltsQuestion & {
        userAnswer?: string;
        isCorrect?: boolean;
      })[];
    })[];
  };
}

export const ieltsService = {
  // IELTS Test Management
  async getTests(
    params?: PaginationParams & {
      skill?: string;
      level?: string;
      search?: string;
    }
  ): Promise<PaginatedResult<IeltsTest>> {
    const response = await api.get<PaginatedResult<IeltsTest>>("/ielts/tests", {
      params,
    });
    return response.data;
  },

  async getTest(id: number): Promise<IeltsTest> {
    const response = await api.get<IeltsTest>(`/ielts/tests/${id}`);
    return response.data;
  },

  async getTestWithAnswers(id: number): Promise<IeltsTest> {
    const response = await api.get<IeltsTest>(
      `/ielts/tests/${id}/with-answers`
    );
    return response.data;
  },

  async createTest(testData: Partial<IeltsTest>): Promise<IeltsTest> {
    // Filter out fields that shouldn't be sent for creation
    const createData = {
      title: testData.title,
      description: testData.description,
      skill: testData.skill,
      level: testData.level,
      timeLimit: testData.timeLimit,
      instructions: testData.instructions,
      sections: testData.sections,
    };

    const response = await api.post<IeltsTest>("/ielts/tests", createData);
    return response.data;
  },

  async updateTest(
    id: number,
    testData: Partial<IeltsTest>
  ): Promise<IeltsTest> {
    // Filter out fields that shouldn't be sent for update
    const updateData = {
      title: testData.title,
      description: testData.description,
      skill: testData.skill,
      level: testData.level,
      timeLimit: testData.timeLimit,
      instructions: testData.instructions,
    };

    const response = await api.patch<IeltsTest>(
      `/ielts/tests/${id}`,
      updateData
    );
    return response.data;
  },

  async deleteTest(id: number): Promise<void> {
    await api.delete(`/ielts/tests/${id}`);
  },

  // Section Management
  async createSection(
    testId: number,
    sectionData: Partial<IeltsSection>
  ): Promise<IeltsSection> {
    // Filter out fields that shouldn't be sent for creation
    const createData = {
      title: sectionData.title,
      instructions: sectionData.instructions,
      timeLimit: sectionData.timeLimit,
      order: sectionData.order,
      passageText: sectionData.passageText,
      audioUrl: sectionData.audioUrl,
      imageUrl: sectionData.imageUrl,
      questions: sectionData.questions,
    };

    const response = await api.post<IeltsSection>(
      `/ielts/tests/${testId}/sections`,
      createData
    );
    return response.data;
  },

  async updateSection(
    sectionId: number,
    sectionData: Partial<IeltsSection>
  ): Promise<IeltsSection> {
    // Filter out fields that shouldn't be sent for update
    const updateData = {
      title: sectionData.title,
      instructions: sectionData.instructions,
      timeLimit: sectionData.timeLimit,
      order: sectionData.order,
      passageText: sectionData.passageText,
      audioUrl: sectionData.audioUrl,
      imageUrl: sectionData.imageUrl,
    };

    const response = await api.patch<IeltsSection>(
      `/ielts/sections/${sectionId}`,
      updateData
    );
    return response.data;
  },

  async removeSection(sectionId: number): Promise<void> {
    await api.delete(`/ielts/sections/${sectionId}`);
  },

  // Question Management
  async createQuestion(
    sectionId: number,
    questionData: Partial<IeltsQuestion>
  ): Promise<IeltsQuestion> {
    // Filter out fields that shouldn't be sent for creation
    const createData = {
      question: questionData.question,
      type: questionData.type,
      subQuestions: questionData.subQuestions,
      options: questionData.options,
      correctAnswers: questionData.correctAnswers,
      points: questionData.points,
      order: questionData.order,
      explanation: questionData.explanation,
      imageUrl: questionData.imageUrl,
    };

    const response = await api.post<IeltsQuestion>(
      `/ielts/sections/${sectionId}/questions`,
      createData
    );
    return response.data;
  },

  async updateQuestion(
    questionId: number,
    questionData: Partial<IeltsQuestion>
  ): Promise<IeltsQuestion> {
    // Filter out fields that shouldn't be sent for update
    const updateData = {
      question: questionData.question,
      type: questionData.type,
      subQuestions: questionData.subQuestions,
      options: questionData.options,
      correctAnswers: questionData.correctAnswers,
      points: questionData.points,
      order: questionData.order,
      explanation: questionData.explanation,
      imageUrl: questionData.imageUrl,
    };

    const response = await api.patch<IeltsQuestion>(
      `/ielts/questions/${questionId}`,
      updateData
    );
    return response.data;
  },

  async removeQuestion(questionId: number): Promise<void> {
    await api.delete(`/ielts/questions/${questionId}`);
  },

  // Test Taking
  async submitTest(
    testId: number,
    answers: { questionId: number; answer: string }[]
  ): Promise<IeltsSubmission> {
    const response = await api.post<IeltsSubmission>(
      `/ielts/tests/${testId}/submit`,
      { answers }
    );
    return response.data;
  },

  // Submissions and Results
  async getMySubmissions(): Promise<IeltsSubmission[]> {
    const response = await api.get<IeltsSubmission[]>("/ielts/my-submissions");
    return response.data;
  },

  async getTestSubmissions(testId: number): Promise<IeltsSubmission[]> {
    const response = await api.get<PaginatedResult<IeltsSubmission>>(
      `/ielts/tests/${testId}/submissions`
    );
    return response.data.data;
  },

  async getSubmissionDetails(
    submissionId: number
  ): Promise<IeltsSubmissionResult> {
    const response = await api.get<IeltsSubmissionResult>(
      `/ielts/submissions/${submissionId}/details`
    );
    return response.data;
  },

  // Get resources by skill (for IeltsCenter component)
  async getResourcesBySkill(skill: string): Promise<IeltsTest[]> {
    const response = await this.getTests({ skill });
    return response.data;
  },
};

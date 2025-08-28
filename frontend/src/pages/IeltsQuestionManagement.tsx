import React from "react";
import { IeltsQuestion } from "../types/api";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";

interface IeltsQuestionManagerProps {
  questions: IeltsQuestion[];
  onAddQuestion: () => void;
  onEditQuestion: (question: IeltsQuestion) => void;
  onDeleteQuestion: (questionId: number) => void;
}

export const IeltsQuestionManagement: React.FC<IeltsQuestionManagerProps> = ({
  questions,
  onAddQuestion,
  onEditQuestion,
  onDeleteQuestion,
}) => {
  return (
    <div className="mt-6 pl-4 border-l-2 border-gray-200">
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-md font-semibold text-gray-800">
          Câu hỏi ({questions.length})
        </h4>
        <button
          type="button"
          onClick={onAddQuestion}
          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-full shadow-sm text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500"
        >
          Thêm câu hỏi
        </button>
      </div>
      <ul role="list" className="divide-y divide-gray-200">
        {questions.map((question) => (
          <li key={question.id} className="flex py-4">
            <div className="ml-3 flex-1">
              <p className="text-sm text-gray-800">{question.question}</p>
              <p className="text-xs text-gray-500">
                Loại: {question.type} - Điểm: {question.points}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                type="button"
                onClick={() => onEditQuestion(question)}
                className="text-indigo-600 hover:text-indigo-900"
                aria-label="Chỉnh sửa câu hỏi"
              >
                <PencilIcon className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => onDeleteQuestion(question.id)}
                className="text-red-600 hover:text-red-900"
                aria-label="Xóa câu hỏi"
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

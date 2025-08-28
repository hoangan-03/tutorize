import React, { useState } from "react";
import { IeltsSection, IeltsQuestion } from "../types/api";
import {
  PencilIcon,
  TrashIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import { IeltsQuestionManagement } from "./IeltsQuestionManagement";

interface IeltsSectionManagerProps {
  sections: IeltsSection[];
  onAddSection: () => void;
  onEditSection: (section: IeltsSection) => void;
  onDeleteSection: (sectionId: number) => void;
  // Question handlers
  onAddQuestion: (sectionId: number) => void;
  onEditQuestion: (question: IeltsQuestion) => void;
  onDeleteQuestion: (questionId: number) => void;
}

export const IeltsSectionManagement: React.FC<IeltsSectionManagerProps> = ({
  sections,
  onAddSection,
  onEditSection,
  onDeleteSection,
  onAddQuestion,
  onEditQuestion,
  onDeleteQuestion,
}) => {
  const [expandedSections, setExpandedSections] = useState<Set<number>>(
    new Set()
  );

  const toggleSection = (sectionId: number) => {
    setExpandedSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };

  return (
    <div className="mt-12">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold leading-6 text-gray-900">
          Các phần thi
        </h3>
        <button
          type="button"
          onClick={onAddSection}
          className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        >
          Thêm phần mới
        </button>
      </div>
      <div className="mt-6 border-t border-gray-200">
        <div className="divide-y divide-gray-200">
          {sections.map((section) => (
            <div key={section.id} className="py-4 sm:py-6">
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => toggleSection(section.id)}
                  className="flex items-center text-left w-full"
                >
                  <span className="text-md font-medium text-gray-700 hover:text-gray-900 flex-1">
                    {section.order}. {section.title}
                  </span>
                  <ChevronDownIcon
                    className={`h-6 w-6 text-gray-400 transform transition-transform ${
                      expandedSections.has(section.id) ? "rotate-180" : ""
                    }`}
                  />
                </button>
                <div className="ml-4 flex-shrink-0 flex items-center space-x-4">
                  <button
                    type="button"
                    onClick={() => onEditSection(section)}
                    className="text-indigo-600 hover:text-indigo-900"
                    aria-label="Chỉnh sửa phần thi"
                  >
                    <PencilIcon className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteSection(section.id)}
                    className="text-red-600 hover:text-red-900"
                    aria-label="Xóa phần thi"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
              {expandedSections.has(section.id) && (
                <IeltsQuestionManagement
                  questions={section.questions || []}
                  onAddQuestion={() => onAddQuestion(section.id)}
                  onEditQuestion={onEditQuestion}
                  onDeleteQuestion={onDeleteQuestion}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

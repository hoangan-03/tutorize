import React from "react";
import { ActionButton } from "./ActionButton";

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
        <ActionButton
          onClick={action.onClick}
          colorTheme="blue"
          hasIcon={false}
          text={action.label}
          size="md"
          className="font-semibold"
        />
      )}
    </div>
  );
};

import React from "react";
import { ActionButton } from "./ActionButton";
import { ArrowLeft } from "lucide-react";

interface ErrorDisplayProps {
  title: string;
  message: string;
  onBack?: () => void;
  backText?: string;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  title,
  message,
  onBack,
  backText = "Quay lại",
}) => {
  return (
    <div className="text-center p-8">
      <h2 className="text-xl text-red-600 mb-4">{title}</h2>
      <p className="text-gray-600 mb-4">{message}</p>
      {onBack && (
        <ActionButton
          onClick={onBack}
          colorTheme="gray"
          hasIcon={true}
          icon={ArrowLeft}
          text={backText}
          size="md"
        />
      )}
    </div>
  );
};

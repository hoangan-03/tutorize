import React from "react";
import { LucideIcon } from "lucide-react";

interface ActionButtonProps {
  onClick: () => void;
  colorTheme?:
    | "blue"
    | "red"
    | "green"
    | "gray"
    | "yellow"
    | "white"
    | "transparent"
    | "gradient";
  textColor?: string;
  hasIcon: boolean;
  text?: string | React.ReactNode;
  icon?: LucideIcon;
  disabled?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
  iconOnly?: boolean;
  title?: string;
}

const colorThemes = {
  blue: "bg-blue-600 hover:bg-blue-700",
  red: "bg-red-600 hover:bg-red-700",
  green: "bg-green-600 hover:bg-green-700",
  gray: "bg-gray-600 hover:bg-gray-700",
  yellow: "bg-yellow-600 hover:bg-yellow-700",
  white: "bg-white/20 hover:bg-gray-200/20",
  transparent: "bg-white/10 hover:bg-white/20",
  gradient:
    "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700",
};

const sizeClasses = {
  sm: "px-3 py-2 text-sm",
  md: "px-4 py-2 text-base",
  lg: "px-6 py-3 text-lg",
};

const iconOnlySizeClasses = {
  sm: "p-1",
  md: "p-2",
  lg: "p-3",
};

export const ActionButton: React.FC<ActionButtonProps> = ({
  onClick,
  colorTheme = "blue",
  textColor = "text-white",
  hasIcon,
  text,
  icon: Icon,
  disabled = false,
  className = "",
  size = "sm",
  iconOnly = false,
  title,
}) => {
  const baseClasses =
    "flex items-center justify-center rounded-lg font-medium transition-all shadow-md";
  const sizeClass = iconOnly ? iconOnlySizeClasses[size] : sizeClasses[size];
  const colorClasses = colorThemes[colorTheme];
  const disabledClasses = disabled ? "opacity-50 cursor-not-allowed" : "";

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`${baseClasses} ${sizeClass} ${colorClasses} ${textColor} ${disabledClasses} ${className}`}
    >
      {hasIcon && Icon && (
        <Icon className={`${iconOnly ? "w-4 h-4" : "w-4 h-4 mr-2 mt-1"}`} />
      )}
      {!iconOnly && text}
    </button>
  );
};

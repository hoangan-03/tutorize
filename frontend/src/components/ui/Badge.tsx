import React from "react";

export type BadgeVariant =
  | "subject"
  | "grade"
  | "status"
  | "points"
  | "default";

export interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = "default",
  children,
  className = "",
}) => {
  const getVariantClasses = (variant: BadgeVariant): string => {
    switch (variant) {
      case "subject":
        return "bg-blue-100 text-blue-800";
      case "grade":
        return "bg-sky-100 text-sky-800";
      case "status":
        return ""; // Let className override for status badges
      case "points":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const baseClasses = "px-3 py-1 rounded text-sm font-medium";
  const variantClasses = getVariantClasses(variant);

  // If variant is status and className has background colors, don't apply variant classes
  const shouldApplyVariantClasses =
    variant !== "status" || !className.includes("bg-");
  const appliedClasses = shouldApplyVariantClasses ? variantClasses : "";

  return (
    <span className={`${baseClasses} ${appliedClasses} ${className}`}>
      {children}
    </span>
  );
};

export default Badge;

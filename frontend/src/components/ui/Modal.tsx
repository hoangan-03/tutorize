import React, { useEffect } from "react";
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  X,
  HelpCircle,
} from "lucide-react";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  title?: string;
  message?: string;
  children?: React.ReactNode;
  type?: "info" | "warning" | "error" | "success" | "confirm";
  size?: "sm" | "md" | "lg" | "xl";
  showCloseIcon?: boolean;
  confirmText?: string;
  cancelText?: string;
  confirmButtonClass?: string;
  cancelButtonClass?: string;
  hideButtons?: boolean;
  className?: string;
  overlayClassName?: string;
  autoClose?: boolean;
  autoCloseDelay?: number; // in milliseconds
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  children,
  type = "info",
  size = "md",
  showCloseIcon = true,
  confirmText,
  cancelText,
  confirmButtonClass,
  cancelButtonClass,
  hideButtons = false,
  className = "",
  overlayClassName = "",
  autoClose = false,
  autoCloseDelay = 5000,
}) => {
  // Auto close functionality
  useEffect(() => {
    if (isOpen && autoClose && type !== "confirm") {
      const timer = setTimeout(() => {
        onClose();
      }, autoCloseDelay);

      return () => clearTimeout(timer);
    }
  }, [isOpen, autoClose, autoCloseDelay, onClose, type]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Theme configuration based on type
  const getTheme = () => {
    switch (type) {
      case "success":
        return {
          icon: <CheckCircle className="h-10 w-10 text-white" />,
          iconBg: "bg-gradient-to-br from-green-500 to-green-600",
          headerColor: "text-green-800",
          borderColor: "border-green-200",
          bgGradient: "bg-gradient-to-br from-green-50 to-emerald-50",
          accent: "bg-green-500",
        };
      case "error":
        return {
          icon: <XCircle className="h-10 w-10 text-white" />,
          iconBg: "bg-gradient-to-br from-red-500 to-red-600",
          headerColor: "text-red-800",
          borderColor: "border-red-200",
          bgGradient: "bg-gradient-to-br from-red-50 to-rose-50",
          accent: "bg-red-500",
        };
      case "warning":
        return {
          icon: <AlertTriangle className="h-10 w-10 text-white" />,
          iconBg: "bg-gradient-to-br from-yellow-500 to-orange-500",
          headerColor: "text-yellow-800",
          borderColor: "border-yellow-200",
          bgGradient: "bg-gradient-to-br from-yellow-50 to-orange-50",
          accent: "bg-yellow-500",
        };
      case "confirm":
        return {
          icon: <HelpCircle className="h-10 w-10 text-white" />,
          iconBg: "bg-gradient-to-br from-blue-500 to-indigo-600",
          headerColor: "text-blue-800",
          borderColor: "border-blue-200",
          bgGradient: "bg-gradient-to-br from-blue-50 to-indigo-50",
          accent: "bg-blue-500",
        };
      default:
        return {
          icon: <Info className="h-10 w-10 text-white" />,
          iconBg: "bg-gradient-to-br from-blue-500 to-indigo-600",
          headerColor: "text-blue-800",
          borderColor: "border-blue-200",
          bgGradient: "bg-gradient-to-br from-blue-50 to-indigo-50",
          accent: "bg-blue-500",
        };
    }
  };

  const theme = getTheme();

  // Size classes
  const getSizeClasses = () => {
    switch (size) {
      case "sm":
        return "max-w-sm";
      case "lg":
        return "max-w-2xl";
      case "xl":
        return "max-w-4xl";
      default:
        return "max-w-md";
    }
  };

  // Default button texts
  const getDefaultTexts = () => {
    switch (type) {
      case "confirm":
        return {
          confirm: confirmText || "Xác nhận",
          cancel: cancelText || "Hủy",
        };
      default:
        return {
          confirm: confirmText || "Đóng",
          cancel: cancelText || "Hủy",
        };
    }
  };

  const defaultTexts = getDefaultTexts();

  // Button classes with improved design
  const getConfirmButtonClass = () => {
    if (confirmButtonClass) return confirmButtonClass;

    switch (type) {
      case "success":
        return "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white border border-green-400 hover:border-green-500";
      case "error":
        return "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white border border-red-400 hover:border-red-500";
      case "warning":
        return "bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white border border-yellow-400 hover:border-orange-400";
      case "confirm":
        return "bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white border border-blue-400 hover:border-indigo-500";
      default:
        return "bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white border border-blue-400 hover:border-indigo-500";
    }
  };

  const getCancelButtonClass = () => {
    return (
      cancelButtonClass ||
      "bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 text-gray-700 border border-gray-300 hover:border-gray-400"
    );
  };

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center ${overlayClassName}`}
      onClick={onClose}
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black bg-opacity-50 transition-opacity" />

      {/* Modal */}
      <div
        className={`
          relative rounded-2xl shadow-2xl transform transition-all w-full mx-4 overflow-hidden
          ${theme.borderColor} border-2 bg-white
          ${getSizeClasses()} ${className}
        `}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Accent bar */}
        <div className={`h-1.5 w-full ${theme.accent}`}></div>

        {/* Background gradient */}
        <div className={`${theme.bgGradient}`}>
          {/* Header */}
          <div className="flex items-start justify-between p-6 pb-4">
            <div className="flex items-start space-x-4 flex-1">
              {/* Icon container with gradient background */}
              <div
                className={`
                flex-shrink-0 rounded-2xl p-3 shadow-lg transform transition-transform hover:scale-105
                ${theme.iconBg}
              `}
              >
                {theme.icon}
              </div>

              <div className="flex-1 pt-1">
                <h3 className={`text-2xl font-bold ${theme.headerColor} mb-1`}>
                  {title || (type === "confirm" ? "Xác nhận" : "Thông báo")}
                </h3>
                {/* Subtle line under title */}
                <div
                  className={`h-0.5 w-16 ${theme.accent} rounded-full opacity-60`}
                ></div>
              </div>
            </div>

            {showCloseIcon && (
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-all duration-200 hover:bg-white hover:bg-opacity-80 p-2 rounded-full ml-4"
                aria-label="Đóng"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>

          {/* Content */}
          <div className="px-6 pb-6">
            {(message || children) && (
              <div className="bg-white bg-opacity-70 backdrop-blur-sm rounded-xl p-4 shadow-sm">
                {message && (
                  <p className="text-gray-700 text-base leading-relaxed">
                    {message}
                  </p>
                )}
                {children && (
                  <div className={message ? "mt-3" : ""}>{children}</div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        {!hideButtons && (
          <div className="bg-white bg-opacity-90 backdrop-blur-sm border-t border-gray-200 border-opacity-20">
            <div className="flex items-center justify-end space-x-3 p-6">
              {type === "confirm" && (
                <button
                  onClick={onClose}
                  className={`
                    px-5 py-3 rounded-xl text-sm font-semibold transition-all duration-200 
                    transform hover:scale-105 shadow-sm hover:shadow-md
                    ${getCancelButtonClass()}
                  `}
                >
                  {defaultTexts.cancel}
                </button>
              )}
              <button
                onClick={type === "confirm" ? onConfirm : onClose}
                className={`
                  px-5 py-3 rounded-xl text-sm font-semibold transition-all duration-200 
                  transform hover:scale-105 shadow-lg hover:shadow-xl
                  ${getConfirmButtonClass()}
                `}
                autoFocus
              >
                {defaultTexts.confirm}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;

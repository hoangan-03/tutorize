import React, { createContext, useContext, useState, useCallback } from "react";

export interface ModalState {
  isOpen: boolean;
  type: "info" | "warning" | "error" | "success" | "confirm";
  title?: string;
  message?: string;
  onConfirm?: () => void;
  confirmText?: string;
  cancelText?: string;
  autoClose?: boolean;
  autoCloseDelay?: number;
}

interface ModalContextType {
  modal: ModalState;
  closeModal: () => void;
  openModal: (config: Partial<ModalState>) => void;
  showAlert: (
    message: string,
    options?: {
      title?: string;
      type?: "info" | "warning" | "error" | "success";
      autoClose?: boolean;
      autoCloseDelay?: number;
      confirmText?: string;
    }
  ) => void;
  showConfirm: (
    message: string,
    onConfirm: () => void,
    options?: {
      title?: string;
      confirmText?: string;
      cancelText?: string;
    }
  ) => void;
  showError: (message: string, title?: string, confirmText?: string) => void;
  showSuccess: (
    message: string,
    options?: {
      title?: string;
      autoClose?: boolean;
      autoCloseDelay?: number;
      confirmText?: string;
    }
  ) => void;
  showWarning: (message: string, title?: string, confirmText?: string) => void;
  showInfo: (message: string, title?: string, confirmText?: string) => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const ModalProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [modal, setModalState] = useState<ModalState>({
    isOpen: false,
    type: "info",
  });

  const setModal = useCallback(
    (newState: ModalState | ((prev: ModalState) => ModalState)) => {
      setModalState(newState);
    },
    []
  );

  const closeModal = useCallback(() => {
    setModal((prev) => ({ ...prev, isOpen: false }));
  }, [setModal]);

  const openModal = useCallback(
    (config: Partial<ModalState>) => {
      const newModalState: ModalState = {
        isOpen: true,
        type: "info" as const,
        ...config,
      };
      setModal(newModalState);
    },
    [setModal]
  );

  // Utility functions for common modal types
  const showAlert = useCallback(
    (
      message: string,
      options?: {
        title?: string;
        type?: "info" | "warning" | "error" | "success";
        autoClose?: boolean;
        autoCloseDelay?: number;
        confirmText?: string;
      }
    ) => {
      openModal({
        type: options?.type || "info",
        title: options?.title,
        message,
        autoClose: options?.autoClose,
        autoCloseDelay: options?.autoCloseDelay,
        confirmText: options?.confirmText,
      });
    },
    [openModal]
  );

  const showConfirm = useCallback(
    (
      message: string,
      onConfirm: () => void,
      options?: {
        title?: string;
        confirmText?: string;
        cancelText?: string;
      }
    ) => {
      openModal({
        type: "confirm",
        title: options?.title,
        message,
        onConfirm: () => {
          onConfirm();
          closeModal();
        },
        confirmText: options?.confirmText,
        cancelText: options?.cancelText,
        autoClose: false, // Confirm modals should not auto close
      });
    },
    [openModal, closeModal]
  );

  const showError = useCallback(
    (message: string, title?: string, confirmText?: string) => {
      showAlert(message, { type: "error", title, confirmText });
    },
    [showAlert]
  );

  const showSuccess = useCallback(
    (
      message: string,
      options?: {
        title?: string;
        autoClose?: boolean;
        autoCloseDelay?: number;
        confirmText?: string;
      }
    ) => {
      showAlert(message, { type: "success", ...options });
    },
    [showAlert]
  );

  const showWarning = useCallback(
    (message: string, title?: string, confirmText?: string) => {
      showAlert(message, { type: "warning", title, confirmText });
    },
    [showAlert]
  );

  const showInfo = useCallback(
    (message: string, title?: string, confirmText?: string) => {
      showAlert(message, { type: "info", title, confirmText });
    },
    [showAlert]
  );

  const value: ModalContextType = {
    modal,
    closeModal,
    openModal,
    showAlert,
    showConfirm,
    showError,
    showSuccess,
    showWarning,
    showInfo,
  };

  return (
    <ModalContext.Provider value={value}>{children}</ModalContext.Provider>
  );
};

export const useModal = (): ModalContextType => {
  const context = useContext(ModalContext);
  if (context === undefined) {
    throw new Error("useModal must be used within a ModalProvider");
  }
  return context;
};

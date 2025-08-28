import { useState, useCallback } from "react";

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

export const useModal = () => {
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
  }, []);

  const openModal = useCallback((config: Partial<ModalState>) => {
    const newModalState: ModalState = {
      isOpen: true,
      type: "info" as const,
      ...config,
    };
    setModal(newModalState);
  }, []);

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

  return {
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
};

export default useModal;

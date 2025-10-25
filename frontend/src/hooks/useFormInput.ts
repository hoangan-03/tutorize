import { useState, useCallback } from "react";

export function useFormInput<T extends Record<string, any>>(initialValues: T) {
  const [formData, setFormData] = useState<T>(initialValues);

  const handleInputChange = useCallback(
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >
    ) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
    },
    []
  );

  const handleNumericInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: parseInt(value, 10) || 0 }));
    },
    []
  );

  const setField = useCallback((name: keyof T, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const resetForm = useCallback(() => {
    setFormData(initialValues);
  }, [initialValues]);

  const setFormValues = useCallback((values: Partial<T>) => {
    setFormData((prev) => ({ ...prev, ...values }));
  }, []);

  return {
    formData,
    setFormData,
    handleInputChange,
    handleNumericInputChange,
    setField,
    resetForm,
    setFormValues,
  };
}

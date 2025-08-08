import React, { useMemo, useRef } from "react";
import { Calendar } from "lucide-react";
import { autoFormatDMY, convertDMYToISO, convertISOToDMY } from "../utils";

type DateInputProps = {
  id?: string;
  name?: string;
  value: string; // expects DD-MM-YYYY
  onChange: (value: string) => void; // emits DD-MM-YYYY
  placeholder?: string;
  className?: string;
  disabled?: boolean;
};

export const DateInput: React.FC<DateInputProps> = ({
  id,
  name,
  value,
  onChange,
  placeholder = "DD-MM-YYYY",
  className = "",
  disabled = false,
}) => {
  const hiddenDateRef = useRef<HTMLInputElement | null>(null);

  // Compute ISO value for the hidden native date input
  const isoValue = useMemo(() => convertDMYToISO(value), [value]);

  const openCalendar = () => {
    if (!hiddenDateRef.current) return;
    try {
      // Prefer modern API if available
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const anyInput = hiddenDateRef.current as any;
      if (typeof anyInput.showPicker === "function") {
        anyInput.showPicker();
      } else {
        hiddenDateRef.current.focus();
        hiddenDateRef.current.click();
      }
    } catch {
      hiddenDateRef.current.focus();
    }
  };

  return (
    <div className="mt-1 relative">
      {/* Left calendar icon */}
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Calendar className="h-5 w-5 text-gray-400" />
      </div>

      {/* Visible formatted input */}
      <input
        id={id}
        name={name}
        type="text"
        disabled={disabled}
        value={value}
        placeholder={placeholder}
        onChange={(e) => {
          const next = autoFormatDMY(e.target.value);
          onChange(next);
        }}
        className={
          "appearance-none block w-full pl-10 pr-12 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 " +
          className
        }
      />

      {/* Open calendar button on the right */}
      <button
        type="button"
        onClick={openCalendar}
        className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 hover:text-gray-700"
        aria-label="Open calendar"
        disabled={disabled}
      >
        <Calendar className="h-5 w-5" />
      </button>

      {/* Hidden native date input to leverage browser calendar */}
      <input
        ref={hiddenDateRef}
        tabIndex={-1}
        type="date"
        value={isoValue.length === 10 ? isoValue : ""}
        onChange={(e) => {
          const next = convertISOToDMY(e.target.value);
          onChange(next);
        }}
        className="absolute opacity-0 pointer-events-none"
        aria-hidden="true"
      />
    </div>
  );
};

export default DateInput;

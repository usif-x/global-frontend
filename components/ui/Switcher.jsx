"use client";
import { Icon } from "@iconify/react";
import { useId, useState } from "react";
const Switcher = ({
  checked = false,
  onChange,
  disabled = false,
  label,
  labelPosition = "right",
  size = "md",
  color = "sky",
  name,
  id,
  ...props
}) => {
  const [isChecked, setIsChecked] = useState(checked);
  const generatedId = useId();
  const switchId = id || `switcher-${generatedId}`;

  // Updated size configurations (slightly larger)
  const sizeStyles = {
    sm: { container: "h-8 w-16", knob: "h-8 w-8", translate: "translate-x-10" },
    md: {
      container: "h-10 w-20",
      knob: "h-9 w-9",
      translate: "translate-x-[42px]",
    },
    lg: {
      container: "h-12 w-24",
      knob: "h-11 w-11",
      translate: "translate-x-12",
    },
  };

  const handleToggle = (e) => {
    if (disabled) return;
    const newValue = !isChecked;
    setIsChecked(newValue);
    onChange?.(newValue, e);
  };

  const handleKeyDown = (e) => {
    if (disabled) return;
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      handleToggle(e);
    }
  };

  const currentSize = sizeStyles[size] || sizeStyles.md;

  return (
    <div
      className={`flex items-center gap-3 ${
        disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer"
      }
      ${label ? "justify-between" : ""}`}
    >
      {label && labelPosition === "left" && (
        <label
          htmlFor={switchId}
          className={`
            text-sm font-medium select-none transition-colors duration-150
            ${
              isChecked
                ? "text-gray-900 dark:text-gray-100"
                : "text-gray-600 dark:text-gray-400"
            }
          `}
        >
          {label}
        </label>
      )}

      <div
        role="switch"
        id={switchId}
        name={name}
        aria-checked={isChecked}
        aria-disabled={disabled}
        tabIndex={disabled ? -1 : 0}
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        className={`
          relative inline-flex items-center rounded-full
          transition-all duration-200 ease-in-out
          ${currentSize.container}
          ${isChecked ? "bg-sky-900" : "bg-gray-200 dark:bg-gray-700"}
          ${disabled ? "cursor-not-allowed" : "cursor-pointer"}
          hover:shadow-md
        `}
        {...props}
      >
        <div
          className={`
            inline-block transform rounded-full
            bg-white transition-all duration-200 ease-in-out
            ${currentSize.knob}
            ${isChecked ? currentSize.translate : "translate-x-[1.5px]"}
            ${isChecked ? "scale-100" : "scale-95"}
            ${disabled ? "" : "group-hover:scale-105"}
          `}
        >
          <div
            className={`
            absolute inset-0 m-auto flex items-center justify-center
            transition-opacity duration-150
            ${isChecked ? "opacity-100" : "opacity-0"}
          `}
          >
            <Icon
              icon="noto:check-mark"
              className="text-sky-900"
              width={size === "sm" ? 14 : size === "lg" ? 25 : 25}
              height={size === "sm" ? 14 : size === "lg" ? 25 : 25}
            />
          </div>
          <div
            className={`
            absolute inset-0 rounded-full
            ${isChecked ? "opacity-0" : "opacity-100"}
            bg-gray-300/30 transition-opacity duration-150
          `}
          />
        </div>
      </div>

      {label && labelPosition === "right" && (
        <label
          htmlFor={switchId}
          className={`
            text-sm font-medium select-none transition-colors duration-150
            ${
              isChecked
                ? "text-gray-900 dark:text-gray-100"
                : "text-gray-600 dark:text-gray-400"
            }
          `}
        >
          {label}
        </label>
      )}
    </div>
  );
};

export default Switcher;

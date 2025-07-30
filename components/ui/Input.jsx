"use client";
import "@/styles/input.css";
import { Icon } from "@iconify/react";
import { createContext, useEffect, useRef, useState } from "react";

const DirectionContext = createContext("ltr");

export const DirectionProvider = ({ children, direction = "ltr" }) => {
  useEffect(() => {
    // Set HTML dir attribute when direction changes
    document.documentElement.setAttribute("dir", direction);
  }, [direction]);

  return (
    <DirectionContext.Provider value={direction}>
      {children}
    </DirectionContext.Provider>
  );
};

const Input = ({
  icon,
  placeholder,
  error,
  textarea = false,
  dir = "ltr",
  color = "sky",
  validate,
  onFocus: propOnFocus,
  onBlur: propOnBlur,
  onChange: propOnChange,
  onClick: propOnClick,
  value,
  defaultValue,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [hasValue, setHasValue] = useState(!!value || !!defaultValue);
  const [isValid, setIsValid] = useState(false);
  const [currentValue, setCurrentValue] = useState(value || defaultValue || "");
  const inputRef = useRef(null);
  const inputGroupRef = useRef(null);

  // Handle controlled vs uncontrolled input
  useEffect(() => {
    if (value !== undefined) {
      setCurrentValue(value);
      setHasValue(!!value);
      if (validate) {
        setIsValid(validate(value));
      }
    }
  }, [value, validate]);

  // Initial validation check
  useEffect(() => {
    if (inputRef.current && inputRef.current.value) {
      setHasValue(true);
      if (validate) {
        setIsValid(validate(inputRef.current.value));
      }
    }
  }, [validate]);

  // Reset validity when error prop changes
  useEffect(() => {
    if (error) {
      setIsValid(false);
    }
  }, [error]);

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setCurrentValue(newValue);
    setHasValue(!!newValue);

    if (validate) {
      setIsValid(validate(newValue));
    }

    if (propOnChange) {
      propOnChange(e);
    }
  };

  const handleFocus = (e) => {
    setIsFocused(true);
    if (propOnFocus) {
      propOnFocus(e);
    }
  };

  const handleBlur = (e) => {
    const relatedTarget = e.relatedTarget;

    // Only blur if focus is moving outside the entire input group.
    // This correctly handles tabbing away or clicking outside the component.
    if (
      !inputGroupRef.current ||
      !inputGroupRef.current.contains(relatedTarget)
    ) {
      setIsFocused(false);
    }

    if (propOnBlur) {
      propOnBlur(e);
    }
  };

  const handleClick = (e) => {
    // Focus the input when the container is clicked
    if (inputRef.current) {
      inputRef.current.focus();
    }

    if (propOnClick) {
      propOnClick(e);
    }
  };

  // The useClickAway hook has been removed. The handleBlur function now
  // correctly manages the focus state.

  const isFilledAndNotFocused = hasValue && !isFocused;
  const inputClasses = [
    "modern-input",
    isFocused ? "is-focused" : "",
    isFilledAndNotFocused ? "is-filled" : "",
    error ? "input-error input-error-shake" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const effectiveDir = dir === "rtl" || dir === "ltr" ? dir : "rtl";

  return (
    <div
      className={`input-group ${effectiveDir}`}
      ref={inputGroupRef}
      data-color={color}
      data-error={error ? "true" : "false"}
      data-focused={isFocused ? "true" : "false"}
      data-is-valid={isValid ? "true" : "false"}
    >
      <div className="input-container" onClick={handleClick}>
        {textarea ? (
          <textarea
            {...props}
            ref={inputRef}
            className={inputClasses}
            placeholder=" " // Important for :placeholder-shown selector
            onFocus={handleFocus}
            onBlur={handleBlur}
            onChange={handleInputChange}
            value={value !== undefined ? value : currentValue}
            style={{
              height: "100px",
              paddingTop: "1rem",
              resize: "vertical",
            }}
          />
        ) : (
          <input
            {...props}
            ref={inputRef}
            className={inputClasses}
            placeholder=" " // Important for :placeholder-shown selector
            onFocus={handleFocus}
            onBlur={handleBlur}
            onChange={handleInputChange}
            value={value !== undefined ? value : currentValue}
          />
        )}

        {icon && (
          <Icon className="input-icon" icon={icon} width="24" height="24" />
        )}

        <label
          className="floating-label"
          onClick={() => inputRef.current?.focus()}
        >
          {placeholder}
        </label>

        {/* These two elements are for visual effects only */}
        <div className="focus-highlight"></div>
        <div className="highlight-bar"></div>
      </div>

      {error && (
        <div className={`error-message ${error ? "visible" : ""}`}>
          <Icon
            className="error-icon"
            icon="mingcute:warning-fill"
            width="16"
            height="16"
          />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

export default Input;

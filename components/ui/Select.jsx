"use client";
import "@/styles/select.css";
import { Icon } from "@iconify/react";
import { useEffect, useRef, useState } from "react"; // Not used in the provided snippet for Input
export const Select = ({
  options,
  placeholder,
  icon,
  error,
  onChange,
  disabled = false,
  searchable = true,
  dir = "ltr",
  ...props
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const selectRef = useRef(null);
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        selectRef.current &&
        !selectRef.current.contains(event.target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSelect = (option) => {
    setSelectedOption(option);
    setIsOpen(false);
    setSearchTerm("");
    onChange?.(option);
  };

  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div
      className={`relative w-full ${
        disabled ? "opacity-50 cursor-not-allowed" : ""
      }`}
      ref={selectRef}
    >
      {/* Select Trigger */}
      <div
        className={`
          flex items-center justify-between 
          w-full h-12 px-4 
          border rounded-lg 
          cursor-pointer 
          transition-all duration-300
          ${isOpen ? "border-blue-500 ring-2 ring-blue-200" : "border-gray-300"}
          ${disabled ? "cursor-not-allowed" : ""}
        `}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        {/* Left Icon */}
        {icon && <Icon icon={icon} className="w-5 h-5 mr-2 text-gray-500" />}

        {/* Selected Value or Placeholder */}
        <span
          className={`
          flex-grow 
          ${
            selectedOption
              ? "text-gray-900 dark:text-gray-100"
              : "text-gray-500"
          }
        `}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </span>

        {/* Dropdown Indicator */}
        <div
          className={`
            transition-transform duration-200
            ${isOpen ? "rotate-180" : ""}
          `}
        >
          <Icon icon="mingcute:down-line" className="w-5 h-5 text-gray-500" />
        </div>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className="
            absolute z-[999] w-full 
            mt-2 
            bg-white dark:bg-gray-800 
            border border-gray-200 dark:border-gray-700 
            rounded-lg shadow-lg 
            max-h-60 overflow-y-auto
            animate-dropdown
          "
        >
          {/* Searchable Input */}
          {searchable && (
            <div className="p-2">
              <input
                autoFocus
                ref={searchInputRef}
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                dir={dir}
                aria-label="Search options"
                className={`
                  w-full h-8 px-2
                  border border-gray-300 rounded-md
                  focus:outline-none focus:ring-2 focus:ring-blue-200
                  ${dir === "rtl" ? "text-right" : "text-left"}
                `}
              />
            </div>
          )}

          {/* Options List */}
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option, index) => (
              <div
                key={option.value}
                onClick={() => handleSelect(option)}
                className={`
                  px-4 py-2 
                  cursor-pointer 
                  hover:bg-blue-50 dark:hover:bg-blue-950
                  transition-colors duration-200
                  ${
                    selectedOption?.value === option.value
                      ? "bg-blue-100 dark:bg-blue-900 font-semibold"
                      : ""
                  }
                `}
              >
                {option.label}
              </div>
            ))
          ) : (
            <div className="p-4 text-center text-gray-500">No Results!</div>
          )}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div
          className="
          mt-2 text-red-500 text-sm 
          flex items-center
        "
        >
          <Icon icon="mingcute:warning-fill" className="mr-2 w-4 h-4" />
          {error}
        </div>
      )}
    </div>
  );
};

export default Select;

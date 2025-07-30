"use client";
import { Icon } from "@iconify/react";
import { useRef, useState } from "react";
const Filter = ({
  options = [],
  initialValue = "all",
  onSelectionChange = () => {},
  data = [],
  filterKey = "type",
  allOptionLabel = "الكل",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState(initialValue);
  const containerRef = useRef(null);

  useClickAway(containerRef, () => setIsOpen(false));

  const enrichedOptions = [
    { value: "all", label: allOptionLabel, count: data.length },
    ...options.map((option) => ({
      ...option,
      count: data.filter((item) => item[filterKey] === option.value).length,
    })),
  ];

  const handleSelect = (value) => {
    setSelected(value);
    onSelectionChange(value);
    setIsOpen(false);
  };

  const selectedOption = enrichedOptions.find((opt) => opt.value === selected);

  return (
    <div dir="rtl" className="relative w-fit" ref={containerRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center gap-2 px-4 py-2 bg-white dark:bg-gray-800
                            border border-gray-200 dark:border-gray-700 rounded-lg
                            shadow-sm hover:shadow-md transition-all duration-200
                            text-sm font-medium text-gray-700 dark:text-gray-300"
      >
        <span className="flex-1 text-center">
          {selectedOption?.label || allOptionLabel}
        </span>
        <Icon
          icon={isOpen ? "mdi:chevron-up" : "mdi:chevron-down"}
          className="text-gray-500 dark:text-gray-400 text-lg"
        />
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full mt-2 right-0 w-48 z-50"
          >
            <div
              className="bg-white dark:bg-gray-800 border border-gray-200
                           dark:border-gray-700 rounded-lg shadow-xl overflow-hidden"
            >
              {enrichedOptions.map((option) => (
                <div
                  key={option.value}
                  onClick={() => handleSelect(option.value)}
                  className={`flex items-center justify-between px-4 py-2
                            cursor-pointer transition-colors text-sm
                            ${
                              selected === option.value
                                ? "bg-cyan-50/50 dark:bg-cyan-900/20"
                                : "hover:bg-gray-50/50 dark:hover:bg-gray-700/30"
                            }`}
                >
                  <div className="flex items-center gap-2 flex-1 justify-center">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        selected === option.value
                          ? "bg-cyan-500"
                          : "bg-transparent border border-gray-300 dark:border-gray-600"
                      }`}
                    />
                    <span className="text-gray-700 dark:text-gray-300 text-center">
                      {option.label}
                    </span>
                  </div>
                  <span
                    className="text-xs px-1.5 py-0.5 rounded-md
                                  bg-gray-100/70 dark:bg-gray-700
                                  text-gray-600 dark:text-gray-400"
                  >
                    {option.count}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Filter;

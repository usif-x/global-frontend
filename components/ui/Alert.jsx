import { Icon } from "@iconify/react";

const alertConfig = {
  primary: {
    light: "bg-blue-50 border-blue-200 text-blue-800",
    dark: "bg-blue-900/30 border-blue-700 text-blue-200",
    closeButtonLight: "text-blue-600 hover:text-blue-800",
    closeButtonDark: "text-blue-300 hover:text-blue-100",
  },
  secondary: {
    light: "bg-gray-50 border-gray-200 text-gray-800",
    dark: "bg-gray-800 border-gray-600 text-gray-200",
    closeButtonLight: "text-gray-600 hover:text-gray-800",
    closeButtonDark: "text-gray-300 hover:text-gray-100",
  },
  success: {
    light: "bg-green-50 border-green-200 text-green-800",
    dark: "bg-green-900/30 border-green-700 text-green-200",
    closeButtonLight: "text-green-600 hover:text-green-800",
    closeButtonDark: "text-green-300 hover:text-green-100",
  },
  danger: {
    light: "bg-red-50 border-red-200 text-red-800",
    dark: "bg-red-900/30 border-red-700 text-red-200",
    closeButtonLight: "text-red-600 hover:text-red-800",
    closeButtonDark: "text-red-300 hover:text-red-100",
  },
  warning: {
    light: "bg-yellow-50 border-yellow-200 text-yellow-800",
    dark: "bg-yellow-900/30 border-yellow-700 text-yellow-200",
    closeButtonLight: "text-yellow-600 hover:text-yellow-800",
    closeButtonDark: "text-yellow-300 hover:text-yellow-100",
  },
  info: {
    light: "bg-cyan-50 border-cyan-200 text-cyan-800",
    dark: "bg-cyan-900/30 border-cyan-700 text-cyan-200",
    closeButtonLight: "text-cyan-600 hover:text-cyan-800",
    closeButtonDark: "text-cyan-300 hover:text-cyan-100",
  },
  light: {
    light: "bg-gray-50 border-gray-200 text-gray-600",
    dark: "bg-gray-700 border-gray-600 text-gray-300",
    closeButtonLight: "text-gray-500 hover:text-gray-700",
    closeButtonDark: "text-gray-400 hover:text-gray-200",
  },
  dark: {
    light: "bg-gray-800 border-gray-700 text-gray-100",
    dark: "bg-gray-900 border-gray-700 text-gray-100",
    closeButtonLight: "text-gray-300 hover:text-gray-100",
    closeButtonDark: "text-gray-300 hover:text-gray-100",
  },
};

const Alert = ({
  type = "primary",
  children,
  dismissible = false,
  onClose,
  className = "",
  isDarkMode = false,
  direction = "ltr",
  ariaCloseLabel = "Close alert",
  ...props
}) => {
  const styles = alertConfig[type];
  if (!styles) return null;

  const theme = isDarkMode ? "dark" : "light";
  const alertClasses = styles[theme];
  const closeButtonClasses =
    styles[`closeButton${theme.charAt(0).toUpperCase() + theme.slice(1)}`];

  return (
    <div
      className={`relative px-4 py-3 border rounded-lg ${alertClasses} ${className}`}
      role="alert"
      {...props}
    >
      <div className="flex items-start">
        <div
          className={`flex-1 ${
            dismissible ? (direction === "rtl" ? "ml-6" : "mr-6") : ""
          }`}
        >
          {children}
        </div>
        {dismissible && (
          <button
            type="button"
            className={`absolute top-1/2 -translate-y-1/2 p-1 rounded-md transition-colors duration-200 hover:bg-black/10 dark:hover:bg-white/10 ${
              direction === "rtl" ? "left-2" : "right-2"
            } ${closeButtonClasses}`}
            onClick={onClose}
            aria-label={ariaCloseLabel}
          >
            <Icon icon="lucide:x" className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default Alert;

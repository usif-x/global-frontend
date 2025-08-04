// components/ui/MarkdownEditor.js
"use client";

import { Icon } from "@iconify/react";
import MDEditor, { commands } from "@uiw/react-md-editor";

const colorCommand = {
  name: "color",
  keyCommand: "color",
  buttonProps: { "aria-label": "Insert color" },
  icon: <Icon icon="mdi:format-color-text" width="12" height="12" />,
  execute: (state, api) => {
    // Open a color picker or a prompt
    const color = prompt(
      "Enter a color name (e.g., red) or hex code (#ff0000):",
      "red"
    );

    if (color) {
      // Get the selected text
      const modifiedText = `<span style="color: ${color};">${state.selectedText}</span>`;
      // Replace the selection with the colored text
      api.replaceSelection(modifiedText);
    }
  },
};

const MarkdownEditor = ({ value, onChange, placeholder, error, disabled }) => {
  return (
    <div className="w-full" data-color-mode="light">
      <div className={error ? "md-editor-error" : ""}>
        <MDEditor
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          preview="edit" // Can be "live", "edit", or "preview"
          height={250}
          disabled={disabled}
          commands={[
            commands.bold,
            commands.italic,
            commands.strikethrough,
            commands.hr,
            commands.title,
            commands.divider,
            commands.link,
            commands.quote,
            commands.code,
            commands.codeBlock,
            commands.image,
            commands.divider,
            commands.unorderedListCommand,
            commands.orderedListCommand,
            commands.checkedListCommand,
            commands.divider,
            colorCommand,
          ]}
        />
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600 flex items-center">
          <Icon icon="mdi:alert-circle" className="w-4 h-4 mr-1" />
          {error}
        </p>
      )}

      {/* Add a global style to handle the red border on error */}
      <style jsx global>{`
        .md-editor-error .w-md-editor {
          border-color: #ef4444; /* red-500 */
          box-shadow: 0 0 0 1px #ef4444;
        }
      `}</style>
    </div>
  );
};

export default MarkdownEditor;

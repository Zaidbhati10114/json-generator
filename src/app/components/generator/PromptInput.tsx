// components/generator/PromptInput.tsx
import React, { ChangeEvent } from "react";

interface PromptInputProps {
  prompt: string;
  setPrompt: (prompt: string) => void;
  isDark: boolean;
  textSecondary: string;
  textPrimary: string;
}

const PromptInput: React.FC<PromptInputProps> = ({
  prompt,
  setPrompt,
  isDark,
  textSecondary,
  textPrimary,
}) => {
  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>): void => {
    setPrompt(e.target.value);
  };

  return (
    <div className="mb-6">
      <label
        htmlFor="prompt-input"
        className={`block text-sm font-medium mb-2 ${textSecondary}`}
      >
        Describe your data
      </label>
      <textarea
        id="prompt-input"
        value={prompt}
        onChange={handleChange}
        placeholder="e.g., Generate 10 users with name, email, and age..."
        className={`w-full px-4 py-3 rounded-xl border ${
          isDark
            ? "bg-gray-800 border-gray-700 text-white"
            : "bg-white border-gray-300 text-gray-900"
        } focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
        rows={4}
        maxLength={500}
      />
      <p className={`text-xs ${textSecondary} mt-1`}>
        {prompt.length}/500 characters
      </p>
    </div>
  );
};

export default PromptInput;

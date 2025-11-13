"use client";
import { motion } from "framer-motion";

interface PromptInputProps {
  prompt: string;
  setPrompt: React.Dispatch<React.SetStateAction<string>>;
  isDark: boolean;
  textSecondary: string;
  textPrimary: string;
}

const PromptInput = ({
  prompt,
  setPrompt,
  isDark,
  textSecondary,
  textPrimary,
}: PromptInputProps) => {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <label className="text-sm font-medium">Describe Your Data</label>
        {prompt && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setPrompt("")}
            className={`text-xs ${textSecondary} hover:${textPrimary} transition-colors`}
          >
            Clear
          </motion.button>
        )}
      </div>

      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Describe the data you want to generate... Try clicking a template above or write your own!"
        className={`w-full h-56 px-4 py-3 ${
          isDark
            ? "bg-gray-800 border-gray-700 focus:border-purple-500"
            : "bg-gray-50 border-gray-300 focus:border-purple-500"
        } border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 resize-none transition-all`}
      />
    </div>
  );
};

export default PromptInput;

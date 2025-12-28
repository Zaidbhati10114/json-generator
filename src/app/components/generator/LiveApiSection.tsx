// components/LiveApiSection.tsx
import React from "react";
import { motion } from "framer-motion";
import { Check, Copy } from "lucide-react";
import { LiveUrlWarning } from "./LiveUrlWarning";

interface LiveApiSectionProps {
  apiUrl: string;
  handleCopy: (url: string) => void;
  copied: boolean;
  isDark: boolean;
  borderColor: string;
  textSecondary: string;
  isGenerating?: boolean;
}

export const LiveApiSection: React.FC<LiveApiSectionProps> = ({
  apiUrl,
  handleCopy,
  copied,
  isDark,
  borderColor,
  textSecondary,
  isGenerating = false,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-6 space-y-4 z-10"
    >
      <label
        className={`block text-sm font-medium ${textSecondary}`}
        htmlFor="api-url-input"
      >
        Live API URL
      </label>

      <div className="flex gap-2 items-center">
        <input
          disabled={isGenerating}
          id="api-url-input"
          value={apiUrl}
          readOnly
          className={`flex-1 px-4 py-2 border ${borderColor} rounded-lg text-sm font-mono ${
            isDark
              ? "bg-gray-800 border-gray-700"
              : "bg-gray-50 border-gray-300"
          }`}
          aria-label="Generated API URL"
        />

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handleCopy(apiUrl)}
          className={`px-4 py-2 rounded-lg ${
            isDark
              ? "bg-gray-800 hover:bg-gray-700"
              : "bg-gray-100 hover:bg-gray-200"
          } transition-colors`}
          aria-label={copied ? "URL copied" : "Copy URL to clipboard"}
        >
          {copied ? (
            <Check className="w-5 h-5 text-green-500" />
          ) : (
            <Copy className="w-5 h-5" />
          )}
        </motion.button>
      </div>

      {/* Warning Box */}
      <LiveUrlWarning isDark={isDark} />
    </motion.div>
  );
};

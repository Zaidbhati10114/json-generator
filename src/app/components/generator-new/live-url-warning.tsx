import React, { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Check, Copy, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

interface LiveUrlWarningProps {
  isDark: boolean;
  apiUrl: string;
}

const LiveUrlWarning: React.FC<LiveUrlWarningProps> = ({ isDark, apiUrl }) => {
  const [copied, setCopied] = useState<boolean>(false);
  const borderColor = isDark ? "border-gray-800" : "border-gray-200";
  const textSecondary = isDark ? "text-gray-400" : "text-gray-600";

  const handleCopy = useCallback((text: string): void => {
    if (!text) {
      toast.error("Nothing to copy");
      return;
    }

    navigator.clipboard
      .writeText(text)
      .then(() => {
        setCopied(true);
        toast.success("Copied to clipboard!");
        setTimeout(() => setCopied(false), 2000);
      })
      .catch((error) => {
        console.error("Copy failed:", error);
        toast.error("Failed to copy to clipboard");
      });
  }, []);

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

      {/* WARNING BOX */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={`rounded-xl border p-4 flex gap-3 text-sm ${
          isDark
            ? "border-yellow-700 bg-yellow-900/20 text-yellow-300"
            : "border-yellow-400 bg-yellow-50 text-yellow-800"
        }`}
        role="alert"
        aria-live="polite"
      >
        <AlertTriangle
          className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
            isDark ? "text-yellow-400" : "text-yellow-600"
          }`}
          aria-hidden="true"
        />

        <div className="space-y-1">
          <p className="font-medium">Live URL Rules</p>
          <ul className="list-disc list-inside space-y-1">
            <li>
              This URL expires in <span className="font-semibold">7 days</span>.
            </li>
            <li>
              If nobody fetches this URL for{" "}
              <span className="font-semibold">3 consecutive days</span>, it will
              be auto-deleted.
            </li>
            <li>Once deleted, the URL and data cannot be recovered.</li>
          </ul>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default LiveUrlWarning;

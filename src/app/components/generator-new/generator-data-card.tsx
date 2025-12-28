import React, { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Check, Copy, X } from "lucide-react";
import { toast } from "sonner";
import JsonPreview from "./json-preview";
import LiveUrlSection from "./live-url-section";
import LiveUrlWarning from "./live-url-warning";

interface GeneratedDataCardProps {
  isDark: boolean;
  generatedData: any;
  apiUrl: string;
  handleClear: () => void;
  handleCreateUrl: () => void;
}

const GeneratedDataCard: React.FC<GeneratedDataCardProps> = ({
  isDark,
  generatedData,
  apiUrl,
  handleClear,
  handleCreateUrl,
}) => {
  const [copiedJson, setCopiedJson] = useState<boolean>(false);
  const cardBg = isDark ? "bg-gray-900" : "bg-white";
  const borderColor = isDark ? "border-gray-800" : "border-gray-200";

  const handleCopyJson = useCallback((): void => {
    if (!generatedData) {
      toast.error("No data to copy");
      return;
    }

    const jsonString = JSON.stringify(generatedData, null, 2);

    navigator.clipboard
      .writeText(jsonString)
      .then(() => {
        setCopiedJson(true);
        toast.success("JSON copied to clipboard!");
        setTimeout(() => setCopiedJson(false), 2000);
      })
      .catch((error) => {
        console.error("Copy failed:", error);
        toast.error("Failed to copy JSON");
      });
  }, [generatedData]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className={`${cardBg} border ${borderColor} rounded-2xl p-8 shadow-xl flex flex-col relative`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4 z-10">
        <h3 className="text-xl font-bold">Generated Data</h3>

        <div className="flex items-center gap-2">
          {/* Copy JSON Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleCopyJson}
            className={`p-2 ${
              isDark ? "hover:bg-gray-800" : "hover:bg-gray-100"
            } rounded-lg transition-colors`}
            aria-label={copiedJson ? "JSON copied" : "Copy JSON to clipboard"}
            title="Copy JSON"
          >
            {copiedJson ? (
              <Check className="w-5 h-5 text-green-500" />
            ) : (
              <Copy className="w-5 h-5" />
            )}
          </motion.button>

          {/* Clear Button */}
          <motion.button
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleClear}
            className={`p-2 ${
              isDark ? "hover:bg-gray-800" : "hover:bg-gray-100"
            } rounded-lg transition-colors`}
            aria-label="Clear generated data"
            title="Clear"
          >
            <X className="w-5 h-5" />
          </motion.button>
        </div>
      </div>

      <JsonPreview data={generatedData} isDark={isDark} />

      {!apiUrl ? (
        <LiveUrlSection isDark={isDark} handleCreateUrl={handleCreateUrl} />
      ) : (
        <LiveUrlWarning isDark={isDark} apiUrl={apiUrl} />
      )}
    </motion.div>
  );
};

export default GeneratedDataCard;

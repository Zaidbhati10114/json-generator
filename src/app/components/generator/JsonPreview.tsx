"use client";
import { motion } from "framer-motion";
import { Download } from "lucide-react";

const JsonPreview = ({ generatedData, isDark, borderColor }) => {
  const handleDownload = () => {
    const blob = new Blob([JSON.stringify(generatedData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "generated-data.json";
    a.click();
  };

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <label
          className={`text-sm font-medium ${
            isDark ? "text-gray-400" : "text-gray-600"
          }`}
        >
          JSON Data
        </label>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleDownload}
          className={`flex items-center gap-2 px-3 py-1.5 ${
            isDark
              ? "bg-gray-800 hover:bg-gray-700"
              : "bg-gray-100 hover:bg-gray-200"
          } rounded-lg text-sm`}
        >
          <Download className="w-4 h-4" /> Download
        </motion.button>
      </div>
      <div
        className={`${
          isDark ? "bg-gray-800" : "bg-gray-50"
        } rounded-xl p-4 overflow-auto max-h-64 border ${borderColor}`}
      >
        <pre className="text-sm">
          <code>{JSON.stringify(generatedData, null, 2)}</code>
        </pre>
      </div>
    </div>
  );
};

export default JsonPreview;

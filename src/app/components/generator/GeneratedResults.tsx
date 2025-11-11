"use client";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import JsonPreview from "./JsonPreview";
import CreateApiUrl from "./CreateApiUrl";

const GeneratedResults = ({
  isDark,
  borderColor,
  generatedData,
  showUrlOptions,
  apiUrl,
  setApiUrl,
  handleClear,
}) => {
  return (
    <motion.div
      key="results"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className={`${
        isDark ? "bg-gray-900" : "bg-white"
      } border ${borderColor} rounded-2xl p-8 shadow-xl`}
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold">Generated Data</h3>
        <motion.button
          whileHover={{ scale: 1.1, rotate: 90 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleClear}
          className={`p-2 ${
            isDark ? "hover:bg-gray-800" : "hover:bg-gray-100"
          } rounded-lg`}
        >
          <X className="w-5 h-5" />
        </motion.button>
      </div>

      <JsonPreview
        generatedData={generatedData}
        isDark={isDark}
        borderColor={borderColor}
      />

      <CreateApiUrl
        showUrlOptions={showUrlOptions}
        apiUrl={apiUrl}
        setApiUrl={setApiUrl}
        isDark={isDark}
        borderColor={borderColor}
      />
    </motion.div>
  );
};

export default GeneratedResults;

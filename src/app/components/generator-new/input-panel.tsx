import React from "react";
import { motion } from "framer-motion";
import { Sparkles, RefreshCw } from "lucide-react";
import QuickTemplates from "../generator/QuickTemplate";
import PromptInput from "../generator/PromptInput";

interface InputPanelProps {
  isDark: boolean;
  isGenerating: boolean;
  prompt: string;
  setPrompt: React.Dispatch<React.SetStateAction<string>>;
  handleGenerate: () => void;
}

const InputPanel: React.FC<InputPanelProps> = ({
  isDark,
  isGenerating,
  prompt,
  setPrompt,
  handleGenerate,
}) => {
  const cardBg = isDark ? "bg-gray-900" : "bg-white";
  const borderColor = isDark ? "border-gray-800" : "border-gray-200";
  const textSecondary = isDark ? "text-gray-400" : "text-gray-600";
  const textPrimary = isDark ? "text-white" : "text-gray-900";

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className={`${cardBg} border ${borderColor} rounded-2xl p-8 shadow-xl relative`}
    >
      {/* Shimmer while generating */}
      {isGenerating && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-500/10 to-transparent"
          animate={{
            backgroundPosition: ["200% 0%", "-200% 0%"],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "linear",
          }}
          style={{
            backgroundSize: "200% 100%",
            pointerEvents: "none",
          }}
        />
      )}

      <QuickTemplates setPrompt={setPrompt} isDark={isDark} />

      <PromptInput
        isLoading={isGenerating}
        prompt={prompt}
        setPrompt={setPrompt}
        isDark={isDark}
        textSecondary={textSecondary}
        textPrimary={textPrimary}
      />

      {/* GENERATE BUTTON */}
      <motion.button
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        onClick={handleGenerate}
        disabled={!prompt.trim() || isGenerating}
        className="w-full px-6 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 relative overflow-hidden"
        aria-label={isGenerating ? "Generating data" : "Generate JSON data"}
        aria-busy={isGenerating}
      >
        {isGenerating ? (
          <>
            <RefreshCw className="w-6 h-6 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <Sparkles className="w-6 h-6" />
            Generate Data
          </>
        )}
      </motion.button>
    </motion.div>
  );
};

export default InputPanel;

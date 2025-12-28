import React, { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { getPromptCategory } from "@/lib/utils";
import { AdaptiveSkeleton } from "../generator/AdaptiveSkeleton";
import EmptyState from "../generator/EmptyState";
import GeneratedDataCard from "./generator-data-card";

interface ResultsPanelProps {
  isDark: boolean;
  isGenerating: boolean;
  prompt: string;
  generatedData: any;
  apiUrl: string;
  handleClear: () => void;
  handleCreateUrl: () => void;
}

const ResultsPanel: React.FC<ResultsPanelProps> = ({
  isDark,
  isGenerating,
  prompt,
  generatedData,
  apiUrl,
  handleClear,
  handleCreateUrl,
}) => {
  const textPrimary = isDark ? "text-white" : "text-gray-900";
  const textSecondary = isDark ? "text-gray-400" : "text-gray-600";
  const cardBg = isDark ? "bg-gray-900" : "bg-white";
  const borderColor = isDark ? "border-gray-800" : "border-gray-200";

  return (
    <AnimatePresence mode="wait">
      {isGenerating ? (
        <AdaptiveSkeleton
          key="skeleton"
          category={getPromptCategory(prompt)}
          textSecondary={textSecondary}
          cardBg={cardBg}
          borderColor={borderColor}
        />
      ) : generatedData ? (
        <GeneratedDataCard
          key="results"
          isDark={isDark}
          generatedData={generatedData}
          apiUrl={apiUrl}
          handleClear={handleClear}
          handleCreateUrl={handleCreateUrl}
        />
      ) : (
        <EmptyState
          key="empty"
          isDark={isDark}
          textPrimary={textPrimary}
          textSecondary={textSecondary}
        />
      )}
    </AnimatePresence>
  );
};

export default ResultsPanel;

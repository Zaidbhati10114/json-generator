// components/generator/EmptyState.tsx
import React from "react";
import { Sparkles } from "lucide-react";

interface EmptyStateProps {
  isDark: boolean;
  textPrimary: string;
  textSecondary: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  isDark,
  textPrimary,
  textSecondary,
}) => {
  return (
    <div
      className={`flex items-center justify-center h-full min-h-[400px] ${
        isDark ? "bg-gray-900" : "bg-white"
      } border ${isDark ? "border-gray-800" : "border-gray-200"} rounded-2xl`}
    >
      <div className="text-center p-8">
        <Sparkles className={`w-16 h-16 mx-auto mb-4 ${textSecondary}`} />
        <h3 className={`text-xl font-semibold mb-2 ${textPrimary}`}>
          Ready to Generate
        </h3>
        <p className={textSecondary}>
          Enter a prompt or select a template to get started
        </p>
      </div>
    </div>
  );
};

export default EmptyState;

// components/generator/AdaptiveSkeleton.tsx
import React from "react";
import { motion } from "framer-motion";
import type { PromptCategory } from "../../../../types/index";

interface AdaptiveSkeletonProps {
  category: PromptCategory;
  textSecondary: string;
  cardBg: string;
  borderColor: string;
}

export const AdaptiveSkeleton: React.FC<AdaptiveSkeletonProps> = ({
  category,
  textSecondary,
  cardBg,
  borderColor,
}) => {
  return (
    <motion.div
      key="skeleton"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className={`${cardBg} border ${borderColor} rounded-2xl p-8 shadow-xl`}
    >
      <div className="space-y-4">
        <div
          className={`h-8 ${textSecondary} bg-current opacity-20 rounded animate-pulse`}
        />
        <div
          className={`h-6 ${textSecondary} bg-current opacity-20 rounded animate-pulse w-3/4`}
        />
        <div
          className={`h-6 ${textSecondary} bg-current opacity-20 rounded animate-pulse w-1/2`}
        />
      </div>
    </motion.div>
  );
};

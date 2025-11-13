"use client";
import { motion } from "framer-motion";
import { Database } from "lucide-react";

interface EmptyStateProps {
  isDark: boolean;
  textPrimary: string;
  textSecondary: string;
}

const EmptyState = ({
  isDark,
  textPrimary,
  textSecondary,
}: EmptyStateProps) => (
  <motion.div
    key="empty"
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -20 }}
    className={`${isDark ? "bg-gray-900" : "bg-white"} border ${
      isDark ? "border-gray-800" : "border-gray-200"
    } rounded-2xl p-12 text-center flex flex-col items-center justify-center shadow-xl min-h-[600px]`}
  >
    <motion.div
      animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      className={`p-6 ${
        isDark ? "bg-gray-800" : "bg-gray-100"
      } rounded-2xl mb-6`}
    >
      <Database className="w-16 h-16 opacity-50" />
    </motion.div>
    <p className={`${textPrimary} text-lg font-medium mb-2`}>
      Ready to Generate
    </p>
    <p className={`${textSecondary} text-sm`}>
      Choose a template or describe your data
    </p>
    <p className={`${textSecondary} text-sm`}>
      Results will appear here instantly
    </p>
  </motion.div>
);

export default EmptyState;

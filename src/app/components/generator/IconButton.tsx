// components/ui/IconButton.tsx
import React from "react";
import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface IconButtonProps {
  onClick: () => void;
  isDark: boolean;
  icon: LucideIcon;
  success?: boolean;
  rotateOnHover?: boolean;
  label: string;
  disabled?: boolean;
}

export const IconButton: React.FC<IconButtonProps> = ({
  onClick,
  isDark,
  icon: Icon,
  success = false,
  rotateOnHover = false,
  label,
  disabled = false,
}) => {
  const hoverAnimation = rotateOnHover
    ? { scale: 1.1, rotate: 90 }
    : { scale: 1.05 };

  return (
    <motion.button
      whileHover={hoverAnimation}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      disabled={disabled}
      className={`p-2 ${
        isDark ? "hover:bg-gray-800" : "hover:bg-gray-100"
      } rounded-lg transition-colors ${
        disabled ? "opacity-50 cursor-not-allowed" : ""
      }`}
      aria-label={success ? `${label} (completed)` : label}
      title={label}
    >
      <Icon className={`w-5 h-5 ${success ? "text-green-500" : ""}`} />
    </motion.button>
  );
};

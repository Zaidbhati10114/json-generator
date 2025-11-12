"use client";

import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

const Footer = () => {
  const { isDark } = useTheme();
  const borderColor = isDark ? "border-gray-800" : "border-gray-200";
  const textSecondary = isDark ? "text-gray-400" : "text-gray-600";
  const currentYear = new Date().getFullYear();

  return (
    <motion.footer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className={`mt-auto border-t ${borderColor} backdrop-blur-xl bg-gradient-to-t 
        from-transparent to-black/5 dark:to-white/5 transition-colors duration-500`}
    >
      <div className="max-w-[1600px] mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm">
        {/* System Status */}
        <div className="flex items-center gap-2 text-green-500">
          <CheckCircle className="w-4 h-4" />
          <span className={`${textSecondary}`}>System Status: All Good</span>
        </div>

        {/* Copyright */}
        <p className={`${textSecondary} text-center`}>
          © {currentYear}{" "}
          <span className="font-medium text-purple-400">Zaid Bhati</span>. All
          rights reserved.
        </p>
      </div>
    </motion.footer>
  );
};

export default Footer;

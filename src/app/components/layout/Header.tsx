"use client";

import { motion } from "framer-motion";
import { Zap, Sun, Moon } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

const Header = () => {
  const { isDark, toggleTheme } = useTheme();
  const borderColor = isDark ? "border-gray-800" : "border-gray-200";

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className={`border-b ${borderColor} sticky top-0 z-50 backdrop-blur-xl ${
        isDark ? "bg-gray-950/80" : "bg-white/80"
      }`}
    >
      <div className="max-w-[1600px] mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <motion.div
            whileHover={{ rotate: 180 }}
            transition={{ duration: 0.3 }}
            className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg"
          >
            <Zap className="w-6 h-6 text-white" />
          </motion.div>
          <div>
            <h1 className="text-xl font-bold">JSON Generator</h1>
            <p
              className={`text-xs ${
                isDark ? "text-gray-400" : "text-gray-600"
              }`}
            >
              AI-Powered Data Generation
            </p>
          </div>
        </div>

        <button
          onClick={toggleTheme}
          className={`p-2 rounded-lg ${
            isDark
              ? "bg-gray-800 hover:bg-gray-700"
              : "bg-gray-100 hover:bg-gray-200"
          }`}
        >
          {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
      </div>
    </motion.header>
  );
};

export default Header;

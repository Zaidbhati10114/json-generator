"use client";

import { motion } from "framer-motion";
import { Zap, Sun, Moon, Github } from "lucide-react";
import Link from "next/link";
import { useTheme } from "../context/ThemeContext";

const Header = () => {
  const { isDark, toggleTheme } = useTheme();
  const borderColor = isDark ? "border-gray-800" : "border-gray-200";
  const textColor = isDark ? "text-gray-300" : "text-gray-800";

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className={`border-b ${borderColor} sticky top-0 z-50 backdrop-blur-xl ${
        isDark ? "bg-gray-950/80" : "bg-white/80"
      }`}
    >
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
        {/* Left Side — Logo + App Name */}
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-gradient-to-br from-purple-500 to-pink-500 rounded-md">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <h1 className={`text-base sm:text-lg font-semibold ${textColor}`}>
            JSON Generator
          </h1>
        </div>

        {/* Right Side — Developer + Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Developer credit (compact) */}
          <p
            className={`hidden sm:flex text-sm ${textColor} items-center gap-1`}
          >
            <span className="opacity-70">Developed by</span>
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent font-medium hover:drop-shadow-[0_0_4px_rgba(236,72,153,0.7)] transition-all duration-300">
              Zaid
            </span>
          </p>

          {/* GitHub button */}
          <Link
            href="https://github.com/zaidbhati"
            target="_blank"
            rel="noopener noreferrer"
            className={`p-2 rounded-md transition-all ${
              isDark
                ? "hover:bg-gray-800 text-gray-300"
                : "hover:bg-gray-100 text-gray-700"
            }`}
            aria-label="View on GitHub"
          >
            <Github className="w-4 h-4 sm:w-5 sm:h-5" />
          </Link>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className={`p-2 rounded-md transition-all ${
              isDark
                ? "hover:bg-gray-800 text-gray-300"
                : "hover:bg-gray-100 text-gray-700"
            }`}
          >
            {isDark ? (
              <Sun className="w-4 h-4 sm:w-5 sm:h-5" />
            ) : (
              <Moon className="w-4 h-4 sm:w-5 sm:h-5" />
            )}
          </button>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;

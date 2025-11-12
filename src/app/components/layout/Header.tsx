"use client";

import { motion } from "framer-motion";
import { Zap, Sun, Moon, Github } from "lucide-react";
import Link from "next/link";
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
      <div className="max-w-[1600px] mx-auto px-6 py-4 flex flex-wrap items-center justify-between gap-3">
        {/* Left Side: Logo and App Name */}
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

        {/* Right Side: Developer Credit + GitHub + Theme Toggle */}
        <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
          {/* Developed by Zaid */}
          <div className="flex items-center gap-2">
            <p
              className={`text-sm font-medium ${
                isDark ? "text-gray-300" : "text-gray-700"
              }`}
            >
              Developed by{" "}
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent font-semibold">
                Zaid
              </span>
            </p>

            {/* GitHub Button (optional but elegant) */}
            <Link
              href="https://github.com/zaidbhati"
              target="_blank"
              rel="noopener noreferrer"
              className={`p-2 rounded-lg transition-all ${
                isDark
                  ? "bg-gray-800 hover:bg-gray-700"
                  : "bg-gray-100 hover:bg-gray-200"
              }`}
            >
              <Github className="w-5 h-5" />
            </Link>
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-lg transition-all ${
              isDark
                ? "bg-gray-800 hover:bg-gray-700"
                : "bg-gray-100 hover:bg-gray-200"
            }`}
            aria-label="Toggle theme"
          >
            {isDark ? (
              <Sun className="w-5 h-5" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;

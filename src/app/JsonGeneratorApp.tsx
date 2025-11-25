"use client";

import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  RefreshCw,
  Link2,
  Check,
  Copy,
  X,
  AlertTriangle,
} from "lucide-react";
import { useTheme } from "./components/context/ThemeContext";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import QuickTemplates from "./components/generator/QuickTemplate";
import PromptInput from "./components/generator/PromptInput";
import EmptyState from "./components/generator/EmptyState";
import { toast } from "sonner";
import { AdaptiveSkeleton } from "./components/generator/AdaptiveSkeleton";
import { getPromptCategory } from "@/lib/utils";
import { useJsonGenerator } from "@/hooks/useJsonGenerator";

const JsonGeneratorApp: React.FC = () => {
  const { isDark } = useTheme();
  const {
    handleGenerate,
    handleClear,
    handleCreateUrl,
    apiUrl,
    isGenerating,
    prompt,
    setPrompt,
    generatedData,
  } = useJsonGenerator();
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [copiedJson, setCopiedJson] = useState<boolean>(false);

  // Theme classes
  const bgClass = isDark ? "bg-gray-950" : "bg-gray-50";
  const cardBg = isDark ? "bg-gray-900" : "bg-white";
  const textPrimary = isDark ? "text-white" : "text-gray-900";
  const textSecondary = isDark ? "text-gray-400" : "text-gray-600";
  const borderColor = isDark ? "border-gray-800" : "border-gray-200";

  // COPY ---------------------------------
  const handleCopy = useCallback((text: string): void => {
    if (!text) {
      toast.error("Nothing to copy");
      return;
    }

    navigator.clipboard
      .writeText(text)
      .then(() => {
        setCopied(true);
        toast.success("Copied to clipboard!");
        setTimeout(() => setCopied(false), 2000);
      })
      .catch((error) => {
        console.error("Copy failed:", error);
        toast.error("Failed to copy to clipboard");
      });
  }, []);

  // COPY JSON ---------------------------------
  const handleCopyJson = useCallback((): void => {
    if (!generatedData) {
      toast.error("No data to copy");
      return;
    }

    const jsonString = JSON.stringify(generatedData, null, 2);

    navigator.clipboard
      .writeText(jsonString)
      .then(() => {
        setCopiedJson(true);
        toast.success("JSON copied to clipboard!");
        setTimeout(() => setCopiedJson(false), 2000);
      })
      .catch((error) => {
        console.error("Copy failed:", error);
        toast.error("Failed to copy JSON");
      });
  }, [generatedData]);

  return (
    <div
      className={`min-h-screen ${bgClass} ${textPrimary} transition-colors duration-300 flex flex-col relative overflow-hidden`}
    >
      <Header />

      <main className="flex-1 max-w-[1600px] mx-auto px-6 py-8 w-full">
        {/* HERO */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-3 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Generate Any Data You Need, Instantly
          </h2>
          <p className={`text-base ${textSecondary}`}>
            AI-powered JSON generation • Make it live when you need an API
          </p>
        </motion.div>

        {/* MAIN PANELS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* LEFT PANEL */}
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
              aria-label={
                isGenerating ? "Generating data" : "Generate JSON data"
              }
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

          {/* RIGHT PANEL */}
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
              <motion.div
                key="results"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className={`${cardBg} border ${borderColor} rounded-2xl p-8 shadow-xl flex flex-col relative`}
              >
                {/* Saving shimmer */}
                {isSaving && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-purple-500/10 rounded-2xl"
                    animate={{ opacity: [0.4, 0.8, 0.4] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                )}

                {/* Header */}
                <div className="flex items-center justify-between mb-4 z-10">
                  <h3 className="text-xl font-bold">Generated Data</h3>

                  <div className="flex items-center gap-2">
                    {/* Copy JSON Button */}
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleCopyJson}
                      className={`p-2 ${
                        isDark ? "hover:bg-gray-800" : "hover:bg-gray-100"
                      } rounded-lg transition-colors`}
                      aria-label={
                        copiedJson ? "JSON copied" : "Copy JSON to clipboard"
                      }
                      title="Copy JSON"
                    >
                      {copiedJson ? (
                        <Check className="w-5 h-5 text-green-500" />
                      ) : (
                        <Copy className="w-5 h-5" />
                      )}
                    </motion.button>

                    {/* Clear Button */}
                    <motion.button
                      whileHover={{ scale: 1.1, rotate: 90 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={handleClear}
                      className={`p-2 ${
                        isDark ? "hover:bg-gray-800" : "hover:bg-gray-100"
                      } rounded-lg transition-colors`}
                      aria-label="Clear generated data"
                      title="Clear"
                    >
                      <X className="w-5 h-5" />
                    </motion.button>
                  </div>
                </div>

                {/* JSON preview */}
                <div
                  className={`${
                    isDark ? "bg-gray-800" : "bg-gray-50"
                  } rounded-xl p-4 overflow-auto max-h-80 border ${borderColor} z-10`}
                >
                  <pre className="text-sm whitespace-pre-wrap font-mono">
                    {JSON.stringify(generatedData, null, 2)}
                  </pre>
                </div>

                {/* CREATE LIVE URL */}
                {!apiUrl && (
                  <div className="mt-6 flex items-center gap-2">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleCreateUrl}
                      disabled={isSaving}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed z-10"
                      aria-label={
                        isSaving ? "Creating live URL" : "Make data live"
                      }
                      aria-busy={isSaving}
                    >
                      {isSaving ? (
                        <>
                          <RefreshCw className="w-5 h-5 animate-spin" />
                          Creating Live URL...
                        </>
                      ) : (
                        <>
                          <Link2 className="w-5 h-5" />
                          Make Data Live
                        </>
                      )}
                    </motion.button>

                    {/* Info Icon with Tooltip */}
                    <div className="relative group">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className={`p-2 rounded-full border-2 ${
                          isDark
                            ? "border-purple-500 text-purple-400 hover:bg-purple-500/10"
                            : "border-purple-500 text-purple-600 hover:bg-purple-50"
                        } transition-colors z-10`}
                        aria-label="Information about live URL"
                        type="button"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </motion.button>

                      {/* Tooltip */}
                      <div
                        className={`absolute bottom-full right-0 mb-2 w-72 p-4 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform group-hover:translate-y-0 translate-y-2 z-50 ${
                          isDark
                            ? "bg-gray-800 border border-gray-700 text-gray-200"
                            : "bg-white border border-gray-200 text-gray-700"
                        }`}
                        role="tooltip"
                      >
                        <div className="space-y-2">
                          <h4 className="font-semibold text-sm flex items-center gap-2">
                            <Link2 className="w-4 h-4 text-purple-500" />
                            What is Live URL?
                          </h4>
                          <p className="text-xs leading-relaxed">
                            Creates a public API endpoint that serves your
                            generated JSON data. Perfect for:
                          </p>
                          <ul className="text-xs space-y-1 list-disc list-inside">
                            <li>Testing frontend applications</li>
                            <li>Prototyping without a backend</li>
                            <li>Sharing mock data with your team</li>
                            <li>Quick API demonstrations</li>
                          </ul>
                          <p
                            className={`text-xs pt-2 border-t ${
                              isDark ? "border-gray-700" : "border-gray-200"
                            }`}
                          >
                            <strong>Note:</strong> URL expires in 7 days or
                            after 3 days of inactivity.
                          </p>
                        </div>

                        {/* Arrow pointer */}
                        <div
                          className={`absolute top-full right-4 w-3 h-3 transform rotate-45 -mt-1.5 ${
                            isDark
                              ? "bg-gray-800 border-r border-b border-gray-700"
                              : "bg-white border-r border-b border-gray-200"
                          }`}
                        ></div>
                      </div>
                    </div>
                  </div>
                )}

                {/* LIVE API URL BLOCK + WARNING */}
                {apiUrl && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 space-y-4 z-10"
                  >
                    <label
                      className={`block text-sm font-medium ${textSecondary}`}
                      htmlFor="api-url-input"
                    >
                      Live API URL
                    </label>

                    <div className="flex gap-2 items-center">
                      <input
                        id="api-url-input"
                        value={apiUrl}
                        readOnly
                        className={`flex-1 px-4 py-2 border ${borderColor} rounded-lg text-sm font-mono ${
                          isDark
                            ? "bg-gray-800 border-gray-700"
                            : "bg-gray-50 border-gray-300"
                        }`}
                        aria-label="Generated API URL"
                      />

                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleCopy(apiUrl)}
                        className={`px-4 py-2 rounded-lg ${
                          isDark
                            ? "bg-gray-800 hover:bg-gray-700"
                            : "bg-gray-100 hover:bg-gray-200"
                        } transition-colors`}
                        aria-label={
                          copied ? "URL copied" : "Copy URL to clipboard"
                        }
                      >
                        {copied ? (
                          <Check className="w-5 h-5 text-green-500" />
                        ) : (
                          <Copy className="w-5 h-5" />
                        )}
                      </motion.button>
                    </div>

                    {/* WARNING BOX */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className={`rounded-xl border p-4 flex gap-3 text-sm ${
                        isDark
                          ? "border-yellow-700 bg-yellow-900/20 text-yellow-300"
                          : "border-yellow-400 bg-yellow-50 text-yellow-800"
                      }`}
                      role="alert"
                      aria-live="polite"
                    >
                      <AlertTriangle
                        className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                          isDark ? "text-yellow-400" : "text-yellow-600"
                        }`}
                        aria-hidden="true"
                      />

                      <div className="space-y-1">
                        <p className="font-medium">Live URL Rules</p>
                        <ul className="list-disc list-inside space-y-1">
                          <li>
                            This URL expires in{" "}
                            <span className="font-semibold">7 days</span>.
                          </li>
                          <li>
                            If nobody fetches this URL for{" "}
                            <span className="font-semibold">
                              3 consecutive days
                            </span>
                            , it will be auto-deleted.
                          </li>
                          <li>
                            Once deleted, the URL and data cannot be recovered.
                          </li>
                        </ul>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </motion.div>
            ) : (
              <EmptyState
                key="empty"
                isDark={isDark}
                textPrimary={textPrimary}
                textSecondary={textSecondary}
              />
            )}
          </AnimatePresence>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default JsonGeneratorApp;

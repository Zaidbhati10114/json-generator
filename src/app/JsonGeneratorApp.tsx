"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, RefreshCw, Link2, Check, Copy, X } from "lucide-react";
import { useTheme } from "./components/context/ThemeContext";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import QuickTemplates from "./components/generator/QuickTemplate";
import PromptInput from "./components/generator/PromptInput";
import FeaturesList from "./components/generator/FeaturesList";
import EmptyState from "./components/generator/EmptyState";

const JsonGeneratorApp = () => {
  const { isDark } = useTheme();
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [generatedData, setGeneratedData] = useState<any>(null);
  const [apiUrl, setApiUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const bgClass = isDark ? "bg-gray-950" : "bg-gray-50";
  const cardBg = isDark ? "bg-gray-900" : "bg-white";
  const textPrimary = isDark ? "text-white" : "text-gray-900";
  const textSecondary = isDark ? "text-gray-400" : "text-gray-600";
  const borderColor = isDark ? "border-gray-800" : "border-gray-200";

  // --- GENERATE DATA ---
  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    setGeneratedData(null);
    setApiUrl("");

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to generate data");
      setGeneratedData(json.generatedData);
    } catch (error) {
      console.error("Error generating data:", error);
      alert("Error generating data. Try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  // --- MAKE DATA LIVE ---
  const handleCreateUrl = async () => {
    if (!generatedData) return;
    setIsSaving(true);
    try {
      const res = await fetch("/api/live", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: generatedData, prompt }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to create live URL");

      setApiUrl(json.apiUrl);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 4000);
    } catch (error) {
      console.error("Error creating live URL:", error);
      alert("Error creating live URL. Try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    setGeneratedData(null);
    setApiUrl("");
    setPrompt("");
  };

  return (
    <div
      className={`min-h-screen ${bgClass} ${textPrimary} transition-colors duration-300 flex flex-col relative overflow-hidden`}
    >
      {/* {showConfetti && <Confetti recycle={false} numberOfPieces={180} />} */}

      <Header />

      <main className="flex-1 max-w-[1600px] mx-auto px-6 py-8 w-full">
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* LEFT PANEL */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`${cardBg} border ${borderColor} rounded-2xl p-8 shadow-xl relative`}
          >
            {/* Shimmer effect while generating */}
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

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={handleGenerate}
              disabled={!prompt.trim() || isGenerating}
              className="w-full px-6 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold text-lg disabled:opacity-50 flex items-center justify-center gap-3 relative overflow-hidden"
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
              <FeaturesList
                key="features"
                isDark={isDark}
                textSecondary={textSecondary}
              />
            ) : generatedData ? (
              <motion.div
                key="results"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className={`${cardBg} border ${borderColor} rounded-2xl p-8 shadow-xl flex flex-col relative`}
              >
                {/* Pulsing gradient while saving */}
                {isSaving && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-purple-500/10"
                    animate={{
                      opacity: [0.4, 0.8, 0.4],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    style={{
                      pointerEvents: "none",
                    }}
                  />
                )}

                <div className="flex items-center justify-between mb-4 relative z-10">
                  <h3 className="text-xl font-bold">Generated Data</h3>
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleClear}
                    className={`p-2 ${
                      isDark ? "hover:bg-gray-800" : "hover:bg-gray-100"
                    } rounded-lg transition-colors`}
                  >
                    <X className="w-5 h-5" />
                  </motion.button>
                </div>

                <div
                  className={`${
                    isDark ? "bg-gray-800" : "bg-gray-50"
                  } rounded-xl p-4 overflow-auto max-h-80 border ${borderColor} relative z-10`}
                >
                  <pre className="text-sm whitespace-pre-wrap">
                    {JSON.stringify(generatedData, null, 2)}
                  </pre>
                </div>

                {/* Create Live URL */}
                {!apiUrl && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleCreateUrl}
                    disabled={isSaving}
                    className="mt-6 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium flex items-center justify-center gap-2 disabled:opacity-50 z-10"
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
                )}

                {/* API URL Display */}
                {apiUrl && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 z-10"
                  >
                    <label
                      className={`block text-sm font-medium mb-2 ${textSecondary}`}
                    >
                      Live API URL
                    </label>
                    <div className="flex gap-2 items-center">
                      <input
                        value={apiUrl}
                        readOnly
                        className={`flex-1 px-4 py-2 border ${borderColor} rounded-lg text-sm font-mono ${
                          isDark
                            ? "bg-gray-800 border-gray-700"
                            : "bg-gray-50 border-gray-300"
                        }`}
                      />
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleCopy(apiUrl)}
                        className={`px-4 py-2 rounded-lg ${
                          isDark
                            ? "bg-gray-800 hover:bg-gray-700"
                            : "bg-gray-100 hover:bg-gray-200"
                        }`}
                      >
                        {copied ? (
                          <Check className="w-5 h-5 text-green-500" />
                        ) : (
                          <Copy className="w-5 h-5" />
                        )}
                      </motion.button>
                    </div>
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

"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Sun, Moon, RefreshCw, Sparkles, Database } from "lucide-react";
import Header from "./components/layout/Header";
import QuickTemplates from "./components/generator/QuickTemplate";
import PromptInput from "./components/generator/PromptInput";
import FeaturesList from "./components/generator/FeaturesList";
import GeneratedResults from "./components/generator/GeneratedResults";
import EmptyState from "./components/generator/EmptyState";
import Footer from "./components/layout/Footer";
import { useTheme } from "./components/context/ThemeContext";

const JsonGeneratorApp = () => {
  const { isDark } = useTheme();
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedData, setGeneratedData] = useState(null);
  const [showUrlOptions, setShowUrlOptions] = useState(false);
  const [apiUrl, setApiUrl] = useState("");

  const bgClass = isDark ? "bg-gray-950" : "bg-gray-50";
  const cardBg = isDark ? "bg-gray-900" : "bg-white";
  const textPrimary = isDark ? "text-white" : "text-gray-900";
  const textSecondary = isDark ? "text-gray-400" : "text-gray-600";
  const borderColor = isDark ? "border-gray-800" : "border-gray-200";

  const handleGenerate = () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    setGeneratedData(null);

    setTimeout(() => {
      setGeneratedData({
        users: [{ id: 1, name: "John Doe" }],
        metadata: { generated_at: new Date().toISOString() },
      });
      setIsGenerating(false);
      setShowUrlOptions(true);
    }, 2000);
  };

  const handleClear = () => {
    setGeneratedData(null);
    setPrompt("");
    setApiUrl("");
    setShowUrlOptions(false);
  };

  return (
    <div
      className={`flex flex-col min-h-screen ${bgClass} ${textPrimary} transition-colors duration-300`}
    >
      <Header />

      <div className="flex-grow">
        <div className="max-w-[1600px] mx-auto px-6 py-8">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-10"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-3 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Generate Any Data You Need, Instantly
            </h2>
            <p className={`text-base ${textSecondary}`}>
              AI-powered JSON generation • No signup required • Optional live
              APIs
            </p>
          </motion.div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div
              className={`${cardBg} border ${borderColor} rounded-2xl p-8 shadow-xl`}
            >
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
                className="w-full px-6 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold text-lg disabled:opacity-50 flex items-center justify-center gap-3"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-6 h-6 animate-spin" /> Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-6 h-6" /> Generate Data
                  </>
                )}
              </motion.button>
            </div>

            {/* Right Section */}
            <AnimatePresence mode="wait">
              {isGenerating ? (
                <FeaturesList
                  key="features"
                  isDark={isDark}
                  textSecondary={textSecondary}
                />
              ) : generatedData ? (
                <GeneratedResults
                  key="results"
                  isDark={isDark}
                  borderColor={borderColor}
                  generatedData={generatedData}
                  showUrlOptions={showUrlOptions}
                  apiUrl={apiUrl}
                  setApiUrl={setApiUrl}
                  handleClear={handleClear}
                />
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
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default JsonGeneratorApp;

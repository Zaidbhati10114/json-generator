"use client";

import React from "react";
import { useTheme } from "./components/context/ThemeContext";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import { useJsonGenerator } from "@/hooks/useJsonGenerator";
import HeroSection from "./components/generator-new/hero-section";
import InputPanel from "./components/generator-new/input-panel";
import ResultsPanel from "./components/generator-new/results-panel";

const JsonGeneratorApp: React.FC = () => {
  const { isDark } = useTheme();
  const jsonGeneratorState = useJsonGenerator();

  // Theme classes
  const bgClass = isDark ? "bg-gray-950" : "bg-gray-50";
  const textPrimary = isDark ? "text-white" : "text-gray-900";

  return (
    <div
      className={`min-h-screen ${bgClass} ${textPrimary} transition-colors duration-300 flex flex-col relative overflow-hidden`}
    >
      <Header />

      <main className="flex-1 max-w-[1600px] mx-auto px-6 py-8 w-full">
        <HeroSection isDark={isDark} />

        {/* MAIN PANELS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <InputPanel isDark={isDark} {...jsonGeneratorState} />
          <ResultsPanel isDark={isDark} {...jsonGeneratorState} />
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default JsonGeneratorApp;

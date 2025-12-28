import React from "react";
import { motion } from "framer-motion";

interface HeroSectionProps {
  isDark: boolean;
}

const HeroSection: React.FC<HeroSectionProps> = ({ isDark }) => {
  const textSecondary = isDark ? "text-gray-400" : "text-gray-600";

  return (
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
  );
};

export default HeroSection;

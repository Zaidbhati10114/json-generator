"use client";

import { useTheme } from "../context/ThemeContext";

const Footer = () => {
  const { isDark } = useTheme();
  const borderColor = isDark ? "border-gray-800" : "border-gray-200";
  const textSecondary = isDark ? "text-gray-400" : "text-gray-600";

  return (
    <footer
      className={`mt-auto border-t ${borderColor} backdrop-blur-xl bg-gradient-to-t 
        from-transparent to-black/5 dark:to-white/5 transition-colors duration-500`}
    >
      <div className="max-w-[1600px] mx-auto px-6 py-6">
        <p className={`text-center text-sm ${textSecondary}`}>
          Built with{" "}
          <span className="text-purple-400 font-medium">Next.js</span>,{" "}
          <span className="text-pink-400 font-medium">Shadcn UI</span>, and{" "}
          <span className="text-purple-400 font-medium">AI</span> • No signup
          required
        </p>
      </div>
    </footer>
  );
};

export default Footer;

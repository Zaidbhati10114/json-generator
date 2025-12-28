// contexts/StyleContext.tsx
"use client";

import { createContext, useContext, ReactNode, useMemo } from "react";
import { useTheme } from "./ThemeContext";

interface StyleContextValue {
  textPrimary: string;
  textSecondary: string;
  cardBg: string;
  borderColor: string;
}

const StyleContext = createContext<StyleContextValue | undefined>(undefined);

export const useStyle = () => {
  const context = useContext(StyleContext);
  if (!context) throw new Error("useStyle must be used within StyleProvider");
  return context;
};

export const StyleProvider = ({ children }: { children: ReactNode }) => {
  const { isDark } = useTheme(); // Uses existing ThemeContext from layout

  const value = useMemo<StyleContextValue>(
    () => ({
      textPrimary: isDark ? "text-white" : "text-gray-900",
      textSecondary: isDark ? "text-gray-400" : "text-gray-600",
      cardBg: isDark ? "bg-gray-900" : "bg-white",
      borderColor: isDark ? "border-gray-700" : "border-gray-200",
    }),
    [isDark]
  );

  return (
    <StyleContext.Provider value={value}>{children}</StyleContext.Provider>
  );
};

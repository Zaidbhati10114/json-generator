"use client";
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

// 🧩 Define the shape of your context
interface ThemeContextType {
  isDark: boolean;
  toggleTheme: () => void;
}

// 🧩 Create context with a proper type
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// 🧩 Define props for ThemeProvider
interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  // ✅ Default theme is dark
  const [isDark, setIsDark] = useState(true);

  // Load user preference from localStorage if available
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      setIsDark(savedTheme === "dark");
    } else {
      // Default stays dark (no system preference check)
      setIsDark(true);
    }
  }, []);

  // Sync localStorage + HTML class for Tailwind
  useEffect(() => {
    localStorage.setItem("theme", isDark ? "dark" : "light");

    if (isDark) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, [isDark]);

  const toggleTheme = () => setIsDark((prev) => !prev);

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// 🧩 Custom Hook with safety check
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

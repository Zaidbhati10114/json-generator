// components/ResultHeader.tsx
import { Check, Copy, X } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { useResultActions } from "../context/ResultsActionsContext";
import { IconButton } from "./IconButton";

export function ResultHeader() {
  const { isDark } = useTheme(); // From layout
  const { copiedJson, handleCopyJson, handleClear } = useResultActions();

  return (
    <div className="flex items-center justify-between mb-4 z-10">
      <h3 className="text-xl font-bold">Generated Data</h3>
      <div className="flex gap-2">
        <IconButton
          onClick={handleCopyJson}
          isDark={isDark}
          icon={copiedJson ? Check : Copy}
          success={copiedJson}
          label="Copy JSON"
        />
        <IconButton
          onClick={handleClear}
          isDark={isDark}
          icon={X}
          rotateOnHover
          label="Clear"
        />
      </div>
    </div>
  );
}

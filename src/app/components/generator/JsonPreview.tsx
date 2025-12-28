// components/JsonPreview.tsx

import { GeneratedData } from "../../../../types";
import { useStyle } from "../context/StyleContext";
import { useTheme } from "../context/ThemeContext";

interface JsonPreviewProps {
  data: GeneratedData;
}

export function JsonPreview({ data }: JsonPreviewProps) {
  const { isDark } = useTheme(); // From layout
  const { borderColor } = useStyle();

  return (
    <div
      className={`rounded-xl p-4 max-h-80 overflow-auto border ${borderColor} ${
        isDark ? "bg-gray-800" : "bg-gray-50"
      }`}
    >
      <pre className="text-sm font-mono whitespace-pre-wrap">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
}

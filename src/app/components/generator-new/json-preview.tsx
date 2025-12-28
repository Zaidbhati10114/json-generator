import React from "react";

interface JsonPreviewProps {
  data: any;
  isDark: boolean;
}

const JsonPreview: React.FC<JsonPreviewProps> = ({ data, isDark }) => {
  const borderColor = isDark ? "border-gray-800" : "border-gray-200";

  return (
    <div
      className={`${
        isDark ? "bg-gray-800" : "bg-gray-50"
      } rounded-xl p-4 overflow-auto max-h-80 border ${borderColor} relative z-[1]`}
    >
      <pre className="text-sm whitespace-pre-wrap font-mono">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
};

export default JsonPreview;

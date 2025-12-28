import React from "react";
import { Link2 } from "lucide-react";

interface LiveUrlTooltipProps {
  isDark: boolean;
}

const LiveUrlTooltip: React.FC<LiveUrlTooltipProps> = ({ isDark }) => {
  return (
    <div className="absolute top-2 right-2 group/info">
      <span className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm hover:bg-white/30 transition-colors cursor-help">
        <svg
          className="w-3.5 h-3.5 text-white"
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
            clipRule="evenodd"
          />
        </svg>
      </span>

      <div
        className={`absolute bottom-full right-0 mb-3 w-72 p-4 rounded-xl shadow-2xl opacity-0 invisible group-hover/info:opacity-100 group-hover/info:visible transition-all duration-300 transform group-hover/info:translate-y-0 translate-y-2 pointer-events-none ${
          isDark
            ? "bg-gray-800 border border-gray-700 text-gray-200"
            : "bg-white border border-gray-200 text-gray-700"
        }`}
        style={{ zIndex: 9999 }}
        role="tooltip"
      >
        <div className="space-y-2">
          <h4 className="font-semibold text-sm flex items-center gap-2">
            <Link2 className="w-4 h-4 text-purple-500" />
            What is Live URL?
          </h4>
          <p className="text-xs leading-relaxed">
            Creates a public API endpoint that serves your generated JSON data.
            Perfect for:
          </p>
          <ul className="text-xs space-y-1 list-disc list-inside">
            <li>Testing frontend applications</li>
            <li>Prototyping without a backend</li>
            <li>Sharing mock data with your team</li>
            <li>Quick API demonstrations</li>
          </ul>
          <p
            className={`text-xs pt-2 border-t ${
              isDark ? "border-gray-700" : "border-gray-200"
            }`}
          >
            <strong>Note:</strong> URL expires in 7 days or after 3 days of
            inactivity.
          </p>
        </div>

        <div
          className={`absolute top-full right-4 w-3 h-3 transform rotate-45 -mt-1.5 ${
            isDark
              ? "bg-gray-800 border-r border-b border-gray-700"
              : "bg-white border-r border-b border-gray-200"
          }`}
        ></div>
      </div>
    </div>
  );
};

export default LiveUrlTooltip;

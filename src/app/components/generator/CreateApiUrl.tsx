"use client";
import { motion } from "framer-motion";
import { Link2, RefreshCw, Copy, Check, Clock, Code } from "lucide-react";
import { Dispatch, SetStateAction, useState } from "react";

interface CreateApiProps {
  isDark: boolean;
  borderColor: string;
  generatedData?: any; // You can refine this later to your actual data shape
  showUrlOptions: boolean;
  apiUrl: string;
  setApiUrl: Dispatch<SetStateAction<string>>;
}

const CreateApiUrl = ({
  showUrlOptions,
  apiUrl,
  setApiUrl,
  isDark,
  borderColor,
}: CreateApiProps) => {
  const [isCreatingUrl, setIsCreatingUrl] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCreateUrl = () => {
    setIsCreatingUrl(true);
    setTimeout(() => {
      setApiUrl(
        `https://yourapp.com/api/${Math.random().toString(36).substr(2, 9)}`
      );
      setIsCreatingUrl(false);
    }, 1500);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (showUrlOptions && !apiUrl) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`p-6 ${
          isDark
            ? "bg-gradient-to-br from-purple-500/10 to-pink-500/10"
            : "bg-gradient-to-br from-purple-50 to-pink-50"
        } border border-purple-500/20 rounded-xl mb-6`}
      >
        <div className="flex items-start gap-3">
          <div className="p-2 bg-purple-500 rounded-lg">
            <Link2 className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold mb-1">Want a Live API URL?</h4>
            <p
              className={`text-sm ${
                isDark ? "text-gray-400" : "text-gray-600"
              } mb-3`}
            >
              Create a REST endpoint to fetch this data from anywhere. Your URL
              will be active for 7 days.
            </p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleCreateUrl}
              disabled={isCreatingUrl}
              className="w-full px-4 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isCreatingUrl ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Creating URL...
                </>
              ) : (
                <>
                  <Link2 className="w-4 h-4" /> Create Live API URL
                </>
              )}
            </motion.button>
          </div>
        </div>
      </motion.div>
    );
  }

  if (apiUrl) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <label
          className={`block text-sm font-medium mb-2 ${
            isDark ? "text-gray-400" : "text-gray-600"
          }`}
        >
          Your Live API URL
        </label>
        <div className="flex gap-2 mb-3">
          <input
            value={apiUrl}
            readOnly
            className={`flex-1 px-4 py-3 ${
              isDark
                ? "bg-gray-800 border-gray-700"
                : "bg-gray-50 border-gray-300"
            } border rounded-lg text-sm font-mono`}
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleCopy(apiUrl)}
            className={`px-4 py-3 ${
              isDark
                ? "bg-gray-800 hover:bg-gray-700"
                : "bg-gray-100 hover:bg-gray-200"
            } rounded-lg`}
          >
            {copied ? (
              <Check className="w-5 h-5 text-green-500" />
            ) : (
              <Copy className="w-5 h-5" />
            )}
          </motion.button>
        </div>
        <div
          className={`flex items-start gap-2 text-xs ${
            isDark ? "text-gray-400" : "text-gray-600"
          } bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3`}
        >
          <Clock className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
          <span>
            This URL will remain active for 7 days.{" "}
            <span className="text-purple-400 cursor-pointer hover:underline font-medium">
              Create a free account
            </span>{" "}
            to keep it forever.
          </span>
        </div>

        {/* Code Example */}
        <div className="mt-4 relative">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() =>
              handleCopy(
                `fetch('${apiUrl}')\n  .then(res => res.json())\n  .then(data => console.log(data))`
              )
            }
            className={`absolute top-3 right-3 p-2 ${
              isDark ? "hover:bg-gray-700" : "hover:bg-gray-200"
            } rounded-lg`}
          >
            <Code className="w-4 h-4" />
          </motion.button>
          <pre
            className={`text-sm ${
              isDark ? "bg-gray-800" : "bg-gray-50"
            } rounded-xl p-4 border ${borderColor}`}
          >
            <code>{`fetch('${apiUrl}')\n  .then(res => res.json())\n  .then(data => console.log(data))`}</code>
          </pre>
        </div>
      </motion.div>
    );
  }

  return null;
};

export default CreateApiUrl;

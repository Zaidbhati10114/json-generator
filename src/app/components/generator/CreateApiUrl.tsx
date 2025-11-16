"use client";

import { motion } from "framer-motion";
import {
  Link2,
  RefreshCw,
  Copy,
  Check,
  Code,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { useState } from "react";

interface CreateApiUrlProps {
  showUrlOptions: boolean;
  apiUrl: string;
  setApiUrl: (value: string) => void;
  isDark: boolean;
  borderColor: string;
}

const CreateApiUrl = ({
  showUrlOptions,
  apiUrl,
  setApiUrl,
  isDark,
  borderColor,
}: CreateApiUrlProps) => {
  const [isCreatingUrl, setIsCreatingUrl] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleCreateUrl = async () => {
    setIsCreatingUrl(true);

    // simulate actual create-live-url API call
    setTimeout(() => {
      setApiUrl(
        `https://yourapp.com/api/${Math.random().toString(36).substr(2, 9)}`
      );
      setIsCreatingUrl(false);
    }, 1500);
  };

  return (
    <div className="mt-8">
      {/* Show Create URL Option */}
      {showUrlOptions && !apiUrl && (
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
              <h4 className="font-semibold">Make This Data Live</h4>
              <p
                className={`text-sm mt-1 ${
                  isDark ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Create a temporary API endpoint to fetch this dataset from
                anywhere. Valid for 7 days.
              </p>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleCreateUrl}
                disabled={isCreatingUrl}
                className="w-full mt-4 px-4 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isCreatingUrl ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Creating URL...
                  </>
                ) : (
                  <>
                    <Link2 className="w-4 h-4" />
                    Create Live API URL button
                  </>
                )}
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Display Live URL */}
      {apiUrl && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="mb-6">
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

            {/* ⚠️ URL Rules Warning */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className={`mt-2 rounded-xl border ${
                isDark
                  ? "border-yellow-700 bg-yellow-900/20"
                  : "border-yellow-300 bg-yellow-50"
              } p-4 flex items-start gap-3`}
            >
              <AlertTriangle
                className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                  isDark ? "text-yellow-400" : "text-yellow-600"
                }`}
              />

              <div className="text-sm leading-relaxed">
                <p className={isDark ? "text-gray-300" : "text-gray-700"}>
                  ⚠️ <span className="font-semibold">Important:</span> This
                  temporary API URL will automatically expire in{" "}
                  <span className="font-semibold text-yellow-600 dark:text-yellow-400">
                    7 days
                  </span>
                  .
                </p>

                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>
                    If no one fetches this URL for{" "}
                    <span className="font-semibold text-yellow-600 dark:text-yellow-400">
                      3 consecutive days
                    </span>
                    , it will be deleted automatically.
                  </li>
                  <li>Expired URLs cannot be recovered.</li>
                  <li>You can generate a new live URL anytime.</li>
                </ul>
              </div>
            </motion.div>

            {/* Code Example */}
            <div className="mt-6">
              <label
                className={`block text-sm font-medium mb-3 ${
                  isDark ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Code Example
              </label>

              <div
                className={`${
                  isDark ? "bg-gray-800" : "bg-gray-50"
                } rounded-xl p-4 border ${borderColor} relative`}
              >
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

                <pre className="text-sm pr-10">
                  <code className="text-purple-400">{`fetch`}</code>
                  <code>{`('${apiUrl}')
  .`}</code>
                  <code className="text-blue-400">then</code>
                  <code>{`(res => res.json())
  .`}</code>
                  <code className="text-blue-400">then</code>
                  <code>{`(data => console.log(data))`}</code>
                </pre>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default CreateApiUrl;

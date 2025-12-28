import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link2, RefreshCw } from "lucide-react";
import LiveUrlTooltip from "./live-url-tooltip";

interface LiveUrlSectionProps {
  isDark: boolean;
  handleCreateUrl: () => void;
}

const LiveUrlSection: React.FC<LiveUrlSectionProps> = ({
  isDark,
  handleCreateUrl,
}) => {
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const onCreateUrl = async () => {
    setIsSaving(true);
    await handleCreateUrl();
    setIsSaving(false);
  };

  return (
    <div className="mt-6 relative z-[100]">
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onCreateUrl}
        disabled={isSaving}
        className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed relative"
        aria-label={isSaving ? "Creating live URL" : "Make data live"}
        aria-busy={isSaving}
      >
        {isSaving ? (
          <>
            <RefreshCw className="w-5 h-5 animate-spin" />
            Creating Live URL...
          </>
        ) : (
          <>
            <Link2 className="w-5 h-5" />
            Make Data Live
          </>
        )}
      </motion.button>

      {!isSaving && <LiveUrlTooltip isDark={isDark} />}
    </div>
  );
};

export default LiveUrlSection;

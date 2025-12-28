// components/LiveUrlCTA.tsx
import { motion } from "framer-motion";
import { RefreshCw, Link2 } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { useResultActions } from "../context/ResultsActionsContext";
import { LiveUrlTooltip } from "./LiveUrlTooltip";

export function LiveUrlCTA() {
  const { isDark } = useTheme(); // From layout
  const { isSaving, handleCreateUrl } = useResultActions();

  return (
    <div className="mt-6 relative z-10">
      <motion.button
        onClick={handleCreateUrl}
        disabled={isSaving}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl flex justify-center gap-2"
      >
        {isSaving ? (
          <>
            <RefreshCw className="animate-spin w-5 h-5" />
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
}

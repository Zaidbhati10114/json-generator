// components/GeneratedResultCard.tsx
import { motion } from "framer-motion";

import { GeneratedData } from "../../../../types";
import { useTheme } from "../context/ThemeContext";
import { useStyle } from "../context/StyleContext";
import { useResultActions } from "../context/ResultsActionsContext";
import { ResultHeader } from "./ResultsHeader";
import { JsonPreview } from "./JsonPreview";
import { LiveUrlCTA } from "./LiveUrlCTA";
import { LiveApiSection } from "./LiveApiSection";

interface GeneratedResultCardProps {
  generatedData: GeneratedData;
}

export function GeneratedResultCard({
  generatedData,
}: GeneratedResultCardProps) {
  const { isDark } = useTheme();
  const { cardBg, borderColor } = useStyle();
  const { isSaving, apiUrl } = useResultActions();

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className={`${cardBg} border ${borderColor} rounded-2xl p-8 shadow-xl flex flex-col relative`}
    >
      {/* {isSaving && <SavingOverlay />} */}
      {isSaving && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-purple-500/10 rounded-2xl"
          animate={{ opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      )}

      <ResultHeader />

      <JsonPreview data={generatedData} />

      {!apiUrl && <LiveUrlCTA />}

      {/* {apiUrl && <LiveApiSection />} */}
    </motion.div>
  );
}

// components/RightOutputPanel.tsx
import { AnimatePresence } from "framer-motion";
import { AdaptiveSkeleton } from "../generator/AdaptiveSkeleton";
import { getPromptCategory } from "@/lib/utils";
import { GeneratedData } from "../../../../types";

import EmptyState from "../generator/EmptyState";
import { GeneratedResultCard } from "../generator/GeneratedResultsCard";
import { useTheme } from "../context/ThemeContext";
import { StyleProvider, useStyle } from "../context/StyleContext";
import { ResultActionsProvider } from "../context/ResultsActionsContext";

interface RightOutputPanelProps {
  isGenerating: boolean;
  generatedData: GeneratedData;
  apiUrl: string;
  prompt: string;
  isSaving: boolean;
  copiedJson: boolean;
  copied: boolean;
  handleCopyJson: () => void;
  handleClear: () => void;
  handleCreateUrl: () => void;
  handleCopy: (url: string) => void;
}

// Internal component to access style context
const RightOutputPanelContent = ({
  isGenerating,
  generatedData,
  prompt,
  actionsValue,
}: {
  isGenerating: boolean;
  generatedData: GeneratedData;
  prompt: string;
  actionsValue: any;
}) => {
  const { isDark } = useTheme();
  const { textPrimary, textSecondary, cardBg, borderColor } = useStyle();

  return (
    <ResultActionsProvider value={actionsValue}>
      <AnimatePresence mode="wait">
        {isGenerating ? (
          <AdaptiveSkeleton
            key="skeleton"
            category={getPromptCategory(prompt)}
            textSecondary={textSecondary}
            cardBg={cardBg}
            borderColor={borderColor}
          />
        ) : generatedData ? (
          <GeneratedResultCard key="results" generatedData={generatedData} />
        ) : (
          <EmptyState
            key="empty"
            isDark={isDark}
            textPrimary={textPrimary}
            textSecondary={textSecondary}
          />
        )}
      </AnimatePresence>
    </ResultActionsProvider>
  );
};

export const RightOutputPanel = ({
  isGenerating,
  generatedData,
  apiUrl,
  prompt,
  isSaving,
  copiedJson,
  copied,
  handleCopyJson,
  handleClear,
  handleCreateUrl,
  handleCopy,
}: RightOutputPanelProps) => {
  const actionsValue = {
    apiUrl,
    isSaving,
    copiedJson,
    copied,
    handleCopyJson,
    handleClear,
    handleCreateUrl,
    handleCopy,
  };

  return (
    <StyleProvider>
      <RightOutputPanelContent
        isGenerating={isGenerating}
        generatedData={generatedData}
        prompt={prompt}
        actionsValue={actionsValue}
      />
    </StyleProvider>
  );
};

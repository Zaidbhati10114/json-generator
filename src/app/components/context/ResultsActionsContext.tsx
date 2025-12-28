// contexts/ResultActionsContext.tsx
"use client";

import { createContext, useContext, ReactNode } from "react";

interface ResultActionsContextValue {
  copiedJson: boolean;
  handleCopyJson: () => void;
  handleClear: () => void;
  apiUrl: string;
  isSaving: boolean;
  handleCreateUrl: () => void;
  copied: boolean;
  handleCopy: (url: string) => void;
}

const ResultActionsContext = createContext<
  ResultActionsContextValue | undefined
>(undefined);

export const useResultActions = () => {
  const context = useContext(ResultActionsContext);
  if (!context)
    throw new Error(
      "useResultActions must be used within ResultActionsProvider"
    );
  return context;
};

export const ResultActionsProvider = ({
  children,
  value,
}: {
  children: ReactNode;
  value: ResultActionsContextValue;
}) => (
  <ResultActionsContext.Provider value={value}>
    {children}
  </ResultActionsContext.Provider>
);

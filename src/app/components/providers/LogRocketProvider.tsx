// app/components/providers/LogRocketProvider.tsx
"use client";

import { useEffect, ReactNode } from "react";
import { identifyAnonymousUser, initLogRocket } from "@/lib/logrocket";

interface LogRocketProviderProps {
  children: ReactNode;
}

export const LogRocketProvider: React.FC<LogRocketProviderProps> = ({
  children,
}) => {
  useEffect(() => {
    // Initialize LogRocket on mount
    initLogRocket();
    // identifyAnonymousUser();
    identifyAnonymousUser();
  }, []);

  return <>{children}</>;
};

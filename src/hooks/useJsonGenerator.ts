import { useState, useCallback, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useGenerateData, JSON_GENERATOR_KEYS } from "./queries/useGenerateData";
import { useCreateLiveUrl } from "./queries/useCreateLiveUrl";
import { GeneratedData } from "../../types";


export const useJsonGenerator = () => {
    const queryClient = useQueryClient();
    const [prompt, setPrompt] = useState("");
    const [apiUrl, setApiUrl] = useState("");
    const [showConfetti, setShowConfetti] = useState(false);
    const abortControllerRef = useRef<AbortController | null>(null);

    // Mutations
    const generateMutation = useGenerateData();
    const createLiveUrlMutation = useCreateLiveUrl();

    // Get cached generated data
    const generatedData = queryClient.getQueryData<GeneratedData>(
        JSON_GENERATOR_KEYS.generatedData()
    );

    const handleGenerate = useCallback(async (): Promise<void> => {
        if (!prompt.trim()) {
            return;
        }

        // Abort previous request
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        abortControllerRef.current = new AbortController();

        // Clear previous URL
        setApiUrl("");

        generateMutation.mutate({
            prompt,
            signal: abortControllerRef.current.signal,
        });
    }, [prompt, generateMutation]);

    const handleCreateUrl = useCallback(async (): Promise<void> => {
        if (!generatedData) {
            return;
        }

        const result = await createLiveUrlMutation.mutateAsync({
            data: generatedData,
            prompt,
        });

        if (result?.apiUrl) {
            setApiUrl(result.apiUrl);
            setShowConfetti(true);
            setTimeout(() => setShowConfetti(false), 4000);
        }
    }, [generatedData, prompt, createLiveUrlMutation]);

    const handleClear = useCallback((): void => {
        // Abort ongoing request
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        // Clear state
        setPrompt("");
        setApiUrl("");
        setShowConfetti(false);

        // Clear cache
        queryClient.setQueryData(JSON_GENERATOR_KEYS.generatedData(), null);
        queryClient.removeQueries({ queryKey: JSON_GENERATOR_KEYS.liveUrl() });
    }, [queryClient]);

    return {
        // State
        prompt,
        setPrompt,
        generatedData,
        apiUrl,
        showConfetti,

        // Loading states
        isGenerating: generateMutation.isPending,
        isSaving: createLiveUrlMutation.isPending,

        // Actions
        handleGenerate,
        handleCreateUrl,
        handleClear,

        // Mutation objects (for advanced usage)
        generateMutation,
        createLiveUrlMutation,
    };
};
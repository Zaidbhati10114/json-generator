import { useMutation, useQueryClient } from "@tanstack/react-query";

import { toast } from "sonner";
import { trackEvent, captureException } from "@/lib/logrocket";
import { getPromptCategory } from "@/lib/utils";
import { GenerateDataParams, jsonGeneratorApi } from "@/lib/api/jsongenerator.api";
import { GeneratedData } from "../../../types";

export const JSON_GENERATOR_KEYS = {
    all: ["jsonGenerator"] as const,
    generatedData: () => [...JSON_GENERATOR_KEYS.all, "generatedData"] as const,
    liveUrl: (dataId?: string) => [...JSON_GENERATOR_KEYS.all, "liveUrl", dataId] as const,
};

export const useGenerateData = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (params: GenerateDataParams) => jsonGeneratorApi.generateData(params),

        onMutate: async ({ prompt }) => {
            // Track event
            trackEvent("data_generation_started", {
                promptLength: prompt.length,
                category: getPromptCategory(prompt),
            });

            // Cancel outgoing refetches
            await queryClient.cancelQueries({
                queryKey: JSON_GENERATOR_KEYS.generatedData()
            });

            // Snapshot previous value for rollback
            const previousData = queryClient.getQueryData<GeneratedData>(
                JSON_GENERATOR_KEYS.generatedData()
            );

            // Optimistically update to null (loading state)
            queryClient.setQueryData<GeneratedData | null>(
                JSON_GENERATOR_KEYS.generatedData(),
                null
            );

            return { previousData };
        },

        onSuccess: (data, { prompt }) => {
            // Update cache with generated data
            queryClient.setQueryData(JSON_GENERATOR_KEYS.generatedData(), data);

            toast.success("Data generated successfully!");

            trackEvent("data_generation_success", {
                dataSize: JSON.stringify(data).length,
            });
        },

        onError: (error: any, { prompt }, context) => {
            // Rollback on error
            if (context?.previousData) {
                queryClient.setQueryData(
                    JSON_GENERATOR_KEYS.generatedData(),
                    context.previousData
                );
            }

            // Handle abort error silently
            if (error.name === "AbortError") return;

            // Handle rate limit
            if (error.statusCode === 429) {
                trackEvent("data_generation_rate_limited", {
                    retryAfter: error.retryAfter || 60,
                });
                toast.error(error.message, { duration: 5000 });
                return;
            }

            // Log error
            captureException(error, {
                context: "data_generation",
                prompt: prompt.slice(0, 100),
            });

            // Track failure
            trackEvent("data_generation_failed", {
                error: error instanceof Error ? error.message : "Unknown error",
            });

            toast.error(error.message || "Error generating data. Please try again.");
        },

        // Enable retry with exponential backoff for network errors
        retry: (failureCount, error: any) => {
            // Don't retry on rate limits or abort
            if (error.statusCode === 429 || error.name === "AbortError") {
                return false;
            }
            // Retry up to 2 times for other errors
            return failureCount < 2;
        },
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
    });
};

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { toast } from "sonner";
import { trackEvent, captureException } from "@/lib/logrocket";
import { JSON_GENERATOR_KEYS } from "./useGenerateData";
import { CreateLiveUrlParams, jsonGeneratorApi } from "@/lib/api/jsongenerator.api";

export const useCreateLiveUrl = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (params: CreateLiveUrlParams) => jsonGeneratorApi.createLiveUrl(params),

        onMutate: async () => {
            trackEvent("live_url_creation_started");

            // Cancel outgoing refetches
            await queryClient.cancelQueries({
                queryKey: JSON_GENERATOR_KEYS.liveUrl()
            });

            const previousUrl = queryClient.getQueryData<string>(
                JSON_GENERATOR_KEYS.liveUrl()
            );

            return { previousUrl };
        },

        onSuccess: (data, { data: generatedData }) => {
            // Cache the URL
            queryClient.setQueryData(
                JSON_GENERATOR_KEYS.liveUrl(data.id),
                data.apiUrl
            );

            toast.success("Live URL created!");

            trackEvent("live_url_creation_success", {
                urlId: data.id,
                dataSize: JSON.stringify(generatedData).length,
            });

            return data;
        },

        onError: (error: any, variables, context) => {
            // Rollback
            if (context?.previousUrl) {
                queryClient.setQueryData(
                    JSON_GENERATOR_KEYS.liveUrl(),
                    context.previousUrl
                );
            }

            captureException(error, {
                context: "url_creation",
            });

            trackEvent("live_url_creation_failed", {
                error: error instanceof Error ? error.message : "Unknown error",
            });

            toast.error(error.message || "Error creating live URL. Please try again.");
        },

        retry: 1,
        retryDelay: 1000,
    });
};

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { trackEvent, captureException } from "@/lib/logrocket";
import { getPromptCategory } from "@/lib/utils";
import { GeneratedData } from "../../../types";

export const JSON_GENERATOR_KEYS = {
    all: ["jsonGenerator"] as const,
    generatedData: () => [...JSON_GENERATOR_KEYS.all, "generatedData"] as const,
    liveUrl: (dataId?: string) =>
        [...JSON_GENERATOR_KEYS.all, "liveUrl", dataId] as const,
};

/**
 * Helper → sleep
 */
const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

/**
 * 🚀 NEW ASYNC GENERATION FLOW
 */
async function generateDataAsync(prompt: string): Promise<GeneratedData> {
    // 1️⃣ Create job
    const createRes = await fetch("/api/create-job", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
    });

    if (!createRes.ok) {
        throw new Error("Failed to create job");
    }

    const { jobId } = await createRes.json();

    // 2️⃣ Poll job status
    const startTime = Date.now();
    const TIMEOUT = 120000; // 2 min timeout

    while (true) {
        // timeout protection
        if (Date.now() - startTime > TIMEOUT) {
            throw new Error("Generation timed out. Please try again.");
        }

        await sleep(2000); // poll every 2 sec

        const statusRes = await fetch(`/api/job-status?id=${jobId}`);
        if (!statusRes.ok) continue;

        const job = await statusRes.json();

        if (job.status === "completed") {
            return job.result;
        }

        if (job.status === "failed") {
            throw new Error(job.error || "Generation failed");
        }

        // if pending/processing → continue polling
    }
}

export const useGenerateData = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ prompt }: { prompt: string }) =>
            generateDataAsync(prompt),

        onMutate: async ({ prompt }) => {
            trackEvent("data_generation_started", {
                promptLength: prompt.length,
                category: getPromptCategory(prompt),
            });

            await queryClient.cancelQueries({
                queryKey: JSON_GENERATOR_KEYS.generatedData(),
            });

            const previousData = queryClient.getQueryData<GeneratedData>(
                JSON_GENERATOR_KEYS.generatedData()
            );

            queryClient.setQueryData<GeneratedData | null>(
                JSON_GENERATOR_KEYS.generatedData(),
                null
            );

            return { previousData };
        },

        onSuccess: (data) => {
            queryClient.setQueryData(JSON_GENERATOR_KEYS.generatedData(), data);
            toast.success("Data generated successfully!");
            trackEvent("data_generation_success", {
                dataSize: JSON.stringify(data).length,
            });
        },

        onError: (error: any, _vars, context) => {
            if (context?.previousData) {
                queryClient.setQueryData(
                    JSON_GENERATOR_KEYS.generatedData(),
                    context.previousData
                );
            }

            captureException(error, { context: "data_generation_async" });

            toast.error(error.message || "Error generating data");
        },
    });
};

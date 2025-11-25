import { useCallback, useRef, useState } from "react";
import { GenerateApiResponse, GeneratedData, LiveApiResponse } from "../../types";
import { toast } from "sonner";
import { trackEvent, captureException } from "@/lib/logrocket";
import { getPromptCategory } from "@/lib/utils";

export const useJsonGenerator = () => {
    const [prompt, setPrompt] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedData, setGeneratedData] = useState<GeneratedData | null>(null);
    const [apiUrl, setApiUrl] = useState("");
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const abortControllerRef = useRef<AbortController | null>(null);
    const [showConfetti, setShowConfetti] = useState<boolean>(false);
    const [copied, setCopied] = useState<boolean>(false);

    const handleGenerate = useCallback(async (): Promise<void> => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        abortControllerRef.current = new AbortController();

        if (!prompt.trim()) {
            toast.error("Please enter a prompt");
            return;
        }

        // Track event with logrocket
        trackEvent("data_generation_started", {
            promptLength: prompt.length,
            category: getPromptCategory(prompt),
        });

        setIsGenerating(true);
        setGeneratedData(null);
        setApiUrl("");

        try {
            const response = await fetch("/api/generate", {
                signal: abortControllerRef.current.signal,
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ prompt }),
            });

            // Parse response
            const json: GenerateApiResponse = await response.json();

            // Handle rate limit error (429)
            if (response.status === 429) {
                const retryAfter = json.retryAfter || 60;
                toast.error(
                    `Rate limit exceeded! You can only make 3 requests per minute. Please try again in ${retryAfter} seconds.`,
                    { duration: 5000 }
                );

                trackEvent("data_generation_rate_limited", {
                    retryAfter,
                });
                return;
            }

            if (!response.ok) {
                throw new Error(json.error || "Failed to generate data");
            }

            // Validate that we got data
            if (!json.generatedData) {
                throw new Error("No data received from API");
            }

            setGeneratedData(json.generatedData);
            toast.success("Data generated successfully!");
            trackEvent("data_generation_success", {
                dataSize: JSON.stringify(json.generatedData).length,
            });
        } catch (error: any) {
            if (error.name === "AbortError") return;
            console.error("Generation error:", error);

            if (error instanceof Error) {
                captureException(error, {
                    context: "data_generation",
                    prompt: prompt.slice(0, 100), // First 100 chars only
                });
                toast.error(error.message);
            } else {
                toast.error("Error generating data. Please try again.");
            }
            // track failure
            trackEvent("data_generation_failed", {
                error: error instanceof Error ? error.message : "Unknown error",
            });
        } finally {
            setIsGenerating(false);
        }
    }, [prompt]);

    const handleCreateUrl = useCallback(async (): Promise<void> => {
        if (!generatedData) {
            toast.error("No data to create URL for");
            return;
        }

        trackEvent("live_url_creation_started");

        setIsSaving(true);

        try {
            const response = await fetch("/api/live", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    data: generatedData,
                    prompt,
                }),
            });

            const json: LiveApiResponse = await response.json();

            if (!response.ok) {
                throw new Error(json.error || "Failed to create live URL");
            }

            if (!json.apiUrl) {
                throw new Error("No URL received from API");
            }

            setApiUrl(json.apiUrl);
            setShowConfetti(true);
            toast.success("Live URL created!");

            // Track success
            trackEvent("live_url_creation_success", {
                urlId: json.id,
                dataSize: JSON.stringify(generatedData).length,
            });

            // Hide confetti after 4 seconds
            setTimeout(() => setShowConfetti(false), 4000);
        } catch (error) {
            console.error("URL creation error:", error);

            if (error instanceof Error) {
                captureException(error, {
                    context: "url_creation",
                });
                toast.error(error.message);
            } else {
                toast.error("Error creating live URL. Please try again.");
            }
            // Track failure
            trackEvent("live_url_creation_failed", {
                error: error instanceof Error ? error.message : "Unknown error",
            });
        } finally {
            setIsSaving(false);
        }
    }, [generatedData, prompt]);

    const handleClear = useCallback((): void => {
        setPrompt("");
        setGeneratedData(null);
        setApiUrl("");
        setIsGenerating(false);
        setIsSaving(false);
        setCopied(false);
    }, []);

    return {
        prompt,
        setPrompt,
        isGenerating,
        generatedData,
        apiUrl,
        handleGenerate,
        handleCreateUrl,
        handleClear,
    };
};
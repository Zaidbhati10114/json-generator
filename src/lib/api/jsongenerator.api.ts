import { GenerateApiResponse, GeneratedData, LiveApiResponse } from "../../../types";


export interface GenerateDataParams {
    prompt: string;
    signal?: AbortSignal;
}

export interface CreateLiveUrlParams {
    data: GeneratedData;
    prompt: string;
}

export const jsonGeneratorApi = {
    generateData: async ({ prompt, signal }: GenerateDataParams): Promise<GeneratedData> => {
        const response = await fetch("/api/generate", {
            signal,
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prompt }),
        });

        const json: GenerateApiResponse = await response.json();

        // Handle rate limit error (429)
        if (response.status === 429) {
            const retryAfter = json.retryAfter || 60;
            const error = new Error(
                `Rate limit exceeded! You can only make 3 requests per minute. Please try again in ${retryAfter} seconds.`
            );
            (error as any).statusCode = 429;
            (error as any).retryAfter = retryAfter;
            throw error;
        }

        if (!response.ok) {
            throw new Error(json.error || "Failed to generate data");
        }

        if (!json.generatedData) {
            throw new Error("No data received from API");
        }

        return json.generatedData;
    },

    createLiveUrl: async ({ data, prompt }: CreateLiveUrlParams): Promise<LiveApiResponse> => {
        const response = await fetch("/api/live", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ data, prompt }),
        });

        const json: LiveApiResponse = await response.json();

        if (!response.ok) {
            throw new Error(json.error || "Failed to create live URL");
        }

        if (!json.apiUrl) {
            throw new Error("No URL received from API");
        }

        return json;
    },
};


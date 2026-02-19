import arcjet from "@arcjet/next";

export const aj = arcjet({
    key: process.env.ARCJET_KEY!,
    rules: [], // Rules added per-route
});
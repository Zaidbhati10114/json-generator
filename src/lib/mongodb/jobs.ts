import { getDb } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function createJob(prompt: string) {
    const db = await getDb();

    const job = {
        prompt,
        enhancedPrompt: null,
        status: "pending",
        result: null,
        error: null,
        modelUsed: null,
        createdAt: new Date(),
        startedAt: null,
        completedAt: null,
    };

    const res = await db.collection("jobs").insertOne(job);
    return res.insertedId.toString();
}

export async function getJob(jobId: string) {
    const db = await getDb();
    return db.collection("jobs").findOne({ _id: new ObjectId(jobId) });
}

export async function getPendingJobs(limit = 5) {
    const db = await getDb();

    return db
        .collection("jobs")
        .find({ status: "pending" })
        .sort({ createdAt: 1 })
        .limit(limit)
        .toArray();
}

export async function markJobProcessing(jobId: string) {
    const db = await getDb();

    await db.collection("jobs").updateOne(
        { _id: new ObjectId(jobId) },
        {
            $set: {
                status: "processing",
                startedAt: new Date(),
            },
        }
    );
}

export async function markJobCompleted(
    jobId: string,
    result: any,
    modelUsed: string
) {
    const db = await getDb();

    await db.collection("jobs").updateOne(
        { _id: new ObjectId(jobId) },
        {
            $set: {
                status: "completed",
                result,
                modelUsed,
                completedAt: new Date(),
            },
        }
    );
}

export async function markJobFailed(jobId: string, error: string) {
    const db = await getDb();

    await db.collection("jobs").updateOne(
        { _id: new ObjectId(jobId) },
        {
            $set: {
                status: "failed",
                error,
                completedAt: new Date(),
            },
        }
    );
}

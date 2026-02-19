
import { ObjectId } from "mongodb";
import { getDb } from "../mongodb";

export async function createJob(prompt: string) {
    const db = await getDb();
    const result = await db.collection("jobs").insertOne({
        prompt,
        status: "pending",
        createdAt: new Date(),
    });

    // ⭐ Return the inserted ID as string
    return result.insertedId.toString();
}

export async function getJob(jobId: string) {
    // ⭐ Validate jobId before querying
    if (!jobId || jobId === 'undefined' || jobId === 'null') {
        throw new Error('Invalid job ID');
    }

    // Validate it's a valid ObjectId format
    if (!ObjectId.isValid(jobId)) {
        throw new Error('Invalid job ID format');
    }

    const db = await getDb();
    return db.collection("jobs").findOne({ _id: new ObjectId(jobId) });
}

export async function getPendingJobs(limit = 5) {
    const db = await getDb();
    return db
        .collection("jobs")
        .find({ status: "pending" })
        .limit(limit)
        .toArray();
}

export async function markJobProcessing(jobId: string) {
    // ⭐ Validate jobId
    if (!ObjectId.isValid(jobId)) {
        throw new Error('Invalid job ID format');
    }

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

export async function markJobCompleted(jobId: string, result: any, modelUsed: string) {
    // ⭐ Validate jobId
    if (!ObjectId.isValid(jobId)) {
        throw new Error('Invalid job ID format');
    }

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
    // ⭐ Validate jobId
    if (!ObjectId.isValid(jobId)) {
        throw new Error('Invalid job ID format');
    }

    const db = await getDb();
    await db.collection("jobs").updateOne(
        { _id: new ObjectId(jobId) },
        {
            $set: {
                status: "failed",
                error,
                failedAt: new Date(),
            },
        }
    );
}

export async function getJobStatus(jobId: string) {
    const job = await getJob(jobId);

    if (!job) {
        return null;
    }

    return {
        status: job.status,
        result: job.result,
        error: job.error,
        modelUsed: job.modelUsed,
        createdAt: job.createdAt,
        completedAt: job.completedAt,
    };
}
/**
 * scripts/setupIndexes.ts
 * Run this once to create MongoDB indexes for live_datasets collection.
 */

import { MongoClient } from "mongodb";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function setupIndexes() {
    const uri = process.env.MONGODB_URI;
    const dbName = process.env.MONGODB_DB;

    if (!uri || !dbName) {
        console.error("❌ Missing MONGODB_URI or MONGODB_DB in .env.local");
        process.exit(1);
    }

    const client = new MongoClient(uri);

    try {
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection("live_datasets");

        console.log("🔍 Ensuring indexes on collection:", collection.collectionName);

        // TTL index (auto-delete expired docs)
        await collection.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
        console.log("✅ TTL index on expiresAt created");

        // Unique shortId index (for fast lookups & no duplicates)
        await collection.createIndex({ shortId: 1 }, { unique: true });
        console.log("✅ Unique index on shortId created");

        // (Optional) IP-based index to speed up rate-limiting queries
        await collection.createIndex({ ip: 1, createdAt: 1 });
        console.log("✅ Compound index on ip + createdAt created");

        console.log("🎉 All indexes created successfully!");
    } catch (error) {
        console.error("❌ Error creating indexes:", error);
    } finally {
        await client.close();
    }
}

setupIndexes();

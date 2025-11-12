// scripts/createIndexes.js (run with node)
import { MongoClient } from "mongodb";
import dotenv from "dotenv";
dotenv.config();

async function run() {
  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  const db = client.db(process.env.MONGODB_DB);

  // TTL index on expiresAt
  await db
    .collection("live_datasets")
    .createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });

  // Unique index for shortId
  await db
    .collection("live_datasets")
    .createIndex({ shortId: 1 }, { unique: true });

  console.log("Indexes created");
  await client.close();
}

run().catch(console.error);

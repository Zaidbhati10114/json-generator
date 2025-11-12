import { MongoClient, Db } from "mongodb";

const uri = process.env.MONGODB_URI!;
const options = {};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

// Use global var to cache the client in dev mode (avoids hot-reload reconnects)
declare global {
    // eslint-disable-next-line no-var
    var _mongoClientPromise: Promise<MongoClient>;
}

if (!process.env.MONGODB_URI) {
    throw new Error("❌ Please add your MongoDB URI to .env.local");
}

if (process.env.NODE_ENV === "development") {
    if (!global._mongoClientPromise) {
        client = new MongoClient(uri, options);
        global._mongoClientPromise = client.connect();
    }
    clientPromise = global._mongoClientPromise;
} else {
    client = new MongoClient(uri, options);
    clientPromise = client.connect();
}

export async function getDb(): Promise<Db> {
    const client = await clientPromise;
    return client.db(process.env.MONGODB_DB);
}

export default clientPromise;

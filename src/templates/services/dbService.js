import { ServerApiVersion, MongoClient } from "mongodb";

class DatabaseService {
  async createDB() {
    const connectionString = process.env.MONGODB_STRING;
    if (!connectionString) {
      throw new Error("MONGODB_STRING is required when mongoDB is enabled.");
    }

    if (this.client) {
      await this.client.close();
      this.client = null;
      this.db = null;
    }

    this.connectionString = connectionString;
    const isLocal =
      connectionString.includes("127.0.0.1") ||
      connectionString.includes("localhost");

    const clientOptions = isLocal
      ? { directConnection: true }
      : {
          serverApi: {
            version: ServerApiVersion.v1,
            strict: true,
            deprecationErrors: true,
          },
        };

    this.client = new MongoClient(this.connectionString, clientOptions);
    await this.client.connect();
    this.db = this.client.db(process.env.MONGODB_NAME);
    await this.db.command({ ping: 1 });
    console.log("Database connection is established.");
  }
}

export default new DatabaseService();

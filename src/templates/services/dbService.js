import { ServerApiVersion, MongoClient } from "mongodb";

class DatabaseService {
  async createDB() {
    try {
      this.connectionString = process.env.MONGODB_STRING;
      this.client = new MongoClient(this.connectionString, {
        serverApi: {
          version: ServerApiVersion.v1,
          strict: true,
          deprecationErrors: true,
        },
      });
      await this.client.connect();
      this.db = this.client.db(process.env.MONGODB_NAME);
      console.log("Database connection is established.");
    } catch (ex) {
      console.error("Database connection is failed.", ex);
      throw ex;
    }
  }
}

export default new DatabaseService();

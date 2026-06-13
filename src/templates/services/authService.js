import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dbService from "./dbService.js";

class AuthService {
  get usersCollection() {
    return dbService.db.collection("users");
  }

  createToken(username) {
    const secret = process.env.JWT_SECRET || "dev-secret";
    return jwt.sign({ username }, secret, { expiresIn: "7d" });
  }

  async signUp(username, password) {
    const existingUser = await this.usersCollection.findOne({ username });
    if (existingUser) {
      throw {
        title: "CONFLICT",
        message: "There is an existing user with this username.",
        status: 409,
      };
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await this.usersCollection.insertOne({
      username,
      password: hashedPassword,
      createdAt: new Date(),
    });

    return { username, token: this.createToken(username) };
  }

  async signIn(username, password) {
    const user = await this.usersCollection.findOne({ username });
    if (!user) {
      throw {
        title: "UNAUTHORIZED",
        message: "Invalid username or password.",
        status: 401,
      };
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      throw {
        title: "UNAUTHORIZED",
        message: "Invalid username or password.",
        status: 401,
      };
    }

    return { username, token: this.createToken(username) };
  }
}

export default new AuthService();

import dbService from "./dbService";

class AuthService {
  constructor() {}

  async signUp(username, password) {
    try {
        const existingUser = dbService.db.collection({username});
        if(existingUser) {
            throw new Error("There is an existing user with this username.")
        }
        const hashedPassword = 
    } catch (ex) {
      throw {
        title: "SERVER_ERROR",
        message: ex.message,
        status: 500,
      };
    }
  }
}

export default new AuthService();

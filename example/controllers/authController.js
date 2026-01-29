class AuthController {
  constructor() {}

  async signUp(req, res) {
    console.log(req.body);
    res.json({ success: true, test: true });
  }
}

export default new AuthController();

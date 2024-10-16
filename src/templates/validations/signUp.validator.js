const SIGN_UP_FIELDS = ["username", "password"];

export const signUpValidator = (req, res, next) => {
  const missingFields = SIGN_UP_FIELDS.filter((field) => {
    return !Object.keys(req.body).includes(field);
  });

  if (missingFields.length) {
    throw {
      title: "BAD_REQUEST",
      message: `${missingFields} are missing in request body.`,
      status: 400,
    };
  }
  next();
};

const SIGN_IN_FIELDS = ["username", "password"];

export const signInValidator = (req, res, next) => {
  const missingFields = SIGN_IN_FIELDS.filter((field) => {
    return !Object.keys(req.body).includes(field);
  });

  if (missingFields.length) {
    return next({
      title: "BAD_REQUEST",
      message: `${missingFields.join(", ")} are missing in request body.`,
      status: 400,
    });
  }

  next();
};

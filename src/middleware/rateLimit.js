const requests = new Map();

export const resetRateLimit = () => requests.clear();

const getLimits = () => ({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 60_000,
  max: Number(process.env.RATE_LIMIT_MAX) || 100,
});

const prune = (bucket, now, windowMs) => {
  while (bucket.length && bucket[0] <= now - windowMs) {
    bucket.shift();
  }
};

export const rateLimit = (req, res, next) => {
  const { windowMs, max } = getLimits();
  const key = req.ip || req.socket?.remoteAddress || "unknown";
  const now = Date.now();
  const bucket = requests.get(key) || [];
  prune(bucket, now, windowMs);

  if (bucket.length >= max) {
    return res.status(429).json({
      error: "RATE_LIMITED",
      message: "Too many requests. Try again later.",
    });
  }

  bucket.push(now);
  requests.set(key, bucket);
  next();
};

import rateLimit from "express-rate-limit";

export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: {
    success: false,
    message: 
    "Too many requests from this IP, please try agin after 15 minutes",
  },
  standardHeaders: true,
  legacyHeaders: false
})

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15, 
  message: {
    success: false,
    message: "Too many authentication attempts. Please try again after 15 minutes to protect your account.",
  },
  standardHeaders: true,
  legacyHeaders: false
});


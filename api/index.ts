import express from "express";
import Razorpay from "razorpay";
import dotenv from "dotenv";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import { z } from "zod";
import crypto from "crypto";

dotenv.config();

const app = express();

// Apply security headers
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" }
  })
);

app.use(express.json());

// Session store for serverless contexts (Active Session Registry)
const activeSessions = new Set<string>();

// In-memory lockout cache
interface LoginLockoutInfo {
  failedAttempts: number;
  lockoutUntil: number;
}
const lockoutStore = new Map<string, LoginLockoutInfo>();

function checkLockout(ip: string): { locked: boolean; remainingMs: number } {
  const info = lockoutStore.get(ip);
  if (!info) return { locked: false, remainingMs: 0 };
  
  const now = Date.now();
  if (info.failedAttempts >= 5 && now < info.lockoutUntil) {
    return { locked: true, remainingMs: info.lockoutUntil - now };
  }
  
  if (now >= info.lockoutUntil && info.failedAttempts >= 5) {
    lockoutStore.delete(ip);
  }
  return { locked: false, remainingMs: 0 };
}

function recordFailedAttempt(ip: string) {
  const info = lockoutStore.get(ip) || { failedAttempts: 0, lockoutUntil: 0 };
  info.failedAttempts += 1;
  
  if (info.failedAttempts >= 5) {
    const baseLockoutMs = 15 * 60 * 1000;
    const progressionMultiplier = Math.pow(2, Math.min(info.failedAttempts - 5, 4));
    const duration = baseLockoutMs * progressionMultiplier;
    info.lockoutUntil = Date.now() + duration;
  }
  lockoutStore.set(ip, info);
}

function resetFailedAttempts(ip: string) {
  lockoutStore.delete(ip);
}

// Schemas (Phase 3)
const verifySchema = z.object({
  password: z.string().min(1).max(128)
});

const checkoutSchema = z.object({
  amount: z.preprocess((val) => Number(val), z.number().positive())
});

// Rate Limiters (Phase 4)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests. Please try again later." }
});

const adminVerifyLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many login attempts. Please try again in a minute." }
});

app.use("/api/", apiLimiter);

// API Checkout Route using Razorpay Node SDK
app.post("/api/checkout", async (req, res) => {
  try {
    const parsed = checkoutSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid payment payload", details: parsed.error.format() });
    }

    const { amount } = parsed.data;
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      console.warn("RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET missing. Defaulting to Demo Mode.");
      const mockOrder = {
        id: `order_demo_${crypto.randomBytes(6).toString("hex")}`,
        entity: "order",
        amount: Math.round(amount * 100),
        amount_paid: 0,
        amount_due: Math.round(amount * 100),
        currency: "INR",
        receipt: `receipt_${Date.now()}`,
        status: "created",
        attempts: 0,
        notes: [],
        created_at: Math.floor(Date.now() / 1000),
        key_id: "rzp_test_placeholder"
      };
      return res.json(mockOrder);
    }

    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    const options = {
      amount: Math.round(amount * 100),
      currency: "INR",
      receipt: `receipt_order_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);
    return res.json({
      ...order,
      key_id: keyId,
    });
  } catch (error: any) {
    console.error("Failed to generate Razorpay order:", error);
    return res.status(500).json({
      error: "Internal Server Error",
      details: "Unable to initiate Razorpay order transaction."
    });
  }
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "healthy", timestamp: new Date() });
});

// Secure Admin Password verification endpoint with Lockout (Phase 4 & 5)
app.post("/api/admin/verify", adminVerifyLimiter, (req, res) => {
  const ip = req.ip || "unknown";
  
  const lockout = checkLockout(ip);
  if (lockout.locked) {
    return res.status(423).json({ 
      success: false, 
      error: "Too many failed attempts. Access is locked temporarily." 
    });
  }

  const parsed = verifySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ success: false, error: "Invalid password structure" });
  }

  const { password } = parsed.data;
  const adminPassword = process.env.ADMIN_PASSWORD;
  
  if (!adminPassword) {
    console.error("ADMIN_PASSWORD is not configured in the environment.");
    return res.status(500).json({ success: false, error: "Admin access is currently disabled." });
  }

  let matches = false;
  try {
    matches = crypto.timingSafeEqual(
      Buffer.from(password, "utf8"),
      Buffer.from(adminPassword, "utf8")
    );
  } catch {
    matches = (password === adminPassword);
  }

  if (matches) {
    resetFailedAttempts(ip);
    const token = `admin_session_${crypto.randomBytes(24).toString("hex")}`;
    activeSessions.add(token);
    return res.json({ success: true, token });
  }
  
  recordFailedAttempt(ip);
  return res.status(401).json({ success: false, error: "Incorrect admin credentials" });
});

export default app;

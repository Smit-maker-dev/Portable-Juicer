/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import Razorpay from "razorpay";
import dotenv from "dotenv";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import { z } from "zod";
import crypto from "crypto";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Set up security headers via Helmet
  // Lenient CSP and COEP is required to ensure standard AI Studio iframe embedding is not blocked
  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
      crossOriginResourcePolicy: { policy: "cross-origin" }
    })
  );

  app.use(express.json());

  // Memory store for active admin sessions (resolves predictable Math.random() tokens and auth bypass)
  const activeSessions = new Set<string>();

  // In-memory brute-force/progressive account lockout engine
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
      // 15-minute base lockout with progressive doubling delay for subsequent failures
      const baseLockoutMs = 15 * 60 * 1000;
      const progressionMultiplier = Math.pow(2, Math.min(info.failedAttempts - 5, 4));
      const duration = baseLockoutMs * progressionMultiplier;
      info.lockoutUntil = Date.now() + duration;
      
      console.warn(`[SECURITY LOCKOUT] IP ${ip} locked out for ${duration / 60000} minutes after ${info.failedAttempts} failed admin login attempts.`);
    }
    
    lockoutStore.set(ip, info);
  }

  function resetFailedAttempts(ip: string) {
    lockoutStore.delete(ip);
  }

  // Zod Schemas for Input Validation & Sanitization (Phase 3)
  const verifySchema = z.object({
    password: z.string().min(1, "Password is required").max(128, "Password is too long")
  });

  const productSchema = z.object({
    name: z.string().trim().min(1, "Product name is required").max(100, "Name is too long"),
    description: z.string().trim().max(1000, "Description is too long").optional().nullable(),
    price: z.preprocess((val) => Number(val), z.number().positive("Price must be a positive number")),
    originalPrice: z.preprocess((val) => (val === undefined || val === null || val === "" ? undefined : Number(val)), z.number().positive().optional()),
    stockQuantity: z.preprocess((val) => (val === undefined || val === null || val === "" ? undefined : Number(val)), z.number().int().nonnegative().optional()),
    image: z.string().max(2000).optional().nullable(),
    images: z.array(z.string().max(2000)).optional().nullable()
  });

  const checkoutSchema = z.object({
    amount: z.preprocess((val) => Number(val), z.number().positive("Amount must be a positive number"))
  });

  // Rate Limiters (Phase 4)
  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 API requests per 15 minutes
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many requests. Please try again later." }
  });

  const adminVerifyLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 10, // Max 10 login requests per IP per minute
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many login attempts. Please try again in a minute." }
  });

  // Apply general API rate limiting
  app.use("/api/", apiLimiter);

  // API Checkout Route using Razorpay Node SDK (Secured with Zod Validation)
  app.post("/api/checkout", async (req, res) => {
    try {
      const parsed = checkoutSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid payment payload", details: parsed.error.format() });
      }

      const { amount } = parsed.data;
      const keyId = process.env.RAZORPAY_KEY_ID;
      const keySecret = process.env.RAZORPAY_KEY_SECRET;

      // Handle Sandbox/Demo mode when credentials are not supplied
      if (!keyId || !keySecret) {
        console.warn("RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET environment variables are missing. Defaulting to Demo Mode.");
        
        const mockOrder = {
          id: `order_demo_${crypto.randomBytes(6).toString("hex")}`,
          entity: "order",
          amount: Math.round(amount * 100), // paise
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

      // Initialize Razorpay SDK client lazily
      const razorpay = new Razorpay({
        key_id: keyId,
        key_secret: keySecret,
      });

      const options = {
        amount: Math.round(amount * 100), // Razorpay amount is in paise (1 INR = 100 paise)
        currency: "INR",
        receipt: `receipt_order_${Date.now()}`,
      };

      const order = await razorpay.orders.create(options);

      // Return the order back to frontend, including the public Key ID
      return res.json({
        ...order,
        key_id: keyId,
      });
    } catch (error: any) {
      console.error("Failed to generate Razorpay order:", error);
      return res.status(500).json({
        error: "Internal Server Error",
        details: "Unable to initiate Razorpay order transaction." // Generic safe message
      });
    }
  });

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "healthy", timestamp: new Date() });
  });

  // Secure Admin Password verification endpoint with Account Lockout (Phase 4 & 5)
  app.post("/api/admin/verify", adminVerifyLimiter, (req, res) => {
    const ip = req.ip || "unknown";
    
    // Check if client is locked out
    const lockout = checkLockout(ip);
    if (lockout.locked) {
      return res.status(423).json({ 
        success: false, 
        error: "Too many failed attempts. Access to admin verification is locked temporarily." 
      });
    }

    const parsed = verifySchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: "Invalid password structure" });
    }

    const { password } = parsed.data;
    
    // Avoid default hardcoded passwords, read only from environment safely
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminPassword) {
      console.error("[SECURITY ERROR] ADMIN_PASSWORD is not configured in the server environment.");
      return res.status(500).json({ success: false, error: "Admin access is currently disabled on this server." });
    }

    // Timing-safe-like constant comparison to protect against timing attacks
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
      // Cryptographically secure token generation (Phase 6)
      const token = `admin_session_${crypto.randomBytes(24).toString("hex")}`;
      activeSessions.add(token);

      return res.json({ success: true, token });
    }
    
    recordFailedAttempt(ip);
    return res.status(401).json({ success: false, error: "Incorrect admin credentials" });
  });

  // Custom Authentication middleware to prevent auth-bypass
  const requireAdminAuth = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer admin_session_")) {
      return res.status(403).json({ success: false, error: "Forbidden: Invalid authorization session token" });
    }

    const token = authHeader.replace("Bearer ", "");
    if (!activeSessions.has(token)) {
      return res.status(401).json({ success: false, error: "Session expired or invalid. Please login again." });
    }

    next();
  };

  // Secure Admin Product creation endpoint (Validated and Gated)
  app.post("/api/admin/products", requireAdminAuth, (req, res) => {
    const parsed = productSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: "Invalid product details", details: parsed.error.format() });
    }

    const { name, description, price, originalPrice, stockQuantity, image, images } = parsed.data;

    let parsedImages: string[] = [];
    if (Array.isArray(images) && images.length > 0) {
      parsedImages = images.filter(img => typeof img === "string" && img.trim() !== "");
    } else if (image) {
      parsedImages = [image];
    }
    if (parsedImages.length === 0) {
      parsedImages = ["https://images.unsplash.com/photo-1517256064527-09c53b2d0bc6?auto=format&fit=crop&q=80&w=600"];
    }

    const newProduct = {
      id: `prod_${crypto.randomBytes(6).toString("hex")}`,
      name,
      description: description || "No description provided.",
      price: price,
      originalPrice: originalPrice || price,
      stockLeft: stockQuantity || 10,
      features: ["Premium quality", "BPA-free construction", "Multi-speed controls"],
      images: parsedImages
    };

    return res.status(201).json({ success: true, product: newProduct });
  });

  // Secure Admin Product editing endpoint (Validated and Gated)
  app.put("/api/admin/products/:id", requireAdminAuth, (req, res) => {
    const { id } = req.params;
    // Parameter validation to prevent Path Traversal or malformed routing inputs
    if (!id || typeof id !== "string" || id.length > 64) {
      return res.status(400).json({ success: false, error: "Invalid product ID format" });
    }

    const parsed = productSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: "Invalid product details", details: parsed.error.format() });
    }

    const { name, description, price, originalPrice, stockQuantity, image, images } = parsed.data;

    let parsedImages: string[] = [];
    if (Array.isArray(images) && images.length > 0) {
      parsedImages = images.filter(img => typeof img === "string" && img.trim() !== "");
    } else if (image) {
      parsedImages = [image];
    }
    if (parsedImages.length === 0) {
      parsedImages = ["https://images.unsplash.com/photo-1517256064527-09c53b2d0bc6?auto=format&fit=crop&q=80&w=600"];
    }

    const updatedProduct = {
      id,
      name,
      description: description || "No description provided.",
      price: price,
      originalPrice: originalPrice || price,
      stockLeft: stockQuantity || 10,
      features: ["Premium quality", "BPA-free construction", "Multi-speed controls"],
      images: parsedImages
    };

    return res.status(200).json({ success: true, product: updatedProduct });
  });

  // Secure Admin Product deletion endpoint (Validated and Gated)
  app.delete("/api/admin/products/:id", requireAdminAuth, (req, res) => {
    const { id } = req.params;
    if (!id || typeof id !== "string" || id.length > 64) {
      return res.status(400).json({ success: false, error: "Invalid product ID format" });
    }

    return res.status(200).json({ success: true, id });
  });

  // Integrate Vite for dev, or serve built assets in prod
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Express server running securely on http://localhost:${PORT}`);
  });
}

startServer();

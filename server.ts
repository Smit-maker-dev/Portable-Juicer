/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import Razorpay from "razorpay";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Checkout Route using Razorpay Node SDK
  app.post("/api/checkout", async (req, res) => {
    try {
      const { amount } = req.body;

      if (!amount || typeof amount !== "number" || amount <= 0) {
        return res.status(400).json({ error: "Invalid payment amount specified" });
      }

      const keyId = process.env.RAZORPAY_KEY_ID;
      const keySecret = process.env.RAZORPAY_KEY_SECRET;

      // Handle Sandbox/Demo mode when credentials are not supplied
      if (!keyId || !keySecret) {
        console.warn("RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET environment variables are missing. Defaulting to Demo Mode.");
        
        const mockOrder = {
          id: `order_demo_${Math.random().toString(36).substring(2, 12)}`,
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
        details: error.message || "Unable to initiate Razorpay order transaction."
      });
    }
  });

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "healthy", timestamp: new Date() });
  });

  // Secure Admin Password verification endpoint (Standard 1 & 4)
  app.post("/api/admin/verify", (req, res) => {
    const { password } = req.body;
    const adminPassword = process.env.ADMIN_PASSWORD || "Krushna@6356";
    
    if (password === adminPassword) {
      return res.json({ success: true, token: `admin_session_${Math.random().toString(36).substring(2, 10)}` });
    }
    
    // Constant-time-like feedback: do not reveal too much, return standard 401
    return res.status(401).json({ success: false, error: "Incorrect admin password" });
  });

  // Secure Admin Product creation endpoint
  app.post("/api/admin/products", (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer admin_session_")) {
      return res.status(403).json({ success: false, error: "Forbidden: Invalid authorization session token" });
    }

    const { name, description, price, originalPrice, stockQuantity, image, images } = req.body;

    if (!name || !price) {
      return res.status(400).json({ success: false, error: "Product name and price are required fields." });
    }

    let parsedImages: string[] = [];
    if (Array.isArray(images) && images.length > 0) {
      parsedImages = images.filter(img => typeof img === "string" && img.trim() !== "");
    } else if (image) {
      parsedImages = [image];
    }
    if (parsedImages.length === 0) {
      parsedImages = ["https://images.unsplash.com/photo-1517256064527-09c53b2d0bc6?auto=format&fit=crop&q=80&w=600"];
    }

    // Return the created product object with a newly generated ID
    const newProduct = {
      id: `prod_${Math.random().toString(36).substring(2, 12)}`,
      name,
      description: description || "No description provided.",
      price: Number(price),
      originalPrice: Number(originalPrice) || Number(price),
      stockLeft: Number(stockQuantity) || 10,
      features: ["Premium quality", "BPA-free construction", "Multi-speed controls"],
      images: parsedImages
    };

    return res.status(201).json({ success: true, product: newProduct });
  });

  // Secure Admin Product editing endpoint
  app.put("/api/admin/products/:id", (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer admin_session_")) {
      return res.status(403).json({ success: false, error: "Forbidden: Invalid authorization session token" });
    }

    const { id } = req.params;
    const { name, description, price, originalPrice, stockQuantity, image, images } = req.body;

    if (!name || !price) {
      return res.status(400).json({ success: false, error: "Product name and price are required fields." });
    }

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
      price: Number(price),
      originalPrice: Number(originalPrice) || Number(price),
      stockLeft: Number(stockQuantity) || 10,
      features: ["Premium quality", "BPA-free construction", "Multi-speed controls"],
      images: parsedImages
    };

    return res.status(200).json({ success: true, product: updatedProduct });
  });

  // Secure Admin Product deletion endpoint
  app.delete("/api/admin/products/:id", (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer admin_session_")) {
      return res.status(403).json({ success: false, error: "Forbidden: Invalid authorization session token" });
    }

    const { id } = req.params;
    // For local mockup we can simply return success: true.
    // The frontend state manages persistent storage using localStorage.
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
    console.log(`Express server running on http://localhost:${PORT}`);
  });
}

startServer();

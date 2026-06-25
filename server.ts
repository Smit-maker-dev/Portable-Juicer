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

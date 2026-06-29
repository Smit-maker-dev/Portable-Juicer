/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { useCartStore } from "../store/useCartStore";

interface CheckoutButtonProps {
  amount: number;
  className?: string;
  onSuccess?: () => void;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export default function CheckoutButton({ amount, className = "", onSuccess }: CheckoutButtonProps) {
  const [loading, setLoading] = useState(false);
  const clearCart = useCartStore((state) => state.clearCart);

  const handlePayment = async () => {
    if (amount <= 0) return;
    setLoading(true);

    try {
      const isScriptLoaded = await loadRazorpayScript();
      if (!isScriptLoaded) {
        alert("Razorpay SDK failed to load. Please check your internet connection and try again.");
        setLoading(false);
        return;
      }

      // 1. Create order on Express backend
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ amount }),
      });

      if (!response.ok) {
        throw new Error("Failed to create checkout order on the server.");
      }

      const orderData = await response.json();
      
      // 2. Open Razorpay payment gateway
      const options = {
        key: orderData.key_id || "rzp_test_placeholder",
        amount: orderData.amount,
        currency: orderData.currency,
        name: "KuaxiBlend Co.",
        description: "Portable USB Rechargeable Blender (380ml)",
        order_id: orderData.id,
        handler: function (response: any) {
          alert(`Order placed successfully! Payment ID: ${response.razorpay_payment_id}`);
          clearCart();
          if (onSuccess) {
            onSuccess();
          }
        },
        prefill: {
          name: "Aarav Sharma",
          email: "aarav.sharma@example.com",
          contact: "9876543210",
        },
        theme: {
          color: "#78716C", // Charcoal grey to fit the light papery theme
        },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (error: any) {
      console.error("Payment error:", error);
      alert(`Checkout failed: ${error.message || "Please check your network and try again."}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      id="checkout-btn-payment"
      onClick={handlePayment}
      disabled={loading || amount <= 0}
      className={`relative overflow-hidden w-full py-4 px-6 rounded-xl font-display font-medium text-stone-100 bg-stone-800 hover:bg-stone-900 active:scale-[0.98] transition-all duration-300 shadow-sm disabled:opacity-50 disabled:pointer-events-none cursor-pointer ${className}`}
    >
      <span className="relative z-10 flex items-center justify-center gap-2">
        {loading ? (
          <>
            <svg className="animate-spin h-5 w-5 text-stone-100" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Processing Payment...
          </>
        ) : (
          `Pay Now — ₹${amount.toLocaleString("en-IN")}`
        )}
      </span>
    </button>
  );
}

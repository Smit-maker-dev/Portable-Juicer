/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { useCartStore } from "../store/useCartStore";
import { useOrderStore } from "../store/useOrderStore";
import { 
  X, MapPin, Truck, CreditCard, ShieldCheck, Check, 
  ArrowRight, ShoppingBag, ChevronRight, Lock, Printer, 
  Sparkles, CheckCircle2, AlertCircle, RefreshCw 
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface CheckoutFlowProps {
  isOpen: boolean;
  onClose: () => void;
}

// Simulated Razorpay Script Loader
const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if ((window as any).Razorpay) {
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

type CheckoutStep = "address" | "payment" | "review" | "success";

interface ShippingAddress {
  fullName: string;
  phone: string;
  email: string;
  pinCode: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  landmark: string;
  addressType: "home" | "office";
}

const DEFAULT_ADDRESS: ShippingAddress = {
  fullName: "Smit Vaghasiya",
  phone: "9988776655",
  email: "smitvaghasiya182@gmail.com",
  pinCode: "395006",
  addressLine1: "B-404, Shrinand Residency, VIP Road",
  addressLine2: "Near Vesu Canal Road",
  city: "Surat",
  state: "Gujarat",
  landmark: "Opposite Royal Arcade",
  addressType: "home",
};

export default function CheckoutFlow({ isOpen, onClose }: CheckoutFlowProps) {
  const { items, getTotalPrice, clearCart } = useCartStore();
  const { addOrder } = useOrderStore();
  const totalPrice = getTotalPrice();

  const [step, setStep] = useState<CheckoutStep>("address");
  const [address, setAddress] = useState<ShippingAddress>(DEFAULT_ADDRESS);
  const [shippingMethod, setShippingMethod] = useState<"standard" | "express" | "same-day">("standard");
  const [paymentMethod, setPaymentMethod] = useState<"razorpay" | "cod">("razorpay");
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState<string>("");
  const [paymentId, setPaymentId] = useState<string>("");
  const [estimatedDelivery, setEstimatedDelivery] = useState<string>("");

  const [errors, setErrors] = useState<Partial<Record<keyof ShippingAddress, string>>>({});

  // Pricing calculations
  const getShippingCost = () => {
    if (shippingMethod === "express") return 150;
    if (shippingMethod === "same-day") return 299;
    return 0; // Standard is free
  };

  const getConvenienceFee = () => {
    return paymentMethod === "cod" ? 50 : 0;
  };

  const getTax = () => {
    return Math.round(totalPrice * 0.18); // 18% GST standard e-commerce tax
  };

  const getGrandTotal = () => {
    return totalPrice + getShippingCost() + getConvenienceFee() + getTax();
  };

  const prefillDemoAddress = () => {
    setAddress(DEFAULT_ADDRESS);
    setErrors({});
  };

  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Partial<Record<keyof ShippingAddress, string>> = {};
    if (!address.fullName.trim()) newErrors.fullName = "Full Name is required";
    if (!address.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\d{10}$/.test(address.phone.trim())) {
      newErrors.phone = "Enter a valid 10-digit mobile number";
    }
    if (!address.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(address.email)) {
      newErrors.email = "Enter a valid email address";
    }
    if (!address.pinCode.trim()) {
      newErrors.pinCode = "PIN Code is required";
    } else if (!/^\d{6}$/.test(address.pinCode.trim())) {
      newErrors.pinCode = "Enter a valid 6-digit PIN Code";
    }
    if (!address.addressLine1.trim()) newErrors.addressLine1 = "Street address is required";
    if (!address.city.trim()) newErrors.city = "City is required";
    if (!address.state.trim()) newErrors.state = "State is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setStep("payment");
  };

  const handlePlaceOrder = async () => {
    setLoading(true);
    const amount = getGrandTotal();

    // Set Estimated delivery date
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' };
    const date = new Date();
    const addDays = shippingMethod === "same-day" ? 0 : shippingMethod === "express" ? 2 : 4;
    date.setDate(date.getDate() + addDays);
    const formattedDeliveryDate = date.toLocaleDateString("en-IN", options);
    setEstimatedDelivery(formattedDeliveryDate);

    // Razorpay Flow
    if (paymentMethod === "razorpay") {
      try {
        const isScriptLoaded = await loadRazorpayScript();
        if (!isScriptLoaded) {
          alert("Razorpay SDK failed to load. Please check your internet connection.");
          setLoading(false);
          return;
        }

        const response = await fetch("/api/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount }),
        });

        if (!response.ok) {
          throw new Error("Failed to create checkout order on the server.");
        }

        const orderData = await response.json();
        
        const rzpOptions = {
          key: orderData.key_id || "rzp_test_placeholder",
          amount: orderData.amount,
          currency: orderData.currency,
          name: "KuaxiBlend Co.",
          description: "Premium Cordless Kitchenware Order",
          order_id: orderData.id,
          handler: function (rzpResponse: any) {
            const finalOrderId = orderData.id || `AB-${Math.floor(100000 + Math.random() * 900000)}`;
            const finalPaymentId = rzpResponse.razorpay_payment_id || "pay_simulated_success";
            
            setOrderId(finalOrderId);
            setPaymentId(finalPaymentId);
            setStep("success");

            // Save order to store
            addOrder({
              id: finalOrderId,
              date: new Date().toISOString(),
              items: [...items],
              totalAmount: amount,
              shippingAddress: {
                fullName: address.fullName,
                phone: address.phone,
                email: address.email,
                pinCode: address.pinCode,
                addressLine1: address.addressLine1,
                addressLine2: address.addressLine2,
                city: address.city,
                state: address.state,
                landmark: address.landmark,
                addressType: address.addressType,
              },
              shippingMethod,
              paymentMethod,
              status: "placed",
              deliveryDate: formattedDeliveryDate,
              paymentId: finalPaymentId,
            });

            clearCart();
          },
          prefill: {
            name: address.fullName,
            email: address.email,
            contact: address.phone,
          },
          theme: {
            color: "#1c1917",
          },
          modal: {
            ondismiss: function() {
              setLoading(false);
            }
          }
        };

        const paymentObject = new (window as any).Razorpay(rzpOptions);
        paymentObject.open();
      } catch (error: any) {
        console.error("Payment error:", error);
        alert(`Checkout payment failed: ${error.message || "Please try again."}`);
        setLoading(false);
      }
    } else {
      // simulated Cash On Delivery or instant UPI flow
      setTimeout(() => {
        const finalOrderId = `AB-${Math.floor(100000 + Math.random() * 900000)}`;
        const finalPaymentId = paymentMethod === "cod" ? "CASH-ON-DELIVERY" : `UPI-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
        
        setOrderId(finalOrderId);
        setPaymentId(finalPaymentId);
        setStep("success");

        // Save order to store
        addOrder({
          id: finalOrderId,
          date: new Date().toISOString(),
          items: [...items],
          totalAmount: amount,
          shippingAddress: {
            fullName: address.fullName,
            phone: address.phone,
            email: address.email,
            pinCode: address.pinCode,
            addressLine1: address.addressLine1,
            addressLine2: address.addressLine2,
            city: address.city,
            state: address.state,
            landmark: address.landmark,
            addressType: address.addressType,
          },
          shippingMethod,
          paymentMethod,
          status: "placed",
          deliveryDate: formattedDeliveryDate,
          paymentId: finalPaymentId,
        });

        clearCart();
        setLoading(false);
      }, 1500);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-stone-50 border border-stone-200 w-full max-w-4xl rounded-3xl shadow-2xl flex flex-col max-h-[calc(100vh-2rem)] md:max-h-[90vh] overflow-hidden">
        
        {/* Checkout Header */}
        <div className="p-5 border-b border-stone-200/80 bg-stone-100/50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Lock className="h-4.5 w-4.5 text-stone-600" />
            <span className="text-xs font-mono font-bold text-stone-700 tracking-wider uppercase">
              Amazon Secure Checkout Flow
            </span>
          </div>
          {step !== "success" && (
            <button
              onClick={onClose}
              className="p-1 text-stone-500 hover:text-stone-900 rounded-lg hover:bg-stone-200/50 transition-colors cursor-pointer text-sm font-mono flex items-center gap-1"
            >
              ✕ Close
            </button>
          )}
        </div>

        {/* Amazon Progress Steps Indicator */}
        {step !== "success" && (
          <div className="bg-white border-b border-stone-200 p-4 shrink-0 overflow-x-auto">
            <div className="max-w-2xl mx-auto flex justify-between items-center text-xs font-medium text-stone-400 gap-2">
              
              <button 
                onClick={() => items.length > 0 && setStep("address")}
                className={`flex items-center gap-1.5 focus:outline-hidden ${step === "address" ? "text-stone-900 font-bold" : "text-stone-600 cursor-pointer"}`}
              >
                <span className={`h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-mono border ${step === "address" ? "bg-stone-900 text-white border-stone-900" : "bg-stone-100 text-stone-600 border-stone-300"}`}>1</span>
                Delivery Address
              </button>

              <ChevronRight className="h-4 w-4 text-stone-300 shrink-0" />

              <button 
                onClick={() => (step === "review" || step === "payment") && setStep("payment")}
                disabled={step === "address"}
                className={`flex items-center gap-1.5 focus:outline-hidden disabled:opacity-40 disabled:pointer-events-none ${step === "payment" ? "text-stone-900 font-bold" : (step === "review" || step === "payment") ? "text-stone-600 cursor-pointer" : ""}`}
              >
                <span className={`h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-mono border ${step === "payment" ? "bg-stone-900 text-white border-stone-900" : "bg-stone-100 text-stone-600 border-stone-300"}`}>2</span>
                Payment Options
              </button>

              <ChevronRight className="h-4 w-4 text-stone-300 shrink-0" />

              <span className={`flex items-center gap-1.5 ${step === "review" ? "text-stone-900 font-bold" : ""}`}>
                <span className={`h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-mono border ${step === "review" ? "bg-stone-900 text-white border-stone-900" : "bg-stone-100 text-stone-600 border-stone-300"}`}>3</span>
                Place Order
              </span>
            </div>
          </div>
        )}

        {/* Content Container */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Content Area (Columns 1 to 8) */}
            <div className={`${step === "success" ? "lg:col-span-12" : "lg:col-span-8"} space-y-6`}>
              
              <AnimatePresence mode="wait">
                {/* STEP 1: ADDRESS */}
                {step === "address" && (
                  <motion.div
                    key="address"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-6"
                  >
                    <div className="flex justify-between items-center flex-wrap gap-2">
                      <h3 className="font-display font-extrabold text-stone-950 text-xl flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-stone-800" /> Enter a delivery address
                      </h3>
                      <button
                        type="button"
                        onClick={prefillDemoAddress}
                        className="text-xs font-mono font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200/60 px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                      >
                        ⚡ Prefill Saved Address
                      </button>
                    </div>

                    <form onSubmit={handleAddressSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Name */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-mono font-medium text-stone-600">Full Name</label>
                        <input
                          type="text"
                          value={address.fullName}
                          onChange={(e) => setAddress({ ...address, fullName: e.target.value })}
                          className={`w-full bg-white border ${errors.fullName ? "border-red-400" : "border-stone-200"} rounded-xl p-3 text-sm focus:outline-hidden focus:ring-1 focus:ring-stone-400 font-sans`}
                          placeholder="e.g. Smit Vaghasiya"
                        />
                        {errors.fullName && <p className="text-[10px] text-red-500 font-mono flex items-center gap-1"><AlertCircle className="h-3 w-3" /> {errors.fullName}</p>}
                      </div>

                      {/* Phone */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-mono font-medium text-stone-600">10-Digit Mobile Number</label>
                        <input
                          type="tel"
                          value={address.phone}
                          onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                          className={`w-full bg-white border ${errors.phone ? "border-red-400" : "border-stone-200"} rounded-xl p-3 text-sm focus:outline-hidden focus:ring-1 focus:ring-stone-400 font-mono`}
                          placeholder="9988776655"
                        />
                        {errors.phone && <p className="text-[10px] text-red-500 font-mono flex items-center gap-1"><AlertCircle className="h-3 w-3" /> {errors.phone}</p>}
                      </div>

                      {/* Email */}
                      <div className="space-y-1.5 md:col-span-2">
                        <label className="text-xs font-mono font-medium text-stone-600">Email Address (for order tracking & invoices)</label>
                        <input
                          type="email"
                          value={address.email}
                          onChange={(e) => setAddress({ ...address, email: e.target.value })}
                          className={`w-full bg-white border ${errors.email ? "border-red-400" : "border-stone-200"} rounded-xl p-3 text-sm focus:outline-hidden focus:ring-1 focus:ring-stone-400 font-sans`}
                          placeholder="smitvaghasiya182@gmail.com"
                        />
                        {errors.email && <p className="text-[10px] text-red-500 font-mono flex items-center gap-1"><AlertCircle className="h-3 w-3" /> {errors.email}</p>}
                      </div>

                      {/* Address Line 1 */}
                      <div className="space-y-1.5 md:col-span-2">
                        <label className="text-xs font-mono font-medium text-stone-600">Flat, House no., Building, Company, Apartment</label>
                        <input
                          type="text"
                          value={address.addressLine1}
                          onChange={(e) => setAddress({ ...address, addressLine1: e.target.value })}
                          className={`w-full bg-white border ${errors.addressLine1 ? "border-red-400" : "border-stone-200"} rounded-xl p-3 text-sm focus:outline-hidden focus:ring-1 focus:ring-stone-400 font-sans`}
                          placeholder="e.g. B-404, Shrinand Residency"
                        />
                        {errors.addressLine1 && <p className="text-[10px] text-red-500 font-mono flex items-center gap-1"><AlertCircle className="h-3 w-3" /> {errors.addressLine1}</p>}
                      </div>

                      {/* Address Line 2 */}
                      <div className="space-y-1.5 md:col-span-2">
                        <label className="text-xs font-mono font-medium text-stone-600">Area, Street, Sector, Village (Optional)</label>
                        <input
                          type="text"
                          value={address.addressLine2}
                          onChange={(e) => setAddress({ ...address, addressLine2: e.target.value })}
                          className="w-full bg-white border border-stone-200 rounded-xl p-3 text-sm focus:outline-hidden focus:ring-1 focus:ring-stone-400 font-sans"
                          placeholder="e.g. VIP Road, Vesu"
                        />
                      </div>

                      {/* PIN Code */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-mono font-medium text-stone-600">6-Digit PIN Code</label>
                        <input
                          type="text"
                          value={address.pinCode}
                          onChange={(e) => setAddress({ ...address, pinCode: e.target.value })}
                          className={`w-full bg-white border ${errors.pinCode ? "border-red-400" : "border-stone-200"} rounded-xl p-3 text-sm focus:outline-hidden focus:ring-1 focus:ring-stone-400 font-mono`}
                          placeholder="395007"
                        />
                        {errors.pinCode && <p className="text-[10px] text-red-500 font-mono flex items-center gap-1"><AlertCircle className="h-3 w-3" /> {errors.pinCode}</p>}
                      </div>

                      {/* Landmark */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-mono font-medium text-stone-600">Landmark (Optional)</label>
                        <input
                          type="text"
                          value={address.landmark}
                          onChange={(e) => setAddress({ ...address, landmark: e.target.value })}
                          className="w-full bg-white border border-stone-200 rounded-xl p-3 text-sm focus:outline-hidden focus:ring-1 focus:ring-stone-400 font-sans"
                          placeholder="e.g. near G.D. Goenka school"
                        />
                      </div>

                      {/* City */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-mono font-medium text-stone-600">Town/City</label>
                        <input
                          type="text"
                          value={address.city}
                          onChange={(e) => setAddress({ ...address, city: e.target.value })}
                          className={`w-full bg-white border ${errors.city ? "border-red-400" : "border-stone-200"} rounded-xl p-3 text-sm focus:outline-hidden focus:ring-1 focus:ring-stone-400 font-sans`}
                        />
                        {errors.city && <p className="text-[10px] text-red-500 font-mono flex items-center gap-1"><AlertCircle className="h-3 w-3" /> {errors.city}</p>}
                      </div>

                      {/* State */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-mono font-medium text-stone-600">State</label>
                        <input
                          type="text"
                          value={address.state}
                          onChange={(e) => setAddress({ ...address, state: e.target.value })}
                          className={`w-full bg-white border ${errors.state ? "border-red-400" : "border-stone-200"} rounded-xl p-3 text-sm focus:outline-hidden focus:ring-1 focus:ring-stone-400 font-sans`}
                        />
                        {errors.state && <p className="text-[10px] text-red-500 font-mono flex items-center gap-1"><AlertCircle className="h-3 w-3" /> {errors.state}</p>}
                      </div>

                      {/* Address Type */}
                      <div className="space-y-1.5 md:col-span-2">
                        <label className="text-xs font-mono font-medium text-stone-600 block">Select Address Type</label>
                        <div className="flex flex-col sm:flex-row gap-4">
                          <label className="flex items-center gap-2 bg-white border border-stone-200 p-3 rounded-xl flex-1 cursor-pointer hover:border-stone-300">
                            <input
                              type="radio"
                              name="addressType"
                              checked={address.addressType === "home"}
                              onChange={() => setAddress({ ...address, addressType: "home" })}
                              className="text-stone-900 focus:ring-stone-400 h-4 w-4"
                            />
                            <span className="text-sm font-medium text-stone-800">Home (7 AM - 10 PM delivery)</span>
                          </label>
                          <label className="flex items-center gap-2 bg-white border border-stone-200 p-3 rounded-xl flex-1 cursor-pointer hover:border-stone-300">
                            <input
                              type="radio"
                              name="addressType"
                              checked={address.addressType === "office"}
                              onChange={() => setAddress({ ...address, addressType: "office" })}
                              className="text-stone-900 focus:ring-stone-400 h-4 w-4"
                            />
                            <span className="text-sm font-medium text-stone-800">Office (10 AM - 6 PM delivery)</span>
                          </label>
                        </div>
                      </div>

                      {/* Form action */}
                      <div className="md:col-span-2 pt-4 border-t border-stone-200 mt-2 flex justify-end">
                        <button
                          type="submit"
                          className="px-6 py-3 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-100 font-display font-semibold text-sm transition-all active:scale-[0.98] cursor-pointer flex items-center gap-1.5 shadow-sm"
                        >
                          Use this address <ArrowRight className="h-4 w-4" />
                        </button>
                      </div>
                    </form>
                  </motion.div>
                )}

                {/* STEP 2: PAYMENT OPTIONS */}
                {step === "payment" && (
                  <motion.div
                    key="payment"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-6"
                  >
                    <h3 className="font-display font-extrabold text-stone-950 text-xl flex items-center gap-2">
                      <CreditCard className="h-5 w-5 text-stone-800" /> Select a payment method
                    </h3>

                    <div className="space-y-3.5">
                      {/* Razorpay Option */}
                      <div 
                        onClick={() => setPaymentMethod("razorpay")}
                        className={`p-5 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-4 bg-white ${paymentMethod === "razorpay" ? "border-stone-900 ring-1 ring-stone-900 shadow-sm" : "border-stone-200 hover:border-stone-300"}`}
                      >
                        <div className="flex items-start gap-3">
                          <input
                            type="radio"
                            name="payment_method"
                            checked={paymentMethod === "razorpay"}
                            onChange={() => setPaymentMethod("razorpay")}
                            className="mt-1 text-stone-900 focus:ring-stone-400"
                          />
                          <div>
                            <p className="font-bold text-stone-900 text-sm flex items-center gap-2">
                              Razorpay Secure Checkout <span className="text-[9px] font-mono font-bold bg-amber-100 border border-amber-300 text-amber-800 px-1.5 py-0.5 rounded uppercase">Highly Secure</span>
                            </p>
                            <p className="text-xs text-stone-500 mt-1">Pay smoothly using Credit Cards, Debit Cards, NetBanking, and UPI Wallets.</p>
                          </div>
                        </div>
                        <ShieldCheck className="h-5 w-5 text-stone-600" />
                      </div>

                      {/* Cash on Delivery */}
                      <div 
                        onClick={() => setPaymentMethod("cod")}
                        className={`p-5 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-4 bg-white ${paymentMethod === "cod" ? "border-stone-900 ring-1 ring-stone-900 shadow-sm" : "border-stone-200 hover:border-stone-300"}`}
                      >
                        <div className="flex items-start gap-3">
                          <input
                            type="radio"
                            name="payment_method"
                            checked={paymentMethod === "cod"}
                            onChange={() => setPaymentMethod("cod")}
                            className="mt-1 text-stone-900 focus:ring-stone-400"
                          />
                          <div>
                            <p className="font-bold text-stone-900 text-sm">Cash on Delivery (COD)</p>
                            <p className="text-xs text-stone-500 mt-1">Pay with cash or scan-and-pay UPI QR on delivery. +₹50 handling charge applies.</p>
                          </div>
                        </div>
                        <span className="text-xs font-mono font-medium text-stone-500">+₹50 Fee</span>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-stone-200 flex justify-between">
                      <button
                        onClick={() => setStep("address")}
                        className="px-4 py-2 text-stone-600 hover:text-stone-950 text-xs font-mono underline cursor-pointer"
                      >
                        ← Back to address
                      </button>
                      <button
                        onClick={() => setStep("review")}
                        className="px-6 py-3 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-100 font-display font-semibold text-sm transition-all active:scale-[0.98] cursor-pointer flex items-center gap-1.5 shadow-sm"
                      >
                        Review your order <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* STEP 4: REVIEW ITEMS & PLACE */}
                {step === "review" && (
                  <motion.div
                    key="review"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-6 text-left"
                  >
                    <h3 className="font-display font-extrabold text-stone-950 text-xl flex items-center gap-2">
                      <ShoppingBag className="h-5 w-5 text-stone-800" /> Review your items and details
                    </h3>

                    {/* Meta review summaries */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Shipping address recap */}
                      <div className="bg-white p-5 rounded-2xl border border-stone-200 space-y-2">
                        <div className="flex justify-between items-center">
                          <p className="text-xs font-mono font-semibold text-stone-400 uppercase">Delivery Address</p>
                          <button onClick={() => setStep("address")} className="text-stone-500 hover:text-stone-900 hover:underline text-[10px] font-mono cursor-pointer">Edit</button>
                        </div>
                        <div className="text-xs text-stone-800 space-y-1 font-sans">
                          <p className="font-bold text-stone-950">{address.fullName}</p>
                          <p>{address.addressLine1}, {address.addressLine2}</p>
                          <p>{address.city}, {address.state} - {address.pinCode}</p>
                          <p className="text-stone-500 font-mono text-[10px] pt-1">Phone: +91 {address.phone}</p>
                        </div>
                      </div>

                      {/* Shipping speed and Payment recap */}
                      <div className="bg-white p-5 rounded-2xl border border-stone-200 space-y-3 flex flex-col justify-between">
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <p className="text-xs font-mono font-semibold text-stone-400 uppercase">Shipping Details</p>
                          </div>
                          <p className="text-xs text-stone-800 font-medium">
                            {shippingMethod === "standard" && "Free Standard Delivery (3-5 days)"}
                            {shippingMethod === "express" && "Express Priority Delivery (1-2 days) • ₹150"}
                            {shippingMethod === "same-day" && "Same-Day Premium Delivery • ₹299"}
                          </p>
                        </div>

                        <div className="space-y-1.5 pt-2 border-t border-stone-100">
                          <div className="flex justify-between items-center">
                            <p className="text-xs font-mono font-semibold text-stone-400 uppercase">Payment Method</p>
                            <button onClick={() => setStep("payment")} className="text-stone-500 hover:text-stone-900 hover:underline text-[10px] font-mono cursor-pointer">Edit</button>
                          </div>
                          <p className="text-xs text-stone-800 font-semibold uppercase font-mono">
                            {paymentMethod === "razorpay" && "💳 Razorpay Gateway"}
                            {paymentMethod === "cod" && "💵 Cash on Delivery"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Order items listing */}
                    <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
                      <div className="p-4 bg-stone-100/50 border-b border-stone-200 text-xs font-mono font-bold text-stone-600">
                        Order Items
                      </div>
                      <div className="divide-y divide-stone-200 max-h-56 overflow-y-auto">
                        {items.map((item) => (
                          <div key={item.product.id} className="p-4 flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 bg-stone-100 border border-stone-200 rounded-lg overflow-hidden shrink-0">
                                <img src={item.product.images[0]} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                              </div>
                              <div>
                                <h5 className="text-xs font-bold text-stone-900 line-clamp-1">{item.product.name}</h5>
                                <p className="text-[10px] font-mono text-stone-400">Qty: {item.quantity} × ₹{item.product.price.toLocaleString("en-IN")}</p>
                              </div>
                            </div>
                            <span className="text-xs font-mono font-semibold text-stone-950">₹{(item.product.price * item.quantity).toLocaleString("en-IN")}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-6 border-t border-stone-200 flex justify-between items-center">
                      <button
                        onClick={() => setStep("payment")}
                        className="px-4 py-2 text-stone-600 hover:text-stone-950 text-xs font-mono underline cursor-pointer"
                      >
                        ← Back to payment option
                      </button>
                      <button
                        onClick={handlePlaceOrder}
                        disabled={loading}
                        className="px-8 py-3.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-100 font-display font-extrabold text-sm transition-all active:scale-[0.98] cursor-pointer flex items-center gap-2 shadow-md disabled:opacity-50"
                      >
                        {loading ? (
                          <>
                            <svg className="animate-spin h-5 w-5 text-stone-100" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            Completing Order...
                          </>
                        ) : (
                          <>
                            Place Your Order — ₹{getGrandTotal().toLocaleString("en-IN")}
                          </>
                        )}
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* STEP 5: SUCCESS & ORDER TIMELINE */}
                {step === "success" && (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-8 text-center py-6"
                  >
                    <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-emerald-100 text-emerald-600 mb-2 border-2 border-emerald-300">
                      <CheckCircle2 className="h-9 w-9 animate-bounce" />
                    </div>

                    <div className="space-y-2">
                      <h3 className="font-display font-extrabold text-stone-950 text-2xl sm:text-3xl">
                        Thank you! Your order is placed.
                      </h3>
                      <p className="text-stone-500 text-sm max-w-lg mx-auto">
                        An email confirmation with tracking updates has been dispatched to <span className="text-stone-800 font-bold">{address.email}</span>.
                      </p>
                    </div>

                    {/* Amazon style confirmation block */}
                    <div className="bg-white border border-stone-200 rounded-2xl p-6 text-left max-w-xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <p className="text-[10px] font-mono text-stone-400 uppercase font-semibold">Order ID:</p>
                        <p className="text-sm font-mono font-extrabold text-stone-900">{orderId}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-mono text-stone-400 uppercase font-semibold">Transaction ID:</p>
                        <p className="text-sm font-mono text-stone-600 truncate">{paymentId}</p>
                      </div>
                      <div className="sm:col-span-2 border-t border-stone-100 pt-3">
                        <p className="text-[10px] font-mono text-stone-400 uppercase font-semibold">Guaranteed Delivery Date:</p>
                        <p className="text-sm font-sans font-bold text-emerald-700 flex items-center gap-1.5 mt-0.5">
                          🚚 {estimatedDelivery}
                        </p>
                      </div>
                    </div>

                    {/* Amazon Order Live Transit Timeline Simulation */}
                    <div className="bg-stone-100/60 border border-stone-200/80 rounded-2xl p-6 max-w-xl mx-auto text-left space-y-5">
                      <h4 className="text-xs font-mono font-bold text-stone-500 uppercase tracking-wider">Live Transit Simulation</h4>
                      
                      <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-1.5 before:bottom-1.5 before:w-0.5 before:bg-stone-300">
                        {/* Milestone 1 */}
                        <div className="relative">
                          <span className="absolute -left-6 top-0.5 h-4.5 w-4.5 rounded-full bg-emerald-500 border-4 border-white shadow-xs" />
                          <p className="text-xs font-bold text-stone-900">Order Placed & Secured</p>
                          <p className="text-[10px] text-stone-400">Payment approved and order sent to our warehouse.</p>
                        </div>

                        {/* Milestone 2 */}
                        <div className="relative">
                          <span className="absolute -left-6 top-0.5 h-4.5 w-4.5 rounded-full bg-emerald-500 border-4 border-white shadow-xs animate-pulse" />
                          <p className="text-xs font-bold text-stone-900">Preparing for Shipment</p>
                          <p className="text-[10px] text-stone-400">Surgical steel blades and bottles undergoing calibration scan.</p>
                        </div>

                        {/* Milestone 3 */}
                        <div className="relative opacity-60">
                          <span className="absolute -left-6 top-0.5 h-4.5 w-4.5 rounded-full bg-stone-300 border-4 border-white shadow-xs" />
                          <p className="text-xs font-bold text-stone-500">Dispatched via Amazon Corrugated Courier</p>
                          <p className="text-[10px] text-stone-400">Will be assigned to tracking agent upon dispatch.</p>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center max-w-xl mx-auto">
                      <button
                        onClick={() => window.print()}
                        className="flex-1 py-2.5 rounded-xl border border-stone-200 hover:bg-stone-200/30 text-stone-700 text-xs font-display font-bold cursor-pointer transition-all flex items-center justify-center gap-1.5"
                      >
                        <Printer className="h-4 w-4" /> Save Printable Invoice
                      </button>
                      <button
                        onClick={() => {
                          setStep("address");
                          onClose();
                        }}
                        className="flex-1 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-100 text-xs font-display font-bold cursor-pointer transition-all"
                      >
                        Continue Shopping
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

            </div>

            {/* Right Pricing Summary Sidebar (Columns 9 to 12) */}
            {step !== "success" && (
              <div className="lg:col-span-4 space-y-4">
                <div className="bg-white border border-stone-200 rounded-2xl p-5 space-y-4 shadow-2xs">
                  <h4 className="font-display font-extrabold text-stone-900 text-sm border-b border-stone-100 pb-2">Order Summary</h4>
                  
                  <div className="space-y-2.5 text-xs text-stone-600 font-sans">
                    <div className="flex justify-between">
                      <span>Items Subtotal:</span>
                      <span className="font-mono text-stone-900 font-medium">₹{totalPrice.toLocaleString("en-IN")}</span>
                    </div>

                    <div className="flex justify-between">
                      <span>Shipping Fee:</span>
                      <span className="font-mono text-stone-900">
                        {getShippingCost() === 0 ? "FREE" : `₹${getShippingCost()}`}
                      </span>
                    </div>

                    {paymentMethod === "cod" && (
                      <div className="flex justify-between">
                        <span>COD Convenience Fee:</span>
                        <span className="font-mono text-stone-900">₹50</span>
                      </div>
                    )}

                    <div className="flex justify-between">
                      <span>Est. GST Tax (18%):</span>
                      <span className="font-mono text-stone-900">₹{getTax().toLocaleString("en-IN")}</span>
                    </div>

                    <div className="border-t border-dashed border-stone-200 pt-3 flex justify-between font-bold text-stone-950 text-sm">
                      <span className="font-display">Grand Total:</span>
                      <span className="font-mono text-base text-stone-950">₹{getGrandTotal().toLocaleString("en-IN")}</span>
                    </div>
                  </div>

                  <div className="p-3 bg-stone-100 rounded-xl text-[10px] text-stone-500 leading-normal font-sans border border-stone-200/50 space-y-1">
                    <p className="font-semibold text-stone-700">🔒 Trust Protection Guarantee</p>
                    <p>All items carry a 1-year hardware replacement warranty directly under written invoice parameters.</p>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}

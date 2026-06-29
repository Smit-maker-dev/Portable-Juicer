/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { useOrderStore } from "../store/useOrderStore";
import { useAuthStore } from "../store/useAuthStore";
import { Order, ProductReview, Product } from "../types";
import { 
  Package, Calendar, CheckCircle, Clock, Truck, ShieldAlert, 
  MapPin, Clipboard, Star, MessageSquare, ChevronRight, 
  ArrowLeft, RefreshCw, Check, Copy, Heart, User 
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface OrdersViewProps {
  onBackToShop: () => void;
  onProductClick?: (product: Product) => void;
}

export default function OrdersView({ onBackToShop, onProductClick }: OrdersViewProps) {
  const { orders, reviews, addReview, updateOrderStatus } = useOrderStore();
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<"all" | "active" | "past">("all");
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<string | null>(null);
  
  // Review form modal state
  const [reviewingProduct, setReviewingProduct] = useState<{
    product: Product;
    orderId: string;
  } | null>(null);
  const [rating, setRating] = useState<number>(5);
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [userName, setUserName] = useState(user?.displayName || "Aarav Sharma");
  const [copiedOrderId, setCopiedOrderId] = useState<string | null>(null);
  const [isReviewSuccess, setIsReviewSuccess] = useState(false);

  // Review preset comments
  const PRESET_COMMENTS = [
    "Absolutely amazing quality! Smoothies are perfectly blended.",
    "Very portable, cleans up in 10 seconds. Highly recommend!",
    "Build quality feels premium, fits perfect in my gym bag.",
    "Battery easily lasts for 15+ blends. Outstanding performance."
  ];

  // Helper to filter orders
  const filteredOrders = orders.filter((order) => {
    if (activeTab === "active") {
      return order.status !== "delivered";
    }
    if (activeTab === "past") {
      return order.status === "delivered";
    }
    return true; // "all"
  });

  const handleCopyOrderId = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(id);
    setCopiedOrderId(id);
    setTimeout(() => setCopiedOrderId(null), 2000);
  };

  // Simulate next transit step for interactive learning
  const handleSimulateTransit = (order: Order, e: React.MouseEvent) => {
    e.stopPropagation();
    const statusSequence: Order["status"][] = ["placed", "preparing", "dispatched", "delivered"];
    const currentIndex = statusSequence.indexOf(order.status);
    if (currentIndex < statusSequence.length - 1) {
      const nextStatus = statusSequence[currentIndex + 1];
      updateOrderStatus(order.id, nextStatus);
    }
  };

  // Submit review handler
  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewingProduct) return;

    const newReview: ProductReview = {
      id: `rev-${Math.random().toString(36).substring(2, 9)}`,
      productId: reviewingProduct.product.id,
      orderId: reviewingProduct.orderId,
      rating,
      comment: comment.trim() || "Excellent product, extremely satisfied!",
      date: new Date().toLocaleDateString("en-IN"),
      userName: userName.trim() || "Verified Buyer"
    };

    addReview(newReview, user?.uid);
    setIsReviewSuccess(true);
    setTimeout(() => {
      setReviewingProduct(null);
      setComment("");
      setRating(5);
      setIsReviewSuccess(false);
    }, 1500);
  };

  // Get matching review for a product from this order
  const getProductReview = (productId: string, orderId: string) => {
    return reviews.find(r => r.productId === productId && r.orderId === orderId);
  };

  return (
    <div id="orders-dashboard" className="max-w-5xl mx-auto px-4 py-8 sm:py-12 relative z-10">
      
      {/* Back to boutique button */}
      <button
        id="orders-back-btn"
        onClick={onBackToShop}
        className="inline-flex items-center gap-2 text-stone-500 hover:text-stone-900 transition-colors text-sm font-medium mb-6 cursor-pointer"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to KuaxiBlend Boutique
      </button>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-stone-200">
        <div>
          <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-stone-950">
            Your Orders & Reviews
          </h1>
          <p className="text-stone-500 text-sm mt-1">
            Track current shipments, browse past acquisitions, and review your cordless appliances.
          </p>
        </div>
        <div className="flex items-center gap-1.5 self-start sm:self-center">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-mono text-stone-500 font-semibold uppercase">Verified Buyer Account</span>
        </div>
      </div>

      {/* Quick Statistics Summary Card */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-8">
        <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-3xs">
          <span className="text-xs text-stone-400 font-mono">Total Orders</span>
          <div className="text-2xl font-display font-bold text-stone-900 mt-1">{orders.length}</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-3xs">
          <span className="text-xs text-stone-400 font-mono">In Transit</span>
          <div className="text-2xl font-display font-bold text-stone-900 mt-1">
            {orders.filter(o => o.status !== "delivered").length}
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-3xs">
          <span className="text-xs text-stone-400 font-mono">Delivered Goods</span>
          <div className="text-2xl font-display font-bold text-stone-900 mt-1">
            {orders.filter(o => o.status === "delivered").length}
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-3xs">
          <span className="text-xs text-stone-400 font-mono">Submitted Reviews</span>
          <div className="text-2xl font-display font-bold text-stone-900 mt-1">{reviews.length}</div>
        </div>
      </div>

      {/* Tabs Row */}
      <div className="flex border-b border-stone-200 gap-4 sm:gap-6 overflow-x-auto scrollbar-none whitespace-nowrap mb-6 shrink-0">
        {(["all", "active", "past"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab);
              setSelectedOrderDetails(null);
            }}
            className={`pb-4 text-sm font-medium transition-all relative capitalize cursor-pointer shrink-0 ${
              activeTab === tab 
                ? "text-stone-950 font-semibold" 
                : "text-stone-400 hover:text-stone-700"
            }`}
          >
            {tab === "all" ? "All Orders" : tab === "active" ? "Current / Active" : "Past / Delivered"}
            {activeTab === tab && (
              <motion.div
                layoutId="activeOrderTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-stone-950"
              />
            )}
          </button>
        ))}
      </div>

      {/* Orders Listing & Detail Views */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Order List */}
        <div className={`${selectedOrderDetails ? "lg:col-span-6" : "lg:col-span-12"} space-y-4`}>
          {filteredOrders.length === 0 ? (
            <div className="bg-stone-100/50 border border-dashed border-stone-200 p-12 rounded-3xl text-center space-y-4">
              <Package className="h-10 w-10 text-stone-400 mx-auto" />
              <div className="space-y-1">
                <p className="font-medium text-stone-800">No matching orders found</p>
                <p className="text-sm text-stone-500">Looks like you do not have any orders in this category yet.</p>
              </div>
              <button
                onClick={onBackToShop}
                className="py-2.5 px-5 bg-stone-900 hover:bg-stone-950 text-stone-100 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
              >
                Explore Boutique Catalog
              </button>
            </div>
          ) : (
            filteredOrders.map((order) => {
              const isActive = selectedOrderDetails === order.id;
              const hasDelivered = order.status === "delivered";

              return (
                <div
                  key={order.id}
                  onClick={() => setSelectedOrderDetails(isActive ? null : order.id)}
                  className={`bg-white rounded-2xl border border-stone-200/90 shadow-2xs hover:border-stone-400 transition-all duration-300 p-5 sm:p-6 cursor-pointer relative overflow-hidden ${
                    isActive ? "ring-2 ring-stone-950/20 border-stone-400" : ""
                  }`}
                >
                  
                  {/* Status Strip at Top */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-4 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 bg-stone-100 rounded-lg flex items-center justify-center">
                        <Package className="h-4.5 w-4.5 text-stone-700" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 text-sm font-semibold text-stone-900">
                          <span>Order #{order.id}</span>
                          <button
                            onClick={(e) => handleCopyOrderId(order.id, e)}
                            className="p-1 text-stone-400 hover:text-stone-700 rounded transition-colors"
                            title="Copy Order ID"
                          >
                            {copiedOrderId === order.id ? (
                              <Check className="h-3 w-3 text-emerald-600" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </button>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-stone-400 mt-0.5">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>Placed: {new Date(order.date).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {/* Live simulate trigger */}
                      {order.status !== "delivered" && (
                        <button
                          onClick={(e) => handleSimulateTransit(order, e)}
                          className="px-2.5 py-1 rounded bg-stone-100 hover:bg-stone-200 text-[10px] font-mono font-bold text-stone-700 flex items-center gap-1 transition-colors border border-stone-200"
                          title="Simulate shipping stage update"
                        >
                          <RefreshCw className="h-3 w-3 animate-spin [animation-duration:8s]" />
                          Transit Step
                        </button>
                      )}

                      {/* Status indicator pill */}
                      <span className={`text-[10px] font-mono font-bold tracking-wider uppercase px-2.5 py-1 rounded-full border ${
                        order.status === "placed" ? "bg-amber-50 text-amber-800 border-amber-200" :
                        order.status === "preparing" ? "bg-indigo-50 text-indigo-800 border-indigo-200" :
                        order.status === "dispatched" ? "bg-sky-50 text-sky-800 border-sky-200" :
                        "bg-emerald-50 text-emerald-800 border-emerald-200"
                      }`}>
                        {order.status}
                      </span>
                    </div>
                  </div>

                  {/* Main horizontal preview row */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center gap-3 overflow-hidden">
                      {/* Overlapping thumbnail bundle */}
                      <div className="flex items-center -space-x-4 shrink-0 pr-2">
                        {order.items.map((item, idx) => (
                          <div 
                            key={idx} 
                            className="h-14 w-14 bg-stone-50 border border-stone-200 rounded-xl overflow-hidden shadow-2xs bg-white relative z-10"
                          >
                            <img
                              src={item.product.images[0]}
                              alt={item.product.name}
                              className="h-full w-full object-contain p-1"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                        ))}
                      </div>

                      <div className="space-y-0.5">
                        <p className="text-xs text-stone-400 font-mono">
                          {order.items.reduce((acc, item) => acc + item.quantity, 0)} Items
                        </p>
                        <p className="text-sm font-semibold text-stone-900 truncate max-w-[260px]">
                          {order.items.map(i => i.product.name).join(", ")}
                        </p>
                      </div>
                    </div>

                    <div className="text-right sm:self-center shrink-0">
                      <span className="text-xs text-stone-400 block font-mono">Total paid</span>
                      <span className="text-base font-extrabold text-stone-950 font-mono">₹{order.totalAmount.toLocaleString("en-IN")}</span>
                    </div>
                  </div>

                  {/* Estimated Delivery Prompt */}
                  <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
                    <span className="flex items-center gap-1.5">
                      {hasDelivered ? (
                        <CheckCircle className="h-4 w-4 text-emerald-500" />
                      ) : (
                        <Clock className="h-4 w-4 text-stone-400" />
                      )}
                      <span>
                        {hasDelivered ? "Delivered on:" : "Estimated Arrival:"} <strong className="text-stone-800">{order.deliveryDate}</strong>
                      </span>
                    </span>

                    <span className="text-stone-400 hover:text-stone-700 font-medium inline-flex items-center gap-0.5 transition-colors">
                      {isActive ? "Hide Details" : "View Details"}
                      <ChevronRight className={`h-3.5 w-3.5 transform transition-transform ${isActive ? "rotate-90" : ""}`} />
                    </span>
                  </div>

                </div>
              );
            })
          )}
        </div>

        {/* Right Side: Order details sidebar panel */}
        {selectedOrderDetails && (
          <div className="lg:col-span-6 bg-white border border-stone-200 rounded-3xl p-6 shadow-sm space-y-6">
            {(() => {
              const detailOrder = orders.find(o => o.id === selectedOrderDetails);
              if (!detailOrder) return null;

              const hasDelivered = detailOrder.status === "delivered";

              return (
                <div className="space-y-6 animate-fadeIn">
                  
                  {/* Close and Detail title */}
                  <div className="flex items-center justify-between border-b border-stone-100 pb-4">
                    <div>
                      <h2 className="text-lg font-bold text-stone-950 font-display">Order Specification</h2>
                      <p className="text-xs font-mono text-stone-400 mt-0.5">Order Id: {detailOrder.id}</p>
                    </div>
                    <button
                      onClick={() => setSelectedOrderDetails(null)}
                      className="text-stone-400 hover:text-stone-900 font-medium text-xs border border-stone-200 hover:border-stone-400 rounded-lg px-2.5 py-1.5 transition-colors cursor-pointer"
                    >
                      Close Detail
                    </button>
                  </div>

                  {/* Interactive Status Timeline */}
                  <div className="bg-stone-50 border border-stone-200/60 p-4 rounded-2xl">
                    <p className="text-[10px] font-mono uppercase tracking-widest text-stone-400 font-bold mb-4">Shipment Progress</p>
                    
                    <div className="relative flex items-center justify-between mt-2 px-1">
                      
                      {/* Connection track lines */}
                      <div className="absolute top-3.5 left-[12.5%] right-[12.5%] h-0.5 bg-stone-200 z-0">
                        <div 
                          className="h-full bg-emerald-500 transition-all duration-500" 
                          style={{
                            width: detailOrder.status === "placed" ? "0%" :
                                   detailOrder.status === "preparing" ? "33.3%" :
                                   detailOrder.status === "dispatched" ? "66.6%" : "100%"
                          }}
                        />
                      </div>

                      {/* Status Nodes */}
                      {[
                        { key: "placed", label: "Ordered", icon: Clipboard },
                        { key: "preparing", label: "Packaged", icon: Clock },
                        { key: "dispatched", label: "Shipped", icon: Truck },
                        { key: "delivered", label: "Delivered", icon: CheckCircle }
                      ].map((step, idx) => {
                        const isCompleted = ["placed", "preparing", "dispatched", "delivered"].indexOf(detailOrder.status) >= idx;
                        const isCurrent = detailOrder.status === step.key;
                        const StepIcon = step.icon;

                        return (
                          <div key={step.key} className="relative z-10 flex flex-col items-center flex-1 text-center">
                            <div className={`h-8 w-8 rounded-full border flex items-center justify-center transition-all ${
                              isCompleted 
                                ? "bg-emerald-500 border-emerald-500 text-white shadow-xs" 
                                : "bg-white border-stone-200 text-stone-400"
                            } ${isCurrent ? "ring-4 ring-emerald-100" : ""}`}>
                              <StepIcon className="h-4 w-4" />
                            </div>
                            <span className={`text-[10px] font-medium tracking-tight mt-2 ${
                              isCompleted ? "text-stone-900 font-semibold" : "text-stone-400"
                            }`}>
                              {step.label}
                            </span>
                          </div>
                        );
                      })}

                    </div>
                  </div>

                  {/* Items list with Review prompts */}
                  <div className="space-y-3">
                    <p className="text-[10px] font-mono uppercase tracking-widest text-stone-400 font-bold">Ordered Commodities</p>
                    
                    <div className="divide-y divide-stone-100">
                      {detailOrder.items.map((item) => {
                        const review = getProductReview(item.product.id, detailOrder.id);

                        return (
                          <div key={item.product.id} className="py-3.5 flex items-start gap-4 justify-between">
                            <div className="flex gap-3 overflow-hidden">
                              <div 
                                className="h-16 w-16 bg-stone-50 border border-stone-200 rounded-xl overflow-hidden shrink-0 cursor-pointer"
                                onClick={() => onProductClick && onProductClick(item.product)}
                              >
                                <img
                                  src={item.product.images[0]}
                                  alt={item.product.name}
                                  className="h-full w-full object-contain p-1"
                                  referrerPolicy="no-referrer"
                                />
                              </div>
                              <div className="space-y-0.5 truncate">
                                <h4 
                                  className="text-xs font-semibold text-stone-900 hover:underline cursor-pointer truncate max-w-[220px]"
                                  onClick={() => onProductClick && onProductClick(item.product)}
                                >
                                  {item.product.name}
                                </h4>
                                <p className="text-xs text-stone-500 font-mono">
                                  ₹{item.product.price.toLocaleString("en-IN")} × {item.quantity}
                                </p>
                              </div>
                            </div>

                            <div className="shrink-0 text-right">
                              {hasDelivered ? (
                                review ? (
                                  <div className="space-y-1">
                                    <div className="flex items-center justify-end gap-0.5">
                                      {Array.from({ length: 5 }).map((_, i) => (
                                        <Star key={i} className={`h-3 w-3 ${i < review.rating ? "text-amber-400 fill-amber-400" : "text-stone-200"}`} />
                                      ))}
                                    </div>
                                    <span className="text-[10px] text-stone-400 font-mono block">Reviewed ✓</span>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => setReviewingProduct({ product: item.product, orderId: detailOrder.id })}
                                    className="text-[10px] font-mono uppercase tracking-wider font-semibold py-1.5 px-3 rounded-lg border border-stone-900 hover:bg-stone-900 hover:text-stone-100 transition-all cursor-pointer flex items-center gap-1"
                                  >
                                    <MessageSquare className="h-3 w-3" />
                                    Review
                                  </button>
                                )
                              ) : (
                                <span className="text-[10px] text-stone-400 font-mono italic">Arrives soon</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Shipping address & payment block */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 border-t border-stone-100 pt-5">
                    
                    <div className="space-y-2">
                      <p className="text-[10px] font-mono uppercase tracking-widest text-stone-400 font-bold flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" /> Shipping Destination
                      </p>
                      <div className="text-xs text-stone-600 space-y-0.5 leading-normal">
                        <p className="font-semibold text-stone-900">{detailOrder.shippingAddress.fullName}</p>
                        <p>{detailOrder.shippingAddress.addressLine1}</p>
                        {detailOrder.shippingAddress.addressLine2 && <p>{detailOrder.shippingAddress.addressLine2}</p>}
                        <p>{detailOrder.shippingAddress.city}, {detailOrder.shippingAddress.state} - {detailOrder.shippingAddress.pinCode}</p>
                        <p className="text-stone-400 font-mono text-[10px] pt-1">Phone: +91 {detailOrder.shippingAddress.phone}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-[10px] font-mono uppercase tracking-widest text-stone-400 font-bold flex items-center gap-1">
                        💳 Billing & Payment
                      </p>
                      <div className="text-xs text-stone-600 space-y-0.5 font-mono">
                        <p className="capitalize"><span className="text-stone-400">Method:</span> <strong className="text-stone-800">{detailOrder.paymentMethod === "razorpay" ? "Razorpay Online" : detailOrder.paymentMethod.toUpperCase()}</strong></p>
                        {detailOrder.paymentId && (
                          <p className="text-[10px] text-stone-400 truncate max-w-[180px]">
                            ID: {detailOrder.paymentId}
                          </p>
                        )}
                        <p className="pt-2 text-stone-400 font-sans"><span className="text-stone-400 font-mono">Mode:</span> {detailOrder.shippingMethod === "same-day" ? "Same-Day Delivery" : detailOrder.shippingMethod === "express" ? "Express Corridor" : "Standard Post"}</p>
                      </div>
                    </div>

                  </div>

                </div>
              );
            })()}
          </div>
        )}

      </div>

      {/* Review Dialog/Modal overlay */}
      <AnimatePresence>
        {reviewingProduct && (
          <div className="fixed inset-0 z-50 bg-stone-950/40 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border border-stone-200 rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-6 max-h-[calc(100vh-2rem)] md:max-h-[90vh] overflow-y-auto"
            >
              
              {/* Header */}
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <h3 className="font-display font-bold text-lg text-stone-900">Add Product Review</h3>
                <button
                  onClick={() => setReviewingProduct(null)}
                  className="p-1 rounded-full text-stone-400 hover:text-stone-800 hover:bg-stone-100 transition-all cursor-pointer"
                >
                  <Copy className="h-4 w-4 rotate-45" />
                </button>
              </div>

              {isReviewSuccess ? (
                <div className="py-12 text-center space-y-4">
                  <div className="h-12 w-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                    <Check className="h-6 w-6 stroke-[3]" />
                  </div>
                  <div>
                    <h4 className="font-bold text-stone-900">Review Submitted!</h4>
                    <p className="text-xs text-stone-500 mt-1">Thank you for sharing your experience. We appreciate it!</p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleReviewSubmit} className="space-y-4">
                  
                  {/* Product thumbnail snippet */}
                  <div className="flex items-center gap-3 bg-stone-50 p-3 rounded-xl border border-stone-100">
                    <div className="h-12 w-12 bg-white rounded-lg border border-stone-200/80 overflow-hidden shrink-0 flex items-center justify-center">
                      <img
                        src={reviewingProduct.product.images[0]}
                        alt={reviewingProduct.product.name}
                        className="h-full w-full object-contain p-0.5"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="truncate">
                      <p className="text-xs text-stone-400 font-mono">Reviewing purchase</p>
                      <h4 className="text-xs font-semibold text-stone-900 truncate max-w-[240px]">{reviewingProduct.product.name}</h4>
                    </div>
                  </div>

                  {/* Rating Selector */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-stone-700 block">Overall Rating:</label>
                    <div className="flex items-center gap-2">
                      {Array.from({ length: 5 }).map((_, idx) => {
                        const starVal = idx + 1;
                        const isFilled = hoveredRating !== null ? starVal <= hoveredRating : starVal <= rating;

                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setRating(starVal)}
                            onMouseEnter={() => setHoveredRating(starVal)}
                            onMouseLeave={() => setHoveredRating(null)}
                            className="p-1 focus:outline-none cursor-pointer transform hover:scale-110 transition-transform"
                          >
                            <Star 
                              className={`h-7 w-7 transition-colors ${
                                isFilled 
                                  ? "text-amber-400 fill-amber-400" 
                                  : "text-stone-200"
                              }`} 
                            />
                          </button>
                        );
                      })}
                      <span className="text-xs text-stone-500 font-mono ml-2">
                        {rating === 5 ? "Excellent (5/5)" : rating === 4 ? "Very Good (4/5)" : rating === 3 ? "Good (3/5)" : rating === 2 ? "Fair (2/5)" : "Poor (1/5)"}
                      </span>
                    </div>
                  </div>

                  {/* User Name input */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-stone-700 block">Your Display Name:</label>
                    <input
                      type="text"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      required
                      placeholder="e.g. Aarav S"
                      className="w-full text-xs py-2 px-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-stone-400"
                    />
                  </div>

                  {/* Presets */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-stone-700 block">Quick Preset Comments:</label>
                    <div className="flex flex-wrap gap-1.5">
                      {PRESET_COMMENTS.map((text, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setComment(text)}
                          className="text-[10px] py-1 px-2.5 rounded-lg border border-stone-200 hover:border-stone-400 bg-stone-50 text-stone-600 transition-all cursor-pointer"
                        >
                          {text.split("!")[0] + "..."}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Textarea review */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-stone-700 block">Detailed Feedback:</label>
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      required
                      rows={3}
                      placeholder="How has KuaxiBlend worked out for you? Share performance, ease of washing, and battery life details..."
                      className="w-full text-xs p-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-stone-400 resize-none leading-relaxed"
                    />
                  </div>

                  {/* Submit buttons */}
                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setReviewingProduct(null)}
                      className="flex-1 text-xs py-3 border border-stone-200 text-stone-500 rounded-xl hover:bg-stone-50 transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 text-xs py-3 bg-stone-900 text-stone-100 font-semibold rounded-xl hover:bg-stone-950 transition-colors cursor-pointer"
                    >
                      Post Review
                    </button>
                  </div>

                </form>
              )}

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

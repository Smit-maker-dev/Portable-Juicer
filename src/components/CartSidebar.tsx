/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { useCartStore } from "../store/useCartStore";
import CheckoutButton from "./CheckoutButton";
import { X, Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onCheckoutTrigger?: () => void;
}

export default function CartSidebar({ isOpen, onClose, onCheckoutTrigger }: CartSidebarProps) {
  const { items, updateQuantity, removeItem, getTotalPrice, getTotalItems } = useCartStore();

  const totalPrice = getTotalPrice();
  const totalItems = getTotalItems();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-[2px]"
          />

          {/* Sidebar container */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 220 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md bg-stone-50 border-l border-stone-200 shadow-2xl flex flex-col h-full overflow-hidden"
          >
            {/* Header section */}
            <div className="p-6 border-b border-stone-200 flex items-center justify-between bg-stone-100/50">
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-stone-800" />
                <h2 className="font-display font-medium text-stone-900 text-lg">
                  Shopping Cart
                </h2>
                <span className="text-xs bg-stone-200 text-stone-700 px-2.5 py-0.5 rounded-full font-mono font-medium">
                  {totalItems}
                </span>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-stone-500 hover:text-stone-800 hover:bg-stone-200/50 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Cart items listing */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                  <div className="p-4 bg-stone-100 rounded-full text-stone-400">
                    <ShoppingBag className="h-8 w-8" />
                  </div>
                  <div>
                    <h3 className="font-display font-medium text-stone-800 text-base">Your cart is empty</h3>
                    <p className="text-sm text-stone-500 mt-1 max-w-[250px] mx-auto">
                      Add our Portable Rechargeable Blender to kickstart your healthy, on-the-go lifestyle today!
                    </p>
                  </div>
                </div>
              ) : (
                items.map((item) => (
                  <div
                    key={item.product.id}
                    className="flex items-start gap-4 pb-6 border-b border-stone-200 last:border-b-0"
                  >
                    {/* Item Image */}
                    <div className="w-20 h-20 bg-stone-200/50 rounded-xl overflow-hidden border border-stone-200 flex items-center justify-center relative shrink-0">
                      {item.product.images[0] ? (
                        <img
                          src={item.product.images[0]}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="text-[10px] text-stone-400 font-mono">No Image</div>
                      )}
                    </div>

                    {/* Details and state triggers */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <h4 className="font-display font-medium text-stone-900 text-sm leading-snug truncate">
                          {item.product.name}
                        </h4>
                        <span className="font-mono text-sm text-stone-900 font-medium ml-2">
                          ₹{(item.product.price * item.quantity).toLocaleString("en-IN")}
                        </span>
                      </div>
                      <p className="text-stone-500 text-xs font-mono mt-0.5">
                        ₹{item.product.price.toLocaleString("en-IN")} each
                      </p>

                      {/* Quantity controls and delete action */}
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center border border-stone-300 rounded-lg bg-white overflow-hidden shadow-2xs">
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            className="p-1 px-2.5 hover:bg-stone-50 active:bg-stone-100 transition-colors text-stone-600 cursor-pointer"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="px-2 text-sm font-mono font-medium text-stone-800">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            className="p-1 px-2.5 hover:bg-stone-50 active:bg-stone-100 transition-colors text-stone-600 cursor-pointer"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>

                        <button
                          onClick={() => removeItem(item.product.id)}
                          className="p-1.5 text-stone-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Sticky summary footer */}
            {items.length > 0 && (
              <div className="p-6 border-t border-stone-200 bg-stone-100/50 space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-stone-600 text-sm">
                    <span>Subtotal</span>
                    <span className="font-mono">₹{totalPrice.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between text-stone-600 text-sm">
                    <span>Shipping</span>
                    <span className="font-sans text-xs uppercase tracking-wide text-stone-500 font-medium bg-stone-200/60 px-1.5 py-0.5 rounded">Free</span>
                  </div>
                  <div className="border-t border-dashed border-stone-300 my-2 pt-2 flex justify-between text-stone-900 font-medium">
                    <span className="font-display">Total</span>
                    <span className="font-mono text-lg font-semibold text-stone-950">₹{totalPrice.toLocaleString("en-IN")}</span>
                  </div>
                </div>

                <button
                  id="checkout-btn-payment"
                  onClick={() => {
                    if (onCheckoutTrigger) {
                      onCheckoutTrigger();
                    }
                  }}
                  className="relative overflow-hidden w-full py-4 px-6 rounded-xl font-display font-medium text-stone-100 bg-stone-800 hover:bg-stone-900 active:scale-[0.98] transition-all duration-300 shadow-sm cursor-pointer mt-2"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    Proceed to Checkout — ₹{totalPrice.toLocaleString("en-IN")}
                  </span>
                </button>

                <p className="text-[10px] text-center text-stone-400 leading-normal">
                  Payments are secure, encrypted, and processed instantly by Razorpay.
                </p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

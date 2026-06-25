/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Order, ProductReview } from "../types";

interface OrderState {
  orders: Order[];
  reviews: ProductReview[];
  addOrder: (order: Order) => void;
  addReview: (review: ProductReview) => void;
  updateOrderStatus: (orderId: string, status: Order["status"]) => void;
  resetToDefault: () => void;
}

// Pre-seeded products for mock history
const MOCK_PRODUCTS = {
  blender: {
    id: "kuaxiblend-portable-usb-blender-380ml",
    name: "KuaxiBlend Portable USB Blender (380ml)",
    price: 2499,
    description: "Our signature professional-grade, cordless personal blender...",
    features: [],
    images: [
      "https://upload.meeshosupplyassets.com/cataloging/1782386142579/Create_a_premium_e-commerce_product_202605191044.jpeg",
      "https://upload.meeshosupplyassets.com/cataloging/1782386142871/Exploded_view_portable_blender_s_202605191058.jpeg",
      "https://upload.meeshosupplyassets.com/cataloging/1782386142721/Portable_blender_feature_showcase_202605191047.jpeg",
      "https://upload.meeshosupplyassets.com/cataloging/1782386142822/Portable_blender_in_lifestyle_scene_202605191048.jpeg",
      "https://upload.meeshosupplyassets.com/cataloging/1782386142897/Portable_juicer_blender_action_s_202605191101.jpeg"
    ]
  },
  sleeve: {
    id: "kuaxishield-neoprene-travel-sleeve",
    name: "KuaxiShield Insulated Neoprene Travel Sleeve",
    price: 599,
    description: "Premium double-insulated neoprene protector sleeve...",
    features: [],
    images: ["https://images.unsplash.com/photo-1517256064527-09c53b2d0bc6?auto=format&fit=crop&q=80&w=600"]
  },
  dock: {
    id: "kuaxidock-magnetic-fast-charging-pad",
    name: "KuaxiDock Magnetic Wireless Charging Pad",
    price: 799,
    description: "Elevate your countertop setup...",
    features: [],
    images: ["https://images.unsplash.com/photo-1622445262465-2481c4574875?auto=format&fit=crop&q=80&w=600"]
  }
};

const DEFAULT_ORDERS: Order[] = [
  {
    id: "AB-481923",
    date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
    items: [
      {
        product: MOCK_PRODUCTS.blender,
        quantity: 1
      }
    ],
    totalAmount: 2499,
    shippingAddress: {
      fullName: "Smit Vaghasiya",
      phone: "9988776655",
      email: "smitvaghasiya182@gmail.com",
      pinCode: "395006",
      addressLine1: "B-404, Shrinand Residency, VIP Road",
      addressLine2: "Near Vesu Canal Road",
      city: "Surat",
      state: "Gujarat",
      landmark: "Opposite Royal Arcade",
      addressType: "home"
    },
    shippingMethod: "standard",
    paymentMethod: "razorpay",
    status: "delivered",
    deliveryDate: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toLocaleDateString("en-IN", {
      weekday: "long",
      year: "numeric",
      month: "short",
      day: "numeric"
    }),
    paymentId: "pay_simulated_past_001"
  },
  {
    id: "AB-718921",
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    items: [
      {
        product: MOCK_PRODUCTS.sleeve,
        quantity: 1
      },
      {
        product: MOCK_PRODUCTS.dock,
        quantity: 1
      }
    ],
    totalAmount: 1398,
    shippingAddress: {
      fullName: "Smit Vaghasiya",
      phone: "9988776655",
      email: "smitvaghasiya182@gmail.com",
      pinCode: "395006",
      addressLine1: "B-404, Shrinand Residency, VIP Road",
      addressLine2: "Near Vesu Canal Road",
      city: "Surat",
      state: "Gujarat",
      landmark: "Opposite Royal Arcade",
      addressType: "home"
    },
    shippingMethod: "express",
    paymentMethod: "upi",
    status: "dispatched",
    deliveryDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toLocaleDateString("en-IN", {
      weekday: "long",
      year: "numeric",
      month: "short",
      day: "numeric"
    }),
    paymentId: "pay_simulated_past_002"
  }
];

const DEFAULT_REVIEWS: ProductReview[] = [
  {
    id: "rev-1",
    productId: "kuaxiblend-portable-usb-blender-380ml",
    orderId: "AB-481923",
    rating: 5,
    comment: "Absolutely in love with this portable blender! Cleans so easily and the real-life look is pure premium. Smoothies come out completely seedless and silky. Highly recommend!",
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toLocaleDateString("en-IN"),
    userName: "Smit Vaghasiya"
  }
];

export const useOrderStore = create<OrderState>()(
  persist(
    (set) => ({
      orders: DEFAULT_ORDERS,
      reviews: DEFAULT_REVIEWS,
      addOrder: (order) => {
        set((state) => ({
          orders: [order, ...state.orders]
        }));
      },
      addReview: (review) => {
        set((state) => ({
          reviews: [review, ...state.reviews]
        }));
      },
      updateOrderStatus: (orderId, status) => {
        set((state) => ({
          orders: state.orders.map((o) =>
            o.id === orderId ? { ...o, status } : o
          )
        }));
      },
      resetToDefault: () => {
        set({ orders: DEFAULT_ORDERS, reviews: DEFAULT_REVIEWS });
      }
    }),
    {
      name: "portable-blender-orders-storage-v1"
    }
  )
);

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Order, ProductReview } from "../types";
import { db } from "../lib/firebase";
import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  updateDoc 
} from "firebase/firestore";

interface OrderState {
  orders: Order[];
  reviews: ProductReview[];
  loading: boolean;
  error: string | null;
  fetchOrders: (userId: string) => Promise<void>;
  fetchReviews: () => Promise<void>;
  addOrder: (order: Order, userId?: string) => Promise<void>;
  addReview: (review: ProductReview, userId?: string) => Promise<void>;
  updateOrderStatus: (orderId: string, status: Order["status"]) => Promise<void>;
  resetToDefault: () => void;
  syncLocalToFirestore: (userId: string) => Promise<void>;
}

// Pre-seeded products for mock history
const MOCK_PRODUCTS = {
  blender: {
    id: "kuaxiblend-portable-usb-blender-380ml",
    name: "KuaxiBlend Portable USB Blender (380ml)",
    price: 499,
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
    price: 429,
    description: "Premium double-insulated neoprene protector sleeve...",
    features: [],
    images: ["https://images.unsplash.com/photo-1517256064527-09c53b2d0bc6?auto=format&fit=crop&q=80&w=600"]
  },
  dock: {
    id: "kuaxidock-magnetic-fast-charging-pad",
    name: "KuaxiDock Magnetic Wireless Charging Pad",
    price: 459,
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
    totalAmount: 499,
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
    totalAmount: 888,
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
    (set, get) => ({
      orders: DEFAULT_ORDERS,
      reviews: DEFAULT_REVIEWS,
      loading: false,
      error: null,

      fetchReviews: async () => {
        set({ loading: true, error: null });
        try {
          const reviewsCol = collection(db, "reviews");
          const q = query(reviewsCol, orderBy("date", "desc"));
          const snapshot = await getDocs(q);
          
          if (snapshot.empty) {
            // Use default seeded reviews locally if Firestore is empty
            set({ reviews: DEFAULT_REVIEWS, loading: false });
          } else {
            const fetched: ProductReview[] = [];
            snapshot.forEach((docSnap) => {
              fetched.push(docSnap.data() as ProductReview);
            });
            set({ reviews: fetched, loading: false });
          }
        } catch (err: any) {
          console.error("Firestore reviews load failed, using local/fallback", err);
          // Fall back to default seeded reviews locally upon network or permission errors
          set({ reviews: DEFAULT_REVIEWS, error: err.message, loading: false });
        }
      },

      fetchOrders: async (userId: string) => {
        if (!userId) return;
        set({ loading: true, error: null });
        try {
          const ordersCol = collection(db, "orders");
          const q = query(ordersCol, where("userId", "==", userId), orderBy("date", "desc"));
          const snapshot = await getDocs(q);
          const fetched: Order[] = [];
          snapshot.forEach((docSnap) => {
            fetched.push(docSnap.data() as Order);
          });
          set({ orders: fetched, loading: false });
        } catch (err: any) {
          console.error("Firestore orders load failed, using local/fallback", err);
          // Keep whatever local orders exist
          set({ error: err.message, loading: false });
        }
      },

      addOrder: async (order, userId) => {
        const targetUserId = userId || "guest_user";
        const enrichedOrder = { ...order, userId: targetUserId };
        
        // Always save locally immediately for prompt UI transitions
        set((state) => ({
          orders: [enrichedOrder, ...state.orders]
        }));

        if (userId) {
          try {
            const docRef = doc(db, "orders", enrichedOrder.id);
            await setDoc(docRef, enrichedOrder);
          } catch (err: any) {
            console.error("Failed to sync order to Firestore:", err);
          }
        }
      },

      addReview: async (review, userId) => {
        const targetUserId = userId || "guest_user";
        const enrichedReview = { ...review, userId: targetUserId };

        // Always save locally immediately
        set((state) => ({
          reviews: [enrichedReview, ...state.reviews]
        }));

        try {
          const docRef = doc(db, "reviews", enrichedReview.id);
          await setDoc(docRef, enrichedReview);
        } catch (err: any) {
          console.error("Failed to sync review to Firestore:", err);
        }
      },

      updateOrderStatus: async (orderId, status) => {
        // Update local state first
        set((state) => ({
          orders: state.orders.map((o) =>
            o.id === orderId ? { ...o, status } : o
          )
        }));

        try {
          const docRef = doc(db, "orders", orderId);
          await updateDoc(docRef, { status });
        } catch (err: any) {
          console.error("Failed to update status on Firestore:", err);
        }
      },

      syncLocalToFirestore: async (userId: string) => {
        if (!userId) return;
        const localOrders = get().orders;
        
        // Find orders placed locally as guest (having guest_user id or not existing in user profile)
        const guestOrders = localOrders.filter(o => (o as any).userId === "guest_user" || !(o as any).userId);
        if (guestOrders.length === 0) return;

        try {
          for (const order of guestOrders) {
            const enriched = { ...order, userId };
            const docRef = doc(db, "orders", order.id);
            await setDoc(docRef, enriched);
          }
          // Reload orders after synchronization
          await get().fetchOrders(userId);
        } catch (err) {
          console.error("Failed to sync local guest orders to account:", err);
        }
      },

      resetToDefault: () => {
        set({ orders: DEFAULT_ORDERS, reviews: DEFAULT_REVIEWS, error: null });
      }
    }),
    {
      name: "portable-blender-orders-storage-v1"
    }
  )
);

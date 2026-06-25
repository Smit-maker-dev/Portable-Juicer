/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { useCartStore } from "./store/useCartStore";
import CartSidebar from "./components/CartSidebar";
import CheckoutFlow from "./components/CheckoutFlow";
import OrdersView from "./components/OrdersView";
import { Product } from "./types";
import { 
  ShoppingBag, 
  ArrowRight, 
  Check, 
  Battery, 
  Zap, 
  ShieldCheck, 
  Sparkles, 
  Info, 
  RotateCcw,
  Star,
  Lock,
  Truck,
  Heart,
  Package,
  Search,
  ChevronDown,
  User,
  LogOut
} from "lucide-react";
import { gsap } from "gsap";
import { useAuthStore } from "./store/useAuthStore";
import AuthModal from "./components/AuthModal";

// Product definition matching types/index.ts
const PREMIUM_BLENDER: Product = {
  id: "kuaxiblend-portable-usb-blender-380ml",
  name: "KuaxiBlend Portable USB Blender",
  price: 2499, // ₹2,499
  description: "A high-quality, cordless personal blender designed for active lifestyles. Made with safe, BPA-free food-grade plastic, strong rechargeable batteries, and six sharp stainless steel blades, it blends frozen fruits and fresh vegetables into smooth drinks in just 20 seconds.",
  features: [
    "380ml Bottle Capacity",
    "6 Sharp Stainless Steel Blades",
    "Double Powerful Rechargeable Batteries",
    "Easy Safety Alignment Switch",
    "High-Speed Blender Motor"
  ],
  images: [
    "https://upload.meeshosupplyassets.com/cataloging/1782386142579/Create_a_premium_e-commerce_product_202605191044.jpeg",
    "https://upload.meeshosupplyassets.com/cataloging/1782386142871/Exploded_view_portable_blender_s_202605191058.jpeg",
    "https://upload.meeshosupplyassets.com/cataloging/1782386142721/Portable_blender_feature_showcase_202605191047.jpeg",
    "https://upload.meeshosupplyassets.com/cataloging/1782386142822/Portable_blender_in_lifestyle_scene_202605191048.jpeg",
    "https://upload.meeshosupplyassets.com/cataloging/1782386142897/Portable_juicer_blender_action_s_202605191101.jpeg"
  ]
};

interface AmazonProductDetails {
  rating: number;
  ratingCount: number;
  originalPrice: number;
  stockLeft: number;
  isBestSeller?: boolean;
  isAmazonChoice?: boolean;
  couponText?: string;
  deliveryDays: number;
}

export const PRODUCTS_CATALOG: Product[] = [
  {
    id: "kuaxiblend-portable-usb-blender-380ml",
    name: "KuaxiBlend Portable USB Blender (380ml)",
    price: 2499,
    description: "Our signature cordless personal blender. Made with durable, safe BPA-free plastic, rechargeable batteries, and six sharp stainless steel blades. Easily blends frozen berries and shakes in 20 seconds.",
    features: [
      "380ml capacity with a leakproof lid for drinking directly",
      "Strong stainless steel 6-blade system",
      "Dual rechargeable batteries that charge quickly",
      "Built-in safety lock to prevent accidental spinning",
      "Powerful 22,000 RPM motor for easy blending"
    ],
    images: [
      "https://upload.meeshosupplyassets.com/cataloging/1782386142579/Create_a_premium_e-commerce_product_202605191044.jpeg",
      "https://upload.meeshosupplyassets.com/cataloging/1782386142871/Exploded_view_portable_blender_s_202605191058.jpeg",
      "https://upload.meeshosupplyassets.com/cataloging/1782386142721/Portable_blender_feature_showcase_202605191047.jpeg",
      "https://upload.meeshosupplyassets.com/cataloging/1782386142822/Portable_blender_in_lifestyle_scene_202605191048.jpeg",
      "https://upload.meeshosupplyassets.com/cataloging/1782386142897/Portable_juicer_blender_action_s_202605191101.jpeg"
    ]
  },
  {
    id: "kuaxiblend-pro-max-500ml",
    name: "KuaxiBlend Pro Max Cordless Blender (500ml)",
    price: 3199,
    description: "A larger and more powerful cordless blender. Features an upgraded 8-leaf blade, a fast 24,000 RPM motor, and a clear LED screen showing battery percentage and blending time.",
    features: [
      "Extra-large 500ml capacity safe plastic bottle",
      "Upgraded 8-leaf stainless steel blades",
      "Bigger rechargeable batteries for up to 20 blends",
      "LED screen showing battery life and timers",
      "Quiet design with a solid, slip-resistant base"
    ],
    images: [
      "https://upload.meeshosupplyassets.com/cataloging/1782386142721/Portable_blender_feature_showcase_202605191047.jpeg",
      "https://upload.meeshosupplyassets.com/cataloging/1782386142871/Exploded_view_portable_blender_s_202605191058.jpeg",
      "https://upload.meeshosupplyassets.com/cataloging/1782386142579/Create_a_premium_e-commerce_product_202605191044.jpeg",
      "https://upload.meeshosupplyassets.com/cataloging/1782386142822/Portable_blender_in_lifestyle_scene_202605191048.jpeg",
      "https://upload.meeshosupplyassets.com/cataloging/1782386142897/Portable_juicer_blender_action_s_202605191101.jpeg"
    ]
  },
  {
    id: "kuaxishield-neoprene-travel-sleeve",
    name: "KuaxiShield Insulated Neoprene Travel Sleeve",
    price: 599,
    description: "Insulated protective cover designed for KuaxiBlend 380ml and 500ml blenders. Keeps your drinks cold for up to 6 hours and protects the bottle from accidental drops, dents, and scratches.",
    features: [
      "Thick, shockproof protective material",
      "Adjustable handle strap for easy carrying",
      "Clear window to easily see the blender alignment",
      "Heat-blocking inner lining to keep drinks cool",
      "Stain-resistant and fully machine-washable"
    ],
    images: [
      "https://upload.meeshosupplyassets.com/cataloging/1782386142822/Portable_blender_in_lifestyle_scene_202605191048.jpeg",
      "https://upload.meeshosupplyassets.com/cataloging/1782386142579/Create_a_premium_e-commerce_product_202605191044.jpeg",
      "https://upload.meeshosupplyassets.com/cataloging/1782386142721/Portable_blender_feature_showcase_202605191047.jpeg",
      "https://upload.meeshosupplyassets.com/cataloging/1782386142871/Exploded_view_portable_blender_s_202605191058.jpeg"
    ]
  },
  {
    id: "kuaxidock-magnetic-fast-charging-pad",
    name: "KuaxiDock Magnetic Wireless Charging Pad",
    price: 799,
    description: "The perfect addition to your kitchen counter. Strong magnets align your blender perfectly on the pad for fast, wireless charging with clear light indicators.",
    features: [
      "Easy magnetic alignment for charging",
      "Beautiful natural stone-look surface",
      "Anti-slip rubber bottom rings",
      "Uses standard USB Type-C for convenient connection",
      "Automatic safety shut-off to prevent overcharging"
    ],
    images: [
      "https://upload.meeshosupplyassets.com/cataloging/1782386142871/Exploded_view_portable_blender_s_202605191058.jpeg",
      "https://upload.meeshosupplyassets.com/cataloging/1782386142579/Create_a_premium_e-commerce_product_202605191044.jpeg",
      "https://upload.meeshosupplyassets.com/cataloging/1782386142721/Portable_blender_feature_showcase_202605191047.jpeg",
      "https://upload.meeshosupplyassets.com/cataloging/1782386142822/Portable_blender_in_lifestyle_scene_202605191048.jpeg"
    ]
  },
  {
    id: "kuaxipack-replacement-jar-blade-set",
    name: "KuaxiPack Spare Jar & Surgical Blade Kit",
    price: 899,
    description: "A complete spare bottle set. Includes a secondary BPA-free plastic jar and a fresh set of stainless steel blades so you can keep blending while your other set is washing.",
    features: [
      "Clear 380ml safe plastic bottle",
      "Replacement 6-blade stainless steel unit",
      "Heavy-duty rubber seals to prevent leaks",
      "Waterproof base thread with safety magnets",
      "Completely dishwasher-safe and easy to clean"
    ],
    images: [
      "https://upload.meeshosupplyassets.com/cataloging/1782386142897/Portable_juicer_blender_action_s_202605191101.jpeg",
      "https://upload.meeshosupplyassets.com/cataloging/1782386142871/Exploded_view_portable_blender_s_202605191058.jpeg",
      "https://upload.meeshosupplyassets.com/cataloging/1782386142579/Create_a_premium_e-commerce_product_202605191044.jpeg",
      "https://upload.meeshosupplyassets.com/cataloging/1782386142721/Portable_blender_feature_showcase_202605191047.jpeg"
    ]
  },
  {
    id: "kuaxipulse-protein-powder-storage-cap",
    name: "KuaxiPulse Modular Dry Powder Storage Cap",
    price: 349,
    description: "A handy screw-on lid compartment that holds up to 60g of protein powder or oats dry. Release them into the bottle with a simple twist whenever you are ready to blend.",
    features: [
      "Airtight compartment holds up to 60g of dry powder",
      "Easy-to-use dial drops powder with a simple twist",
      "Leakproof silicone seals keep powder dry",
      "Comfortable, slip-resistant loop carrying handle",
      "Odour-resistant material that cleans in seconds"
    ],
    images: [
      "https://upload.meeshosupplyassets.com/cataloging/1782386142721/Portable_blender_feature_showcase_202605191047.jpeg",
      "https://upload.meeshosupplyassets.com/cataloging/1782386142579/Create_a_premium_e-commerce_product_202605191044.jpeg",
      "https://upload.meeshosupplyassets.com/cataloging/1782386142822/Portable_blender_in_lifestyle_scene_202605191048.jpeg",
      "https://upload.meeshosupplyassets.com/cataloging/1782386142871/Exploded_view_portable_blender_s_202605191058.jpeg"
    ]
  }
];

export const PRODUCT_METADATA: Record<string, AmazonProductDetails> = {
  "kuaxiblend-portable-usb-blender-380ml": {
    rating: 4.8,
    ratingCount: 342,
    originalPrice: 3999,
    stockLeft: 8,
    isBestSeller: true,
    couponText: "Save ₹150 with coupon",
    deliveryDays: 2
  },
  "kuaxiblend-pro-max-500ml": {
    rating: 4.9,
    ratingCount: 118,
    originalPrice: 4999,
    stockLeft: 4,
    isAmazonChoice: true,
    couponText: "Save ₹200 with coupon",
    deliveryDays: 2
  },
  "kuaxishield-neoprene-travel-sleeve": {
    rating: 4.6,
    ratingCount: 89,
    originalPrice: 999,
    stockLeft: 15,
    deliveryDays: 3
  },
  "kuaxidock-magnetic-fast-charging-pad": {
    rating: 4.7,
    ratingCount: 65,
    originalPrice: 1499,
    stockLeft: 12,
    couponText: "Save ₹50 with coupon",
    deliveryDays: 3
  },
  "kuaxipack-replacement-jar-blade-set": {
    rating: 4.5,
    ratingCount: 42,
    originalPrice: 1599,
    stockLeft: 6,
    deliveryDays: 4
  },
  "kuaxipulse-protein-powder-storage-cap": {
    rating: 4.4,
    ratingCount: 76,
    originalPrice: 699,
    stockLeft: 22,
    deliveryDays: 4
  }
};

// Blender color presets
const COLOR_PRESETS = [
  { name: "Parchment White", hex: "#F5F5F4", accentHex: "#E7E5E4", text: "text-stone-800", bg: "bg-stone-100", border: "border-stone-300" },
  { name: "Muted Sage", hex: "#D1FAE5", accentHex: "#A7F3D0", text: "text-emerald-800", bg: "bg-emerald-50", border: "border-emerald-200" },
  { name: "Blush Sand", hex: "#FEE2E2", accentHex: "#FECACA", text: "text-rose-800", bg: "bg-rose-50", border: "border-rose-200" }
];

function getCouponDiscount(couponText?: string): number {
  if (!couponText) return 0;
  const match = couponText.match(/₹(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
}

const FAQ_ITEMS = [
  {
    question: "How do I clean my KuaxiBlend?",
    answer: "Cleaning is extremely simple. Just fill the bottle halfway with warm water, add a small drop of dish soap, and blend for 5 to 10 seconds. Rinse with clean water and you are done! The bottle and lid are also completely dishwasher-safe."
  },
  {
    question: "How much does shipping cost and when will it arrive?",
    answer: "We offer free shipping on all orders across India. Most orders are processed within 24 hours. Delivery usually takes 2 to 5 business days, depending on your city or state. You will get an email with a tracking link as soon as your order is on the way."
  },
  {
    question: "Can it blend ice or frozen fruits?",
    answer: "Absolutely! The powerful motor paired with our custom six-leaf stainless steel blade system easily crushes ice, frozen berries, and leafy greens to give you a perfectly smooth blend every time."
  },
  {
    question: "How long does a full charge last and how do I charge it?",
    answer: "A full charge takes about 2.5 hours using any standard USB-C cable. On a full charge, the blender can run for up to 15 blending cycles. The light indicator on the front will let you know when the battery is running low."
  },
  {
    question: "Is it safe to use?",
    answer: "Yes, it is designed with safety first. The blender has a built-in safety sensor. The blades will not spin unless the bottle is fully aligned and tightly locked onto the motor base. This prevents accidental cuts or messy leaks."
  }
];

export default function App() {
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [currentView, setCurrentView] = useState<"store" | "orders">("store");
  const [heroActiveImage, setHeroActiveImage] = useState(PREMIUM_BLENDER.images[0]);
  const [selectedColor, setSelectedColor] = useState(COLOR_PRESETS[0]);
  const [blendSpeed, setBlendSpeed] = useState<"off" | "low" | "high" | "turbo">("off");
  const [isAddedNotify, setIsAddedNotify] = useState(false);
  const [selectedTab, setSelectedTab] = useState<"features" | "specs" | "shipping">("features");
  const [selectedProductForModal, setSelectedProductForModal] = useState<Product | null>(null);
  const [modalActiveImg, setModalActiveImg] = useState<string | null>(null);
  const [couponApplied, setCouponApplied] = useState<{ [productId: string]: boolean }>({});
  const [modalQty, setModalQty] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [pendingCheckout, setPendingCheckout] = useState(false);

  const { user, logout } = useAuthStore();

  useEffect(() => {
    if (selectedProductForModal) {
      setModalActiveImg(selectedProductForModal.images[0]);
    } else {
      setModalActiveImg(null);
    }
  }, [selectedProductForModal]);

  const { addItem, getTotalItems } = useCartStore();

  // GSAP Animations
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero elements entry
      gsap.from(".hero-title", {
        opacity: 0,
        y: 40,
        duration: 1.2,
        ease: "power4.out",
        delay: 0.1
      });
      gsap.from(".hero-subtitle", {
        opacity: 0,
        y: 30,
        duration: 1.2,
        ease: "power4.out",
        delay: 0.3
      });
      gsap.from(".hero-cta-group", {
        opacity: 0,
        y: 20,
        duration: 1.2,
        ease: "power4.out",
        delay: 0.5
      });
      gsap.from(".hero-trust-badges", {
        opacity: 0,
        y: 15,
        duration: 1.2,
        ease: "power4.out",
        delay: 0.7
      });
      gsap.from(".hero-visual-panel", {
        opacity: 0,
        scale: 0.96,
        duration: 1.4,
        ease: "power3.out",
        delay: 0.2
      });
    });

    // Scroll trigger observer using standard IntersectionObserver
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            gsap.fromTo(
              entry.target,
              { opacity: 0, y: 35 },
              { opacity: 1, y: 0, duration: 0.9, ease: "power3.out" }
            );
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    const animatedElements = document.querySelectorAll(".scroll-trigger");
    animatedElements.forEach((el) => observer.observe(el));

    return () => {
      ctx.revert();
      observer.disconnect();
    };
  }, []);

  const handleAddToCart = (openCart = false) => {
    addItem(PREMIUM_BLENDER, 1);
    setIsAddedNotify(true);
    setTimeout(() => setIsAddedNotify(false), 2000);
    
    if (openCart) {
      setCartOpen(true);
    }
  };

  // Dynamic blending speed settings
  const getVortexIntensity = () => {
    switch (blendSpeed) {
      case "low": return "animate-spin [animation-duration:1.5s]";
      case "high": return "animate-spin [animation-duration:0.6s]";
      case "turbo": return "animate-spin [animation-duration:0.2s] scale-105";
      default: return "";
    }
  };

  const getLiquidColor = () => {
    switch (selectedColor.name) {
      case "Muted Sage": return "bg-emerald-300/60";
      case "Blush Sand": return "bg-rose-300/60";
      default: return "bg-amber-100/60"; // Parchment White default banana smoothie
    }
  };

  return (
    <div id="applet-viewport" className="min-h-screen bg-stone-50 font-sans text-stone-800 antialiased relative selection:bg-stone-200 pb-24 md:pb-0">
      
      {/* Toast Notification for Adding to Cart */}
      {isAddedNotify && (
        <div id="cart-add-toast" className="fixed top-24 right-6 z-50 bg-stone-900 text-stone-100 px-5 py-3.5 rounded-xl shadow-lg flex items-center gap-3 text-sm font-medium animate-bounce border border-stone-800">
          <Sparkles className="h-4 w-4 text-amber-400" />
          <span>Added to cart successfully!</span>
        </div>
      )}

      {/* Navigation Header */}
      <header id="applet-navbar" className="sticky top-0 z-40 bg-stone-50/80 backdrop-blur-md border-b border-stone-200/60">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          
          {/* Logo */}
          <div 
            onClick={() => setCurrentView("store")}
            className="flex items-center gap-2 cursor-pointer"
          >
            <span className="h-8 w-8 rounded-lg bg-stone-900 flex items-center justify-center text-stone-100 font-display font-bold text-lg shadow-sm">K</span>
            <span className="font-display font-semibold text-lg tracking-tight text-stone-900">KuaxiBlend</span>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-stone-600">
            <button 
              onClick={() => setCurrentView("store")} 
              className={`hover:text-stone-900 transition-colors cursor-pointer ${currentView === "store" ? "text-stone-950 font-semibold" : ""}`}
            >
              Shop
            </button>
            <a href="#features-grid" onClick={() => setCurrentView("store")} className="hover:text-stone-900 transition-colors">Features</a>
            <a href="#technical-specs" onClick={() => setCurrentView("store")} className="hover:text-stone-900 transition-colors">Specifications</a>
            <a href="#customer-testimonials" onClick={() => setCurrentView("store")} className="hover:text-stone-900 transition-colors">Reviews</a>
          </nav>

          {/* Cart & Orders Triggers */}
          <div className="flex items-center gap-2.5">
            <button
              id="header-orders-btn"
              onClick={() => setCurrentView(currentView === "orders" ? "store" : "orders")}
              className={`relative py-2 px-3 sm:py-2.5 sm:px-4 rounded-full border transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 text-xs font-display font-medium ${
                currentView === "orders"
                  ? "bg-stone-950 text-stone-50 border-stone-950 shadow-sm"
                  : "border-stone-200 bg-stone-100/50 hover:bg-stone-200/50 text-stone-800"
              }`}
            >
              <Package className="h-4 w-4" />
              <span className="hidden sm:inline">My Orders</span>
            </button>

            <button
              id="header-cart-btn"
              onClick={() => setCartOpen(true)}
              className="relative p-2.5 rounded-full border border-stone-200 bg-stone-100/50 hover:bg-stone-200/50 transition-all cursor-pointer flex items-center gap-2 group active:scale-95"
            >
              <ShoppingBag className="h-4.5 w-4.5 text-stone-800 group-hover:scale-105 transition-transform" />
              <span className="hidden sm:inline text-xs font-display font-medium text-stone-800 pr-0.5">Cart</span>
              <span className="absolute -top-1.5 -right-1.5 h-5 w-5 bg-stone-900 text-stone-100 text-[10px] font-mono font-bold flex items-center justify-center rounded-full shadow-xs border border-stone-50">
                {getTotalItems()}
              </span>
            </button>

            {user ? (
              <div className="flex items-center gap-1 sm:gap-2 border border-stone-200 sm:border-stone-200 bg-stone-100/30 pl-1 pr-1.5 py-1 sm:pl-1.5 sm:pr-3 sm:py-1.5 rounded-full text-stone-800 text-xs font-medium">
                {user.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName || "User"} className="h-6 w-6 rounded-full object-cover border border-stone-300" referrerPolicy="no-referrer" />
                ) : (
                  <div className="h-6 w-6 rounded-full bg-stone-900 text-stone-100 font-bold flex items-center justify-center text-[10px]">
                    {user.displayName ? user.displayName[0].toUpperCase() : "U"}
                  </div>
                )}
                <span className="hidden md:inline max-w-[100px] truncate">{user.displayName || user.email}</span>
                <button
                  onClick={() => logout()}
                  title="Sign Out"
                  className="p-1 hover:text-red-600 hover:bg-stone-200/50 rounded-full transition-all cursor-pointer"
                >
                  <LogOut className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setAuthModalOpen(true)}
                className="py-2 px-3 sm:py-2.5 sm:px-4 rounded-full border border-stone-200 bg-stone-100/50 hover:bg-stone-200/50 transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 text-xs font-display font-medium text-stone-800"
              >
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Sign In</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {currentView === "orders" ? (
        <OrdersView 
          onBackToShop={() => setCurrentView("store")} 
          onProductClick={(prod) => setSelectedProductForModal(prod)}
        />
      ) : (
        <>
          {/* Hero Section */}
          <section id="hero-showcase" className="relative pt-8 pb-16 md:py-24 border-b border-stone-200/60 bg-stone-50 overflow-hidden">
        
        {/* Decorative Grid Lines for Papery texture */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e5e5e0_1px,transparent_1px),linear-gradient(to_bottom,#e5e5e0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30 pointer-events-none" />

        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center relative z-10">
          
          {/* Editorial Headline & Call to Actions */}
          <div className="lg:col-span-7 flex flex-col space-y-8">
            
            <div className="space-y-4">
              <h1 className="hero-title font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-stone-950 leading-[1.08] max-w-2xl">
                Fresh, silky smoothies. <br />
                <span className="text-stone-500 font-light italic">Wherever</span> you go.
              </h1>
              <p className="hero-subtitle text-base sm:text-lg text-stone-600 leading-relaxed max-w-xl font-sans">
                Say goodbye to clumpy protein powders and bulky kitchen appliances. 
                The <strong className="font-semibold text-stone-900">KuaxiBlend</strong> is a high-powered, rechargeable portable blender made with six sharp stainless steel blades, letting you blend fresh ingredients on the beach, at the office, or in the gym.
              </p>
            </div>

            {/* Core Product Actions */}
            <div className="hero-cta-group space-y-6 bg-white p-6 sm:p-8 rounded-2xl border border-stone-200 shadow-sm max-w-xl">
              
              {/* Pricing and CTAs */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-2xl sm:text-3xl font-extrabold text-stone-950">₹2,499</span>
                    <span className="text-sm line-through text-stone-400 font-mono">₹3,999</span>
                    <span className="text-xs bg-emerald-100 text-emerald-800 font-mono font-medium px-2 py-0.5 rounded">37% OFF</span>
                  </div>
                  <p className="text-xs text-stone-500 font-sans">Includes 2-Year warranty • Free India Shipping</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-2.5 shrink-0">
                  <button
                    id="hero-buy-now"
                    onClick={() => handleAddToCart(true)}
                    className="px-6 py-3 rounded-xl bg-stone-900 text-stone-100 font-display font-medium text-sm hover:bg-stone-800 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    Buy Now <ArrowRight className="h-4 w-4" />
                  </button>
                  <button
                    id="hero-add-to-cart"
                    onClick={() => handleAddToCart(false)}
                    className="px-6 py-3 rounded-xl border border-stone-200 bg-stone-100 hover:bg-stone-200/50 active:scale-95 transition-all cursor-pointer font-display font-medium text-sm text-stone-800"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>

            </div>

            {/* Micro badges */}
            <div className="hero-trust-badges flex flex-wrap gap-x-8 gap-y-4 pt-2 text-stone-500 text-xs font-mono">
              <span className="flex items-center gap-1.5">
                <Truck className="h-4 w-4 text-stone-400" /> Free Shipping Across India
              </span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-stone-400" /> 2-Year Safety Warranty
              </span>
              <span className="flex items-center gap-1.5">
                <Zap className="h-4 w-4 text-stone-400" /> High-Speed 22k RPM Motor
              </span>
            </div>
          </div>

          {/* Interactive Hero Image Gallery (Right Column) */}
          <div className="lg:col-span-5 hero-visual-panel flex flex-col items-center">
            
            <div className="relative w-full max-w-[420px] bg-white rounded-3xl border border-stone-200 p-4 sm:p-5 shadow-sm flex flex-col items-center">

              {/* Main Image View with Hover Zoom */}
              <div className="w-full aspect-square bg-stone-50 rounded-2xl border border-stone-100 overflow-hidden relative group">
                <img
                  src={heroActiveImage}
                  alt="KuaxiBlend Premium Cordless Blender"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* Thumbnail Gallery Row */}
              <div className="w-full mt-4 grid grid-cols-5 gap-2">
                {PREMIUM_BLENDER.images.map((imgUrl, idx) => (
                  <button
                    key={idx}
                    onClick={() => setHeroActiveImage(imgUrl)}
                    className={`aspect-square rounded-xl overflow-hidden border-2 transition-all cursor-pointer relative ${
                      heroActiveImage === imgUrl 
                        ? "border-stone-950 scale-102 ring-2 ring-stone-200/50" 
                        : "border-stone-200 hover:border-stone-400"
                    }`}
                  >
                    <img src={imgUrl} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </button>
                ))}
              </div>

              {/* Specifications snippet at bottom */}
              <div className="w-full mt-4 pt-4 border-t border-stone-100 text-center text-[10px] font-mono text-stone-400">
                Click thumbnails to switch views: lifestyle, action & exploded details
              </div>

            </div>

          </div>
        </div>

      </section>

      {/* Amazon-Style Product Catalog Grid */}
      <section id="product-listings" className="py-20 bg-stone-100/50 border-b border-stone-200/60 relative">
        <div className="max-w-6xl mx-auto px-6 space-y-12">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-3">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-stone-500 bg-stone-200/50 px-2.5 py-1 rounded">Amazon Best Sellers</span>
              <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight">Browse Our Cordless Catalog</h2>
              <p className="text-stone-600 text-sm max-w-xl font-sans">
                Explore our full ecosystem of high-speed portable blenders, insulated impact-absorbent travel wear, fast magnetic chargers, and modular cap containers.
              </p>
            </div>
            <div className="flex gap-4 items-center shrink-0 text-xs font-mono text-stone-500 bg-white p-3 rounded-lg border border-stone-200/60 shadow-2xs">
              <span className="flex items-center gap-1.5"><Star className="h-4 w-4 fill-amber-400 text-amber-400" /> Top Rated Ecosystem</span>
              <span className="text-stone-300">|</span>
              <span className="flex items-center gap-1.5"><Truck className="h-4 w-4 text-stone-500" /> FREE Delivery India</span>
            </div>
          </div>

          {(() => {
            const filteredProducts = PRODUCTS_CATALOG.filter((product) => {
              // Search Query Filter
              if (searchQuery.trim() !== "") {
                const q = searchQuery.toLowerCase();
                const matchName = product.name.toLowerCase().includes(q);
                const matchDesc = product.description.toLowerCase().includes(q);
                const matchFeatures = product.features.some(f => f.toLowerCase().includes(q));
                if (!matchName && !matchDesc && !matchFeatures) {
                  return false;
                }
              }

              return true;
            });

            if (filteredProducts.length === 0) {
              return (
                <div className="text-center py-16 bg-white rounded-2xl border border-stone-200 p-8 space-y-4">
                  <p className="text-stone-500 text-sm font-medium">No products match your search.</p>
                  <button
                    onClick={() => {
                      setSearchQuery("");
                    }}
                    className="px-4 py-2 text-xs bg-stone-900 text-white rounded-lg hover:bg-stone-800 cursor-pointer font-semibold transition-all"
                  >
                    Reset Search
                  </button>
                </div>
              );
            }

            return (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredProducts.map((product) => {
                  const meta = PRODUCT_METADATA[product.id] || { rating: 4.5, ratingCount: 10, originalPrice: product.price * 1.5, stockLeft: 5, deliveryDays: 3 };
                  const isApplied = couponApplied[product.id];
                  const discountedPrice = isApplied && meta.couponText ? product.price - getCouponDiscount(meta.couponText) : product.price;

                  return (
                    <div
                      key={product.id}
                      onClick={() => {
                        setSelectedProductForModal(product);
                        setModalQty(1);
                      }}
                      className="scroll-trigger bg-white rounded-2xl border border-stone-200 shadow-xs flex flex-col justify-between overflow-hidden hover:shadow-md hover:border-stone-300/80 transition-all duration-300 group cursor-pointer"
                    >
                      {/* Image and Badges */}
                      <div className="relative aspect-video bg-stone-100 flex items-center justify-center border-b border-stone-100 overflow-hidden">
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                          referrerPolicy="no-referrer"
                        />

                        {/* Amazon style Best Seller / Amazon choice badges */}
                        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                          {meta.isBestSeller && (
                            <span className="bg-amber-500 text-stone-950 text-[10px] font-display font-semibold px-2.5 py-0.5 rounded-r-md shadow-sm border-l-4 border-amber-800">
                              Best Seller
                            </span>
                          )}
                          {meta.isAmazonChoice && (
                            <span className="bg-stone-900 text-stone-100 text-[10px] font-display font-semibold px-2.5 py-0.5 rounded-r-md shadow-sm border-l-4 border-amber-400">
                              Amazon's Choice
                            </span>
                          )}
                        </div>

                        {/* Stock Alert overlay */}
                        {meta.stockLeft <= 5 && (
                          <div className="absolute bottom-3 left-3 bg-red-50/90 text-red-700 text-[10px] font-mono px-2 py-0.5 rounded border border-red-200/50 font-bold backdrop-blur-xs">
                            Only {meta.stockLeft} left in stock - order soon
                          </div>
                        )}
                      </div>

                      {/* Body Content */}
                      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                        <div className="space-y-2">
                          {/* Title */}
                          <h3
                            className="font-display font-bold text-stone-950 text-base md:text-lg hover:text-stone-600 transition-colors cursor-pointer leading-snug line-clamp-2"
                          >
                            {product.name}
                          </h3>

                          {/* Amazon Style Stars */}
                          <div className="flex items-center gap-1.5">
                            <div className="flex text-amber-400">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-3.5 w-3.5 ${
                                    i < Math.floor(meta.rating) ? "fill-amber-400" : "text-stone-300"
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-xs font-mono font-medium text-stone-500">{meta.rating}</span>
                            <span className="text-stone-300">|</span>
                            <span className="text-xs font-sans text-stone-500 hover:text-stone-700 cursor-pointer">{meta.ratingCount} ratings</span>
                          </div>

                          {/* Pricing block */}
                          <div className="pt-1 flex items-baseline gap-2">
                            <span className="text-xl font-mono font-black text-stone-950">₹{discountedPrice.toLocaleString("en-IN")}</span>
                            <span className="text-xs line-through text-stone-400 font-mono">M.R.P.: ₹{meta.originalPrice.toLocaleString("en-IN")}</span>
                            <span className="text-[11px] text-emerald-600 font-sans font-medium">({Math.round(((meta.originalPrice - product.price) / meta.originalPrice) * 100)}% off)</span>
                          </div>

                          {/* Coupon Toggle */}
                          {meta.couponText && (
                            <div
                              onClick={(e) => {
                                e.stopPropagation();
                                setCouponApplied(prev => ({
                                  ...prev,
                                  [product.id]: !prev[product.id]
                                }));
                              }}
                              className="flex items-center gap-2 p-2 rounded-lg bg-emerald-50/60 hover:bg-emerald-50 border border-emerald-100/80 cursor-pointer select-none transition-colors"
                            >
                              <input
                                type="checkbox"
                                checked={!!isApplied}
                                readOnly
                                className="h-3.5 w-3.5 rounded text-emerald-600 focus:ring-emerald-500 border-stone-300"
                              />
                              <span className="text-[11px] font-medium text-emerald-800">
                                {meta.couponText}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Action Panel */}
                    <div className="pt-3 border-t border-stone-100 space-y-2.5">
                      <div className="grid grid-cols-2 gap-2" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            addItem({ ...product, price: discountedPrice }, 1);
                            setIsAddedNotify(true);
                            setTimeout(() => setIsAddedNotify(false), 2000);
                          }}
                          className="py-2 px-3 rounded-lg border border-stone-200 bg-stone-50 hover:bg-stone-100 active:scale-98 text-xs font-display font-semibold text-stone-700 transition-all cursor-pointer flex items-center justify-center gap-1"
                        >
                          Add to Cart
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            addItem({ ...product, price: discountedPrice }, 1);
                            setCartOpen(true);
                          }}
                          className="py-2 px-3 rounded-lg bg-stone-900 hover:bg-stone-800 active:scale-98 text-xs font-display font-semibold text-stone-100 transition-all cursor-pointer flex items-center justify-center gap-1"
                        >
                          Buy Now
                        </button>
                      </div>

                      <div className="w-full text-center text-[10px] font-mono text-stone-400 group-hover:text-stone-700 underline pt-0.5">
                        Open full specifications & reviews
                      </div>
                    </div>

                  </div>
                </div>
              );
                })}
              </div>
            );
          })()}

        </div>
      </section>

      {/* Brand Values / Value Proposition Section */}
      <section id="features-highlights" className="py-16 bg-white border-b border-stone-200/60">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="scroll-trigger flex flex-col space-y-3 p-6 rounded-2xl border border-stone-100 bg-stone-50/40">
            <div className="h-10 w-10 rounded-xl bg-stone-100 flex items-center justify-center text-stone-900 shrink-0">
              <Zap className="h-5 w-5" />
            </div>
            <h3 className="font-display font-semibold text-lg text-stone-900">22,000 RPM Motor Power</h3>
            <p className="text-stone-600 text-sm leading-relaxed font-sans">
              Don't let the compact dimensions fool you. The powerful motor blends frozen bananas and tough leafy greens into completely chunk-free smoothies in under 20 seconds.
            </p>
          </div>

          <div className="scroll-trigger flex flex-col space-y-3 p-6 rounded-2xl border border-stone-100 bg-stone-50/40">
            <div className="h-10 w-10 rounded-xl bg-stone-100 flex items-center justify-center text-stone-900 shrink-0">
              <Battery className="h-5 w-5" />
            </div>
            <h3 className="font-display font-semibold text-lg text-stone-900">15+ Blends Per Charge</h3>
            <p className="text-stone-600 text-sm leading-relaxed font-sans">
              Dual 2000mAh built-in lithium batteries offer heavy-duty wireless juice. Fast recharge with any USB outlet, matching portable power grids, laptops, or car chargers.
            </p>
          </div>

          <div className="scroll-trigger flex flex-col space-y-3 p-6 rounded-2xl border border-stone-100 bg-stone-50/40">
            <div className="h-10 w-10 rounded-xl bg-stone-100 flex items-center justify-center text-stone-900 shrink-0">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h3 className="font-display font-semibold text-lg text-stone-900">Magnetic Safety Alignment</h3>
            <p className="text-stone-600 text-sm leading-relaxed font-sans">
              Smart sensors prevent accidental spinning. Blades are inactive unless the bottle and base are perfectly aligned, ensuring maximum safety during usage and cleaning.
            </p>
          </div>

        </div>
      </section>

      {/* Main Features Grid / Bento Layout */}
      <section id="features-grid" className="py-20 md:py-28 bg-stone-50/50 border-b border-stone-200/60">
        <div className="max-w-6xl mx-auto px-6 space-y-16">
          
          {/* Section title */}
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-stone-900">
              Engineered to fit your life, flawlessly.
            </h2>
            <p className="text-stone-600 text-sm sm:text-base font-sans">
              No compromises. We stripped away the bulky cord and heavy engine block to create a personal appliance that is lightweight, fully waterproof, and exceptionally sturdy.
            </p>
          </div>

          {/* Bento grid layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
            
            {/* Box 1: Capacity */}
            <div className="scroll-trigger lg:col-span-8 bg-white border border-stone-200 p-8 rounded-3xl shadow-xs flex flex-col lg:flex-row gap-8 items-center justify-between overflow-hidden relative">
              <div className="space-y-4 max-w-sm relative z-10">
                <span className="text-xs font-mono font-bold tracking-widest text-stone-400 uppercase">Size Matters</span>
                <h3 className="font-display font-bold text-xl sm:text-2xl text-stone-950">380ml Personal Capacity</h3>
                <p className="text-stone-600 text-sm leading-relaxed">
                  The absolute sweet spot for meal replacements and workouts. Large enough to fit fresh berries and whole protein scoops, but compact enough to fit nicely inside bicycle bottle cages and daily backpacks.
                </p>
                <ul className="space-y-2 text-xs font-sans text-stone-600 pt-2">
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-stone-500" /> Fits perfectly in vehicle cup holders</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-stone-500" /> Highly resistant to thermo-shock cracks</li>
                </ul>
              </div>

              {/* Visual Representing Capacity */}
              <div className="relative shrink-0 w-full max-w-[200px] aspect-square rounded-2xl bg-stone-100 flex flex-col items-center justify-center p-6 border border-stone-200">
                <span className="text-stone-400 font-mono text-xs uppercase tracking-wider mb-2">Ideal Serving</span>
                <span className="font-display text-4xl sm:text-5xl font-extrabold text-stone-900 tracking-tight">380</span>
                <span className="font-mono text-stone-600 text-sm mt-1 uppercase font-semibold">Millilitres</span>
              </div>
            </div>
              {/* Box 2: Blades */}
            <div className="scroll-trigger lg:col-span-4 bg-white border border-stone-200 p-8 rounded-3xl shadow-xs flex flex-col justify-between">
              <div className="space-y-4">
                <span className="text-xs font-mono font-bold tracking-widest text-stone-400 uppercase">Cutting Edge</span>
                <h3 className="font-display font-bold text-xl text-stone-950">6-Leaf Stainless Steel Blades</h3>
                <p className="text-stone-600 text-sm leading-relaxed">
                  Our custom blade system uses high-quality stainless steel with angled tips that create a strong blending flow, drawing fruits down and blending them into a smooth drink.
                </p>
              </div>
              <div className="pt-6 border-t border-stone-100 mt-6 flex items-center justify-between text-xs font-mono text-stone-500">
                <span>Durable & Strong</span>
                <span>Speed: 22,000 RPM</span>
              </div>
            </div>

            {/* Box 3: USB Charging */}
            <div className="scroll-trigger lg:col-span-4 bg-white border border-stone-200 p-8 rounded-3xl shadow-xs flex flex-col justify-between">
              <div className="space-y-4">
                <span className="text-xs font-mono font-bold tracking-widest text-stone-400 uppercase">Power Delivery</span>
                <h3 className="font-display font-bold text-xl text-stone-950">USB-C Fast Charging</h3>
                <p className="text-stone-600 text-sm leading-relaxed">
                  No special chargers needed. Equipped with a universal USB Type-C port, the KuaxiBlend plugs directly into wall chargers, power banks, or car outlets. Full charge takes just 2.5 hours.
                </p>
              </div>
              <div className="pt-6 border-t border-stone-100 mt-6 flex items-center gap-4">
                <div className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md text-xs font-mono font-semibold">
                  <Battery className="h-4 w-4" /> 4000mAh Total
                </div>
                <span className="text-xs font-mono text-stone-400">15+ blends per charge</span>
              </div>
            </div>

            {/* Box 4: Safety / Food Grade */}
            <div className="scroll-trigger lg:col-span-8 bg-white border border-stone-200 p-8 rounded-3xl shadow-xs flex flex-col lg:flex-row gap-8 items-center justify-between overflow-hidden">
              
              {/* Visual Representing Material */}
              <div className="relative shrink-0 w-full max-w-[200px] aspect-square rounded-2xl bg-stone-100 flex flex-col items-center justify-center p-6 border border-stone-200">
                <span className="text-stone-400 font-mono text-xs uppercase tracking-wider mb-2">Non-Toxic</span>
                <span className="font-display text-4xl sm:text-5xl font-extrabold text-stone-900 tracking-tight">0%</span>
                <span className="font-mono text-stone-600 text-sm mt-1 uppercase font-semibold">BPA / Toxins</span>
              </div>

              <div className="space-y-4 max-w-sm relative z-10">
                <span className="text-xs font-mono font-bold tracking-widest text-stone-400 uppercase">Material Science</span>
                <h3 className="font-display font-bold text-xl sm:text-2xl text-stone-950">100% Safe Food-Grade Plastic</h3>
                <p className="text-stone-600 text-sm leading-relaxed">
                  Made using safe, food-grade plastic—the same high-quality material used for baby bottles. It is extremely durable, drop-resistant, and will not leave any chemical smell or taste.
                </p>
                <ul className="space-y-2 text-xs font-sans text-stone-600 pt-2">
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-stone-500" /> BPA and chemical-free plastic</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-stone-500" /> Highly resistant to stains and food acids</li>
                </ul>
              </div>
            </div>
          </div>

        </div>
      </section>



      {/* Technical Specification & Accordion Tab Layout */}
      <section id="technical-specs" className="py-20 md:py-24 bg-stone-50 border-b border-stone-200/60">
        <div className="max-w-4xl mx-auto px-6 space-y-12">
          
          <div className="text-center space-y-4">
            <h2 className="font-display text-3xl font-extrabold text-stone-900">Technical Specifications</h2>
            <p className="text-stone-500 text-sm">Every minute detail documented for the discerning chef.</p>
          </div>

          {/* Tab Selector */}
          <div className="flex border-b border-stone-200">
            {(["features", "specs", "shipping"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setSelectedTab(tab)}
                className={`flex-1 pb-4 text-xs sm:text-sm font-mono uppercase tracking-wider border-b-2 transition-all cursor-pointer font-semibold ${
                  selectedTab === tab
                    ? "border-stone-900 text-stone-950 font-bold"
                    : "border-transparent text-stone-400 hover:text-stone-700"
                }`}
              >
                {tab === "features" && (
                  <>
                    <span className="sm:hidden">Features</span>
                    <span className="hidden sm:inline">Specs Checklist</span>
                  </>
                )}
                {tab === "specs" && (
                  <>
                    <span className="sm:hidden">Specs</span>
                    <span className="hidden sm:inline">Hardware Specs</span>
                  </>
                )}
                {tab === "shipping" && (
                  <>
                    <span className="sm:hidden">Shipping</span>
                    <span className="hidden sm:inline">Shipping & Packaging</span>
                  </>
                )}
              </button>
            ))}
          </div>

          {/* Tab Content panels */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 shadow-2xs min-h-[220px]">
            {selectedTab === "features" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {PREMIUM_BLENDER.features.map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 rounded-lg bg-stone-50 border border-stone-100">
                    <div className="h-6 w-6 rounded-full bg-stone-200/60 flex items-center justify-center text-stone-800 shrink-0">
                      <Check className="h-3 w-3" strokeWidth={3} />
                    </div>
                    <span className="text-xs sm:text-sm font-display font-medium text-stone-800">{feature}</span>
                  </div>
                ))}
              </div>
            )}

            {selectedTab === "specs" && (
              <div className="divide-y divide-stone-100 text-sm">
                <div className="py-3 flex justify-between">
                  <span className="font-mono text-stone-500 text-xs">Model Name</span>
                  <span className="font-medium text-stone-900 font-display">KuaxiBlend V1 Cordless</span>
                </div>
                <div className="py-3 flex justify-between">
                  <span className="font-mono text-stone-500 text-xs">Capacity</span>
                  <span className="font-medium text-stone-900 font-display">380 ml (12.8 oz)</span>
                </div>
                <div className="py-3 flex justify-between">
                  <span className="font-mono text-stone-500 text-xs">Blade Material</span>
                  <span className="font-medium text-stone-900 font-display">6-leaf Durable Stainless Steel</span>
                </div>
                <div className="py-3 flex justify-between">
                  <span className="font-mono text-stone-500 text-xs">Battery Configuration</span>
                  <span className="font-medium text-stone-900 font-display">Dual Lithium Ion (4000mAh total)</span>
                </div>
                <div className="py-3 flex justify-between">
                  <span className="font-mono text-stone-500 text-xs">Charging Connector</span>
                  <span className="font-medium text-stone-900 font-display">USB Type-C (5V/1A - 2A input)</span>
                </div>
                <div className="py-3 flex justify-between">
                  <span className="font-mono text-stone-500 text-xs">Jar Material</span>
                  <span className="font-medium text-stone-900 font-display">BPA-Free Food-Grade Safe Plastic</span>
                </div>
                <div className="py-3 flex justify-between">
                  <span className="font-mono text-stone-500 text-xs">Weight</span>
                  <span className="font-medium text-stone-900 font-display">460 grams</span>
                </div>
              </div>
            )}

            {selectedTab === "shipping" && (
              <div className="space-y-4 text-stone-600 text-xs sm:text-sm leading-relaxed">
                <h4 className="font-display font-semibold text-stone-900 text-base">In the Box:</h4>
                <p className="font-mono text-stone-500 text-xs">
                  • 1x KuaxiBlend Motor Base Unit<br />
                  • 1x 380ml Food-Grade Safe Plastic Bottle<br />
                  • 1x Silicone Strap Lid Accessory<br />
                  • 1x USB-C High-Speed Cable<br />
                  • 1x Detailed User Manual & Safety Cards
                </p>
                <div className="border-t border-stone-200/80 pt-4 flex items-center gap-3 text-stone-500 text-xs">
                  <Truck className="h-5 w-5 text-stone-400" />
                  <span>Ships within 24 hours. Free delivery throughout India with live tracking link shared on email.</span>
                </div>
              </div>
            )}
          </div>

        </div>
      </section>

      {/* Customer Reviews Section */}
      <section id="customer-testimonials" className="py-20 md:py-24 bg-white border-b border-stone-200/60">
        <div className="max-w-5xl mx-auto px-6 space-y-12">
          
          <div className="text-center space-y-4">
            <h2 className="font-display text-3xl font-extrabold text-stone-900">What Healthy Roamers Say</h2>
            <div className="flex items-center justify-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-4.5 w-4.5 fill-amber-400 text-amber-400" />
              ))}
              <span className="text-xs font-mono font-medium text-stone-500 ml-1.5">4.8 / 5.0 (over 340+ orders)</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            <div className="p-6 rounded-2xl border border-stone-200 bg-stone-50/40 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-display font-semibold text-stone-900 text-sm">Aditya R.</h4>
                  <p className="text-[10px] text-stone-400 font-mono">Verified Buyer • Mumbai</p>
                </div>
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />
                  ))}
                </div>
              </div>
              <p className="text-stone-600 text-xs sm:text-sm leading-relaxed">
                "Honestly surprised at the motor's crushing capability. It easily powderizes frozen blueberries. I use it at my desk in the office to whip up an afternoon protein smoothie without any noisy distraction. Charges with my laptop charger!"
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-stone-200 bg-stone-50/40 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-display font-semibold text-stone-900 text-sm">Priya M.</h4>
                  <p className="text-[10px] text-stone-400 font-mono">Verified Buyer • Bangalore</p>
                </div>
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />
                  ))}
                </div>
              </div>
              <p className="text-stone-600 text-xs sm:text-sm leading-relaxed">
                "The safety alignment light is really great. The motor refuses to start if I haven't fully tightened the cup, which is amazing for keeping things mess-free. The Sage color matches my athletic bag perfectly."
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section id="faq-section" className="py-20 bg-stone-50 border-b border-stone-200/60">
        <div className="max-w-3xl mx-auto px-6 space-y-10">
          <div className="text-center space-y-3">
            <h2 className="font-display text-3xl font-extrabold text-stone-900">Frequently Asked Questions</h2>
            <p className="text-stone-500 text-sm max-w-lg mx-auto font-sans">
              Have questions about your new blender? Find quick answers below to help you blend with confidence.
            </p>
          </div>

          <div className="space-y-4">
            {FAQ_ITEMS.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div 
                  key={idx} 
                  className="bg-white rounded-2xl border border-stone-200 overflow-hidden transition-all duration-300"
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full py-5 px-6 flex items-center justify-between text-left cursor-pointer hover:bg-stone-50/50 transition-colors"
                  >
                    <span className="font-display font-semibold text-stone-900 text-sm sm:text-base pr-4">
                      {faq.question}
                    </span>
                    <ChevronDown 
                      className={`h-5 w-5 text-stone-500 shrink-0 transition-transform duration-300 ${
                        isOpen ? "rotate-180 text-stone-950" : ""
                      }`}
                    />
                  </button>

                  <div 
                    className={`transition-all duration-300 ease-in-out ${
                      isOpen ? "max-h-[500px] opacity-100 border-t border-stone-100" : "max-h-0 opacity-0 pointer-events-none"
                    } overflow-hidden`}
                  >
                    <div className="p-6 text-stone-600 text-xs sm:text-sm leading-relaxed font-sans bg-stone-50/20">
                      {faq.answer}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Trust & Policy Info */}
      <section className="py-12 bg-stone-100/40 text-stone-500 border-b border-stone-200/60">
        <div className="max-w-4xl mx-auto px-6 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center text-xs font-mono uppercase tracking-wider">
          <div className="space-y-2">
            <Lock className="h-5 w-5 text-stone-400 mx-auto" />
            <p className="text-stone-800 font-medium">Safe Checkout</p>
            <p className="text-[10px] text-stone-400 lowercase">SSL secured payment portal</p>
          </div>
          <div className="space-y-2">
            <Truck className="h-5 w-5 text-stone-400 mx-auto" />
            <p className="text-stone-800 font-medium">Free Delivery</p>
            <p className="text-[10px] text-stone-400 lowercase">Every pincode in India</p>
          </div>
          <div className="space-y-2">
            <ShieldCheck className="h-5 w-5 text-stone-400 mx-auto" />
            <p className="text-stone-800 font-medium">2-Year Cover</p>
            <p className="text-[10px] text-stone-400 lowercase">Full engine replacement</p>
          </div>
          <div className="space-y-2">
            <Check className="h-5 w-5 text-stone-400 mx-auto" />
            <p className="text-stone-800 font-medium">BPA-Free</p>
            <p className="text-[10px] text-stone-400 lowercase">100% safe food-grade plastic</p>
          </div>
        </div>
      </section>
        </>
      )}

      {/* Footer */}
      <footer className="py-12 bg-stone-50 text-stone-400 text-xs border-t border-stone-200">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <span className="font-display font-semibold text-stone-900">KuaxiBlend Co.</span>
            <span className="text-stone-300">|</span>
            <span>Est. 2026</span>
          </div>
          <div className="flex gap-6">
            <a href="#features-grid" className="hover:text-stone-600">Tech specs</a>
            <a href="#customer-testimonials" className="hover:text-stone-600">Reviews</a>
          </div>
          <p className="text-stone-400 font-mono text-[10px]">
            © {new Date().getFullYear()} KuaxiBlend Co. All rights reserved. Powered securely by Razorpay.
          </p>
        </div>
      </footer>

      {/* Cart Sidebar Panel */}
      <CartSidebar 
        isOpen={cartOpen} 
        onClose={() => setCartOpen(false)} 
        onCheckoutTrigger={() => {
          setCartOpen(false);
          if (!user) {
            setPendingCheckout(true);
            setAuthModalOpen(true);
          } else {
            setCheckoutOpen(true);
          }
        }}
      />

      {/* Checkout Flow Overlay */}
      <CheckoutFlow isOpen={checkoutOpen} onClose={() => setCheckoutOpen(false)} />

      {/* Authentication Modal */}
      <AuthModal 
        isOpen={authModalOpen} 
        onClose={() => {
          setAuthModalOpen(false);
          setPendingCheckout(false);
        }} 
        onSuccess={() => {
          if (pendingCheckout) {
            setCheckoutOpen(true);
            setPendingCheckout(false);
          }
        }}
      />

      {/* Sticky Bottom "Buy Now" CTA Bar for Mobile Screens */}
      {currentView === "store" && (
        <div id="mobile-sticky-footer" className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-200 p-4 shadow-xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Thumbnail preview */}
            <div className="h-10 w-10 bg-stone-100 rounded-lg overflow-hidden border border-stone-200 flex items-center justify-center shrink-0">
              <div className={`h-8 w-5 rounded-md ${getLiquidColor()} relative overflow-hidden flex items-end`}>
                <div className="w-full h-1/2 bg-stone-800/20 absolute bottom-0" />
              </div>
            </div>
            <div>
              <p className="font-display font-semibold text-stone-950 text-xs truncate max-w-[120px]">KuaxiBlend V1</p>
              <p className="font-mono text-stone-600 font-bold text-xs">₹2,499</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => handleAddToCart(false)}
              className="p-3.5 rounded-xl border border-stone-200 bg-stone-50 active:bg-stone-100 transition-colors shrink-0 flex items-center justify-center cursor-pointer"
              title="Add to Cart"
            >
              <ShoppingBag className="h-4.5 w-4.5 text-stone-700" />
            </button>
            <button
              onClick={() => handleAddToCart(true)}
              className="px-5 py-3.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-100 font-display font-medium text-xs active:scale-95 transition-all cursor-pointer flex items-center gap-1 shadow-sm shrink-0"
            >
              Buy Now <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Amazon Product Page Immersive Modal */}
      {selectedProductForModal && (
        <div className="fixed inset-0 z-50 bg-stone-950/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          
          <div className="bg-stone-50 border border-stone-200 w-full max-w-4xl rounded-3xl shadow-2xl flex flex-col max-h-[calc(100vh-2rem)] md:max-h-[85vh] overflow-hidden">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-stone-200/80 bg-stone-100/50 flex items-center justify-between shrink-0">
              <span className="text-xs font-mono text-stone-500 font-semibold tracking-wide flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> KuaxiBlend Store • Official Amazon Listing Detail
              </span>
              <button
                onClick={() => setSelectedProductForModal(null)}
                className="p-1 text-stone-500 hover:text-stone-900 rounded-lg hover:bg-stone-200/50 transition-colors cursor-pointer text-sm font-mono"
              >
                ✕ Close
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Left Column: Image Block */}
              <div className="lg:col-span-5 space-y-4">
                <div className="aspect-square bg-white border border-stone-200/80 rounded-2xl overflow-hidden flex items-center justify-center p-4 shadow-2xs">
                  <img
                    src={modalActiveImg || selectedProductForModal.images[0]}
                    alt={selectedProductForModal.name}
                    className="w-full h-full object-contain rounded-xl"
                    referrerPolicy="no-referrer"
                  />
                </div>
                {selectedProductForModal.images.length > 1 && (
                  <div className="grid grid-cols-5 gap-2">
                    {selectedProductForModal.images.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setModalActiveImg(img)}
                        className={`aspect-square rounded-lg p-0.5 bg-white overflow-hidden border-2 transition-all cursor-pointer ${
                          (modalActiveImg || selectedProductForModal.images[0]) === img
                            ? "border-stone-950 scale-102"
                            : "border-stone-200 hover:border-stone-400 opacity-70 hover:opacity-100"
                        }`}
                      >
                        <img src={img} className="w-full h-full object-cover rounded-md" referrerPolicy="no-referrer" />
                      </button>
                    ))}
                  </div>
                )}
                
                <div className="p-4 bg-stone-100/50 rounded-xl border border-stone-200/60 text-[11px] text-stone-500 space-y-2 font-mono">
                  <p className="font-semibold text-stone-700 flex items-center gap-1">🚚 Secure Delivery Guard:</p>
                  <p>All items dispatch inside custom corrugated eco-boxes, completely insulated against courier shocks. Full replacement insurance included.</p>
                </div>
              </div>

              {/* Middle Column: Amazon Style Description & Features */}
              <div className="lg:col-span-4 space-y-5 text-left">
                <div className="space-y-2">
                  <h3 className="font-display font-extrabold text-stone-950 text-xl leading-snug">
                    {selectedProductForModal.name}
                  </h3>
                  
                  {/* Rating block */}
                  {(() => {
                    const meta = PRODUCT_METADATA[selectedProductForModal.id] || { rating: 4.8, ratingCount: 150 };
                    return (
                      <div className="flex items-center gap-1 flex-wrap">
                        <span className="text-xs text-stone-600 font-medium font-mono">{meta.rating}</span>
                        <div className="flex text-amber-400">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3.5 w-3.5 ${
                                i < Math.floor(meta.rating) ? "fill-amber-400" : "text-stone-300"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs font-sans text-stone-500 hover:underline cursor-pointer">{meta.ratingCount} reviews</span>
                      </div>
                    );
                  })()}

                  <div className="border-b border-stone-200 my-3" />
                </div>

                {/* Price block */}
                {(() => {
                  const meta = PRODUCT_METADATA[selectedProductForModal.id] || {
                    rating: 4.5,
                    ratingCount: 10,
                    originalPrice: selectedProductForModal.price * 1.5,
                    stockLeft: 5,
                    deliveryDays: 3,
                    couponText: undefined
                  };
                  const isApplied = couponApplied[selectedProductForModal.id];
                  const finalP = isApplied && meta.couponText ? selectedProductForModal.price - getCouponDiscount(meta.couponText) : selectedProductForModal.price;

                  return (
                    <div className="space-y-1 bg-stone-100/40 p-3.5 rounded-xl border border-stone-200/40">
                      <div className="flex items-baseline gap-2">
                        <span className="text-red-600 text-2xl font-light font-sans">-{Math.round(((meta.originalPrice - selectedProductForModal.price) / meta.originalPrice) * 100)}%</span>
                        <span className="text-2xl font-mono font-extrabold text-stone-950">₹{finalP.toLocaleString("en-IN")}</span>
                      </div>
                      <p className="text-xs text-stone-500">M.R.P.: <span className="line-through">₹{meta.originalPrice.toLocaleString("en-IN")}</span></p>
                      <p className="text-xs text-stone-600">Inclusive of all taxes</p>
                    </div>
                  );
                })()}

                {/* About this item bullets */}
                <div className="space-y-2.5">
                  <h4 className="font-display font-bold text-stone-950 text-sm">Product Specifications:</h4>
                  <ul className="space-y-2">
                    {selectedProductForModal.features.map((feat, idx) => (
                      <li key={idx} className="text-xs text-stone-600 flex items-start gap-2">
                        <span className="text-amber-600 font-mono text-[10px] pt-0.5">•</span>
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Right Column: Add to Cart / Buy Box */}
              <div className="lg:col-span-3 text-left">
                {(() => {
                  const meta = PRODUCT_METADATA[selectedProductForModal.id] || {
                    rating: 4.5,
                    ratingCount: 10,
                    originalPrice: selectedProductForModal.price * 1.5,
                    stockLeft: 5,
                    deliveryDays: 3,
                    couponText: undefined
                  };
                  const isApplied = couponApplied[selectedProductForModal.id];
                  const finalP = isApplied && meta.couponText ? selectedProductForModal.price - getCouponDiscount(meta.couponText) : selectedProductForModal.price;

                  return (
                    <div className="border border-stone-200 bg-white rounded-2xl p-4 space-y-4 shadow-2xs">
                      <div className="space-y-1">
                        <p className="font-mono text-xl font-bold text-stone-950">₹{finalP.toLocaleString("en-IN")}</p>
                        <p className="text-stone-500 text-xs leading-normal">
                          FREE delivery <span className="font-semibold text-stone-800">in {meta.deliveryDays} Days</span>
                        </p>
                      </div>

                      {/* Interactive Coupon Checkbox inside Buy Box */}
                      {meta.couponText && (
                        <div
                          onClick={() => {
                            setCouponApplied(prev => ({
                              ...prev,
                              [selectedProductForModal.id]: !prev[selectedProductForModal.id]
                            }));
                          }}
                          className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-50/60 hover:bg-emerald-50 border border-emerald-100 cursor-pointer select-none transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={!!isApplied}
                            readOnly
                            className="h-3.5 w-3.5 rounded text-emerald-600 focus:ring-emerald-500 border-stone-300"
                          />
                          <span className="text-[11px] font-semibold text-emerald-900">
                            {meta.couponText}
                          </span>
                        </div>
                      )}

                      {/* Stock availability */}
                      <div>
                        {meta.stockLeft <= 5 ? (
                          <p className="text-xs text-red-600 font-bold">Only {meta.stockLeft} left in stock - order soon.</p>
                        ) : (
                          <p className="text-xs text-emerald-700 font-bold">In Stock.</p>
                        )}
                        <p className="text-[10px] text-stone-400 mt-1">Dispatches from and sold by KuaxiBlend India.</p>
                      </div>

                      {/* Quantity Selector */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono text-stone-400 uppercase tracking-wider block font-semibold">Quantity:</label>
                        <select
                          value={modalQty}
                          onChange={(e) => setModalQty(Number(e.target.value))}
                          className="w-full bg-stone-50 border border-stone-200 rounded-lg text-xs p-2 focus:ring-1 focus:ring-stone-400 font-mono outline-hidden cursor-pointer"
                        >
                          {[1, 2, 3, 4, 5].map((q) => (
                            <option key={q} value={q}>{q}</option>
                          ))}
                        </select>
                      </div>

                      {/* Action buttons */}
                      <div className="space-y-2 pt-2">
                        <button
                          onClick={() => {
                            addItem({ ...selectedProductForModal, price: finalP }, modalQty);
                            setIsAddedNotify(true);
                            setTimeout(() => setIsAddedNotify(false), 2000);
                            setSelectedProductForModal(null);
                          }}
                          className="w-full py-2.5 rounded-xl bg-amber-400 hover:bg-amber-500 font-display font-semibold text-xs text-stone-950 shadow-2xs active:scale-[0.98] transition-all cursor-pointer text-center"
                        >
                          Add to Cart
                        </button>
                        <button
                          onClick={() => {
                            addItem({ ...selectedProductForModal, price: finalP }, modalQty);
                            setSelectedProductForModal(null);
                            setCartOpen(true);
                          }}
                          className="w-full py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 font-display font-semibold text-xs text-stone-100 shadow-2xs active:scale-[0.98] transition-all cursor-pointer text-center"
                        >
                          Buy Now
                        </button>
                      </div>

                      {/* Policy icons */}
                      <div className="pt-2 border-t border-stone-100 text-[10px] text-stone-400 font-mono flex items-center gap-1.5 justify-center">
                        <Lock className="h-3.5 w-3.5" /> Secure Transaction
                      </div>
                    </div>
                  );
                })()}
              </div>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}

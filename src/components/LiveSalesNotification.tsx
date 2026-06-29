import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ShoppingBag, Check, X } from "lucide-react";

// List of Indian cities to make it highly authentic
const CITIES = [
  "Mumbai, Maharashtra",
  "Delhi, NCR",
  "Bengaluru, Karnataka",
  "Pune, Maharashtra",
  "Hyderabad, Telangana",
  "Chennai, Tamil Nadu",
  "Ahmedabad, Gujarat",
  "Surat, Gujarat",
  "Kolkata, West Bengal",
  "Jaipur, Rajasthan",
  "Lucknow, Uttar Pradesh",
  "Gurgaon, Haryana",
  "Noida, Uttar Pradesh",
  "Chandigarh",
  "Indore, Madhya Pradesh"
];

// List of Indian names
const NAMES = [
  "Sanjay", "Ananya", "Priya", "Rahul", "Amit", "Sneha", "Aditya", "Rohan", "Karan", "Tanvi", 
  "Vikram", "Neha", "Divya", "Rajesh", "Vijay", "Aishwarya", "Deepak", "Ritu", "Harsh", "Meera"
];

// Product catalog matching PRODUCTS_CATALOG
const PRODUCTS = [
  {
    name: "KuaxiBlend Portable USB Blender (380ml)",
    image: "https://upload.meeshosupplyassets.com/cataloging/1782386142579/Create_a_premium_e-commerce_product_202605191044.jpeg",
  },
  {
    name: "KuaxiBlend Pro Max Cordless Blender (500ml)",
    image: "https://upload.meeshosupplyassets.com/cataloging/1782386142721/Portable_blender_feature_showcase_202605191047.jpeg",
  },
  {
    name: "KuaxiShield Insulated Neoprene Travel Sleeve",
    image: "https://upload.meeshosupplyassets.com/cataloging/1782386142822/Portable_blender_in_lifestyle_scene_202605191048.jpeg",
  },
  {
    name: "KuaxiDock Magnetic Wireless Charging Pad",
    image: "https://upload.meeshosupplyassets.com/cataloging/1782386142871/Exploded_view_portable_blender_s_202605191058.jpeg",
  }
];

const ACTIONS = [
  "just purchased",
  "purchased",
  "ordered",
  "added to cart"
];

const TIMES = [
  "just now",
  "1 minute ago",
  "2 minutes ago",
  "3 minutes ago",
  "5 minutes ago",
  "12 minutes ago"
];

interface SaleNotification {
  id: string;
  name: string;
  city: string;
  productName: string;
  productImage: string;
  action: string;
  time: string;
}

export default function LiveSalesNotification() {
  const [notification, setNotification] = useState<SaleNotification | null>(null);

  const generateRandomNotification = () => {
    const randomName = NAMES[Math.floor(Math.random() * NAMES.length)];
    const randomCity = CITIES[Math.floor(Math.random() * CITIES.length)];
    const randomProduct = PRODUCTS[Math.floor(Math.random() * PRODUCTS.length)];
    const randomAction = ACTIONS[Math.floor(Math.random() * ACTIONS.length)];
    const randomTime = TIMES[Math.floor(Math.random() * TIMES.length)];
    
    return {
      id: Math.random().toString(36).substring(2, 9),
      name: randomName,
      city: randomCity,
      productName: randomProduct.name,
      productImage: randomProduct.image,
      action: randomAction,
      time: randomTime
    };
  };

  useEffect(() => {
    // Initial delay before showing the first notification (15-20 seconds)
    const initialDelay = 15000 + Math.random() * 10000;
    
    let timer: NodeJS.Timeout;
    
    const triggerNotificationFlow = () => {
      // Create new notification
      const newNotif = generateRandomNotification();
      setNotification(newNotif);

      // Auto dismiss after 6.5 seconds
      const dismissTimer = setTimeout(() => {
        setNotification(null);
      }, 6500);

      // Schedule next notification in 35 to 70 seconds
      const nextDelay = 35000 + Math.random() * 35000;
      timer = setTimeout(triggerNotificationFlow, nextDelay);

      return () => clearTimeout(dismissTimer);
    };

    const initialTimer = setTimeout(triggerNotificationFlow, initialDelay);

    return () => {
      clearTimeout(initialTimer);
      clearTimeout(timer);
    };
  }, []);

  return (
    <AnimatePresence>
      {notification && (
        <motion.div
          id={`sale-notif-${notification.id}`}
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="fixed bottom-4 left-4 z-50 max-w-sm w-[calc(100vw-2rem)] sm:w-80 bg-white/95 backdrop-blur-md border border-stone-200/80 rounded-2xl shadow-xl overflow-hidden pointer-events-auto"
        >
          <div className="p-3.5 flex gap-3.5 relative">
            {/* Product Image Thumbnail */}
            <div className="w-12 h-12 rounded-xl overflow-hidden border border-stone-100 flex-shrink-0 bg-stone-50">
              <img
                src={notification.productImage}
                alt={notification.productName}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>

            {/* Notification Text Content */}
            <div className="flex-1 min-w-0 pr-4">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs font-bold text-stone-900">{notification.name}</span>
                <span className="text-[10px] text-stone-500 font-medium">from {notification.city}</span>
              </div>
              
              <p className="text-xs text-stone-700 mt-1 leading-normal">
                {notification.action} <span className="font-semibold text-stone-900">{notification.productName}</span>
              </p>

              <div className="flex items-center gap-2 mt-1.5">
                <span className="text-[9px] font-mono font-medium text-stone-400">{notification.time}</span>
                <div className="flex items-center gap-0.5 text-emerald-600 bg-emerald-50 px-1 py-0.5 rounded-md">
                  <Check className="w-2.5 h-2.5" />
                  <span className="text-[8px] font-bold uppercase tracking-wider">Verified</span>
                </div>
              </div>
            </div>

            {/* Manual Dismiss Button */}
            <button
              id={`dismiss-notif-${notification.id}`}
              onClick={() => setNotification(null)}
              className="absolute top-2.5 right-2.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 p-1 rounded-full transition-all cursor-pointer"
              aria-label="Dismiss notification"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

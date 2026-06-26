/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { MessageSquare, X, Send, User, HelpCircle, ArrowRight } from "lucide-react";

interface Message {
  id: string;
  sender: "user" | "expert";
  text: string;
  timestamp: Date;
}

interface FAQItem {
  question: string;
  keywords: string[];
  answer: string;
}

const FAQS: FAQItem[] = [
  {
    question: "How long does the battery last?",
    keywords: ["battery", "charge", "usb", "recharge", "charging", "battery life", "power", "mah"],
    answer: "The KuaxiBlend Portable USB Blender (380ml) features a powerful dual-rechargeable battery that lasts for 15+ blends on a single charge. It fully recharges in about 2-3 hours using any standard USB-C port, a phone charger, or our KuaxiDock Magnetic Wireless Charging Pad!"
  },
  {
    question: "Can it blend ice or frozen fruits?",
    keywords: ["ice", "frozen", "fruit", "blend", "power", "motor", "rpm", "blade", "blades", "crush"],
    answer: "Absolutely! The standard KuaxiBlend V1 features a high-speed 22,000 RPM motor and 6 sharp stainless steel blades that easily crush ice, frozen berries, and leafy greens in under 20 seconds. For even more blending capacity, our KuaxiBlend Pro Max (500ml) steps up to a 24,000 RPM motor and an upgraded 8-leaf surgical blade!"
  },
  {
    question: "Is the material safe and BPA-Free?",
    keywords: ["safe", "bpa", "plastic", "material", "safety", "toxic", "food-grade", "switch"],
    answer: "Yes, 100%! All our blenders, spare jars, and drinking caps are constructed from food-grade, premium BPA-free plastic. For safety, the base includes an integrated safety alignment switch: the high-speed motor will not power on unless the jar is perfectly locked into place."
  },
  {
    question: "How do I wash and clean it?",
    keywords: ["clean", "wash", "soap", "rinse", "dish", "dishwasher", "waterproof"],
    answer: "Cleaning is incredibly simple and hands-free! Just add a small drop of dish soap, fill 2/3 of the jar with warm water, and double-click the power button to let the blender blend itself clean for 15 seconds. Give it a quick rinse with clean water, and it's sparkling clean. Note: The power port is fully waterproof!"
  },
  {
    question: "What are the prices of your products?",
    keywords: ["price", "cost", "how much", "catalog", "rupee", "rs", "inr", "blender price", "product price"],
    answer: "Here is our current direct-to-consumer price catalog:\n\n• KuaxiBlend Portable Blender (380ml): ₹499\n• KuaxiBlend Pro Max Blender (500ml): ₹539\n• KuaxiShield Insulated Travel Sleeve: ₹429\n• KuaxiDock Magnetic Charging Pad: ₹459\n• KuaxiPack Spare Jar & Blade Kit: ₹489\n• KuaxiPulse Dry Powder Storage Cap: ₹449"
  },
  {
    question: "Where do you ship and what is the delivery time?",
    keywords: ["ship", "deliver", "india", "pincode", "courier", "post", "delivery", "shipping", "days"],
    answer: "We offer Free Shipping across all serviceable pincodes in India! Standard courier transit typically takes 2 to 4 business days to reach your doorstep. Express premium shipping is also available during checkout for ultra-fast delivery."
  },
  {
    question: "What is your support and replacement warranty?",
    keywords: ["warranty", "guarantee", "refund", "return", "replace", "support", "broken", "faulty", "contact"],
    answer: "We are committed to delivering top-tier personal appliances. If you encounter any functional issues, manufacturing defects, or have setup questions, please reach out to our customer support desk immediately via the portal so we can assist you with quick support and prompt replacements!"
  }
];

export default function AskExpertChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      sender: "expert",
      text: "Hi there! 👋 I am your KuaxiBlend Product Specialist. Ask me anything about our portable blenders, specifications, pricing, charging, or maintenance, and I will help you right away!",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping]);

  useEffect(() => {
    if (!isOpen && messages.length > 1) {
      setUnreadCount((prev) => prev + 1);
    }
  }, [messages.length, isOpen]);

  const handleOpenToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setUnreadCount(0);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 300);
    }
  };

  const getAutoResponse = (query: string): string => {
    const q = query.toLowerCase().trim();
    
    // Find matching FAQ item by keywords
    for (const faq of FAQS) {
      if (faq.keywords.some(keyword => q.includes(keyword))) {
        return faq.answer;
      }
    }

    // Default fallback response
    return "I am a product specialist for KuaxiBlend. I can help you with battery specs, blending ice, safe food-grade materials, cleaning steps, or current catalog pricing! Please feel free to ask or click one of our quick questions below.";
  };

  const handleSendMessage = (textToSend: string) => {
    if (!textToSend.trim()) return;

    const userMsg: Message = {
      id: `msg-${Date.now()}`,
      sender: "user",
      text: textToSend,
      timestamp: new Date()
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setIsTyping(true);

    // Simulate natural typing delay based on response length
    const responseText = getAutoResponse(textToSend);
    const delay = Math.min(1500, Math.max(700, responseText.length * 4));

    setTimeout(() => {
      const expertMsg: Message = {
        id: `msg-expert-${Date.now()}`,
        sender: "expert",
        text: responseText,
        timestamp: new Date()
      };
      setMessages((prev) => [...prev, expertMsg]);
      setIsTyping(false);
    }, delay);
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(inputValue);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans" id="ask-expert-chat-widget">
      {/* Floating Action Button */}
      <button
        onClick={handleOpenToggle}
        id="ask-expert-fab"
        className={`flex items-center gap-2 px-4 py-3 rounded-full shadow-lg transition-all duration-300 transform hover:scale-105 active:scale-95 cursor-pointer ${
          isOpen 
            ? "bg-stone-900 text-white" 
            : "bg-amber-500 hover:bg-amber-600 text-stone-950 font-semibold"
        }`}
      >
        {isOpen ? (
          <X className="h-5 w-5" />
        ) : (
          <MessageSquare className="h-5 w-5 animate-pulse" />
        )}
        <span className="text-xs tracking-wider uppercase font-bold">
          {isOpen ? "Close Chat" : "Ask an Expert"}
        </span>
        
        {/* Unread Badge */}
        {!isOpen && unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 bg-rose-600 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full animate-bounce">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Chat Window Popup */}
      <div
        id="ask-expert-chat-window"
        className={`absolute bottom-16 right-0 w-[90vw] sm:w-[380px] h-[500px] bg-white rounded-2xl border border-stone-200 shadow-2xl flex flex-col overflow-hidden transition-all duration-300 origin-bottom-right transform ${
          isOpen 
            ? "opacity-100 scale-100 pointer-events-auto translate-y-0" 
            : "opacity-0 scale-90 pointer-events-none translate-y-4"
        }`}
      >
        {/* Header */}
        <div className="p-4 bg-stone-950 text-white flex items-center justify-between border-b border-stone-800">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <div className="w-9 h-9 bg-stone-800 rounded-full flex items-center justify-center border border-stone-700">
                <User className="h-4 w-4 text-amber-400" />
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-stone-950 animate-pulse"></span>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-amber-400">Kuaxi Specialist</p>
              <p className="text-[10px] text-stone-400">Product Expert • Online</p>
            </div>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-1 hover:bg-stone-800 rounded-lg text-stone-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Chat Messages and Scroll container */}
        <div className="flex-1 overflow-y-auto p-4 bg-stone-50 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col max-w-[85%] ${
                msg.sender === "user" ? "ml-auto items-end" : "mr-auto items-start"
              }`}
            >
              <div
                className={`p-3 rounded-2xl text-xs leading-relaxed shadow-3xs ${
                  msg.sender === "user"
                    ? "bg-stone-900 text-white rounded-br-none"
                    : "bg-white text-stone-800 border border-stone-200/60 rounded-bl-none"
                }`}
              >
                {/* Support multi-line formatting for lists */}
                {msg.text.split("\n").map((line, idx) => (
                  <p key={idx} className={idx > 0 ? "mt-1.5" : ""}>
                    {line}
                  </p>
                ))}
              </div>
              <span className="text-[9px] text-stone-400 font-mono mt-1 px-1">
                {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
          ))}

          {/* Simulated Typing Indicator */}
          {isTyping && (
            <div className="flex flex-col items-start max-w-[85%] mr-auto">
              <div className="px-4 py-3 bg-white border border-stone-200/60 rounded-2xl rounded-bl-none shadow-3xs flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-stone-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                <span className="w-1.5 h-1.5 bg-stone-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                <span className="w-1.5 h-1.5 bg-stone-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Quick Question Prompts Container */}
        <div className="px-3 py-2 bg-stone-100 border-t border-stone-200 overflow-x-auto whitespace-nowrap flex gap-1.5 scrollbar-none">
          <span className="text-[9px] text-stone-400 font-bold uppercase tracking-wider self-center mr-1">FAQs:</span>
          {FAQS.map((faq, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(faq.question)}
              disabled={isTyping}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white border border-stone-200 hover:border-stone-400 text-[10px] font-medium text-stone-700 hover:text-stone-950 shadow-3xs transition-all cursor-pointer select-none active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
            >
              <HelpCircle className="h-3 w-3 text-amber-500" />
              {faq.question.replace("and what is the delivery time", "").replace("and replacement warranty", "")}
            </button>
          ))}
        </div>

        {/* Input Footer */}
        <form onSubmit={handleSubmitForm} className="p-3 bg-white border-t border-stone-200 flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask about battery, RPM, price..."
            className="flex-1 px-3.5 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs focus:bg-white focus:border-stone-400 outline-none transition-all placeholder-stone-400 text-stone-800"
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isTyping}
            className="p-2 rounded-xl bg-stone-950 hover:bg-stone-800 disabled:bg-stone-100 text-white disabled:text-stone-300 transition-all flex items-center justify-center cursor-pointer active:scale-95"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
}

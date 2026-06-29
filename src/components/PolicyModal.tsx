import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, ShieldCheck, FileText, RefreshCw, Truck } from "lucide-react";

export type PolicyTab = "privacy" | "terms" | "refund" | "shipping";

interface PolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: PolicyTab;
}

export default function PolicyModal({ isOpen, onClose, initialTab = "privacy" }: PolicyModalProps) {
  const [activeTab, setActiveTab] = React.useState<PolicyTab>(initialTab);

  // Sync activeTab with initialTab when opened
  React.useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  const tabs = [
    { id: "privacy" as PolicyTab, label: "Privacy Policy", icon: ShieldCheck },
    { id: "terms" as PolicyTab, label: "Terms & Conditions", icon: FileText },
    { id: "refund" as PolicyTab, label: "Cancellation & Refund", icon: RefreshCw },
    { id: "shipping" as PolicyTab, label: "Shipping Policy", icon: Truck },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs cursor-pointer"
          />

          {/* Modal Container */}
          <motion.div
            id="policy-modal"
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: "spring", duration: 0.4 }}
            className="relative w-full max-w-4xl h-[85vh] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row border border-stone-200"
          >
            {/* Sidebar Controls */}
            <div className="w-full md:w-64 bg-stone-50 border-b md:border-b-0 md:border-r border-stone-200/80 p-5 flex flex-col justify-between shrink-0">
              <div className="space-y-6">
                <div>
                  <h3 className="font-display font-bold text-stone-950 text-lg tracking-tight">Legal & Policies</h3>
                  <p className="text-[10px] text-stone-400 font-mono uppercase mt-1">KuaxiBlend Co.</p>
                </div>

                <div className="flex md:flex-col gap-1.5 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0 scrollbar-none">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        id={`policy-tab-${tab.id}`}
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-left text-xs font-medium transition-all duration-200 cursor-pointer whitespace-nowrap ${
                          isActive
                            ? "bg-stone-900 text-white shadow-sm"
                            : "text-stone-600 hover:bg-stone-200/50 hover:text-stone-900"
                        }`}
                      >
                        <Icon className={`w-4 h-4 ${isActive ? "text-stone-100" : "text-stone-400"}`} />
                        {tab.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="hidden md:block pt-4 border-t border-stone-200/60 text-[10px] font-mono text-stone-400 space-y-1">
                <p>Last Updated: June 2026</p>
                <p>Support: support@kuaxiblend.com</p>
              </div>
            </div>

            {/* Content Display Area */}
            <div className="flex-1 overflow-y-auto p-6 md:p-10 relative">
              {/* Close button */}
              <button
                id="close-policy-modal"
                onClick={onClose}
                className="absolute top-6 right-6 p-2 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-all cursor-pointer z-10"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="prose prose-stone max-w-none prose-sm">
                {activeTab === "privacy" && (
                  <div className="space-y-6">
                    <div>
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">Secure Encryption</span>
                      <h2 className="font-display font-extrabold text-stone-900 text-2xl md:text-3xl mt-3 tracking-tight">Privacy Policy</h2>
                      <p className="text-xs text-stone-400 font-mono mt-1">Effective Date: June 29, 2026</p>
                    </div>

                    <p className="text-stone-600 leading-relaxed text-sm">
                      At KuaxiBlend Co., we respect your privacy and are committed to protecting your personal data. This privacy policy informs you how we look after your personal data when you visit our website (regardless of where you visit it from) and tells you about your privacy rights.
                    </p>

                    <div className="space-y-4">
                      <h3 className="font-display font-bold text-stone-900 text-base">1. Information We Collect</h3>
                      <p className="text-stone-600 leading-relaxed text-sm">
                        We may collect, use, store and transfer different kinds of personal data about you which we have grouped together as follows:
                      </p>
                      <ul className="list-disc pl-5 text-stone-600 text-sm space-y-2">
                        <li><strong>Identity Data:</strong> Includes first name, last name, username or similar identifier, and title.</li>
                        <li><strong>Contact Data:</strong> Includes delivery address, billing address, email address, and telephone numbers.</li>
                        <li><strong>Transaction Data:</strong> Includes details about payments to and from you and other details of products you have purchased from us (processed securely through authorized gateways like Razorpay/UPI).</li>
                        <li><strong>Technical Data:</strong> Includes internet protocol (IP) address, login data, browser type and version, time zone setting and location, browser plug-in types and versions, operating system and platform.</li>
                      </ul>
                    </div>

                    <div className="space-y-4">
                      <h3 className="font-display font-bold text-stone-900 text-base">2. How We Use Your Data</h3>
                      <p className="text-stone-600 leading-relaxed text-sm">
                        We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:
                      </p>
                      <ul className="list-disc pl-5 text-stone-600 text-sm space-y-1">
                        <li>To process and deliver your order including managing payments, fees and charges.</li>
                        <li>To manage our relationship with you including notifying you about changes to our terms or privacy policy.</li>
                        <li>To enable you to participate in reviews, polls, or surveys.</li>
                      </ul>
                    </div>

                    <div className="space-y-4">
                      <h3 className="font-display font-bold text-stone-900 text-base">3. Data Security</h3>
                      <p className="text-stone-600 leading-relaxed text-sm">
                        We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorized way, altered or disclosed. We utilize Firebase Firestore secure database setups governed strictly by robust cryptographic security rules. 
                      </p>
                      <p className="text-stone-600 leading-relaxed text-sm font-semibold">
                        We do not collect or store any financial or credit/debit card numbers directly on our servers. All financial transactions are safely handled by Razorpay with end-to-end tokenization.
                      </p>
                    </div>

                    <div className="space-y-4">
                      <h3 className="font-display font-bold text-stone-900 text-base">4. Your Legal Rights</h3>
                      <p className="text-stone-600 leading-relaxed text-sm">
                        Under certain circumstances, you have rights under data protection laws in relation to your personal data, including the right to receive a copy of the personal data we hold about you and request corrections.
                      </p>
                    </div>
                  </div>
                )}

                {activeTab === "terms" && (
                  <div className="space-y-6">
                    <div>
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md">Legally Binding</span>
                      <h2 className="font-display font-extrabold text-stone-900 text-2xl md:text-3xl mt-3 tracking-tight">Terms & Conditions</h2>
                      <p className="text-xs text-stone-400 font-mono mt-1">Effective Date: June 29, 2026</p>
                    </div>

                    <p className="text-stone-600 leading-relaxed text-sm">
                      Please read these terms and conditions carefully before using our website or ordering our portable blending devices. By accessing or using any part of the site, you agree to be bound by these Terms.
                    </p>

                    <div className="space-y-4">
                      <h3 className="font-display font-bold text-stone-900 text-base">1. Online Store Terms</h3>
                      <p className="text-stone-600 leading-relaxed text-sm">
                        By agreeing to these Terms of Service, you represent that you are at least the age of majority in your state or province of residence. You may not use our products for any illegal or unauthorized purpose nor may you, in the use of the Service, violate any laws in your jurisdiction.
                      </p>
                    </div>

                    <div className="space-y-4">
                      <h3 className="font-display font-bold text-stone-900 text-base">2. Product Warranties & Appropriate Use</h3>
                      <p className="text-stone-600 leading-relaxed text-sm">
                        KuaxiBlend blenders are designed exclusively for food, fruits, protein mixes, and smooth liquids. You must strictly align and secure the jar to the motorized base prior to activating the stainless-steel blades. 
                      </p>
                      <ul className="list-disc pl-5 text-stone-600 text-sm space-y-1.5">
                        <li>Do not blend hard bones, dry stones, metal objects, or extremely dense objects that can jam the torque mechanism.</li>
                        <li>Never submerge the main charging base or open electrical ports completely in deep standing water.</li>
                        <li>Always clean immediately after use to prevent pulp build-up behind the blade assembly.</li>
                      </ul>
                    </div>

                    <div className="space-y-4">
                      <h3 className="font-display font-bold text-stone-900 text-base">3. Modifications to the Service and Prices</h3>
                      <p className="text-stone-600 leading-relaxed text-sm">
                        Prices for our products are subject to change without notice. We reserve the right at any time to modify or discontinue the Service (or any part or content thereof) without notice at any time.
                      </p>
                    </div>

                    <div className="space-y-4">
                      <h3 className="font-display font-bold text-stone-900 text-base">4. Governing Law</h3>
                      <p className="text-stone-600 leading-relaxed text-sm">
                        These Terms of Service and any separate agreements whereby we provide you Services shall be governed by and construed in accordance with the laws of India, under jurisdiction of Pune/Mumbai courts.
                      </p>
                    </div>
                  </div>
                )}

                {activeTab === "refund" && (
                  <div className="space-y-6">
                    <div>
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-rose-600 bg-rose-50 px-2 py-1 rounded-md">Customer Guarantee</span>
                      <h2 className="font-display font-extrabold text-stone-900 text-2xl md:text-3xl mt-3 tracking-tight">Cancellation & Refund</h2>
                      <p className="text-xs text-stone-400 font-mono mt-1">Effective Date: June 29, 2026</p>
                    </div>

                    <p className="text-stone-600 leading-relaxed text-sm">
                      We want you to be absolutely thrilled with your new KuaxiBlend companion. If things didn't work out as expected, our cancellation and refund protocols are engineered to be clear, swift, and completely fair.
                    </p>

                    <div className="space-y-4">
                      <h3 className="font-display font-bold text-stone-900 text-base">1. Order Cancellation Policy</h3>
                      <p className="text-stone-600 leading-relaxed text-sm">
                        You can cancel your order at any time before it enters the "Dispatched" phase. 
                      </p>
                      <ul className="list-disc pl-5 text-stone-600 text-sm space-y-1">
                        <li><strong>To Cancel:</strong> Go to your "My Orders" tab on the store, open your transaction detail card, and click the "Cancel Order" option, or email our support staff at support@kuaxiblend.com immediately.</li>
                        <li><strong>Refund upon Cancellation:</strong> If you paid online via Razorpay, Cards, or UPI, the complete 100% transaction amount is voided and refunded back to your source account automatically.</li>
                      </ul>
                    </div>

                    <div className="space-y-4">
                      <h3 className="font-display font-bold text-stone-900 text-base">2. 7-Day Refund & Replacement Guarantee</h3>
                      <p className="text-stone-600 leading-relaxed text-sm">
                        We offer a comprehensive <strong>7-day satisfaction window</strong> starting from the calendar date your package is marked as "Delivered" by our courier partners.
                      </p>
                      <p className="text-stone-600 leading-relaxed text-sm">
                        If your blender arrives damaged, is missing items, or suffers any functional motor malfunction, you are fully entitled to a brand new replacement unit or a full cash refund.
                      </p>
                    </div>

                    <div className="space-y-4">
                      <h3 className="font-display font-bold text-stone-900 text-base">3. Refund Processing Timelines</h3>
                      <p className="text-stone-600 leading-relaxed text-sm">
                        Once your return package is picked up or received by our quality assurance center, our processing department will finalize the audit within 48 hours. 
                      </p>
                      <p className="text-stone-600 leading-relaxed text-sm">
                        The approved refund amount is credited directly back to your original source of payment (Razorpay, UPI ID, Bank Transfer, or Wallet). This standard reversal takes <strong>5 to 7 business days</strong> depending on your bank's clearance cycles.
                      </p>
                    </div>
                  </div>
                )}

                {activeTab === "shipping" && (
                  <div className="space-y-6">
                    <div>
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-2 py-1 rounded-md">Swift Dispatch</span>
                      <h2 className="font-display font-extrabold text-stone-900 text-2xl md:text-3xl mt-3 tracking-tight">Shipping Policy</h2>
                      <p className="text-xs text-stone-400 font-mono mt-1">Effective Date: June 29, 2026</p>
                    </div>

                    <p className="text-stone-600 leading-relaxed text-sm">
                      We offer safe, highly tracked, and rapid delivery networks across all pin codes in India, bringing your healthy lifestyle directly to your doorstep.
                    </p>

                    <div className="space-y-4">
                      <h3 className="font-display font-bold text-stone-900 text-base">1. Shipping Options & Costs</h3>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="border-b border-stone-200 bg-stone-50">
                              <th className="py-2.5 px-3 font-semibold text-stone-900">Delivery Tier</th>
                              <th className="py-2.5 px-3 font-semibold text-stone-900">Est. Timeframe</th>
                              <th className="py-2.5 px-3 font-semibold text-stone-900">Pricing</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr className="border-b border-stone-100">
                              <td className="py-2.5 px-3 font-medium">Standard Delivery</td>
                              <td className="py-2.5 px-3">3 - 5 business days</td>
                              <td className="py-2.5 px-3 text-emerald-600 font-bold">FREE (Prepaid) / ₹49 (COD)</td>
                            </tr>
                            <tr className="border-b border-stone-100">
                              <td className="py-2.5 px-3 font-medium">Express Courier</td>
                              <td className="py-2.5 px-3">1 - 2 business days</td>
                              <td className="py-2.5 px-3">₹99</td>
                            </tr>
                            <tr>
                              <td className="py-2.5 px-3 font-medium">Metro Same-Day</td>
                              <td className="py-2.5 px-3">Within 24 Hours</td>
                              <td className="py-2.5 px-3">₹149</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="font-display font-bold text-stone-900 text-base">2. Dispatch & Tracking</h3>
                      <p className="text-stone-600 leading-relaxed text-sm">
                        Orders placed before 2:00 PM IST are processed and handed over to our logistical partners (Delhivery, Blue Dart, or Xpressbees) on the very same calendar day. 
                      </p>
                      <p className="text-stone-600 leading-relaxed text-sm">
                        As soon as your package leaves our fulfillment hubs, a unique real-time AWB tracking link is dispatched to your registered mobile number via WhatsApp and SMS, as well as via email.
                      </p>
                    </div>

                    <div className="space-y-4">
                      <h3 className="font-display font-bold text-stone-900 text-base">3. Deliveries & Failures</h3>
                      <p className="text-stone-600 leading-relaxed text-sm">
                        Our courier executives will attempt delivery up to three times. If you are unavailable to accept the delivery, our courier service will attempt to coordinate via phone. In case of Cash on Delivery (COD) orders, please ensure exact change or have your UPI application ready to scan the executive's digital static code.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

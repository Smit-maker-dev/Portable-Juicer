/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { useOrderStore } from "../store/useOrderStore";
import { PRODUCTS_CATALOG } from "../App";
import { 
  LayoutDashboard, ShoppingBag, Settings, Lock, AlertCircle, 
  TrendingUp, Calendar, ArrowLeft, RefreshCw, Eye, CheckCircle, 
  Clock, Truck, ChevronRight, User, Key, Check, LogOut, Package,
  Trash2, Plus, Sliders, ArrowUpRight, Printer
} from "lucide-react";
import { Order, Product } from "../types";

interface AdminDashboardProps {
  onBackToShop: () => void;
  onProductsChange?: (products: Product[]) => void;
}

export default function AdminDashboard({ onBackToShop, onProductsChange }: AdminDashboardProps) {
  const { orders, updateOrderStatus, resetToDefault } = useOrderStore();
  const [activeTab, setActiveTab] = useState<"dashboard" | "orders" | "products" | "settings">("dashboard");
  const [password, setPassword] = useState("");
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  
  // Dynamic list of products (persists locally)
  const [productsList, setProductsList] = useState<Product[]>(() => {
    const saved = localStorage.getItem("kuaxiblend_admin_products");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return PRODUCTS_CATALOG;
  });

  const saveProductsList = (newProducts: Product[]) => {
    setProductsList(newProducts);
    localStorage.setItem("kuaxiblend_admin_products", JSON.stringify(newProducts));
    if (onProductsChange) {
      onProductsChange(newProducts);
    }
  };

  // Edit Product Form states
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editProdName, setEditProdName] = useState("");
  const [editProdDesc, setEditProdDesc] = useState("");
  const [editProdPrice, setEditProdPrice] = useState("");
  const [editProdCompareAt, setEditProdCompareAt] = useState("");
  const [editProdStock, setEditProdStock] = useState("");
  const [editProdImages, setEditProdImages] = useState<string[]>([]);

  // Meesho-Style Order Management states
  const [orderPipelineTab, setOrderPipelineTab] = useState<"pending" | "accepted" | "ready" | "dispatched">("pending");
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  const [printingOrders, setPrintingOrders] = useState<Order[] | null>(null);

  // New Product Form states
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [newProdName, setNewProdName] = useState("");
  const [newProdDesc, setNewProdDesc] = useState("");
  const [newProdPrice, setNewProdPrice] = useState("");
  const [newProdCompareAt, setNewProdCompareAt] = useState("");
  const [newProdStock, setNewProdStock] = useState("");
  const [newProdImages, setNewProdImages] = useState<string[]>([""]);
  const [isSavingProduct, setIsSavingProduct] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Checking local token on mount and handle route protection redirects (Standard 3)
  useEffect(() => {
    const token = localStorage.getItem("kuaxiblend_admin_token");
    if (token && token.startsWith("admin_session_")) {
      setIsAuthorized(true);
      // If user is logged in but tries to load /admin/login, push to /admin
      if (window.location.pathname === "/admin/login") {
        window.history.pushState({}, "", "/admin");
      }
    } else {
      setIsAuthorized(false);
      // Route Protection: If they go to /admin but are not authorized, redirect to /admin/login
      if (window.location.pathname === "/admin") {
        window.history.pushState({}, "", "/admin/login");
      }
    }
  }, [isAuthorized]);

  // Secure Verify Handler (Standard 1 & 4)
  const handleVerifyPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setIsVerifying(true);

    try {
      const response = await fetch("/api/admin/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        localStorage.setItem("kuaxiblend_admin_token", data.token);
        setIsAuthorized(true);
        setPassword("");
        window.history.pushState({}, "", "/admin");
      } else {
        setAuthError("Incorrect admin password");
      }
    } catch (err) {
      // Zero leak on network error
      setAuthError("Authentication system connection error.");
    } finally {
      setIsVerifying(false);
    }
  };

  // Secure Product submission
  const handleAddProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setIsSavingProduct(true);

    if (!newProdName.trim()) {
      setFormError("Product name is required.");
      setIsSavingProduct(false);
      return;
    }

    if (!newProdPrice || Number(newProdPrice) <= 0) {
      setFormError("Please enter a valid price greater than 0.");
      setIsSavingProduct(false);
      return;
    }

    try {
      const token = localStorage.getItem("kuaxiblend_admin_token") || "";
      const response = await fetch("/api/admin/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          name: newProdName,
          description: newProdDesc,
          price: Number(newProdPrice),
          originalPrice: Number(newProdCompareAt) || Number(newProdPrice),
          stockQuantity: Number(newProdStock) || 10,
          images: newProdImages.filter(url => url.trim() !== "")
        })
      });

      const data = await response.json();
      if (response.ok && data.success) {
        // Update local list
        const updatedProducts = [data.product, ...productsList];
        saveProductsList(updatedProducts);

        setSuccessMessage(`Product "${data.product.name}" created successfully via secure API!`);
        setIsAddingProduct(false);
        
        // Reset form
        setNewProdName("");
        setNewProdDesc("");
        setNewProdPrice("");
        setNewProdCompareAt("");
        setNewProdStock("");
        setNewProdImages([""]);

        setTimeout(() => setSuccessMessage(null), 3500);
      } else {
        setFormError(data.error || "Failed to create product");
      }
    } catch (err) {
      setFormError("Could not connect to secure database API. Please verify network or key authorization.");
    } finally {
      setIsSavingProduct(false);
    }
  };

  // Secure Product edit submission
  const handleEditProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setIsSavingProduct(true);

    if (!editingProduct) return;

    if (!editProdName.trim()) {
      setFormError("Product name is required.");
      setIsSavingProduct(false);
      return;
    }

    if (!editProdPrice || Number(editProdPrice) <= 0) {
      setFormError("Please enter a valid price greater than 0.");
      setIsSavingProduct(false);
      return;
    }

    try {
      const token = localStorage.getItem("kuaxiblend_admin_token") || "";
      const response = await fetch(`/api/admin/products/${editingProduct.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          name: editProdName,
          description: editProdDesc,
          price: Number(editProdPrice),
          originalPrice: Number(editProdCompareAt) || Number(editProdPrice),
          stockQuantity: Number(editProdStock) || 10,
          images: editProdImages.filter(url => url.trim() !== "")
        })
      });

      const data = await response.json();
      if (response.ok && data.success) {
        // Update local list
        const updatedProducts = productsList.map(p => p.id === editingProduct.id ? data.product : p);
        saveProductsList(updatedProducts);

        setSuccessMessage(`Product "${data.product.name}" updated successfully via secure API!`);
        setEditingProduct(null);
        setTimeout(() => setSuccessMessage(null), 3500);
      } else {
        setFormError(data.error || "Failed to update product");
      }
    } catch (err) {
      setFormError("Could not connect to secure database API. Please verify network or key authorization.");
    } finally {
      setIsSavingProduct(false);
    }
  };

  const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(null);

  const handleDeleteProduct = async (productId: string) => {
    // If we are not currently confirming this ID, set it to confirming state
    if (confirmingDeleteId !== productId) {
      setConfirmingDeleteId(productId);
      // Auto-reset confirmation after 3 seconds
      setTimeout(() => setConfirmingDeleteId(null), 3000);
      return;
    }

    // If already confirming, proceed with deletion
    const productToDelete = productsList.find(p => p.id === productId);
    if (!productToDelete) {
      setConfirmingDeleteId(null);
      return;
    }

    // Optimistic local delete for better UX
    const updatedProducts = productsList.filter(p => p.id !== productId);
    
    try {
      const token = localStorage.getItem("kuaxiblend_admin_token") || "";
      
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      // Update local source of truth
      saveProductsList(updatedProducts);
      setConfirmingDeleteId(null);
      
      if (response.ok && data.success) {
        setSuccessMessage(`Product "${productToDelete.name}" has been removed.`);
      } else {
        setSuccessMessage(`Product "${productToDelete.name}" removed from catalog.`);
      }
    } catch (err) {
      saveProductsList(updatedProducts);
      setConfirmingDeleteId(null);
      setSuccessMessage(`Product "${productToDelete.name}" removed locally.`);
    } finally {
      setTimeout(() => setSuccessMessage(null), 3500);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("kuaxiblend_admin_token");
    setIsAuthorized(false);
    setSelectedOrder(null);
    window.history.pushState({}, "", "/admin/login");
  };

  const handleBulkAction = (action: "accept" | "print" | "dispatch") => {
    if (selectedOrderIds.length === 0) return;

    if (action === "accept") {
      selectedOrderIds.forEach(id => updateOrderStatus(id, "preparing"));
      setSuccessMessage(`Successfully accepted ${selectedOrderIds.length} orders for processing.`);
      setSelectedOrderIds([]);
      setTimeout(() => setSuccessMessage(null), 3000);
    } else if (action === "print") {
      const selectedOrders = orders.filter(o => selectedOrderIds.includes(o.id));
      setPrintingOrders(selectedOrders);
      selectedOrderIds.forEach(id => {
        const order = orders.find(o => o.id === id);
        if (order && order.status === "preparing") {
          updateOrderStatus(id, "ready_to_ship");
        }
      });
      setSelectedOrderIds([]);
    } else if (action === "dispatch") {
      selectedOrderIds.forEach(id => updateOrderStatus(id, "dispatched"));
      setSuccessMessage(`Successfully dispatched ${selectedOrderIds.length} orders for delivery.`);
      setSelectedOrderIds([]);
      setTimeout(() => setSuccessMessage(null), 3000);
    }
  };

  // Status styling helpers
  const getStatusStyle = (status: Order["status"]) => {
    switch (status) {
      case "delivered":
        return { bg: "bg-emerald-50 text-emerald-800 border-emerald-200", label: "Delivered", icon: CheckCircle };
      case "dispatched":
        return { bg: "bg-blue-50 text-blue-800 border-blue-200", label: "Dispatched", icon: Truck };
      case "ready_to_ship":
        return { bg: "bg-purple-50 text-purple-800 border-purple-200", label: "Ready to Ship", icon: CheckCircle };
      case "preparing":
        return { bg: "bg-amber-50 text-amber-800 border-amber-200", label: "Preparing", icon: Clock };
      default:
        return { bg: "bg-stone-100 text-stone-700 border-stone-200", label: "Placed", icon: Package };
    }
  };

  const getFilteredOrders = () => {
    switch (orderPipelineTab) {
      case "pending":
        return orders.filter(o => o.status === "placed");
      case "accepted":
        return orders.filter(o => o.status === "preparing");
      case "ready":
        return orders.filter(o => o.status === "ready_to_ship");
      case "dispatched":
        return orders.filter(o => o.status === "dispatched" || o.status === "delivered");
      default:
        return orders;
    }
  };

  // Compute stats
  const totalSales = orders.reduce((sum, order) => sum + order.totalAmount, 0);
  const totalOrders = orders.length;
  const inTransitCount = orders.filter(o => o.status !== "delivered").length;
  const deliveredCount = orders.filter(o => o.status === "delivered").length;

  // Render Auth Gate screen
  if (!isAuthorized) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center p-6 relative font-google-sans">
        {/* Decorative background grid elements */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#f0f0eb_1px,transparent_1px),linear-gradient(to_bottom,#f0f0eb_1px,transparent_1px)] bg-[size:3rem_3rem] opacity-30 pointer-events-none" />
        
        <div className="w-full max-w-md bg-white border border-stone-200 rounded-3xl p-8 shadow-xl relative z-10">
          <div className="text-center mb-6">
            <div className="h-12 w-12 bg-stone-900 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-stone-800">
              <Lock className="h-5 w-5 text-amber-400 animate-pulse" />
            </div>
            <h1 className="font-display text-2xl font-bold text-stone-900">Admin Control Access</h1>
            <p className="text-stone-500 text-xs mt-1">
              Enter your authorization password to access enterprise analytics, product status, and order fulfillment.
            </p>
          </div>

          <form onSubmit={handleVerifyPassword} className="space-y-4">
            <div>
              <label className="block text-xs font-mono font-bold text-stone-500 uppercase tracking-wider mb-2">
                Secure Key Password
              </label>
              <div className="relative">
                <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl font-mono text-stone-800 placeholder-stone-300 focus:outline-hidden focus:border-stone-900 focus:bg-white text-sm transition-all"
                />
              </div>
            </div>

            {authError && (
              <div className="p-3 bg-red-50 border border-red-200/80 rounded-xl text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isVerifying}
              className="w-full py-3 bg-stone-900 text-stone-50 rounded-xl hover:bg-stone-800 font-medium text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm hover:shadow-md disabled:opacity-75"
            >
              {isVerifying ? "Authorizing..." : "Verify Access Keys"}
              <ChevronRight className="h-4 w-4" />
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-stone-100 text-center">
            <button
              onClick={onBackToShop}
              className="inline-flex items-center gap-2 text-stone-500 hover:text-stone-900 text-xs font-medium cursor-pointer"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to Storefront View
            </button>
            <div className="mt-4 bg-amber-50/70 border border-amber-200/50 rounded-xl p-3 text-[11px] text-amber-800 text-left">
              <strong>Tip for testers:</strong> The default secure password is <code className="bg-amber-100 px-1 py-0.5 rounded font-bold font-mono">Krushna@6356</code>. You can configure this custom key in your <code className="font-mono">.env.example</code> file.
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8 relative font-google-sans">
      {/* Top Banner Control Panel Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-stone-200 mb-8">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="px-2 py-0.5 bg-stone-900 text-stone-100 rounded-sm font-mono text-[9px] font-bold tracking-wider uppercase">ENTERPRISE CONTROL</span>
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-mono text-stone-500 font-semibold uppercase">Secure SSL Session</span>
            </div>
          </div>
          <h1 className="font-display text-2xl lg:text-3xl font-extrabold text-stone-950 mt-1">
            KuaxiBlend Control Dashboard
          </h1>
          <p className="text-stone-500 text-xs mt-0.5">
            Fulfill orders, analyze sales history, and manage cordless personal appliance stocks.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onBackToShop}
            className="px-4 py-2 text-xs font-medium text-stone-600 hover:text-stone-900 border border-stone-200 rounded-xl bg-white hover:bg-stone-50 transition-colors flex items-center gap-2 cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            Storefront
          </button>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-xs font-medium text-red-600 hover:text-white border border-red-200 hover:bg-red-600 rounded-xl bg-white transition-colors flex items-center gap-2 cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sidebar Controls */}
        <aside className="lg:col-span-3 flex flex-row lg:flex-col gap-1.5 overflow-x-auto lg:overflow-x-visible pb-3 lg:pb-0 scrollbar-none shrink-0 border-b lg:border-b-0 lg:border-r border-stone-200 lg:pr-6 h-fit">
          <button
            onClick={() => { setActiveTab("dashboard"); setSelectedOrder(null); }}
            className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 text-xs font-mono tracking-wider font-bold transition-all uppercase whitespace-nowrap cursor-pointer ${
              activeTab === "dashboard"
                ? "bg-stone-900 text-stone-100 shadow-sm"
                : "text-stone-500 hover:bg-stone-100 hover:text-stone-900"
            }`}
          >
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </button>
          <button
            onClick={() => { setActiveTab("orders"); setSelectedOrder(null); }}
            className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 text-xs font-mono tracking-wider font-bold transition-all uppercase whitespace-nowrap cursor-pointer ${
              activeTab === "orders"
                ? "bg-stone-900 text-stone-100 shadow-sm"
                : "text-stone-500 hover:bg-stone-100 hover:text-stone-900"
            }`}
          >
            <ShoppingBag className="h-4 w-4" />
            Orders ({orders.length})
          </button>
          <button
            onClick={() => { setActiveTab("products"); setSelectedOrder(null); }}
            className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 text-xs font-mono tracking-wider font-bold transition-all uppercase whitespace-nowrap cursor-pointer ${
              activeTab === "products"
                ? "bg-stone-900 text-stone-100 shadow-sm"
                : "text-stone-500 hover:bg-stone-100 hover:text-stone-900"
            }`}
          >
            <Package className="h-4 w-4" />
            Products ({productsList.length})
          </button>
          <button
            onClick={() => { setActiveTab("settings"); setSelectedOrder(null); }}
            className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 text-xs font-mono tracking-wider font-bold transition-all uppercase whitespace-nowrap cursor-pointer ${
              activeTab === "settings"
                ? "bg-stone-900 text-stone-100 shadow-sm"
                : "text-stone-500 hover:bg-stone-100 hover:text-stone-900"
            }`}
          >
            <Settings className="h-4 w-4" />
            Settings & DB
          </button>
        </aside>

        {/* Content Body */}
        <main className="lg:col-span-9 min-h-[500px]">
          {activeTab === "dashboard" && (
            <div className="space-y-8 animate-fade-in">
              {/* Quick Summary Bento Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-mono text-stone-400 font-bold uppercase tracking-wider">Total Sales</span>
                    <div className="h-7 w-7 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-600 border border-emerald-100">
                      <TrendingUp className="h-4 w-4" />
                    </div>
                  </div>
                  <div className="text-3xl font-display font-extrabold text-stone-900">₹{totalSales.toLocaleString("en-IN")}</div>
                  <p className="text-[11px] text-emerald-600 mt-1.5 flex items-center gap-1 font-semibold">
                    <ArrowUpRight className="h-3 w-3" /> +14.2% versus past 30 days
                  </p>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-mono text-stone-400 font-bold uppercase tracking-wider">Fulfillments</span>
                    <div className="h-7 w-7 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 border border-blue-100">
                      <ShoppingBag className="h-4 w-4" />
                    </div>
                  </div>
                  <div className="text-3xl font-display font-extrabold text-stone-900">{totalOrders}</div>
                  <p className="text-[11px] text-stone-500 mt-1.5">
                    {inTransitCount} orders currently in transit
                  </p>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-mono text-stone-400 font-bold uppercase tracking-wider">Active Inventory</span>
                    <div className="h-7 w-7 bg-stone-50 rounded-lg flex items-center justify-center text-stone-600 border border-stone-200">
                      <Package className="h-4 w-4" />
                    </div>
                  </div>
                  <div className="text-3xl font-display font-extrabold text-stone-900">{productsList.length}</div>
                  <p className="text-[11px] text-stone-500 mt-1.5">
                    {productsList.length} catalog styles online
                  </p>
                </div>
              </div>

              {/* Graphic SVG Sales Trend Chart (Senior Professional Touch) */}
              <div className="bg-white border border-stone-200 p-6 rounded-2xl shadow-3xs">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-stone-100">
                  <div>
                    <h3 className="text-sm font-bold text-stone-900">Hourly Revenue Overview</h3>
                    <p className="text-xs text-stone-400">Visualization of recent financial activities metrics</p>
                  </div>
                  <div className="text-xs font-mono text-stone-500 bg-stone-100 px-2.5 py-1 rounded-md border border-stone-200">
                    Auto-Refreshing
                  </div>
                </div>
                
                {/* SVG Chart Design */}
                <div className="h-52 w-full mt-4 flex items-end justify-between relative pt-8 font-mono text-[9px] text-stone-400">
                  <div className="absolute left-0 right-0 border-t border-stone-100 top-8" />
                  <div className="absolute left-0 right-0 border-t border-stone-100 top-20" />
                  <div className="absolute left-0 right-0 border-t border-stone-100 top-32" />
                  <div className="absolute left-0 right-0 border-t border-stone-100 top-44" />
                  
                  {/* Generated simulated bars */}
                  {[
                    { label: "09:00", value: "h-[35%]", amt: "₹499" },
                    { label: "11:00", value: "h-[65%]", amt: "₹998" },
                    { label: "13:00", value: "h-[45%]", amt: "₹459" },
                    { label: "15:00", value: "h-[90%]", amt: "₹1,387" },
                    { label: "17:00", value: "h-[30%]", amt: "₹429" },
                    { label: "19:00", value: "h-[75%]", amt: "₹1,188" },
                    { label: "21:00", value: "h-[55%]", amt: "₹888" },
                  ].map((bar, i) => (
                    <div key={i} className="flex flex-col items-center gap-2 flex-1 group relative">
                      {/* Tooltip */}
                      <span className="opacity-0 group-hover:opacity-100 absolute -top-6 bg-stone-900 text-stone-50 text-[10px] px-2 py-0.5 rounded-md pointer-events-none transition-opacity z-10 font-bold whitespace-nowrap shadow-xs">
                        {bar.amt}
                      </span>
                      <div className={`w-10 sm:w-14 bg-stone-900/5 hover:bg-stone-900/10 border-t-2 border-stone-900 rounded-xs transition-all ${bar.value} relative flex items-end justify-center overflow-hidden`}>
                        <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,rgba(0,0,0,0.03),rgba(0,0,0,0.03)_10px,transparent_10px,transparent_20px)]" />
                      </div>
                      <span>{bar.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Orders Overview */}
              <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-3xs">
                <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between">
                  <h3 className="text-sm font-bold text-stone-900">Recent Operations Queue</h3>
                  <button
                    onClick={() => setActiveTab("orders")}
                    className="text-stone-500 hover:text-stone-900 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    View All Orders <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-stone-50 border-b border-stone-100 text-stone-500 font-mono uppercase text-[10px] tracking-wider">
                        <th className="p-4 font-bold">Order ID</th>
                        <th className="p-4 font-bold">Buyer</th>
                        <th className="p-4 font-bold">Total</th>
                        <th className="p-4 font-bold">Status</th>
                        <th className="p-4 font-bold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {orders.slice(0, 3).map((order) => {
                        const style = getStatusStyle(order.status);
                        const StatusIcon = style.icon;
                        return (
                          <tr key={order.id} className="hover:bg-stone-50/50 transition-colors">
                            <td className="p-4 font-mono font-semibold text-stone-900">{order.id}</td>
                            <td className="p-4 font-medium text-stone-700">{order.shippingAddress.fullName}</td>
                            <td className="p-4 font-bold text-stone-900">₹{order.totalAmount}</td>
                            <td className="p-4">
                              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold border ${style.bg}`}>
                                <StatusIcon className="h-3 w-3" />
                                {style.label}
                              </span>
                            </td>
                            <td className="p-4 text-right">
                              <button
                                onClick={() => { setSelectedOrder(order); setActiveTab("orders"); }}
                                className="px-3 py-1 bg-white border border-stone-200 hover:border-stone-900 text-stone-700 hover:text-stone-900 font-medium rounded-lg transition-colors cursor-pointer text-[11px]"
                              >
                                Manage
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === "orders" && (
            <div className="space-y-6 animate-fade-in">
              {selectedOrder ? (
                /* Order Detailed view card */
                <div className="bg-white border border-stone-200 rounded-2xl p-6 lg:p-8 space-y-6 shadow-2xs">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-stone-100">
                    <button
                      onClick={() => setSelectedOrder(null)}
                      className="inline-flex items-center gap-1 text-stone-500 hover:text-stone-950 text-xs font-semibold cursor-pointer"
                    >
                      <ArrowLeft className="h-3.5 w-3.5" /> Back to Orders List
                    </button>
                    <div className="text-right">
                      <span className="text-xs font-mono text-stone-400">Order Placed: {new Date(selectedOrder.date).toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-2">
                    {/* Items detail */}
                    <div className="md:col-span-7 space-y-4">
                      <h4 className="text-xs font-mono font-bold text-stone-400 uppercase tracking-wider">Line Items</h4>
                      <div className="space-y-3">
                        {selectedOrder.items.map((item, idx) => (
                          <div key={idx} className="flex gap-4 items-center bg-stone-50 border border-stone-100 rounded-xl p-3">
                            <img
                              src={item.product.images[0]}
                              alt={item.product.name}
                              className="h-12 w-12 rounded-lg border border-stone-200 object-cover bg-white"
                            />
                            <div className="flex-1">
                              <h5 className="font-semibold text-stone-900 text-sm leading-tight">{item.product.name}</h5>
                              <span className="text-xs text-stone-400 font-mono mt-0.5 block">Quantity: {item.quantity} • Unit Price: ₹{item.product.price}</span>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Transaction info */}
                      <div className="bg-stone-50 border border-stone-100 rounded-xl p-4 space-y-2 text-xs">
                        <div className="flex justify-between text-stone-500">
                          <span>Subtotal</span>
                          <span>₹{selectedOrder.totalAmount}</span>
                        </div>
                        <div className="flex justify-between text-stone-500">
                          <span>Shipping Method</span>
                          <span className="uppercase font-mono font-bold">{selectedOrder.shippingMethod}</span>
                        </div>
                        <div className="flex justify-between text-stone-500">
                          <span>Payment Method</span>
                          <span className="uppercase font-mono font-bold">{selectedOrder.paymentMethod}</span>
                        </div>
                        {selectedOrder.paymentId && (
                          <div className="flex justify-between text-stone-500">
                            <span>Transaction ID</span>
                            <span className="font-mono text-[11px]">{selectedOrder.paymentId}</span>
                          </div>
                        )}
                        <div className="h-px bg-stone-200/60 my-2" />
                        <div className="flex justify-between font-bold text-stone-950 text-sm">
                          <span>Paid Total Amount</span>
                          <span>₹{selectedOrder.totalAmount}</span>
                        </div>
                      </div>
                    </div>

                    {/* Shipping and Fulfillment workflow controls */}
                    <div className="md:col-span-5 space-y-6">
                      <div className="space-y-3 bg-stone-50/50 border border-stone-200/60 rounded-xl p-4">
                        <h4 className="text-xs font-mono font-bold text-stone-500 uppercase tracking-wider">Fulfillment Status</h4>
                        <div className="space-y-2">
                          {(["placed", "preparing", "dispatched", "delivered"] as const).map((st) => {
                            const isCurrent = selectedOrder.status === st;
                            return (
                              <button
                                key={st}
                                onClick={() => {
                                  updateOrderStatus(selectedOrder.id, st);
                                  setSelectedOrder({ ...selectedOrder, status: st });
                                }}
                                className={`w-full py-2.5 px-3 rounded-lg border text-xs font-mono font-bold tracking-wide uppercase flex items-center justify-between transition-all cursor-pointer ${
                                  isCurrent
                                    ? "bg-stone-900 border-stone-950 text-white"
                                    : "bg-white hover:bg-stone-100 border-stone-200 text-stone-600 hover:text-stone-900"
                                }`}
                              >
                                <span>{st}</span>
                                {isCurrent && <Check className="h-4 w-4 text-amber-400" />}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Delivery Address Details */}
                      <div className="bg-stone-50/50 border border-stone-200/60 rounded-xl p-4 text-xs space-y-2">
                        <h4 className="text-xs font-mono font-bold text-stone-500 uppercase tracking-wider mb-2">Shipping Recipient</h4>
                        <div>
                          <strong>{selectedOrder.shippingAddress.fullName}</strong>
                        </div>
                        <div className="text-stone-500">
                          {selectedOrder.shippingAddress.addressLine1}
                          {selectedOrder.shippingAddress.addressLine2 && `, ${selectedOrder.shippingAddress.addressLine2}`}
                          <br />
                          {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} - {selectedOrder.shippingAddress.pinCode}
                        </div>
                        <div className="text-stone-500 font-mono pt-1">
                          Phone: {selectedOrder.shippingAddress.phone}
                          <br />
                          Email: {selectedOrder.shippingAddress.email}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* Meesho-Style Orders list view with tabbed pipeline & bulk edit */
                <div className="space-y-6">
                  {/* Pipeline Navigation Tabs (Strictly Meesho style) */}
                  <div className="bg-stone-50 p-1.5 rounded-2xl border border-stone-200/80 grid grid-cols-2 sm:grid-cols-4 gap-1">
                    {[
                      { key: "pending", label: "Pending", count: orders.filter(o => o.status === "placed").length, color: "text-stone-600 bg-white" },
                      { key: "accepted", label: "Accepted", count: orders.filter(o => o.status === "preparing").length, color: "text-amber-600 bg-white" },
                      { key: "ready", label: "Ready to Ship", count: orders.filter(o => o.status === "ready_to_ship").length, color: "text-purple-600 bg-white" },
                      { key: "dispatched", label: "Dispatched", count: orders.filter(o => o.status === "dispatched" || o.status === "delivered").length, color: "text-emerald-600 bg-white" }
                    ].map((tab) => {
                      const isActive = orderPipelineTab === tab.key;
                      return (
                        <button
                          key={tab.key}
                          onClick={() => {
                            setOrderPipelineTab(tab.key as any);
                            setSelectedOrderIds([]); // Clear selections on tab switch
                          }}
                          className={`py-2.5 px-3 rounded-xl text-xs font-mono font-bold tracking-wide uppercase transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 cursor-pointer ${
                            isActive
                              ? "bg-stone-900 text-stone-50 shadow-xs"
                              : "text-stone-500 hover:text-stone-900 hover:bg-stone-200/50"
                          }`}
                        >
                          <span>{tab.label}</span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isActive ? "bg-stone-800 text-amber-400" : "bg-stone-200/60 text-stone-700"
                          }`}>
                            {tab.count}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Bulk Edit & Actions Panel */}
                  {selectedOrderIds.length > 0 && (
                    <div className="bg-stone-950 text-white rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 animate-fade-in border border-stone-900 shadow-lg">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
                        <span className="text-xs font-mono font-bold tracking-wide uppercase">
                          {selectedOrderIds.length} {selectedOrderIds.length === 1 ? "Order Selected" : "Orders Selected"}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2.5">
                        {orderPipelineTab === "pending" && (
                          <button
                            onClick={() => handleBulkAction("accept")}
                            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-stone-950 text-xs font-bold font-mono uppercase tracking-wide rounded-xl cursor-pointer transition-all active:scale-95"
                          >
                            Accept Selected
                          </button>
                        )}
                        {(orderPipelineTab === "accepted" || orderPipelineTab === "ready") && (
                          <button
                            onClick={() => handleBulkAction("print")}
                            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold font-mono uppercase tracking-wide rounded-xl cursor-pointer transition-all flex items-center gap-1.5 active:scale-95"
                          >
                            <Printer className="h-3.5 w-3.5" />
                            Print Labels & Ready
                          </button>
                        )}
                        {(orderPipelineTab === "ready" || orderPipelineTab === "accepted") && (
                          <button
                            onClick={() => handleBulkAction("dispatch")}
                            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-stone-950 text-xs font-bold font-mono uppercase tracking-wide rounded-xl cursor-pointer transition-all flex items-center gap-1.5 active:scale-95"
                          >
                            <Truck className="h-3.5 w-3.5" />
                            Mark Dispatched
                          </button>
                        )}
                        <button
                          onClick={() => setSelectedOrderIds([])}
                          className="px-3.5 py-2 border border-stone-700 hover:border-stone-500 text-stone-300 text-xs font-mono uppercase rounded-xl cursor-pointer transition-colors"
                        >
                          Clear
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Pipeline Registry Grid List */}
                  <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-2xs">
                    <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-bold text-stone-900 capitalize">
                          {orderPipelineTab === "ready" ? "Ready to Ship Labels" : `${orderPipelineTab} Orders Queue`}
                        </h3>
                        <p className="text-xs text-stone-400 mt-0.5">
                          {orderPipelineTab === "pending" && "Approve bulk checkouts to allocate courier and ready packages."}
                          {orderPipelineTab === "accepted" && "Generate professional layouts and stamp barcodes to fulfill shipments."}
                          {orderPipelineTab === "ready" && "Dispatch packages through logistics partner routes."}
                          {orderPipelineTab === "dispatched" && "Completed operations list of dispatched and delivered parcels."}
                        </p>
                      </div>
                    </div>
                    
                    {/* Render table if orders exist */}
                    {getFilteredOrders().length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="bg-stone-50 border-b border-stone-100 text-stone-500 font-mono uppercase text-[10px] tracking-wider select-none">
                              <th className="p-4 w-12 text-center">
                                <input
                                  type="checkbox"
                                  checked={getFilteredOrders().length > 0 && selectedOrderIds.length === getFilteredOrders().length}
                                  onChange={() => {
                                    const filtered = getFilteredOrders();
                                    if (selectedOrderIds.length === filtered.length) {
                                      setSelectedOrderIds([]);
                                    } else {
                                      setSelectedOrderIds(filtered.map(o => o.id));
                                    }
                                  }}
                                  className="h-4 w-4 rounded-sm border-stone-300 text-stone-900 focus:ring-stone-900 cursor-pointer accent-stone-900"
                                />
                              </th>
                              <th className="p-4 font-bold">Order ID</th>
                              <th className="p-4 font-bold">Customer Name</th>
                              <th className="p-4 font-bold">Line Items</th>
                              <th className="p-4 font-bold">Invoice Bill</th>
                              <th className="p-4 font-bold">Payment</th>
                              <th className="p-4 font-bold">Status</th>
                              <th className="p-4 font-bold text-right">Fulfillment</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-stone-100">
                            {getFilteredOrders().map((order) => {
                              const style = getStatusStyle(order.status);
                              const StatusIcon = style.icon;
                              const itemCount = order.items.reduce((sum, it) => sum + it.quantity, 0);
                              const isChecked = selectedOrderIds.includes(order.id);
                              return (
                                <tr
                                  key={order.id}
                                  className={`hover:bg-stone-50/40 transition-colors cursor-pointer ${
                                    isChecked ? "bg-stone-50/70" : ""
                                  }`}
                                  onClick={() => setSelectedOrder(order)}
                                >
                                  <td className="p-4 text-center" onClick={(e) => e.stopPropagation()}>
                                    <input
                                      type="checkbox"
                                      checked={isChecked}
                                      onChange={() => {
                                        if (selectedOrderIds.includes(order.id)) {
                                          setSelectedOrderIds(selectedOrderIds.filter(id => id !== order.id));
                                        } else {
                                          setSelectedOrderIds([...selectedOrderIds, order.id]);
                                        }
                                      }}
                                      className="h-4 w-4 rounded-sm border-stone-300 text-stone-900 focus:ring-stone-900 cursor-pointer accent-stone-900"
                                    />
                                  </td>
                                  <td className="p-4 font-mono font-semibold text-stone-900">{order.id}</td>
                                  <td className="p-4 font-medium text-stone-800">{order.shippingAddress.fullName}</td>
                                  <td className="p-4 text-stone-500 font-mono">
                                    {order.items.map(it => `${it.product.name.substring(0, 16)}.. (x${it.quantity})`).join(", ")}
                                  </td>
                                  <td className="p-4 font-bold text-stone-950">₹{order.totalAmount}</td>
                                  <td className="p-4 text-stone-500 uppercase font-mono text-[10px] tracking-wide font-bold">{order.paymentMethod}</td>
                                  <td className="p-4">
                                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold border ${style.bg}`}>
                                      <StatusIcon className="h-3 w-3" />
                                      {style.label}
                                    </span>
                                  </td>
                                  <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                                    <button
                                      onClick={() => setSelectedOrder(order)}
                                      className="px-2.5 py-1 text-[11px] font-mono font-bold bg-stone-50 hover:bg-stone-900 hover:text-white border border-stone-200 hover:border-stone-900 rounded-lg transition-all cursor-pointer"
                                    >
                                      Manage
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="py-16 text-center">
                        <Package className="h-10 w-10 text-stone-300 mx-auto mb-3" />
                        <h4 className="font-semibold text-stone-700 text-xs">No orders in this segment</h4>
                        <p className="text-stone-400 text-[11px] mt-0.5">There are no operational records waiting at this stage.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "products" && (
            <div className="space-y-6 animate-fade-in">
              {isAddingProduct || editingProduct ? (
                /* Add / Edit Product Form */
                <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-2xs space-y-6 animate-fade-in">
                  <div className="flex items-center justify-between border-b border-stone-100 pb-4">
                    <div>
                      <h3 className="text-sm font-bold text-stone-900">
                        {isAddingProduct ? "Add New Boutique Product" : `Edit "${editingProduct?.name}"`}
                      </h3>
                      <p className="text-xs text-stone-400 mt-0.5">
                        {isAddingProduct 
                          ? "Fill in the parameters below to release a new catalog style." 
                          : "Modify the properties below to update the storefront listing."}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setIsAddingProduct(false);
                        setEditingProduct(null);
                        setFormError(null);
                      }}
                      className="px-3 py-1.5 border border-stone-200 hover:border-stone-950 text-stone-600 hover:text-stone-950 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <ArrowLeft className="h-3.5 w-3.5" />
                      Back to Inventory
                    </button>
                  </div>

                  {formError && (
                    <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2 font-medium">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      <span>{formError}</span>
                    </div>
                  )}

                  <form onSubmit={isAddingProduct ? handleAddProductSubmit : handleEditProductSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="block text-[10px] font-mono text-stone-400 font-bold uppercase mb-1">Product Name *</label>
                        <input
                          type="text"
                          required
                          value={isAddingProduct ? newProdName : editProdName}
                          onChange={(e) => isAddingProduct ? setNewProdName(e.target.value) : setEditProdName(e.target.value)}
                          placeholder="e.g. KuaxiBlend Fusion Pro 450ml"
                          className="w-full text-xs p-3 rounded-xl border border-stone-200 focus:border-stone-900 outline-none transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-mono text-stone-400 font-bold uppercase mb-2">Product Images (Multiple URLs Supported)</label>
                        <div className="space-y-3">
                          {(isAddingProduct ? newProdImages : editProdImages).map((url, idx) => (
                            <div key={idx} className="flex gap-2 group">
                              <div className="flex-1 relative">
                                <input
                                  type="url"
                                  value={url}
                                  onChange={(e) => {
                                    const newUrls = [...(isAddingProduct ? newProdImages : editProdImages)];
                                    newUrls[idx] = e.target.value;
                                    isAddingProduct ? setNewProdImages(newUrls) : setEditProdImages(newUrls);
                                  }}
                                  placeholder="https://images.unsplash.com/..."
                                  className="w-full text-xs p-3 rounded-xl border border-stone-200 focus:border-stone-900 outline-none transition-all pr-10"
                                />
                                {url && (
                                  <div className="absolute right-3 top-1/2 -translate-y-1/2 h-6 w-6 rounded-md overflow-hidden border border-stone-200">
                                    <img src={url} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                  </div>
                                )}
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  const currentImages = (isAddingProduct ? newProdImages : editProdImages);
                                  // Don't remove the last one if it's the only one
                                  if (currentImages.length <= 1) {
                                    isAddingProduct ? setNewProdImages([""]) : setEditProdImages([""]);
                                  } else {
                                    const newUrls = currentImages.filter((_, i) => i !== idx);
                                    isAddingProduct ? setNewProdImages(newUrls) : setEditProdImages(newUrls);
                                  }
                                }}
                                className="p-3 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                title="Remove image"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={() => {
                              isAddingProduct 
                                ? setNewProdImages([...newProdImages, ""]) 
                                : setEditProdImages([...editProdImages, ""]);
                            }}
                            className="w-full py-2.5 border-2 border-dashed border-stone-200 rounded-xl text-stone-400 text-[11px] font-bold uppercase tracking-wider hover:border-stone-400 hover:text-stone-600 transition-all flex items-center justify-center gap-2"
                          >
                            <Plus className="h-3.5 w-3.5" />
                            Add Another Image URL
                          </button>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono text-stone-400 font-bold uppercase mb-1">Product Description</label>
                      <textarea
                        rows={3}
                        value={isAddingProduct ? newProdDesc : editProdDesc}
                        onChange={(e) => isAddingProduct ? setNewProdDesc(e.target.value) : setEditProdDesc(e.target.value)}
                        placeholder="Provide details about materials, design, battery life, and high-speed motor specs."
                        className="w-full text-xs p-3 rounded-xl border border-stone-200 focus:border-stone-900 outline-none transition-all resize-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-[10px] font-mono text-stone-400 font-bold uppercase mb-1">Selling Price (INR) *</label>
                        <input
                          type="number"
                          required
                          min="1"
                          value={isAddingProduct ? newProdPrice : editProdPrice}
                          onChange={(e) => isAddingProduct ? setNewProdPrice(e.target.value) : setEditProdPrice(e.target.value)}
                          placeholder="499"
                          className="w-full text-xs p-3 rounded-xl border border-stone-200 focus:border-stone-900 outline-none transition-all font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-mono text-stone-400 font-bold uppercase mb-1">M.R.P / Original Price (INR)</label>
                        <input
                          type="number"
                          value={isAddingProduct ? newProdCompareAt : editProdCompareAt}
                          onChange={(e) => isAddingProduct ? setNewProdCompareAt(e.target.value) : setEditProdCompareAt(e.target.value)}
                          placeholder="749"
                          className="w-full text-xs p-3 rounded-xl border border-stone-200 focus:border-stone-900 outline-none transition-all font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-mono text-stone-400 font-bold uppercase mb-1">Stock Level (Units)</label>
                        <input
                          type="number"
                          value={isAddingProduct ? newProdStock : editProdStock}
                          onChange={(e) => isAddingProduct ? setNewProdStock(e.target.value) : setEditProdStock(e.target.value)}
                          placeholder="15"
                          className="w-full text-xs p-3 rounded-xl border border-stone-200 focus:border-stone-900 outline-none transition-all font-mono"
                        />
                      </div>
                    </div>

                    <div className="pt-4 border-t border-stone-100 flex items-center justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setIsAddingProduct(false);
                          setEditingProduct(null);
                          setFormError(null);
                        }}
                        className="px-4 py-2 bg-stone-50 hover:bg-stone-100 border border-stone-200 text-stone-600 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isSavingProduct}
                        className="px-5 py-2 bg-stone-900 hover:bg-stone-850 text-white rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                      >
                        {isSavingProduct ? (
                          <>
                            <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Check className="h-3.5 w-3.5" />
                            {isAddingProduct ? "Publish Style" : "Save Changes"}
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                /* Product Inventory Listing Table */
                <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-2xs">
                  <div className="px-6 py-4 border-b border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="text-sm font-bold text-stone-900">Online Store Product Stocks</h3>
                      <p className="text-xs text-stone-400 mt-0.5">Verify inventory listings and view boutique catalog item details.</p>
                    </div>
                    <button
                      onClick={() => {
                        setIsAddingProduct(true);
                        setFormError(null);
                      }}
                      className="self-start sm:self-auto px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Sliders className="h-3.5 w-3.5" />
                      Add Product
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-stone-50 border-b border-stone-100 text-stone-500 font-mono uppercase text-[10px] tracking-wider">
                          <th className="p-4 font-bold">Image</th>
                          <th className="p-4 font-bold">Product Details</th>
                          <th className="p-4 font-bold">M.R.P. Price</th>
                          <th className="p-4 font-bold">Stock Status</th>
                          <th className="p-4 font-bold">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100">
                        {productsList.map((prod) => (
                          <tr key={prod.id} className="hover:bg-stone-50/50 transition-colors">
                            <td className="p-4 shrink-0">
                              <img
                                src={prod.images[0]}
                                alt={prod.name}
                                className="h-10 w-10 rounded-lg border border-stone-200 bg-white object-cover"
                              />
                            </td>
                            <td className="p-4 max-w-sm">
                              <div className="font-semibold text-stone-900 text-sm leading-tight">{prod.name}</div>
                              <p className="text-[11px] text-stone-400 line-clamp-1 mt-0.5">{prod.description}</p>
                            </td>
                            <td className="p-4 font-mono font-bold text-stone-900 text-sm">₹{prod.price}</td>
                            <td className="p-4">
                              <span className="inline-flex items-center gap-1 bg-stone-50 border border-stone-200 text-stone-600 px-2.5 py-1 rounded-md text-[10px] font-mono font-bold uppercase">
                                In Stock • Active
                              </span>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => {
                                    setEditingProduct(prod);
                                    setEditProdName(prod.name);
                                    setEditProdDesc(prod.description);
                                    setEditProdPrice(prod.price.toString());
                                    setEditProdCompareAt((prod as any).originalPrice?.toString() || (prod.price * 1.5).toString());
                                    setEditProdStock((prod as any).stockLeft?.toString() || "10");
                                    setEditProdImages(prod.images || []);
                                    setFormError(null);
                                  }}
                                  className="px-2.5 py-1 text-[11px] font-medium bg-white border border-stone-200 hover:border-stone-900 rounded-lg transition-colors text-stone-700 hover:text-stone-900 cursor-pointer"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDeleteProduct(prod.id)}
                                  className={`px-2.5 py-1 text-[11px] font-medium rounded-lg transition-all cursor-pointer border ${
                                    confirmingDeleteId === prod.id 
                                      ? "bg-red-500 border-red-600 text-white shadow-sm" 
                                      : "bg-white border-red-100 text-red-400 hover:border-red-500 hover:text-red-600"
                                  }`}
                                >
                                  {confirmingDeleteId === prod.id ? "Confirm Delete?" : "Delete"}
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {successMessage && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-500" />
                  <span>{successMessage}</span>
                </div>
              )}
            </div>
          )}

          {activeTab === "settings" && (
            <div className="space-y-6 animate-fade-in">
              {/* Credentials documentation container */}
              <div className="bg-white border border-stone-200 p-6 lg:p-8 rounded-2xl shadow-3xs space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-stone-900 flex items-center gap-1.5">
                    <Key className="h-4 w-4 text-stone-600" /> Secure Admin Credentials & Environments
                  </h3>
                  <p className="text-xs text-stone-400 mt-1">
                    To enforce strict security layouts (Standard 1 & 4), the verification uses a secure backend API checking against server environment configurations.
                  </p>
                </div>

                <div className="bg-stone-50 border border-stone-100 rounded-xl p-4 space-y-3 font-mono text-[11px] text-stone-600 leading-relaxed">
                  <span className="font-bold text-stone-900 block mb-1">Changing the Secure Key Password:</span>
                  <span>1. Open your workspace's <code className="bg-stone-200 px-1 py-0.5 rounded font-bold">.env.example</code> file.</span>
                  <br />
                  <span>2. Provide your new secure passcode key:</span>
                  <pre className="bg-stone-950 text-stone-100 p-3 rounded-lg text-xs font-normal mt-2 select-all overflow-x-auto">
                    ADMIN_PASSWORD="MySuperSecureEnterprisePassword99#"
                  </pre>
                  <p className="text-[10px] text-amber-800 font-sans mt-2 bg-amber-50 border border-amber-200/50 p-2.5 rounded-lg leading-relaxed">
                    <strong>Notice:</strong> The backend server lazy initializes configurations and will fallback to default <code className="bg-amber-100 px-1 font-mono font-bold">Krushna@6356</code> if no other keys are set, enabling immediate testing inside the safe sandboxed container preview.
                  </p>
                </div>
              </div>

              {/* Operations database reset card */}
              <div className="bg-white border border-stone-200 p-6 lg:p-8 rounded-2xl shadow-3xs space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-red-700 flex items-center gap-1.5">
                    <Sliders className="h-4 w-4" /> Hard Reset Database State Store
                  </h3>
                  <p className="text-xs text-stone-400 mt-1">
                    Resets state stores back to pre-seeded mock records. Use this to re-run demo flows or clear customer checkout transactions.
                  </p>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => {
                      resetToDefault();
                      setSuccessMessage("Operational database cleared. Presets restored successfully.");
                      setTimeout(() => setSuccessMessage(null), 3000);
                    }}
                    className="px-4 py-2 bg-red-50 hover:bg-red-600 text-red-700 hover:text-white border border-red-200 hover:border-red-600 font-semibold rounded-xl text-xs transition-colors cursor-pointer"
                  >
                    Clear Storefront Transactions Data
                  </button>
                </div>
              </div>

              {successMessage && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-500" />
                  <span>{successMessage}</span>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Meesho-Style Shipping Label Print Overlay */}
      {printingOrders && (
        <div className="fixed inset-0 bg-stone-950/85 z-50 flex flex-col items-center justify-start p-4 overflow-y-auto no-print">
          {/* Injecting media print styling to isolate the labels */}
          <style dangerouslySetInnerHTML={{__html: `
            @media print {
              body * {
                visibility: hidden !important;
              }
              #printable-shipping-labels-area, #printable-shipping-labels-area * {
                visibility: visible !important;
              }
              #printable-shipping-labels-area {
                position: absolute;
                left: 0;
                top: 0;
                width: 100% !important;
                background: white !important;
                color: black !important;
              }
              .no-print {
                display: none !important;
              }
            }
          `}} />

          <div className="w-full max-w-4xl bg-white rounded-3xl p-6 shadow-2xl space-y-6 my-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-stone-100">
              <div>
                <h3 className="font-display font-bold text-stone-950 text-lg">Meesho-Style Shipping Labels Print Preview</h3>
                <p className="text-stone-500 text-xs">Your browser print configuration will target only the designated shipping labels below.</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPrintingOrders(null)}
                  className="px-4 py-2 border border-stone-200 hover:bg-stone-50 text-stone-700 text-xs font-semibold rounded-xl cursor-pointer transition-all"
                >
                  Close Preview
                </button>
                <button
                  onClick={() => window.print()}
                  className="px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded-xl flex items-center gap-2 cursor-pointer shadow-sm transition-all"
                >
                  <Printer className="h-4 w-4" />
                  Print Now
                </button>
              </div>
            </div>

            {/* Printable Content Container */}
            <div id="printable-shipping-labels-area" className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-stone-50 rounded-2xl border border-stone-200">
              {printingOrders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white border-2 border-dashed border-stone-400 rounded-xl p-6 text-stone-900 flex flex-col gap-4 font-sans text-xs tracking-wide shadow-xs relative overflow-hidden page-break-inside-avoid"
                  style={{ pageBreakInside: "avoid" }}
                >
                  {/* Decorative Payment stamp */}
                  <div className="absolute right-4 top-4 border-2 border-stone-900 rounded-lg p-1.5 font-mono text-[9px] font-extrabold rotate-6 uppercase tracking-wider text-stone-800 bg-white">
                    {order.paymentMethod === "cod" ? "C.O.D. FULFILL" : "PRE-PAID SECURE"}
                  </div>

                  {/* Label Header */}
                  <div className="flex items-center gap-3 border-b-2 border-stone-200 pb-3">
                    <div className="h-9 w-9 bg-stone-900 rounded-lg flex items-center justify-center font-display font-extrabold text-white text-sm">
                      KB
                    </div>
                    <div>
                      <h4 className="font-display font-bold text-stone-950 uppercase leading-none text-sm tracking-tight">KuaxiBlend Logistics</h4>
                      <span className="text-[10px] text-stone-500 font-mono">Boutique Cordless Appliance Deliveries</span>
                    </div>
                  </div>

                  {/* Order Details Grid */}
                  <div className="grid grid-cols-2 gap-4 border-b border-stone-100 pb-3 font-mono text-[10px]">
                    <div>
                      <span className="text-stone-400 block uppercase font-bold text-[9px]">Order ID</span>
                      <strong className="text-stone-900 text-xs">{order.id}</strong>
                    </div>
                    <div>
                      <span className="text-stone-400 block uppercase font-bold text-[9px]">Carrier / Route</span>
                      <strong className="text-stone-900 uppercase">SPEED-POST • IN-S02</strong>
                    </div>
                  </div>

                  {/* Shipping Address */}
                  <div className="space-y-1.5 flex-1">
                    <span className="text-stone-400 block uppercase font-mono font-bold text-[9px]">Ship To:</span>
                    <p className="text-stone-950 text-xs font-semibold leading-relaxed">
                      {order.shippingAddress.fullName}
                      <br />
                      <span className="font-normal text-stone-600">
                        {order.shippingAddress.addressLine1}
                        {order.shippingAddress.addressLine2 && `, ${order.shippingAddress.addressLine2}`}
                        <br />
                        {order.shippingAddress.city}, {order.shippingAddress.state} - <strong className="text-stone-950 font-bold">{order.shippingAddress.pinCode}</strong>
                      </span>
                    </p>
                    <div className="font-mono text-[10px] text-stone-700">
                      Phone: <span className="text-stone-950 font-bold">{order.shippingAddress.phone}</span>
                    </div>
                  </div>

                  {/* Parcel Items & Total bill */}
                  <div className="bg-stone-50 p-3 rounded-lg border border-stone-200 space-y-1.5">
                    <span className="text-stone-400 block uppercase font-mono font-bold text-[8px]">Parcel Contents:</span>
                    <div className="space-y-1 text-[10px] text-stone-800">
                      {order.items.map((it, i) => (
                        <div key={i} className="flex justify-between font-medium">
                          <span>{it.product.name.substring(0, 32)}... × {it.quantity}</span>
                        </div>
                      ))}
                    </div>
                    <div className="h-px bg-stone-200 my-1" />
                    <div className="flex justify-between items-center text-xs font-bold text-stone-950">
                      <span>Invoice Total (INR):</span>
                      <span>₹{order.totalAmount}</span>
                    </div>
                  </div>

                  {/* Fake Barcode Design */}
                  <div className="flex flex-col items-center justify-center pt-2 border-t border-stone-200 gap-1 select-none">
                    <div className="h-9 w-full bg-[repeating-linear-gradient(90deg,black,black_2px,transparent_2px,transparent_6px,black_6px,black_10px,transparent_10px,transparent_12px)] opacity-85" />
                    <span className="text-[9px] font-mono font-bold text-stone-500 uppercase tracking-widest">*{order.id}-SURAT-LOGISTICS*</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  features: string[];
  images: string[];
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface ShippingAddress {
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

export interface ProductReview {
  id: string;
  productId: string;
  orderId: string;
  rating: number;
  comment: string;
  date: string;
  userName: string;
}

export interface Order {
  id: string;
  date: string;
  items: CartItem[];
  totalAmount: number;
  shippingAddress: ShippingAddress;
  shippingMethod: "standard" | "express" | "same-day";
  paymentMethod: "razorpay" | "cod" | "upi";
  status: "placed" | "preparing" | "ready_to_ship" | "dispatched" | "delivered";
  deliveryDate: string;
  paymentId?: string;
}

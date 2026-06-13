/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = "recipient" | "restaurant";

export interface User {
  uid: string;
  email: string;
  name: string;
  role: UserRole;
  avatar: string;
  points: number; // For gamification / SDG advocacy
  isPremium?: boolean; // For restaurant subscription model
  savedCO2?: number; // recipient carbon offsets (in kg)
}

export interface FoodListing {
  id: string;
  restaurantId: string;
  restaurantName: string;
  restaurantAddress: string;
  lat: number;
  lng: number;
  title: string;
  description: string;
  category: "bakery" | "meal" | "grocery" | "dessert";
  originalPrice: number; // in RM (Malaysian Ringgit as UTHM is in Malaysia)
  discountedPrice: number; // 0 for free, or small fee, or subscription model
  quantity: number;
  durationLeft: number; // in minutes
  expiryTime: string; // e.g., "7:30 PM Today"
  dietaryTags: string[]; // e.g. ["Halal", "Vegan", "Gluten-Free"]
  imageUrl: string;
  co2Saved: number; // in kg
  status: "available" | "claimed" | "completed";
}

export interface Reservation {
  id: string;
  listingId: string;
  listingTitle: string;
  restaurantName: string;
  recipientId: string;
  recipientName: string;
  quantity: number;
  totalPrice: number;
  pickupCode: string; // 4 digit pass code
  createdAt: string;
  status: "reserved" | "completed" | "cancelled";
}

export interface EcoNotification {
  id: string;
  title: string;
  message: string;
  type: "success" | "warning" | "info";
  timestamp: string;
}

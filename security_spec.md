# Security Specification (TDD Rules Validation)

This document maps out the specific data security invariants enforced by `firestore.rules` and demonstrates the "Dirty Dozen" theoretical exploit payloads that would be blocked.

## 1. Core Data Invariants

- **Invariant A**: User emails, roles, and profiles are read-locked. A user cannot query another user's private credentials or spoof usernames.
- **Invariant B**: Only authenticated food merchants can publish listings, and they can only delete, update or modify their own listings.
- **Invariant C**: Customers/recipients are restricted to changing only physical quantity count and availability status on food listings (and only to valid numbers).
- **Invariant D**: A transaction/reservation can only be created if it is associated with a valid, available surplus listing.
- **Invariant E**: A reservation state can only transition to a completed/cancelled state; users are strictly blocked from editing codes or names thereafter.

---

## 2. The "Dirty Dozen" Adversarial Payloads & Defense Matrix

| ID | Attack Target | Payload / Action attempted | Rule Gate Blocking Access | Status |
|---|---|---|---|---|
| **01** | User profile | Set points to `100000` during profile creation | `request.resource.data.points == 0` | 🛑 Blocked |
| **02** | User profile | Spoof user UID or identity to matching admin | `userId == request.auth.uid` | 🛑 Blocked |
| **03** | User profile | Change user role from `recipient` to `restaurant` | `request.resource.data.role == existing().role` | 🛑 Blocked |
| **04** | FoodListing | Create listing using another merchant's `restaurantId` | `request.resource.data.restaurantId == request.auth.uid` | 🛑 Blocked |
| **05** | FoodListing | Client pushes a massive 1MB string inside `listingId` | `isValidId(listingId)` | 🛑 Blocked |
| **06** | FoodListing | Consumer changes the `originalPrice` of a meal | `affectedKeys().hasOnly(['quantity', 'status'])` | 🛑 Blocked |
| **07** | Reservation | Create a reservation without an existing listing | `exists(/databases/$(database)/documents/listings/...)` | 🛑 Blocked |
| **08** | Reservation | Reserve items under a fictitious `recipientId` | `request.resource.data.recipientId == request.auth.uid` | 🛑 Blocked |
| **09** | Reservation | Complete reservation of a claimed/depleted food listing | `get(/listings/...).data.status == "available"` | 🛑 Blocked |
| **10** | Reservation | Update a completed reservation's `pickupCode` | `affectedKeys().hasOnly(['status'])` | 🛑 Blocked |
| **11** | User PII Leak | Run `list` query across `users` collection without IDs | `resource.data.uid == request.auth.uid` | 🛑 Blocked |
| **12** | Database Spam | Inject a "Ghost Field" (e.g. `isAdmin: true`) to listing | `isValidListing() && affectedKeys().hasOnly(...)` | 🛑 Blocked |

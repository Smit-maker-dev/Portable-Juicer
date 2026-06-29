# Firestore Security Specification

This document details the security spec and threat model for the KuaxiBlend e-commerce Firestore database.

## 1. Data Invariants
- **Orders Collection (`/orders/{orderId}`)**:
  - Only authenticated users can create orders.
  - An order can only be created with a `userId` matching the request's authenticated UID (`request.auth.uid`).
  - Read access to a document is strictly isolated: users can only read or list their own orders (`resource.data.userId == request.auth.uid`).
  - Users are not allowed to update or delete orders after creation to preserve financial/transaction records. Only authorized system updates are permitted (or simulation steps, gated securely).

- **Reviews Collection (`/reviews/{reviewId}`)**:
  - Anyone (even unauthenticated guest users) can read the product reviews to support social proof on product listings.
  - Only authenticated users can write reviews.
  - The review must have a `userId` matching `request.auth.uid`.
  - Review ratings must be bounded between 1 and 5.
  - Users can only delete or edit their own reviews.

## 2. The "Dirty Dozen" Threat Payloads
Here are 12 malicious payloads that our security rules must strictly block:

1. **Identity Spoofing on Order (Write)**: Creating an order under another user's `userId`.
2. **PII Leakage on Orders (Read)**: Querying or reading orders belonging to another customer.
3. **Blanket Read Exploit on Orders**: Fetching all orders without a secure query constraint.
4. **Order Deletion Exploit**: An attacker attempts to delete their order or someone else's order.
5. **Unauthorized Status Modification (Write/Update)**: A user attempts to change their order status directly to "delivered" via Client SDK.
6. **Self-Appointed Reviewer Spoofing**: Attempting to post a product review under another person's name or authenticated UID.
7. **Negative/Over-blown Ratings (Validation Check)**: Posting a review with 10 stars or -5 stars.
8. **Massive Character Payload (Buffer Exhaustion / denial-of-wallet)**: Posting a 1MB text comment in reviews.
9. **No-auth Review Submission**: Posting a review without being logged in.
10. **Malicious Document ID Injection**: Injected long and hazardous chars as document ID.
11. **Immutability Bypass**: Trying to change the `productId` or `orderId` in a posted review.
12. **System Role Escalation**: Writing custom claims or modifying `role` fields via client updates.

## 3. Security Rules Validation Test Runner
We will configure and deploy the rules in `firestore.rules`.

import { pgTable, text, serial, integer, boolean, decimal, timestamp, json, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Role enum for user types
export const roleEnum = pgEnum('role', ['customer', 'farmer', 'delivery']);

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: roleEnum("role").notNull(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  phone: text("phone"),
  address: text("address"),
  profileImage: text("profile_image"),
});

// Product categories
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  icon: text("icon").notNull(),
  color: text("color").notNull(),
});

// Products table
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  unit: text("unit").notNull(),
  imageUrls: text("image_urls").array(),
  stock: integer("stock").notNull().default(0),
  categoryId: integer("category_id").notNull(),
  farmerId: integer("farmer_id").notNull(),
  organic: boolean("organic").default(false),
  featured: boolean("featured").default(false),
});

// Order status enum
export const orderStatusEnum = pgEnum('order_status', ['pending', 'confirmed', 'processing', 'out_for_delivery', 'delivered', 'cancelled']);

// Orders table
export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").notNull(),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  status: orderStatusEnum("status").notNull().default('pending'),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  deliveryAddress: text("delivery_address").notNull(),
  deliveryNotes: text("delivery_notes"),
  deliveryPersonId: integer("delivery_person_id"),
  estimatedDelivery: timestamp("estimated_delivery"),
});

// Order items table
export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull(),
  productId: integer("product_id").notNull(),
  quantity: integer("quantity").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
});

// Cart items table
export const cartItems = pgTable("cart_items", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  productId: integer("product_id").notNull(),
  quantity: integer("quantity").notNull(),
});

// Delivery routes table
export const deliveries = pgTable("deliveries", {
  id: serial("id").primaryKey(),
  deliveryPersonId: integer("delivery_person_id").notNull(),
  orderId: integer("order_id").notNull(),
  status: orderStatusEnum("status").notNull().default('confirmed'),
  scheduledTime: timestamp("scheduled_time"),
  startTime: timestamp("start_time"),
  completedTime: timestamp("completed_time"),
  routeInfo: json("route_info"),
});

// Payment methods enum
export const paymentMethodEnum = pgEnum('payment_method', ['credit_card', 'paypal', 'mobile_wallet', 'bank_transfer']);

// Payment status enum
export const paymentStatusEnum = pgEnum('payment_status', ['pending', 'completed', 'failed', 'refunded']);

// Rating enum (1-5 stars)
export const ratingEnum = pgEnum('rating', ['1', '2', '3', '4', '5']);

// Reviews table
export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull(),
  userId: integer("user_id").notNull(),
  rating: ratingEnum("rating").notNull(),
  comment: text("comment"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  helpful: integer("helpful").default(0),
  isVerifiedPurchase: boolean("is_verified_purchase").default(false),
});

// Product Recommendations table
export const productRecommendations = pgTable("product_recommendations", {
  id: serial("id").primaryKey(),
  sourceProductId: integer("source_product_id").notNull(),
  recommendedProductId: integer("recommended_product_id").notNull(),
  score: decimal("score", { precision: 5, scale: 2 }).notNull(),
  reason: text("reason"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Payments table
export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  method: paymentMethodEnum("method").notNull(),
  status: paymentStatusEnum("status").notNull().default('pending'),
  transactionId: text("transaction_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  paymentDetails: json("payment_details"),
  tipAmount: decimal("tip_amount", { precision: 10, scale: 2 }).default('0'),
});

// Subscription tiers enum
export const subscriptionTierEnum = pgEnum('subscription_tier', ['basic', 'premium', 'pro']);

// Subscription table for farmers
export const subscriptions = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  farmerId: integer("farmer_id").notNull().unique(),
  tier: subscriptionTierEnum("tier").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  startDate: timestamp("start_date").notNull().defaultNow(),
  endDate: timestamp("end_date").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  autoRenew: boolean("auto_renew").notNull().default(true),
  features: json("features"),
});

// Subscription payment history
export const subscriptionPayments = pgTable("subscription_payments", {
  id: serial("id").primaryKey(),
  subscriptionId: integer("subscription_id").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  method: paymentMethodEnum("method").notNull(),
  status: paymentStatusEnum("status").notNull().default('pending'),
  transactionId: text("transaction_id"),
  billingDate: timestamp("billing_date").notNull().defaultNow(),
  details: json("details"),
});

// Schemas for insertion
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  role: true,
  email: true,
  name: true,
  phone: true,
  address: true,
  profileImage: true,
});

export const insertProductSchema = createInsertSchema(products).pick({
  name: true,
  description: true,
  price: true,
  unit: true,
  imageUrls: true,
  stock: true,
  categoryId: true,
  farmerId: true,
  organic: true,
  featured: true,
});

export const insertCategorySchema = createInsertSchema(categories).pick({
  name: true,
  icon: true,
  color: true,
});

export const insertOrderSchema = createInsertSchema(orders).pick({
  customerId: true,
  totalAmount: true,
  status: true,
  deliveryAddress: true,
  deliveryNotes: true,
});

export const insertOrderItemSchema = createInsertSchema(orderItems).pick({
  orderId: true,
  productId: true,
  quantity: true,
  price: true,
});

export const insertCartItemSchema = createInsertSchema(cartItems).pick({
  userId: true,
  productId: true,
  quantity: true,
});

export const insertDeliverySchema = createInsertSchema(deliveries).pick({
  deliveryPersonId: true,
  orderId: true,
  status: true,
  scheduledTime: true,
  routeInfo: true,
});

export const insertPaymentSchema = createInsertSchema(payments).pick({
  orderId: true,
  amount: true,
  method: true,
  status: true,
  transactionId: true,
  paymentDetails: true,
  tipAmount: true,
});

export const insertSubscriptionSchema = createInsertSchema(subscriptions).pick({
  farmerId: true,
  tier: true,
  price: true,
  startDate: true,
  endDate: true,
  isActive: true,
  autoRenew: true,
  features: true,
});

export const insertSubscriptionPaymentSchema = createInsertSchema(subscriptionPayments).pick({
  subscriptionId: true,
  amount: true,
  method: true,
  status: true,
  transactionId: true,
  billingDate: true,
  details: true,
});

// Insert schema for reviews
export const insertReviewSchema = createInsertSchema(reviews).pick({
  productId: true,
  userId: true,
  rating: true,
  comment: true,
  isVerifiedPurchase: true,
});

// Insert schema for product recommendations
export const insertProductRecommendationSchema = createInsertSchema(productRecommendations).pick({
  sourceProductId: true,
  recommendedProductId: true,
  score: true,
  reason: true,
});

// Type exports
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof products.$inferSelect;

export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Category = typeof categories.$inferSelect;

export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof orders.$inferSelect;

export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;
export type OrderItem = typeof orderItems.$inferSelect;

export type InsertCartItem = z.infer<typeof insertCartItemSchema>;
export type CartItem = typeof cartItems.$inferSelect;

export type InsertDelivery = z.infer<typeof insertDeliverySchema>;
export type Delivery = typeof deliveries.$inferSelect;

export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type Payment = typeof payments.$inferSelect;

export type InsertSubscription = z.infer<typeof insertSubscriptionSchema>;
export type Subscription = typeof subscriptions.$inferSelect;

export type InsertSubscriptionPayment = z.infer<typeof insertSubscriptionPaymentSchema>;
export type SubscriptionPayment = typeof subscriptionPayments.$inferSelect;

export type InsertReview = z.infer<typeof insertReviewSchema>;
export type Review = typeof reviews.$inferSelect;

export type InsertProductRecommendation = z.infer<typeof insertProductRecommendationSchema>;
export type ProductRecommendation = typeof productRecommendations.$inferSelect;

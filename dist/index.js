var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/storage.ts
var MemStorage, storage;
var init_storage = __esm({
  "server/storage.ts"() {
    "use strict";
    MemStorage = class {
      users;
      products;
      categories;
      orders;
      orderItems;
      cartItems;
      deliveries;
      payments;
      subscriptions;
      subscriptionPayments;
      reviews;
      productRecommendations;
      userCurrentId;
      productCurrentId;
      categoryCurrentId;
      orderCurrentId;
      orderItemCurrentId;
      cartItemCurrentId;
      deliveryCurrentId;
      paymentCurrentId;
      subscriptionCurrentId;
      subscriptionPaymentCurrentId;
      reviewCurrentId;
      productRecommendationCurrentId;
      constructor() {
        this.users = /* @__PURE__ */ new Map();
        this.products = /* @__PURE__ */ new Map();
        this.categories = /* @__PURE__ */ new Map();
        this.orders = /* @__PURE__ */ new Map();
        this.orderItems = /* @__PURE__ */ new Map();
        this.cartItems = /* @__PURE__ */ new Map();
        this.deliveries = /* @__PURE__ */ new Map();
        this.payments = /* @__PURE__ */ new Map();
        this.subscriptions = /* @__PURE__ */ new Map();
        this.subscriptionPayments = /* @__PURE__ */ new Map();
        this.reviews = /* @__PURE__ */ new Map();
        this.productRecommendations = /* @__PURE__ */ new Map();
        this.userCurrentId = 1;
        this.productCurrentId = 1;
        this.categoryCurrentId = 1;
        this.orderCurrentId = 1;
        this.orderItemCurrentId = 1;
        this.cartItemCurrentId = 1;
        this.deliveryCurrentId = 1;
        this.paymentCurrentId = 1;
        this.subscriptionCurrentId = 1;
        this.subscriptionPaymentCurrentId = 1;
        this.reviewCurrentId = 1;
        this.productRecommendationCurrentId = 1;
        this.initializeCategories();
      }
      initializeCategories() {
        const defaultCategories = [
          { name: "Vegetables", icon: "carrot", color: "#2C7A39" },
          { name: "Fruits", icon: "apple-alt", color: "#DC3545" },
          { name: "Dairy", icon: "egg", color: "#F7B538" },
          { name: "Grains", icon: "wheat-awn", color: "#D4A24C" },
          { name: "Herbs", icon: "seedling", color: "#28A745" }
        ];
        defaultCategories.forEach((category) => {
          this.createCategory(category);
        });
      }
      // User operations
      async getUser(id) {
        return this.users.get(id);
      }
      async getUserByUsername(username) {
        return Array.from(this.users.values()).find(
          (user) => user.username === username
        );
      }
      async getUsersByRole(role) {
        return Array.from(this.users.values()).filter((user) => user.role === role);
      }
      async createUser(user) {
        const id = this.userCurrentId++;
        const newUser = { ...user, id };
        this.users.set(id, newUser);
        return newUser;
      }
      async updateUser(id, updates) {
        const user = this.users.get(id);
        if (!user) return void 0;
        const updatedUser = { ...user, ...updates };
        this.users.set(id, updatedUser);
        return updatedUser;
      }
      // Product operations
      async getProduct(id) {
        return this.products.get(id);
      }
      async getProducts(limit = 100, offset = 0) {
        return Array.from(this.products.values()).slice(offset, offset + limit);
      }
      async getProductsByCategory(categoryId) {
        return Array.from(this.products.values()).filter((product) => product.categoryId === categoryId);
      }
      async getProductsByFarmer(farmerId) {
        return Array.from(this.products.values()).filter((product) => product.farmerId === farmerId);
      }
      async getFeaturedProducts() {
        return Array.from(this.products.values()).filter((product) => product.featured);
      }
      async createProduct(product) {
        const id = this.productCurrentId++;
        const newProduct = { ...product, id };
        this.products.set(id, newProduct);
        return newProduct;
      }
      async updateProduct(id, updates) {
        const product = this.products.get(id);
        if (!product) return void 0;
        const updatedProduct = { ...product, ...updates };
        this.products.set(id, updatedProduct);
        return updatedProduct;
      }
      async deleteProduct(id) {
        return this.products.delete(id);
      }
      // Category operations
      async getCategory(id) {
        return this.categories.get(id);
      }
      async getCategories() {
        return Array.from(this.categories.values());
      }
      async createCategory(category) {
        const id = this.categoryCurrentId++;
        const newCategory = { ...category, id };
        this.categories.set(id, newCategory);
        return newCategory;
      }
      // Order operations
      async getOrder(id) {
        return this.orders.get(id);
      }
      async getOrdersByCustomer(customerId) {
        return Array.from(this.orders.values()).filter((order) => order.customerId === customerId);
      }
      async getOrdersByDeliveryPerson(deliveryPersonId) {
        return Array.from(this.orders.values()).filter((order) => order.deliveryPersonId === deliveryPersonId);
      }
      async createOrder(order) {
        const id = this.orderCurrentId++;
        const createdAt = /* @__PURE__ */ new Date();
        const newOrder = { ...order, id, createdAt };
        this.orders.set(id, newOrder);
        return newOrder;
      }
      async updateOrderStatus(id, status) {
        const order = this.orders.get(id);
        if (!order) return void 0;
        const updatedOrder = { ...order, status };
        this.orders.set(id, updatedOrder);
        return updatedOrder;
      }
      async assignDeliveryPerson(id, deliveryPersonId) {
        const order = this.orders.get(id);
        if (!order) return void 0;
        const updatedOrder = { ...order, deliveryPersonId };
        this.orders.set(id, updatedOrder);
        return updatedOrder;
      }
      // Order item operations
      async getOrderItems(orderId) {
        return Array.from(this.orderItems.values()).filter((item) => item.orderId === orderId);
      }
      async createOrderItem(orderItem) {
        const id = this.orderItemCurrentId++;
        const newOrderItem = { ...orderItem, id };
        this.orderItems.set(id, newOrderItem);
        return newOrderItem;
      }
      // Cart operations
      async getCartItems(userId) {
        return Array.from(this.cartItems.values()).filter((item) => item.userId === userId);
      }
      async addCartItem(cartItem) {
        const existingItem = Array.from(this.cartItems.values()).find((item) => item.userId === cartItem.userId && item.productId === cartItem.productId);
        if (existingItem) {
          return this.updateCartItemQuantity(existingItem.id, existingItem.quantity + cartItem.quantity);
        }
        const id = this.cartItemCurrentId++;
        const newCartItem = { ...cartItem, id };
        this.cartItems.set(id, newCartItem);
        return newCartItem;
      }
      async updateCartItemQuantity(id, quantity) {
        const cartItem = this.cartItems.get(id);
        if (!cartItem) return void 0;
        const updatedCartItem = { ...cartItem, quantity };
        this.cartItems.set(id, updatedCartItem);
        return updatedCartItem;
      }
      async removeCartItem(id) {
        return this.cartItems.delete(id);
      }
      async clearCart(userId) {
        const userCartItems = Array.from(this.cartItems.values()).filter((item) => item.userId === userId);
        userCartItems.forEach((item) => this.cartItems.delete(item.id));
        return true;
      }
      // Delivery operations
      async getDelivery(id) {
        return this.deliveries.get(id);
      }
      async getDeliveriesByDeliveryPerson(deliveryPersonId) {
        return Array.from(this.deliveries.values()).filter((delivery) => delivery.deliveryPersonId === deliveryPersonId);
      }
      async createDelivery(delivery) {
        const id = this.deliveryCurrentId++;
        const newDelivery = { ...delivery, id };
        this.deliveries.set(id, newDelivery);
        return newDelivery;
      }
      async updateDeliveryStatus(id, status) {
        const delivery = this.deliveries.get(id);
        if (!delivery) return void 0;
        const updatedDelivery = { ...delivery, status };
        this.deliveries.set(id, updatedDelivery);
        return updatedDelivery;
      }
      async updateDeliveryTimes(id, updates) {
        const delivery = this.deliveries.get(id);
        if (!delivery) return void 0;
        const updatedDelivery = { ...delivery, ...updates };
        this.deliveries.set(id, updatedDelivery);
        return updatedDelivery;
      }
      // Payment operations
      async getPayment(id) {
        return this.payments.get(id);
      }
      async getPayments(limit = 100, offset = 0) {
        return Array.from(this.payments.values()).slice(offset, offset + limit);
      }
      async getPaymentsByOrder(orderId) {
        return Array.from(this.payments.values()).filter((payment) => payment.orderId === orderId);
      }
      async createPayment(payment) {
        const id = this.paymentCurrentId++;
        const createdAt = /* @__PURE__ */ new Date();
        const newPayment = { ...payment, id, createdAt };
        this.payments.set(id, newPayment);
        return newPayment;
      }
      async updatePaymentStatus(id, status) {
        const payment = this.payments.get(id);
        if (!payment) return void 0;
        const updatedPayment = { ...payment, status };
        this.payments.set(id, updatedPayment);
        return updatedPayment;
      }
      // Subscription operations
      async getSubscription(id) {
        return this.subscriptions.get(id);
      }
      async getSubscriptionByFarmer(farmerId) {
        return Array.from(this.subscriptions.values()).find((subscription) => subscription.farmerId === farmerId);
      }
      async createSubscription(subscription) {
        const id = this.subscriptionCurrentId++;
        const newSubscription = { ...subscription, id };
        this.subscriptions.set(id, newSubscription);
        return newSubscription;
      }
      async updateSubscription(id, updates) {
        const subscription = this.subscriptions.get(id);
        if (!subscription) return void 0;
        const updatedSubscription = { ...subscription, ...updates };
        this.subscriptions.set(id, updatedSubscription);
        return updatedSubscription;
      }
      async cancelSubscription(id) {
        const subscription = this.subscriptions.get(id);
        if (!subscription) return void 0;
        const updatedSubscription = { ...subscription, isActive: false };
        this.subscriptions.set(id, updatedSubscription);
        return updatedSubscription;
      }
      // Subscription payment operations
      async getSubscriptionPayments(subscriptionId) {
        return Array.from(this.subscriptionPayments.values()).filter((payment) => payment.subscriptionId === subscriptionId);
      }
      async createSubscriptionPayment(payment) {
        const id = this.subscriptionPaymentCurrentId++;
        const newPayment = { ...payment, id };
        this.subscriptionPayments.set(id, newPayment);
        return newPayment;
      }
      async updateSubscriptionPaymentStatus(id, status) {
        const payment = this.subscriptionPayments.get(id);
        if (!payment) return void 0;
        const updatedPayment = { ...payment, status };
        this.subscriptionPayments.set(id, updatedPayment);
        return updatedPayment;
      }
      // Review operations
      async getReviewsByProduct(productId) {
        return Array.from(this.reviews.values()).filter((review) => review.productId === productId);
      }
      async getReviewsByUser(userId) {
        return Array.from(this.reviews.values()).filter((review) => review.userId === userId);
      }
      async createReview(review) {
        const id = this.reviewCurrentId++;
        const createdAt = /* @__PURE__ */ new Date();
        const newReview = {
          ...review,
          id,
          createdAt,
          helpfulCount: 0
        };
        this.reviews.set(id, newReview);
        return newReview;
      }
      async updateReviewHelpful(id, increment) {
        const review = this.reviews.get(id);
        if (!review) return void 0;
        const updatedHelpfulCount = review.helpfulCount + increment;
        const updatedReview = { ...review, helpfulCount: updatedHelpfulCount };
        this.reviews.set(id, updatedReview);
        return updatedReview;
      }
      // Product recommendation operations
      async getRecommendedProducts(productId, limit = 5) {
        const recommendations = Array.from(this.productRecommendations.values()).filter((rec) => rec.sourceProductId === productId).sort((a, b) => b.score - a.score).slice(0, limit);
        const recommendedProductIds = recommendations.map((rec) => rec.recommendedProductId);
        return Array.from(this.products.values()).filter((product) => recommendedProductIds.includes(product.id));
      }
      async getPersonalizedRecommendations(userId, limit = 10) {
        const orders2 = await this.getOrdersByCustomer(userId);
        if (orders2.length === 0) {
          return this.getFeaturedProducts();
        }
        const orderItems2 = [];
        for (const order of orders2) {
          const items = await this.getOrderItems(order.id);
          orderItems2.push(...items);
        }
        const purchasedProductIds = [...new Set(orderItems2.map((item) => item.productId))];
        const recommendations = [];
        for (const productId of purchasedProductIds) {
          const productRecs = Array.from(this.productRecommendations.values()).filter((rec) => rec.sourceProductId === productId);
          recommendations.push(...productRecs);
        }
        const sortedRecs = recommendations.sort((a, b) => b.score - a.score).slice(0, limit);
        const recommendedProductIds = [...new Set(sortedRecs.map((rec) => rec.recommendedProductId))];
        return Array.from(this.products.values()).filter(
          (product) => recommendedProductIds.includes(product.id) && !purchasedProductIds.includes(product.id)
        );
      }
      async createProductRecommendation(recommendation) {
        const id = this.productRecommendationCurrentId++;
        const newRecommendation = { ...recommendation, id };
        this.productRecommendations.set(id, newRecommendation);
        return newRecommendation;
      }
      async updateProductRecommendation(id, updates) {
        const recommendation = this.productRecommendations.get(id);
        if (!recommendation) return void 0;
        const updatedRecommendation = { ...recommendation, ...updates };
        this.productRecommendations.set(id, updatedRecommendation);
        return updatedRecommendation;
      }
    };
    storage = new MemStorage();
  }
});

// server/payments/stripe.ts
var stripe_exports = {};
__export(stripe_exports, {
  PaymentError: () => PaymentError,
  createSubscription: () => createSubscription,
  handleStripeWebhook: () => handleStripeWebhook,
  handleSubscriptionWebhook: () => handleSubscriptionWebhook,
  processPayment: () => processPayment
});
import Stripe from "stripe";
async function processPayment(data) {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new PaymentError("Stripe API key is not configured", "no_api_key");
    }
    const paymentData = {
      orderId: data.orderId,
      amount: data.amount.toString(),
      method: data.paymentMethod,
      status: "pending",
      transactionId: null,
      tipAmount: data.tipAmount ? data.tipAmount.toString() : null,
      paymentDetails: {}
    };
    const payment = await storage.createPayment(paymentData);
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "cad",
            // Always use CAD currency
            product_data: {
              name: data.description
            },
            unit_amount: Math.round(data.amount * 100)
            // Convert to cents
          },
          quantity: 1
        },
        // Add tip as separate line item if provided
        ...data.tipAmount && data.tipAmount > 0 ? [
          {
            price_data: {
              currency: "cad",
              // Always use CAD currency
              product_data: {
                name: "Tip"
              },
              unit_amount: Math.round(data.tipAmount * 100)
              // Convert to cents
            },
            quantity: 1
          }
        ] : []
      ],
      mode: "payment",
      success_url: `${process.env.APP_URL || "http://localhost:3000"}/order/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.APP_URL || "http://localhost:3000"}/order/cancel?session_id={CHECKOUT_SESSION_ID}`,
      customer_email: data.customerEmail,
      metadata: {
        paymentId: payment.id.toString(),
        orderId: data.orderId.toString(),
        customerId: data.customerId.toString(),
        ...data.metadata
      }
    });
    return {
      paymentId: payment.id,
      success: true,
      sessionUrl: session.url
    };
  } catch (error) {
    console.error("Payment processing error:", error);
    if (error instanceof PaymentError) {
      return {
        paymentId: -1,
        success: false,
        error: error.message
      };
    }
    return {
      paymentId: -1,
      success: false,
      error: error.message || "Unknown payment error"
    };
  }
}
async function handleStripeWebhook(event) {
  try {
    console.log(`Processing webhook event: ${event.type}`);
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const paymentId = session.metadata?.paymentId;
        if (!paymentId) {
          console.error("No payment ID in webhook data");
          return false;
        }
        await storage.updatePaymentStatus(parseInt(paymentId), "completed");
        const orderId = session.metadata?.orderId;
        if (orderId) {
          await storage.updateOrderStatus(parseInt(orderId), "confirmed");
        }
        return true;
      }
      case "checkout.session.expired":
      case "checkout.session.async_payment_failed": {
        const session = event.data.object;
        const paymentId = session.metadata?.paymentId;
        if (!paymentId) {
          console.error("No payment ID in webhook data");
          return false;
        }
        await storage.updatePaymentStatus(parseInt(paymentId), "failed");
        return true;
      }
      // Handle subscription-related events
      case "customer.subscription.created": {
        const subscription = event.data.object;
        return handleSubscriptionWebhook(event);
      }
      case "customer.subscription.updated": {
        return handleSubscriptionWebhook(event);
      }
      case "customer.subscription.deleted": {
        return handleSubscriptionWebhook(event);
      }
      case "invoice.paid": {
        return handleSubscriptionWebhook(event);
      }
      case "invoice.payment_failed": {
        return handleSubscriptionWebhook(event);
      }
      default:
        console.log(`Unhandled event type: ${event.type}`);
        return false;
    }
  } catch (error) {
    console.error("Error processing webhook:", error);
    return false;
  }
}
async function createSubscription(farmerId, email, tier, price) {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new PaymentError("Stripe API key is not configured", "no_api_key");
    }
    const subscriptionData = {
      farmerId,
      tier,
      price: price.toString(),
      startDate: /* @__PURE__ */ new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1e3),
      // 30 days from now
      isActive: false,
      // Set to true after payment
      autoRenew: true,
      features: {}
    };
    const subscription = await storage.createSubscription(subscriptionData);
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "cad",
            // Change from 'usd' to 'cad'
            product_data: {
              name: `Farmer Subscription - ${tier} Tier`,
              description: "Monthly subscription for farmers marketplace"
            },
            unit_amount: Math.round(price * 100),
            // Convert to cents
            recurring: {
              interval: "month"
            }
          },
          quantity: 1
        }
      ],
      mode: "subscription",
      success_url: `${process.env.APP_URL || "http://localhost:3000"}/dashboard?subscription=success`,
      cancel_url: `${process.env.APP_URL || "http://localhost:3000"}/dashboard?subscription=cancel`,
      customer_email: email,
      metadata: {
        subscriptionId: subscription.id.toString(),
        farmerId: farmerId.toString(),
        tier
      }
    });
    return {
      subscriptionId: subscription.id,
      success: true,
      sessionUrl: session.url
    };
  } catch (error) {
    console.error("Subscription creation error:", error);
    if (error instanceof PaymentError) {
      return {
        subscriptionId: -1,
        success: false,
        error: error.message
      };
    }
    return {
      subscriptionId: -1,
      success: false,
      error: error.message || "Unknown subscription error"
    };
  }
}
async function handleSubscriptionWebhook(event) {
  try {
    switch (event.type) {
      case "customer.subscription.created": {
        const subscription = event.data.object;
        const subscriptionId = subscription.metadata?.subscriptionId;
        if (!subscriptionId) {
          console.error("No subscription ID in webhook data");
          return false;
        }
        await storage.updateSubscription(parseInt(subscriptionId), {
          isActive: true
        });
        return true;
      }
      case "customer.subscription.updated": {
        const subscription = event.data.object;
        const subscriptionId = subscription.metadata?.subscriptionId;
        if (!subscriptionId) {
          console.error("No subscription ID in webhook data");
          return false;
        }
        if (subscription.status === "active") {
          await storage.updateSubscription(parseInt(subscriptionId), {
            isActive: true
          });
        } else if (subscription.status === "canceled" || subscription.status === "unpaid") {
          await storage.updateSubscription(parseInt(subscriptionId), {
            isActive: false
          });
        }
        return true;
      }
      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        const subscriptionId = subscription.metadata?.subscriptionId;
        if (!subscriptionId) {
          console.error("No subscription ID in webhook data");
          return false;
        }
        await storage.cancelSubscription(parseInt(subscriptionId));
        return true;
      }
      case "invoice.paid": {
        const invoice = event.data.object;
        const subscriptionId = invoice.subscription;
        const stripeSubscription = await stripe.subscriptions.retrieve(subscriptionId);
        const internalSubscriptionId = stripeSubscription.metadata?.subscriptionId;
        if (!internalSubscriptionId) {
          console.error("No internal subscription ID in webhook data");
          return false;
        }
        if (invoice.amount_paid > 0) {
          const paymentData = {
            subscriptionId: parseInt(internalSubscriptionId),
            amount: (invoice.amount_paid / 100).toString(),
            // Convert from cents to dollars
            method: "credit_card",
            status: "completed",
            transactionId: invoice.id,
            billingDate: new Date(invoice.created * 1e3),
            // Convert from Unix timestamp
            details: invoice
          };
          await storage.createSubscriptionPayment(paymentData);
          const subscription = await storage.getSubscription(parseInt(internalSubscriptionId));
          if (subscription) {
            const newEndDate = new Date(subscription.endDate.getTime() + 30 * 24 * 60 * 60 * 1e3);
            await storage.updateSubscription(parseInt(internalSubscriptionId), {
              endDate: newEndDate,
              isActive: true
            });
          }
        }
        return true;
      }
      case "invoice.payment_failed": {
        const invoice = event.data.object;
        const subscriptionId = invoice.subscription;
        const stripeSubscription = await stripe.subscriptions.retrieve(subscriptionId);
        const internalSubscriptionId = stripeSubscription.metadata?.subscriptionId;
        if (!internalSubscriptionId) {
          console.error("No internal subscription ID in webhook data");
          return false;
        }
        const paymentData = {
          subscriptionId: parseInt(internalSubscriptionId),
          amount: (invoice.amount_due / 100).toString(),
          // Convert from cents to dollars
          method: "credit_card",
          status: "failed",
          transactionId: invoice.id,
          billingDate: new Date(invoice.created * 1e3),
          // Convert from Unix timestamp
          details: invoice
        };
        await storage.createSubscriptionPayment(paymentData);
        return true;
      }
      default:
        return false;
    }
  } catch (error) {
    console.error("Error processing subscription webhook:", error);
    return false;
  }
}
var stripe, PaymentError;
var init_stripe = __esm({
  "server/payments/stripe.ts"() {
    "use strict";
    init_storage();
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "dummy_key", {
      apiVersion: "2023-10-16"
      // Updated API version
    });
    PaymentError = class extends Error {
      code;
      constructor(message, code) {
        super(message);
        this.code = code;
        this.name = "PaymentError";
      }
    };
  }
});

// server/index.ts
import express3 from "express";

// server/routes.ts
init_storage();
import express from "express";
import { createServer } from "http";

// shared/schema.ts
import { pgTable, text, serial, integer, boolean, decimal, timestamp, json, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
var roleEnum = pgEnum("role", ["customer", "farmer", "delivery"]);
var users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: roleEnum("role").notNull(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  phone: text("phone"),
  address: text("address"),
  profileImage: text("profile_image")
});
var categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  icon: text("icon").notNull(),
  color: text("color").notNull()
});
var products = pgTable("products", {
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
  featured: boolean("featured").default(false)
});
var orderStatusEnum = pgEnum("order_status", ["pending", "confirmed", "processing", "out_for_delivery", "delivered", "cancelled"]);
var orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").notNull(),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  status: orderStatusEnum("status").notNull().default("pending"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  deliveryAddress: text("delivery_address").notNull(),
  deliveryNotes: text("delivery_notes"),
  deliveryPersonId: integer("delivery_person_id"),
  estimatedDelivery: timestamp("estimated_delivery")
});
var orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull(),
  productId: integer("product_id").notNull(),
  quantity: integer("quantity").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull()
});
var cartItems = pgTable("cart_items", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  productId: integer("product_id").notNull(),
  quantity: integer("quantity").notNull()
});
var deliveries = pgTable("deliveries", {
  id: serial("id").primaryKey(),
  deliveryPersonId: integer("delivery_person_id").notNull(),
  orderId: integer("order_id").notNull(),
  status: orderStatusEnum("status").notNull().default("confirmed"),
  scheduledTime: timestamp("scheduled_time"),
  startTime: timestamp("start_time"),
  completedTime: timestamp("completed_time"),
  routeInfo: json("route_info")
});
var paymentMethodEnum = pgEnum("payment_method", ["credit_card", "paypal", "mobile_wallet", "bank_transfer"]);
var paymentStatusEnum = pgEnum("payment_status", ["pending", "completed", "failed", "refunded"]);
var ratingEnum = pgEnum("rating", ["1", "2", "3", "4", "5"]);
var reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull(),
  userId: integer("user_id").notNull(),
  rating: ratingEnum("rating").notNull(),
  comment: text("comment"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  helpful: integer("helpful").default(0),
  isVerifiedPurchase: boolean("is_verified_purchase").default(false)
});
var productRecommendations = pgTable("product_recommendations", {
  id: serial("id").primaryKey(),
  sourceProductId: integer("source_product_id").notNull(),
  recommendedProductId: integer("recommended_product_id").notNull(),
  score: decimal("score", { precision: 5, scale: 2 }).notNull(),
  reason: text("reason"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow()
});
var payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  method: paymentMethodEnum("method").notNull(),
  status: paymentStatusEnum("status").notNull().default("pending"),
  transactionId: text("transaction_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  paymentDetails: json("payment_details"),
  tipAmount: decimal("tip_amount", { precision: 10, scale: 2 }).default("0")
});
var subscriptionTierEnum = pgEnum("subscription_tier", ["basic", "premium", "pro"]);
var subscriptions = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  farmerId: integer("farmer_id").notNull().unique(),
  tier: subscriptionTierEnum("tier").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  startDate: timestamp("start_date").notNull().defaultNow(),
  endDate: timestamp("end_date").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  autoRenew: boolean("auto_renew").notNull().default(true),
  features: json("features")
});
var subscriptionPayments = pgTable("subscription_payments", {
  id: serial("id").primaryKey(),
  subscriptionId: integer("subscription_id").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  method: paymentMethodEnum("method").notNull(),
  status: paymentStatusEnum("status").notNull().default("pending"),
  transactionId: text("transaction_id"),
  billingDate: timestamp("billing_date").notNull().defaultNow(),
  details: json("details")
});
var insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  role: true,
  email: true,
  name: true,
  phone: true,
  address: true,
  profileImage: true
});
var insertProductSchema = createInsertSchema(products).pick({
  name: true,
  description: true,
  price: true,
  unit: true,
  imageUrls: true,
  stock: true,
  categoryId: true,
  farmerId: true,
  organic: true,
  featured: true
});
var insertCategorySchema = createInsertSchema(categories).pick({
  name: true,
  icon: true,
  color: true
});
var insertOrderSchema = createInsertSchema(orders).pick({
  customerId: true,
  totalAmount: true,
  status: true,
  deliveryAddress: true,
  deliveryNotes: true
});
var insertOrderItemSchema = createInsertSchema(orderItems).pick({
  orderId: true,
  productId: true,
  quantity: true,
  price: true
});
var insertCartItemSchema = createInsertSchema(cartItems).pick({
  userId: true,
  productId: true,
  quantity: true
});
var insertDeliverySchema = createInsertSchema(deliveries).pick({
  deliveryPersonId: true,
  orderId: true,
  status: true,
  scheduledTime: true,
  routeInfo: true
});
var insertPaymentSchema = createInsertSchema(payments).pick({
  orderId: true,
  amount: true,
  method: true,
  status: true,
  transactionId: true,
  paymentDetails: true,
  tipAmount: true
});
var insertSubscriptionSchema = createInsertSchema(subscriptions).pick({
  farmerId: true,
  tier: true,
  price: true,
  startDate: true,
  endDate: true,
  isActive: true,
  autoRenew: true,
  features: true
});
var insertSubscriptionPaymentSchema = createInsertSchema(subscriptionPayments).pick({
  subscriptionId: true,
  amount: true,
  method: true,
  status: true,
  transactionId: true,
  billingDate: true,
  details: true
});
var insertReviewSchema = createInsertSchema(reviews).pick({
  productId: true,
  userId: true,
  rating: true,
  comment: true,
  isVerifiedPurchase: true
});
var insertProductRecommendationSchema = createInsertSchema(productRecommendations).pick({
  sourceProductId: true,
  recommendedProductId: true,
  score: true,
  reason: true
});

// server/routes.ts
import multer from "multer";
import path from "path";
import { z } from "zod";
import Stripe2 from "stripe";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
var JWT_SECRET = process.env.JWT_SECRET || "farm_fresh_secret_key";
var upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, path.join(process.cwd(), "dist/public/uploads"));
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      const ext = path.extname(file.originalname);
      cb(null, file.fieldname + "-" + uniqueSuffix + ext);
    }
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only images are allowed"));
    }
  }
});
var generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      role: user.role
    },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
};
var authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: "No token provided" });
  }
  const parts = authHeader.split(" ");
  if (parts.length !== 2) {
    return res.status(401).json({ message: "Token error" });
  }
  const [scheme, token] = parts;
  if (!/^Bearer$/i.test(scheme)) {
    return res.status(401).json({ message: "Token malformatted" });
  }
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Invalid token" });
    }
    req.user = decoded;
    return next();
  });
};
var checkRole = (role) => {
  return (req, res, next) => {
    if (req.user.role !== role) {
      return res.status(403).json({ message: "Access denied" });
    }
    return next();
  };
};
async function registerRoutes(app2) {
  app2.use(express.json());
  const httpServer = createServer(app2);
  app2.use("/api", express.Router());
  app2.post("/api/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(userData.password, salt);
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword
      });
      const token = generateToken({
        id: user.id,
        username: user.username,
        role: user.role
      });
      const { password, ...userWithoutPassword } = user;
      return res.status(201).json({
        user: userWithoutPassword,
        token
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.post("/api/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }
      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      const token = generateToken({
        id: user.id,
        username: user.username,
        role: user.role
      });
      const { password: _, ...userWithoutPassword } = user;
      return res.json({
        user: userWithoutPassword,
        token
      });
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/me", authenticate, async (req, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const { password, ...userWithoutPassword } = user;
      return res.json(userWithoutPassword);
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/categories", async (req, res) => {
    try {
      const categories2 = await storage.getCategories();
      return res.json(categories2);
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/products", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit) : 100;
      const offset = req.query.offset ? parseInt(req.query.offset) : 0;
      const categoryId = req.query.categoryId ? parseInt(req.query.categoryId) : null;
      let products2;
      if (categoryId) {
        products2 = await storage.getProductsByCategory(categoryId);
      } else {
        products2 = await storage.getProducts(limit, offset);
      }
      return res.json(products2);
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/products/featured", async (req, res) => {
    try {
      const products2 = await storage.getFeaturedProducts();
      return res.json(products2);
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/farmer/products", authenticate, checkRole("farmer"), async (req, res) => {
    try {
      const farmerId = req.user.id;
      const products2 = await storage.getProductsByFarmer(farmerId);
      return res.json(products2);
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/products/:id", async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      const product = await storage.getProduct(productId);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      return res.json(product);
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.post("/api/products", authenticate, checkRole("farmer"), upload.array("images", 5), async (req, res) => {
    try {
      const farmerId = req.user.id;
      const fileUrls = req.files.map(
        (file) => `/uploads/${file.filename}`
      );
      const productData = insertProductSchema.parse({
        ...req.body,
        price: parseFloat(req.body.price),
        stock: parseInt(req.body.stock),
        categoryId: parseInt(req.body.categoryId),
        farmerId,
        imageUrls: fileUrls,
        organic: req.body.organic === "true",
        featured: req.body.featured === "true"
      });
      const product = await storage.createProduct(productData);
      return res.status(201).json(product);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.put("/api/products/:id", authenticate, checkRole("farmer"), upload.array("images", 5), async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      const farmerId = req.user.id;
      const existingProduct = await storage.getProduct(productId);
      if (!existingProduct) {
        return res.status(404).json({ message: "Product not found" });
      }
      if (existingProduct.farmerId !== farmerId) {
        return res.status(403).json({ message: "You don't have permission to update this product" });
      }
      const fileUrls = req.files.map(
        (file) => `/uploads/${file.filename}`
      );
      const imageUrls = fileUrls.length > 0 ? fileUrls : existingProduct.imageUrls;
      const updateData = {
        ...req.body,
        imageUrls
      };
      if (req.body.price) updateData.price = parseFloat(req.body.price);
      if (req.body.stock) updateData.stock = parseInt(req.body.stock);
      if (req.body.categoryId) updateData.categoryId = parseInt(req.body.categoryId);
      if (req.body.organic !== void 0) updateData.organic = req.body.organic === "true";
      if (req.body.featured !== void 0) updateData.featured = req.body.featured === "true";
      const updatedProduct = await storage.updateProduct(productId, updateData);
      return res.json(updatedProduct);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.delete("/api/products/:id", authenticate, checkRole("farmer"), async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      const farmerId = req.user.id;
      const existingProduct = await storage.getProduct(productId);
      if (!existingProduct) {
        return res.status(404).json({ message: "Product not found" });
      }
      if (existingProduct.farmerId !== farmerId) {
        return res.status(403).json({ message: "You don't have permission to delete this product" });
      }
      await storage.deleteProduct(productId);
      return res.status(204).end();
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/cart", authenticate, async (req, res) => {
    try {
      const userId = req.user.id;
      const cartItems2 = await storage.getCartItems(userId);
      const cartItemsWithDetails = await Promise.all(
        cartItems2.map(async (item) => {
          const product = await storage.getProduct(item.productId);
          return {
            ...item,
            product
          };
        })
      );
      return res.json(cartItemsWithDetails);
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.post("/api/cart", authenticate, async (req, res) => {
    try {
      const userId = req.user.id;
      const cartItemData = insertCartItemSchema.parse({
        ...req.body,
        userId,
        quantity: parseInt(req.body.quantity),
        productId: parseInt(req.body.productId)
      });
      const cartItem = await storage.addCartItem(cartItemData);
      const product = await storage.getProduct(cartItem.productId);
      return res.status(201).json({
        ...cartItem,
        product
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.put("/api/cart/:id", authenticate, async (req, res) => {
    try {
      const cartItemId = parseInt(req.params.id);
      const userId = req.user.id;
      const quantity = parseInt(req.body.quantity);
      if (isNaN(quantity) || quantity < 1) {
        return res.status(400).json({ message: "Invalid quantity" });
      }
      const existingCartItem = await storage.getCartItems(userId);
      const cartItem = existingCartItem.find((item) => item.id === cartItemId);
      if (!cartItem) {
        return res.status(404).json({ message: "Cart item not found" });
      }
      const updatedCartItem = await storage.updateCartItemQuantity(cartItemId, quantity);
      const product = await storage.getProduct(updatedCartItem.productId);
      return res.json({
        ...updatedCartItem,
        product
      });
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.delete("/api/cart/:id", authenticate, async (req, res) => {
    try {
      const cartItemId = parseInt(req.params.id);
      const userId = req.user.id;
      const existingCartItem = await storage.getCartItems(userId);
      const cartItem = existingCartItem.find((item) => item.id === cartItemId);
      if (!cartItem) {
        return res.status(404).json({ message: "Cart item not found" });
      }
      await storage.removeCartItem(cartItemId);
      return res.status(204).end();
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.delete("/api/cart", authenticate, async (req, res) => {
    try {
      const userId = req.user.id;
      await storage.clearCart(userId);
      return res.status(204).end();
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.post("/api/orders", authenticate, checkRole("customer"), async (req, res) => {
    try {
      const customerId = req.user.id;
      const cartItems2 = await storage.getCartItems(customerId);
      if (cartItems2.length === 0) {
        return res.status(400).json({ message: "Cart is empty" });
      }
      let totalAmount = 0;
      const orderItemsData = await Promise.all(
        cartItems2.map(async (item) => {
          const product = await storage.getProduct(item.productId);
          if (!product) {
            throw new Error(`Product ${item.productId} not found`);
          }
          const itemTotal = parseFloat(product.price) * item.quantity;
          totalAmount += itemTotal;
          return {
            productId: item.productId,
            quantity: item.quantity,
            price: product.price
          };
        })
      );
      const orderData = insertOrderSchema.parse({
        ...req.body,
        customerId,
        totalAmount
      });
      const order = await storage.createOrder(orderData);
      await Promise.all(
        orderItemsData.map(async (item) => {
          return storage.createOrderItem({
            ...item,
            orderId: order.id
          });
        })
      );
      await storage.clearCart(customerId);
      return res.status(201).json(order);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/orders", authenticate, async (req, res) => {
    try {
      const userId = req.user.id;
      const userRole = req.user.role;
      let orders2;
      if (userRole === "customer") {
        orders2 = await storage.getOrdersByCustomer(userId);
      } else if (userRole === "delivery") {
        orders2 = await storage.getOrdersByDeliveryPerson(userId);
      } else if (userRole === "farmer") {
        orders2 = [];
      } else {
        return res.status(403).json({ message: "Unauthorized" });
      }
      return res.json(orders2);
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/orders/:id", authenticate, async (req, res) => {
    try {
      const orderId = parseInt(req.params.id);
      const order = await storage.getOrder(orderId);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      const userId = req.user.id;
      const userRole = req.user.role;
      if (userRole === "customer" && order.customerId !== userId || userRole === "delivery" && order.deliveryPersonId !== userId) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      const orderItems2 = await storage.getOrderItems(orderId);
      const orderItemsWithDetails = await Promise.all(
        orderItems2.map(async (item) => {
          const product = await storage.getProduct(item.productId);
          return {
            ...item,
            product
          };
        })
      );
      return res.json({
        ...order,
        items: orderItemsWithDetails
      });
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.patch("/api/orders/:id/status", authenticate, async (req, res) => {
    try {
      const orderId = parseInt(req.params.id);
      const { status } = req.body;
      if (!Object.values(orderStatusEnum.enumValues).includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      const order = await storage.getOrder(orderId);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      const userId = req.user.id;
      const userRole = req.user.role;
      if (userRole === "customer" && order.customerId !== userId) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      if (userRole === "delivery" && order.deliveryPersonId !== userId) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      if (userRole === "customer" && status !== "cancelled") {
        return res.status(403).json({ message: "Customers can only cancel orders" });
      }
      const updatedOrder = await storage.updateOrderStatus(orderId, status);
      if (order.deliveryPersonId) {
        const deliveries2 = await Promise.all([
          ...Array.from((await storage.getDeliveriesByDeliveryPerson(order.deliveryPersonId)).filter((delivery) => delivery.orderId === orderId))
        ]);
        if (deliveries2.length > 0) {
          await storage.updateDeliveryStatus(deliveries2[0].id, status);
        }
      }
      return res.json(updatedOrder);
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.patch("/api/orders/:id/delivery", authenticate, checkRole("delivery"), async (req, res) => {
    try {
      const orderId = parseInt(req.params.id);
      const deliveryPersonId = req.user.id;
      const order = await storage.getOrder(orderId);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      if (order.deliveryPersonId) {
        return res.status(400).json({ message: "Order already has a delivery person assigned" });
      }
      const updatedOrder = await storage.assignDeliveryPerson(orderId, deliveryPersonId);
      await storage.createDelivery({
        deliveryPersonId,
        orderId,
        status: "confirmed",
        scheduledTime: new Date(Date.now() + 24 * 60 * 60 * 1e3),
        // 24 hours from now
        routeInfo: {}
      });
      return res.json(updatedOrder);
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/deliveries", authenticate, checkRole("delivery"), async (req, res) => {
    try {
      const deliveryPersonId = req.user.id;
      const deliveries2 = await storage.getDeliveriesByDeliveryPerson(deliveryPersonId);
      const deliveriesWithDetails = await Promise.all(
        deliveries2.map(async (delivery) => {
          const order = await storage.getOrder(delivery.orderId);
          return {
            ...delivery,
            order
          };
        })
      );
      return res.json(deliveriesWithDetails);
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/deliveries/:id", authenticate, checkRole("delivery"), async (req, res) => {
    try {
      const deliveryId = parseInt(req.params.id);
      const deliveryPersonId = req.user.id;
      const delivery = await storage.getDelivery(deliveryId);
      if (!delivery) {
        return res.status(404).json({ message: "Delivery not found" });
      }
      if (delivery.deliveryPersonId !== deliveryPersonId) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      const order = await storage.getOrder(delivery.orderId);
      const orderItems2 = await storage.getOrderItems(delivery.orderId);
      const orderItemsWithDetails = await Promise.all(
        orderItems2.map(async (item) => {
          const product = await storage.getProduct(item.productId);
          return {
            ...item,
            product
          };
        })
      );
      return res.json({
        ...delivery,
        order: {
          ...order,
          items: orderItemsWithDetails
        }
      });
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.patch("/api/deliveries/:id/status", authenticate, checkRole("delivery"), async (req, res) => {
    try {
      const deliveryId = parseInt(req.params.id);
      const { status } = req.body;
      if (!Object.values(orderStatusEnum.enumValues).includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      const deliveryPersonId = req.user.id;
      const delivery = await storage.getDelivery(deliveryId);
      if (!delivery) {
        return res.status(404).json({ message: "Delivery not found" });
      }
      if (delivery.deliveryPersonId !== deliveryPersonId) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      const updatedDelivery = await storage.updateDeliveryStatus(deliveryId, status);
      await storage.updateOrderStatus(delivery.orderId, status);
      if (status === "out_for_delivery") {
        await storage.updateDeliveryTimes(deliveryId, {
          startTime: /* @__PURE__ */ new Date()
        });
      }
      if (status === "delivered") {
        await storage.updateDeliveryTimes(deliveryId, {
          completedTime: /* @__PURE__ */ new Date()
        });
      }
      return res.json(updatedDelivery);
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  const paymentsPrefix = "/api/payments";
  app2.post(`${paymentsPrefix}/checkout`, async (req, res) => {
    try {
      const { orderId, customerId, amount, tipAmount, email, name, description, currency } = req.body;
      if (!orderId || !customerId || !amount || !email || !name) {
        return res.status(400).json({ error: "Missing required fields" });
      }
      const order = await storage.getOrder(orderId);
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }
      if (order.customerId !== customerId) {
        return res.status(403).json({ error: "Unauthorized" });
      }
      const stripeModule = await Promise.resolve().then(() => (init_stripe(), stripe_exports));
      const { processPayment: processPayment2 } = stripeModule;
      const checkoutData = {
        orderId,
        customerId,
        amount: parseFloat(amount),
        currency: currency || "cad",
        // Default to CAD if not provided
        customerEmail: email,
        customerName: name,
        paymentMethod: "credit_card",
        description: description || `Payment for order #${orderId}`,
        tipAmount: tipAmount ? parseFloat(tipAmount) : void 0
      };
      const result = await processPayment2(checkoutData);
      if (result.success) {
        return res.status(200).json({
          success: true,
          paymentId: result.paymentId,
          checkoutUrl: result.sessionUrl
        });
      } else {
        return res.status(400).json({
          success: false,
          error: result.error
        });
      }
    } catch (error) {
      console.error("Checkout error:", error);
      return res.status(500).json({ error: error.message || "Internal server error" });
    }
  });
  app2.get(`${paymentsPrefix}/:id`, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid payment ID" });
      }
      const payment = await storage.getPayment(id);
      if (!payment) {
        return res.status(404).json({ error: "Payment not found" });
      }
      return res.status(200).json(payment);
    } catch (error) {
      console.error("Get payment error:", error);
      return res.status(500).json({ error: error.message || "Internal server error" });
    }
  });
  app2.get(`${paymentsPrefix}/order/:orderId`, async (req, res) => {
    try {
      const orderId = parseInt(req.params.orderId);
      if (isNaN(orderId)) {
        return res.status(400).json({ error: "Invalid order ID" });
      }
      const payments2 = await storage.getPaymentsByOrder(orderId);
      return res.status(200).json(payments2);
    } catch (error) {
      console.error("Get order payments error:", error);
      return res.status(500).json({ error: error.message || "Internal server error" });
    }
  });
  app2.post(`${paymentsPrefix}/subscription`, async (req, res) => {
    try {
      const { farmerId, email, tier, price } = req.body;
      if (!farmerId || !email || !tier || !price) {
        return res.status(400).json({ error: "Missing required fields" });
      }
      const farmer = await storage.getUser(farmerId);
      if (!farmer || farmer.role !== "farmer") {
        return res.status(404).json({ error: "Farmer not found" });
      }
      const existingSubscription = await storage.getSubscriptionByFarmer(farmerId);
      if (existingSubscription && existingSubscription.isActive) {
        return res.status(400).json({
          error: "Farmer already has an active subscription",
          subscriptionId: existingSubscription.id
        });
      }
      const stripeModule = await Promise.resolve().then(() => (init_stripe(), stripe_exports));
      const { createSubscription: createSubscription2 } = stripeModule;
      const result = await createSubscription2(
        farmerId,
        email,
        tier,
        parseFloat(price)
      );
      if (result.success) {
        return res.status(200).json({
          success: true,
          subscriptionId: result.subscriptionId,
          checkoutUrl: result.sessionUrl
        });
      } else {
        return res.status(400).json({
          success: false,
          error: result.error
        });
      }
    } catch (error) {
      console.error("Create subscription error:", error);
      return res.status(500).json({ error: error.message || "Internal server error" });
    }
  });
  app2.get(`${paymentsPrefix}/subscription/farmer/:farmerId`, async (req, res) => {
    try {
      const farmerId = parseInt(req.params.farmerId);
      if (isNaN(farmerId)) {
        return res.status(400).json({ error: "Invalid farmer ID" });
      }
      const subscription = await storage.getSubscriptionByFarmer(farmerId);
      if (!subscription) {
        return res.status(404).json({ error: "Subscription not found" });
      }
      return res.status(200).json(subscription);
    } catch (error) {
      console.error("Get farmer subscription error:", error);
      return res.status(500).json({ error: error.message || "Internal server error" });
    }
  });
  app2.post(`${paymentsPrefix}/subscription/:id/cancel`, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid subscription ID" });
      }
      const subscription = await storage.getSubscription(id);
      if (!subscription) {
        return res.status(404).json({ error: "Subscription not found" });
      }
      const updatedSubscription = await storage.cancelSubscription(id);
      return res.status(200).json({
        success: true,
        subscription: updatedSubscription
      });
    } catch (error) {
      console.error("Cancel subscription error:", error);
      return res.status(500).json({ error: error.message || "Internal server error" });
    }
  });
  app2.post(`${paymentsPrefix}/webhook`, express.raw({ type: "application/json" }), async (req, res) => {
    try {
      const signature = req.headers["stripe-signature"];
      if (!signature) {
        return res.status(400).json({ error: "Missing Stripe signature" });
      }
      let event;
      try {
        const stripeModule2 = await Promise.resolve().then(() => (init_stripe(), stripe_exports));
        const stripe2 = new Stripe2(process.env.STRIPE_SECRET_KEY || "dummy_key", {
          apiVersion: "2023-10-16"
        });
        event = stripe2.webhooks.constructEvent(
          req.body,
          signature,
          process.env.STRIPE_WEBHOOK_SECRET || ""
        );
      } catch (err) {
        console.error("Webhook signature verification failed:", err.message);
        return res.status(400).json({ error: err.message });
      }
      let handled = false;
      const stripeModule = await Promise.resolve().then(() => (init_stripe(), stripe_exports));
      const { handleStripeWebhook: handleStripeWebhook2 } = stripeModule;
      if (event.type.startsWith("checkout.session") || event.type.startsWith("customer.subscription") || event.type.startsWith("invoice")) {
        handled = await handleStripeWebhook2(event);
      }
      if (handled) {
        return res.status(200).json({ received: true });
      } else {
        console.log(`Unhandled event type ${event.type}`);
        return res.status(200).json({ received: true, handled: false });
      }
    } catch (error) {
      console.error("Webhook error:", error);
      return res.status(500).json({ error: error.message || "Internal server error" });
    }
  });
  return httpServer;
}

// server/vite.ts
import express2 from "express";
import fs from "fs";
import path3, { dirname as dirname2 } from "path";
import { fileURLToPath as fileURLToPath2 } from "url";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import themePlugin from "@replit/vite-plugin-shadcn-theme-json";
import path2, { dirname } from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import { fileURLToPath } from "url";
var __filename = fileURLToPath(import.meta.url);
var __dirname = dirname(__filename);
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    themePlugin(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path2.resolve(__dirname, "client", "src"),
      "@shared": path2.resolve(__dirname, "shared")
    }
  },
  root: path2.resolve(__dirname, "client"),
  build: {
    outDir: path2.resolve(__dirname, "dist/public"),
    emptyOutDir: true
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var __filename2 = fileURLToPath2(import.meta.url);
var __dirname2 = dirname2(__filename2);
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path3.resolve(
        __dirname2,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path3.resolve(__dirname2, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express2.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path3.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express3();
app.use(express3.json());
app.use(express3.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path4 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path4.startsWith("/api")) {
      let logLine = `${req.method} ${path4} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = 5e3;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();

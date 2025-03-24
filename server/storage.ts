import {
  users, products, categories, orders, orderItems, cartItems, deliveries,
  payments, subscriptions, subscriptionPayments, reviews, productRecommendations,
  type User, type InsertUser,
  type Product, type InsertProduct,
  type Category, type InsertCategory,
  type Order, type InsertOrder,
  type OrderItem, type InsertOrderItem,
  type CartItem, type InsertCartItem,
  type Delivery, type InsertDelivery,
  type Payment, type InsertPayment,
  type Subscription, type InsertSubscription,
  type SubscriptionPayment, type InsertSubscriptionPayment,
  type Review, type InsertReview,
  type ProductRecommendation, type InsertProductRecommendation
} from "@shared/schema";

// The storage interface for all CRUD operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUsersByRole(role: string): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;
  
  // Product operations
  getProduct(id: number): Promise<Product | undefined>;
  getProducts(limit?: number, offset?: number): Promise<Product[]>;
  getProductsByCategory(categoryId: number): Promise<Product[]>;
  getProductsByFarmer(farmerId: number): Promise<Product[]>;
  getFeaturedProducts(): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: number): Promise<boolean>;
  
  // Category operations
  getCategory(id: number): Promise<Category | undefined>;
  getCategories(): Promise<Category[]>;
  createCategory(category: InsertCategory): Promise<Category>;
  
  // Order operations
  getOrder(id: number): Promise<Order | undefined>;
  getOrdersByCustomer(customerId: number): Promise<Order[]>;
  getOrdersByDeliveryPerson(deliveryPersonId: number): Promise<Order[]>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrderStatus(id: number, status: string): Promise<Order | undefined>;
  assignDeliveryPerson(id: number, deliveryPersonId: number): Promise<Order | undefined>;
  
  // Order item operations
  getOrderItems(orderId: number): Promise<OrderItem[]>;
  createOrderItem(orderItem: InsertOrderItem): Promise<OrderItem>;
  
  // Cart operations
  getCartItems(userId: number): Promise<CartItem[]>;
  addCartItem(cartItem: InsertCartItem): Promise<CartItem>;
  updateCartItemQuantity(id: number, quantity: number): Promise<CartItem | undefined>;
  removeCartItem(id: number): Promise<boolean>;
  clearCart(userId: number): Promise<boolean>;
  
  // Delivery operations
  getDelivery(id: number): Promise<Delivery | undefined>;
  getDeliveriesByDeliveryPerson(deliveryPersonId: number): Promise<Delivery[]>;
  createDelivery(delivery: InsertDelivery): Promise<Delivery>;
  updateDeliveryStatus(id: number, status: string): Promise<Delivery | undefined>;
  updateDeliveryTimes(id: number, updates: { 
    startTime?: Date, 
    completedTime?: Date 
  }): Promise<Delivery | undefined>;

  // Payment operations
  getPayment(id: number): Promise<Payment | undefined>;
  getPayments(limit?: number, offset?: number): Promise<Payment[]>;
  getPaymentsByOrder(orderId: number): Promise<Payment[]>;
  createPayment(payment: InsertPayment): Promise<Payment>;
  updatePaymentStatus(id: number, status: string): Promise<Payment | undefined>;
  
  // Subscription operations
  getSubscription(id: number): Promise<Subscription | undefined>;
  getSubscriptionByFarmer(farmerId: number): Promise<Subscription | undefined>;
  createSubscription(subscription: InsertSubscription): Promise<Subscription>;
  updateSubscription(id: number, updates: Partial<InsertSubscription>): Promise<Subscription | undefined>;
  cancelSubscription(id: number): Promise<Subscription | undefined>;
  
  // Subscription payment operations
  getSubscriptionPayments(subscriptionId: number): Promise<SubscriptionPayment[]>;
  createSubscriptionPayment(payment: InsertSubscriptionPayment): Promise<SubscriptionPayment>;
  updateSubscriptionPaymentStatus(id: number, status: string): Promise<SubscriptionPayment | undefined>;
  
  // Review operations
  getReviewsByProduct(productId: number): Promise<Review[]>;
  getReviewsByUser(userId: number): Promise<Review[]>;
  createReview(review: InsertReview): Promise<Review>;
  updateReviewHelpful(id: number, increment: number): Promise<Review | undefined>;
  
  // Product recommendation operations
  getRecommendedProducts(productId: number, limit?: number): Promise<Product[]>;
  getPersonalizedRecommendations(userId: number, limit?: number): Promise<Product[]>;
  createProductRecommendation(recommendation: InsertProductRecommendation): Promise<ProductRecommendation>;
  updateProductRecommendation(id: number, updates: Partial<InsertProductRecommendation>): Promise<ProductRecommendation | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private products: Map<number, Product>;
  private categories: Map<number, Category>;
  private orders: Map<number, Order>;
  private orderItems: Map<number, OrderItem>;
  private cartItems: Map<number, CartItem>;
  private deliveries: Map<number, Delivery>;
  private payments: Map<number, Payment>;
  private subscriptions: Map<number, Subscription>;
  private subscriptionPayments: Map<number, SubscriptionPayment>;
  private reviews: Map<number, Review>;
  private productRecommendations: Map<number, ProductRecommendation>;
  
  private userCurrentId: number;
  private productCurrentId: number;
  private categoryCurrentId: number;
  private orderCurrentId: number;
  private orderItemCurrentId: number;
  private cartItemCurrentId: number;
  private deliveryCurrentId: number;
  private paymentCurrentId: number;
  private subscriptionCurrentId: number;
  private subscriptionPaymentCurrentId: number;
  private reviewCurrentId: number;
  private productRecommendationCurrentId: number;

  constructor() {
    this.users = new Map();
    this.products = new Map();
    this.categories = new Map();
    this.orders = new Map();
    this.orderItems = new Map();
    this.cartItems = new Map();
    this.deliveries = new Map();
    this.payments = new Map();
    this.subscriptions = new Map();
    this.subscriptionPayments = new Map();
    this.reviews = new Map();
    this.productRecommendations = new Map();
    
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
    
    // Initialize some default categories
    this.initializeCategories();
  }
  
  private initializeCategories() {
    const defaultCategories: InsertCategory[] = [
      { name: 'Vegetables', icon: 'carrot', color: '#2C7A39' },
      { name: 'Fruits', icon: 'apple-alt', color: '#DC3545' },
      { name: 'Dairy', icon: 'egg', color: '#F7B538' },
      { name: 'Grains', icon: 'wheat-awn', color: '#D4A24C' },
      { name: 'Herbs', icon: 'seedling', color: '#28A745' },
    ];
    
    defaultCategories.forEach(category => {
      this.createCategory(category);
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async getUsersByRole(role: string): Promise<User[]> {
    return Array.from(this.users.values()).filter(user => user.role === role);
  }

  async createUser(user: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const newUser: User = { ...user, id };
    this.users.set(id, newUser);
    return newUser;
  }

  async updateUser(id: number, updates: Partial<InsertUser>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Product operations
  async getProduct(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async getProducts(limit = 100, offset = 0): Promise<Product[]> {
    return Array.from(this.products.values())
      .slice(offset, offset + limit);
  }

  async getProductsByCategory(categoryId: number): Promise<Product[]> {
    return Array.from(this.products.values())
      .filter(product => product.categoryId === categoryId);
  }

  async getProductsByFarmer(farmerId: number): Promise<Product[]> {
    return Array.from(this.products.values())
      .filter(product => product.farmerId === farmerId);
  }

  async getFeaturedProducts(): Promise<Product[]> {
    return Array.from(this.products.values())
      .filter(product => product.featured);
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const id = this.productCurrentId++;
    const newProduct: Product = { ...product, id };
    this.products.set(id, newProduct);
    return newProduct;
  }

  async updateProduct(id: number, updates: Partial<InsertProduct>): Promise<Product | undefined> {
    const product = this.products.get(id);
    if (!product) return undefined;
    
    const updatedProduct = { ...product, ...updates };
    this.products.set(id, updatedProduct);
    return updatedProduct;
  }

  async deleteProduct(id: number): Promise<boolean> {
    return this.products.delete(id);
  }

  // Category operations
  async getCategory(id: number): Promise<Category | undefined> {
    return this.categories.get(id);
  }

  async getCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const id = this.categoryCurrentId++;
    const newCategory: Category = { ...category, id };
    this.categories.set(id, newCategory);
    return newCategory;
  }

  // Order operations
  async getOrder(id: number): Promise<Order | undefined> {
    return this.orders.get(id);
  }

  async getOrdersByCustomer(customerId: number): Promise<Order[]> {
    return Array.from(this.orders.values())
      .filter(order => order.customerId === customerId);
  }

  async getOrdersByDeliveryPerson(deliveryPersonId: number): Promise<Order[]> {
    return Array.from(this.orders.values())
      .filter(order => order.deliveryPersonId === deliveryPersonId);
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const id = this.orderCurrentId++;
    const createdAt = new Date();
    const newOrder: Order = { ...order, id, createdAt };
    this.orders.set(id, newOrder);
    return newOrder;
  }

  async updateOrderStatus(id: number, status: string): Promise<Order | undefined> {
    const order = this.orders.get(id);
    if (!order) return undefined;
    
    // @ts-ignore - We're ensuring status is a valid enum value in the API layer
    const updatedOrder = { ...order, status };
    this.orders.set(id, updatedOrder);
    return updatedOrder;
  }

  async assignDeliveryPerson(id: number, deliveryPersonId: number): Promise<Order | undefined> {
    const order = this.orders.get(id);
    if (!order) return undefined;
    
    const updatedOrder = { ...order, deliveryPersonId };
    this.orders.set(id, updatedOrder);
    return updatedOrder;
  }

  // Order item operations
  async getOrderItems(orderId: number): Promise<OrderItem[]> {
    return Array.from(this.orderItems.values())
      .filter(item => item.orderId === orderId);
  }

  async createOrderItem(orderItem: InsertOrderItem): Promise<OrderItem> {
    const id = this.orderItemCurrentId++;
    const newOrderItem: OrderItem = { ...orderItem, id };
    this.orderItems.set(id, newOrderItem);
    return newOrderItem;
  }

  // Cart operations
  async getCartItems(userId: number): Promise<CartItem[]> {
    return Array.from(this.cartItems.values())
      .filter(item => item.userId === userId);
  }

  async addCartItem(cartItem: InsertCartItem): Promise<CartItem> {
    // Check if the item already exists in the cart
    const existingItem = Array.from(this.cartItems.values())
      .find(item => item.userId === cartItem.userId && item.productId === cartItem.productId);
    
    if (existingItem) {
      // Update quantity if item exists
      return this.updateCartItemQuantity(existingItem.id, existingItem.quantity + cartItem.quantity) as Promise<CartItem>;
    }
    
    // Add new item if it doesn't exist
    const id = this.cartItemCurrentId++;
    const newCartItem: CartItem = { ...cartItem, id };
    this.cartItems.set(id, newCartItem);
    return newCartItem;
  }

  async updateCartItemQuantity(id: number, quantity: number): Promise<CartItem | undefined> {
    const cartItem = this.cartItems.get(id);
    if (!cartItem) return undefined;
    
    const updatedCartItem = { ...cartItem, quantity };
    this.cartItems.set(id, updatedCartItem);
    return updatedCartItem;
  }

  async removeCartItem(id: number): Promise<boolean> {
    return this.cartItems.delete(id);
  }

  async clearCart(userId: number): Promise<boolean> {
    const userCartItems = Array.from(this.cartItems.values())
      .filter(item => item.userId === userId);
    
    userCartItems.forEach(item => this.cartItems.delete(item.id));
    return true;
  }

  // Delivery operations
  async getDelivery(id: number): Promise<Delivery | undefined> {
    return this.deliveries.get(id);
  }

  async getDeliveriesByDeliveryPerson(deliveryPersonId: number): Promise<Delivery[]> {
    return Array.from(this.deliveries.values())
      .filter(delivery => delivery.deliveryPersonId === deliveryPersonId);
  }

  async createDelivery(delivery: InsertDelivery): Promise<Delivery> {
    const id = this.deliveryCurrentId++;
    const newDelivery: Delivery = { ...delivery, id };
    this.deliveries.set(id, newDelivery);
    return newDelivery;
  }

  async updateDeliveryStatus(id: number, status: string): Promise<Delivery | undefined> {
    const delivery = this.deliveries.get(id);
    if (!delivery) return undefined;
    
    // @ts-ignore - We're ensuring status is a valid enum value in the API layer
    const updatedDelivery = { ...delivery, status };
    this.deliveries.set(id, updatedDelivery);
    return updatedDelivery;
  }

  async updateDeliveryTimes(id: number, updates: { 
    startTime?: Date; 
    completedTime?: Date; 
  }): Promise<Delivery | undefined> {
    const delivery = this.deliveries.get(id);
    if (!delivery) return undefined;
    
    const updatedDelivery = { ...delivery, ...updates };
    this.deliveries.set(id, updatedDelivery);
    return updatedDelivery;
  }

  // Payment operations
  async getPayment(id: number): Promise<Payment | undefined> {
    return this.payments.get(id);
  }

  async getPayments(limit = 100, offset = 0): Promise<Payment[]> {
    return Array.from(this.payments.values())
      .slice(offset, offset + limit);
  }

  async getPaymentsByOrder(orderId: number): Promise<Payment[]> {
    return Array.from(this.payments.values())
      .filter(payment => payment.orderId === orderId);
  }

  async createPayment(payment: InsertPayment): Promise<Payment> {
    const id = this.paymentCurrentId++;
    const createdAt = new Date();
    const newPayment: Payment = { ...payment, id, createdAt };
    this.payments.set(id, newPayment);
    return newPayment;
  }

  async updatePaymentStatus(id: number, status: string): Promise<Payment | undefined> {
    const payment = this.payments.get(id);
    if (!payment) return undefined;
    
    // @ts-ignore - We're ensuring status is a valid enum value in the API layer
    const updatedPayment = { ...payment, status };
    this.payments.set(id, updatedPayment);
    return updatedPayment;
  }
  
  // Subscription operations
  async getSubscription(id: number): Promise<Subscription | undefined> {
    return this.subscriptions.get(id);
  }

  async getSubscriptionByFarmer(farmerId: number): Promise<Subscription | undefined> {
    return Array.from(this.subscriptions.values())
      .find(subscription => subscription.farmerId === farmerId);
  }

  async createSubscription(subscription: InsertSubscription): Promise<Subscription> {
    const id = this.subscriptionCurrentId++;
    const newSubscription: Subscription = { ...subscription, id };
    this.subscriptions.set(id, newSubscription);
    return newSubscription;
  }

  async updateSubscription(id: number, updates: Partial<InsertSubscription>): Promise<Subscription | undefined> {
    const subscription = this.subscriptions.get(id);
    if (!subscription) return undefined;
    
    const updatedSubscription = { ...subscription, ...updates };
    this.subscriptions.set(id, updatedSubscription);
    return updatedSubscription;
  }

  async cancelSubscription(id: number): Promise<Subscription | undefined> {
    const subscription = this.subscriptions.get(id);
    if (!subscription) return undefined;
    
    const updatedSubscription = { ...subscription, isActive: false };
    this.subscriptions.set(id, updatedSubscription);
    return updatedSubscription;
  }
  
  // Subscription payment operations
  async getSubscriptionPayments(subscriptionId: number): Promise<SubscriptionPayment[]> {
    return Array.from(this.subscriptionPayments.values())
      .filter(payment => payment.subscriptionId === subscriptionId);
  }

  async createSubscriptionPayment(payment: InsertSubscriptionPayment): Promise<SubscriptionPayment> {
    const id = this.subscriptionPaymentCurrentId++;
    const newPayment: SubscriptionPayment = { ...payment, id };
    this.subscriptionPayments.set(id, newPayment);
    return newPayment;
  }

  async updateSubscriptionPaymentStatus(id: number, status: string): Promise<SubscriptionPayment | undefined> {
    const payment = this.subscriptionPayments.get(id);
    if (!payment) return undefined;
    
    // @ts-ignore - We're ensuring status is a valid enum value in the API layer
    const updatedPayment = { ...payment, status };
    this.subscriptionPayments.set(id, updatedPayment);
    return updatedPayment;
  }

  // Review operations
  async getReviewsByProduct(productId: number): Promise<Review[]> {
    return Array.from(this.reviews.values())
      .filter(review => review.productId === productId);
  }

  async getReviewsByUser(userId: number): Promise<Review[]> {
    return Array.from(this.reviews.values())
      .filter(review => review.userId === userId);
  }

  async createReview(review: InsertReview): Promise<Review> {
    const id = this.reviewCurrentId++;
    const createdAt = new Date();
    const newReview: Review = { 
      ...review, 
      id, 
      createdAt, 
      helpfulCount: 0 
    };
    this.reviews.set(id, newReview);
    return newReview;
  }

  async updateReviewHelpful(id: number, increment: number): Promise<Review | undefined> {
    const review = this.reviews.get(id);
    if (!review) return undefined;
    
    const updatedHelpfulCount = review.helpfulCount + increment;
    const updatedReview = { ...review, helpfulCount: updatedHelpfulCount };
    this.reviews.set(id, updatedReview);
    return updatedReview;
  }
  
  // Product recommendation operations
  async getRecommendedProducts(productId: number, limit = 5): Promise<Product[]> {
    // Get the recommendations for this product
    const recommendations = Array.from(this.productRecommendations.values())
      .filter(rec => rec.sourceProductId === productId)
      .sort((a, b) => b.score - a.score) // Sort by score descending
      .slice(0, limit);
    
    // Map recommendations to products
    const recommendedProductIds = recommendations.map(rec => rec.recommendedProductId);
    return Array.from(this.products.values())
      .filter(product => recommendedProductIds.includes(product.id));
  }

  async getPersonalizedRecommendations(userId: number, limit = 10): Promise<Product[]> {
    // Get the user's order history
    const orders = await this.getOrdersByCustomer(userId);
    if (orders.length === 0) {
      // If no order history, return featured products instead
      return this.getFeaturedProducts();
    }
    
    // Get all order items for these orders
    const orderItems: OrderItem[] = [];
    for (const order of orders) {
      const items = await this.getOrderItems(order.id);
      orderItems.push(...items);
    }
    
    // Get the product IDs the user has purchased
    const purchasedProductIds = [...new Set(orderItems.map(item => item.productId))];
    
    // Get recommendations based on purchased products
    const recommendations: ProductRecommendation[] = [];
    for (const productId of purchasedProductIds) {
      const productRecs = Array.from(this.productRecommendations.values())
        .filter(rec => rec.sourceProductId === productId);
      recommendations.push(...productRecs);
    }
    
    // Sort by score and limit
    const sortedRecs = recommendations
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
    
    // Map to products and filter out duplicates and already purchased products
    const recommendedProductIds = [...new Set(sortedRecs.map(rec => rec.recommendedProductId))];
    return Array.from(this.products.values())
      .filter(product => 
        recommendedProductIds.includes(product.id) && 
        !purchasedProductIds.includes(product.id)
      );
  }

  async createProductRecommendation(recommendation: InsertProductRecommendation): Promise<ProductRecommendation> {
    const id = this.productRecommendationCurrentId++;
    const newRecommendation: ProductRecommendation = { ...recommendation, id };
    this.productRecommendations.set(id, newRecommendation);
    return newRecommendation;
  }

  async updateProductRecommendation(id: number, updates: Partial<InsertProductRecommendation>): Promise<ProductRecommendation | undefined> {
    const recommendation = this.productRecommendations.get(id);
    if (!recommendation) return undefined;
    
    const updatedRecommendation = { ...recommendation, ...updates };
    this.productRecommendations.set(id, updatedRecommendation);
    return updatedRecommendation;
  }
}

export const storage = new MemStorage();

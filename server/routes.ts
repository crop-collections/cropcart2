import express, { type Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema, 
  insertProductSchema, 
  insertOrderSchema, 
  insertOrderItemSchema, 
  insertCartItemSchema,
  insertDeliverySchema,
  orderStatusEnum
} from "@shared/schema";
import multer from "multer";
import path from "path";
import { z } from "zod";
import crypto from "crypto";
import Stripe from "stripe";

// JWT for authentication
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

// JWT secret - in a real application, this would be in an env variable
const JWT_SECRET = process.env.JWT_SECRET || "farm_fresh_secret_key";

// Create multer storage for file uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, path.join(process.cwd(), "dist/public/uploads"));
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      const ext = path.extname(file.originalname);
      cb(null, file.fieldname + "-" + uniqueSuffix + ext);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only images are allowed"));
    }
  },
});

// Helper function to generate JWT token
const generateToken = (user: { id: number; username: string; role: string }) => {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
};

// Middleware to validate JWT token
const authenticate = (req: Request, res: Response, next: Function) => {
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
    
    // @ts-ignore
    req.user = decoded;
    return next();
  });
};

// Middleware to check user role
const checkRole = (role: string) => {
  return (req: Request, res: Response, next: Function) => {
    // @ts-ignore
    if (req.user.role !== role) {
      return res.status(403).json({ message: "Access denied" });
    }
    
    return next();
  };
};

export async function registerRoutes(app: Express): Promise<Server> {
  // parse application/json
  app.use(express.json());
  
  // Create HTTP server
  const httpServer = createServer(app);
  
  // API routes
  app.use("/api", express.Router());
  
  // Authentication routes
  app.post("/api/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      // Hash the password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(userData.password, salt);
      
      // Create new user with hashed password
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword,
      });
      
      // Generate JWT token
      const token = generateToken({
        id: user.id,
        username: user.username,
        role: user.role,
      });
      
      // Return user without password and token
      const { password, ...userWithoutPassword } = user;
      return res.status(201).json({
        user: userWithoutPassword,
        token,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.post("/api/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      // Validate input
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }
      
      // Find user by username
      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Check password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Generate JWT token
      const token = generateToken({
        id: user.id,
        username: user.username,
        role: user.role,
      });
      
      // Return user without password and token
      const { password: _, ...userWithoutPassword } = user;
      return res.json({
        user: userWithoutPassword,
        token,
      });
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // User profile route
  app.get("/api/me", authenticate, async (req, res) => {
    try {
      // @ts-ignore
      const userId = req.user.id;
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Return user without password
      const { password, ...userWithoutPassword } = user;
      return res.json(userWithoutPassword);
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Category routes
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getCategories();
      return res.json(categories);
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Product routes
  app.get("/api/products", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;
      const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;
      const categoryId = req.query.categoryId ? parseInt(req.query.categoryId as string) : null;
      
      let products;
      if (categoryId) {
        products = await storage.getProductsByCategory(categoryId);
      } else {
        products = await storage.getProducts(limit, offset);
      }
      
      return res.json(products);
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.get("/api/products/featured", async (req, res) => {
    try {
      const products = await storage.getFeaturedProducts();
      return res.json(products);
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Get farmer's products (farmer only)
  app.get("/api/farmer/products", authenticate, checkRole("farmer"), async (req, res) => {
    try {
      // @ts-ignore
      const farmerId = req.user.id;
      const products = await storage.getProductsByFarmer(farmerId);
      return res.json(products);
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.get("/api/products/:id", async (req, res) => {
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
  
  // Create product (farmer only)
  app.post("/api/products", authenticate, checkRole("farmer"), upload.array("images", 5), async (req, res) => {
    try {
      // @ts-ignore
      const farmerId = req.user.id;
      
      // Get file paths
      const fileUrls = (req.files as Express.Multer.File[]).map(
        (file) => `/uploads/${file.filename}`
      );
      
      // Parse product data
      const productData = insertProductSchema.parse({
        ...req.body,
        price: parseFloat(req.body.price),
        stock: parseInt(req.body.stock),
        categoryId: parseInt(req.body.categoryId),
        farmerId,
        imageUrls: fileUrls,
        organic: req.body.organic === "true",
        featured: req.body.featured === "true",
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
  
  // Update product (farmer only)
  app.put("/api/products/:id", authenticate, checkRole("farmer"), upload.array("images", 5), async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      // @ts-ignore
      const farmerId = req.user.id;
      
      // Check if product exists and belongs to the farmer
      const existingProduct = await storage.getProduct(productId);
      if (!existingProduct) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      if (existingProduct.farmerId !== farmerId) {
        return res.status(403).json({ message: "You don't have permission to update this product" });
      }
      
      // Get file paths for any new images
      const fileUrls = (req.files as Express.Multer.File[]).map(
        (file) => `/uploads/${file.filename}`
      );
      
      // Combine existing images with new ones if present
      const imageUrls = fileUrls.length > 0 
        ? fileUrls
        : existingProduct.imageUrls;
      
      // Prepare update data
      const updateData: Partial<typeof insertProductSchema._type> = {
        ...req.body,
        imageUrls,
      };
      
      // Convert numeric fields
      if (req.body.price) updateData.price = parseFloat(req.body.price);
      if (req.body.stock) updateData.stock = parseInt(req.body.stock);
      if (req.body.categoryId) updateData.categoryId = parseInt(req.body.categoryId);
      if (req.body.organic !== undefined) updateData.organic = req.body.organic === "true";
      if (req.body.featured !== undefined) updateData.featured = req.body.featured === "true";
      
      const updatedProduct = await storage.updateProduct(productId, updateData);
      return res.json(updatedProduct);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Delete product (farmer only)
  app.delete("/api/products/:id", authenticate, checkRole("farmer"), async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      // @ts-ignore
      const farmerId = req.user.id;
      
      // Check if product exists and belongs to the farmer
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
  
  // Cart routes
  app.get("/api/cart", authenticate, async (req, res) => {
    try {
      // @ts-ignore
      const userId = req.user.id;
      
      const cartItems = await storage.getCartItems(userId);
      
      // Get product details for each cart item
      const cartItemsWithDetails = await Promise.all(
        cartItems.map(async (item) => {
          const product = await storage.getProduct(item.productId);
          return {
            ...item,
            product,
          };
        })
      );
      
      return res.json(cartItemsWithDetails);
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.post("/api/cart", authenticate, async (req, res) => {
    try {
      // @ts-ignore
      const userId = req.user.id;
      
      const cartItemData = insertCartItemSchema.parse({
        ...req.body,
        userId,
        quantity: parseInt(req.body.quantity),
        productId: parseInt(req.body.productId),
      });
      
      const cartItem = await storage.addCartItem(cartItemData);
      
      // Get product details
      const product = await storage.getProduct(cartItem.productId);
      
      return res.status(201).json({
        ...cartItem,
        product,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.put("/api/cart/:id", authenticate, async (req, res) => {
    try {
      const cartItemId = parseInt(req.params.id);
      // @ts-ignore
      const userId = req.user.id;
      
      const quantity = parseInt(req.body.quantity);
      if (isNaN(quantity) || quantity < 1) {
        return res.status(400).json({ message: "Invalid quantity" });
      }
      
      // Check if cart item exists and belongs to the user
      const existingCartItem = await storage.getCartItems(userId);
      const cartItem = existingCartItem.find(item => item.id === cartItemId);
      
      if (!cartItem) {
        return res.status(404).json({ message: "Cart item not found" });
      }
      
      const updatedCartItem = await storage.updateCartItemQuantity(cartItemId, quantity);
      
      // Get product details
      const product = await storage.getProduct(updatedCartItem!.productId);
      
      return res.json({
        ...updatedCartItem,
        product,
      });
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.delete("/api/cart/:id", authenticate, async (req, res) => {
    try {
      const cartItemId = parseInt(req.params.id);
      // @ts-ignore
      const userId = req.user.id;
      
      // Check if cart item exists and belongs to the user
      const existingCartItem = await storage.getCartItems(userId);
      const cartItem = existingCartItem.find(item => item.id === cartItemId);
      
      if (!cartItem) {
        return res.status(404).json({ message: "Cart item not found" });
      }
      
      await storage.removeCartItem(cartItemId);
      return res.status(204).end();
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.delete("/api/cart", authenticate, async (req, res) => {
    try {
      // @ts-ignore
      const userId = req.user.id;
      
      await storage.clearCart(userId);
      return res.status(204).end();
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Order routes
  app.post("/api/orders", authenticate, checkRole("customer"), async (req, res) => {
    try {
      // @ts-ignore
      const customerId = req.user.id;
      
      // Get cart items
      const cartItems = await storage.getCartItems(customerId);
      if (cartItems.length === 0) {
        return res.status(400).json({ message: "Cart is empty" });
      }
      
      // Calculate total amount
      let totalAmount = 0;
      const orderItemsData = await Promise.all(
        cartItems.map(async (item) => {
          const product = await storage.getProduct(item.productId);
          if (!product) {
            throw new Error(`Product ${item.productId} not found`);
          }
          
          const itemTotal = parseFloat(product.price as unknown as string) * item.quantity;
          totalAmount += itemTotal;
          
          return {
            productId: item.productId,
            quantity: item.quantity,
            price: product.price,
          };
        })
      );
      
      // Create order
      const orderData = insertOrderSchema.parse({
        ...req.body,
        customerId,
        totalAmount,
      });
      
      const order = await storage.createOrder(orderData);
      
      // Create order items
      await Promise.all(
        orderItemsData.map(async (item) => {
          return storage.createOrderItem({
            ...item,
            orderId: order.id,
          });
        })
      );
      
      // Clear cart
      await storage.clearCart(customerId);
      
      return res.status(201).json(order);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.get("/api/orders", authenticate, async (req, res) => {
    try {
      // @ts-ignore
      const userId = req.user.id;
      // @ts-ignore
      const userRole = req.user.role;
      
      let orders;
      if (userRole === "customer") {
        orders = await storage.getOrdersByCustomer(userId);
      } else if (userRole === "delivery") {
        orders = await storage.getOrdersByDeliveryPerson(userId);
      } else if (userRole === "farmer") {
        // For farmers, we need to get orders that contain their products
        // This is a more complex query that would be easier in SQL
        // For simplicity in this in-memory implementation, we'll return empty array
        orders = [];
      } else {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      return res.json(orders);
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.get("/api/orders/:id", authenticate, async (req, res) => {
    try {
      const orderId = parseInt(req.params.id);
      
      const order = await storage.getOrder(orderId);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      // @ts-ignore
      const userId = req.user.id;
      // @ts-ignore
      const userRole = req.user.role;
      
      // Check if user has access to order
      if (
        (userRole === "customer" && order.customerId !== userId) ||
        (userRole === "delivery" && order.deliveryPersonId !== userId)
      ) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      // Get order items
      const orderItems = await storage.getOrderItems(orderId);
      
      // Get product details for each order item
      const orderItemsWithDetails = await Promise.all(
        orderItems.map(async (item) => {
          const product = await storage.getProduct(item.productId);
          return {
            ...item,
            product,
          };
        })
      );
      
      return res.json({
        ...order,
        items: orderItemsWithDetails,
      });
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.patch("/api/orders/:id/status", authenticate, async (req, res) => {
    try {
      const orderId = parseInt(req.params.id);
      const { status } = req.body;
      
      // Validate status
      if (!Object.values(orderStatusEnum.enumValues).includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      
      const order = await storage.getOrder(orderId);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      // @ts-ignore
      const userId = req.user.id;
      // @ts-ignore
      const userRole = req.user.role;
      
      // Check if user has permission to update status
      if (userRole === "customer" && order.customerId !== userId) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      if (userRole === "delivery" && order.deliveryPersonId !== userId) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      // Customer can only cancel
      if (userRole === "customer" && status !== "cancelled") {
        return res.status(403).json({ message: "Customers can only cancel orders" });
      }
      
      // Update order status
      const updatedOrder = await storage.updateOrderStatus(orderId, status);
      
      // If there's a delivery associated with the order, update its status too
      // In a real application, this would be handled by a transaction
      if (order.deliveryPersonId) {
        const deliveries = await Promise.all([
          ...Array.from((await storage.getDeliveriesByDeliveryPerson(order.deliveryPersonId as number))
            .filter(delivery => delivery.orderId === orderId))
        ]);
        
        if (deliveries.length > 0) {
          await storage.updateDeliveryStatus(deliveries[0].id, status);
        }
      }
      
      return res.json(updatedOrder);
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Assign delivery person to order (admin only in a real app)
  app.patch("/api/orders/:id/delivery", authenticate, checkRole("delivery"), async (req, res) => {
    try {
      const orderId = parseInt(req.params.id);
      // @ts-ignore
      const deliveryPersonId = req.user.id;
      
      const order = await storage.getOrder(orderId);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      // Check if order already has a delivery person
      if (order.deliveryPersonId) {
        return res.status(400).json({ message: "Order already has a delivery person assigned" });
      }
      
      // Assign delivery person
      const updatedOrder = await storage.assignDeliveryPerson(orderId, deliveryPersonId);
      
      // Create delivery
      await storage.createDelivery({
        deliveryPersonId,
        orderId,
        status: "confirmed",
        scheduledTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
        routeInfo: {},
      });
      
      return res.json(updatedOrder);
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Delivery routes
  app.get("/api/deliveries", authenticate, checkRole("delivery"), async (req, res) => {
    try {
      // @ts-ignore
      const deliveryPersonId = req.user.id;
      
      const deliveries = await storage.getDeliveriesByDeliveryPerson(deliveryPersonId);
      
      // Get order details for each delivery
      const deliveriesWithDetails = await Promise.all(
        deliveries.map(async (delivery) => {
          const order = await storage.getOrder(delivery.orderId);
          return {
            ...delivery,
            order,
          };
        })
      );
      
      return res.json(deliveriesWithDetails);
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.get("/api/deliveries/:id", authenticate, checkRole("delivery"), async (req, res) => {
    try {
      const deliveryId = parseInt(req.params.id);
      // @ts-ignore
      const deliveryPersonId = req.user.id;
      
      const delivery = await storage.getDelivery(deliveryId);
      if (!delivery) {
        return res.status(404).json({ message: "Delivery not found" });
      }
      
      // Check if delivery belongs to the delivery person
      if (delivery.deliveryPersonId !== deliveryPersonId) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      // Get order details
      const order = await storage.getOrder(delivery.orderId);
      
      // Get order items
      const orderItems = await storage.getOrderItems(delivery.orderId);
      
      // Get product details for each order item
      const orderItemsWithDetails = await Promise.all(
        orderItems.map(async (item) => {
          const product = await storage.getProduct(item.productId);
          return {
            ...item,
            product,
          };
        })
      );
      
      return res.json({
        ...delivery,
        order: {
          ...order,
          items: orderItemsWithDetails,
        },
      });
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.patch("/api/deliveries/:id/status", authenticate, checkRole("delivery"), async (req, res) => {
    try {
      const deliveryId = parseInt(req.params.id);
      const { status } = req.body;
      
      // Validate status
      if (!Object.values(orderStatusEnum.enumValues).includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      
      // @ts-ignore
      const deliveryPersonId = req.user.id;
      
      const delivery = await storage.getDelivery(deliveryId);
      if (!delivery) {
        return res.status(404).json({ message: "Delivery not found" });
      }
      
      // Check if delivery belongs to the delivery person
      if (delivery.deliveryPersonId !== deliveryPersonId) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      // Update delivery status
      const updatedDelivery = await storage.updateDeliveryStatus(deliveryId, status);
      
      // Update corresponding order status
      await storage.updateOrderStatus(delivery.orderId, status);
      
      // If status is out_for_delivery, set start time
      if (status === "out_for_delivery") {
        await storage.updateDeliveryTimes(deliveryId, {
          startTime: new Date(),
        });
      }
      
      // If status is delivered, set completed time
      if (status === "delivered") {
        await storage.updateDeliveryTimes(deliveryId, {
          completedTime: new Date(),
        });
      }
      
      return res.json(updatedDelivery);
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Register payment routes
  // We'll manually register each payment route here
  const paymentsPrefix = "/api/payments";
  
  // Create a checkout session for order payment
  app.post(`${paymentsPrefix}/checkout`, async (req, res) => {
    try {
      const { orderId, customerId, amount, tipAmount, email, name, description, currency } = req.body;
      
      if (!orderId || !customerId || !amount || !email || !name) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
      
      // Check if the order exists
      const order = await storage.getOrder(orderId);
      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }
      
      // Check if user has permission to pay for this order
      if (order.customerId !== customerId) {
        return res.status(403).json({ error: 'Unauthorized' });
      }
      
      // Import the payment processor dynamically
      const stripeModule = await import('./payments/stripe');
      const { processPayment } = stripeModule;
      
      const checkoutData = {
        orderId,
        customerId,
        amount: parseFloat(amount),
        currency: currency || 'cad', // Default to CAD if not provided
        customerEmail: email,
        customerName: name,
        paymentMethod: 'credit_card',
        description: description || `Payment for order #${orderId}`,
        tipAmount: tipAmount ? parseFloat(tipAmount) : undefined,
      };
      
      const result = await processPayment(checkoutData);
      
      if (result.success) {
        return res.status(200).json({
          success: true,
          paymentId: result.paymentId,
          checkoutUrl: result.sessionUrl,
        });
      } else {
        return res.status(400).json({
          success: false,
          error: result.error,
        });
      }
    } catch (error: any) {
      console.error('Checkout error:', error);
      return res.status(500).json({ error: error.message || 'Internal server error' });
    }
  });
  
  // Get payment by ID
  app.get(`${paymentsPrefix}/:id`, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid payment ID' });
      }
      
      const payment = await storage.getPayment(id);
      if (!payment) {
        return res.status(404).json({ error: 'Payment not found' });
      }
      
      return res.status(200).json(payment);
    } catch (error: any) {
      console.error('Get payment error:', error);
      return res.status(500).json({ error: error.message || 'Internal server error' });
    }
  });
  
  // Get payments for an order
  app.get(`${paymentsPrefix}/order/:orderId`, async (req, res) => {
    try {
      const orderId = parseInt(req.params.orderId);
      if (isNaN(orderId)) {
        return res.status(400).json({ error: 'Invalid order ID' });
      }
      
      const payments = await storage.getPaymentsByOrder(orderId);
      return res.status(200).json(payments);
    } catch (error: any) {
      console.error('Get order payments error:', error);
      return res.status(500).json({ error: error.message || 'Internal server error' });
    }
  });
  
  // Create subscription for a farmer
  app.post(`${paymentsPrefix}/subscription`, async (req, res) => {
    try {
      const { farmerId, email, tier, price } = req.body;
      
      if (!farmerId || !email || !tier || !price) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
      
      // Validate farmer ID
      const farmer = await storage.getUser(farmerId);
      if (!farmer || farmer.role !== 'farmer') {
        return res.status(404).json({ error: 'Farmer not found' });
      }
      
      // Check if the farmer already has an active subscription
      const existingSubscription = await storage.getSubscriptionByFarmer(farmerId);
      if (existingSubscription && existingSubscription.isActive) {
        return res.status(400).json({ 
          error: 'Farmer already has an active subscription',
          subscriptionId: existingSubscription.id
        });
      }
      
      // Import the subscription processor dynamically
      const stripeModule = await import('./payments/stripe');
      const { createSubscription } = stripeModule;
      
      // Create a new subscription
      const result = await createSubscription(
        farmerId,
        email,
        tier,
        parseFloat(price)
      );
      
      if (result.success) {
        return res.status(200).json({
          success: true,
          subscriptionId: result.subscriptionId,
          checkoutUrl: result.sessionUrl,
        });
      } else {
        return res.status(400).json({
          success: false,
          error: result.error,
        });
      }
    } catch (error: any) {
      console.error('Create subscription error:', error);
      return res.status(500).json({ error: error.message || 'Internal server error' });
    }
  });
  
  // Get subscription by farmer ID
  app.get(`${paymentsPrefix}/subscription/farmer/:farmerId`, async (req, res) => {
    try {
      const farmerId = parseInt(req.params.farmerId);
      if (isNaN(farmerId)) {
        return res.status(400).json({ error: 'Invalid farmer ID' });
      }
      
      const subscription = await storage.getSubscriptionByFarmer(farmerId);
      if (!subscription) {
        return res.status(404).json({ error: 'Subscription not found' });
      }
      
      return res.status(200).json(subscription);
    } catch (error: any) {
      console.error('Get farmer subscription error:', error);
      return res.status(500).json({ error: error.message || 'Internal server error' });
    }
  });
  
  // Cancel subscription
  app.post(`${paymentsPrefix}/subscription/:id/cancel`, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid subscription ID' });
      }
      
      const subscription = await storage.getSubscription(id);
      if (!subscription) {
        return res.status(404).json({ error: 'Subscription not found' });
      }
      
      const updatedSubscription = await storage.cancelSubscription(id);
      return res.status(200).json({ 
        success: true, 
        subscription: updatedSubscription 
      });
    } catch (error: any) {
      console.error('Cancel subscription error:', error);
      return res.status(500).json({ error: error.message || 'Internal server error' });
    }
  });
  
  // Webhook handler for Stripe events
  app.post(`${paymentsPrefix}/webhook`, express.raw({type: 'application/json'}), async (req, res) => {
    try {
      const signature = req.headers['stripe-signature'] as string;
      
      if (!signature) {
        return res.status(400).json({ error: 'Missing Stripe signature' });
      }
      
      // Parse the event from the request body and signature
      let event;
      try {
        // Import the stripe module dynamically
        const stripeModule = await import('./payments/stripe');
        
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'dummy_key', {
          apiVersion: '2023-10-16',
        });
        
        event = stripe.webhooks.constructEvent(
          req.body,
          signature,
          process.env.STRIPE_WEBHOOK_SECRET || ''
        );
      } catch (err: any) {
        console.error('Webhook signature verification failed:', err.message);
        return res.status(400).json({ error: err.message });
      }
      
      // Handle the event based on its type
      let handled = false;
      
      // Import the webhook handlers dynamically
      const stripeModule = await import('./payments/stripe');
      const { handleStripeWebhook } = stripeModule;
      
      // Handle payment-related events
      if (event.type.startsWith('checkout.session') || 
          event.type.startsWith('customer.subscription') || 
          event.type.startsWith('invoice')) {
        handled = await handleStripeWebhook(event);
      }
      
      if (handled) {
        return res.status(200).json({ received: true });
      } else {
        console.log(`Unhandled event type ${event.type}`);
        return res.status(200).json({ received: true, handled: false });
      }
    } catch (error: any) {
      console.error('Webhook error:', error);
      return res.status(500).json({ error: error.message || 'Internal server error' });
    }
  });
  
  return httpServer;
}

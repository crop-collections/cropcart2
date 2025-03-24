import { Request, Response, Router } from 'express';
import { storage } from '../storage';
import { processPayment, handleStripeWebhook, createSubscription, CheckoutRequestData } from '../payments/stripe';
import { z } from 'zod';
import { insertPaymentSchema, paymentMethodEnum, paymentStatusEnum } from '@shared/schema';

const router = Router();

// Create a checkout session for order payment
router.post('/checkout', async (req: Request, res: Response) => {
  try {
    const { orderId, customerId, amount, tipAmount, email, name, description } = req.body;
    
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
    
    const checkoutData: CheckoutRequestData = {
      orderId,
      customerId,
      amount: parseFloat(amount),
      currency: 'usd',
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

// Webhook handler for Stripe events
router.post('/webhook', async (req: Request, res: Response) => {
  try {
    const signature = req.headers['stripe-signature'] as string;
    
    if (!signature) {
      return res.status(400).json({ error: 'Missing Stripe signature' });
    }
    
    // Parse the event from the request body and signature
    let event;
    try {
      const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
      event = stripe.webhooks.constructEvent(
        req.body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      return res.status(400).json({ error: err.message });
    }
    
    // Handle the event based on its type
    let handled = false;
    
    // Handle payment-related events
    if (event.type.startsWith('checkout.session')) {
      handled = await handleStripeWebhook(event);
    }
    
    // Handle subscription-related events
    if (event.type.startsWith('customer.subscription') || 
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

// Get payment by ID
router.get('/:id', async (req: Request, res: Response) => {
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
router.get('/order/:orderId', async (req: Request, res: Response) => {
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
router.post('/subscription', async (req: Request, res: Response) => {
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
router.get('/subscription/farmer/:farmerId', async (req: Request, res: Response) => {
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
router.post('/subscription/:id/cancel', async (req: Request, res: Response) => {
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

export default router;
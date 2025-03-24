import { storage } from '../storage';
import { InsertPayment, InsertSubscription, InsertSubscriptionPayment, Payment } from '@shared/schema';
import Stripe from 'stripe';

// Initialize Stripe with the API key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'dummy_key', {
  apiVersion: '2023-10-16', // Updated API version
});

export class PaymentError extends Error {
  public code: string;
  
  constructor(message: string, code: string) {
    super(message);
    this.code = code;
    this.name = 'PaymentError';
  }
}

interface PaymentMethodDetails {
  id: string;
  type: string;
  cardBrand?: string;
  last4?: string;
  expiryMonth?: number;
  expiryYear?: number;
}

interface CheckoutResult {
  paymentId: number;
  success: boolean;
  sessionUrl?: string;
  error?: string;
}

interface SubscriptionResult {
  subscriptionId: number;
  success: boolean;
  sessionUrl?: string;
  error?: string;
}

export interface CheckoutRequestData {
  orderId: number;
  amount: number;
  currency: string;
  customerId: number;
  customerEmail: string;
  customerName: string;
  paymentMethod: string;
  description: string;
  tipAmount?: number;
  metadata?: Record<string, string>;
}

/**
 * Process a payment through Stripe
 */
export async function processPayment(data: CheckoutRequestData): Promise<CheckoutResult> {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new PaymentError('Stripe API key is not configured', 'no_api_key');
    }
    
    // Create a payment record in pending status
    const paymentData: InsertPayment = {
      orderId: data.orderId,
      amount: data.amount.toString(),
      method: data.paymentMethod as any,
      status: 'pending',
      transactionId: null,
      tipAmount: data.tipAmount ? data.tipAmount.toString() : null,
      paymentDetails: {},
    };
    
    const payment = await storage.createPayment(paymentData);
    
    // Create a checkout session with Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'cad', // Always use CAD currency
            product_data: {
              name: data.description,
            },
            unit_amount: Math.round(data.amount * 100), // Convert to cents
          },
          quantity: 1,
        },
        // Add tip as separate line item if provided
        ...(data.tipAmount && data.tipAmount > 0
          ? [
              {
                price_data: {
                  currency: 'cad', // Always use CAD currency
                  product_data: {
                    name: 'Tip',
                  },
                  unit_amount: Math.round(data.tipAmount * 100), // Convert to cents
                },
                quantity: 1,
              },
            ]
          : []),
      ],
      mode: 'payment',
      success_url: `${process.env.APP_URL || 'http://localhost:3000'}/order/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.APP_URL || 'http://localhost:3000'}/order/cancel?session_id={CHECKOUT_SESSION_ID}`,
      customer_email: data.customerEmail,
      metadata: {
        paymentId: payment.id.toString(),
        orderId: data.orderId.toString(),
        customerId: data.customerId.toString(),
        ...data.metadata,
      },
    });
    
    return {
      paymentId: payment.id,
      success: true,
      sessionUrl: session.url,
    };
  } catch (error: any) {
    console.error('Payment processing error:', error);
    
    if (error instanceof PaymentError) {
      return {
        paymentId: -1,
        success: false,
        error: error.message,
      };
    }
    
    return {
      paymentId: -1,
      success: false,
      error: error.message || 'Unknown payment error',
    };
  }
}

/**
 * Handle Stripe webhook events
 */
export async function handleStripeWebhook(event: Stripe.Event): Promise<boolean> {
  try {
    console.log(`Processing webhook event: ${event.type}`);
    
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const paymentId = session.metadata?.paymentId;
        
        if (!paymentId) {
          console.error('No payment ID in webhook data');
          return false;
        }
        
        // Update payment status in database
        await storage.updatePaymentStatus(parseInt(paymentId), 'completed');
        
        // Get the order ID from the metadata
        const orderId = session.metadata?.orderId;
        if (orderId) {
          // Update order status
          await storage.updateOrderStatus(parseInt(orderId), 'confirmed');
        }
        
        return true;
      }
      
      case 'checkout.session.expired':
      case 'checkout.session.async_payment_failed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const paymentId = session.metadata?.paymentId;
        
        if (!paymentId) {
          console.error('No payment ID in webhook data');
          return false;
        }
        
        // Update payment status in database
        await storage.updatePaymentStatus(parseInt(paymentId), 'failed');
        return true;
      }
      
      // Handle subscription-related events
      case 'customer.subscription.created': {
        const subscription = event.data.object as Stripe.Subscription;
        // Handle subscription creation
        return handleSubscriptionWebhook(event);
      }
      
      case 'customer.subscription.updated': {
        // Handle subscription update
        return handleSubscriptionWebhook(event);
      }
      
      case 'customer.subscription.deleted': {
        // Handle subscription cancellation
        return handleSubscriptionWebhook(event);
      }
      
      case 'invoice.paid': {
        // Handle successful subscription payment
        return handleSubscriptionWebhook(event);
      }
      
      case 'invoice.payment_failed': {
        // Handle failed subscription payment
        return handleSubscriptionWebhook(event);
      }
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
        return false;
    }
  } catch (error: any) {
    console.error('Error processing webhook:', error);
    return false;
  }
}

/**
 * Create a subscription for a farmer through Stripe
 */
export async function createSubscription(
  farmerId: number,
  email: string,
  tier: string,
  price: number
): Promise<SubscriptionResult> {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new PaymentError('Stripe API key is not configured', 'no_api_key');
    }
    
    // Create a subscription record
    const subscriptionData: InsertSubscription = {
      farmerId,
      tier: tier as any,
      price: price.toString(),
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      isActive: false, // Set to true after payment
      autoRenew: true,
      features: {},
    };
    
    const subscription = await storage.createSubscription(subscriptionData);
    
    // Create a checkout session for subscription
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'cad', // Change from 'usd' to 'cad'
            product_data: {
              name: `Farmer Subscription - ${tier} Tier`,
              description: 'Monthly subscription for farmers marketplace',
            },
            unit_amount: Math.round(price * 100), // Convert to cents
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.APP_URL || 'http://localhost:3000'}/dashboard?subscription=success`,
      cancel_url: `${process.env.APP_URL || 'http://localhost:3000'}/dashboard?subscription=cancel`,
      customer_email: email,
      metadata: {
        subscriptionId: subscription.id.toString(),
        farmerId: farmerId.toString(),
        tier,
      },
    });
    
    return {
      subscriptionId: subscription.id,
      success: true,
      sessionUrl: session.url,
    };
  } catch (error: any) {
    console.error('Subscription creation error:', error);
    
    if (error instanceof PaymentError) {
      return {
        subscriptionId: -1,
        success: false,
        error: error.message,
      };
    }
    
    return {
      subscriptionId: -1,
      success: false,
      error: error.message || 'Unknown subscription error',
    };
  }
}

/**
 * Handle subscription status update webhook
 */
export async function handleSubscriptionWebhook(event: Stripe.Event): Promise<boolean> {
  try {
    switch (event.type) {
      case 'customer.subscription.created': {
        const subscription = event.data.object as Stripe.Subscription;
        const subscriptionId = subscription.metadata?.subscriptionId;
        
        if (!subscriptionId) {
          console.error('No subscription ID in webhook data');
          return false;
        }
        
        // Activate the subscription in the database
        await storage.updateSubscription(parseInt(subscriptionId), {
          isActive: true,
        });
        
        return true;
      }
      
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const subscriptionId = subscription.metadata?.subscriptionId;
        
        if (!subscriptionId) {
          console.error('No subscription ID in webhook data');
          return false;
        }
        
        // Update subscription status based on Stripe status
        if (subscription.status === 'active') {
          await storage.updateSubscription(parseInt(subscriptionId), {
            isActive: true,
          });
        } else if (subscription.status === 'canceled' || subscription.status === 'unpaid') {
          await storage.updateSubscription(parseInt(subscriptionId), {
            isActive: false,
          });
        }
        
        return true;
      }
      
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const subscriptionId = subscription.metadata?.subscriptionId;
        
        if (!subscriptionId) {
          console.error('No subscription ID in webhook data');
          return false;
        }
        
        // Cancel the subscription in the database
        await storage.cancelSubscription(parseInt(subscriptionId));
        
        return true;
      }
      
      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = invoice.subscription as string;
        
        // Find the internal subscription ID from metadata
        const stripeSubscription = await stripe.subscriptions.retrieve(subscriptionId);
        const internalSubscriptionId = stripeSubscription.metadata?.subscriptionId;
        
        if (!internalSubscriptionId) {
          console.error('No internal subscription ID in webhook data');
          return false;
        }
        
        // Record a subscription payment
        if (invoice.amount_paid > 0) {
          const paymentData: InsertSubscriptionPayment = {
            subscriptionId: parseInt(internalSubscriptionId),
            amount: (invoice.amount_paid / 100).toString(), // Convert from cents to dollars
            method: 'credit_card',
            status: 'completed',
            transactionId: invoice.id,
            billingDate: new Date(invoice.created * 1000), // Convert from Unix timestamp
            details: invoice,
          };
          
          await storage.createSubscriptionPayment(paymentData);
          
          // Extend subscription end date
          const subscription = await storage.getSubscription(parseInt(internalSubscriptionId));
          if (subscription) {
            const newEndDate = new Date(subscription.endDate.getTime() + 30 * 24 * 60 * 60 * 1000); // Add 30 days
            await storage.updateSubscription(parseInt(internalSubscriptionId), {
              endDate: newEndDate,
              isActive: true,
            });
          }
        }
        
        return true;
      }
      
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = invoice.subscription as string;
        
        // Find the internal subscription ID from metadata
        const stripeSubscription = await stripe.subscriptions.retrieve(subscriptionId);
        const internalSubscriptionId = stripeSubscription.metadata?.subscriptionId;
        
        if (!internalSubscriptionId) {
          console.error('No internal subscription ID in webhook data');
          return false;
        }
        
        // Record failed payment
        const paymentData: InsertSubscriptionPayment = {
          subscriptionId: parseInt(internalSubscriptionId),
          amount: (invoice.amount_due / 100).toString(), // Convert from cents to dollars
          method: 'credit_card',
          status: 'failed',
          transactionId: invoice.id,
          billingDate: new Date(invoice.created * 1000), // Convert from Unix timestamp
          details: invoice,
        };
        
        await storage.createSubscriptionPayment(paymentData);
        
        return true;
      }
      
      default:
        return false;
    }
  } catch (error: any) {
    console.error('Error processing subscription webhook:', error);
    return false;
  }
}

/**
 * Utility function to find a payment by transaction ID
 */
async function findPaymentByTransactionId(transactionId: string): Promise<Payment | undefined> {
  const payments = await storage.getPayments();
  return payments.find(payment => payment.transactionId === transactionId);
}
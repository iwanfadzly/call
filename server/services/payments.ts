import Stripe from 'stripe'
import axios from 'axios'
import { prisma } from '../../lib/db'
import { logger } from '../utils/logger'

// Initialize payment providers
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16'
})

// Payment provider interface
interface PaymentProvider {
  createPayment(order: any): Promise<{
    paymentUrl: string;
    providerTxnId: string;
  }>;
  verifyPayment(txnId: string): Promise<boolean>;
}

// Stripe implementation
class StripeProvider implements PaymentProvider {
  async createPayment(order: any) {
    try {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: order.items.map((item: any) => ({
          price_data: {
            currency: 'myr',
            product_data: {
              name: item.product.name,
              description: item.product.description
            },
            unit_amount: Math.round(item.unitPrice * 100) // Convert to cents
          },
          quantity: item.quantity
        })),
        client_reference_id: order.id,
        customer_email: order.lead.email,
        mode: 'payment',
        success_url: `${process.env.NEXTAUTH_URL}/orders/${order.id}/success`,
        cancel_url: `${process.env.NEXTAUTH_URL}/orders/${order.id}/cancel`
      })

      return {
        paymentUrl: session.url!,
        providerTxnId: session.id
      }
    } catch (error) {
      logger.error('Stripe payment creation failed:', error)
      throw error
    }
  }

  async verifyPayment(txnId: string) {
    try {
      const session = await stripe.checkout.sessions.retrieve(txnId)
      return session.payment_status === 'paid'
    } catch (error) {
      logger.error('Stripe payment verification failed:', error)
      return false
    }
  }
}

// Billplz implementation
class BillplzProvider implements PaymentProvider {
  private apiKey: string
  private apiEndpoint: string

  constructor() {
    this.apiKey = process.env.BILLPLZ_SECRET_KEY!
    this.apiEndpoint = 'https://www.billplz.com/api/v3'
  }

  async createPayment(order: any) {
    try {
      const response = await axios.post(
        `${this.apiEndpoint}/bills`,
        {
          collection_id: process.env.BILLPLZ_COLLECTION_ID,
          email: order.lead.email,
          mobile: order.lead.phone,
          name: order.lead.name,
          amount: Math.round(order.totalAmount * 100), // Convert to cents
          description: `Order ${order.orderNo}`,
          callback_url: `${process.env.NEXTAUTH_URL}/api/payments/billplz/callback`,
          redirect_url: `${process.env.NEXTAUTH_URL}/orders/${order.id}/status`
        },
        {
          auth: {
            username: this.apiKey,
            password: ''
          }
        }
      )

      return {
        paymentUrl: response.data.url,
        providerTxnId: response.data.id
      }
    } catch (error) {
      logger.error('Billplz payment creation failed:', error)
      throw error
    }
  }

  async verifyPayment(txnId: string) {
    try {
      const response = await axios.get(
        `${this.apiEndpoint}/bills/${txnId}`,
        {
          auth: {
            username: this.apiKey,
            password: ''
          }
        }
      )
      return response.data.paid
    } catch (error) {
      logger.error('Billplz payment verification failed:', error)
      return false
    }
  }
}

// toyyibPay implementation
class ToyyibPayProvider implements PaymentProvider {
  private apiKey: string
  private apiEndpoint: string

  constructor() {
    this.apiKey = process.env.TOYYIBPAY_SECRET_KEY!
    this.apiEndpoint = 'https://toyyibpay.com/api'
  }

  async createPayment(order: any) {
    try {
      const response = await axios.post(
        `${this.apiEndpoint}/createBill`,
        {
          userSecretKey: this.apiKey,
          categoryCode: process.env.TOYYIBPAY_CATEGORY_CODE,
          billName: `Order ${order.orderNo}`,
          billDescription: order.items.map((item: any) => 
            `${item.product.name} x${item.quantity}`
          ).join(', '),
          billAmount: order.totalAmount * 100, // Convert to cents
          billReturnUrl: `${process.env.NEXTAUTH_URL}/orders/${order.id}/status`,
          billCallbackUrl: `${process.env.NEXTAUTH_URL}/api/payments/toyyibpay/callback`,
          billExternalReferenceNo: order.id,
          customerName: order.lead.name,
          customerEmail: order.lead.email,
          customerPhone: order.lead.phone
        }
      )

      return {
        paymentUrl: response.data.billpaymentUrl,
        providerTxnId: response.data.billCode
      }
    } catch (error) {
      logger.error('toyyibPay payment creation failed:', error)
      throw error
    }
  }

  async verifyPayment(txnId: string) {
    try {
      const response = await axios.post(
        `${this.apiEndpoint}/getBillTransactions`,
        {
          userSecretKey: this.apiKey,
          billCode: txnId
        }
      )
      return response.data[0]?.status === '1' // 1 = paid
    } catch (error) {
      logger.error('toyyibPay payment verification failed:', error)
      return false
    }
  }
}

// Factory to get payment provider
function getPaymentProvider(): PaymentProvider {
  const provider = process.env.PAYMENT_PROVIDER?.toLowerCase()

  switch (provider) {
    case 'stripe':
      return new StripeProvider()
    case 'billplz':
      return new BillplzProvider()
    case 'toyyibpay':
      return new ToyyibPayProvider()
    default:
      return new StripeProvider() // Default to Stripe
  }
}

// Initialize payment for an order
export async function initializePayment(order: any) {
  try {
    const provider = getPaymentProvider()
    const { paymentUrl, providerTxnId } = await provider.createPayment(order)

    // Create payment record
    await prisma.payment.create({
      data: {
        orderId: order.id,
        provider: process.env.PAYMENT_PROVIDER || 'STRIPE',
        providerTxnId,
        amount: order.totalAmount,
        status: 'PENDING'
      }
    })

    return { paymentUrl, providerTxnId }
  } catch (error) {
    logger.error('Payment initialization failed:', error)
    throw error
  }
}

// Verify payment status
export async function verifyPayment(paymentId: string) {
  try {
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: { order: true }
    })

    if (!payment) {
      throw new Error('Payment not found')
    }

    const provider = getPaymentProvider()
    const isPaid = await provider.verifyPayment(payment.providerTxnId!)

    if (isPaid && payment.status !== 'COMPLETED') {
      // Update payment status
      await prisma.payment.update({
        where: { id: paymentId },
        data: { 
          status: 'COMPLETED',
          updatedAt: new Date()
        }
      })

      // Update order status
      await prisma.order.update({
        where: { id: payment.orderId },
        data: { status: 'PAID' }
      })

      // Create lead activity
      await prisma.leadActivity.create({
        data: {
          leadId: payment.order.leadId,
          type: 'PAYMENT',
          title: 'Payment Completed',
          content: `Payment of RM${payment.amount} received via ${payment.provider}`,
          metadata: {
            paymentId,
            amount: payment.amount,
            provider: payment.provider
          }
        }
      })
    }

    return isPaid
  } catch (error) {
    logger.error('Payment verification failed:', error)
    throw error
  }
}

// Handle payment webhook
export async function handlePaymentWebhook(provider: string, payload: any) {
  try {
    let paymentId: string
    let isSuccessful: boolean

    switch (provider.toLowerCase()) {
      case 'stripe':
        const event = stripe.webhooks.constructEvent(
          payload.body,
          payload.headers['stripe-signature'],
          process.env.STRIPE_WEBHOOK_SECRET!
        )
        
        if (event.type === 'checkout.session.completed') {
          const session = event.data.object as Stripe.Checkout.Session
          paymentId = session.client_reference_id!
          isSuccessful = session.payment_status === 'paid'
        }
        break

      case 'billplz':
        paymentId = payload.body.reference_id
        isSuccessful = payload.body.paid === 'true'
        break

      case 'toyyibpay':
        paymentId = payload.body.refno
        isSuccessful = payload.body.status === '1'
        break

      default:
        throw new Error(`Unsupported payment provider: ${provider}`)
    }

    if (paymentId && isSuccessful) {
      await verifyPayment(paymentId)
    }

  } catch (error) {
    logger.error('Payment webhook handling failed:', error)
    throw error
  }
}

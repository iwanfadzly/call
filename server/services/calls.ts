import { Twilio } from 'twilio'
import OpenAI from 'openai'
import { prisma } from '../../lib/db'
import { logger } from '../utils/logger'
import config from '../config'
import { Retell } from '../../lib/retell'

// Initialize clients with error handling
let retell: Retell | null = null
let twilio: Twilio | null = null
let openai: OpenAI | null = null

try {
  retell = new Retell(config.ai.retell.apiKey)
} catch (error) {
  logger.warn('Retell client initialization failed:', error)
}

try {
  twilio = new Twilio(config.twilio.accountSid, config.twilio.authToken)
} catch (error) {
  logger.warn('Twilio client initialization failed:', error)
}

try {
  openai = new OpenAI({ apiKey: config.ai.openai.apiKey })
} catch (error) {
  logger.warn('OpenAI client initialization failed:', error)
}

// AI Agent tools
const agentTools = {
  getProductInfo: async (productId: string) => {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        knowledgeBase: true
      }
    })
    return product
  },

  quotePrice: async (productId: string, quantity: number = 1) => {
    const product = await prisma.product.findUnique({
      where: { id: productId }
    })
    if (!product) throw new Error('Product not found')
    return {
      unitPrice: product.price,
      totalPrice: product.price * quantity
    }
  },

  createOrder: async (leadId: string, items: Array<{ productId: string; quantity: number }>) => {
    const order = await prisma.order.create({
      data: {
        leadId,
        status: 'PENDING',
        channel: 'ONLINE',
        items: {
          create: items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: 0, // Will be updated after creation
            totalPrice: 0
          }))
        }
      },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    })

    // Update prices
    const updatedItems = await Promise.all(
      order.items.map(async (item) => {
        const { unitPrice, totalPrice } = await agentTools.quotePrice(item.productId, item.quantity)
        return prisma.orderItem.update({
          where: { id: item.id },
          data: { unitPrice, totalPrice }
        })
      })
    )

    // Update order total
    const totalAmount = updatedItems.reduce((sum, item) => sum + item.totalPrice, 0)
    return prisma.order.update({
      where: { id: order.id },
      data: { totalAmount }
    })
  },

  sendPaymentLink: async (orderId: string) => {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        lead: true,
        items: {
          include: {
            product: true
          }
        }
      }
    })
    if (!order) throw new Error('Order not found')

    // Mock payment link for development
    const paymentUrl = `https://payment.example.com/pay/${orderId}`
    
    // Update order with payment link
    await prisma.order.update({
      where: { id: orderId },
      data: { paymentLink: paymentUrl }
    })

    return paymentUrl
  },

  scheduleCallback: async (leadId: string, userId: string, delay: number) => {
    // Mock callback scheduling
    await prisma.leadActivity.create({
      data: {
        leadId,
        type: 'CALLBACK_SCHEDULED',
        title: 'Callback Scheduled',
        content: `Callback scheduled in ${Math.round(delay / 1000 / 60)} minutes`,
        metadata: { delay }
      }
    })

    return { scheduled: true, delay }
  },

  dnc: async (leadId: string, reason: string) => {
    await prisma.lead.update({
      where: { id: leadId },
      data: { status: 'DNC' }
    })

    await prisma.leadActivity.create({
      data: {
        leadId,
        type: 'DNC',
        title: 'Added to DNC',
        content: reason
      }
    })

    return true
  }
}

// Make call using Retell
async function makeRetellCall(leadId: string, userId: string, callType: string) {
  if (!retell) {
    throw new Error('Retell client not initialized')
  }

  const lead = await prisma.lead.findUnique({
    where: { id: leadId }
  })
  if (!lead) throw new Error('Lead not found')

  // Create call log
  const callLog = await prisma.callLog.create({
    data: {
      leadId,
      agentId: userId,
      provider: 'RETELL',
      type: callType,
      status: 'SCHEDULED'
    }
  })

  try {
    // Initialize Retell call
    const call = await retell.calls.create({
      phoneNumber: lead.phone,
      agentId: 'sales-agent-bm', // Bahasa Malaysia persona
      webhookUrl: `${config.auth.url}/api/calls/webhook`,
      metadata: {
        callId: callLog.id,
        leadId: lead.id,
        userId: userId
      }
    })

    // Update call log with provider data
    await prisma.callLog.update({
      where: { id: callLog.id },
      data: {
        providerCallId: call.id,
        status: 'IN_PROGRESS'
      }
    })

    return callLog

  } catch (error) {
    // Update call log with error
    await prisma.callLog.update({
      where: { id: callLog.id },
      data: {
        status: 'FAILED',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    })

    throw error
  }
}

// Make call using Twilio + OpenAI
async function makeTwilioCall(leadId: string, userId: string, callType: string) {
  if (!twilio) {
    throw new Error('Twilio client not initialized')
  }

  const lead = await prisma.lead.findUnique({
    where: { id: leadId }
  })
  if (!lead) throw new Error('Lead not found')

  // Create call log
  const callLog = await prisma.callLog.create({
    data: {
      leadId,
      agentId: userId,
      provider: 'TWILIO',
      type: callType,
      status: 'SCHEDULED'
    }
  })

  try {
    // Initialize Twilio call
    const call = await twilio.calls.create({
      to: lead.phone,
      from: config.twilio.phoneNumber,
      url: `${config.auth.url}/api/calls/twiml?callId=${callLog.id}`,
      statusCallback: `${config.auth.url}/api/calls/status`,
      statusCallbackEvent: ['initiated', 'ringing', 'answered', 'completed'],
    })

    // Update call log with provider data
    await prisma.callLog.update({
      where: { id: callLog.id },
      data: {
        providerCallId: call.sid,
        status: 'IN_PROGRESS'
      }
    })

    return callLog

  } catch (error) {
    // Update call log with error
    await prisma.callLog.update({
      where: { id: callLog.id },
      data: {
        status: 'FAILED',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    })

    throw error
  }
}

// Handle Retell webhook
export async function handleRetellWebhook(payload: any) {
  const { callId, event, data } = payload

  const callLog = await prisma.callLog.findFirst({
    where: { providerCallId: callId }
  })

  if (!callLog) {
    logger.error(`Call log not found for Retell call ${callId}`)
    return
  }

  switch (event) {
    case 'call.started':
      await prisma.callLog.update({
        where: { id: callLog.id },
        data: {
          status: 'IN_PROGRESS',
          startedAt: new Date()
        }
      })
      break

    case 'call.ended':
      await prisma.callLog.update({
        where: { id: callLog.id },
        data: {
          status: 'COMPLETED',
          endedAt: new Date(),
          durationSec: data.duration,
          transcript: data.transcript,
          recording: data.recordingUrl
        }
      })
      break

    case 'call.failed':
      await prisma.callLog.update({
        where: { id: callLog.id },
        data: {
          status: 'FAILED',
          error: data.error
        }
      })
      break
  }
}

// Handle Twilio webhook
export async function handleTwilioWebhook(payload: any) {
  const { CallSid, CallStatus, Duration, RecordingUrl } = payload

  const callLog = await prisma.callLog.findFirst({
    where: { providerCallId: CallSid }
  })

  if (!callLog) {
    logger.error(`Call log not found for Twilio call ${CallSid}`)
    return
  }

  switch (CallStatus) {
    case 'in-progress':
      await prisma.callLog.update({
        where: { id: callLog.id },
        data: {
          status: 'IN_PROGRESS',
          startedAt: new Date()
        }
      })
      break

    case 'completed':
      await prisma.callLog.update({
        where: { id: callLog.id },
        data: {
          status: 'COMPLETED',
          endedAt: new Date(),
          durationSec: parseInt(Duration),
          recording: RecordingUrl
        }
      })
      break

    case 'failed':
    case 'busy':
    case 'no-answer':
      await prisma.callLog.update({
        where: { id: callLog.id },
        data: {
          status: 'FAILED',
          error: CallStatus
        }
      })
      break
  }
}

// Main function to make a call
export async function makeCall(leadId: string, userId: string, callType: string = 'SALES') {
  // Check if lead is on DNC list
  const lead = await prisma.lead.findUnique({
    where: { id: leadId }
  })
  
  if (!lead) throw new Error('Lead not found')
  if (lead.status === 'DNC') throw new Error('Lead is on DNC list')

  // For development, create a mock call log
  const callLog = await prisma.callLog.create({
    data: {
      leadId,
      agentId: userId,
      provider: 'MOCK',
      type: callType,
      status: 'COMPLETED',
      startedAt: new Date(),
      endedAt: new Date(Date.now() + 120000), // 2 minutes later
      durationSec: 120,
      transcript: 'Mock call transcript - call completed successfully'
    }
  })

  return callLog
}

export default {
  makeCall,
  handleRetellWebhook,
  handleTwilioWebhook,
  agentTools
}

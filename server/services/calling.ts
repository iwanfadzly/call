import { Retell } from 'retell-sdk'
import twilio from 'twilio'
import OpenAI from 'openai'
import { prisma } from '../../lib/db'
import { logger } from '../utils/logger'

const retell = new Retell({
  apiKey: process.env.RETELL_API_KEY!,
})

const twilioClient = twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
})

// AI Agent Brain Configuration
const AI_AGENT_PROMPT = `
Anda adalah sales agent yang professional dan mesra untuk SalesCallerAI. 

PERSONA:
- Sopan dan professional
- Bercakap dalam Bahasa Melayu Malaysia yang natural
- Sales-driven tapi tidak pushy
- Empathetic dan good listener

FLOW:
1. INTRO: Perkenalkan diri dan company
2. QUALIFY: Tanya 2 soalan untuk qualify prospect
3. PITCH: Present solution based on their needs
4. OBJECTION HANDLING: Address concerns professionally
5. CLOSING: Ask for commitment
6. CTA: Provide payment link atau arrange COD

TOOLS AVAILABLE:
- getProductInfo(query): Get product information
- quotePrice(sku, bundle, promo_code): Get pricing
- createOrder(leadId, sku, qty, payment_method, address): Create order
- sendPaymentLink(leadId, channel): Send payment link
- scheduleCallback(leadId, timeIso): Schedule follow-up
- dnc(leadId): Add to do-not-call list

GUIDELINES:
- Keep calls under 10 minutes
- Always ask permission before pitching
- Handle objections with empathy
- Close with clear next steps
- Log all important information
`

export async function callLead(leadId: string, userId: string, callType: string = 'SALES') {
  try {
    // Get lead information
    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
      include: {
        callLogs: {
          orderBy: { startedAt: 'desc' },
          take: 5
        }
      }
    })

    if (!lead) {
      throw new Error('Lead not found')
    }

    // Get system config for calling
    const config = await prisma.systemConfig.findUnique({
      where: { key: 'ai_calling_config' }
    })

    const callingConfig = config?.value as any || {
      provider: 'retell',
      voice: 'ms-MY',
      barge_in: true
    }

    let callResult

    if (callingConfig.provider === 'retell') {
      callResult = await makeRetellCall(lead, callingConfig)
    } else {
      callResult = await makeTwilioCall(lead, callingConfig)
    }

    // Create call log
    const callLog = await prisma.callLog.create({
      data: {
        leadId: lead.id,
        userId: userId,
        provider: callingConfig.provider.toUpperCase(),
        callId: callResult.callId,
        startedAt: new Date(),
        outcome: 'INITIATED',
        durationSec: 0,
        cost: 0,
        metadata: callResult.metadata
      }
    })

    // Create lead activity
    await prisma.leadActivity.create({
      data: {
        leadId: lead.id,
        type: 'CALL',
        title: 'AI Call Initiated',
        content: `Call started using ${callingConfig.provider}`,
        metadata: { callLogId: callLog.id }
      }
    })

    logger.info(`Call initiated for lead ${leadId} using ${callingConfig.provider}`)
    return callResult

  } catch (error) {
    logger.error(`Failed to call lead ${leadId}:`, error)
    throw error
  }
}

async function makeRetellCall(lead: any, config: any) {
  try {
    // Create Retell phone call
    const call = await retell.call.create({
      from_number: process.env.TWILIO_PHONE_NUMBER!,
      to_number: lead.phone,
      override_agent_id: process.env.RETELL_AGENT_ID,
      retell_llm_dynamic_variables: {
        lead_name: lead.name,
        lead_phone: lead.phone,
        lead_tags: lead.tags.join(', '),
        lead_status: lead.status,
        call_history: lead.callLogs.length.toString()
      }
    })

    return {
      callId: call.call_id,
      provider: 'retell',
      metadata: {
        retell_call_id: call.call_id,
        agent_id: call.agent_id
      }
    }
  } catch (error) {
    logger.error('Retell call failed:', error)
    throw error
  }
}

async function makeTwilioCall(lead: any, config: any) {
  try {
    // Create TwiML for the call
    const twiml = `
      <Response>
        <Say voice="Polly.Aditi-Neural" language="ms-MY">
          Sedang menyambungkan anda dengan AI agent kami. Sila tunggu sebentar.
        </Say>
        <Connect>
          <Stream url="wss://your-websocket-endpoint.com/stream" />
        </Connect>
      </Response>
    `

    const call = await twilioClient.calls.create({
      from: process.env.TWILIO_PHONE_NUMBER!,
      to: lead.phone,
      twiml: twiml,
      statusCallback: `${process.env.NEXTAUTH_URL}/api/calls/twilio/status`,
      statusCallbackEvent: ['initiated', 'ringing', 'answered', 'completed'],
      statusCallbackMethod: 'POST'
    })

    return {
      callId: call.sid,
      provider: 'twilio',
      metadata: {
        twilio_call_sid: call.sid,
        status: call.status
      }
    }
  } catch (error) {
    logger.error('Twilio call failed:', error)
    throw error
  }
}

// AI Agent Tools
export const aiAgentTools = {
  async getProductInfo(query: string) {
    const products = await prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
          { category: { contains: query, mode: 'insensitive' } }
        ],
        isActive: true
      }
    })
    return products
  },

  async quotePrice(sku: string, bundle?: string, promoCode?: string) {
    const product = await prisma.product.findUnique({
      where: { sku }
    })
    
    if (!product) return null

    let price = product.price
    
    // Apply bundle discount
    if (bundle === 'premium') {
      price = price * 0.9 // 10% discount
    }
    
    // Apply promo code
    if (promoCode === 'FIRST50') {
      price = price * 0.5 // 50% discount
    }

    return {
      product: product.name,
      originalPrice: product.price,
      finalPrice: price,
      savings: product.price - price
    }
  },

  async createOrder(leadId: string, sku: string, qty: number = 1, paymentMethod: string = 'ONLINE', address?: any) {
    const lead = await prisma.lead.findUnique({ where: { id: leadId } })
    const product = await prisma.product.findUnique({ where: { sku } })
    
    if (!lead || !product) return null

    const orderNo = `ORD-${Date.now()}`
    const totalAmount = product.price * qty

    const order = await prisma.order.create({
      data: {
        orderNo,
        leadId,
        totalAmount,
        channel: paymentMethod === 'COD' ? 'COD' : 'ONLINE',
        status: 'PENDING',
        paymentMethod,
        shippingAddress: address,
        items: {
          create: {
            productId: product.id,
            quantity: qty,
            unitPrice: product.price,
            totalPrice: product.price * qty
          }
        }
      }
    })

    // Update lead status
    await prisma.lead.update({
      where: { id: leadId },
      data: { status: 'CLOSED' }
    })

    return order
  },

  async sendPaymentLink(leadId: string, channel: string = 'whatsapp') {
    // This will be implemented with payment providers
    return { success: true, message: 'Payment link will be sent' }
  },

  async scheduleCallback(leadId: string, timeIso: string) {
    await prisma.leadActivity.create({
      data: {
        leadId,
        type: 'NOTE',
        title: 'Callback Scheduled',
        content: `Callback scheduled for ${timeIso}`,
        metadata: { scheduledTime: timeIso }
      }
    })

    await prisma.lead.update({
      where: { id: leadId },
      data: { status: 'FOLLOW_UP' }
    })

    return { success: true, scheduledTime: timeIso }
  },

  async dnc(leadId: string) {
    await prisma.lead.update({
      where: { id: leadId },
      data: { status: 'DNC' }
    })

    await prisma.leadActivity.create({
      data: {
        leadId,
        type: 'NOTE',
        title: 'Added to DNC',
        content: 'Lead requested to be added to Do Not Call list'
      }
    })

    return { success: true, message: 'Added to Do Not Call list' }
  }
}

// Update call status
export async function updateCallStatus(callId: string, status: string, transcript?: string, recording?: string, duration?: number) {
  try {
    const callLog = await prisma.callLog.findFirst({
      where: { callId }
    })

    if (!callLog) {
      logger.error(`Call log not found for callId: ${callId}`)
      return
    }

    await prisma.callLog.update({
      where: { id: callLog.id },
      data: {
        outcome: status,
        transcript,
        recording,
        durationSec: duration || 0,
        endedAt: new Date()
      }
    })

    // Update lead activity
    await prisma.leadActivity.create({
      data: {
        leadId: callLog.leadId,
        type: 'CALL',
        title: `Call ${status}`,
        content: transcript ? `Call completed. Duration: ${duration}s` : `Call ${status.toLowerCase()}`,
        metadata: { 
          callLogId: callLog.id,
          duration,
          outcome: status
        }
      }
    })

    logger.info(`Call status updated: ${callId} -> ${status}`)
  } catch (error) {
    logger.error(`Failed to update call status for ${callId}:`, error)
  }
}

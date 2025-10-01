import axios from 'axios'
import { prisma } from '../../lib/db'
import { logger } from '../utils/logger'

// WhatsApp message templates
const templates = {
  orderConfirmation: (name: string, product: string, paymentLink: string) =>
    `Hai ${name}, terima kasih order ${product}. Klik sini untuk bayar: ${paymentLink}`,
  
  codConfirmation: (name: string) =>
    `Hai ${name}, order anda confirmed untuk COD. Kami akan call untuk arrange delivery.`,
  
  followUp: (name: string, product: string) =>
    `Hi ${name}, ada questions tentang ${product}? Reply je message ni.`
}

// Send WhatsApp message via wasapbot
export async function sendWhatsAppMessage(
  leadId: string | null,
  orderId: string | null,
  phone: string,
  message: string
) {
  try {
    const wasapbotEndpoint = process.env.WASAPBOT_ENDPOINT
    const wasapbotApiKey = process.env.WASAPBOT_API_KEY

    if (!wasapbotEndpoint || !wasapbotApiKey) {
      throw new Error('Wasapbot configuration missing')
    }

    // Call wasapbot API
    const response = await axios.post(wasapbotEndpoint, {
      phone,
      message
    }, {
      headers: {
        'Authorization': `Bearer ${wasapbotApiKey}`,
        'Content-Type': 'application/json'
      }
    })

    // Log the message
    const whatsappLog = await prisma.whatsAppLog.create({
      data: {
        leadId,
        orderId,
        phone,
        direction: 'OUTBOUND',
        message,
        status: 'SENT',
        messageId: response.data?.messageId,
        metadata: response.data
      }
    })

    // Create lead activity if leadId exists
    if (leadId) {
      await prisma.leadActivity.create({
        data: {
          leadId,
          type: 'WHATSAPP',
          title: 'WhatsApp Message Sent',
          content: message,
          metadata: {
            messageId: whatsappLog.id,
            status: 'SENT'
          }
        }
      })
    }

    logger.info(`WhatsApp message sent to ${phone}`)
    return whatsappLog

  } catch (error) {
    logger.error(`Failed to send WhatsApp message to ${phone}:`, error)
    
    // Log failed attempt
    const whatsappLog = await prisma.whatsAppLog.create({
      data: {
        leadId,
        orderId,
        phone,
        direction: 'OUTBOUND',
        message,
        status: 'FAILED',
        metadata: {
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      }
    })

    throw error
  }
}

// Handle inbound webhook from wasapbot
export async function handleInboundMessage(payload: any) {
  const { phone, message, timestamp } = payload

  try {
    // Find lead by phone number
    const lead = await prisma.lead.findFirst({
      where: { phone },
      include: {
        orders: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    })

    // Find latest order for this phone number
    const latestOrder = lead?.orders[0]

    // Log the inbound message
    const whatsappLog = await prisma.whatsAppLog.create({
      data: {
        leadId: lead?.id || null,
        orderId: latestOrder?.id || null,
        phone,
        direction: 'INBOUND',
        message,
        status: 'DELIVERED',
        timestamp: new Date(timestamp)
      }
    })

    // Create lead activity if lead exists
    if (lead) {
      await prisma.leadActivity.create({
        data: {
          leadId: lead.id,
          type: 'WHATSAPP',
          title: 'WhatsApp Message Received',
          content: message,
          metadata: {
            messageId: whatsappLog.id,
            status: 'RECEIVED'
          }
        }
      })
    }

    // Handle order status updates
    if (latestOrder && message.toUpperCase() === 'COD') {
      await prisma.order.update({
        where: { id: latestOrder.id },
        data: { status: 'COD_CONFIRMED' }
      })

      // Send confirmation message
      await sendWhatsAppMessage(
        lead?.id || null,
        latestOrder.id,
        phone,
        templates.codConfirmation(lead?.name || 'customer')
      )
    }

    if (latestOrder && message.toUpperCase() === 'PAID') {
      await prisma.order.update({
        where: { id: latestOrder.id },
        data: { status: 'PAID' }
      })
    }

    logger.info(`Inbound WhatsApp message processed from ${phone}`)
    return whatsappLog

  } catch (error) {
    logger.error(`Failed to process inbound WhatsApp message from ${phone}:`, error)
    throw error
  }
}

// Helper to send order confirmation
export async function sendOrderConfirmation(orderId: string) {
  try {
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

    if (!order || !order.lead) {
      throw new Error('Order or lead not found')
    }

    const productNames = order.items.map(item => item.product.name).join(', ')
    
    const message = templates.orderConfirmation(
      order.lead.name,
      productNames,
      order.paymentLink || '[Payment link not available]'
    )

    return await sendWhatsAppMessage(
      order.lead.id,
      order.id,
      order.lead.phone,
      message
    )

  } catch (error) {
    logger.error(`Failed to send order confirmation for order ${orderId}:`, error)
    throw error
  }
}

// Helper to send follow-up message
export async function sendFollowUpMessage(leadId: string, productName: string) {
  try {
    const lead = await prisma.lead.findUnique({
      where: { id: leadId }
    })

    if (!lead) {
      throw new Error('Lead not found')
    }

    const message = templates.followUp(lead.name, productName)

    return await sendWhatsAppMessage(
      lead.id,
      null,
      lead.phone,
      message
    )

  } catch (error) {
    logger.error(`Failed to send follow-up message to lead ${leadId}:`, error)
    throw error
  }
}

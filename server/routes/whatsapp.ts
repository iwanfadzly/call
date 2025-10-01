import { Router } from 'express'
import { logger } from '../utils/logger'

const router = Router()

// Send WhatsApp message
router.post('/send', async (req, res) => {
  try {
    // Mock response for development
    res.json({ success: true, messageId: `msg_${Date.now()}` })
  } catch (error) {
    logger.error('Error sending WhatsApp message:', error)
    res.status(500).json({ error: 'Failed to send message' })
  }
})

// Handle WhatsApp webhook
router.post('/webhook', async (req, res) => {
  try {
    logger.info('WhatsApp webhook received:', req.body)
    res.json({ success: true })
  } catch (error) {
    logger.error('Error handling WhatsApp webhook:', error)
    res.status(500).json({ error: 'Failed to process webhook' })
  }
})

export default router

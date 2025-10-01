import { Router } from 'express'
import { logger } from '../utils/logger'
import callsService from '../services/calls'

const router = Router()

// Make a call
router.post('/', async (req, res) => {
  try {
    const { leadId, userId, callType } = req.body
    const result = await callsService.makeCall(leadId, userId, callType)
    res.json(result)
  } catch (error) {
    logger.error('Error making call:', error)
    res.status(500).json({ error: 'Failed to make call' })
  }
})

// Handle Retell webhook
router.post('/webhook/retell', async (req, res) => {
  try {
    await callsService.handleRetellWebhook(req.body)
    res.json({ success: true })
  } catch (error) {
    logger.error('Error handling Retell webhook:', error)
    res.status(500).json({ error: 'Failed to process webhook' })
  }
})

// Handle Twilio webhook
router.post('/webhook/twilio', async (req, res) => {
  try {
    await callsService.handleTwilioWebhook(req.body)
    res.json({ success: true })
  } catch (error) {
    logger.error('Error handling Twilio webhook:', error)
    res.status(500).json({ error: 'Failed to process webhook' })
  }
})

export default router

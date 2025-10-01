import { Router } from 'express'
import { logger } from '../utils/logger'

const router = Router()

// Get settings
router.get('/', async (req, res) => {
  try {
    // Mock response for development
    res.json({
      company: {
        name: 'SalesCallerAI',
        phone: '+1234567890',
        email: 'info@salescallerai.com'
      },
      ai: {
        provider: 'RETELL',
        model: 'gpt-4'
      },
      payment: {
        provider: 'STRIPE',
        currency: 'USD'
      }
    })
  } catch (error) {
    logger.error('Error fetching settings:', error)
    res.status(500).json({ error: 'Failed to fetch settings' })
  }
})

// Update settings
router.put('/', async (req, res) => {
  try {
    // Mock response for development
    res.json({ success: true, ...req.body })
  } catch (error) {
    logger.error('Error updating settings:', error)
    res.status(500).json({ error: 'Failed to update settings' })
  }
})

export default router

import { Router } from 'express'
import { logger } from '../utils/logger'

const router = Router()

// Get all leads
router.get('/', async (req, res) => {
  try {
    // Mock response for development
    res.json([])
  } catch (error) {
    logger.error('Error fetching leads:', error)
    res.status(500).json({ error: 'Failed to fetch leads' })
  }
})

// Create lead
router.post('/', async (req, res) => {
  try {
    // Mock response for development
    res.json({ id: 'lead_123', ...req.body })
  } catch (error) {
    logger.error('Error creating lead:', error)
    res.status(500).json({ error: 'Failed to create lead' })
  }
})

export default router

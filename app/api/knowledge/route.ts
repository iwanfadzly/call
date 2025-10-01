import { NextRequest, NextResponse } from 'next/server'

// Mock data for development
const mockKnowledge = [
  {
    id: '1',
    title: 'Premium Sales Course - Product Information',
    type: 'PRODUCT',
    content: 'Comprehensive sales training course designed for professionals. Includes 20+ modules covering prospecting, closing techniques, objection handling, and advanced sales psychology. Perfect for sales teams looking to increase conversion rates.',
    tags: ['sales', 'training', 'course', 'premium'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    title: 'AI Sales Assistant - Features & Benefits',
    type: 'PRODUCT',
    content: 'AI-powered sales assistant that helps automate lead qualification, follow-ups, and appointment scheduling. Uses advanced NLP to understand customer intent and provide personalized responses. Integrates with CRM systems.',
    tags: ['ai', 'assistant', 'automation', 'crm'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '3',
    title: 'Common Objections - How to Handle',
    type: 'FAQ',
    content: 'Q: "Your price is too high" A: "I understand price is important. Let me show you the ROI calculation and how this investment will pay for itself within 3 months through increased sales efficiency."',
    tags: ['objections', 'pricing', 'roi'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '4',
    title: 'Cold Calling Script - Opening',
    type: 'SCRIPT',
    content: 'Hi [Name], this is [Your Name] from SalesCallerAI. I know you\'re busy, so I\'ll be brief. We help sales teams like yours increase their conversion rates by 40% using AI-powered calling assistance. Do you have 2 minutes to hear how this could benefit your team?',
    tags: ['cold calling', 'script', 'opening', 'conversion'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '5',
    title: 'Sales Best Practices - Training Material',
    type: 'TRAINING',
    content: 'Key principles for successful sales calls: 1) Research prospect beforehand 2) Ask open-ended questions 3) Listen actively 4) Present solutions, not features 5) Handle objections with empathy 6) Always ask for the close 7) Follow up consistently',
    tags: ['best practices', 'training', 'sales process', 'closing'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const search = searchParams.get('search')
    
    let filteredKnowledge = mockKnowledge
    
    // Filter by type
    if (type && type !== 'ALL') {
      filteredKnowledge = filteredKnowledge.filter(item => item.type === type)
    }
    
    // Filter by search term
    if (search) {
      const searchLower = search.toLowerCase()
      filteredKnowledge = filteredKnowledge.filter(item => 
        item.title.toLowerCase().includes(searchLower) ||
        item.content.toLowerCase().includes(searchLower) ||
        item.tags.some(tag => tag.toLowerCase().includes(searchLower))
      )
    }

    return NextResponse.json(filteredKnowledge)
  } catch (error) {
    console.error('Error fetching knowledge:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const newKnowledge = {
      id: Date.now().toString(),
      ...body,
      tags: typeof body.tags === 'string' ? body.tags.split(',').map((tag: string) => tag.trim()) : body.tags,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    return NextResponse.json(newKnowledge, { status: 201 })
  } catch (error) {
    console.error('Error creating knowledge:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

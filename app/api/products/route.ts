import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

// Mock data for development
const mockProducts = [
  {
    id: '1',
    name: 'Premium Sales Course',
    sku: 'PSC-001',
    description: 'Comprehensive sales training course designed for professionals. Includes 20+ modules covering prospecting, closing techniques, objection handling, and advanced sales psychology.',
    price: 299.00,
    category: 'Training',
    isActive: true,
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    name: 'AI Sales Assistant',
    sku: 'ASA-002', 
    description: 'AI-powered sales assistant that helps automate lead qualification, follow-ups, and appointment scheduling. Uses advanced NLP to understand customer intent.',
    price: 99.00,
    category: 'Software',
    isActive: true,
    createdAt: new Date().toISOString()
  },
  {
    id: '3',
    name: 'Lead Generation Tool',
    sku: 'LGT-003',
    description: 'Powerful lead generation tool that helps identify and qualify potential customers. Includes email finder, social media integration, and CRM sync.',
    price: 149.00,
    category: 'Service',
    isActive: true,
    createdAt: new Date().toISOString()
  }
]

export async function GET() {
  try {
    return NextResponse.json(mockProducts)
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const newProduct = {
      id: Date.now().toString(),
      ...body,
      createdAt: new Date().toISOString()
    }

    return NextResponse.json(newProduct, { status: 201 })
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

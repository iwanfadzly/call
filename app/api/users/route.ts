import { NextRequest, NextResponse } from 'next/server'

// Mock data for development
const mockUsers = [
  {
    id: '1',
    name: 'Iwan Fadzly',
    email: 'iwanfadzly@gmail.com',
    role: 'ADMIN',
    createdAt: new Date().toISOString(),
    isActive: true
  },
  {
    id: '2', 
    name: 'Ahmad Sales',
    email: 'ahmad@salescaller.ai',
    role: 'AGENT',
    createdAt: new Date().toISOString(),
    isActive: true
  },
  {
    id: '3',
    name: 'Sarah Manager', 
    email: 'sarah@salescaller.ai',
    role: 'MANAGER',
    createdAt: new Date().toISOString(),
    isActive: true
  }
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const role = searchParams.get('role')
    
    let users = mockUsers
    
    if (role) {
      users = users.filter(user => user.role === role)
    }

    return NextResponse.json(users)
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Mock create user
    const newUser = {
      id: Date.now().toString(),
      ...body,
      createdAt: new Date().toISOString(),
      isActive: true
    }

    return NextResponse.json(newUser, { status: 201 })
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Mock update user
    const updatedUser = {
      ...body,
      updatedAt: new Date().toISOString()
    }

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Mock delete user
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

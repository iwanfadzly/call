import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function createAdminUser() {
  try {
    // Hash password
    const hashedPassword = await bcrypt.hash('Mustanggt500@', 12)
    
    // Create admin user
    const user = await prisma.user.upsert({
      where: { email: 'iwanfadzly@gmail.com' },
      update: {
        password: hashedPassword,
        role: 'ADMIN'
      },
      create: {
        email: 'iwanfadzly@gmail.com',
        name: 'Iwan Fadzly',
        password: hashedPassword,
        role: 'ADMIN',
        emailVerified: new Date()
      }
    })
    
    console.log('Admin user created successfully:', {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    })
  } catch (error) {
    console.error('Error creating admin user:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createAdminUser()

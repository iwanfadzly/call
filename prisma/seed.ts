import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 12)
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@salescallerai.com' },
    update: {},
    create: {
      email: 'admin@salescallerai.com',
      name: 'Admin User',
      password: hashedPassword,
      role: 'ADMIN',
    },
  })

  // Create agent user
  const agentUser = await prisma.user.upsert({
    where: { email: 'agent@salescallerai.com' },
    update: {},
    create: {
      email: 'agent@salescallerai.com',
      name: 'Sales Agent',
      password: hashedPassword,
      role: 'AGENT',
    },
  })

  // Create demo products
  const products = [
    {
      name: 'Cacari Premium Package',
      sku: 'CACARI-PREMIUM',
      description: 'Pakej lengkap Cacari dengan semua features premium untuk bisnes anda',
      price: 299.00,
      category: 'SOFTWARE',
    },
    {
      name: 'Cacari Basic Package',
      sku: 'CACARI-BASIC',
      description: 'Pakej asas Cacari untuk permulaan bisnes kecil',
      price: 99.00,
      category: 'SOFTWARE',
    },
    {
      name: 'Consultation Service',
      sku: 'CONSULT-1HR',
      description: 'Sesi konsultasi 1 jam dengan pakar bisnes',
      price: 150.00,
      category: 'SERVICE',
    },
  ]

  for (const product of products) {
    await prisma.product.upsert({
      where: { sku: product.sku },
      update: {},
      create: product,
    })
  }

  // Create demo leads
  const leads = [
    {
      name: 'Ahmad Razak',
      phone: '60123456789',
      email: 'ahmad@example.com',
      tags: ['hot-lead', 'enterprise'],
      status: 'NEW' as const,
      priority: 5,
      source: 'Facebook Ads',
    },
    {
      name: 'Siti Nurhaliza',
      phone: '60198765432',
      email: 'siti@example.com',
      tags: ['warm-lead', 'sme'],
      status: 'INTERESTED' as const,
      priority: 4,
      source: 'Google Ads',
    },
    {
      name: 'Lim Wei Ming',
      phone: '60187654321',
      email: 'lim@example.com',
      tags: ['cold-lead'],
      status: 'NO_ANSWER' as const,
      priority: 2,
      source: 'LinkedIn',
    },
    {
      name: 'Fatimah Abdullah',
      phone: '60176543210',
      email: 'fatimah@example.com',
      tags: ['follow-up'],
      status: 'FOLLOW_UP' as const,
      priority: 3,
      source: 'Referral',
    },
    {
      name: 'Raj Kumar',
      phone: '60165432109',
      email: 'raj@example.com',
      tags: ['enterprise', 'decision-maker'],
      status: 'NEW' as const,
      priority: 5,
      source: 'Cold Call',
    },
  ]

  for (const lead of leads) {
    await prisma.lead.upsert({
      where: { phone: lead.phone },
      update: {},
      create: lead,
    })
  }

  // Create knowledge base entries (objections, FAQs, scripts)
  const knowledgeEntries = [
    {
      title: 'Objection: Harga terlalu mahal',
      content: 'Saya faham concern anda tentang harga. Mari kita lihat ROI yang boleh anda dapat. Dengan Cacari, anda boleh save masa 10 jam seminggu dan increase sales hingga 30%. Dalam 3 bulan, investment ini akan pay back sendiri.',
      type: 'OBJECTION_HANDLING' as const,
      tags: ['price', 'roi', 'value'],
    },
    {
      title: 'Objection: Sudah ada system lain',
      content: 'Bagus! Itu menunjukkan anda serious tentang bisnes. Tapi adakah system anda sekarang ada AI calling dan WhatsApp automation? Cacari boleh integrate dengan system existing anda dan tambah features yang anda tak ada.',
      type: 'OBJECTION_HANDLING' as const,
      tags: ['competition', 'integration', 'features'],
    },
    {
      title: 'Objection: Perlu discuss dengan partner',
      content: 'Absolutely! Decision penting macam ni memang kena discuss. Boleh saya schedule demo untuk anda dan partner anda? Atau saya boleh prepare proposal yang anda boleh share dengan dia?',
      type: 'OBJECTION_HANDLING' as const,
      tags: ['decision-maker', 'demo', 'proposal'],
    },
    {
      title: 'FAQ: Berapa lama setup time?',
      content: 'Setup Cacari sangat mudah! Dalam 24 jam, system anda akan ready. Kami ada dedicated onboarding team yang akan guide anda step by step. Plus, kami provide free training untuk team anda.',
      type: 'FAQ' as const,
      tags: ['setup', 'onboarding', 'training'],
    },
    {
      title: 'Product Info: Cacari Premium Features',
      content: 'Cacari Premium includes: AI Voice Calling dengan Bahasa Malaysia, WhatsApp automation, Lead management, Sales reporting, Payment integration (Stripe, Billplz, Toyyibpay), dan 24/7 support.',
      type: 'PRODUCT_INFO' as const,
      tags: ['premium', 'features', 'ai-calling'],
    },
    {
      title: 'Script: Opening Pitch',
      content: 'Hi [Name], saya [Agent Name] dari Cacari. Kami specialise dalam AI calling system yang boleh automate sales process untuk SME. Dalam 2 minit, boleh saya share macam mana kami boleh help anda increase sales hingga 30%?',
      type: 'SCRIPT' as const,
      tags: ['opening', 'pitch', 'introduction'],
    },
  ]

  for (const entry of knowledgeEntries) {
    await prisma.knowledgeBase.create({
      data: entry,
    })
  }

  // Create system config
  await prisma.systemConfig.upsert({
    where: { key: 'ai_calling_config' },
    update: {},
    create: {
      key: 'ai_calling_config',
      value: {
        provider: 'retell',
        voice: 'ms-MY',
        barge_in: true,
        business_hours: {
          start: '09:00',
          end: '18:00',
          timezone: 'Asia/Kuala_Lumpur',
        },
        max_call_duration: 600, // 10 minutes
      },
    },
  })

  await prisma.systemConfig.upsert({
    where: { key: 'whatsapp_config' },
    update: {},
    create: {
      key: 'whatsapp_config',
      value: {
        endpoint: process.env.WASAPBOT_ENDPOINT,
        api_key: process.env.WASAPBOT_API_KEY,
        templates: {
          order_confirmation: 'Hai {name}, terima kasih order {product}. Klik sini untuk bayar: {payment_link}',
          cod_confirmation: 'Hai {name}, order anda confirmed untuk COD. Kami akan call untuk arrange delivery.',
          follow_up: 'Hi {name}, ada questions tentang {product}? Reply je message ni.',
        },
      },
    },
  })

  console.log('✅ Database seeded successfully!')
  console.log('👤 Admin: admin@salescallerai.com / admin123')
  console.log('👤 Agent: agent@salescallerai.com / admin123')
  console.log(`📊 Created ${products.length} products`)
  console.log(`👥 Created ${leads.length} leads`)
  console.log(`📚 Created ${knowledgeEntries.length} knowledge base entries`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })

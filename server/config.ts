// Environment variables validation and configuration
import { z } from 'zod'

const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url(),
  
  // Redis
  REDIS_URL: z.string().url(),
  
  // Authentication
  NEXTAUTH_URL: z.string().url(),
  NEXTAUTH_SECRET: z.string(),
  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),
  
  // AI Services
  OPENAI_API_KEY: z.string(),
  RETELL_API_KEY: z.string(),
  
  // Twilio
  TWILIO_ACCOUNT_SID: z.string(),
  TWILIO_AUTH_TOKEN: z.string(),
  TWILIO_PHONE_NUMBER: z.string(),
  
  // WhatsApp
  WASAPBOT_ENDPOINT: z.string().url(),
  WASAPBOT_API_KEY: z.string(),
  
  // Payment Providers
  PAYMENT_PROVIDER: z.enum(['STRIPE', 'BILLPLZ', 'TOYYIBPAY']),
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  BILLPLZ_SECRET_KEY: z.string().optional(),
  BILLPLZ_COLLECTION_ID: z.string().optional(),
  TOYYIBPAY_SECRET_KEY: z.string().optional(),
  TOYYIBPAY_CATEGORY_CODE: z.string().optional(),
  
  // Server
  PORT: z.string().transform(Number).optional(),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'http', 'debug']).default('info'),
})

// Parse and validate environment variables
const env = envSchema.parse(process.env)

// Server configuration
export const config = {
  env: env.NODE_ENV,
  port: env.PORT || 3001,
  logLevel: env.LOG_LEVEL,
  
  database: {
    url: env.DATABASE_URL,
  },
  
  redis: {
    url: env.REDIS_URL,
  },
  
  auth: {
    url: env.NEXTAUTH_URL,
    secret: env.NEXTAUTH_SECRET,
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    },
  },
  
  ai: {
    openai: {
      apiKey: env.OPENAI_API_KEY,
    },
    retell: {
      apiKey: env.RETELL_API_KEY,
    },
  },
  
  twilio: {
    accountSid: env.TWILIO_ACCOUNT_SID,
    authToken: env.TWILIO_AUTH_TOKEN,
    phoneNumber: env.TWILIO_PHONE_NUMBER,
  },
  
  whatsapp: {
    endpoint: env.WASAPBOT_ENDPOINT,
    apiKey: env.WASAPBOT_API_KEY,
  },
  
  payments: {
    provider: env.PAYMENT_PROVIDER,
    stripe: env.STRIPE_SECRET_KEY ? {
      secretKey: env.STRIPE_SECRET_KEY,
      webhookSecret: env.STRIPE_WEBHOOK_SECRET,
    } : undefined,
    billplz: env.BILLPLZ_SECRET_KEY ? {
      secretKey: env.BILLPLZ_SECRET_KEY,
      collectionId: env.BILLPLZ_COLLECTION_ID,
    } : undefined,
    toyyibpay: env.TOYYIBPAY_SECRET_KEY ? {
      secretKey: env.TOYYIBPAY_SECRET_KEY,
      categoryCode: env.TOYYIBPAY_CATEGORY_CODE,
    } : undefined,
  },
  
  cors: {
    origin: env.NEXTAUTH_URL,
    credentials: true,
  },
  
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
  },
} as const

// Export environment type
export type Env = z.infer<typeof envSchema>

// Export configuration type
export type Config = typeof config

// Export default configuration
export default config

import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatMoney(amount: number): string {
  return new Intl.NumberFormat('en-MY', {
    style: 'currency',
    currency: 'MYR',
    minimumFractionDigits: 2,
  }).format(amount)
}

export function formatPhoneNumber(phone: string): string {
  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, '')
  
  // Format Malaysian phone numbers
  if (cleaned.startsWith('60')) {
    return cleaned.replace(/(\d{2})(\d{3})(\d{3,4})(\d{3,4})/, '+$1 $2-$3 $4')
  }
  
  // If starts with 0, assume Malaysian number without country code
  if (cleaned.startsWith('0')) {
    return cleaned.replace(/(\d{3})(\d{3,4})(\d{3,4})/, '+60 $1-$2 $3')
  }
  
  // Default formatting for other numbers
  return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3')
}

export function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  
  if (minutes === 0) {
    return `${remainingSeconds}s`
  }
  
  return `${minutes}m ${remainingSeconds}s`
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
}

export function truncateText(text: string, length: number): string {
  if (text.length <= length) return text
  return text.slice(0, length) + '...'
}

export function generateOrderNumber(): string {
  const timestamp = Date.now().toString()
  const random = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `ORD${timestamp.slice(-6)}${random}`
}

export function calculateConversionRate(total: number, converted: number): number {
  if (total === 0) return 0
  return Math.round((converted / total) * 100)
}

export const statusColors = {
  // Lead statuses
  NEW: 'default',
  CONTACTED: 'secondary',
  QUALIFIED: 'info',
  CLOSED: 'success',
  DNC: 'destructive',
  
  // Call statuses
  SCHEDULED: 'default',
  IN_PROGRESS: 'warning',
  COMPLETED: 'success',
  FAILED: 'destructive',
  NO_ANSWER: 'secondary',
  
  // Order statuses
  PENDING: 'warning',
  PAID: 'success',
  COD_CONFIRMED: 'info',
  SHIPPED: 'secondary',
  DELIVERED: 'success',
  CANCELLED: 'destructive',
  REFUNDED: 'destructive',
  
  // WhatsApp statuses
  SENT: 'default',
  DELIVERED: 'info',
  READ: 'success',
  FAILED: 'destructive'
} as const

export type StatusColor = keyof typeof statusColors

export function getStatusColor(status: string): StatusColor {
  return (statusColors[status as StatusColor] || 'default') as StatusColor
}

export function isValidMalaysianPhone(phone: string): boolean {
  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, '')
  
  // Check if starts with Malaysian country code (60)
  if (cleaned.startsWith('60')) {
    return cleaned.length >= 11 && cleaned.length <= 12
  }
  
  // Check if starts with 0
  if (cleaned.startsWith('0')) {
    return cleaned.length >= 10 && cleaned.length <= 11
  }
  
  return false
}

export function normalizePhoneNumber(phone: string): string {
  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, '')
  
  // If starts with 0, replace with 60
  if (cleaned.startsWith('0')) {
    return '60' + cleaned.slice(1)
  }
  
  // If already starts with 60, return as is
  if (cleaned.startsWith('60')) {
    return cleaned
  }
  
  // Default case, prepend 60
  return '60' + cleaned
}

export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  return new Promise((resolve, reject) => {
    const attempt = async (retryCount: number) => {
      try {
        const result = await fn()
        resolve(result)
      } catch (error) {
        if (retryCount === maxRetries) {
          reject(error)
          return
        }
        
        const delayMs = baseDelay * Math.pow(2, retryCount)
        await delay(delayMs)
        attempt(retryCount + 1)
      }
    }
    
    attempt(0)
  })
}

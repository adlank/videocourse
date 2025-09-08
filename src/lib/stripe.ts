import { loadStripe, Stripe } from '@stripe/stripe-js'

let stripePromise: Promise<Stripe | null>

export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)
  }
  return stripePromise
}

export const formatPrice = (amount: number, currency: string = 'CHF') => {
  return new Intl.NumberFormat('de-CH', {
    style: 'currency',
    currency,
  }).format(amount / 100)
}

export const subscriptionPlans = {
  monthly: {
    id: 'monthly',
    name: 'Monatlich',
    description: 'Monatlicher Zugang zu allen Kursen',
    price: 2900, // CHF 29.00 in Rappen
    currency: 'CHF',
    interval: 'month' as const,
    features: [
      'Zugang zu allen Kursen',
      'Unbegrenzte Videozeit',
      'Fortschrittsverfolgung',
      'Bookmarks und Notizen',
      'Mobile App Zugang',
      'Community Forum'
    ]
  },
  yearly: {
    id: 'yearly',
    name: 'Jährlich',
    description: 'Jährlicher Zugang zu allen Kursen (2 Monate gratis!)',
    price: 29000, // CHF 290.00 in Rappen (10 Monate zum Preis von 12)
    currency: 'CHF',
    interval: 'year' as const,
    originalPrice: 34800, // CHF 348.00 (12 × 29)
    savings: 5800, // CHF 58.00 Ersparnis
    features: [
      'Zugang zu allen Kursen',
      'Unbegrenzte Videozeit',
      'Fortschrittsverfolgung',
      'Bookmarks und Notizen',
      'Mobile App Zugang',
      'Community Forum',
      'Prioritätssupport',
      '2 Monate GRATIS!'
    ]
  }
}

export type SubscriptionPlan = typeof subscriptionPlans.monthly

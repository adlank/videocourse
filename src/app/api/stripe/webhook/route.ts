import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (error: any) {
    console.error('Webhook signature verification failed:', error.message)
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    )
  }

  const supabase = createClient()

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const userId = session.metadata?.user_id
        const planType = session.metadata?.plan_type

        if (!userId) {
          console.error('No user_id in session metadata')
          break
        }

        // Abonnement-Informationen aus Stripe abrufen
        const subscription = await stripe.subscriptions.retrieve(
          session.subscription as string
        )

        // Benutzer-Profil aktualisieren
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            subscription_status: 'active',
            subscription_id: subscription.id,
            subscription_plan: planType,
            subscription_current_period_start: new Date(
              subscription.current_period_start * 1000
            ).toISOString(),
            subscription_current_period_end: new Date(
              subscription.current_period_end * 1000
            ).toISOString(),
            stripe_customer_id: subscription.customer as string,
            updated_at: new Date().toISOString(),
          })
          .eq('id', userId)

        if (updateError) {
          console.error('Error updating user subscription:', updateError)
        } else {
          console.log(`Subscription activated for user ${userId}`)
        }
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const userId = subscription.metadata?.user_id

        if (!userId) {
          console.error('No user_id in subscription metadata')
          break
        }

        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            subscription_status: subscription.status,
            subscription_current_period_start: new Date(
              subscription.current_period_start * 1000
            ).toISOString(),
            subscription_current_period_end: new Date(
              subscription.current_period_end * 1000
            ).toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', userId)

        if (updateError) {
          console.error('Error updating subscription:', updateError)
        } else {
          console.log(`Subscription updated for user ${userId}`)
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const userId = subscription.metadata?.user_id

        if (!userId) {
          console.error('No user_id in subscription metadata')
          break
        }

        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            subscription_status: 'canceled',
            subscription_current_period_end: new Date(
              subscription.current_period_end * 1000
            ).toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', userId)

        if (updateError) {
          console.error('Error canceling subscription:', updateError)
        } else {
          console.log(`Subscription canceled for user ${userId}`)
        }
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        const subscriptionId = invoice.subscription as string

        if (subscriptionId) {
          const subscription = await stripe.subscriptions.retrieve(subscriptionId)
          const userId = subscription.metadata?.user_id

          if (userId) {
            // Zahlungshistorie speichern (optional)
            const { error: paymentError } = await supabase
              .from('payment_history')
              .insert({
                user_id: userId,
                stripe_invoice_id: invoice.id,
                amount: invoice.amount_paid,
                currency: invoice.currency.toUpperCase(),
                status: 'succeeded',
                created_at: new Date().toISOString(),
              })

            if (paymentError) {
              console.error('Error saving payment history:', paymentError)
            }

            console.log(`Payment succeeded for user ${userId}`)
          }
        }
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        const subscriptionId = invoice.subscription as string

        if (subscriptionId) {
          const subscription = await stripe.subscriptions.retrieve(subscriptionId)
          const userId = subscription.metadata?.user_id

          if (userId) {
            // Bei fehlgeschlagener Zahlung Status aktualisieren
            const { error: updateError } = await supabase
              .from('profiles')
              .update({
                subscription_status: 'past_due',
                updated_at: new Date().toISOString(),
              })
              .eq('id', userId)

            if (updateError) {
              console.error('Error updating failed payment status:', updateError)
            }

            console.log(`Payment failed for user ${userId}`)
          }
        }
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error('Error processing webhook:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

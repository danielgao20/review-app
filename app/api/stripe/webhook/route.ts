import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { UserService } from '@/lib/database'
import { supabaseAdmin } from '@/lib/supabase'
import Stripe from 'stripe'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')!
  
  if (!signature) {
    console.error('[WEBHOOK] No signature header')
    return NextResponse.json({ error: 'No signature' }, { status: 400 })
  }

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.error('[WEBHOOK] STRIPE_WEBHOOK_SECRET not configured')
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    )
  } catch (err: any) {
    console.error('[WEBHOOK] Signature verification failed:', err.message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        
        // Checkout session might not have subscription if it's not a subscription checkout
        if (!session.subscription) {
          // Not a subscription checkout, skip
          break
        }

        let subscription: Stripe.Subscription
        try {
          subscription = await stripe.subscriptions.retrieve(session.subscription as string)
        } catch (err: any) {
          console.error('[WEBHOOK] Error retrieving subscription:', err.message || err)
          break
        }

        const customerId = (session.customer as string) || ''
        let user = customerId ? await UserService.getByStripeCustomerId(customerId) : null
        if (!user && session.customer_email) {
          user = await UserService.getByEmail(session.customer_email)
        }

        if (!user) {
          console.error('[WEBHOOK] User not found for checkout session:', customerId, 'email:', session.customer_email)
          break
        }

        if (user) {
          // backfill stripe_customer_id if missing
          if (customerId && !user.stripe_customer_id) {
            await supabaseAdmin
              .from('users')
              .update({ stripe_customer_id: customerId })
              .eq('id', user.id)
          }

          // Type guard: ensure period dates exist and are numbers
          const periodStart = (subscription as any).current_period_start
          const periodEnd = (subscription as any).current_period_end
          
          if (typeof periodStart !== 'number' || typeof periodEnd !== 'number') {
            console.error('[WEBHOOK] Subscription missing period dates:', subscription.id)
            break
          }

          const startIso = new Date(periodStart * 1000).toISOString()
          const endIso = new Date(periodEnd * 1000).toISOString()

          const { error: userUpdateError } = await supabaseAdmin
            .from('users')
            .update({
              subscription_status: subscription.status as any,
              subscription_id: subscription.id
            })
            .eq('id', user.id)

          if (userUpdateError) {
            console.error('[WEBHOOK] Error updating user:', userUpdateError)
          }

          // upsert subscription by stripe_subscription_id
          const { data: existing } = await supabaseAdmin
            .from('subscriptions')
            .select('id')
            .eq('stripe_subscription_id', subscription.id)
            .single()

          if (existing) {
            const { error: subUpdateError } = await supabaseAdmin
              .from('subscriptions')
              .update({
                status: subscription.status as any,
                current_period_start: startIso,
                current_period_end: endIso
              })
              .eq('id', existing.id)
            
            if (subUpdateError) {
              console.error('[WEBHOOK] Error updating subscription:', subUpdateError)
            }
          } else {
            const { error: subInsertError } = await supabaseAdmin
              .from('subscriptions')
              .insert({
                user_id: user.id,
                stripe_subscription_id: subscription.id,
                status: subscription.status as any,
                current_period_start: startIso,
                current_period_end: endIso
              })
            
            if (subInsertError) {
              console.error('[WEBHOOK] Error inserting subscription:', subInsertError)
            }
          }
        }
        break
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = (subscription.customer as string) || ''
        
        let user = customerId ? await UserService.getByStripeCustomerId(customerId) : null
        
        // Fallback: try to find customer in Stripe and match by email
        if (!user && customerId) {
          try {
            const customer = await stripe.customers.retrieve(customerId)
            if (customer && !customer.deleted && typeof customer === 'object' && 'email' in customer && customer.email) {
              user = await UserService.getByEmail(customer.email)
              if (user && !user.stripe_customer_id) {
                // Backfill stripe_customer_id
                await supabaseAdmin
                  .from('users')
                  .update({ stripe_customer_id: customerId })
                  .eq('id', user.id)
              }
            }
          } catch (err) {
            console.error('[WEBHOOK] Error retrieving customer from Stripe:', err)
          }
        }
        
        if (!user) {
          console.error('[WEBHOOK] User not found for subscription:', subscription.id, 'customer:', customerId)
          break
        }
        
        if (user) {
          // Handle subscription status
          // If subscription is active (even if cancel_at_period_end is true), keep it as active until period ends
          const isActive = subscription.status === 'active' || subscription.status === 'trialing'
          const subscriptionStatus = isActive ? subscription.status : null
          
          // Type guard: ensure period dates exist and are numbers
          const periodStart = (subscription as any).current_period_start
          const periodEnd = (subscription as any).current_period_end
          
          if (typeof periodStart !== 'number' || typeof periodEnd !== 'number') {
            console.error('[WEBHOOK] Subscription missing period dates:', subscription.id)
            break
          }
          
          const startIso = new Date(periodStart * 1000).toISOString()
          const endIso = new Date(periodEnd * 1000).toISOString()

          const { error: userUpdateError } = await supabaseAdmin
            .from('users')
            .update({
              subscription_status: subscriptionStatus,
              subscription_id: isActive ? subscription.id : null
            })
            .eq('id', user.id)

          if (userUpdateError) {
            console.error('[WEBHOOK] Error updating user:', userUpdateError)
          }

          const { data: existing } = await supabaseAdmin
            .from('subscriptions')
            .select('id')
            .eq('stripe_subscription_id', subscription.id)
            .single()

          if (existing) {
            const { error: subUpdateError } = await supabaseAdmin
              .from('subscriptions')
              .update({
                status: subscription.status as any,
                current_period_start: startIso,
                current_period_end: endIso
              })
              .eq('id', existing.id)
            
            if (subUpdateError) {
              console.error('[WEBHOOK] Error updating subscription:', subUpdateError)
            }
          } else {
            const { error: subInsertError } = await supabaseAdmin
              .from('subscriptions')
              .insert({
                user_id: user.id,
                stripe_subscription_id: subscription.id,
                status: subscription.status as any,
                current_period_start: startIso,
                current_period_end: endIso
              })
            
            if (subInsertError) {
              console.error('[WEBHOOK] Error inserting subscription:', subInsertError)
            }
          }
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = (subscription.customer as string) || ''
        
        let user = customerId ? await UserService.getByStripeCustomerId(customerId) : null
        
        // Fallback: try to find customer in Stripe and match by email
        if (!user && customerId) {
          try {
            const customer = await stripe.customers.retrieve(customerId)
            if (customer && !customer.deleted && typeof customer === 'object' && 'email' in customer && customer.email) {
              user = await UserService.getByEmail(customer.email)
            }
          } catch (err) {
            console.error('[WEBHOOK] Error retrieving customer from Stripe:', err)
          }
        }
        
        if (user) {
          // Revert to free tier by setting subscription_status to null
          await supabaseAdmin
            .from('users')
            .update({ 
              subscription_status: null,
              subscription_id: null
            })
            .eq('id', user.id)

          const { data: existing } = await supabaseAdmin
            .from('subscriptions')
            .select('id')
            .eq('stripe_subscription_id', subscription.id)
            .single()

          if (existing) {
            await supabaseAdmin
              .from('subscriptions')
              .update({ status: 'canceled' })
              .eq('id', existing.id)
          }
        } else {
          console.error('[WEBHOOK] User not found for deleted subscription:', subscription.id)
        }
        break
      }

      default:
        // Unhandled event types are ignored
        break
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Error processing webhook:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}

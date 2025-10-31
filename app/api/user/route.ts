import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { UserService, SubscriptionService } from '@/lib/database'
import { stripe } from '@/lib/stripe'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await UserService.getById(session.user.id)
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get subscription details from Stripe
    // Only call Stripe if we have subscription data that needs verification
    // Skip Stripe calls for users without subscriptions to improve performance
    let subscriptionEndDate: string | null = null
    let isCanceling: boolean = false
    let actualSubscriptionStatus: string | null = user.subscription_status
    let foundSubscription: Stripe.Subscription | null = null

    // Check Stripe ONLY when absolutely necessary:
    // 1. User has subscription_id (need fresh cancel status and end date)
    // 2. User has active subscription status in DB but no subscription_id (webhook might have failed)
    // Skip Stripe calls for users with just customer_id and no subscription (faster)
    const hasActiveSubscriptionInDb = user.subscription_status === 'active' || user.subscription_status === 'trialing'
    const needsStripeCheck = user.subscription_id || (hasActiveSubscriptionInDb && !user.subscription_id)

    // Fast path: Users with no subscription or just customer_id (no active subscription)
    // Return database status immediately without Stripe API call
    if (!needsStripeCheck) {
      return NextResponse.json({
        subscription_status: user.subscription_status,
        stripe_customer_id: user.stripe_customer_id,
        subscription_end_date: null,
        is_canceling: false
      })
    }

    // Check Stripe for fresh subscription data
    // Priority: subscription_id lookup (fastest) > customer_id lookup (slower)
    if (needsStripeCheck) {
      // Fast path: If we have subscription_id, retrieve directly (single API call)
      if (user.subscription_id) {
        try {
          foundSubscription = await stripe.subscriptions.retrieve(user.subscription_id)
        } catch (err: any) {
          if (err.statusCode !== 404 && err.code !== 'resource_missing') {
            console.error('[USER] Error fetching subscription:', err.message || err)
          }
          // If subscription_id lookup fails, fall back to customer_id lookup
        }
      }

      // Fallback: Only check by customer_id if user has active status in DB but no subscription_id
      // This handles cases where webhook hasn't processed yet after checkout
      // Skip this expensive call if user doesn't have active subscription in DB
      if (!foundSubscription && user.stripe_customer_id && hasActiveSubscriptionInDb) {
        try {
          // Use status: 'all' and limit: 10 to get recent subscriptions, then filter
          const subscriptions = await stripe.subscriptions.list({
            customer: user.stripe_customer_id,
            status: 'all',
            limit: 10
          })
          
          // Prioritize active/trialing subscriptions, then most recent
          const activeSub = subscriptions.data.find(sub => 
            sub.status === 'active' || sub.status === 'trialing'
          ) || subscriptions.data[0] // Fall back to most recent if no active
          
          if (activeSub) {
            foundSubscription = activeSub
            // Sync database if subscription found is different from what we have (non-blocking)
            if (user.subscription_id !== activeSub.id) {
              const { supabaseAdmin } = await import('@/lib/supabase')
              // Fire and forget - don't block response
              supabaseAdmin
                .from('users')
                .update({
                  subscription_status: activeSub.status as any,
                  subscription_id: activeSub.id
                })
                .eq('id', user.id)
                .then(() => {
                  // Silently handle success
                })
                .catch((err) => {
                  console.error('[USER] Error syncing subscription from customer lookup (async):', err)
                })
            }
          }
        } catch (err: any) {
          console.error('[USER] Error fetching subscriptions by customer:', err.message || err)
        }
      }
    }

    // Process the found subscription
    if (foundSubscription) {
      const isActive = foundSubscription.status === 'active' || foundSubscription.status === 'trialing'
      const cancelAtPeriodEnd = (foundSubscription as any).cancel_at_period_end === true
      const cancelAt = (foundSubscription as any).cancel_at
      
      if (!isActive) {
        actualSubscriptionStatus = null
        isCanceling = false
        // Update database if subscription is no longer active (non-blocking)
        if (user.subscription_status !== null) {
          const { supabaseAdmin } = await import('@/lib/supabase')
          // Fire and forget - don't block response
          supabaseAdmin
            .from('users')
            .update({ subscription_status: null })
            .eq('id', user.id)
            .then(() => {
              // Silently handle success
            })
            .catch((err) => {
              console.error('[USER] Error updating subscription status (async):', err)
            })
        }
      } else {
        actualSubscriptionStatus = foundSubscription.status
        
        const hasCancelAt = cancelAt && typeof cancelAt === 'number' && cancelAt > Math.floor(Date.now() / 1000)
        isCanceling = cancelAtPeriodEnd === true || hasCancelAt
        
        if (hasCancelAt) {
          const cancelDate = new Date(cancelAt * 1000)
          if (!isNaN(cancelDate.getTime())) {
            subscriptionEndDate = cancelDate.toISOString()
          }
        } else if (foundSubscription.current_period_end && typeof foundSubscription.current_period_end === 'number') {
          const endDate = new Date(foundSubscription.current_period_end * 1000)
          if (!isNaN(endDate.getTime())) {
            subscriptionEndDate = endDate.toISOString()
          }
        }
        
        // Update database if subscription status changed (non-blocking)
        if (user.subscription_status !== foundSubscription.status) {
          const { supabaseAdmin } = await import('@/lib/supabase')
          // Fire and forget - don't block response
          supabaseAdmin
            .from('users')
            .update({
              subscription_status: foundSubscription.status as any,
              subscription_id: foundSubscription.id
            })
            .eq('id', user.id)
            .then(() => {
              // Silently handle success
            })
            .catch((err) => {
              console.error('[USER] Error syncing subscription status (async):', err)
            })
        }
      }
    } else if (user.subscription_id) {
      // Subscription_id exists but subscription not found in Stripe (likely canceled/deleted)
      // Update database to reflect this (non-blocking)
      actualSubscriptionStatus = null
      isCanceling = false
      const { supabaseAdmin } = await import('@/lib/supabase')
      // Fire and forget - don't block response
      supabaseAdmin
        .from('users')
        .update({ subscription_status: null, subscription_id: null })
        .eq('id', user.id)
        .then(() => {
          // Silently handle success
        })
        .catch((err) => {
          console.error('[USER] Error clearing subscription (async):', err)
        })
    }

    return NextResponse.json({
      subscription_status: actualSubscriptionStatus,
      stripe_customer_id: user.stripe_customer_id,
      subscription_end_date: subscriptionEndDate,
      is_canceling: isCanceling
    })
  } catch (error) {
    console.error('Error fetching user data:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

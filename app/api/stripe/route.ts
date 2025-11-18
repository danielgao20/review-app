import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { stripe, createCheckoutSession, createPortalSession, STRIPE_PRICE_ID } from '@/lib/stripe'
import { UserService } from '@/lib/database'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!STRIPE_PRICE_ID) {
      console.error('[STRIPE] STRIPE_PRICE_ID not configured')
      return NextResponse.json({ error: 'Price ID not configured' }, { status: 500 })
    }

    // Get user from database
    const user = await UserService.getById(session.user.id)
    if (!user) {
      console.error('[STRIPE] User not found:', { userId: session.user.id, email: session.user.email })
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get or create Stripe customer
    let customerId = user.stripe_customer_id
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.email,
      })
      customerId = customer.id
      await UserService.update(user.id, { stripe_customer_id: customerId })
    } else {
      // Verify customer exists in Stripe (handles test/live mode mismatches or deleted customers)
      try {
        await stripe.customers.retrieve(customerId)
      } catch (customerError: any) {
        // Customer doesn't exist - create a new one
        if (customerError.code === 'resource_missing' || customerError.message?.includes('No such customer')) {
          console.warn('[STRIPE] Customer not found in Stripe, creating new customer:', customerId)
          const customer = await stripe.customers.create({
            email: user.email,
            name: user.email,
          })
          customerId = customer.id
          await UserService.update(user.id, { stripe_customer_id: customerId })
        } else {
          // Re-throw other errors
          throw customerError
        }
      }
    }

    // Check for existing active subscriptions in Stripe
    try {
      const existingSubs = await stripe.subscriptions.list({
        customer: customerId,
        status: 'all',
        limit: 10
      })

      const activeSubs = existingSubs.data.filter(sub => 
        sub.status === 'active' || sub.status === 'trialing'
      )

      // Handle duplicate subscriptions
      if (activeSubs.length > 1) {
        activeSubs.sort((a, b) => b.created - a.created)
        for (let i = 1; i < activeSubs.length; i++) {
          await stripe.subscriptions.update(activeSubs[i].id, {
            cancel_at_period_end: true
          })
        }
      }

      // If user has any active subscription, redirect to portal
      if (activeSubs.length > 0) {
        try {
          const portalSession = await createPortalSession(
            customerId,
            `${process.env.NEXTAUTH_URL}/billing`
          )
          return NextResponse.json({ 
            url: portalSession.url,
            message: 'You already have an active subscription.'
          })
        } catch (portalError: any) {
          const isConfigError = portalError.message?.includes('default configuration')
          return NextResponse.json({ 
            error: 'You already have an active subscription',
            details: isConfigError 
              ? 'Please configure Stripe Customer Portal first.'
              : 'Please manage your subscription from the billing page.'
          }, { status: 400 })
        }
      }
    } catch (subCheckError) {
      console.error('[STRIPE] Error checking existing subscriptions:', subCheckError)
      // Continue with checkout if check fails (fallback behavior)
    }

    // Create checkout session
    const checkoutSession = await createCheckoutSession(
      customerId,
      STRIPE_PRICE_ID!,
      `${process.env.NEXTAUTH_URL}/billing?success=true`,
      `${process.env.NEXTAUTH_URL}/billing?canceled=true`
    )

    return NextResponse.json({ url: checkoutSession.url })
  } catch (error: any) {
    console.error('[STRIPE] Error creating checkout session:', error)
    
    // Handle specific Stripe errors
    if (error?.code === 'resource_missing' || error?.message?.includes('No such customer')) {
      // This shouldn't happen now with validation, but handle gracefully
      return NextResponse.json({ 
        error: 'Customer account issue',
        details: 'Please try again. If the problem persists, contact support.'
      }, { status: 400 })
    }
    
    return NextResponse.json({ 
      error: 'Failed to create checkout session',
      details: error?.message || 'An unexpected error occurred. Please try again.'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user from database
    const user = await UserService.getById(session.user.id)
    if (!user || !user.stripe_customer_id) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    }

    // Verify customer exists in Stripe before creating portal session
    let customerId = user.stripe_customer_id
    try {
      await stripe.customers.retrieve(customerId)
    } catch (customerError: any) {
      // Customer doesn't exist - return error
      if (customerError.code === 'resource_missing' || customerError.message?.includes('No such customer')) {
        console.error('[STRIPE] Customer not found in Stripe:', customerId)
        return NextResponse.json({ 
          error: 'Customer account not found',
          details: 'Please contact support to resolve this issue.'
        }, { status: 404 })
      }
      // Re-throw other errors
      throw customerError
    }

    // Create portal session
    const portalSession = await createPortalSession(
      customerId,
      `${process.env.NEXTAUTH_URL}/dashboard`
    )

    return NextResponse.json({ url: portalSession.url })
  } catch (error: any) {
    console.error('[STRIPE] Error creating portal session:', error)
    
    const isConfigError = error.message?.includes('default configuration')
    if (isConfigError) {
      return NextResponse.json({ 
        error: 'Customer portal not configured. Please set it up in Stripe Dashboard.',
        details: 'Visit https://dashboard.stripe.com/test/settings/billing/portal to configure.'
      }, { status: 400 })
    }
    
    return NextResponse.json({ 
      error: 'Failed to create portal session',
      details: error.message 
    }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { UserService, UsageService } from '@/lib/database'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Optimized: Get subscription status and usage data in parallel
    // Only fetch subscription_status field (not full user) for faster query
    const [subscriptionStatus, currentUsage] = await Promise.all([
      UserService.getSubscriptionStatus(session.user.id),
      UsageService.getTotalUsage(session.user.id)
    ])
    
    const hasActiveSubscription = subscriptionStatus === 'active'
    
    return NextResponse.json({
      currentUsage,
      limit: hasActiveSubscription ? Infinity : 10,
      hasActiveSubscription
    })
  } catch (error) {
    console.error('Error fetching usage data:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

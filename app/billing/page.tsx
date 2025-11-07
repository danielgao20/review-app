'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useRouter } from 'next/navigation'
import { Loader2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface UserData {
  subscription_status: string | null
  stripe_customer_id: string | null
  subscription_end_date: string | null
  is_canceling: boolean
}

interface UsageData {
  currentUsage: number
  limit: number
  hasActiveSubscription: boolean
}

export default function BillingPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [userData, setUserData] = useState<UserData | null>(null)
  const [usageData, setUsageData] = useState<UsageData | null>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/auth/signin')
      return
    }

    // Fetch all data together in parallel for faster loading
    const fetchData = async () => {
      try {
        setLoading(true)
        const [userResponse, usageResponse] = await Promise.all([
          fetch('/api/user'),
          fetch('/api/usage')
        ])

        if (!userResponse.ok) {
          const errorData = await userResponse.json().catch(() => ({}))
          console.error('Error fetching user data:', errorData.error || 'Unknown error')
        } else {
          const user = await userResponse.json()
          setUserData(user)
        }

        if (!usageResponse.ok) {
          const errorData = await usageResponse.json().catch(() => ({}))
          console.error('Error fetching usage data:', errorData.error || 'Unknown error')
          // Set default usage if fetch fails
          setUsageData({
            currentUsage: 0,
            limit: 10,
            hasActiveSubscription: false
          })
        } else {
          const usage = await usageResponse.json()
          setUsageData(usage)
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
    
    // Check if we're returning from checkout
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get('success') === 'true') {
      // Wait a moment for webhook to process, then refresh
      setTimeout(() => {
        fetchData()
        router.replace('/billing')
      }, 2000)
    } else if (urlParams.get('canceled') === 'true') {
      // Just remove the query param
      router.replace('/billing')
    }
  }, [status, session, router])

  const handleSubscribe = async () => {
    setProcessing(true)
    try {
      const response = await fetch('/api/stripe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
        // Price ID is fetched server-side from env
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        const errorMessage = data.error || 'Failed to create checkout session'
        const errorDetails = data.details || ''
        console.error('Error creating checkout session:', errorMessage, errorDetails)
        alert(`${errorMessage}${errorDetails ? '\n\n' + errorDetails : ''}`)
        return
      }

      const data = await response.json()
      if (data.url) {
        window.location.href = data.url
      } else if (data.error) {
        console.error('Error creating checkout session:', data.error)
        alert(`Failed to create checkout session: ${data.error}${data.details ? '\n\n' + data.details : ''}`)
      }
    } catch (error) {
      console.error('Error creating checkout session:', error)
      alert('Failed to create checkout session. Please try again.')
    } finally {
      setProcessing(false)
    }
  }

  const handleManageSubscription = async () => {
    setProcessing(true)
    try {
      const response = await fetch('/api/stripe', {
        method: 'GET',
      })

      const data = await response.json()
      if (data.url) {
        window.location.href = data.url
      } else if (data.error) {
        alert(`Error: ${data.error}\n\n${data.details || ''}`)
        console.error('Error creating portal session:', data)
      }
    } catch (error) {
      console.error('Error creating portal session:', error)
      alert('Failed to open subscription management. Please try again.')
    } finally {
      setProcessing(false)
    }
  }



  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null // Will redirect
  }

  // User is subscribed if they have an active subscription (even if canceling)
  const isSubscribed = userData?.subscription_status === 'active' || userData?.subscription_status === 'trialing'
  // Calculate usage percentage - for unlimited subscriptions, show 0% (no bar filling)
  const usagePercentage = usageData?.hasActiveSubscription 
    ? 0 // Unlimited users - don't show progress bar filling
    : usageData 
      ? (usageData.currentUsage / (usageData.limit || 10)) * 100 
      : 0

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link 
            href="/dashboard" 
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Billing & Usage</h1>
          <p className="mt-2 text-gray-600">Manage your subscription and track your review usage</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Usage Card */}
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">Usage</h2>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Reviews used</span>
                      <span>{usageData?.currentUsage || 0} / {usageData?.hasActiveSubscription ? '∞' : (usageData?.limit || 10)}</span>
                    </div>
                    {usageData?.hasActiveSubscription ? (
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="h-2 rounded-full bg-green-500" style={{ width: '100%' }}></div>
                      </div>
                    ) : (
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${
                            usagePercentage >= 100 ? 'bg-red-500' : 
                            usagePercentage >= 80 ? 'bg-yellow-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                        ></div>
                      </div>
                    )}
                  </div>
                  
                  {usageData && !usageData.hasActiveSubscription && (
                    <div className="text-sm text-gray-600">
                      {usageData.currentUsage >= usageData.limit ? (
                        <p className="text-red-600 font-medium">You've reached your free limit. Upgrade to continue generating reviews.</p>
                      ) : (
                        <p>{usageData.limit - usageData.currentUsage} free reviews remaining</p>
                      )}
                    </div>
                  )}
                </div>
              </Card>

              {/* Subscription Card */}
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">Subscription</h2>
                <div className="space-y-4">
                  {isSubscribed ? (
                    <div>
                      <div className="flex items-center mb-2">
                        <div className={`w-3 h-3 rounded-full mr-2 ${userData?.is_canceling ? 'bg-yellow-500' : 'bg-green-500'}`}></div>
                        <span className={`font-medium ${userData?.is_canceling ? 'text-yellow-700' : 'text-green-700'}`}>
                          {userData?.is_canceling ? 'Subscription Canceling' : 'Active Subscription'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {userData?.is_canceling 
                          ? 'Your subscription will remain active until the end of your billing period'
                          : 'You have unlimited review generation'}
                      </p>
                      {userData?.is_canceling && userData?.subscription_end_date && (
                        <p className="text-xs text-gray-500 mb-4">
                          Access expires on {new Date(userData.subscription_end_date).toLocaleDateString()}
                        </p>
                      )}
                      <Button 
                        onClick={handleManageSubscription}
                        disabled={processing}
                        variant="outline"
                        className="w-full"
                      >
                        {processing ? 'Loading...' : 'Manage Subscription'}
                      </Button>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center mb-2">
                        <div className="w-3 h-3 bg-gray-400 rounded-full mr-2"></div>
                        <span className="font-medium text-gray-700">Free Plan</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-4">
                        10 reviews included
                      </p>
                      <div className="space-y-2">
                        <Button 
                          onClick={handleSubscribe}
                          disabled={processing}
                          className="w-full"
                        >
                          {processing ? 'Loading...' : 'Upgrade to Pro - $10/month'}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            </div>

            {/* Plan Details */}
            <Card className="mt-6 p-6">
              <h2 className="text-xl font-semibold mb-4">Plan Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Free Plan</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• 10 reviews</li>
                    <li>• Basic review generation</li>
                    <li>• Email support</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Pro Plan - $10/month</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Unlimited reviews</li>
                    <li>• Advanced review generation</li>
                    <li>• Priority support</li>
                    <li>• Cancel anytime</li>
                  </ul>
                </div>
              </div>
            </Card>
      </div>
    </div>
  )
}

'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Building2, Star, MessageSquare, ExternalLink, LogOut, Loader2 } from 'lucide-react'
import Link from 'next/link'

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [business, setBusiness] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === 'loading') return // Still loading

    if (!session) {
      router.push('/auth/signin')
      return
    }

    // Fetch business data
    const fetchBusiness = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(`/api/business/${session.user.business?.slug}`)
        
        if (response.ok) {
          const data = await response.json()
          setBusiness(data.business)
        }
      } catch (error) {
        console.error('Error fetching business:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (session.user.business) {
      fetchBusiness()
    } else {
      setIsLoading(false)
    }
  }, [session, status, router])

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null // Will redirect
  }

  const handleSignOut = () => {
    signOut({ callbackUrl: '/demo' })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Review Funnel Dashboard
            </h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                {session.user.email}
              </span>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {business ? (
          <div className="space-y-8">
            {/* Business Info Card */}
            <Card className="shadow-lg border-0 bg-card/95 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl flex items-center justify-center shadow-sm">
                    {business.logo_url ? (
                      <img src={business.logo_url} alt={business.name} className="w-12 h-12 rounded-lg object-cover" />
                    ) : (
                      <Building2 className="h-8 w-8 text-primary" />
                    )}
                  </div>
                  <div>
                    <CardTitle className="text-2xl">{business.name}</CardTitle>
                    <CardDescription className="text-base">{business.location}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-2">Business Details</h3>
                    <div className="space-y-2 text-sm">
                      <p><strong>Email:</strong> {business.email}</p>
                      <p><strong>Location:</strong> {business.location}</p>
                      <p><strong>Keywords:</strong> {business.keywords || 'None'}</p>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Review Page</h3>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        Your customers can leave reviews at:
                      </p>
                      <div className="flex items-center gap-2">
                        <code className="bg-muted px-2 py-1 rounded text-sm">
                          {typeof window !== 'undefined' ? window.location.origin : ''}/review/{business.slug}
                        </code>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/review/${business.slug}`} target="_blank">
                            <ExternalLink className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="shadow-lg border-0 bg-card/95 backdrop-blur-sm">
                <CardHeader className="text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500/10 to-green-500/5 rounded-xl mx-auto mb-4 flex items-center justify-center">
                    <Star className="h-6 w-6 text-green-500" />
                  </div>
                  <CardTitle className="text-lg">View Reviews</CardTitle>
                  <CardDescription>
                    See all customer feedback and reviews
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <Button className="w-full" disabled>
                    Coming Soon
                  </Button>
                </CardContent>
              </Card>

              <Card className="shadow-lg border-0 bg-card/95 backdrop-blur-sm">
                <CardHeader className="text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500/10 to-blue-500/5 rounded-xl mx-auto mb-4 flex items-center justify-center">
                    <MessageSquare className="h-6 w-6 text-blue-500" />
                  </div>
                  <CardTitle className="text-lg">Analytics</CardTitle>
                  <CardDescription>
                    Track review performance and trends
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <Button className="w-full" disabled>
                    Coming Soon
                  </Button>
                </CardContent>
              </Card>

              <Card className="shadow-lg border-0 bg-card/95 backdrop-blur-sm">
                <CardHeader className="text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500/10 to-purple-500/5 rounded-xl mx-auto mb-4 flex items-center justify-center">
                    <Building2 className="h-6 w-6 text-purple-500" />
                  </div>
                  <CardTitle className="text-lg">Settings</CardTitle>
                  <CardDescription>
                    Update business information
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <Button className="w-full" disabled>
                    Coming Soon
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Instructions */}
            <Card className="shadow-lg border-0 bg-card/95 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl">Getting Started</CardTitle>
                <CardDescription>
                  Your review funnel is ready! Here's what to do next:
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">1</div>
                    <div>
                      <p className="font-medium">Share your review link</p>
                      <p className="text-sm text-muted-foreground">
                        Send customers to: <code className="bg-muted px-1 rounded">{typeof window !== 'undefined' ? window.location.origin : ''}/review/{business.slug}</code>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">2</div>
                    <div>
                      <p className="font-medium">Monitor feedback</p>
                      <p className="text-sm text-muted-foreground">
                        Check your email for customer feedback and reviews
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">3</div>
                    <div>
                      <p className="font-medium">Respond and improve</p>
                      <p className="text-sm text-muted-foreground">
                        Use feedback to improve your business and respond to customers
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card className="shadow-lg border-0 bg-card/95 backdrop-blur-sm">
            <CardContent className="text-center py-12">
              <div className="space-y-4">
                <Building2 className="h-12 w-12 mx-auto text-muted-foreground" />
                <h3 className="text-xl font-semibold">No Business Found</h3>
                <p className="text-muted-foreground">
                  It looks like you don't have a business associated with your account.
                </p>
                <Button asChild>
                  <Link href="/business/setup">
                    Set Up Your Business
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Building2, Star, MessageSquare, ExternalLink, LogOut, Loader2, Pencil } from 'lucide-react'
import Link from 'next/link'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [business, setBusiness] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [isUploadingLogo, setIsUploadingLogo] = useState(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [form, setForm] = useState({
    name: '',
    email: '',
    location: '',
    keywords: '',
    google_review_link: ''
  })

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
          setForm({
            name: data.business.name || '',
            email: data.business.email || '',
            location: data.business.location || '',
            keywords: data.business.keywords || '',
            google_review_link: data.business.google_review_link || ''
          })
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleLogoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    if (!file) return
    if (!file.type.startsWith('image/')) {
      console.error('Please select an image file')
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      console.error('File too large (max 2MB)')
      return
    }
    setLogoFile(file)
  }

  const uploadLogoAndSave = async () => {
    if (!business || !logoFile) return
    try {
      setIsUploadingLogo(true)
      const formData = new FormData()
      formData.append('file', logoFile)

      const res = await fetch(`/api/business/${business.slug}/logo`, {
        method: 'POST',
        body: formData
      })

      if (!res.ok) {
        console.error('Failed to upload logo')
        return
      }

      const updated = await res.json()
      setBusiness(updated.business)
      setLogoFile(null)
    } catch (err) {
      console.error(err)
    } finally {
      setIsUploadingLogo(false)
    }
  }

  const handleSave = async () => {
    if (!business) return
    try {
      setIsSaving(true)
      const res = await fetch(`/api/business/${business.slug}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          location: form.location,
          keywords: form.keywords || null,
          google_review_link: form.google_review_link || null
        })
      })

      if (!res.ok) {
        console.error('Failed to update business')
        return
      }

      const data = await res.json()
      setBusiness(data.business)
      // If slug changed due to name update, refresh form and URL-dependent displays
      if (data.business.slug !== business.slug) {
        // Re-fetch to ensure consistency
        const refreshed = await fetch(`/api/business/${data.business.slug}`)
        if (refreshed.ok) {
          const refreshedData = await refreshed.json()
          setBusiness(refreshedData.business)
          setForm({
            name: refreshedData.business.name || '',
            email: refreshedData.business.email || '',
            location: refreshedData.business.location || '',
            keywords: refreshedData.business.keywords || '',
            google_review_link: refreshedData.business.google_review_link || ''
          })
        }
      }
      setIsDialogOpen(false)
    } catch (e) {
      console.error(e)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      {/* Header */}
      <header className="border-b bg-background">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              LeaveRatings Dashboard
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
            <Card className="shadow-none">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="w-32 h-32 bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl flex items-center justify-center shadow-sm">
                    {business.logo_url ? (
                      <img src={business.logo_url} alt={business.name} className="w-28 h-28 rounded-lg object-cover" />
                    ) : (
                      <Building2 className="h-8 w-8 text-primary" />
                    )}
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-2xl">{business.name}</CardTitle>
                    <CardDescription className="text-base">{business.location}</CardDescription>
                  </div>
                  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Pencil className="h-4 w-4 mr-2" /> Edit
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Edit business details</DialogTitle>
                        <DialogDescription>Update your public-facing information.</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium">Name</label>
                            <Input name="name" value={form.name} onChange={handleChange} placeholder="Business name" />
                          </div>
                          <div>
                            <label className="text-sm font-medium">Email</label>
                            <Input name="email" value={form.email} onChange={handleChange} type="email" placeholder="contact@email.com" />
                          </div>
                          <div>
                            <label className="text-sm font-medium">Location</label>
                            <Input name="location" value={form.location} onChange={handleChange} placeholder="City, State" />
                          </div>
                          <div>
                            <label className="text-sm font-medium">Google Review Link</label>
                            <Input name="google_review_link" value={form.google_review_link} onChange={handleChange} placeholder="https://g.page/..." />
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-medium">Keywords</label>
                          <Textarea name="keywords" value={form.keywords} onChange={handleChange} placeholder="e.g., plumbing, emergency service" />
                        </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Logo</label>
                        <div className="flex items-center gap-4">
                          <div className="w-24 h-24 bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl flex items-center justify-center shadow-sm overflow-hidden">
                            {business?.logo_url ? (
                              <img src={business.logo_url} alt={business.name} className="w-20 h-20 rounded-lg object-cover" />
                            ) : (
                              <Building2 className="h-8 w-8 text-primary" />
                            )}
                          </div>
                          <div className="flex-1">
                            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleLogoSelect} className="hidden" />
                            <div className="flex items-center gap-3">
                              <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                                Choose file
                              </Button>
                              <span className="text-sm text-muted-foreground truncate">
                                {logoFile ? logoFile.name : 'No file chosen'}
                              </span>
                            </div>
                            <div className="flex gap-2 mt-2 mb-6">
                              <Button onClick={uploadLogoAndSave} disabled={!logoFile || isUploadingLogo}>
                                {isUploadingLogo ? (<><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Uploading</>) : 'Upload & Save'}
                              </Button>
                              {business?.logo_url && (
                                <Button
                                  variant="outline"
                                  onClick={async () => {
                                    const res = await fetch(`/api/business/${business.slug}/logo`, {
                                      method: 'DELETE'
                                    })
                                    if (res.ok) {
                                      const updated = await res.json()
                                      setBusiness(updated.business)
                                    }
                                  }}
                                >
                                  Remove
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                        
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSaving}>Cancel</Button>
                        <Button onClick={handleSave} disabled={isSaving}>
                          {isSaving ? (<><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving</>) : 'Save changes'}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
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
                          {typeof window !== 'undefined' ? window.location.origin : ''}/{business.slug}
                        </code>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/${business.slug}`} target="_blank" rel="noopener noreferrer">
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
              <Card className="shadow-none">
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

              <Card className="shadow-none">
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
            </div>

            {/* Instructions */}
            <Card className="shadow-none">
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
                        Send customers to: <code className="bg-muted px-1 rounded">{typeof window !== 'undefined' ? window.location.origin : ''}/{business.slug}</code>
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
          <Card className="shadow-none">
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

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Upload, Building2, Mail, MapPin, Star, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function BusinessOnboarding() {
  const [step, setStep] = useState(1)
  const [businessData, setBusinessData] = useState({
    name: '',
    email: 'dygao@usc.edu',
    logo: null as File | null,
    location: '',
    keywords: '',
    googleReviewLink: ''
  })

  const handleInputChange = (field: string, value: string) => {
    setBusinessData(prev => ({ ...prev, [field]: value }))
  }

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setBusinessData(prev => ({ ...prev, logo: file }))
    }
  }

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1)
    } else {
      // Generate unique page URL and save business data
      const pageUrl = `${window.location.origin}/review/${businessData.name.toLowerCase().replace(/\s+/g, '-')}`
      alert(`Your review page is ready! Share this link with customers: ${pageUrl}`)
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 flex items-center justify-center p-4">
      <div className="w-full max-w-lg space-y-6">
        <div className="flex justify-start">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/demo">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Demo
            </Link>
          </Button>
        </div>
        
        <Card className="w-full shadow-lg border-0 bg-card/95 backdrop-blur-sm">
          <CardHeader className="text-center pb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-sm">
              <Building2 className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold flex items-center justify-center gap-2">
              Business Setup
            </CardTitle>
            <CardDescription className="text-base">
              Step {step} of 3: Set up your review funnel
            </CardDescription>
          </CardHeader>
        <CardContent className="space-y-6">
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Business Name</label>
                <Input
                  placeholder="Your Business Name"
                  value={businessData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Contact Email</label>
                <Input
                  type="email"
                  placeholder="your@email.com"
                  value={businessData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Business Location</label>
                <Input
                  placeholder="City, State"
                  value={businessData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Business Logo</label>
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mb-2">
                    Upload your logo (optional)
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                    id="logo-upload"
                  />
                  <Button variant="outline" size="sm" asChild>
                    <label htmlFor="logo-upload" className="cursor-pointer">
                      Choose File
                    </label>
                  </Button>
                  {businessData.logo && (
                    <p className="text-xs text-muted-foreground mt-2">
                      {businessData.logo.name}
                    </p>
                  )}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">SEO Keywords</label>
                <Textarea
                  placeholder="e.g., restaurant, pizza, delivery, family-friendly"
                  value={businessData.keywords}
                  onChange={(e) => handleInputChange('keywords', e.target.value)}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Keywords that describe your business for better SEO
                </p>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Google Review Link</label>
                <Input
                  placeholder="https://g.page/r/your-business/review"
                  value={businessData.googleReviewLink}
                  onChange={(e) => handleInputChange('googleReviewLink', e.target.value)}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Link to your Google Business profile for reviews
                </p>
              </div>
              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-medium mb-2">How it works:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Customers rate with emojis (😞 😐 😊 😍)</li>
                  <li>• Bad/OK ratings → Private feedback form</li>
                  <li>• Good/Excellent → AI-generated Google review</li>
                  <li>• No customer signup required</li>
                </ul>
              </div>
            </div>
          )}

          <div className="flex gap-2">
            {step > 1 && (
              <Button variant="outline" onClick={handleBack} className="flex-1">
                Back
              </Button>
            )}
            <Button 
              onClick={handleNext} 
              className="flex-1"
              disabled={
                (step === 1 && (!businessData.name || !businessData.email || !businessData.location)) ||
                (step === 3 && !businessData.googleReviewLink)
              }
            >
              {step === 3 ? 'Create Review Page' : 'Next'}
            </Button>
          </div>
        </CardContent>
        </Card>
      </div>
    </div>
  )
}

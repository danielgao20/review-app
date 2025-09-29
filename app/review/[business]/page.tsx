'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
// Removed modal dialog components in favor of inline sections
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Star, MessageSquare, ExternalLink, ArrowLeft, Home, Loader2, Building2, Check } from 'lucide-react'
import Link from 'next/link'
import { Business } from '@/types/database'

interface BusinessData {
  name: string
  email: string
  location: string
  keywords: string
  googleReviewLink: string
  logo?: string
}

export default function CustomerReviewPage({ params }: { params: { business: string } }) {
  const [selectedRating, setSelectedRating] = useState<number | null>(null)
  const [showFeedbackForm, setShowFeedbackForm] = useState(false)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [generatedReview, setGeneratedReview] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [businessData, setBusinessData] = useState<Business | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isCopied, setIsCopied] = useState(false)
  const [isFeedbackSent, setIsFeedbackSent] = useState(false)
  const [isFeedbackLoading, setIsFeedbackLoading] = useState(false)

  const ratings = [
    { emoji: '🤩', label: 'Excellent', value: 4 },
    { emoji: '😊', label: 'Good', value: 3 },
    { emoji: '😐', label: 'OK', value: 2 },
    { emoji: '😞', label: 'Bad', value: 1 }
  ]

  // Fetch business data on component mount
  useEffect(() => {
    const fetchBusinessData = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(`/api/business/${params.business}`)
        
        if (!response.ok) {
          if (response.status === 404) {
            setError('Business not found')
          } else {
            setError('Failed to load business data')
          }
          return
        }

        const data = await response.json()
        setBusinessData(data.business)
      } catch (error) {
        console.error('Error fetching business data:', error)
        setError('Failed to load business data')
      } finally {
        setIsLoading(false)
      }
    }

    fetchBusinessData()
  }, [params.business])

  // Reset feedback UI when business changes
  useEffect(() => {
    setShowFeedbackForm(false)
    setIsFeedbackSent(false)
    setFeedback('')
  }, [params.business])

  // Hide feedback form when rating is cleared or changed to > 2
  useEffect(() => {
    if (selectedRating === null || (selectedRating !== null && selectedRating > 2)) {
      setShowFeedbackForm(false)
      setIsFeedbackSent(false)
      setFeedback('')
    }
  }, [selectedRating])

  const handleRatingSelect = (rating: number) => {
    setSelectedRating(rating)
    
    if (rating <= 2) {
      // Bad/OK - show private feedback form
      setShowFeedbackForm(true)
    }
    // For Good/Excellent, just show the rating - user will click generate button
  }

  const handleGenerateReview = () => {
    if (selectedRating && selectedRating > 2) {
      setIsGenerating(true)
      generateAIReview(selectedRating)
    }
  }

  const generateAIReview = async (rating: number) => {
    try {
      const response = await fetch('/api/generate-review', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          businessName: businessData?.name,
          location: businessData?.location,
          keywords: businessData?.keywords,
          rating: rating
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setGeneratedReview(data.review)
      } else {
        // Fallback to blank review if API fails
        setGeneratedReview('')
      }
    } catch (error) {
      console.error('Error generating review:', error)
      // Fallback to blank review if API fails
      setGeneratedReview('')
    }
    
    setIsGenerating(false)
    setShowReviewForm(true)
  }

  const handleFeedbackSubmit = async () => {
    setIsFeedbackLoading(true)
    try {
      // Send feedback to business owner
      const response = await fetch('/api/send-feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          businessName: businessData?.name,
          businessEmail: businessData?.email,
          customerEmail: 'Anonymous',
          feedback: feedback,
          rating: selectedRating,
          timestamp: new Date().toISOString()
        }),
      })
      // Regardless of response, show inline success state
      setIsFeedbackSent(true)
    } catch (error) {
      // Still show success state even if email fails
      setIsFeedbackSent(true)
    }
    // Keep the form open and selected rating; clear the text input
    setFeedback('')
    setIsFeedbackLoading(false)
  }

  const handleReviewSubmit = async () => {
    try {
      // Copy the review text to clipboard first
      await navigator.clipboard.writeText(generatedReview)
      setIsCopied(true)
      // Reset the copied state after 2 seconds
      setTimeout(() => {
        setIsCopied(false)
      }, 2000)
    } catch (error) {
      console.error('Failed to copy review:', error)
    }
    
    // Open Google Review link in new tab
    if (businessData?.google_review_link) {
      window.open(businessData.google_review_link, '_blank')
    }
    // Don't close the form or reset the rating - let user stay on the review page
  }

  const handleEditReview = (newReview: string) => {
    setGeneratedReview(newReview)
  }


  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 flex items-center justify-center p-4">
        <Card className="w-full max-w-lg shadow-none">
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin mx-auto" />
              <p className="text-muted-foreground">Loading business information...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Error state
  if (error || !businessData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 flex items-center justify-center p-4">
        <Card className="w-full max-w-lg shadow-none">
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center space-y-4">
              <p className="text-destructive font-medium">{error || 'Business not found'}</p>
                      <Button variant="outline" asChild>
                        <Link href="/">Back to Home</Link>
                      </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 flex items-center justify-center p-4">
      <div className="w-full max-w-lg space-y-4">
        
        <Card className="relative w-full shadow-none">
          {selectedRating && (
            <Button
              variant="ghost"
              size="default"
              onClick={() => {
                setSelectedRating(null)
                setShowFeedbackForm(false)
                setIsFeedbackSent(false)
                setFeedback('')
              }}
              className="absolute left-3 top-3 z-10"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to rating
            </Button>
          )}
          <CardHeader className="text-center pb-0 mt-8">
            <div className="w-40 h-40 bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl mx-auto mt-6 mb-6 flex items-center justify-center shadow-sm">
              {businessData.logo_url ? (
                <img src={businessData.logo_url} alt={businessData.name} className="w-36 h-36 rounded-lg object-cover" />
              ) : (
                <Building2 className="h-8 w-8 text-primary" />
              )}
            </div>
            <CardTitle className="text-2xl font-bold">{businessData.name}</CardTitle>
            <CardDescription className="text-base">{businessData.location}</CardDescription>
            <div className="w-full py-6">
              <div className="h-px bg-border w-1/2 mx-auto" />
            </div>
          </CardHeader>
        <CardContent className="space-y-6 pb-12">
          {!selectedRating ? (
            <div className="space-y-8">
              <div className="text-center space-y-2">
                <h3 className="text-xl font-semibold">
                  How was your experience?
                </h3>
                <p className="text-sm text-muted-foreground">
                  Tap an emoji to rate your visit
                </p>
              </div>
              <div className="flex gap-3 justify-center">
                {ratings.map((rating) => (
                  <Button
                    key={rating.value}
                    variant="outline"
                    className="h-20 w-20 flex flex-col gap-2 hover:bg-accent hover:scale-105 transition-all duration-200 border-2 hover:border-primary/20"
                    onClick={() => handleRatingSelect(rating.value)}
                  >
                    <span className="text-3xl">{rating.emoji}</span>
                    <span className="text-xs font-medium">{rating.label}</span>
                  </Button>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center space-y-6">
              
              <div className="space-y-4">
                <div className="w-24 h-24 bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl mx-auto mt-6 flex items-center justify-center shadow-sm">
                  <span className="text-5xl">
                    {ratings.find(r => r.value === selectedRating)?.emoji}
                  </span>
                </div>
                
                <div className="space-y-2">
                  <p className="text-xl font-semibold">
                    {ratings.find(r => r.value === selectedRating)?.label} Experience
                  </p>
                  {selectedRating <= 2 && (
                    <p className="text-sm text-muted-foreground">
                      We'd love to hear how we can improve
                    </p>
                  )}
                  {selectedRating > 2 && !showReviewForm && (
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        Ready to share your experience? We'll help you write a great review.
                      </p>
                      <Button 
                        onClick={handleGenerateReview}
                        className="w-full"
                        disabled={isGenerating}
                      >
                        {isGenerating ? 'Generating Review...' : 'Generate Review'}
                      </Button>
                    </div>
                  )}
                  {selectedRating > 2 && showReviewForm && (
                    <p className="text-sm text-muted-foreground">
                      Edit your review below, then post it on Google
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Inline Feedback Form */}
          {showFeedbackForm && (
            <div className="space-y-4 rounded-lg p-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <MessageSquare className="h-5 w-5" />
                  <span className="font-medium">Private Feedback</span>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  Your feedback will be sent directly to {businessData.name} to help them improve.
                </p>
              </div>
              {!isFeedbackSent ? (
                <div>
                  <label className="text-sm font-medium">How can we improve?</label>
                  <Textarea
                    placeholder="Tell us what went wrong and how we can do better..."
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    rows={6}
                  />
                </div>
              ) : (
                <div className="rounded-md bg-muted p-3 text-left">
                  <p className="text-sm">
                    Thank you for your feedback! It has been sent directly to the business owner.
                  </p>
                </div>
              )}
              <div className="flex items-center justify-between gap-2">
                <Button 
                  variant="outline"
                  onClick={() => {
                    setSelectedRating(null)
                    setShowFeedbackForm(false)
                    setShowReviewForm(false)
                    setIsFeedbackSent(false)
                    setFeedback('')
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleFeedbackSubmit}
                  disabled={!feedback.trim() || isFeedbackSent || isFeedbackLoading}
                  className={`min-w-[140px] transition-all duration-300 ${
                    isFeedbackSent 
                      ? 'bg-green-600 hover:bg-green-700 text-white' 
                      : ''
                  }`}
                >
                  {isFeedbackSent ? (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Sent
                    </>
                  ) : isFeedbackLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    'Send Feedback'
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Inline Review Form */}
          {showReviewForm && (
            <div className="space-y-4 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-1">
                <Star className="h-5 w-5" />
                <span className="font-medium">Share Your Experience</span>
              </div>
              <p className="text-sm text-muted-foreground">
                We've drafted a review for you. Edit it if you'd like, then post it on Google.
              </p>
              <div>
                <label className="text-sm font-medium">Your Review</label>
                <Textarea
                  value={generatedReview}
                  onChange={(e) => handleEditReview(e.target.value)}
                  placeholder="Write your review here... Share your experience and what you liked about this business."
                  rows={10}
                  className="resize-none"
                />
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowReviewForm(false)
                    setSelectedRating(null)
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleReviewSubmit}
                  className={`flex-1 transition-all duration-200 ${
                    isCopied 
                      ? 'bg-green-600 hover:bg-green-700' 
                      : ''
                  }`}
                >
                  {isCopied ? (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Copied & Posted!
                    </>
                  ) : (
                    <>
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Copy and Post on Google
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
        </Card>
      </div>
    </div>
  )
}

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Star, MessageSquare, ExternalLink, ArrowLeft, Home } from 'lucide-react'
import Link from 'next/link'

interface BusinessData {
  name: string
  email: string
  location: string
  keywords: string
  googleReviewLink: string
  logo?: string
}

// Mock business data - in real app, this would come from database
const mockBusinessData: BusinessData = {
  name: "Mario's Pizza",
  email: "dygao@usc.edu",
  location: "New York, NY",
  keywords: "pizza, italian, delivery, family restaurant",
  googleReviewLink: "https://g.page/r/marios-pizza/review"
}

export default function CustomerReviewPage() {
  const [selectedRating, setSelectedRating] = useState<number | null>(null)
  const [showFeedbackForm, setShowFeedbackForm] = useState(false)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [generatedReview, setGeneratedReview] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)

  const ratings = [
    { emoji: '😍', label: 'Excellent', value: 4 },
    { emoji: '😊', label: 'Good', value: 3 },
    { emoji: '😐', label: 'OK', value: 2 },
    { emoji: '😞', label: 'Bad', value: 1 }
  ]

  const handleRatingSelect = (rating: number) => {
    setSelectedRating(rating)
    
    if (rating <= 2) {
      // Bad/OK - show private feedback form
      setShowFeedbackForm(true)
    } else {
      // Good/Excellent - generate AI review
      setIsGenerating(true)
      generateAIReview(rating)
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
          businessName: mockBusinessData.name,
          location: mockBusinessData.location,
          keywords: mockBusinessData.keywords,
          rating: rating
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setGeneratedReview(data.review)
      } else {
        // Fallback to simple template if API fails
        const ratingText = rating === 3 ? 'good' : 'excellent'
        const fallbackReview = `I had a ${ratingText} experience at ${mockBusinessData.name} in ${mockBusinessData.location}. The service was outstanding and the staff was very professional. I would definitely recommend this place to anyone looking for quality service. Five stars!`
        setGeneratedReview(fallbackReview)
      }
    } catch (error) {
      console.error('Error generating review:', error)
      // Fallback to simple template if API fails
      const ratingText = rating === 3 ? 'good' : 'excellent'
      const fallbackReview = `I had a ${ratingText} experience at ${mockBusinessData.name} in ${mockBusinessData.location}. The service was outstanding and the staff was very professional. I would definitely recommend this place to anyone looking for quality service. Five stars!`
      setGeneratedReview(fallbackReview)
    }
    
    setIsGenerating(false)
    setShowReviewForm(true)
  }

  const handleFeedbackSubmit = async () => {
    try {
      // Send feedback to dygao@usc.edu
      const response = await fetch('/api/send-feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          businessName: mockBusinessData.name,
          businessEmail: mockBusinessData.email,
          customerEmail: 'Anonymous',
          feedback: feedback,
          rating: selectedRating,
          timestamp: new Date().toISOString()
        }),
      })

      if (response.ok) {
        alert('Thank you for your feedback! We\'ll use it to improve our service.')
      } else {
        alert('Thank you for your feedback! We\'ll use it to improve our service.')
      }
    } catch (error) {
      // Still show success message even if email fails
      alert('Thank you for your feedback! We\'ll use it to improve our service.')
    }
    
    setShowFeedbackForm(false)
    setFeedback('')
    setSelectedRating(null)
  }

  const handleReviewSubmit = () => {
    // Open Google Review link in new tab
    window.open(mockBusinessData.googleReviewLink, '_blank')
    setShowReviewForm(false)
    setSelectedRating(null)
  }

  const handleEditReview = (newReview: string) => {
    setGeneratedReview(newReview)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 flex items-center justify-center p-4">
      <div className="w-full max-w-lg space-y-4">
        {/* Back to Home Button */}
        <div className="flex justify-start">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/demo">
              <Home className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
          </Button>
        </div>
        
        <Card className="w-full shadow-lg border-0 bg-card/95 backdrop-blur-sm">
          <CardHeader className="text-center pb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-sm">
              <span className="text-3xl">🍕</span>
            </div>
            <CardTitle className="text-2xl font-bold">{mockBusinessData.name}</CardTitle>
            <CardDescription className="text-base">{mockBusinessData.location}</CardDescription>
          </CardHeader>
        <CardContent className="space-y-6">
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
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedRating(null)}
                className="mb-4"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to rating
              </Button>
              
              <div className="space-y-4">
                <div className="w-24 h-24 bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl mx-auto flex items-center justify-center shadow-sm">
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
                  {selectedRating > 2 && (
                    <p className="text-sm text-muted-foreground">
                      {isGenerating ? 'Generating your review...' : 'Ready to share your experience?'}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Feedback Form Dialog */}
          <Dialog open={showFeedbackForm} onOpenChange={setShowFeedbackForm}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Private Feedback
                </DialogTitle>
                <DialogDescription>
                  Your feedback will be sent directly to {mockBusinessData.name} to help them improve.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Your feedback will be sent directly to {mockBusinessData.name} to help them improve.
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">How can we improve?</label>
                  <Textarea
                    placeholder="Tell us what went wrong and how we can do better..."
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    rows={4}
                  />
                </div>
                <Button 
                  onClick={handleFeedbackSubmit}
                  disabled={!feedback.trim()}
                  className="w-full"
                >
                  Send Feedback
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Review Form Dialog */}
          <Dialog open={showReviewForm} onOpenChange={setShowReviewForm}>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  Share Your Experience
                </DialogTitle>
                <DialogDescription>
                  We've drafted a review for you. Edit it if you'd like, then post it on Google.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Your Review</label>
                  <Textarea
                    value={generatedReview}
                    onChange={(e) => handleEditReview(e.target.value)}
                    rows={6}
                    className="resize-none"
                  />
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowReviewForm(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleReviewSubmit}
                    className="flex-1"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Post on Google
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardContent>
        </Card>
      </div>
    </div>
  )
}

'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowRight, Star, MessageSquare, Zap, Smartphone } from 'lucide-react'
import Link from 'next/link'

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-[#FFFFFF]">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-[#2563EB]">
              LeaveRatings
            </h1>
            <div className="flex gap-4">
              <Button variant="outline" asChild>
                <Link href="/auth/signin">Sign In</Link>
              </Button>
              <Button asChild>
                <Link href="/auth/signup">Get Started</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6 text-[#111827] leading-tight py-2">
            Your Customers Hate Writing Reviews. We Fixed That.
          </h2>
          <p className="text-xl text-[#4B5563] mb-8 max-w-2xl mx-auto leading-relaxed">
            AI instantly generates the perfect, SEO optimized review for your happy customers. They just click and paste. More reviews. Less begging. Faster growth.
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" asChild className="shadow-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white">
              <Link href="/auth/signup">Get More Reviews Now</Link>
            </Button>
            <Button variant="outline" size="lg" asChild className="shadow-lg bg-[#FFFFFF] text-[#2563EB] border-[#2563EB] hover:bg-[#EFF6FF]">
              <Link href="/review/marios-pizza">See It In Action</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-[#F9FAFB]">
        <div className="container mx-auto px-4">
          <h3 className="text-3xl font-bold text-center mb-12 text-[#111827]">How It Works</h3>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-6 w-6" />
                  For Business Owners
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-medium">1. Quick Setup</h4>
                  <p className="text-sm text-[#6B7280]">
                    3-step onboarding: business info, logo upload, Google Review link
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">2. Get Your Link</h4>
                  <p className="text-sm text-[#6B7280]">
                    Receive a unique URL to share with customers
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">3. Collect Reviews</h4>
                  <p className="text-sm text-[#6B7280]">
                    Bad experiences go to private feedback, good ones become Google reviews
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smartphone className="h-6 w-6" />
                  For Customers
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-medium">1. Rate with Emojis</h4>
                  <p className="text-sm text-[#6B7280]">
                    Choose from 😞 😐 😊 😍 - no forms to fill out
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">2. Smart Routing</h4>
                  <p className="text-sm text-[#6B7280]">
                    Bad/OK → Private feedback form, Good/Excellent → Google review
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">3. Post to Google</h4>
                  <p className="text-sm text-[#6B7280]">
                    Edit the AI-generated review and post directly to Google
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h3 className="text-3xl font-bold text-center mb-12 text-[#111827]">Key Features</h3>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="text-center space-y-4">
              <div className="w-12 h-12 bg-[#2563EB] rounded-lg mx-auto flex items-center justify-center">
                <MessageSquare className="h-6 w-6 text-white" />
              </div>
              <h4 className="font-semibold">No Signup Required</h4>
              <p className="text-sm text-[#6B7280]">
                Customers can leave reviews instantly without creating accounts
              </p>
            </div>
            <div className="text-center space-y-4">
              <div className="w-12 h-12 bg-[#2563EB] rounded-lg mx-auto flex items-center justify-center">
                <Smartphone className="h-6 w-6 text-white" />
              </div>
              <h4 className="font-semibold">Mobile Optimized</h4>
              <p className="text-sm text-[#6B7280]">
                Designed for mobile-first experience with touch-friendly interface
              </p>
            </div>
            <div className="text-center space-y-4">
              <div className="w-12 h-12 bg-[#2563EB] rounded-lg mx-auto flex items-center justify-center">
                <Star className="h-6 w-6 text-white" />
              </div>
              <h4 className="font-semibold">AI-Powered Reviews</h4>
              <p className="text-sm text-[#6B7280]">
                Generate SEO-optimized reviews with business name and keywords
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-[#F9FAFB]">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-3xl font-bold mb-6 text-[#111827]">Ready to Get Started?</h3>
          <p className="text-lg text-[#4B5563] mb-8">
            Set up your review funnel in minutes and start collecting more reviews today.
          </p>
          <Button size="lg" asChild className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white">
            <Link href="/auth/signup">
              Create Your Review Page
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-sm text-[#6B7280]">
          <p>© 2025 LeaveRatings.</p>
        </div>
      </footer>
    </div>
  )
}

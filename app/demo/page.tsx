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
          <h2 className="text-2xl font-bold mb-6 text-[#111827] leading-tight py-2">
            AI-Powered Review Collection for Local Businesses
          </h2>
          <h1 className="text-3xl font-bold mb-6 text-[#111827] leading-tight py-2">
            Increase Positive Reviews, Decrease Negative Reviews. Rank higher.
          </h1>
          <p className="text-xl text-[#4B5563] mb-8 max-w-2xl mx-auto leading-relaxed">
            Your customers hate writing reviews — our tool makes it effortless. Happy customers get SEO-optimized reviews they can post in one click. Upset customers share private feedback with you instead.
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" asChild className="shadow-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white">
              <Link href="/auth/signup">Get More Reviews Now</Link>
            </Button>
            <Button variant="outline" size="lg" asChild className="shadow-lg bg-[#FFFFFF] text-[#2563EB] border-[#2563EB] hover:bg-[#EFF6FF]">
              <Link href="/marios-pizza" target="_blank" rel="noopener noreferrer">See It In Action</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* How It Works (Detailed) - moved above previous section, white background to match hero */}
      <section className="py-20 bg-[#FFFFFF]">
        <div className="container mx-auto px-4">
          <h3 className="text-3xl font-bold text-center mb-12 text-[#111827]">How It Works</h3>

          {/* Row 1: Video (left) / Text (right) */}
          <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto mb-16">
            <div className="aspect-video bg-[#E5E7EB] rounded-xl flex items-center justify-center text-[#6B7280]">
              ▶ Video
            </div>

            <div className="flex flex-col justify-center space-y-4">
              <span className="inline-block text-sm font-medium text-[#2563EB]">Smart Filtering</span>
              <h4 className="text-2xl font-semibold text-[#111827] tracking-tight">Increase Positive Reviews, Decrease Negative Reviews</h4>
              <p className="text-[#6B7280] leading-relaxed">
                LeaveRatings uses smart filtering so bad feedback goes to your inbox and good feedback flows straight to Google.
              </p>
            </div>
          </div>

          {/* Row 2: Text (left) / Video (right) */}
          <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
            <div className="order-2 md:order-1 flex flex-col justify-center space-y-4">
              <span className="inline-block text-sm font-medium text-[#2563EB]">AI Writing</span>
              <h4 className="text-2xl font-semibold text-[#111827] tracking-tight">AI-Powered, SEO-Optimized Reviews</h4>
              <p className="text-[#6B7280] leading-relaxed">
                Every review is automatically generated with the right keywords to boost your local SEO — unique, natural, and human-sounding.
              </p>
            </div>

            <div className="order-1 md:order-2 aspect-video bg-[#E5E7EB] rounded-xl flex items-center justify-center text-[#6B7280]">
              ▶ Video
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-[#F9FAFB]">
        <div className="container mx-auto px-4">
          <h3 className="text-3xl font-bold text-center mb-12 text-[#111827]">Use Cases</h3>
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
                    Choose from 😞 😐 😊 🤩 - no forms to fill out
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

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Building2, Mail } from 'lucide-react'
import Link from 'next/link'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setSuccess(false)

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(true)
        // In development, show the reset URL
        if (data.resetUrl) {
          console.log('Reset URL:', data.resetUrl)
        }
      } else {
        setError(data.error || 'Failed to send reset email')
      }
    } catch (error) {
      setError('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-4 sm:space-y-6">
          <div className="flex justify-start">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/auth/signin">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Sign In
              </Link>
            </Button>
          </div>
          
          <Card className="w-full shadow-lg border-0 bg-card/95 backdrop-blur-sm">
            <CardHeader className="text-center pb-4 sm:pb-6">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-green-500/10 to-green-500/5 rounded-2xl mx-auto mb-3 sm:mb-4 flex items-center justify-center shadow-sm">
                <Mail className="h-6 w-6 sm:h-8 sm:w-8 text-green-500" />
              </div>
              <CardTitle className="text-xl sm:text-2xl font-bold">Check Your Email</CardTitle>
              <CardDescription className="text-sm sm:text-base">
                We've sent a password reset link to your email address
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-sm text-muted-foreground mb-6">
                Check your email and click the reset link to set a new password.
              </p>
              <Button asChild className="w-full">
                <Link href="/auth/signin">
                  Back to Sign In
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4 sm:space-y-6">
        <div className="flex justify-start">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/auth/signin">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Sign In
            </Link>
          </Button>
        </div>
        
        <Card className="w-full shadow-lg border-0 bg-card/95 backdrop-blur-sm">
          <CardHeader className="text-center pb-4 sm:pb-6">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl mx-auto mb-3 sm:mb-4 flex items-center justify-center shadow-sm">
              <Building2 className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
            </div>
            <CardTitle className="text-xl sm:text-2xl font-bold">Forgot Password</CardTitle>
            <CardDescription className="text-sm sm:text-base">
              Enter your email address and we'll send you a reset link
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Email</label>
                <Input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading ? 'Sending...' : 'Send Reset Link'}
              </Button>
            </form>
            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Remember your password?{' '}
                <Link href="/auth/signin" className="text-primary hover:underline">
                  Sign in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

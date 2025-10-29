'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Building2, CheckCircle } from 'lucide-react'
import Link from 'next/link'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [token, setToken] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const tokenParam = searchParams.get('token')
    if (tokenParam) {
      setToken(tokenParam)
    } else {
      setError('Invalid reset link')
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    // Validation
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setIsLoading(false)
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, password }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(true)
        // Redirect to signin after 3 seconds
        setTimeout(() => {
          router.push('/auth/signin?message=Password reset successfully')
        }, 3000)
      } else {
        setError(data.error || 'Failed to reset password')
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
                <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-green-500" />
              </div>
              <CardTitle className="text-xl sm:text-2xl font-bold">Password Reset Successfully</CardTitle>
              <CardDescription className="text-sm sm:text-base">
                Your password has been updated
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-sm text-muted-foreground mb-6">
                You can now sign in with your new password. Redirecting to sign in...
              </p>
              <Button asChild className="w-full">
                <Link href="/auth/signin">
                  Sign In Now
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-4 sm:space-y-6">
          <Card className="w-full shadow-lg border-0 bg-card/95 backdrop-blur-sm">
            <CardHeader className="text-center pb-4 sm:pb-6">
              <CardTitle className="text-xl sm:text-2xl font-bold">Invalid Reset Link</CardTitle>
              <CardDescription className="text-sm sm:text-base">
                The password reset link is invalid or has expired
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button asChild className="w-full">
                <Link href="/auth/forgot-password">
                  Request New Reset Link
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
            <CardTitle className="text-xl sm:text-2xl font-bold">Reset Password</CardTitle>
            <CardDescription className="text-sm sm:text-base">
              Enter your new password below
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium">New Password</label>
                <Input
                  type="password"
                  placeholder="Enter new password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Confirm New Password</label>
                <Input
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
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
                {isLoading ? 'Resetting...' : 'Reset Password'}
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

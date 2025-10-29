import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { supabaseAdmin } from '@/lib/supabase'
import { EmailService } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Check if user exists
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('id, email')
      .eq('email', email)
      .single()

    if (userError || !user) {
      // Tell user that email is not associated with an account
      return NextResponse.json({
        success: false,
        error: 'This email address is not associated with any account.'
      }, { status: 404 })
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex')
    const resetTokenExpires = new Date(Date.now() + 3600000) // 1 hour from now

    // Save reset token to database
    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update({
        reset_token: resetToken,
        reset_token_expires: resetTokenExpires.toISOString()
      })
      .eq('id', user.id)

    if (updateError) {
      console.error('Error updating user with reset token:', updateError)
      return NextResponse.json(
        { error: 'Failed to generate reset token' },
        { status: 500 }
      )
    }

    // Send password reset email
    const resetUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/auth/reset-password?token=${resetToken}`
    
    const emailSent = await EmailService.sendPasswordResetEmail(user.email, resetUrl)
    
    if (!emailSent) {
      console.error('Failed to send password reset email')
      // Don't fail the request, just log the error
    }

    return NextResponse.json({
      success: true,
      message: 'We\'ve sent a password reset link to your email address.',
      // Only include this in development
      ...(process.env.NODE_ENV === 'development' && { resetUrl })
    })

  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

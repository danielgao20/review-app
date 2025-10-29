import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json()

    if (!token || !password) {
      return NextResponse.json(
        { error: 'Token and password are required' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      )
    }

    // Find user with valid reset token
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('id, reset_token, reset_token_expires')
      .eq('reset_token', token)
      .single()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Invalid or expired reset token' },
        { status: 400 }
      )
    }

    // Check if token is expired
    const now = new Date()
    const tokenExpires = new Date(user.reset_token_expires)

    if (now > tokenExpires) {
      return NextResponse.json(
        { error: 'Reset token has expired' },
        { status: 400 }
      )
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(password, 12)

    // Update user password and clear reset token
    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update({
        password_hash: passwordHash,
        reset_token: null,
        reset_token_expires: null
      })
      .eq('id', user.id)

    if (updateError) {
      console.error('Error updating password:', updateError)
      return NextResponse.json(
        { error: 'Failed to update password' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Password has been reset successfully'
    })

  } catch (error) {
    console.error('Reset password error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

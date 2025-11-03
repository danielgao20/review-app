import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { BusinessService } from '@/lib/database'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, businessName, location, keywords, googleReviewLink, emailConsent } = body

    // Validate required fields
    if (!email || !password || !businessName || !location || !googleReviewLink) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get IP address from request
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 
               request.headers.get('x-real-ip') || 
               'unknown'

    // Prepare email consent data
    const consentGiven = emailConsent === true
    const consentTimestamp = consentGiven ? new Date().toISOString() : null
    const consentIp = consentGiven ? ip : null

    // Check if user already exists
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', email)
      .single()

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      )
    }

    // Generate unique slug for business
    const slug = await BusinessService.generateUniqueSlug(businessName)

    // Create business first
    const business = await BusinessService.create({
      name: businessName,
      email: email,
      location: location,
      keywords: keywords || null,
      google_review_link: googleReviewLink,
      logo_url: null,
      slug: slug
    })

    if (!business) {
      return NextResponse.json(
        { error: 'Failed to create business' },
        { status: 500 }
      )
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12)

    // Create user
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .insert({
        email: email,
        password_hash: passwordHash,
        business_id: business.id,
        role: 'business_owner',
        email_consent: consentGiven,
        email_consent_timestamp: consentTimestamp,
        email_consent_ip: consentIp
      })
      .select()
      .single()

    if (userError || !user) {
      // If user creation fails, clean up business
      await supabaseAdmin
        .from('businesses')
        .delete()
        .eq('id', business.id)

      return NextResponse.json(
        { error: 'Failed to create user account' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Account created successfully',
      business: {
        id: business.id,
        slug: business.slug,
        name: business.name
      }
    })

  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { BusinessService } from '@/lib/database'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    // Check if user is authenticated
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { businessName, location, keywords, googleReviewLink } = body

    // Validate required fields
    if (!businessName || !location) {
      return NextResponse.json(
        { error: 'Business name and location are required' },
        { status: 400 }
      )
    }

    // Generate unique slug
    const slug = await BusinessService.generateUniqueSlug(businessName)

    // Create business
    const business = await BusinessService.create({
      name: businessName,
      email: session.user.email!,
      location: location,
      keywords: keywords || null,
      google_review_link: googleReviewLink || null,
      logo_url: null,
      slug: slug
    })

    if (!business) {
      return NextResponse.json(
        { error: 'Failed to create business' },
        { status: 500 }
      )
    }

    // Update user with business_id
    const { error: userError } = await supabaseAdmin
      .from('users')
      .update({ business_id: business.id })
      .eq('id', session.user.id)

    if (userError) {
      console.error('Error updating user with business_id:', userError)
      // Don't fail the request, business was created successfully
    }

    return NextResponse.json({
      success: true,
      business: {
        id: business.id,
        slug: business.slug,
        name: business.name
      }
    })

  } catch (error) {
    console.error('Error creating business:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

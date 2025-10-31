import { NextRequest, NextResponse } from 'next/server'
import { BusinessService } from '@/lib/database'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params

    if (!slug) {
      return NextResponse.json(
        { error: 'Business slug is required' },
        { status: 400 }
      )
    }

    const business = await BusinessService.adminGetBySlug(slug)

    if (!business) {
      return NextResponse.json(
        { error: 'Business not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ business })

  } catch (error) {
    console.error('Error fetching business:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { slug } = params

    if (!slug) {
      return NextResponse.json({ error: 'Business slug is required' }, { status: 400 })
    }

    const existing = await BusinessService.adminGetBySlug(slug)

    if (!existing) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    }

    // Ensure the authenticated user owns this business
    if (session.user.businessId !== existing.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const {
      name,
      email,
      location,
      keywords,
      google_review_link,
      logo_url
    } = body || {}

    const updates: Record<string, any> = {}

    if (typeof name === 'string' && name.trim().length > 0) {
      updates.name = name.trim()
      // If name changed, generate a new unique slug
      if (updates.name !== existing.name) {
        updates.slug = await BusinessService.generateUniqueSlug(updates.name, existing.id)
      }
    }
    if (typeof email === 'string') updates.email = email.trim()
    if (typeof location === 'string') updates.location = location.trim()
    if (typeof keywords === 'string' || keywords === null) updates.keywords = keywords
    if (typeof google_review_link === 'string' || google_review_link === null) updates.google_review_link = google_review_link
  if (typeof logo_url === 'string' || logo_url === null) updates.logo_url = logo_url

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
    }

    const updated = await BusinessService.update(existing.id, updates)

    if (!updated) {
      return NextResponse.json({ error: 'Failed to update business' }, { status: 500 })
    }

    return NextResponse.json({ business: updated })
  } catch (error) {
    console.error('Error updating business:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

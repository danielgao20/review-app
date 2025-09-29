import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { BusinessService } from '@/lib/database'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(
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

    const existing = await BusinessService.getBySlug(slug)
    if (!existing) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    }
    if (session.user.businessId !== existing.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    if (!file) {
      return NextResponse.json({ error: 'File is required' }, { status: 400 })
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const ext = (file.name?.split('.').pop() || 'png').toLowerCase()
    const path = `${existing.id}/${crypto.randomUUID()}.${ext}`

    const { error: uploadError } = await supabaseAdmin
      .storage
      .from('logos')
      .upload(path, buffer, { contentType: file.type, upsert: true })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 })
    }

    const { data } = supabaseAdmin.storage.from('logos').getPublicUrl(path)
    const publicUrl = data.publicUrl

    const updated = await BusinessService.update(existing.id, { logo_url: publicUrl })
    return NextResponse.json({ business: updated, logo_url: publicUrl })
  } catch (error) {
    console.error('Error uploading logo:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
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

    const existing = await BusinessService.getBySlug(slug)
    if (!existing) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    }
    if (session.user.businessId !== existing.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const updated = await BusinessService.update(existing.id, { logo_url: null })
    return NextResponse.json({ business: updated, logo_url: null })
  } catch (error) {
    console.error('Error removing logo:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}



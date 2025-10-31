import { supabaseAdmin } from './supabase'
import { Business, Review } from '@/types/database'

// Business CRUD operations
export class BusinessService {
  // Get business by slug (for review pages)
  static async getBySlug(slug: string): Promise<Business | null> {
    const { data, error } = await supabaseAdmin
      .from('businesses')
      .select('*')
      .eq('slug', slug)
      .maybeSingle()

    if (error) {
      console.error('Error fetching business by slug:', error)
      return null
    }

    return data
  }

  // Server-side: Get business by slug with admin client (bypasses RLS)
  static async adminGetBySlug(slug: string): Promise<Business | null> {
    const { data, error } = await supabaseAdmin
      .from('businesses')
      .select('*')
      .eq('slug', slug)
      .maybeSingle()

    if (error) {
      console.error('Error fetching business by slug (admin):', error)
      return null
    }

    return data
  }

  // Get business by ID
  static async getById(id: string): Promise<Business | null> {
    const { data, error } = await supabaseAdmin
      .from('businesses')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching business by ID:', error)
      return null
    }

    return data
  }

  // Create new business
  static async create(businessData: Omit<Business, 'id' | 'created_at' | 'updated_at'>): Promise<Business | null> {
    const { data, error } = await supabaseAdmin
      .from('businesses')
      .insert(businessData)
      .select()
      .single()

    if (error) {
      console.error('Error creating business:', error)
      return null
    }

    return data
  }

  // Update business
  static async update(id: string, updates: Partial<Omit<Business, 'id' | 'created_at' | 'updated_at'>>): Promise<Business | null> {
    const { data, error } = await supabaseAdmin
      .from('businesses')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating business:', error)
      return null
    }

    return data
  }

  // Generate unique slug from business name
  static generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .trim()
  }

  // Check if slug is unique
  static async isSlugUnique(slug: string, excludeId?: string): Promise<boolean> {
    let query = supabaseAdmin
      .from('businesses')
      .select('id')
      .eq('slug', slug)

    if (excludeId) {
      query = query.neq('id', excludeId)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error checking slug uniqueness:', error)
      return false
    }

    return data.length === 0
  }

  // Generate unique slug with number suffix if needed
  static async generateUniqueSlug(name: string, excludeId?: string): Promise<string> {
    let baseSlug = this.generateSlug(name)
    let slug = baseSlug
    let counter = 1

    while (!(await this.isSlugUnique(slug, excludeId))) {
      slug = `${baseSlug}-${counter}`
      counter++
    }

    return slug
  }
}

// Review operations
export class ReviewService {
  // Create new review
  static async create(reviewData: Omit<Review, 'id' | 'created_at'>): Promise<Review | null> {
    const { data, error } = await supabaseAdmin
      .from('reviews')
      .insert(reviewData)
      .select()
      .single()

    if (error) {
      console.error('Error creating review:', error)
      return null
    }

    return data
  }

  // Get reviews for a business
  static async getByBusinessId(businessId: string): Promise<Review[]> {
    const { data, error } = await supabaseAdmin
      .from('reviews')
      .select('*')
      .eq('business_id', businessId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching reviews:', error)
      return []
    }

    return data || []
  }

  // Update review (e.g., mark as posted to Google)
  static async update(id: string, updates: Partial<Omit<Review, 'id' | 'created_at'>>): Promise<Review | null> {
    const { data, error } = await supabaseAdmin
      .from('reviews')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating review:', error)
      return null
    }

    return data
  }

  // Get last 3 generated reviews for a business (for uniqueness checking)
  static async getLastGeneratedReviews(businessId: string, limit: number = 3): Promise<string[]> {
    const { data, error } = await supabaseAdmin
      .from('reviews')
      .select('generated_review')
      .eq('business_id', businessId)
      .not('generated_review', 'is', null)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching last generated reviews:', error)
      return []
    }

    return data.map(review => review.generated_review).filter(Boolean)
  }

  // Keep only the most recent 3 reviews for a business, delete older ones
  static async keepOnlyRecentReviews(businessId: string, keepCount: number = 3): Promise<void> {
    try {
      // Get all review IDs for this business, ordered by creation date (newest first)
      const { data: allReviews, error: fetchError } = await supabaseAdmin
        .from('reviews')
        .select('id')
        .eq('business_id', businessId)
        .order('created_at', { ascending: false })

      if (fetchError) {
        console.error('Error fetching reviews for cleanup:', fetchError)
        return
      }

      // If we have more than keepCount reviews, delete the older ones
      if (allReviews && allReviews.length > keepCount) {
        const reviewsToDelete = allReviews.slice(keepCount)
        const idsToDelete = reviewsToDelete.map(review => review.id)

        const { error: deleteError } = await supabaseAdmin
          .from('reviews')
          .delete()
          .in('id', idsToDelete)

        if (deleteError) {
          console.error('Error deleting old reviews:', deleteError)
        } else {
          console.log(`Cleaned up ${idsToDelete.length} old reviews for business ${businessId}`)
        }
      }
    } catch (error) {
      console.error('Error in keepOnlyRecentReviews:', error)
    }
  }
}

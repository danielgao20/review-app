import { supabase, supabaseAdmin } from './supabase'
import { Business, Review } from '@/types/database'

// Business CRUD operations
export class BusinessService {
  // Get business by slug (for review pages)
  static async getBySlug(slug: string): Promise<Business | null> {
    const { data, error } = await supabase
      .from('businesses')
      .select('*')
      .eq('slug', slug)
      .single()

    if (error) {
      console.error('Error fetching business by slug:', error)
      return null
    }

    return data
  }

  // Get business by ID
  static async getById(id: string): Promise<Business | null> {
    const { data, error } = await supabase
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
    const { data, error } = await supabase
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
    const { data, error } = await supabase
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
    let query = supabase
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
    const { data, error } = await supabase
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
    const { data, error } = await supabase
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
    const { data, error } = await supabase
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
}

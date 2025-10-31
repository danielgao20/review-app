import { supabase, supabaseAdmin } from './supabase'
import { Business, Review, User, Subscription, Usage } from '@/types/database'

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

// User operations
export class UserService {
  // Get user by email
  // Uses supabaseAdmin to bypass RLS policies (server-side operation)
  static async getByEmail(email: string): Promise<User | null> {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', email)
      .maybeSingle()

    if (error) {
      console.error('Error fetching user by email:', error)
      return null
    }

    return data
  }

  // Get user by ID
  // Uses supabaseAdmin to bypass RLS policies (server-side operation)
  static async getById(id: string): Promise<User | null> {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', id)
      .maybeSingle()

    if (error) {
      console.error('Error fetching user by ID:', error)
      return null
    }

    return data
  }

  // Update user
  // Uses supabaseAdmin to bypass RLS policies (server-side operation)
  static async update(id: string, updates: Partial<Omit<User, 'id' | 'created_at' | 'updated_at'>>): Promise<User | null> {
    const { data, error } = await supabaseAdmin
      .from('users')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating user:', error)
      return null
    }

    return data
  }

  // Get only subscription status (optimized for faster queries)
  // Uses supabaseAdmin to bypass RLS policies (server-side operation)
  static async getSubscriptionStatus(userId: string): Promise<string | null> {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('subscription_status')
      .eq('id', userId)
      .maybeSingle()

    if (error) {
      console.error('Error fetching subscription status:', error)
      return null
    }

    return data?.subscription_status || null
  }

  // Check if user has active subscription
  static async hasActiveSubscription(userId: string): Promise<boolean> {
    const status = await this.getSubscriptionStatus(userId)
    return status === 'active'
  }

  // Get user by Stripe customer ID
  // Uses supabaseAdmin to bypass RLS policies (server-side operation)
  static async getByStripeCustomerId(customerId: string): Promise<User | null> {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('stripe_customer_id', customerId)
      .maybeSingle()

    if (error) {
      console.error('Error fetching user by Stripe customer ID:', error)
      return null
    }
    return data
  }
}

// Subscription operations
export class SubscriptionService {
  // Create subscription
  static async create(subscriptionData: Omit<Subscription, 'id' | 'created_at' | 'updated_at'>): Promise<Subscription | null> {
    const { data, error } = await supabase
      .from('subscriptions')
      .insert(subscriptionData)
      .select()
      .single()

    if (error) {
      console.error('Error creating subscription:', error)
      return null
    }

    return data
  }

  // Get subscription by user ID
  static async getByUserId(userId: string): Promise<Subscription | null> {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error) {
      console.error('Error fetching subscription:', error)
      return null
    }

    return data
  }

  // Update subscription
  static async update(id: string, updates: Partial<Omit<Subscription, 'id' | 'created_at' | 'updated_at'>>): Promise<Subscription | null> {
    const { data, error } = await supabase
      .from('subscriptions')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating subscription:', error)
      return null
    }

    return data
  }

  // Upsert by stripe_subscription_id
  static async upsertByStripeId(userId: string, stripeId: string, status: Subscription['status'], startIso: string, endIso: string): Promise<void> {
    const { data: existing, error: fetchError } = await supabase
      .from('subscriptions')
      .select('id')
      .eq('stripe_subscription_id', stripeId)
      .single()

    if (!fetchError && existing) {
      await this.update(existing.id, {
        status,
        current_period_start: startIso,
        current_period_end: endIso
      })
      return
    }

    await this.create({
      user_id: userId,
      stripe_subscription_id: stripeId,
      status,
      current_period_start: startIso,
      current_period_end: endIso
    })
  }
}

// Usage tracking operations
export class UsageService {
  // Get lifetime usage
  // Uses supabaseAdmin to bypass RLS policies (server-side operation)
  static async getTotalUsage(userId: string): Promise<number> {
    const { data, error } = await supabaseAdmin
      .from('usage')
      .select('review_count')
      .eq('user_id', userId)

    if (error) {
      console.error('Error fetching total usage:', error)
      return 0
    }

    const total = (data || []).reduce((sum, row) => sum + (row.review_count || 0), 0)
    return total
  }

  // Increment usage for current month
  // Uses supabaseAdmin to bypass RLS policies (server-side operation)
  static async incrementUsage(userId: string, businessId: string): Promise<void> {
    const currentMonth = new Date().toISOString().slice(0, 7)
    
    // Try to update existing record first
    const { data: existing, error: fetchError } = await supabaseAdmin
      .from('usage')
      .select('id, review_count')
      .eq('user_id', userId)
      .eq('month', currentMonth)
      .maybeSingle()

    if (existing && !fetchError) {
      // Update existing record
      const { error: updateError } = await supabaseAdmin
        .from('usage')
        .update({ review_count: existing.review_count + 1 })
        .eq('id', existing.id)

      if (updateError) {
        console.error('Error updating usage:', updateError)
      }
    } else {
      // Create new record
      const { error: insertError } = await supabaseAdmin
        .from('usage')
        .insert({
          user_id: userId,
          business_id: businessId,
          month: currentMonth,
          review_count: 1
        })

      if (insertError) {
        console.error('Error creating usage record:', insertError)
      }
    }
  }

  // Check if user can generate more reviews (free tier limit)
  static async canGenerateReview(userId: string): Promise<boolean> {
    const hasActiveSubscription = await UserService.hasActiveSubscription(userId)
    
    if (hasActiveSubscription) {
      return true // Unlimited for paid users
    }

    const totalUsage = await this.getTotalUsage(userId)
    return totalUsage < 25 // Free tier lifetime limit
  }
}

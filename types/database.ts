export interface Business {
  id: string
  name: string
  email: string
  location: string
  keywords: string | null
  google_review_link: string | null
  logo_url: string | null
  slug: string
  created_at: string
  updated_at: string
}

export interface Review {
  id: string
  business_id: string
  rating: number
  feedback: string | null
  generated_review: string | null
  customer_email: string | null
  is_posted_to_google: boolean
  created_at: string
}

export interface User {
  id: string
  email: string
  password_hash: string
  business_id: string | null
  role: string
  reset_token: string | null
  reset_token_expires: string | null
  created_at: string
  updated_at: string
}

export interface Database {
  public: {
    Tables: {
      businesses: {
        Row: Business
        Insert: Omit<Business, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Business, 'id' | 'created_at' | 'updated_at'>>
      }
      reviews: {
        Row: Review
        Insert: Omit<Review, 'id' | 'created_at'>
        Update: Partial<Omit<Review, 'id' | 'created_at'>>
      }
      users: {
        Row: User
        Insert: Omit<User, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<User, 'id' | 'created_at' | 'updated_at'>>
      }
    }
  }
}

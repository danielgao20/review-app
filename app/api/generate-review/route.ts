import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { ReviewService, UserService, UsageService } from '@/lib/database'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
})


export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { businessName, location, keywords, rating, businessId } = body

    // Validate required fields
    if (!businessId) {
      return NextResponse.json({ 
        success: false, 
        error: 'Business ID is required' 
      }, { status: 400 })
    }

    // Check if business owner can generate more reviews
    // This is a public endpoint, so we check the business owner's limit, not the customer's
    // If no user is linked, allow reviews (businesses can exist without users)
    const businessOwner = await UserService.getByBusinessId(businessId)
    
    // Only check limits if a user is linked to the business
    if (businessOwner) {
      const canGenerate = await UsageService.canGenerateReview(businessOwner.id)
      if (!canGenerate) {
        return NextResponse.json({ 
          success: false, 
          error: 'Review limit reached. Please upgrade to continue generating reviews.',
          limitReached: true
        }, { status: 403 })
      }
    }
    // If no user is linked, allow reviews without limit checking
    // (This allows businesses to work even if not fully set up with a user account)

    // Check if API key is configured
    if (!process.env.ANTHROPIC_API_KEY) {
      console.error('Anthropic API key not configured')
      return NextResponse.json({ 
        success: true, 
        review: '' 
      })
    }

    const ratingText = rating === 3 ? 'good' : 'excellent'
    const keywordList = keywords ? keywords.split(',').map((k: string) => k.trim()).join(', ') : ''

    // Get previous reviews for this business to avoid similar beginnings
    let previousReviews: string[] = []
    if (businessId) {
      previousReviews = await ReviewService.getLastGeneratedReviews(businessId, 3).catch(() => [])
    }

    // Extract the first few words from previous reviews to avoid similar beginnings
    const previousBeginnings = previousReviews.map(review => {
      const firstWords = review.split(' ').slice(0, 6).join(' ')
      return firstWords
    }).filter(Boolean)

    const avoidBeginningsText = previousBeginnings.length > 0 
      ? `\n\nIMPORTANT: Avoid starting your review with these phrases that were used in recent reviews:\n${previousBeginnings.map(beginning => `- "${beginning}..."`).join('\n')}\n\nMake sure your review starts with completely different words.`
      : ''

    const prompt = `Write a positive Google review for ${businessName} in ${location}. 

The customer had a ${ratingText} experience. The business is related to: ${keywordList}.

Requirements:
- Write in first person as a customer
- Mention the business name and location naturally
- Include relevant keywords: ${keywordList}
- Keep it authentic and specific (not generic) but not too specific (no details).
- 3-4 sentences long
- End with a recommendation
- Make it sound like a real customer review
- Do not use em dashes
- No logical flaws or contradictions.
- Make every review different and unique.
- Do not start with any meta text or preface.
- Occasionally drop "I" at the beginning of sentences for variety (e.g., "Been coming here for years" instead of "I've been coming here for years")
- ABSOLUTELY FORBIDDEN: Never include placeholders like [Name], [word], [business], or any text in square brackets. The review must be 100% complete and ready to post with real words only.
- Output only the review text without any intro or labels.${avoidBeginningsText}
`

    const completion = await anthropic.messages.create({
      model: "claude-3-haiku-20240307", // Faster model for quick review generation
      max_tokens: 200,
      temperature: 0.8, // Slightly lower for faster generation
      system: "You are a helpful assistant that writes authentic, positive Google reviews. Each review must be 100% complete with no placeholders, brackets, or incomplete tags. Never use [Name], [word], or any text in square brackets. Occasionally drop 'I' at sentence beginnings for natural variation. Every review must be ready to post immediately.",
      messages: [
        {
          role: "user",
          content: prompt
        }
      ]
    })

    const generatedReview = completion.content[0]?.type === 'text' ? completion.content[0].text : ''

    // Store the generated review in the database (async - don't block response)
    if (businessId && generatedReview) {
      // Create review, increment usage (if user exists), and cleanup can run in parallel for speed
      const operations = [
        ReviewService.create({
          business_id: businessId,
          rating: rating,
          generated_review: generatedReview,
          feedback: null,
          customer_email: null,
          is_posted_to_google: false
        }),
        // Cleanup runs in parallel - it's safe because it only deletes if count > 3
        // Even if it runs before create completes, worst case is temporary 4 reviews
        ReviewService.keepOnlyRecentReviews(businessId, 3)
      ]
      
      // Only increment usage if a user is linked to the business
      if (businessOwner) {
        operations.push(UsageService.incrementUsage(businessOwner.id, businessId))
      }
      
      Promise.all(operations).catch(error => {
        console.error('Error storing or cleaning reviews:', error)
      })
    }

    return NextResponse.json({ 
      success: true, 
      review: generatedReview 
    })

  } catch (error) {
    console.error('Error generating review:', error)
    
    // Fallback to blank review if Claude fails
    return NextResponse.json({ 
      success: true, 
      review: '' 
    })
  }
}

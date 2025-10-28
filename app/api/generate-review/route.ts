import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { ReviewService } from '@/lib/database'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
})


export async function POST(request: NextRequest) {
  try {
    // Check if API key is configured
    if (!process.env.ANTHROPIC_API_KEY) {
      console.error('Anthropic API key not configured')
      return NextResponse.json({ 
        success: true, 
        review: '' 
      })
    }

    const body = await request.json()
    const { businessName, location, keywords, rating, businessId } = body

    const ratingText = rating === 3 ? 'good' : 'excellent'
    const keywordList = keywords.split(',').map((k: string) => k.trim()).join(', ')

    // Get previous reviews for this business to avoid similar beginnings
    let previousReviews: string[] = []
    if (businessId) {
      previousReviews = await ReviewService.getLastGeneratedReviews(businessId, 3)
    }

    // Extract the first few words from previous reviews to avoid similar beginnings
    const previousBeginnings = previousReviews.map(review => {
      const firstWords = review.split(' ').slice(0, 4).join(' ')
      return firstWords
    }).filter(Boolean)

    const avoidBeginningsText = previousBeginnings.length > 0 
      ? `\n\nIMPORTANT: Avoid starting your review with these phrases that were used in recent reviews for this business:\n${previousBeginnings.map(beginning => `- "${beginning}..."`).join('\n')}\n\nMake sure your review starts with completely different words and phrases.`
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
- Make every review different and unique.${avoidBeginningsText}
`

    const completion = await anthropic.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 200,
      temperature: 0.9,
      system: "You are a helpful assistant that writes authentic, positive Google reviews for businesses. Each review should sound like it was written by a different person with their own unique voice, writing style, and perspective. Avoid repetitive patterns and make each review feel fresh and original.",
      messages: [
        {
          role: "user",
          content: prompt
        }
      ]
    })

    const generatedReview = completion.content[0]?.type === 'text' ? completion.content[0].text : ''

    // Store the generated review in the database if businessId is provided
    if (businessId && generatedReview) {
      try {
        await ReviewService.create({
          business_id: businessId,
          rating: rating,
          generated_review: generatedReview,
          feedback: null,
          customer_email: null,
          is_posted_to_google: false
        })
        
        // Clean up old reviews, keeping only the most recent 3
        await ReviewService.keepOnlyRecentReviews(businessId, 3)
      } catch (error) {
        console.error('Error storing generated review:', error)
        // Continue even if storage fails
      }
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

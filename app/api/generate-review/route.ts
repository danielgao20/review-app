import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})


export async function POST(request: NextRequest) {
  try {
    // Check if API key is configured
    if (!process.env.OPENAI_API_KEY) {
      console.error('OpenAI API key not configured')
      const { businessName, location, keywords, rating } = await request.json()
      const ratingText = rating === 3 ? 'good' : 'excellent'
      const fallbackReview = `I had a ${ratingText} experience at ${businessName} in ${location}. The service was outstanding and the staff was very professional. I would definitely recommend this place to anyone looking for quality service. Five stars!`
      
      return NextResponse.json({ 
        success: true, 
        review: fallbackReview 
      })
    }

    const body = await request.json()
    const { businessName, location, keywords, rating } = body

    const ratingText = rating === 3 ? 'good' : 'excellent'
    const keywordList = keywords.split(',').map((k: string) => k.trim()).join(', ')

    const prompt = `Write a positive Google review for ${businessName} in ${location}. 

The customer had a ${ratingText} experience. The business is related to: ${keywordList}.

Requirements:
- Write in first person as a customer
- Mention the business name and location naturally
- Include relevant keywords: ${keywordList}
- Keep it authentic and specific (not generic)
- 3-4 sentences long
- End with a recommendation
- Make it sound like a real customer review

Example format: "I had a great experience at [Business Name] in [Location]. The [service/product] was excellent and the staff was very friendly. I would definitely recommend this place to anyone looking for [keywords]. Five stars!"`

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that writes authentic, positive Google reviews for businesses. Write reviews that sound genuine and specific to the business."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 150,
      temperature: 0.8,
    })

    const generatedReview = completion.choices[0]?.message?.content || ''

    return NextResponse.json({ 
      success: true, 
      review: generatedReview 
    })

  } catch (error) {
    console.error('Error generating review:', error)
    
    // Fallback to a simple template if OpenAI fails
    const { businessName, location, keywords, rating } = await request.json()
    const ratingText = rating === 3 ? 'good' : 'excellent'
    const fallbackReview = `I had a ${ratingText} experience at ${businessName} in ${location}. The service was outstanding and the staff was very professional. I would definitely recommend this place to anyone looking for quality service. Five stars!`
    
    return NextResponse.json({ 
      success: true, 
      review: fallbackReview 
    })
  }
}

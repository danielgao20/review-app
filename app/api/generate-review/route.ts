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
      return NextResponse.json({ 
        success: true, 
        review: '' 
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
- Keep it authentic and specific (not generic) but not too specific (no details).
- 3-4 sentences long
- End with a recommendation
- Make it sound like a real customer review
- Do not use em dashes
- Make every review different and unique.
`

    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo",
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
    
    // Fallback to blank review if OpenAI fails
    return NextResponse.json({ 
      success: true, 
      review: '' 
    })
  }
}

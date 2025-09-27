import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { businessName, businessEmail, customerEmail, feedback, rating, timestamp } = body

    // For MVP, we'll just log the feedback and simulate sending to dygao@usc.edu
    console.log('=== FEEDBACK RECEIVED ===')
    console.log('Business:', businessName)
    console.log('Business Email:', businessEmail)
    console.log('Customer Email:', customerEmail)
    console.log('Rating:', rating)
    console.log('Feedback:', feedback)
    console.log('Timestamp:', timestamp)
    console.log('========================')

    // In a real implementation, you would:
    // 1. Use an email service like SendGrid, Resend, or Nodemailer
    // 2. Send the feedback to dygao@usc.edu
    // 3. Optionally send a copy to the business email
    
    // For now, we'll simulate success
    const emailContent = `
New Customer Feedback Received

Business: ${businessName}
Business Email: ${businessEmail}
Customer Email: ${customerEmail}
Rating: ${rating}/4
Timestamp: ${timestamp}

Feedback:
${feedback}

---
This feedback was sent to dygao@usc.edu as requested.
    `.trim()

    // Log the email that would be sent
    console.log('Email to dygao@usc.edu:')
    console.log(emailContent)

    return NextResponse.json({ 
      success: true, 
      message: 'Feedback sent to dygao@usc.edu' 
    })

  } catch (error) {
    console.error('Error processing feedback:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to send feedback' },
      { status: 500 }
    )
  }
}

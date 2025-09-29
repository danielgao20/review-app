import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { businessName, businessEmail, customerEmail, feedback, rating, timestamp } = body

    // Log feedback for debugging
    console.log('=== FEEDBACK RECEIVED ===')
    console.log('Business:', businessName)
    console.log('Business Email:', businessEmail)
    console.log('Rating:', rating)
    console.log('Feedback:', feedback)
    console.log('========================')

    // Check if email is configured
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.log('Email not configured - logging only')
      return NextResponse.json({ 
        success: true, 
        message: 'Feedback logged (email not configured)' 
      })
    }

    // Create email transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })

    // Create email content
    const emailContent = `
New Customer Feedback Received

Rating: ${rating}/4
Customer Email: ${customerEmail || 'Anonymous'}
Timestamp: ${timestamp}

Feedback:
${feedback}

---
This feedback was sent via LeaveRatings App.
    `.trim()

    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.SMTP_USER,
      to: businessEmail, // Send to business owner
      subject: `Customer Feedback - ${businessName}`,
      text: emailContent,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px;">
            New Customer Feedback Received
          </h2>
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #495057; margin-top: 0;">Feedback Details</h3>
            <p><strong>Rating:</strong> ${rating}/4</p>
            <p><strong>Customer Email:</strong> ${customerEmail || 'Anonymous'}</p>
            <p><strong>Timestamp:</strong> ${timestamp}</p>
          </div>
          <div style="background: #fff; padding: 20px; border: 1px solid #dee2e6; border-radius: 8px;">
            <h3 style="color: #495057; margin-top: 0;">Customer Feedback</h3>
            <p style="white-space: pre-wrap; line-height: 1.6;">${feedback}</p>
          </div>
          <hr style="border: none; border-top: 1px solid #dee2e6; margin: 30px 0;">
          <p style="color: #6c757d; font-size: 12px; text-align: center;">
            This feedback was sent via LeaveRatings App.
          </p>
        </div>
      `
    }

    try {
      // Try to send to business owner first
      await transporter.sendMail(mailOptions)
      console.log('✅ Email sent to business owner:', businessEmail)
      
      return NextResponse.json({ 
        success: true, 
        message: `Feedback sent to ${businessEmail}` 
      })
    } catch (emailError) {
      console.error('❌ Failed to send to business owner:', emailError)
      
      // FALLBACK: If business email fails, send to platform email
      // This prevents losing feedback when business emails are invalid
      const fallbackOptions = {
        ...mailOptions,
        to: process.env.EMAIL_TO || 'leaveratings@gmail.com',
        subject: `[FALLBACK] Customer Feedback for ${businessName}`,
        text: `FALLBACK: Business email (${businessEmail}) failed\n\n${emailContent}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #dc3545; border-bottom: 2px solid #dc3545; padding-bottom: 10px;">
              [FALLBACK] Customer Feedback for ${businessName}
            </h2>
            <div style="background: #f8d7da; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #f5c6cb;">
              <p style="color: #721c24; margin: 0;"><strong>Note:</strong> Business email (${businessEmail}) failed. Sent to platform instead.</p>
            </div>
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #495057; margin-top: 0;">Feedback Details</h3>
              <p><strong>Rating:</strong> ${rating}/4</p>
              <p><strong>Customer Email:</strong> ${customerEmail || 'Anonymous'}</p>
              <p><strong>Timestamp:</strong> ${timestamp}</p>
            </div>
            <div style="background: #fff; padding: 20px; border: 1px solid #dee2e6; border-radius: 8px;">
              <h3 style="color: #495057; margin-top: 0;">Customer Feedback</h3>
              <p style="white-space: pre-wrap; line-height: 1.6;">${feedback}</p>
            </div>
          </div>
        `
      }
      
      await transporter.sendMail(fallbackOptions)
      console.log('✅ Fallback email sent to platform')
      
      return NextResponse.json({ 
        success: true, 
        message: 'Feedback sent to platform (business email failed)' 
      })
    }

  } catch (error) {
    console.error('❌ Error processing feedback:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to process feedback' 
      },
      { status: 500 }
    )
  }
}
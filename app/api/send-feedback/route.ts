import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { businessName, businessEmail, customerEmail, feedback, rating, timestamp } = body

    // Log the feedback received
    console.log('=== FEEDBACK RECEIVED ===')
    console.log('Business:', businessName)
    console.log('Business Email:', businessEmail)
    console.log('Customer Email:', customerEmail)
    console.log('Rating:', rating)
    console.log('Feedback:', feedback)
    console.log('Timestamp:', timestamp)
    console.log('========================')

    // Check if email configuration is available
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.log('Email configuration not found, logging feedback only')
      
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
This feedback was logged (email service not configured).
      `.trim()

      console.log('Email content that would be sent:')
      console.log(emailContent)

      return NextResponse.json({ 
        success: true, 
        message: 'Feedback logged (email service not configured)' 
      })
    }

    // Create email transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })

    // Email content
    const emailContent = `
New Customer Feedback Received

Business: ${businessName}
Business Email: ${businessEmail}
Customer Email: ${customerEmail || 'Not provided'}
Rating: ${rating}/4
Timestamp: ${timestamp}

Feedback:
${feedback}

---
This feedback was sent via Review Funnel App.
    `.trim()

    // Send email
    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.SMTP_USER,
      to: process.env.EMAIL_TO || 'dygao@usc.edu',
      subject: `Customer Feedback - ${businessName}`,
      text: emailContent,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px;">
            New Customer Feedback Received
          </h2>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #495057; margin-top: 0;">Business Details</h3>
            <p><strong>Business:</strong> ${businessName}</p>
            <p><strong>Business Email:</strong> ${businessEmail}</p>
            <p><strong>Customer Email:</strong> ${customerEmail || 'Not provided'}</p>
            <p><strong>Rating:</strong> ${rating}/4</p>
            <p><strong>Timestamp:</strong> ${timestamp}</p>
          </div>
          
          <div style="background: #fff; padding: 20px; border: 1px solid #dee2e6; border-radius: 8px;">
            <h3 style="color: #495057; margin-top: 0;">Customer Feedback</h3>
            <p style="white-space: pre-wrap; line-height: 1.6;">${feedback}</p>
          </div>
          
          <hr style="border: none; border-top: 1px solid #dee2e6; margin: 30px 0;">
          <p style="color: #6c757d; font-size: 12px; text-align: center;">
            This feedback was sent via Review Funnel App.
          </p>
        </div>
      `
    }

    await transporter.sendMail(mailOptions)
    console.log('Email sent successfully to:', process.env.EMAIL_TO || 'dygao@usc.edu')

    return NextResponse.json({ 
      success: true, 
      message: 'Feedback sent successfully to dygao@usc.edu' 
    })

  } catch (error) {
    console.error('Error sending feedback email:', error)
    
    // Fallback: still log the feedback even if email fails
    // Note: We can't read the body again, so we'll use the already parsed data
    console.log('=== FALLBACK: FEEDBACK LOGGED ===')
    console.log('Error:', error)
    console.log('================================')
    
    return NextResponse.json(
      { 
        success: true, 
        message: 'Feedback received (email failed, but feedback was logged)' 
      },
      { status: 200 } // Still return success since feedback was captured
    )
  }
}

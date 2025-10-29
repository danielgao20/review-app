// Email service for sending password reset emails
// Uses the same Nodemailer configuration as the existing feedback system

import nodemailer from 'nodemailer'

export interface EmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

export class EmailService {
  static async sendPasswordResetEmail(email: string, resetUrl: string): Promise<boolean> {
    const emailOptions: EmailOptions = {
      to: email,
      subject: 'Password Reset Request',
      html: this.getPasswordResetEmailHTML(resetUrl),
      text: this.getPasswordResetEmailText(resetUrl)
    }

    try {
      // Check if email is configured (same as existing feedback system)
      if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.log('Email not configured - logging password reset link only')
        console.log('Password reset link:', resetUrl)
        return true
      }

      // Create email transporter (same as existing feedback system)
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      })

      // Send email
      await transporter.sendMail({
        from: process.env.EMAIL_FROM || 'leaveratings@gmail.com',
        to: emailOptions.to,
        subject: emailOptions.subject,
        html: emailOptions.html,
        text: emailOptions.text
      })

      console.log('✅ Password reset email sent to:', email)
      return true
    } catch (error) {
      console.error('❌ Failed to send password reset email:', error)
      return false
    }
  }

  private static getPasswordResetEmailHTML(resetUrl: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Password Reset</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #f8f9fa; padding: 30px; border-radius: 8px; text-align: center;">
            <h1 style="color: #2563eb; margin-bottom: 20px;">Password Reset Request</h1>
            <p style="font-size: 16px; margin-bottom: 20px;">
              You requested to reset your password. Click the button below to set a new password:
            </p>
            <a href="${resetUrl}" 
               style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
              Reset Password
            </a>
            <p style="font-size: 14px; color: #666; margin-top: 30px;">
              This link will expire in 1 hour for security reasons.
            </p>
            <p style="font-size: 14px; color: #666; margin-top: 20px;">
              If you didn't request this password reset, please ignore this email.
            </p>
          </div>
        </body>
      </html>
    `
  }

  private static getPasswordResetEmailText(resetUrl: string): string {
    return `
Password Reset Request

You requested to reset your password. Click the link below to set a new password:

${resetUrl}

This link will expire in 1 hour for security reasons.

If you didn't request this password reset, please ignore this email.
    `.trim()
  }
}

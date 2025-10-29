# Review App (LeaveRatings)

A simple, public-facing review funnel that businesses can set up for their customers. Built with Next.js, TypeScript, and shadcn/ui with a clean black and white design.

## Features

### For Business Owners
- **Lightweight Onboarding**: 3-step setup process
- **Business Configuration**: Upload logo, add SEO keywords, set location
- **Contact Management**: Provide email for private feedback
- **Google Integration**: Add Google Review link for customer reviews

### For Customers
- **Frictionless Experience**: No signup required
- **Emoji Rating System**: Choose from Bad, OK, Good, Excellent
- **Smart Routing**: 
  - Bad/OK ratings → Private feedback form (emailed to business)
  - Good/Excellent ratings → AI-generated Google review (editable)
- **Mobile-Friendly**: Responsive design for all devices

## Getting Started

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Set up API Keys and Email**
   Create a `.env.local` file with your Anthropic Claude API key. For email functionality, you'll need to add email configuration:
   ```
   ANTHROPIC_API_KEY=your_anthropic_api_key_here
   
   # Email Configuration (optional - for feedback emails)
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your_email@gmail.com
   SMTP_PASS=your_app_password
   EMAIL_FROM=your_email@gmail.com
   EMAIL_TO=your_email@gmail.com
   ```
   
   **Note**: For Gmail, you'll need to use an App Password instead of your regular password. The app will work without email configuration (feedback will be logged to console).

3. **Run Development Server**
   ```bash
   npm run dev
   ```

4. **Open in Browser**
   Navigate to [http://localhost:3000/demo](http://localhost:3000/demo)

## How It Works

### Business Setup Flow
1. **Step 1**: Enter business name, contact email, and location
2. **Step 2**: Upload logo (optional) and add SEO keywords
3. **Step 3**: Add Google Review link and get your unique review page URL

### Customer Review Flow
1. **Visit Review Page**: Customer goes to business's unique URL
2. **Rate Experience**: Choose from 4 emoji options
3. **Route Based on Rating**:
   - **Bad/OK**: Private feedback form → Emailed to business
   - **Good/Excellent**: AI-generated review → Customer can edit and post on Google

## Project Structure

```
├── app/
│   ├── globals.css          # Global styles with shadcn theme
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Business onboarding page
│   └── review/
│       └── [business]/
│           └── page.tsx     # Customer review page
├── components/
│   └── ui/                  # shadcn/ui components
├── lib/
│   └── utils.ts             # Utility functions
└── package.json
```

## Design System

- **Color Scheme**: Clean black and white theme
- **Components**: shadcn/ui for consistent, accessible components
- **Typography**: Inter font for modern, readable text
- **Layout**: Mobile-first responsive design

## Technology Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Components**: shadcn/ui
- **Icons**: Lucide React
- **AI**: Anthropic Claude for review generation
- **Email**: Nodemailer for feedback delivery

## Email Setup (Optional)

The app can send feedback emails and password reset emails using SMTP. To set up email functionality:

1. **For Gmail users:**
   - Enable 2-factor authentication
   - Generate an App Password
   - Use the App Password in `SMTP_PASS`

2. **For other email providers:**
   - Update `SMTP_HOST` and `SMTP_PORT` accordingly
   - Use your email credentials

3. **Without email setup:**
   - Feedback will be logged to the console
   - Password reset links will be logged to console in development
   - App will still function normally

## Password Reset Feature

The app includes a complete password reset system:

1. **Forgot Password**: Users can request a password reset from the sign-in page
2. **Email Reset Link**: A secure token is generated and sent via email
3. **Reset Password**: Users can set a new password using the token from their email
4. **Security**: Reset tokens expire after 1 hour for security

### Database Requirements

Make sure your `users` table includes these columns for password reset functionality:
```sql
ALTER TABLE users ADD COLUMN reset_token TEXT;
ALTER TABLE users ADD COLUMN reset_token_expires TIMESTAMP;
```

### Email Service Integration

The password reset system uses the same Nodemailer configuration as the existing feedback system. It automatically uses your existing email settings from `.env.local`:

- **SMTP_HOST**: Your SMTP server (e.g., smtp.gmail.com)
- **SMTP_USER**: Your email address (e.g., leaveratings@gmail.com)
- **SMTP_PASS**: Your email password or app password
- **EMAIL_FROM**: Sender email address (defaults to leaveratings@gmail.com)

No additional configuration needed - it uses the same email setup as your feedback system!

## Future Enhancements

- Database integration for business data storage
- Analytics dashboard for business owners
- Custom domain support
- Multi-language support
- Rate limiting for API calls
- Review templates customization

## License

MIT License

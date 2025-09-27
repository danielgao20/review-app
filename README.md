# Review Funnel App

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

2. **Set up OpenAI API Key**
   The app uses OpenAI's GPT-3.5-turbo to generate reviews. The API key is already configured in the code for this demo.

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
- **AI**: OpenAI GPT-3.5-turbo for review generation

## Future Enhancements

- Database integration for business data storage
- Email service integration for feedback delivery
- Analytics dashboard for business owners
- Custom domain support
- Multi-language support
- Rate limiting for API calls
- Review templates customization

## License

MIT License

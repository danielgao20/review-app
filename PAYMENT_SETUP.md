# Review App with Payment Integration

A Next.js application that helps businesses collect customer reviews with AI-generated review suggestions. Features a freemium model with Stripe payment integration.

## Features

- **Free Tier**: 25 reviews per month
- **Pro Tier**: Unlimited reviews for $10/month
- AI-powered review generation using Anthropic Claude
- Stripe payment processing
- Supabase database
- NextAuth authentication
- Responsive UI with Tailwind CSS

## Setup Instructions

### 1. Environment Variables

Create a `.env.local` file with the following variables:

```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PRICE_ID=price_...

# Existing variables
ANTHROPIC_API_KEY=...
NEXTAUTH_SECRET=...
NEXTAUTH_URL=http://localhost:3000
SUPABASE_URL=...
SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

### 2. Stripe Setup

1. Create a Stripe account at https://stripe.com
2. Get your API keys from the Stripe dashboard
3. Create a product and price for the monthly subscription ($10/month)
4. Set up webhooks pointing to `https://yourdomain.com/api/stripe/webhook`
5. Add the webhook events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`

### 3. Database Setup

You'll need to add the following tables to your Supabase database:

```sql
-- Add columns to users table
ALTER TABLE users ADD COLUMN stripe_customer_id TEXT;
ALTER TABLE users ADD COLUMN subscription_status TEXT;
ALTER TABLE users ADD COLUMN subscription_id TEXT;

-- Create subscriptions table
CREATE TABLE subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  stripe_subscription_id TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL,
  current_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create usage table
CREATE TABLE usage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  month TEXT NOT NULL, -- YYYY-MM format
  review_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, month)
);

-- Create indexes
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_usage_user_month ON usage(user_id, month);
```

### 4. Install Dependencies

```bash
npm install
```

### 5. Run the Application

```bash
npm run dev
```

## How It Works

1. **Free Tier**: Users can generate up to 25 reviews per month
2. **Usage Tracking**: Each review generation increments the usage counter
3. **Payment Integration**: When users hit the limit, they're prompted to upgrade
4. **Subscription Management**: Users can manage their subscriptions through Stripe's customer portal
5. **Webhook Processing**: Stripe webhooks update subscription status in real-time

## API Endpoints

- `POST /api/generate-review` - Generate AI review (with usage tracking)
- `POST /api/stripe` - Create checkout session
- `GET /api/stripe` - Create customer portal session
- `POST /api/stripe/webhook` - Handle Stripe webhooks
- `GET /api/user` - Get user subscription status
- `GET /api/usage` - Get current month usage

## Pages

- `/dashboard` - Main dashboard with usage overview
- `/billing` - Billing management page
- `/review/[business]` - Customer review page (shows limit warnings)

## Key Features

- **Usage Limits**: Automatic tracking and enforcement of free tier limits
- **Payment Processing**: Secure Stripe integration for subscriptions
- **Real-time Updates**: Webhook-based subscription status updates
- **User Experience**: Clear messaging about limits and upgrade prompts
- **Responsive Design**: Works on all devices

## Testing

### Local Webhook Testing with Stripe CLI

To test webhooks locally, you need to use the Stripe CLI to forward webhook events to your local server:

1. **Install Stripe CLI** (if not already installed):
   ```bash
   # macOS (using Homebrew)
   brew install stripe/stripe-cli/stripe
   
   # Or download from https://stripe.com/docs/stripe-cli
   ```

2. **Login to Stripe CLI**:
   ```bash
   stripe login
   ```

3. **Forward webhooks to local server** (run this in a separate terminal):
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```
   
   This will output a webhook signing secret that starts with `whsec_...`. Copy this value.

4. **Update your `.env.local`**:
   ```bash
   STRIPE_WEBHOOK_SECRET=whsec_... # Use the secret from step 3
   ```

5. **Start your dev server** (in another terminal):
   ```bash
   npm run dev
   ```

6. **Test webhook events**:
   - Trigger events from Stripe CLI:
     ```bash
     stripe trigger checkout.session.completed
     stripe trigger customer.subscription.created
     stripe trigger customer.subscription.updated
     stripe trigger customer.subscription.deleted
     ```
   - Or complete a test checkout flow in your app (using test card `4242 4242 4242 4242`)
   - The webhooks will be automatically forwarded to your local server

### Testing Payment Flow

1. Use Stripe test mode
2. Use test card numbers (4242 4242 4242 4242)
3. Complete checkout flow - webhooks should be automatically forwarded
4. Verify subscription status updates in the database

## Deployment

1. Set up production Stripe account
2. Update environment variables for production
3. Configure webhook endpoints
4. Deploy to your hosting platform (Vercel, Netlify, etc.)

## Support

For issues or questions, please check the documentation or create an issue in the repository.

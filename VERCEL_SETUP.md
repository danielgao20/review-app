# Vercel Production Setup Guide

## Step 1: Get Your Vercel Domain

1. Go to your Vercel project dashboard
2. Find your production domain (e.g., `your-app.vercel.app` or your custom domain)
3. Note this URL - you'll need it for the webhook endpoint

## Step 2: Set Up Stripe Webhook in Stripe Dashboard

1. Go to Stripe Dashboard → Developers → Webhooks
2. Click "Add endpoint" or "Create destination"
3. **Endpoint URL**: `https://your-vercel-domain.vercel.app/api/stripe/webhook`
   - Replace `your-vercel-domain.vercel.app` with your actual Vercel domain
4. Select these 4 events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Click "Create destination" or "Add endpoint"
6. **IMPORTANT**: Copy the "Signing secret" (starts with `whsec_...`) - you'll need this for Vercel

## Step 3: Configure Environment Variables in Vercel

Go to your Vercel project → Settings → Environment Variables

### Required Environment Variables:

#### Stripe Configuration (Production Keys)
```
STRIPE_SECRET_KEY=sk_live_...
```
- Get from: Stripe Dashboard → Developers → API keys
- Use the **Live** secret key (starts with `sk_live_`)

```
STRIPE_WEBHOOK_SECRET=whsec_...
```
- Get from: Stripe Dashboard → Developers → Webhooks → Your webhook endpoint
- This is the signing secret from Step 2

```
NEXT_PUBLIC_STRIPE_PRICE_ID=price_...
```
- Get from: Stripe Dashboard → Products → Your product → Pricing
- Use the **Live** price ID (starts with `price_`)

#### NextAuth Configuration
```
NEXTAUTH_URL=https://your-vercel-domain.vercel.app
```
- Replace with your actual Vercel domain (no trailing slash)

```
NEXTAUTH_SECRET=...
```
- Generate a random secret (can use: `openssl rand -base64 32`)
- Or use an existing one if you have it

#### Database (Supabase)
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```
- Get from: Supabase Dashboard → Project Settings → API

#### Other Required Variables
```
ANTHROPIC_API_KEY=sk-ant-...
```
- Your Anthropic API key for AI review generation

#### Optional (if using email)
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=your-email@gmail.com
EMAIL_TO=your-email@gmail.com
```

## Step 4: Deploy to Vercel

1. Make sure all environment variables are set
2. Push your code to GitHub (if using Git integration)
3. Vercel will automatically deploy, or trigger a manual deployment
4. Wait for deployment to complete

## Step 5: Test the Webhook

1. After deployment, go to Stripe Dashboard → Developers → Webhooks
2. Click on your webhook endpoint
3. Click "Send test webhook" or trigger a test event
4. Check Vercel logs (Deployments → Your deployment → Functions → View Function Logs)
5. Verify the webhook is received and processed successfully

## Step 6: Verify Everything Works

1. Visit your Vercel app URL
2. Test the signup/login flow
3. Test creating a subscription (use Stripe test mode first, then switch to live)
4. Check that webhooks are being received in Stripe Dashboard → Events
5. Verify subscription status updates in your app

## Troubleshooting

### Webhook not receiving events?
- Check that `STRIPE_WEBHOOK_SECRET` matches the signing secret in Stripe
- Verify the endpoint URL in Stripe matches your Vercel domain
- Check Vercel function logs for errors
- Make sure all 4 events are selected in Stripe webhook configuration

### Environment variables not working?
- Make sure variables are set for "Production" environment
- Redeploy after adding new environment variables
- Check variable names match exactly (case-sensitive)

### Subscription not updating?
- Check Stripe Dashboard → Events for webhook delivery status
- Verify webhook secret is correct
- Check Vercel function logs for processing errors
- Ensure database tables exist and have correct schema

## Quick Checklist

- [ ] Vercel domain identified
- [ ] Stripe webhook endpoint created with correct URL
- [ ] All 4 webhook events selected
- [ ] Webhook signing secret copied
- [ ] All environment variables set in Vercel
- [ ] `NEXTAUTH_URL` set to production domain
- [ ] Stripe keys are **Live** keys (not test)
- [ ] Deployed to Vercel
- [ ] Webhook tested and receiving events
- [ ] Subscription flow tested end-to-end


# Production Deployment Checklist

## Pre-Deployment Requirements

### 1. Environment Variables
Ensure all required environment variables are set in your production environment:

```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_live_...          # Production Stripe Secret Key
STRIPE_WEBHOOK_SECRET=whsec_...        # Production Webhook Secret
NEXT_PUBLIC_STRIPE_PRICE_ID=price_...  # Production Price ID

# NextAuth
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=...

# Database
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
SUPABASE_ANON_KEY=...
```

### 2. Stripe Configuration
- [ ] Create production product and price in Stripe Dashboard
- [ ] Configure Stripe Customer Portal in test mode, then enable in production
- [ ] Set up production webhook endpoint: `https://yourdomain.com/api/stripe/webhook`
- [ ] Configure webhook events:
  - `checkout.session.completed`
  - `customer.subscription.created`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
- [ ] Verify webhook signing secret is set in environment variables

### 3. Database Schema
Ensure all tables exist with correct schema:
- [ ] `users` table with columns: `stripe_customer_id`, `subscription_status`, `subscription_id`
- [ ] `subscriptions` table
- [ ] `usage` table

### 4. Testing Checklist

#### Subscription Flow
- [ ] Test free tier sign-up (25 reviews)
- [ ] Test upgrade to Pro plan ($10/month)
- [ ] Test checkout flow completion
- [ ] Verify subscription status updates correctly after checkout
- [ ] Test "Manage Subscription" button opens Stripe Customer Portal
- [ ] Test subscription cancellation
- [ ] Verify cancellation shows "Subscription Canceling" with expiration date
- [ ] Verify subscription reverts to free tier after period ends

#### Usage Tracking
- [ ] Verify usage counts correctly (lifetime, not monthly)
- [ ] Verify free tier limit (25 reviews) is enforced
- [ ] Verify Pro plan shows unlimited generations
- [ ] Test review generation with active subscription
- [ ] Test review generation limit reached for free tier

#### Webhooks
- [ ] Verify webhooks are received in production
- [ ] Test webhook signature verification
- [ ] Verify database updates on subscription events
- [ ] Test handling of duplicate subscriptions

### 5. Security
- [ ] Verify `STRIPE_WEBHOOK_SECRET` is set and correct
- [ ] Ensure `SUPABASE_SERVICE_ROLE_KEY` is kept secure (admin access)
- [ ] Verify Row Level Security (RLS) policies are correct
- [ ] Verify authentication is required for all API endpoints

### 6. Error Handling
- [ ] Test error handling for missing Stripe configuration
- [ ] Test error handling for webhook failures
- [ ] Test error handling for subscription not found
- [ ] Verify error messages are user-friendly

### 7. Monitoring & Troubleshooting
- [ ] Set up monitoring for webhook events
- [ ] Document how to troubleshoot subscription sync issues (check Stripe dashboard)

## Post-Deployment Monitoring

### 1. Monitor Webhook Events
- Check Stripe Dashboard → Events for failed webhook deliveries
- Monitor application logs for webhook processing errors

### 2. Monitor Subscription Status
- Verify subscription status updates correctly in database
- Monitor for any discrepancies between Stripe and database

### 3. Monitor Usage
- Verify usage counts are accurate
- Monitor for any issues with usage tracking

## Rollback Plan

If issues occur:
1. Disable new subscriptions by removing Price ID from environment
2. The `/api/user` route automatically syncs from Stripe on each request
3. Contact Stripe support if webhook issues persist

## Notes

- The system uses **lifetime** usage limits (25 reviews), not monthly
- Subscriptions remain active until period end even after cancellation
- The system handles both `cancel_at_period_end` and `cancel_at` cancellation methods
- Subscription status is automatically synced from Stripe on each request (no manual sync needed)


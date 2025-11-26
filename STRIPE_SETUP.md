
# Stripe Payment Integration Setup Guide

This guide will help you set up Stripe payment processing for the Quick Fix app's premium subscription feature.

## Overview

The app uses Stripe to process payments for the yearly premium subscription (500 EGP/year). The integration includes:

- **Frontend**: React Native app with Stripe React Native SDK
- **Backend**: Supabase Edge Functions for secure payment processing
- **Database**: Supabase PostgreSQL for subscription management

## Prerequisites

1. A Stripe account (sign up at https://stripe.com)
2. Access to your Supabase project
3. The Quick Fix mobile app

## Step 1: Get Your Stripe API Keys

### 1.1 Access Stripe Dashboard
1. Go to https://dashboard.stripe.com/
2. Log in to your Stripe account
3. Navigate to **Developers** > **API keys**

### 1.2 Copy Your Keys
You'll need two types of keys:

**Publishable Key** (for the mobile app):
- Test mode: `pk_test_...`
- Live mode: `pk_live_...`

**Secret Key** (for Supabase Edge Functions):
- Test mode: `sk_test_...`
- Live mode: `sk_live_...`

⚠️ **Important**: Never commit secret keys to your code repository!

## Step 2: Configure the Mobile App

### 2.1 Update Stripe Configuration
Open `app/config/stripe.ts` and replace the placeholder keys:

```typescript
// Replace with your actual test key
export const STRIPE_PUBLISHABLE_KEY_TEST = "pk_test_YOUR_TEST_KEY_HERE";

// Replace with your actual live key (when ready for production)
export const STRIPE_PUBLISHABLE_KEY_LIVE = "pk_live_YOUR_LIVE_KEY_HERE";
```

### 2.2 Test the Integration
The app is configured to use test mode keys during development. You can test payments using Stripe's test card numbers:

- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- Use any future expiration date and any 3-digit CVC

## Step 3: Configure Supabase Edge Functions

### 3.1 Set Environment Variables
In your Supabase project dashboard:

1. Go to **Project Settings** > **Edge Functions**
2. Add the following secrets:

```bash
STRIPE_SECRET_KEY=sk_test_YOUR_SECRET_KEY_HERE
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET_HERE
```

### 3.2 Create Stripe Products and Prices

1. Go to Stripe Dashboard > **Products**
2. Click **Add product**
3. Create a product named "Quick Fix Premium"
4. Add a price:
   - Amount: 500 EGP
   - Billing period: Yearly
   - Copy the Price ID (starts with `price_`)

### 3.3 Update Database with Price ID

Run this SQL in your Supabase SQL Editor:

```sql
UPDATE subscription_plans
SET stripe_price_id = 'price_YOUR_ACTUAL_PRICE_ID_HERE'
WHERE interval = 'year';
```

## Step 4: Set Up Stripe Webhooks

Webhooks allow Stripe to notify your app about payment events.

### 4.1 Get Your Webhook URL
Your webhook URL is:
```
https://yfvlxsqjvsbzbqsczuqt.supabase.co/functions/v1/stripe-webhook
```

### 4.2 Configure Webhook in Stripe
1. Go to Stripe Dashboard > **Developers** > **Webhooks**
2. Click **Add endpoint**
3. Enter your webhook URL
4. Select events to listen to:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Click **Add endpoint**
6. Copy the **Signing secret** (starts with `whsec_`)

### 4.3 Update Supabase Secret
Add the webhook secret to your Supabase Edge Functions:

```bash
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET_HERE
```

## Step 5: Test the Integration

### 5.1 Test Payment Flow
1. Open the Quick Fix app
2. Navigate to the Premium tab
3. Select the Yearly Plan (500 EGP/year)
4. Enter test card details:
   - Card: `4242 4242 4242 4242`
   - Expiry: Any future date
   - CVC: Any 3 digits
5. Click "Subscribe to Premium"
6. Verify the payment succeeds

### 5.2 Verify in Stripe Dashboard
1. Go to Stripe Dashboard > **Payments**
2. You should see the test payment
3. Go to **Customers** to see the created customer
4. Go to **Subscriptions** to see the active subscription

### 5.3 Check Supabase Database
Run this query in Supabase SQL Editor:

```sql
SELECT * FROM user_subscriptions;
SELECT * FROM payment_history;
```

You should see the subscription and payment records.

## Step 6: Go Live (Production)

When you're ready to accept real payments:

### 6.1 Activate Your Stripe Account
1. Complete Stripe's verification process
2. Provide business information
3. Set up bank account for payouts

### 6.2 Create Live Products
1. Switch to Live mode in Stripe Dashboard
2. Create the same products and prices as in test mode
3. Copy the live Price IDs

### 6.3 Update Configuration
1. Update `app/config/stripe.ts` with live publishable key
2. Update Supabase secrets with live secret key
3. Update database with live price IDs
4. Create new webhook endpoint for live mode

### 6.4 Test in Production
1. Build and deploy your app
2. Test with a real card (small amount)
3. Verify everything works correctly
4. Refund the test payment

## Troubleshooting

### Payment Fails
- Check that Stripe keys are correct
- Verify the price ID matches in database
- Check Supabase Edge Function logs
- Ensure webhook is configured correctly

### Subscription Not Created
- Check user is logged in
- Verify Edge Function has correct permissions
- Check database RLS policies
- Review Edge Function logs

### Webhook Not Working
- Verify webhook URL is correct
- Check webhook signing secret
- Ensure events are selected
- Review webhook logs in Stripe Dashboard

## Security Best Practices

1. **Never expose secret keys** in client-side code
2. **Use environment variables** for all sensitive data
3. **Enable webhook signature verification** in production
4. **Implement proper error handling** for payment failures
5. **Use HTTPS** for all API communications
6. **Regularly rotate API keys** for security
7. **Monitor Stripe Dashboard** for suspicious activity
8. **Set up fraud detection** rules in Stripe

## Support

For issues with:
- **Stripe**: https://support.stripe.com/
- **Supabase**: https://supabase.com/docs/guides/functions
- **App Integration**: Check the code comments and console logs

## Additional Resources

- [Stripe React Native SDK Docs](https://stripe.com/docs/payments/accept-a-payment?platform=react-native)
- [Stripe Testing Guide](https://stripe.com/docs/testing)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Stripe Webhooks Guide](https://stripe.com/docs/webhooks)

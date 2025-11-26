
# Stripe Checkout Flow - Implementation Guide

## Overview

This guide explains how to use the Stripe Payment Intents checkout flow implemented in your Quick Fix app. The implementation includes:

- **Checkout Screen**: A complete checkout interface with product selection and card payment
- **Payment History**: View all past transactions
- **Supabase Integration**: Payment records stored in your database
- **Test Mode**: Fully functional test environment using Stripe test cards

## Features

### ✅ What's Implemented

1. **Checkout Flow** (`app/(tabs)/checkout.native.tsx`)
   - Product/service selection
   - Stripe CardField for secure card input
   - Payment Intent creation via Supabase Edge Function
   - Payment confirmation with Stripe SDK
   - Success/error handling with user feedback
   - Payment history recording

2. **Payment History** (`app/(tabs)/payment-history.native.tsx`)
   - List all past payments
   - Payment status indicators (succeeded, processing, failed, etc.)
   - Pull-to-refresh functionality
   - Detailed payment information

3. **Backend** (Supabase Edge Function: `create-payment-intent`)
   - Creates Stripe Payment Intents
   - Supports both subscription and one-time payments
   - Secure server-side payment processing
   - Metadata tracking for orders

4. **Database** (Supabase Tables)
   - `payment_history`: Stores all payment records
   - Row Level Security (RLS) enabled
   - User-specific payment tracking

## Testing the Checkout Flow

### Test Cards

Use these Stripe test cards to simulate different payment scenarios:

| Card Number | Scenario |
|------------|----------|
| 4242 4242 4242 4242 | Successful payment |
| 4000 0000 0000 9995 | Declined payment |
| 4000 0025 0000 3155 | Requires authentication (3D Secure) |

**For all test cards:**
- Use any future expiration date (e.g., 12/25)
- Use any 3-digit CVC
- Use any postal code

### Step-by-Step Testing

1. **Navigate to Checkout**
   - Open the app and tap the "Checkout" tab
   - You'll see a list of available items/services

2. **Select an Item**
   - Tap on any item to select it
   - The selected item will be highlighted with a checkmark

3. **Enter Payment Details**
   - In the "Payment Details" section, enter test card: `4242 4242 4242 4242`
   - Enter any future date (e.g., 12/25)
   - Enter any 3-digit CVC (e.g., 123)
   - The card field will show a checkmark when complete

4. **Review Order**
   - Check the "Order Summary" section
   - Verify the item and total amount

5. **Complete Payment**
   - Tap the "Pay" button
   - Wait for payment processing (usually 2-3 seconds)
   - You'll see a success message with the payment amount

6. **View Receipt**
   - Tap "View Receipt" in the success dialog
   - Or navigate to the "Payments" tab
   - Your payment will appear in the payment history

## Customization

### Adding Your Own Products

Edit `app/(tabs)/checkout.native.tsx` and modify the `checkoutItems` array:

```typescript
const checkoutItems: CheckoutItem[] = [
  {
    id: 'your_product_id',
    name: 'Your Product Name',
    description: 'Product description',
    price: 9900, // Amount in cents ($99.00)
    currency: 'usd',
  },
  // Add more items...
];
```

### Changing Currency

To change from USD to another currency:

1. Update the `currency` field in your checkout items
2. Update the `formatPrice` function to display the correct currency symbol
3. Ensure your Stripe account supports the currency

### Customizing the UI

All styles are defined in the StyleSheet at the bottom of each component file. You can customize:

- Colors (using `colors` from `@/styles/commonStyles`)
- Spacing and padding
- Font sizes and weights
- Border radius and shadows

## Architecture

### Flow Diagram

```
User selects item
    ↓
User enters card details
    ↓
User taps "Pay"
    ↓
App calls Supabase Edge Function
    ↓
Edge Function creates Payment Intent with Stripe
    ↓
Edge Function returns client secret
    ↓
App confirms payment with Stripe SDK
    ↓
Stripe processes payment
    ↓
App saves payment to database
    ↓
User sees success message
```

### Security

- **Client Secret**: Payment Intents use a client secret that's only valid for one payment
- **Server-Side**: Payment Intent creation happens on the server (Edge Function)
- **RLS**: Database records are protected with Row Level Security
- **Encryption**: Card details never touch your servers (handled by Stripe)

## Database Schema

### payment_history Table

```sql
CREATE TABLE payment_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  subscription_id UUID REFERENCES user_subscriptions(id),
  stripe_payment_intent_id TEXT UNIQUE,
  amount INTEGER NOT NULL,
  currency TEXT NOT NULL,
  status TEXT NOT NULL,
  payment_method TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE payment_history ENABLE ROW LEVEL SECURITY;

-- Users can view their own payments
CREATE POLICY "Users can view their own payments"
  ON payment_history FOR SELECT
  USING (user_id = auth.uid());
```

## Going Live

### Before Production

1. **Get Live Stripe Keys**
   - Go to https://dashboard.stripe.com/
   - Switch from Test mode to Live mode
   - Copy your Live Publishable Key and Secret Key

2. **Update Configuration**
   - Update `STRIPE_PUBLISHABLE_KEY_LIVE` in `app/config/stripe.ts`
   - Update `STRIPE_SECRET_KEY` environment variable in Supabase

3. **Test Thoroughly**
   - Test all payment scenarios
   - Verify webhook handling
   - Check payment history recording
   - Test error cases

4. **Update UI**
   - Remove "Test Mode" indicators
   - Remove test card information
   - Update any test-specific messaging

### Stripe Account Setup

1. **Complete Stripe Onboarding**
   - Verify your business information
   - Add bank account for payouts
   - Complete identity verification

2. **Configure Webhooks** (if needed)
   - Set up webhook endpoint in Stripe Dashboard
   - Point to your `stripe-webhook` Edge Function
   - Select relevant events (payment_intent.succeeded, etc.)

3. **Set Up Payout Schedule**
   - Configure automatic payouts
   - Set payout frequency (daily, weekly, monthly)

## Troubleshooting

### Common Issues

**Payment fails with "Invalid API Key"**
- Check that `STRIPE_SECRET_KEY` is set in Supabase Edge Function secrets
- Verify you're using the correct key for test/live mode

**"Authentication Required" message**
- User must be logged in to make payments
- Implement authentication flow if not already done

**Payment succeeds but doesn't appear in history**
- Check Supabase logs for database errors
- Verify RLS policies allow inserts
- Check that user_id is being passed correctly

**Card field not working**
- Ensure `@stripe/stripe-react-native` is installed
- Check that StripeProvider is wrapping your app
- Verify publishable key is correct

### Debugging

Enable detailed logging:

```typescript
// In checkout.native.tsx
console.log('Payment Intent Response:', result);
console.log('Payment Confirmation:', paymentIntent);
```

Check Supabase Edge Function logs:
```bash
# In Supabase Dashboard
Functions → create-payment-intent → Logs
```

## Support

For issues with:
- **Stripe Integration**: https://stripe.com/docs/payments/payment-intents
- **Supabase**: https://supabase.com/docs
- **React Native Stripe**: https://stripe.dev/stripe-react-native/

## Next Steps

Consider implementing:
- [ ] Saved payment methods
- [ ] Subscription management
- [ ] Refunds and cancellations
- [ ] Invoice generation
- [ ] Email receipts
- [ ] Multiple currencies
- [ ] Discount codes
- [ ] Tax calculation

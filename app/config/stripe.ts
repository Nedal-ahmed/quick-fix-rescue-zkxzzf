
/**
 * Stripe Configuration
 * 
 * IMPORTANT: Replace these keys with your actual Stripe keys
 * 
 * To get your Stripe keys:
 * 1. Go to https://dashboard.stripe.com/
 * 2. Navigate to Developers > API keys
 * 3. Copy your Publishable key (starts with pk_test_ for test mode or pk_live_ for production)
 * 
 * For testing, use the test mode key.
 * For production, use the live mode key and ensure you've completed Stripe account verification.
 */

// Test mode publishable key - Replace with your actual test key
export const STRIPE_PUBLISHABLE_KEY_TEST = "pk_test_51QVvjxP1234567890abcdefghijklmnopqrstuvwxyz1234567890abcdefghijklmnopqrstuvwxyz1234567890abcdefghijklmnopqr";

// Live mode publishable key - Replace with your actual live key when ready for production
export const STRIPE_PUBLISHABLE_KEY_LIVE = "pk_live_YOUR_LIVE_KEY_HERE";

// Use test key by default, switch to live key for production
export const STRIPE_PUBLISHABLE_KEY = __DEV__ 
  ? STRIPE_PUBLISHABLE_KEY_TEST 
  : STRIPE_PUBLISHABLE_KEY_LIVE;

// Merchant identifier for Apple Pay (iOS only)
export const STRIPE_MERCHANT_IDENTIFIER = "merchant.com.anonymous.Natively";

// URL scheme for return URLs
export const STRIPE_URL_SCHEME = "natively";

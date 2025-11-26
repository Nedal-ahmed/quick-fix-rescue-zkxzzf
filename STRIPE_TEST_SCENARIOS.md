
# Stripe Test Scenarios

## Test Card Numbers

### Successful Payments

| Card Number | Description |
|------------|-------------|
| 4242 4242 4242 4242 | Visa - Always succeeds |
| 5555 5555 5555 4444 | Mastercard - Always succeeds |
| 3782 822463 10005 | American Express - Always succeeds |

### Failed Payments

| Card Number | Error Type |
|------------|-----------|
| 4000 0000 0000 9995 | Card declined (generic) |
| 4000 0000 0000 9987 | Card declined (insufficient funds) |
| 4000 0000 0000 9979 | Card declined (stolen card) |
| 4000 0000 0000 0069 | Card declined (expired card) |

### Special Cases

| Card Number | Behavior |
|------------|----------|
| 4000 0025 0000 3155 | Requires 3D Secure authentication |
| 4000 0000 0000 3220 | 3D Secure authentication required (but will fail) |
| 4000 0000 0000 0341 | Attaching this card requires authentication |

## Test Scenarios

### Scenario 1: Successful One-Time Payment

**Steps:**
1. Open the Checkout tab
2. Select "Emergency Rescue Kit" ($99.00)
3. Enter card: 4242 4242 4242 4242
4. Enter expiry: 12/25
5. Enter CVC: 123
6. Tap "Pay $99.00 USD"
7. Wait for success message
8. Navigate to Payment History
9. Verify payment appears with "succeeded" status

**Expected Result:**
- Payment processes successfully
- Success alert shows with payment amount
- Payment appears in history with green checkmark
- Payment Intent ID is recorded in database

### Scenario 2: Declined Payment

**Steps:**
1. Open the Checkout tab
2. Select any item
3. Enter card: 4000 0000 0000 9995
4. Enter expiry: 12/25
5. Enter CVC: 123
6. Tap "Pay" button
7. Observe error message

**Expected Result:**
- Payment fails with "Your card was declined" error
- Error alert shows with helpful message
- No payment record is created
- User can try again with different card

### Scenario 3: 3D Secure Authentication

**Steps:**
1. Open the Checkout tab
2. Select any item
3. Enter card: 4000 0025 0000 3155
4. Enter expiry: 12/25
5. Enter CVC: 123
6. Tap "Pay" button
7. Complete 3D Secure challenge (in test mode, just tap "Complete")
8. Wait for success message

**Expected Result:**
- 3D Secure modal appears
- After completing authentication, payment succeeds
- Payment appears in history

### Scenario 4: Multiple Payments

**Steps:**
1. Complete 3 successful payments with different items
2. Navigate to Payment History
3. Pull down to refresh
4. Verify all 3 payments appear
5. Check that they're sorted by date (newest first)

**Expected Result:**
- All payments appear in history
- Each has correct amount and status
- Dates are formatted correctly
- Payment IDs are unique

### Scenario 5: Unauthenticated User

**Steps:**
1. Log out of the app (if logged in)
2. Navigate to Checkout tab
3. Select an item
4. Enter card details
5. Tap "Pay" button

**Expected Result:**
- Warning message appears: "You must be logged in to complete checkout"
- Pay button is disabled
- User is prompted to log in

### Scenario 6: Payment History When Logged Out

**Steps:**
1. Log out of the app
2. Navigate to Payment History tab

**Expected Result:**
- "Not Logged In" message appears
- No payment records are shown
- User is prompted to log in

## Testing Checklist

### Before Testing
- [ ] Stripe test keys are configured
- [ ] Supabase Edge Function is deployed
- [ ] Database tables exist with RLS policies
- [ ] User is logged in (for most tests)

### Functional Tests
- [ ] Can select different items
- [ ] Card field validates input correctly
- [ ] Pay button enables/disables appropriately
- [ ] Successful payment shows success message
- [ ] Failed payment shows error message
- [ ] Payment appears in history after success
- [ ] Can refresh payment history
- [ ] Payment details are accurate

### UI/UX Tests
- [ ] All text is readable
- [ ] Colors have good contrast
- [ ] Icons display correctly
- [ ] Loading states show during processing
- [ ] Error messages are clear and helpful
- [ ] Success messages are celebratory
- [ ] Layout works on different screen sizes

### Edge Cases
- [ ] Network error during payment
- [ ] App closed during payment processing
- [ ] Multiple rapid payment attempts
- [ ] Very large amounts
- [ ] Very small amounts (minimum $0.50)
- [ ] Special characters in metadata

## Monitoring

### What to Check in Stripe Dashboard

1. **Payments Tab**
   - All test payments appear
   - Amounts are correct
   - Metadata is attached

2. **Logs Tab**
   - API requests are successful
   - No unexpected errors
   - Response times are reasonable

3. **Events Tab**
   - payment_intent.created events
   - payment_intent.succeeded events
   - Any failed events with reasons

### What to Check in Supabase

1. **Database**
   - payment_history table has records
   - user_id is correctly set
   - stripe_payment_intent_id matches Stripe

2. **Edge Function Logs**
   - Function executes successfully
   - No timeout errors
   - Proper error handling

## Common Test Issues

### Issue: "Invalid API Key"
**Solution:** Check that STRIPE_SECRET_KEY is set in Supabase Edge Function secrets

### Issue: Card field not responding
**Solution:** Ensure StripeProvider is wrapping the app in _layout.native.tsx

### Issue: Payment succeeds but doesn't save
**Solution:** Check RLS policies on payment_history table

### Issue: "Authentication Required" even when logged in
**Solution:** Verify supabase.auth.getUser() returns a valid user

## Performance Benchmarks

Expected timings:
- Card validation: < 100ms
- Payment Intent creation: 500-1000ms
- Payment confirmation: 1000-2000ms
- Total checkout time: 2-4 seconds

If times are significantly longer:
- Check network connection
- Verify Supabase Edge Function region
- Check Stripe API status

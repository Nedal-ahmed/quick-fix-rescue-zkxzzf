
// Empty mock for @stripe/stripe-react-native on web
export default {};
export const StripeProvider = () => null;
export const CardField = () => null;
export const useStripe = () => ({
  confirmPayment: async () => ({ error: { message: 'Stripe is not available on web' } }),
  createPaymentMethod: async () => ({ error: { message: 'Stripe is not available on web' } }),
});


import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { useLanguage } from '@/contexts/LanguageContext';
import { useStripe, CardField } from '@stripe/stripe-react-native';
import { supabase } from '@/app/integrations/supabase/client';
import { router } from 'expo-router';

interface CheckoutItem {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
}

export default function CheckoutScreen() {
  const { t, isRTL } = useLanguage();
  const { confirmPayment } = useStripe();
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardComplete, setCardComplete] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<CheckoutItem | null>(null);

  // Sample checkout items - replace with your actual products
  const checkoutItems: CheckoutItem[] = [
    {
      id: 'rescue_premium_monthly',
      name: 'Premium Rescue Service - Monthly',
      description: 'Priority rescue response with 24/7 support',
      price: 4900, // $49.00 in cents
      currency: 'usd',
    },
    {
      id: 'rescue_premium_yearly',
      name: 'Premium Rescue Service - Yearly',
      description: 'Priority rescue response with 24/7 support - Save 2 months!',
      price: 49000, // $490.00 in cents
      currency: 'usd',
    },
    {
      id: 'emergency_kit',
      name: 'Emergency Rescue Kit',
      description: 'Complete emergency kit with GPS tracker',
      price: 9900, // $99.00 in cents
      currency: 'usd',
    },
  ];

  useEffect(() => {
    checkAuthStatus();
    // Pre-select first item
    if (checkoutItems.length > 0) {
      setSelectedItem(checkoutItems[0]);
    }
  }, []);

  const checkAuthStatus = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setIsLoggedIn(!!user);
    setUserId(user?.id || null);
  };

  const handleCheckout = async () => {
    if (!isLoggedIn) {
      Alert.alert(
        'Authentication Required',
        'You must be logged in to complete checkout. Please create an account or sign in first.',
        [{ text: 'OK' }]
      );
      return;
    }

    if (!selectedItem) {
      Alert.alert('Error', 'Please select an item to purchase', [{ text: 'OK' }]);
      return;
    }

    if (!cardComplete) {
      Alert.alert('Error', 'Please enter valid card details', [{ text: 'OK' }]);
      return;
    }

    try {
      setIsProcessing(true);
      console.log('Starting checkout process for item:', selectedItem.id);

      // Call edge function to create payment intent
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch(
        'https://yfvlxsqjvsbzbqsczuqt.supabase.co/functions/v1/create-payment-intent',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify({
            amount: selectedItem.price,
            currency: selectedItem.currency,
            description: selectedItem.description,
            metadata: {
              item_id: selectedItem.id,
              item_name: selectedItem.name,
              user_id: userId,
            },
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create payment intent');
      }

      const { clientSecret, paymentIntentId } = result;

      if (!clientSecret) {
        throw new Error('Failed to get payment client secret');
      }

      console.log('Got client secret, confirming payment...');

      // Confirm payment with Stripe
      const { error, paymentIntent } = await confirmPayment(clientSecret, {
        paymentMethodType: 'Card',
      });

      if (error) {
        console.error('Payment confirmation error:', error);
        throw new Error(error.message);
      }

      console.log('Payment confirmed:', paymentIntent?.status);

      // Save payment to history
      if (paymentIntent?.status === 'succeeded') {
        await savePaymentHistory(paymentIntentId, selectedItem);
      }

      Alert.alert(
        'Payment Successful! 🎉',
        `Your payment of $${(selectedItem.price / 100).toFixed(2)} has been processed successfully. Thank you for your purchase!`,
        [
          {
            text: 'View Receipt',
            onPress: () => router.push('/(tabs)/payment-history'),
          },
          {
            text: 'OK',
            style: 'cancel',
          },
        ]
      );
    } catch (error: any) {
      console.error('Checkout error:', error);
      Alert.alert(
        'Payment Failed',
        error.message || 'Failed to process payment. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const savePaymentHistory = async (paymentIntentId: string, item: CheckoutItem) => {
    try {
      const { error } = await supabase.from('payment_history').insert({
        user_id: userId,
        stripe_payment_intent_id: paymentIntentId,
        amount: item.price,
        currency: item.currency,
        status: 'succeeded',
        payment_method: 'card',
      });

      if (error) {
        console.error('Error saving payment history:', error);
      }
    } catch (error) {
      console.error('Error saving payment history:', error);
    }
  };

  const formatPrice = (price: number, currency: string) => {
    const amount = price / 100;
    return `$${amount.toFixed(2)} ${currency.toUpperCase()}`;
  };

  return (
    <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
      <View style={styles.header}>
        <IconSymbol
          ios_icon_name="cart.fill"
          android_material_icon_name="shopping-cart"
          size={60}
          color={colors.primary}
        />
        <Text style={[styles.title, isRTL && styles.rtlText]}>Checkout</Text>
        <Text style={[styles.subtitle, isRTL && styles.rtlText]}>
          Complete your purchase securely with Stripe
        </Text>
      </View>

      {!isLoggedIn && (
        <View style={styles.warningCard}>
          <IconSymbol
            ios_icon_name="exclamationmark.triangle.fill"
            android_material_icon_name="warning"
            size={24}
            color={colors.accent}
          />
          <Text style={[styles.warningText, isRTL && styles.rtlText]}>
            You must be logged in to complete checkout
          </Text>
        </View>
      )}

      <View style={styles.card}>
        <Text style={[styles.cardTitle, isRTL && styles.rtlText]}>Select Item</Text>
        {checkoutItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.itemCard,
              selectedItem?.id === item.id && styles.selectedItemCard,
            ]}
            onPress={() => setSelectedItem(item)}
          >
            <View style={styles.itemHeader}>
              <View style={styles.itemInfo}>
                <Text style={[styles.itemName, isRTL && styles.rtlText]}>
                  {item.name}
                </Text>
                <Text style={[styles.itemDescription, isRTL && styles.rtlText]}>
                  {item.description}
                </Text>
              </View>
              {selectedItem?.id === item.id && (
                <IconSymbol
                  ios_icon_name="checkmark.circle.fill"
                  android_material_icon_name="check-circle"
                  size={24}
                  color={colors.primary}
                />
              )}
            </View>
            <Text style={[styles.itemPrice, isRTL && styles.rtlText]}>
              {formatPrice(item.price, item.currency)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {selectedItem && (
        <>
          <View style={styles.card}>
            <Text style={[styles.cardTitle, isRTL && styles.rtlText]}>Payment Details</Text>
            <Text style={[styles.cardSubtitle, isRTL && styles.rtlText]}>
              Enter your card information (Test Mode)
            </Text>
            <CardField
              postalCodeEnabled={true}
              placeholders={{
                number: '4242 4242 4242 4242',
              }}
              cardStyle={{
                backgroundColor: colors.background,
                textColor: colors.text,
                borderRadius: 8,
              }}
              style={styles.cardField}
              onCardChange={(cardDetails) => {
                setCardComplete(cardDetails.complete);
              }}
            />
            <View style={styles.testCardContainer}>
              <IconSymbol
                ios_icon_name="info.circle.fill"
                android_material_icon_name="info"
                size={16}
                color={colors.primary}
              />
              <Text style={[styles.testCardInfo, isRTL && styles.rtlText]}>
                Test card: 4242 4242 4242 4242 | Any future date | Any CVC
              </Text>
            </View>
          </View>

          <View style={styles.card}>
            <Text style={[styles.cardTitle, isRTL && styles.rtlText]}>Order Summary</Text>
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, isRTL && styles.rtlText]}>Item:</Text>
              <Text style={[styles.summaryValue, isRTL && styles.rtlText]}>
                {selectedItem.name}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, isRTL && styles.rtlText]}>Subtotal:</Text>
              <Text style={[styles.summaryValue, isRTL && styles.rtlText]}>
                {formatPrice(selectedItem.price, selectedItem.currency)}
              </Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.summaryRow}>
              <Text style={[styles.totalLabel, isRTL && styles.rtlText]}>Total:</Text>
              <Text style={[styles.totalValue, isRTL && styles.rtlText]}>
                {formatPrice(selectedItem.price, selectedItem.currency)}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.checkoutButton,
              (isProcessing || !cardComplete || !isLoggedIn) && styles.disabledButton,
            ]}
            onPress={handleCheckout}
            disabled={isProcessing || !cardComplete || !isLoggedIn}
          >
            {isProcessing ? (
              <ActivityIndicator color={colors.card} />
            ) : (
              <>
                <IconSymbol
                  ios_icon_name="lock.fill"
                  android_material_icon_name="lock"
                  size={24}
                  color={colors.card}
                />
                <Text style={styles.checkoutButtonText}>
                  Pay {formatPrice(selectedItem.price, selectedItem.currency)}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </>
      )}

      <View style={styles.securityBadge}>
        <IconSymbol
          ios_icon_name="checkmark.shield.fill"
          android_material_icon_name="verified-user"
          size={20}
          color={colors.success}
        />
        <Text style={[styles.securityText, isRTL && styles.rtlText]}>
          Secured by Stripe - Your payment information is encrypted
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingTop: Platform.OS === 'android' ? 48 : 20,
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
    marginTop: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },
  warningCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3CD',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  warningText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#856404',
    marginLeft: 12,
    flex: 1,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 16,
  },
  cardSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  itemCard: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedItemCard: {
    borderColor: colors.primary,
    backgroundColor: colors.highlight,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  itemInfo: {
    flex: 1,
    marginRight: 12,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  itemDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  itemPrice: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.primary,
  },
  cardField: {
    width: '100%',
    height: 50,
    marginVertical: 12,
  },
  testCardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  testCardInfo: {
    fontSize: 12,
    color: colors.textSecondary,
    fontStyle: 'italic',
    marginLeft: 6,
    flex: 1,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 12,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.primary,
  },
  checkoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 4,
  },
  disabledButton: {
    opacity: 0.5,
  },
  checkoutButtonText: {
    color: colors.card,
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 8,
  },
  securityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
  },
  securityText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginLeft: 8,
    textAlign: 'center',
  },
  rtlText: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
});

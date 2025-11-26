
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Alert,
  Image,
  ActivityIndicator,
} from 'react-native';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSubscription } from '@/hooks/useSubscription';
import { useStripe, CardField } from '@stripe/stripe-react-native';
import { supabase } from '@/app/integrations/supabase/client';

type CheckoutMode = 'subscription' | 'one-time';

interface CheckoutItem {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
}

export default function PremiumScreen() {
  const { t, isRTL } = useLanguage();
  const { subscription, plans, loading, isPremium, createSubscription, cancelSubscription, refreshSubscription } = useSubscription();
  const { confirmPayment } = useStripe();
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardComplete, setCardComplete] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [checkoutMode, setCheckoutMode] = useState<CheckoutMode>('subscription');
  const [selectedItem, setSelectedItem] = useState<CheckoutItem | null>(null);

  // One-time purchase items
  const checkoutItems: CheckoutItem[] = [
    {
      id: 'emergency_kit',
      name: 'Emergency Rescue Kit',
      description: 'Complete emergency kit with GPS tracker',
      price: 9900, // $99.00 in cents
      currency: 'usd',
    },
    {
      id: 'premium_support_package',
      name: 'Premium Support Package',
      description: 'One-time premium support for 30 days',
      price: 2900, // $29.00 in cents
      currency: 'usd',
    },
  ];

  useEffect(() => {
    checkAuthStatus();
    // Pre-select first item for one-time purchases
    if (checkoutItems.length > 0) {
      setSelectedItem(checkoutItems[0]);
    }
  }, []);

  const checkAuthStatus = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setIsLoggedIn(!!user);
    setUserId(user?.id || null);
  };

  const handleSubscribe = async () => {
    if (!isLoggedIn) {
      Alert.alert(
        t('error'),
        'You must be logged in to subscribe. Please create an account or sign in first.',
        [{ text: t('ok') }]
      );
      return;
    }

    if (!selectedPlanId) {
      Alert.alert(t('error'), 'Please select a plan', [{ text: t('ok') }]);
      return;
    }

    if (!cardComplete) {
      Alert.alert(t('error'), 'Please enter valid card details', [{ text: t('ok') }]);
      return;
    }

    try {
      setIsProcessing(true);
      console.log('Starting subscription process for plan:', selectedPlanId);

      // Create subscription and get client secret
      const { clientSecret, subscriptionId } = await createSubscription(selectedPlanId);

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

      // Refresh subscription data
      await refreshSubscription();

      Alert.alert(
        t('success') || 'Success!',
        'Your subscription has been activated! You now have access to all premium features.',
        [{ text: t('ok') }]
      );
    } catch (error: any) {
      console.error('Subscription error:', error);
      Alert.alert(
        t('error'),
        error.message || 'Failed to process subscription. Please try again.',
        [{ text: t('ok') }]
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleOneTimePurchase = async () => {
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
        [{ text: 'OK' }]
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

  const handleManageSubscription = () => {
    Alert.alert(
      t('managePremium'),
      'What would you like to do?',
      [
        {
          text: 'Cancel Subscription',
          style: 'destructive',
          onPress: handleCancelSubscription,
        },
        {
          text: t('cancel'),
          style: 'cancel',
        },
      ]
    );
  };

  const handleCancelSubscription = () => {
    Alert.alert(
      'Cancel Subscription',
      'Are you sure you want to cancel your subscription? You will lose access to premium features at the end of your billing period.',
      [
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsProcessing(true);
              await cancelSubscription(false);
              Alert.alert(
                'Subscription Canceled',
                'Your subscription will remain active until the end of your billing period.',
                [{ text: t('ok') }]
              );
            } catch (error: any) {
              Alert.alert(t('error'), error.message, [{ text: t('ok') }]);
            } finally {
              setIsProcessing(false);
            }
          },
        },
        {
          text: t('cancel'),
          style: 'cancel',
        },
      ]
    );
  };

  const formatPrice = (price: number, currency: string) => {
    const amount = price / 100;
    return `$${amount.toFixed(2)} ${currency.toUpperCase()}`;
  };

  const monthlyPlan = plans.find(p => p.interval === 'month');
  const yearlyPlan = plans.find(p => p.interval === 'year');

  if (loading && !plans.length) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading subscription plans...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Image
            source={require('@/assets/images/6bd4fef3-748f-40f9-8634-91fd29f4c449.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
        <IconSymbol
          ios_icon_name="crown.fill"
          android_material_icon_name="workspace-premium"
          size={60}
          color={colors.accent}
        />
        <Text style={[styles.title, isRTL && styles.rtlText]}>{t('upgradeToPremium')}</Text>
        <Text style={[styles.subtitle, isRTL && styles.rtlText]}>{t('premiumSubtitle')}</Text>
      </View>

      {isPremium && (
        <View style={styles.premiumBadge}>
          <IconSymbol
            ios_icon_name="checkmark.circle.fill"
            android_material_icon_name="check-circle"
            size={24}
            color={colors.success}
          />
          <Text style={[styles.premiumBadgeText, isRTL && styles.rtlText]}>
            {t('alreadyPremium')}
          </Text>
        </View>
      )}

      {subscription?.cancel_at_period_end && (
        <View style={styles.warningBadge}>
          <IconSymbol
            ios_icon_name="exclamationmark.triangle.fill"
            android_material_icon_name="warning"
            size={24}
            color={colors.accent}
          />
          <Text style={[styles.warningBadgeText, isRTL && styles.rtlText]}>
            Subscription will end on {new Date(subscription.current_period_end).toLocaleDateString()}
          </Text>
        </View>
      )}

      <View style={styles.card}>
        <Text style={[styles.cardTitle, isRTL && styles.rtlText]}>{t('premiumFeatures')}</Text>

        <View style={styles.featureItem}>
          <View style={styles.featureIconContainer}>
            <IconSymbol
              ios_icon_name="bolt.fill"
              android_material_icon_name="bolt"
              size={24}
              color={colors.primary}
            />
          </View>
          <View style={[styles.featureTextContainer, isRTL && styles.rtlFeatureText]}>
            <Text style={[styles.featureTitle, isRTL && styles.rtlText]}>
              {t('priorityHelp')}
            </Text>
            <Text style={[styles.featureText, isRTL && styles.rtlText]}>
              {t('priorityHelpDesc')}
            </Text>
          </View>
        </View>

        <View style={styles.featureItem}>
          <View style={styles.featureIconContainer}>
            <IconSymbol
              ios_icon_name="timer"
              android_material_icon_name="schedule"
              size={24}
              color={colors.primary}
            />
          </View>
          <View style={[styles.featureTextContainer, isRTL && styles.rtlFeatureText]}>
            <Text style={[styles.featureTitle, isRTL && styles.rtlText]}>
              {t('fasterResponse')}
            </Text>
            <Text style={[styles.featureText, isRTL && styles.rtlText]}>
              {t('fasterResponseDesc')}
            </Text>
          </View>
        </View>

        <View style={styles.featureItem}>
          <View style={styles.featureIconContainer}>
            <IconSymbol
              ios_icon_name="person.fill.checkmark"
              android_material_icon_name="support-agent"
              size={24}
              color={colors.primary}
            />
          </View>
          <View style={[styles.featureTextContainer, isRTL && styles.rtlFeatureText]}>
            <Text style={[styles.featureTitle, isRTL && styles.rtlText]}>
              {t('dedicatedSupport')}
            </Text>
            <Text style={[styles.featureText, isRTL && styles.rtlText]}>
              {t('dedicatedSupportDesc')}
            </Text>
          </View>
        </View>

        <View style={styles.featureItem}>
          <View style={styles.featureIconContainer}>
            <IconSymbol
              ios_icon_name="location.fill"
              android_material_icon_name="my-location"
              size={24}
              color={colors.primary}
            />
          </View>
          <View style={[styles.featureTextContainer, isRTL && styles.rtlFeatureText]}>
            <Text style={[styles.featureTitle, isRTL && styles.rtlText]}>
              {t('advancedTracking')}
            </Text>
            <Text style={[styles.featureText, isRTL && styles.rtlText]}>
              {t('advancedTrackingDesc')}
            </Text>
          </View>
        </View>

        <View style={styles.featureItem}>
          <View style={styles.featureIconContainer}>
            <IconSymbol
              ios_icon_name="wifi.slash"
              android_material_icon_name="wifi-off"
              size={24}
              color={colors.primary}
            />
          </View>
          <View style={[styles.featureTextContainer, isRTL && styles.rtlFeatureText]}>
            <Text style={[styles.featureTitle, isRTL && styles.rtlText]}>
              {t('offlineMode')}
            </Text>
            <Text style={[styles.featureText, isRTL && styles.rtlText]}>
              {t('offlineModeDesc')}
            </Text>
          </View>
        </View>

        <View style={styles.featureItem}>
          <View style={styles.featureIconContainer}>
            <IconSymbol
              ios_icon_name="person.2.fill"
              android_material_icon_name="contacts"
              size={24}
              color={colors.primary}
            />
          </View>
          <View style={[styles.featureTextContainer, isRTL && styles.rtlFeatureText]}>
            <Text style={[styles.featureTitle, isRTL && styles.rtlText]}>
              {t('multipleContacts')}
            </Text>
            <Text style={[styles.featureText, isRTL && styles.rtlText]}>
              {t('multipleContactsDesc')}
            </Text>
          </View>
        </View>
      </View>

      {!isPremium && (
        <>
          {/* Mode Selector */}
          <View style={styles.card}>
            <Text style={[styles.cardTitle, isRTL && styles.rtlText]}>Select Purchase Type</Text>
            <View style={styles.modeSelector}>
              <TouchableOpacity
                style={[
                  styles.modeButton,
                  checkoutMode === 'subscription' && styles.selectedModeButton,
                ]}
                onPress={() => setCheckoutMode('subscription')}
              >
                <IconSymbol
                  ios_icon_name="crown.fill"
                  android_material_icon_name="workspace-premium"
                  size={20}
                  color={checkoutMode === 'subscription' ? colors.card : colors.text}
                />
                <Text
                  style={[
                    styles.modeButtonText,
                    checkoutMode === 'subscription' && styles.selectedModeButtonText,
                  ]}
                >
                  Subscription
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modeButton,
                  checkoutMode === 'one-time' && styles.selectedModeButton,
                ]}
                onPress={() => setCheckoutMode('one-time')}
              >
                <IconSymbol
                  ios_icon_name="cart.fill"
                  android_material_icon_name="shopping-cart"
                  size={20}
                  color={checkoutMode === 'one-time' ? colors.card : colors.text}
                />
                <Text
                  style={[
                    styles.modeButtonText,
                    checkoutMode === 'one-time' && styles.selectedModeButtonText,
                  ]}
                >
                  One-Time Purchase
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Subscription Plans */}
          {checkoutMode === 'subscription' && (
            <View style={styles.card}>
              <Text style={[styles.cardTitle, isRTL && styles.rtlText]}>{t('pricing')}</Text>

              {monthlyPlan && (
                <TouchableOpacity
                  style={[
                    styles.planCard,
                    selectedPlanId === monthlyPlan.id && styles.selectedPlanCard,
                  ]}
                  onPress={() => setSelectedPlanId(monthlyPlan.id)}
                >
                  <View style={styles.planHeader}>
                    <Text style={[styles.planTitle, isRTL && styles.rtlText]}>
                      {t('monthlyPlan')}
                    </Text>
                    {selectedPlanId === monthlyPlan.id && (
                      <IconSymbol
                        ios_icon_name="checkmark.circle.fill"
                        android_material_icon_name="check-circle"
                        size={24}
                        color={colors.primary}
                      />
                    )}
                  </View>
                  <Text style={[styles.planPrice, isRTL && styles.rtlText]}>
                    {monthlyPlan.price_amount / 100} {monthlyPlan.price_currency.toUpperCase()}/month
                  </Text>
                </TouchableOpacity>
              )}

              {yearlyPlan && (
                <TouchableOpacity
                  style={[
                    styles.planCard,
                    selectedPlanId === yearlyPlan.id && styles.selectedPlanCard,
                  ]}
                  onPress={() => setSelectedPlanId(yearlyPlan.id)}
                >
                  <View style={styles.planHeader}>
                    <View>
                      <Text style={[styles.planTitle, isRTL && styles.rtlText]}>
                        {t('yearlyPlan')}
                      </Text>
                      <Text style={[styles.saveBadge, isRTL && styles.rtlText]}>
                        {t('save2Months')}
                      </Text>
                    </View>
                    {selectedPlanId === yearlyPlan.id && (
                      <IconSymbol
                        ios_icon_name="checkmark.circle.fill"
                        android_material_icon_name="check-circle"
                        size={24}
                        color={colors.primary}
                      />
                    )}
                  </View>
                  <Text style={[styles.planPrice, isRTL && styles.rtlText]}>
                    {yearlyPlan.price_amount / 100} {yearlyPlan.price_currency.toUpperCase()}/year
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* One-Time Purchase Items */}
          {checkoutMode === 'one-time' && (
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
          )}

          {/* Payment Details */}
          <View style={styles.card}>
            <Text style={[styles.cardTitle, isRTL && styles.rtlText]}>Payment Details</Text>
            <Text style={[styles.cardSubtitle, isRTL && styles.rtlText]}>
              Enter your card information (Test Mode)
            </Text>
            <CardField
              postalCodeEnabled={checkoutMode === 'one-time'}
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

          {/* Order Summary for One-Time Purchases */}
          {checkoutMode === 'one-time' && selectedItem && (
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
          )}

          {/* Action Button */}
          {checkoutMode === 'subscription' ? (
            <TouchableOpacity
              style={[
                styles.subscribeButton,
                (isProcessing || !selectedPlanId || !cardComplete) && styles.disabledButton,
              ]}
              onPress={handleSubscribe}
              disabled={isProcessing || !selectedPlanId || !cardComplete}
            >
              {isProcessing ? (
                <ActivityIndicator color={colors.card} />
              ) : (
                <>
                  <IconSymbol
                    ios_icon_name="crown.fill"
                    android_material_icon_name="workspace-premium"
                    size={24}
                    color={colors.card}
                  />
                  <Text style={styles.subscribeButtonText}>{t('subscribeToPremium')}</Text>
                </>
              )}
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[
                styles.checkoutButton,
                (isProcessing || !selectedItem || !cardComplete || !isLoggedIn) && styles.disabledButton,
              ]}
              onPress={handleOneTimePurchase}
              disabled={isProcessing || !selectedItem || !cardComplete || !isLoggedIn}
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
                    {selectedItem ? `Pay ${formatPrice(selectedItem.price, selectedItem.currency)}` : 'Select Item'}
                  </Text>
                </>
              )}
            </TouchableOpacity>
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
        </>
      )}

      {isPremium && !subscription?.cancel_at_period_end && (
        <TouchableOpacity
          style={styles.manageButton}
          onPress={handleManageSubscription}
          disabled={isProcessing}
        >
          <IconSymbol
            ios_icon_name="gearshape.fill"
            android_material_icon_name="settings"
            size={24}
            color={colors.primary}
          />
          <Text style={styles.manageButtonText}>{t('managePremium')}</Text>
        </TouchableOpacity>
      )}

      <View style={styles.card}>
        <Text style={[styles.cardTitle, isRTL && styles.rtlText]}>{t('whyPremium')}</Text>
        <Text style={[styles.cardText, isRTL && styles.rtlText]}>{t('whyPremiumText')}</Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.textSecondary,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoContainer: {
    marginBottom: 12,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 6,
    borderRadius: 20,
    backgroundColor: colors.card,
    padding: 6,
  },
  logo: {
    width: 80,
    height: 80,
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
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.highlight,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  premiumBadgeText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginLeft: 8,
  },
  warningBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF3CD',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  warningBadgeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#856404',
    marginLeft: 8,
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
  cardText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 22,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  featureIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  featureTextContainer: {
    flex: 1,
  },
  rtlFeatureText: {
    marginLeft: 0,
    marginRight: 16,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  featureText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  modeSelector: {
    flexDirection: 'row',
    gap: 12,
  },
  modeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    gap: 8,
  },
  selectedModeButton: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  modeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  selectedModeButtonText: {
    color: colors.card,
  },
  planCard: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedPlanCard: {
    borderColor: colors.primary,
    backgroundColor: colors.highlight,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  planTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  planPrice: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.primary,
  },
  saveBadge: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.success,
    marginTop: 4,
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
  subscribeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accent,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 4,
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
  subscribeButtonText: {
    color: colors.card,
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 8,
  },
  checkoutButtonText: {
    color: colors.card,
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 8,
  },
  manageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  manageButtonText: {
    color: colors.primary,
    fontSize: 16,
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

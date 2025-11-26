
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/app/integrations/supabase/client';

interface PaymentRecord {
  id: string;
  stripe_payment_intent_id: string;
  amount: number;
  currency: string;
  status: string;
  payment_method: string;
  created_at: string;
}

export default function PaymentHistoryScreen() {
  const { t, isRTL } = useLanguage();
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    checkAuthAndLoadPayments();
  }, []);

  const checkAuthAndLoadPayments = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setIsLoggedIn(!!user);
    
    if (user) {
      await loadPayments();
    } else {
      setLoading(false);
    }
  };

  const loadPayments = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.log('No user logged in');
        return;
      }

      const { data, error } = await supabase
        .from('payment_history')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading payments:', error);
        return;
      }

      setPayments(data || []);
    } catch (error) {
      console.error('Error loading payments:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPayments();
  };

  const formatPrice = (amount: number, currency: string) => {
    const price = amount / 100;
    return `$${price.toFixed(2)} ${currency.toUpperCase()}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'succeeded':
        return colors.success;
      case 'processing':
        return colors.primary;
      case 'requires_action':
        return colors.accent;
      case 'failed':
      case 'canceled':
        return colors.error;
      default:
        return colors.textSecondary;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'succeeded':
        return {
          ios: 'checkmark.circle.fill',
          android: 'check-circle',
        };
      case 'processing':
        return {
          ios: 'clock.fill',
          android: 'schedule',
        };
      case 'requires_action':
        return {
          ios: 'exclamationmark.circle.fill',
          android: 'error',
        };
      case 'failed':
      case 'canceled':
        return {
          ios: 'xmark.circle.fill',
          android: 'cancel',
        };
      default:
        return {
          ios: 'circle.fill',
          android: 'circle',
        };
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading payment history...</Text>
      </View>
    );
  }

  if (!isLoggedIn) {
    return (
      <View style={styles.emptyContainer}>
        <IconSymbol
          ios_icon_name="person.crop.circle.badge.exclamationmark"
          android_material_icon_name="account-circle"
          size={80}
          color={colors.textSecondary}
        />
        <Text style={styles.emptyTitle}>Not Logged In</Text>
        <Text style={styles.emptyMessage}>
          Please log in to view your payment history
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.scrollContent}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <IconSymbol
          ios_icon_name="doc.text.fill"
          android_material_icon_name="receipt"
          size={60}
          color={colors.primary}
        />
        <Text style={[styles.title, isRTL && styles.rtlText]}>Payment History</Text>
        <Text style={[styles.subtitle, isRTL && styles.rtlText]}>
          View all your past transactions
        </Text>
      </View>

      {payments.length === 0 ? (
        <View style={styles.emptyContainer}>
          <IconSymbol
            ios_icon_name="tray.fill"
            android_material_icon_name="inbox"
            size={80}
            color={colors.textSecondary}
          />
          <Text style={styles.emptyTitle}>No Payments Yet</Text>
          <Text style={styles.emptyMessage}>
            Your payment history will appear here once you make a purchase
          </Text>
        </View>
      ) : (
        <View style={styles.paymentsContainer}>
          {payments.map((payment, index) => {
            const statusIcon = getStatusIcon(payment.status);
            return (
              <View key={index} style={styles.paymentCard}>
                <View style={styles.paymentHeader}>
                  <View style={styles.paymentIconContainer}>
                    <IconSymbol
                      ios_icon_name="creditcard.fill"
                      android_material_icon_name="credit-card"
                      size={24}
                      color={colors.primary}
                    />
                  </View>
                  <View style={styles.paymentInfo}>
                    <Text style={[styles.paymentAmount, isRTL && styles.rtlText]}>
                      {formatPrice(payment.amount, payment.currency)}
                    </Text>
                    <Text style={[styles.paymentDate, isRTL && styles.rtlText]}>
                      {formatDate(payment.created_at)}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: `${getStatusColor(payment.status)}20` },
                    ]}
                  >
                    <IconSymbol
                      ios_icon_name={statusIcon.ios}
                      android_material_icon_name={statusIcon.android}
                      size={16}
                      color={getStatusColor(payment.status)}
                    />
                    <Text
                      style={[
                        styles.statusText,
                        { color: getStatusColor(payment.status) },
                        isRTL && styles.rtlText,
                      ]}
                    >
                      {payment.status}
                    </Text>
                  </View>
                </View>
                <View style={styles.paymentDetails}>
                  <View style={styles.detailRow}>
                    <Text style={[styles.detailLabel, isRTL && styles.rtlText]}>
                      Payment ID:
                    </Text>
                    <Text
                      style={[styles.detailValue, isRTL && styles.rtlText]}
                      numberOfLines={1}
                    >
                      {payment.stripe_payment_intent_id}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={[styles.detailLabel, isRTL && styles.rtlText]}>
                      Method:
                    </Text>
                    <Text style={[styles.detailValue, isRTL && styles.rtlText]}>
                      {payment.payment_method || 'Card'}
                    </Text>
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      )}
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginTop: 16,
    textAlign: 'center',
  },
  emptyMessage: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  paymentsContainer: {
    marginBottom: 20,
  },
  paymentCard: {
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
  paymentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  paymentIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  paymentInfo: {
    flex: 1,
  },
  paymentAmount: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 4,
  },
  paymentDate: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
    textTransform: 'capitalize',
  },
  paymentDetails: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  detailValue: {
    fontSize: 14,
    color: colors.text,
    flex: 1,
    textAlign: 'right',
    marginLeft: 12,
  },
  rtlText: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
});

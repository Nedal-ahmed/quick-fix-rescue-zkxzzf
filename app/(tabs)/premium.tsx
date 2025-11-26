
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Alert,
} from 'react-native';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { useLanguage } from '@/contexts/LanguageContext';

export default function PremiumScreen() {
  const { t, isRTL } = useLanguage();
  const [isPremium, setIsPremium] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('monthly');

  const handleSubscribe = () => {
    console.log('Subscribe to premium:', selectedPlan);
    Alert.alert(
      t('subscribeToPremium'),
      `You have selected the ${selectedPlan} plan. In a production app, this would integrate with a payment provider like Stripe or RevenueCat.`,
      [
        {
          text: t('ok'),
          onPress: () => {
            setIsPremium(true);
          },
        },
      ]
    );
  };

  const handleManageSubscription = () => {
    console.log('Manage subscription');
    Alert.alert(
      t('managePremium'),
      'In a production app, this would allow you to manage your subscription settings.',
      [{ text: t('ok') }]
    );
  };

  return (
    <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
      <View style={styles.header}>
        <IconSymbol
          ios_icon_name="crown.fill"
          android_material_icon_name="workspace-premium"
          size={80}
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

      <View style={styles.card}>
        <Text style={[styles.cardTitle, isRTL && styles.rtlText]}>{t('premiumFeatures')}</Text>

        <View style={styles.featureItem}>
          <IconSymbol
            ios_icon_name="bolt.fill"
            android_material_icon_name="bolt"
            size={24}
            color={colors.primary}
          />
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
          <IconSymbol
            ios_icon_name="timer"
            android_material_icon_name="schedule"
            size={24}
            color={colors.primary}
          />
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
          <IconSymbol
            ios_icon_name="person.fill.checkmark"
            android_material_icon_name="support-agent"
            size={24}
            color={colors.primary}
          />
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
          <IconSymbol
            ios_icon_name="location.fill"
            android_material_icon_name="my-location"
            size={24}
            color={colors.primary}
          />
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
          <IconSymbol
            ios_icon_name="wifi.slash"
            android_material_icon_name="wifi-off"
            size={24}
            color={colors.primary}
          />
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
          <IconSymbol
            ios_icon_name="person.2.fill"
            android_material_icon_name="contacts"
            size={24}
            color={colors.primary}
          />
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
          <View style={styles.card}>
            <Text style={[styles.cardTitle, isRTL && styles.rtlText]}>{t('pricing')}</Text>

            <TouchableOpacity
              style={[
                styles.planCard,
                selectedPlan === 'monthly' && styles.selectedPlanCard,
              ]}
              onPress={() => setSelectedPlan('monthly')}
            >
              <View style={styles.planHeader}>
                <Text style={[styles.planTitle, isRTL && styles.rtlText]}>
                  {t('monthlyPlan')}
                </Text>
                {selectedPlan === 'monthly' && (
                  <IconSymbol
                    ios_icon_name="checkmark.circle.fill"
                    android_material_icon_name="check-circle"
                    size={24}
                    color={colors.primary}
                  />
                )}
              </View>
              <Text style={[styles.planPrice, isRTL && styles.rtlText]}>{t('perMonth')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.planCard,
                selectedPlan === 'yearly' && styles.selectedPlanCard,
              ]}
              onPress={() => setSelectedPlan('yearly')}
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
                {selectedPlan === 'yearly' && (
                  <IconSymbol
                    ios_icon_name="checkmark.circle.fill"
                    android_material_icon_name="check-circle"
                    size={24}
                    color={colors.primary}
                  />
                )}
              </View>
              <Text style={[styles.planPrice, isRTL && styles.rtlText]}>{t('perYear')}</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.subscribeButton} onPress={handleSubscribe}>
            <IconSymbol
              ios_icon_name="crown.fill"
              android_material_icon_name="workspace-premium"
              size={24}
              color={colors.card}
            />
            <Text style={styles.subscribeButtonText}>{t('subscribeToPremium')}</Text>
          </TouchableOpacity>
        </>
      )}

      {isPremium && (
        <TouchableOpacity style={styles.manageButton} onPress={handleManageSubscription}>
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
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
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
  featureTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  rtlFeatureText: {
    marginLeft: 0,
    marginRight: 12,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  featureText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
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
  subscribeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accent,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginBottom: 16,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.15)',
    elevation: 4,
  },
  subscribeButtonText: {
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
  rtlText: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
});

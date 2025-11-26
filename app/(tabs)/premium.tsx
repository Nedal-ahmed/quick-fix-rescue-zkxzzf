
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Platform,
} from 'react-native';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { useLanguage } from '@/contexts/LanguageContext';

/**
 * Universal PremiumScreen Component
 * This is the fallback component that works on all platforms.
 * Platform-specific implementations are in premium.native.tsx and premium.web.tsx
 */
export default function PremiumScreen() {
  const { t, isRTL } = useLanguage();

  return (
    <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
      <View style={styles.header}>
        <IconSymbol
          ios_icon_name="crown.fill"
          android_material_icon_name="workspace-premium"
          size={60}
          color={colors.accent}
        />
        <Text style={[styles.title, isRTL && styles.rtlText]}>{t('upgradeToPremium')}</Text>
        <Text style={[styles.subtitle, isRTL && styles.rtlText]}>{t('premiumSubtitle')}</Text>
      </View>

      <View style={styles.card}>
        <Text style={[styles.cardTitle, isRTL && styles.rtlText]}>Premium Features</Text>
        <Text style={[styles.cardText, isRTL && styles.rtlText]}>
          Upgrade to premium to unlock exclusive features and priority support.
        </Text>
      </View>

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
  rtlText: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
});

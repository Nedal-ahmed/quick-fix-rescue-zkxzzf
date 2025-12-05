
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Platform,
  TouchableOpacity,
  Image,
  Linking,
} from 'react-native';
import { IconSymbol } from '@/components/IconSymbol';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';

interface SponsoredAd {
  id: string;
  company: string;
  title: string;
  description: string;
  imageUrl: string;
  category: string;
  website?: string;
}

const SPONSORED_ADS: SponsoredAd[] = [
  {
    id: '1',
    company: 'TAQA',
    title: 'TAQA Gas Stations',
    description: 'Premium fuel for your vehicle. Visit our stations across Egypt for quality service and competitive prices.',
    imageUrl: 'https://images.unsplash.com/photo-1545262810-77515befe149?w=800&q=80',
    category: 'Gas Station',
    website: 'https://taqa.com',
  },
  {
    id: '2',
    company: 'Misr Petroleum',
    title: 'Misr Petroleum Services',
    description: 'Your trusted fuel partner. Find our gas stations nationwide with 24/7 service and premium quality fuel.',
    imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
    category: 'Gas Station',
    website: 'https://misrpetroleum.com',
  },
  {
    id: '3',
    company: 'AutoCare Pro',
    title: 'Professional Car Detailing',
    description: 'Complete car detailing services including interior cleaning, exterior polishing, and paint protection.',
    imageUrl: 'https://images.unsplash.com/photo-1601362840469-51e4d8d58785?w=800&q=80',
    category: 'Car Service',
  },
  {
    id: '4',
    company: 'SpeedFix Auto',
    title: 'Quick Car Repairs',
    description: 'Fast and reliable car repair services. From oil changes to engine diagnostics, we handle it all.',
    imageUrl: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=800&q=80',
    category: 'Car Service',
  },
  {
    id: '5',
    company: 'Elite Car Wash',
    title: 'Premium Car Wash Services',
    description: 'State-of-the-art car wash facilities with eco-friendly products. Keep your car sparkling clean.',
    imageUrl: 'https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?w=800&q=80',
    category: 'Car Service',
  },
  {
    id: '6',
    company: 'TireMaster',
    title: 'Tire Sales & Services',
    description: 'Wide selection of premium tires for all vehicle types. Professional installation and balancing services.',
    imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
    category: 'Car Service',
  },
  {
    id: '7',
    company: 'AutoGlow Detailing',
    title: 'Ceramic Coating Specialists',
    description: 'Protect your car with professional ceramic coating. Long-lasting shine and protection for your vehicle.',
    imageUrl: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=800&q=80',
    category: 'Car Service',
  },
  {
    id: '8',
    company: 'QuickLube Express',
    title: 'Fast Oil Change Service',
    description: 'Quick oil changes while you wait. Premium oils and filters for optimal engine performance.',
    imageUrl: 'https://images.unsplash.com/photo-1487754180451-c456f719a1fc?w=800&q=80',
    category: 'Car Service',
  },
];

export default function SponsoredAdsScreen() {
  const { t, isRTL } = useLanguage();
  const { colors } = useTheme();

  const handleAdPress = (ad: SponsoredAd) => {
    if (ad.website) {
      Linking.openURL(ad.website).catch((err) => {
        console.error('Failed to open URL:', err);
      });
    }
  };

  const styles = createStyles(colors);

  const renderAdCard = (ad: SponsoredAd) => (
    <TouchableOpacity
      key={ad.id}
      style={styles.adCard}
      onPress={() => handleAdPress(ad)}
      activeOpacity={0.7}
    >
      <Image
        source={{ uri: ad.imageUrl }}
        style={styles.adImage}
        resizeMode="cover"
      />
      <View style={styles.adContent}>
        <View style={styles.adHeader}>
          <View style={styles.categoryBadge}>
            <IconSymbol
              ios_icon_name={ad.category === 'Gas Station' ? 'fuelpump.fill' : 'wrench.and.screwdriver.fill'}
              android_material_icon_name={ad.category === 'Gas Station' ? 'local-gas-station' : 'build'}
              size={14}
              color={colors.card}
            />
            <Text style={styles.categoryText}>{ad.category}</Text>
          </View>
          <View style={styles.sponsoredBadge}>
            <Text style={styles.sponsoredText}>{t('sponsored')}</Text>
          </View>
        </View>
        <Text style={[styles.companyName, isRTL && styles.rtlText]}>{ad.company}</Text>
        <Text style={[styles.adTitle, isRTL && styles.rtlText]}>{ad.title}</Text>
        <Text style={[styles.adDescription, isRTL && styles.rtlText]} numberOfLines={3}>
          {ad.description}
        </Text>
        {ad.website && (
          <View style={styles.learnMoreContainer}>
            <Text style={styles.learnMoreText}>{t('learnMore')}</Text>
            <IconSymbol
              ios_icon_name="arrow.right"
              android_material_icon_name="arrow-forward"
              size={16}
              color={colors.primary}
            />
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
      <View style={styles.header}>
        <View style={styles.headerIconContainer}>
          <IconSymbol
            ios_icon_name="megaphone.fill"
            android_material_icon_name="campaign"
            size={48}
            color={colors.accent}
          />
        </View>
        <Text style={[styles.title, isRTL && styles.rtlText]}>{t('sponsoredAds')}</Text>
        <Text style={[styles.subtitle, isRTL && styles.rtlText]}>
          {t('sponsoredAdsSubtitle')}
        </Text>
      </View>

      <View style={styles.infoCard}>
        <View style={styles.infoIconContainer}>
          <IconSymbol
            ios_icon_name="info.circle.fill"
            android_material_icon_name="info"
            size={24}
            color={colors.primary}
          />
        </View>
        <View style={styles.infoTextContainer}>
          <Text style={[styles.infoTitle, isRTL && styles.rtlText]}>
            {t('supportingOurApp')}
          </Text>
          <Text style={[styles.infoText, isRTL && styles.rtlText]}>
            {t('supportingOurAppText')}
          </Text>
        </View>
      </View>

      <View style={styles.sectionHeader}>
        <IconSymbol
          ios_icon_name="fuelpump.fill"
          android_material_icon_name="local-gas-station"
          size={24}
          color={colors.primary}
        />
        <Text style={[styles.sectionTitle, isRTL && styles.rtlText]}>
          {t('gasStations')}
        </Text>
      </View>

      {SPONSORED_ADS.filter(ad => ad.category === 'Gas Station').map(renderAdCard)}

      <View style={styles.sectionHeader}>
        <IconSymbol
          ios_icon_name="wrench.and.screwdriver.fill"
          android_material_icon_name="build"
          size={24}
          color={colors.primary}
        />
        <Text style={[styles.sectionTitle, isRTL && styles.rtlText]}>
          {t('carServices')}
        </Text>
      </View>

      {SPONSORED_ADS.filter(ad => ad.category === 'Car Service').map(renderAdCard)}

      <View style={styles.partnershipCard}>
        <IconSymbol
          ios_icon_name="handshake.fill"
          android_material_icon_name="handshake"
          size={40}
          color={colors.accent}
        />
        <Text style={[styles.partnershipTitle, isRTL && styles.rtlText]}>
          {t('becomeAPartner')}
        </Text>
        <Text style={[styles.partnershipText, isRTL && styles.rtlText]}>
          {t('becomeAPartnerText')}
        </Text>
      </View>
    </ScrollView>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
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
  headerIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.highlight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    boxShadow: '0px 4px 12px rgba(255, 107, 53, 0.2)',
    elevation: 4,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: colors.text,
    marginTop: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    marginTop: 6,
    textAlign: 'center',
    fontWeight: '500',
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: colors.highlight,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: colors.primary,
    boxShadow: '0px 4px 12px rgba(41, 98, 255, 0.15)',
    elevation: 3,
  },
  infoIconContainer: {
    marginRight: 16,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 6,
  },
  infoText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
    marginLeft: 12,
  },
  adCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    boxShadow: `0px 4px 12px ${colors.shadow}`,
    elevation: 3,
    borderWidth: 1,
    borderColor: colors.border,
  },
  adImage: {
    width: '100%',
    height: 200,
    backgroundColor: colors.background,
  },
  adContent: {
    padding: 16,
  },
  adHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.card,
    marginLeft: 6,
  },
  sponsoredBadge: {
    backgroundColor: colors.accent,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  sponsoredText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.card,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  companyName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 4,
  },
  adTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 8,
  },
  adDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: 12,
  },
  learnMoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  learnMoreText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.primary,
    marginRight: 6,
  },
  partnershipCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 16,
    boxShadow: `0px 4px 12px ${colors.shadow}`,
    elevation: 3,
    borderWidth: 2,
    borderColor: colors.accent,
  },
  partnershipTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  partnershipText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  rtlText: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
});

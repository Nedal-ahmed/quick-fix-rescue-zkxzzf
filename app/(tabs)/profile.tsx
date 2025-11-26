
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Platform,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { useLanguage } from '@/contexts/LanguageContext';

export default function ProfileScreen() {
  const { t, language, setLanguage, isRTL } = useLanguage();

  const handleLanguageChange = async () => {
    const newLanguage = language === 'en' ? 'ar' : 'en';
    const languageName = newLanguage === 'en' ? 'English' : 'العربية';
    
    try {
      console.log(`Changing language from ${language} to ${newLanguage}`);
      await setLanguage(newLanguage);
      
      Alert.alert(
        t('changeLanguage'),
        `${t('language')}: ${languageName}`,
        [{ text: t('ok') }]
      );
    } catch (error) {
      console.error('Error changing language:', error);
      Alert.alert(t('error'), 'Failed to change language');
    }
  };

  return (
    <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
      <View style={styles.header}>
        <View style={styles.profileIconContainer}>
          <IconSymbol
            ios_icon_name="person.circle.fill"
            android_material_icon_name="account-circle"
            size={80}
            color={colors.primary}
          />
        </View>
        <Text style={[styles.title, isRTL && styles.rtlText]}>{t('profile')}</Text>
      </View>

      <TouchableOpacity style={styles.languageCard} onPress={handleLanguageChange}>
        <View style={styles.languageRow}>
          <View style={styles.languageLeft}>
            <View style={styles.iconContainer}>
              <IconSymbol
                ios_icon_name="globe"
                android_material_icon_name="language"
                size={24}
                color={colors.primary}
              />
            </View>
            <View>
              <Text style={[styles.languageLabel, isRTL && styles.rtlText]}>
                {t('language')}
              </Text>
              <Text style={[styles.languageSubtext, isRTL && styles.rtlText]}>
                {t('changeLanguage')}
              </Text>
            </View>
          </View>
          <View style={styles.languageRight}>
            <View style={styles.languageBadge}>
              <Text style={styles.languageValue}>
                {language === 'en' ? 'EN' : 'ع'}
              </Text>
            </View>
            <IconSymbol
              ios_icon_name="chevron.right"
              android_material_icon_name="chevron-right"
              size={20}
              color={colors.textSecondary}
            />
          </View>
        </View>
      </TouchableOpacity>

      <View style={styles.card}>
        <Text style={[styles.cardTitle, isRTL && styles.rtlText]}>{t('aboutQuickFix')}</Text>
        <Text style={[styles.cardText, isRTL && styles.rtlText]}>
          {t('aboutQuickFixText')}
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={[styles.sectionTitle, isRTL && styles.rtlText]}>
          {t('nearestRescuePoints')}
        </Text>
        
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
              {t('realTimeLocation')}
            </Text>
            <Text style={[styles.featureText, isRTL && styles.rtlText]}>
              {t('realTimeLocationText')}
            </Text>
          </View>
        </View>

        <View style={styles.featureItem}>
          <View style={styles.featureIconContainer}>
            <IconSymbol
              ios_icon_name="mappin.circle.fill"
              android_material_icon_name="place"
              size={24}
              color={colors.accent}
            />
          </View>
          <View style={[styles.featureTextContainer, isRTL && styles.rtlFeatureText]}>
            <Text style={[styles.featureTitle, isRTL && styles.rtlText]}>
              {t('nearestRescuePoints')}
            </Text>
            <Text style={[styles.featureText, isRTL && styles.rtlText]}>
              {t('nearestRescuePointsText')}
            </Text>
          </View>
        </View>

        <View style={styles.featureItem}>
          <View style={styles.featureIconContainer}>
            <IconSymbol
              ios_icon_name="phone.fill"
              android_material_icon_name="phone"
              size={24}
              color={colors.success}
            />
          </View>
          <View style={[styles.featureTextContainer, isRTL && styles.rtlFeatureText]}>
            <Text style={[styles.featureTitle, isRTL && styles.rtlText]}>
              {t('emergencyDispatch')}
            </Text>
            <Text style={[styles.featureText, isRTL && styles.rtlText]}>
              {t('emergencyDispatchText')}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={[styles.cardTitle, isRTL && styles.rtlText]}>{t('appInformation')}</Text>
        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, isRTL && styles.rtlText]}>{t('version')}:</Text>
          <Text style={[styles.infoValue, isRTL && styles.rtlText]}>1.0.0</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, isRTL && styles.rtlText]}>{t('platform')}:</Text>
          <Text style={[styles.infoValue, isRTL && styles.rtlText]}>
            {Platform.OS === 'ios' ? 'iOS' : 'Android'}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, isRTL && styles.rtlText]}>{t('language')}:</Text>
          <Text style={[styles.infoValue, isRTL && styles.rtlText]}>
            {language === 'en' ? 'English' : 'العربية'}
          </Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={[styles.cardTitle, isRTL && styles.rtlText]}>{t('emergencyTips')}</Text>
        <View style={styles.tipItem}>
          <View style={styles.tipBulletContainer}>
            <Text style={styles.tipBullet}>1</Text>
          </View>
          <Text style={[styles.tipText, isRTL && styles.rtlText]}>
            {t('emergencyTip1')}
          </Text>
        </View>
        <View style={styles.tipItem}>
          <View style={styles.tipBulletContainer}>
            <Text style={styles.tipBullet}>2</Text>
          </View>
          <Text style={[styles.tipText, isRTL && styles.rtlText]}>
            {t('emergencyTip2')}
          </Text>
        </View>
        <View style={styles.tipItem}>
          <View style={styles.tipBulletContainer}>
            <Text style={styles.tipBullet}>3</Text>
          </View>
          <Text style={[styles.tipText, isRTL && styles.rtlText]}>
            {t('emergencyTip3')}
          </Text>
        </View>
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
    marginBottom: 32,
  },
  profileIconContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: colors.text,
  },
  languageCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.08)',
    elevation: 3,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  languageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  languageLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.highlight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  languageLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  languageSubtext: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  languageRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  languageBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  languageValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.card,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.08)',
    elevation: 3,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 16,
  },
  cardText: {
    fontSize: 15,
    color: colors.text,
    lineHeight: 24,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
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
    marginBottom: 6,
  },
  featureText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  infoLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  infoValue: {
    fontSize: 15,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  tipItem: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  tipBulletContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  tipBullet: {
    fontSize: 14,
    color: colors.card,
    fontWeight: '700',
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    lineHeight: 22,
  },
  rtlText: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
});

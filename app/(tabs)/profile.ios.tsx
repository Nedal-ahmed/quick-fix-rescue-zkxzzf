
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
import { router } from 'expo-router';

export default function ProfileScreen() {
  const { t, language, setLanguage, isRTL } = useLanguage();

  const handleLanguageChange = () => {
    Alert.alert(
      t('changeLanguage'),
      t('language'),
      [
        {
          text: 'English',
          onPress: () => {
            console.log('Changing language to English');
            setLanguage('en');
          },
        },
        {
          text: 'العربية',
          onPress: () => {
            console.log('Changing language to Arabic');
            setLanguage('ar');
          },
        },
        {
          text: t('ok'),
          style: 'cancel',
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
      <View style={styles.header}>
        <IconSymbol
          ios_icon_name="person.circle.fill"
          android_material_icon_name="account-circle"
          size={100}
          color={colors.primary}
        />
        <Text style={[styles.title, isRTL && styles.rtlText]}>{t('profile')}</Text>
      </View>

      <TouchableOpacity style={styles.card} onPress={handleLanguageChange}>
        <View style={styles.languageRow}>
          <View style={styles.languageLeft}>
            <IconSymbol
              ios_icon_name="globe"
              android_material_icon_name="language"
              size={24}
              color={colors.primary}
            />
            <Text style={[styles.languageLabel, isRTL && styles.rtlText]}>
              {t('language')}
            </Text>
          </View>
          <View style={styles.languageRight}>
            <Text style={[styles.languageValue, isRTL && styles.rtlText]}>
              {language === 'en' ? 'English' : 'العربية'}
            </Text>
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
        <View style={styles.featureItem}>
          <IconSymbol
            ios_icon_name="location.fill"
            android_material_icon_name="my-location"
            size={24}
            color={colors.primary}
          />
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
          <IconSymbol
            ios_icon_name="mappin.circle.fill"
            android_material_icon_name="place"
            size={24}
            color={colors.primary}
          />
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
          <IconSymbol
            ios_icon_name="phone.fill"
            android_material_icon_name="phone"
            size={24}
            color={colors.primary}
          />
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
          <Text style={[styles.infoValue, isRTL && styles.rtlText]}>{Platform.OS}</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={[styles.cardTitle, isRTL && styles.rtlText]}>{t('emergencyTips')}</Text>
        <View style={styles.tipItem}>
          <Text style={styles.tipBullet}>•</Text>
          <Text style={[styles.tipText, isRTL && styles.rtlText]}>
            {t('emergencyTip1')}
          </Text>
        </View>
        <View style={styles.tipItem}>
          <Text style={styles.tipBullet}>•</Text>
          <Text style={[styles.tipText, isRTL && styles.rtlText]}>
            {t('emergencyTip2')}
          </Text>
        </View>
        <View style={styles.tipItem}>
          <Text style={styles.tipBullet}>•</Text>
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
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.text,
    marginTop: 16,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  cardText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  languageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  languageLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  languageLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginLeft: 12,
  },
  languageRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  languageValue: {
    fontSize: 16,
    color: colors.textSecondary,
    marginRight: 8,
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
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  infoValue: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  tipItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  tipBullet: {
    fontSize: 16,
    color: colors.primary,
    marginRight: 8,
    fontWeight: '700',
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  rtlText: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
});

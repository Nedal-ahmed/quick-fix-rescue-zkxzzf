
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
  Image,
} from 'react-native';
import * as Location from 'expo-location';
import { router } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { useLanguage } from '@/contexts/LanguageContext';

interface RescuePoint {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  distance?: number;
}

const MOCK_RESCUE_POINTS: RescuePoint[] = [
  { id: '1', name: 'Cairo Central Rescue Station', latitude: 30.0444, longitude: 31.2357 },
  { id: '2', name: 'Giza Emergency Center', latitude: 30.0131, longitude: 31.2089 },
  { id: '3', name: 'Nasr City Quick Response', latitude: 30.0626, longitude: 31.3549 },
  { id: '4', name: 'Heliopolis Medical Response', latitude: 30.0808, longitude: 31.3239 },
  { id: '5', name: 'Maadi Emergency Services', latitude: 29.9602, longitude: 31.2569 },
  { id: '6', name: 'Alexandria Rescue Point', latitude: 31.2001, longitude: 29.9187 },
  { id: '7', name: 'Zamalek Emergency Unit', latitude: 30.0618, longitude: 31.2194 },
  { id: '8', name: '6th October City Response', latitude: 29.9668, longitude: 30.9376 },
];

export default function HomeScreen() {
  const { t, isRTL } = useLanguage();
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [nearestPoint, setNearestPoint] = useState<RescuePoint | null>(null);
  const [requestSent, setRequestSent] = useState<boolean>(false);

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const toRad = (value: number): number => {
    return (value * Math.PI) / 180;
  };

  const calculateNearestRescuePoint = useCallback((currentLocation: Location.LocationObject) => {
    const { latitude, longitude } = currentLocation.coords;
    
    const pointsWithDistance = MOCK_RESCUE_POINTS.map(point => {
      const distance = calculateDistance(
        latitude,
        longitude,
        point.latitude,
        point.longitude
      );
      return { ...point, distance };
    });

    pointsWithDistance.sort((a, b) => (a.distance || 0) - (b.distance || 0));
    setNearestPoint(pointsWithDistance[0]);
    console.log('Nearest rescue point:', pointsWithDistance[0]);
  }, []);

  const getCurrentLocation = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      console.log('Requesting location permissions...');

      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        setErrorMsg(t('permissionDenied'));
        setLoading(false);
        console.log('Location permission denied');
        return;
      }

      console.log('Location permission granted, getting current position...');
      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      
      console.log('Current location:', currentLocation.coords);
      setLocation(currentLocation);
      calculateNearestRescuePoint(currentLocation);
      setLoading(false);
    } catch (error) {
      console.error('Error getting location:', error);
      setErrorMsg(t('locationError'));
      setLoading(false);
    }
  }, [t, calculateNearestRescuePoint]);

  useEffect(() => {
    getCurrentLocation();
  }, [getCurrentLocation]);

  const handleSendLocationForRescue = () => {
    if (!location) {
      Alert.alert(t('error'), t('locationNotAvailable'));
      return;
    }

    console.log('Sending location for rescue:', location.coords);
    setRequestSent(true);

    Alert.alert(
      t('rescueRequestSent'),
      t('rescueRequestMessage', {
        latitude: location.coords.latitude.toFixed(6),
        longitude: location.coords.longitude.toFixed(6),
      }),
      [
        {
          text: t('ok'),
          onPress: () => {
            setTimeout(() => setRequestSent(false), 3000);
          },
        },
      ]
    );
  };

  const handleShowNearestRescuePoint = () => {
    if (!nearestPoint) {
      Alert.alert(t('error'), t('unableToFindRescuePoint'));
      return;
    }

    console.log('Showing nearest rescue point:', nearestPoint);
    Alert.alert(
      t('nearestRescuePointTitle'),
      t('nearestRescuePointMessage', {
        name: nearestPoint.name,
        distance: nearestPoint.distance?.toFixed(2) || '0',
        latitude: nearestPoint.latitude.toFixed(6),
        longitude: nearestPoint.longitude.toFixed(6),
      }),
      [{ text: t('ok') }]
    );
  };

  const handleViewAllRescuePoints = () => {
    router.push('/(tabs)/(home)/all-rescue-points');
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Image
            source={require('@/assets/images/6bd4fef3-748f-40f9-8634-91fd29f4c449.png')}
            style={styles.loadingLogo}
            resizeMode="contain"
          />
          <ActivityIndicator size="large" color={colors.primary} style={styles.loadingSpinner} />
          <Text style={[styles.loadingText, isRTL && styles.rtlText]}>
            {t('gettingLocation')}
          </Text>
        </View>
      </View>
    );
  }

  if (errorMsg) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <IconSymbol
            ios_icon_name="exclamationmark.triangle.fill"
            android_material_icon_name="warning"
            size={64}
            color={colors.error}
          />
          <Text style={[styles.errorText, isRTL && styles.rtlText]}>{errorMsg}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={getCurrentLocation}>
            <Text style={styles.retryButtonText}>{t('retry')}</Text>
          </TouchableOpacity>
        </View>
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
        <Text style={[styles.title, isRTL && styles.rtlText]}>{t('quickFix')}</Text>
        <Text style={[styles.subtitle, isRTL && styles.rtlText]}>
          {t('emergencyRescueService')}
        </Text>
      </View>

      {location && (
        <View style={styles.locationCard}>
          <View style={styles.locationHeader}>
            <IconSymbol
              ios_icon_name="location.fill"
              android_material_icon_name="my-location"
              size={24}
              color={colors.primary}
            />
            <Text style={[styles.locationTitle, isRTL && styles.rtlText]}>
              {t('yourCurrentLocation')}
            </Text>
          </View>
          <View style={styles.locationDetails}>
            <View style={styles.locationRow}>
              <Text style={[styles.locationLabel, isRTL && styles.rtlText]}>
                {t('latitude')}:
              </Text>
              <Text style={[styles.locationValue, isRTL && styles.rtlText]}>
                {location.coords.latitude.toFixed(6)}
              </Text>
            </View>
            <View style={styles.locationRow}>
              <Text style={[styles.locationLabel, isRTL && styles.rtlText]}>
                {t('longitude')}:
              </Text>
              <Text style={[styles.locationValue, isRTL && styles.rtlText]}>
                {location.coords.longitude.toFixed(6)}
              </Text>
            </View>
            <View style={styles.locationRow}>
              <Text style={[styles.locationLabel, isRTL && styles.rtlText]}>
                {t('accuracy')}:
              </Text>
              <Text style={[styles.locationValue, isRTL && styles.rtlText]}>
                ±{location.coords.accuracy?.toFixed(0)}m
              </Text>
            </View>
          </View>
        </View>
      )}

      {nearestPoint && (
        <View style={styles.rescuePointCard}>
          <View style={styles.rescuePointHeader}>
            <IconSymbol
              ios_icon_name="mappin.circle.fill"
              android_material_icon_name="place"
              size={28}
              color={colors.accent}
            />
            <Text style={[styles.rescuePointTitle, isRTL && styles.rtlText]}>
              {t('nearestRescuePoint')}
            </Text>
          </View>
          <Text style={[styles.rescuePointName, isRTL && styles.rtlText]}>
            {nearestPoint.name}
          </Text>
          <View style={styles.distanceBadge}>
            <IconSymbol
              ios_icon_name="location.fill"
              android_material_icon_name="place"
              size={16}
              color={colors.card}
            />
            <Text style={styles.distanceText}>
              {nearestPoint.distance?.toFixed(2)} {t('kmAway')}
            </Text>
          </View>
        </View>
      )}

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.actionButton, styles.primaryButton]}
          onPress={handleShowNearestRescuePoint}
          disabled={!nearestPoint}
        >
          <IconSymbol
            ios_icon_name="map.fill"
            android_material_icon_name="map"
            size={24}
            color={colors.card}
          />
          <Text style={styles.actionButtonText}>{t('showNearestRescuePoint')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.secondaryButton]}
          onPress={handleViewAllRescuePoints}
        >
          <IconSymbol
            ios_icon_name="list.bullet"
            android_material_icon_name="list"
            size={24}
            color={colors.card}
          />
          <Text style={styles.actionButtonText}>{t('viewAllRescuePoints')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.actionButton,
            styles.emergencyButton,
            requestSent && styles.disabledButton,
          ]}
          onPress={handleSendLocationForRescue}
          disabled={!location || requestSent}
        >
          <IconSymbol
            ios_icon_name="phone.fill"
            android_material_icon_name="phone"
            size={24}
            color={colors.card}
          />
          <Text style={styles.actionButtonText}>
            {requestSent ? t('requestSent') : t('sendLocationForRescue')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.refreshButton} onPress={getCurrentLocation}>
          <IconSymbol
            ios_icon_name="arrow.clockwise"
            android_material_icon_name="refresh"
            size={20}
            color={colors.primary}
          />
          <Text style={styles.refreshButtonText}>{t('refreshLocation')}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.infoCard}>
        <Text style={[styles.infoTitle, isRTL && styles.rtlText]}>{t('howItWorks')}</Text>
        <View style={styles.infoItem}>
          <View style={styles.infoBulletContainer}>
            <Text style={styles.infoBullet}>1</Text>
          </View>
          <Text style={[styles.infoText, isRTL && styles.rtlText]}>
            {t('howItWorksStep1')}
          </Text>
        </View>
        <View style={styles.infoItem}>
          <View style={styles.infoBulletContainer}>
            <Text style={styles.infoBullet}>2</Text>
          </View>
          <Text style={[styles.infoText, isRTL && styles.rtlText]}>
            {t('howItWorksStep2')}
          </Text>
        </View>
        <View style={styles.infoItem}>
          <View style={styles.infoBulletContainer}>
            <Text style={styles.infoBullet}>3</Text>
          </View>
          <Text style={[styles.infoText, isRTL && styles.rtlText]}>
            {t('howItWorksStep3')}
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
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  loadingContainer: {
    alignItems: 'center',
  },
  loadingLogo: {
    width: 120,
    height: 120,
    marginBottom: 20,
  },
  loadingSpinner: {
    marginVertical: 16,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
  },
  errorContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.error,
    textAlign: 'center',
    fontWeight: '500',
  },
  retryButton: {
    marginTop: 24,
    backgroundColor: colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 12,
    boxShadow: '0px 4px 12px rgba(41, 98, 255, 0.3)',
    elevation: 4,
  },
  retryButtonText: {
    color: colors.card,
    fontSize: 16,
    fontWeight: '700',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoContainer: {
    marginBottom: 16,
    boxShadow: '0px 8px 24px rgba(41, 98, 255, 0.2)',
    elevation: 8,
    borderRadius: 28,
    backgroundColor: colors.card,
    padding: 8,
  },
  logo: {
    width: 120,
    height: 120,
  },
  title: {
    fontSize: 36,
    fontWeight: '900',
    color: colors.text,
    marginTop: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    marginTop: 6,
    fontWeight: '500',
  },
  locationCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.08)',
    elevation: 3,
    borderWidth: 1,
    borderColor: colors.border,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  locationTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginLeft: 10,
  },
  locationDetails: {
    gap: 10,
  },
  locationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  locationLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  locationValue: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '600',
  },
  rescuePointCard: {
    backgroundColor: colors.highlight,
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    boxShadow: '0px 4px 12px rgba(255, 107, 53, 0.15)',
    elevation: 3,
    borderWidth: 2,
    borderColor: colors.accent,
  },
  rescuePointHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  rescuePointTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginLeft: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  rescuePointName: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 12,
  },
  distanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.accent,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  distanceText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.card,
    marginLeft: 6,
  },
  buttonContainer: {
    marginBottom: 24,
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 14,
    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.12)',
    elevation: 4,
  },
  primaryButton: {
    backgroundColor: colors.primary,
  },
  secondaryButton: {
    backgroundColor: colors.secondary,
  },
  emergencyButton: {
    backgroundColor: colors.accent,
  },
  disabledButton: {
    backgroundColor: colors.success,
    opacity: 0.9,
  },
  actionButtonText: {
    color: colors.card,
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 10,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.primary,
    backgroundColor: 'transparent',
  },
  refreshButtonText: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: '700',
    marginLeft: 8,
  },
  infoCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 24,
    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.08)',
    elevation: 3,
    borderWidth: 1,
    borderColor: colors.border,
  },
  infoTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 20,
  },
  infoItem: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  infoBulletContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  infoBullet: {
    fontSize: 14,
    color: colors.card,
    fontWeight: '700',
  },
  infoText: {
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

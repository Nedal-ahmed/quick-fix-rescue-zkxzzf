
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import * as Location from 'expo-location';
import { IconSymbol } from '@/components/IconSymbol';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';

interface RescuePoint {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  distance?: number;
  address?: string;
  phone?: string;
}

const MOCK_RESCUE_POINTS: RescuePoint[] = [
  { 
    id: '1', 
    name: 'Cairo Central Rescue Station', 
    latitude: 30.0444, 
    longitude: 31.2357,
    address: 'Downtown Cairo, Egypt',
    phone: '+20 2 1234 5678'
  },
  { 
    id: '2', 
    name: 'Giza Emergency Center', 
    latitude: 30.0131, 
    longitude: 31.2089,
    address: 'Giza District, Egypt',
    phone: '+20 2 2345 6789'
  },
  { 
    id: '3', 
    name: 'Nasr City Quick Response', 
    latitude: 30.0626, 
    longitude: 31.3549,
    address: 'Nasr City, Cairo',
    phone: '+20 2 3456 7890'
  },
  { 
    id: '4', 
    name: 'Heliopolis Medical Response', 
    latitude: 30.0808, 
    longitude: 31.3239,
    address: 'Heliopolis, Cairo',
    phone: '+20 2 4567 8901'
  },
  { 
    id: '5', 
    name: 'Maadi Emergency Services', 
    latitude: 29.9602, 
    longitude: 31.2569,
    address: 'Maadi, Cairo',
    phone: '+20 2 5678 9012'
  },
  { 
    id: '6', 
    name: 'Alexandria Rescue Point', 
    latitude: 31.2001, 
    longitude: 29.9187,
    address: 'Alexandria, Egypt',
    phone: '+20 3 6789 0123'
  },
  { 
    id: '7', 
    name: 'Zamalek Emergency Unit', 
    latitude: 30.0618, 
    longitude: 31.2194,
    address: 'Zamalek, Cairo',
    phone: '+20 2 7890 1234'
  },
  { 
    id: '8', 
    name: '6th October City Response', 
    latitude: 29.9668, 
    longitude: 30.9376,
    address: '6th October City, Giza',
    phone: '+20 2 8901 2345'
  },
];

export default function AllRescuePointsScreen() {
  const { t, isRTL } = useLanguage();
  const { colors } = useTheme();
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [rescuePoints, setRescuePoints] = useState<RescuePoint[]>([]);

  useEffect(() => {
    loadRescuePoints();
  }, []);

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

  const loadRescuePoints = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status === 'granted') {
        const currentLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        
        setLocation(currentLocation);
        
        const pointsWithDistance = MOCK_RESCUE_POINTS.map(point => {
          const distance = calculateDistance(
            currentLocation.coords.latitude,
            currentLocation.coords.longitude,
            point.latitude,
            point.longitude
          );
          return { ...point, distance };
        });

        pointsWithDistance.sort((a, b) => (a.distance || 0) - (b.distance || 0));
        setRescuePoints(pointsWithDistance);
      } else {
        setRescuePoints(MOCK_RESCUE_POINTS);
      }
    } catch (error) {
      console.error('Error loading rescue points:', error);
      setRescuePoints(MOCK_RESCUE_POINTS);
    }
  };

  const styles = createStyles(colors);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <IconSymbol
            ios_icon_name="chevron.left"
            android_material_icon_name="arrow-back"
            size={24}
            color={colors.primary}
          />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, isRTL && styles.rtlText]}>
          {t('allRescuePoints')}
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.infoCard}>
          <IconSymbol
            ios_icon_name="info.circle.fill"
            android_material_icon_name="info"
            size={20}
            color={colors.primary}
          />
          <Text style={[styles.infoText, isRTL && styles.rtlText]}>
            {location 
              ? t('rescuePointsSortedByDistance') 
              : t('rescuePointsNotSorted')}
          </Text>
        </View>

        {rescuePoints.map((point, index) => (
          <View key={index} style={styles.pointCard}>
            <View style={styles.pointHeader}>
              <View style={styles.pointBadge}>
                <Text style={styles.pointNumber}>{index + 1}</Text>
              </View>
              <View style={styles.pointHeaderText}>
                <Text style={[styles.pointName, isRTL && styles.rtlText]}>
                  {point.name}
                </Text>
                {point.distance && (
                  <View style={styles.distanceContainer}>
                    <IconSymbol
                      ios_icon_name="location.fill"
                      android_material_icon_name="place"
                      size={14}
                      color={colors.accent}
                    />
                    <Text style={[styles.pointDistance, isRTL && styles.rtlText]}>
                      {point.distance.toFixed(2)} {t('kmAway')}
                    </Text>
                  </View>
                )}
              </View>
            </View>

            <View style={styles.pointDetails}>
              {point.address && (
                <View style={styles.detailRow}>
                  <IconSymbol
                    ios_icon_name="mappin.circle"
                    android_material_icon_name="location-on"
                    size={18}
                    color={colors.textSecondary}
                  />
                  <Text style={[styles.detailText, isRTL && styles.rtlText]}>
                    {point.address}
                  </Text>
                </View>
              )}

              {point.phone && (
                <View style={styles.detailRow}>
                  <IconSymbol
                    ios_icon_name="phone.fill"
                    android_material_icon_name="phone"
                    size={18}
                    color={colors.textSecondary}
                  />
                  <Text style={[styles.detailText, isRTL && styles.rtlText]}>
                    {point.phone}
                  </Text>
                </View>
              )}

              <View style={styles.detailRow}>
                <IconSymbol
                  ios_icon_name="location.circle"
                  android_material_icon_name="my-location"
                  size={18}
                  color={colors.textSecondary}
                />
                <Text style={[styles.detailText, isRTL && styles.rtlText]}>
                  {point.latitude.toFixed(4)}, {point.longitude.toFixed(4)}
                </Text>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'android' ? 48 : 60,
    paddingBottom: 16,
    paddingHorizontal: 20,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    boxShadow: `0px 2px 4px ${colors.shadow}`,
    elevation: 2,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: colors.background,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.highlight,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    marginLeft: 12,
    lineHeight: 20,
  },
  pointCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    boxShadow: `0px 4px 12px ${colors.shadow}`,
    elevation: 3,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pointHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  pointBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  pointNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.card,
  },
  pointHeaderText: {
    flex: 1,
  },
  pointName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 6,
  },
  distanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pointDistance: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.accent,
    marginLeft: 4,
  },
  pointDetails: {
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: 10,
    flex: 1,
  },
  rtlText: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
});

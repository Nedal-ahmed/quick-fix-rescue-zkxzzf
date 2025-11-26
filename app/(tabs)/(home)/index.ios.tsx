
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import * as Location from 'expo-location';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';

interface RescuePoint {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  distance?: number;
}

const MOCK_RESCUE_POINTS: RescuePoint[] = [
  { id: '1', name: 'Central Rescue Station', latitude: 40.7589, longitude: -73.9851 },
  { id: '2', name: 'North Emergency Center', latitude: 40.7829, longitude: -73.9654 },
  { id: '3', name: 'South Medical Response', latitude: 40.7489, longitude: -73.9680 },
  { id: '4', name: 'East Quick Response Unit', latitude: 40.7614, longitude: -73.9776 },
  { id: '5', name: 'West Emergency Services', latitude: 40.7580, longitude: -73.9855 },
];

export default function HomeScreen() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [nearestPoint, setNearestPoint] = useState<RescuePoint | null>(null);
  const [requestSent, setRequestSent] = useState<boolean>(false);

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      console.log('Requesting location permissions...');

      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
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
      setErrorMsg('Failed to get your location. Please try again.');
      setLoading(false);
    }
  };

  const calculateNearestRescuePoint = (currentLocation: Location.LocationObject) => {
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
  };

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

  const handleSendLocationForRescue = () => {
    if (!location) {
      Alert.alert('Error', 'Location not available. Please try again.');
      return;
    }

    console.log('Sending location for rescue:', location.coords);
    setRequestSent(true);

    Alert.alert(
      'Rescue Request Sent',
      `Your location has been sent to our emergency response team.\n\nLatitude: ${location.coords.latitude.toFixed(6)}\nLongitude: ${location.coords.longitude.toFixed(6)}\n\nA rescue vehicle will be dispatched shortly.`,
      [
        {
          text: 'OK',
          onPress: () => {
            setTimeout(() => setRequestSent(false), 3000);
          },
        },
      ]
    );
  };

  const handleShowNearestRescuePoint = () => {
    if (!nearestPoint) {
      Alert.alert('Error', 'Unable to find nearest rescue point. Please try again.');
      return;
    }

    console.log('Showing nearest rescue point:', nearestPoint);
    Alert.alert(
      'Nearest Rescue Point',
      `${nearestPoint.name}\n\nDistance: ${nearestPoint.distance?.toFixed(2)} km\n\nLatitude: ${nearestPoint.latitude.toFixed(6)}\nLongitude: ${nearestPoint.longitude.toFixed(6)}\n\nNote: react-native-maps is not supported in Natively. In a production app, this would show the location on a map.`,
      [{ text: 'OK' }]
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Getting your location...</Text>
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
          <Text style={styles.errorText}>{errorMsg}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={getCurrentLocation}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
      <View style={styles.header}>
        <IconSymbol
          ios_icon_name="cross.case.fill"
          android_material_icon_name="local-hospital"
          size={80}
          color={colors.primary}
        />
        <Text style={styles.title}>Quick Fix</Text>
        <Text style={styles.subtitle}>Emergency Rescue Service</Text>
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
            <Text style={styles.locationTitle}>Your Current Location</Text>
          </View>
          <Text style={styles.locationText}>
            Latitude: {location.coords.latitude.toFixed(6)}
          </Text>
          <Text style={styles.locationText}>
            Longitude: {location.coords.longitude.toFixed(6)}
          </Text>
          <Text style={styles.locationAccuracy}>
            Accuracy: ±{location.coords.accuracy?.toFixed(0)}m
          </Text>
        </View>
      )}

      {nearestPoint && (
        <View style={styles.rescuePointCard}>
          <View style={styles.rescuePointHeader}>
            <IconSymbol
              ios_icon_name="mappin.circle.fill"
              android_material_icon_name="place"
              size={24}
              color={colors.accent}
            />
            <Text style={styles.rescuePointTitle}>Nearest Rescue Point</Text>
          </View>
          <Text style={styles.rescuePointName}>{nearestPoint.name}</Text>
          <Text style={styles.rescuePointDistance}>
            Distance: {nearestPoint.distance?.toFixed(2)} km away
          </Text>
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
          <Text style={styles.actionButtonText}>Show Nearest Rescue Point</Text>
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
            {requestSent ? 'Request Sent!' : 'Send Location for Rescue'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.refreshButton} onPress={getCurrentLocation}>
          <IconSymbol
            ios_icon_name="arrow.clockwise"
            android_material_icon_name="refresh"
            size={20}
            color={colors.primary}
          />
          <Text style={styles.refreshButtonText}>Refresh Location</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>How It Works</Text>
        <View style={styles.infoItem}>
          <Text style={styles.infoBullet}>•</Text>
          <Text style={styles.infoText}>
            Your GPS location is automatically detected when you open the app
          </Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoBullet}>•</Text>
          <Text style={styles.infoText}>
            View the nearest rescue point and its distance from your location
          </Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoBullet}>•</Text>
          <Text style={styles.infoText}>
            Send your location to dispatch a rescue vehicle in emergencies
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
    borderRadius: 8,
  },
  retryButtonText: {
    color: colors.card,
    fontSize: 16,
    fontWeight: '600',
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
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 4,
  },
  locationCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  locationTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginLeft: 8,
  },
  locationText: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 4,
  },
  locationAccuracy: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  rescuePointCard: {
    backgroundColor: colors.highlight,
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  rescuePointHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  rescuePointTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginLeft: 8,
  },
  rescuePointName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  rescuePointDistance: {
    fontSize: 14,
    color: colors.text,
  },
  buttonContainer: {
    marginBottom: 24,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButton: {
    backgroundColor: colors.primary,
  },
  emergencyButton: {
    backgroundColor: colors.accent,
  },
  disabledButton: {
    backgroundColor: colors.success,
    opacity: 0.8,
  },
  actionButtonText: {
    color: colors.card,
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.primary,
    backgroundColor: 'transparent',
  },
  refreshButtonText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  infoCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  infoItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  infoBullet: {
    fontSize: 16,
    color: colors.primary,
    marginRight: 8,
    fontWeight: '700',
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
});

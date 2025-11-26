
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';

export default function ProfileScreen() {
  return (
    <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
      <View style={styles.header}>
        <IconSymbol
          ios_icon_name="person.circle.fill"
          android_material_icon_name="account-circle"
          size={100}
          color={colors.primary}
        />
        <Text style={styles.title}>Profile</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>About Quick Fix</Text>
        <Text style={styles.cardText}>
          Quick Fix is your emergency rescue companion. We use GPS technology to locate you and connect you with the nearest rescue services.
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
          <View style={styles.featureTextContainer}>
            <Text style={styles.featureTitle}>Real-time Location</Text>
            <Text style={styles.featureText}>
              Accurate GPS tracking to pinpoint your exact location
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
          <View style={styles.featureTextContainer}>
            <Text style={styles.featureTitle}>Nearest Rescue Points</Text>
            <Text style={styles.featureText}>
              Find the closest emergency rescue station to your location
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
          <View style={styles.featureTextContainer}>
            <Text style={styles.featureTitle}>Emergency Dispatch</Text>
            <Text style={styles.featureText}>
              Send your location to dispatch a rescue vehicle instantly
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>App Information</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Version:</Text>
          <Text style={styles.infoValue}>1.0.0</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Platform:</Text>
          <Text style={styles.infoValue}>iOS</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Emergency Tips</Text>
        <View style={styles.tipItem}>
          <Text style={styles.tipBullet}>•</Text>
          <Text style={styles.tipText}>
            Always keep your location services enabled for faster response
          </Text>
        </View>
        <View style={styles.tipItem}>
          <Text style={styles.tipBullet}>•</Text>
          <Text style={styles.tipText}>
            Ensure you have a stable internet connection for real-time updates
          </Text>
        </View>
        <View style={styles.tipItem}>
          <Text style={styles.tipBullet}>•</Text>
          <Text style={styles.tipText}>
            In case of emergency, use the &quot;Send Location for Rescue&quot; button immediately
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
    elevation: 3,
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
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  featureTextContainer: {
    flex: 1,
    marginLeft: 12,
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
});

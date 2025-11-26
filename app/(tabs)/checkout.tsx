
import React from 'react';
import { View, Text, StyleSheet, ScrollView, Platform } from 'react-native';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';

export default function CheckoutScreen() {
  return (
    <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
      <View style={styles.container}>
        <IconSymbol
          ios_icon_name="cart.fill"
          android_material_icon_name="shopping-cart"
          size={60}
          color={colors.primary}
        />
        <Text style={styles.title}>Checkout</Text>
        <Text style={styles.message}>
          Checkout is only available on native platforms (iOS and Android).
        </Text>
        <Text style={styles.submessage}>
          Please use the mobile app to complete your purchase.
        </Text>
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
    flexGrow: 1,
    paddingTop: Platform.OS === 'android' ? 48 : 20,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
    marginTop: 16,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 16,
    textAlign: 'center',
  },
  submessage: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },
});


import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { IconSymbol } from './IconSymbol';
import { colors } from '@/styles/commonStyles';

interface PaymentStatusBadgeProps {
  status: string;
  size?: 'small' | 'medium' | 'large';
}

export function PaymentStatusBadge({ status, size = 'medium' }: PaymentStatusBadgeProps) {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'succeeded':
        return colors.success;
      case 'processing':
        return colors.primary;
      case 'requires_action':
      case 'requires_payment_method':
        return colors.accent;
      case 'failed':
      case 'canceled':
        return colors.error;
      default:
        return colors.textSecondary;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'succeeded':
        return {
          ios: 'checkmark.circle.fill',
          android: 'check-circle',
        };
      case 'processing':
        return {
          ios: 'clock.fill',
          android: 'schedule',
        };
      case 'requires_action':
      case 'requires_payment_method':
        return {
          ios: 'exclamationmark.circle.fill',
          android: 'error',
        };
      case 'failed':
      case 'canceled':
        return {
          ios: 'xmark.circle.fill',
          android: 'cancel',
        };
      default:
        return {
          ios: 'circle.fill',
          android: 'circle',
        };
    }
  };

  const getStatusLabel = (status: string) => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const statusColor = getStatusColor(status);
  const statusIcon = getStatusIcon(status);
  const statusLabel = getStatusLabel(status);

  const sizeStyles = {
    small: {
      padding: 4,
      iconSize: 12,
      fontSize: 10,
    },
    medium: {
      padding: 8,
      iconSize: 16,
      fontSize: 12,
    },
    large: {
      padding: 12,
      iconSize: 20,
      fontSize: 14,
    },
  };

  const currentSize = sizeStyles[size];

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: `${statusColor}20`,
          paddingHorizontal: currentSize.padding * 1.5,
          paddingVertical: currentSize.padding,
        },
      ]}
    >
      <IconSymbol
        ios_icon_name={statusIcon.ios}
        android_material_icon_name={statusIcon.android}
        size={currentSize.iconSize}
        color={statusColor}
      />
      <Text
        style={[
          styles.text,
          {
            color: statusColor,
            fontSize: currentSize.fontSize,
            marginLeft: currentSize.padding / 2,
          },
        ]}
      >
        {statusLabel}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
  },
  text: {
    fontWeight: '600',
  },
});

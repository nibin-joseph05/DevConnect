import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';

interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  padding?: number;
  margin?: number;
  elevation?: number;
  borderRadius?: number;
  backgroundColor?: string;
}

interface CardHeaderProps {
  title: string;
  subtitle?: string;
  rightComponent?: React.ReactNode;
  onPress?: () => void;
}

interface CardContentProps {
  children: React.ReactNode;
}

interface CardActionsProps {
  children: React.ReactNode;
  justifyContent?: 'flex-start' | 'center' | 'flex-end' | 'space-between';
}

/**
 * Reusable card component for displaying content in a consistent format
 * Supports touch interactions and customizable styling
 */
const Card: React.FC<CardProps> = ({
  children,
  onPress,
  style,
  padding = 16,
  margin = 8,
  elevation = 2,
  borderRadius = 8,
  backgroundColor = '#FFFFFF',
}) => {
  const cardStyle = [
    styles.card,
    {
      padding,
      margin,
      elevation,
      borderRadius,
      backgroundColor,
    },
    style,
  ];

  if (onPress) {
    return (
      <TouchableOpacity style={cardStyle} onPress={onPress} activeOpacity={0.7}>
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={cardStyle}>{children}</View>;
};

/**
 * Card header component with title, subtitle, and optional right component
 */
export const CardHeader: React.FC<CardHeaderProps> = ({
  title,
  subtitle,
  rightComponent,
  onPress,
}) => {
  return (
    <View style={styles.header}>
      <View style={styles.headerContent}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        {subtitle && (
          <Text style={styles.subtitle} numberOfLines={2}>
            {subtitle}
          </Text>
        )}
      </View>
      {rightComponent && (
        <View style={styles.rightComponent}>
          {rightComponent}
        </View>
      )}
      {onPress && (
        <TouchableOpacity onPress={onPress} style={styles.chevron}>
          <Ionicons name="chevron-forward" size={20} color="#6C757D" />
        </TouchableOpacity>
      )}
    </View>
  );
};

/**
 * Card content component for the main content area
 */
export const CardContent: React.FC<CardContentProps> = ({ children }) => {
  return <View style={styles.content}>{children}</View>;
};

/**
 * Card actions component for buttons and action items
 */
export const CardActions: React.FC<CardActionsProps> = ({
  children,
  justifyContent = 'flex-end',
}) => {
  return (
    <View style={[styles.actions, { justifyContent }]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 14,
    color: '#6C757D',
  },
  rightComponent: {
    marginLeft: 8,
  },
  chevron: {
    marginLeft: 8,
    padding: 4,
  },
  content: {
    marginBottom: 8,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});

export default Card;
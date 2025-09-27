import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useDispatch } from 'react-redux';
import { logoutUser } from '../../redux/slices/authSlice';
import { AppDispatch } from '../../redux/store';

interface HeaderProps {
  title: string;
  showBackButton?: boolean;
  onBackPress?: () => void;
  rightComponent?: React.ReactNode;
  backgroundColor?: string;
  textColor?: string;
  showLogout?: boolean;
}

/**
 * Reusable header component for consistent navigation across the app
 * Provides back button, title, and optional right component
 */
const Header: React.FC<HeaderProps> = ({
  title,
  showBackButton = false,
  onBackPress,
  rightComponent,
  backgroundColor = '#007AFF',
  textColor = '#FFFFFF',
  showLogout = false,
}) => {
  const router = useRouter();
  const dispatch: AppDispatch = useDispatch();

  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      router.back();
    }
  };

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      router.replace('/login' as any);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={backgroundColor} />
      <View style={[styles.header, { backgroundColor }]}>
        <View style={styles.leftSection}>
          {showBackButton && (
            <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color={textColor} />
            </TouchableOpacity>
          )}
        </View>
        
        <View style={styles.centerSection}>
          <Text style={[styles.title, { color: textColor }]} numberOfLines={1}>
            {title}
          </Text>
        </View>
        
        <View style={styles.rightSection}>
          {showLogout && (
            <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
              <Ionicons name="log-out-outline" size={24} color={textColor} />
            </TouchableOpacity>
          )}
          {rightComponent}
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  header: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  leftSection: {
    width: 60,
    alignItems: 'flex-start',
  },
  centerSection: {
    flex: 1,
    alignItems: 'center',
  },
  rightSection: {
    width: 60,
    alignItems: 'flex-end',
  },
  backButton: {
    padding: 8,
  },
  logoutButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default Header;
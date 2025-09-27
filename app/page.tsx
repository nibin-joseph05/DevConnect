import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser, setToken, setUser } from '../redux/slices/authSlice';
import { AppDispatch, RootState } from '../redux/store';
import Button from './components/Button';

/**
 * Main app entry point
 * Handles authentication state and routing
 * Integrates with Redux store for state management
 */
const HomePage: React.FC = () => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  
  // Redux state
  const { isAuthenticated, user, token } = useSelector((state: RootState) => state.auth);
  
  // Local state
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Check authentication status on app start
   */
  const checkAuthStatus = async () => {
    try {
      // Check if user is already authenticated
      if (isAuthenticated && user && token) {
        router.replace('/dashboard');
        return;
      }

      // Try to restore authentication from AsyncStorage
      const storedToken = await AsyncStorage.getItem('authToken');
      const storedUser = await AsyncStorage.getItem('authUser');

      if (storedToken && storedUser) {
        // Restore user data and token
        const userData = JSON.parse(storedUser);
        dispatch(setUser(userData));
        dispatch(setToken(storedToken));
        
      // Navigate to dashboard
      router.replace('/dashboard' as any);
      } else {
        // No stored authentication, go to login
        router.replace('/login' as any);
      }
    } catch (error) {
      console.error('Auth check error:', error);
      // On error, go to login
      router.replace('/login' as any);
    } finally {
      setIsLoading(false);
    }
  };

  // Check authentication on component mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Handle authentication state changes
  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        router.replace('/dashboard' as any);
      } else {
        router.replace('/login' as any);
      }
    }
  }, [isAuthenticated, isLoading, router]);

  /**
   * Handle logout from loading screen
   */
  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      router.replace('/login' as any);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Show loading screen while checking authentication
  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContent}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>DevConnect</Text>
          <Text style={styles.loadingSubtext}>Loading your CRM...</Text>
          <Button
            title="Logout"
            onPress={handleLogout}
            variant="danger"
            size="small"
            style={styles.logoutButton}
          />
        </View>
      </View>
    );
  }

  // This component should not render anything as navigation is handled by useEffect
  return null;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
    marginTop: 16,
    marginBottom: 8,
  },
  loadingSubtext: {
    fontSize: 16,
    color: '#6C757D',
    textAlign: 'center',
  },
  logoutButton: {
    marginTop: 20,
  },
});

export default HomePage;
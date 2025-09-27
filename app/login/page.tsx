import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { clearError, loginUser } from '../../redux/slices/authSlice';
import { AppDispatch, RootState } from '../../redux/store';
import Button from '../components/Button';
import Card from '../components/Card';
import Header from '../components/Header';
import Input from '../components/Input';

/**
 * Login page component
 * Handles user authentication with email and password
 * Integrates with Redux store for state management
 */
const LoginPage: React.FC = () => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  
  // Redux state
  const { loading, error, isAuthenticated } = useSelector((state: RootState) => state.auth);
  
  // Local state
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/dashboard' as any);
    }
  }, [isAuthenticated, router]);

  // Clear errors when component mounts
  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  /**
   * Validate form inputs
   */
  const validateForm = (): boolean => {
    const errors: {[key: string]: string} = {};

    // Email validation
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  /**
   * Handle form input changes
   */
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error for this field when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  /**
   * Handle login form submission
   */
  const handleLogin = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      // Clear any previous errors
      dispatch(clearError());
      
      // Attempt login
      await dispatch(loginUser({
        email: formData.email.trim(),
        password: formData.password,
      })).unwrap();

      // Success - navigation handled by useEffect
      Alert.alert('Success', 'Login successful!');
    } catch (error) {
      // Error handling is done by Redux
      console.error('Login error:', error);
    }
  };

  /**
   * Navigate to register page
   */
  const handleRegister = () => {
    router.push('/register' as any);
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Header title="DevConnect Login" />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          <Card style={styles.loginCard}>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in to your DevConnect account</Text>
            
            <View style={styles.form}>
              <Input
                label="Email Address"
                placeholder="Enter your email"
                value={formData.email}
                onChangeText={(value) => handleInputChange('email', value)}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                error={formErrors.email}
                leftIcon="mail"
                required
              />
              
              <Input
                label="Password"
                placeholder="Enter your password"
                value={formData.password}
                onChangeText={(value) => handleInputChange('password', value)}
                secureTextEntry
                error={formErrors.password}
                leftIcon="lock-closed"
                required
              />
              
              {error && (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}
              
              <Button
                title="Sign In"
                onPress={handleLogin}
                loading={loading}
                disabled={loading}
                style={styles.loginButton}
              />
            </View>
          </Card>
          
          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account?</Text>
            <Button
              title="Create Account"
              onPress={handleRegister}
              variant="outline"
              size="small"
            />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  loginCard: {
    padding: 24,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#212529',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6C757D',
    textAlign: 'center',
    marginBottom: 32,
  },
  form: {
    gap: 16,
  },
  errorContainer: {
    backgroundColor: '#F8D7DA',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#F5C6CB',
  },
  errorText: {
    color: '#721C24',
    fontSize: 14,
    textAlign: 'center',
  },
  loginButton: {
    marginTop: 8,
  },
  footer: {
    alignItems: 'center',
    gap: 12,
  },
  footerText: {
    fontSize: 16,
    color: '#6C757D',
  },
});

export default LoginPage;
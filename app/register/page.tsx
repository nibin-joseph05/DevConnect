import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { clearError, logoutUser, registerUser } from '../../redux/slices/authSlice';
import { AppDispatch, RootState } from '../../redux/store';
import Button from '../components/Button';
import Card from '../components/Card';
import Header from '../components/Header';
import Input from '../components/Input';

/**
 * Register page component
 * Handles user registration with comprehensive form validation
 * Integrates with Redux store for state management
 */
const RegisterPage: React.FC = () => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  
  // Redux state
  const { loading, error, isAuthenticated } = useSelector((state: RootState) => state.auth);
  
  // Local state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    company: '',
  });
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});
  const [passwordStrength, setPasswordStrength] = useState<{isValid: boolean; message: string}>({isValid: false, message: ''});

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [isAuthenticated, router]);

  // Clear errors when component mounts
  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  // Check password strength when password changes
  useEffect(() => {
    if (formData.password) {
      const strength = validatePasswordStrength(formData.password);
      setPasswordStrength(strength);
    } else {
      setPasswordStrength({isValid: false, message: ''});
    }
  }, [formData.password]);

  /**
   * Validate password strength
   */
  const validatePasswordStrength = (password: string): {isValid: boolean; message: string} => {
    if (password.length < 8) {
      return { isValid: false, message: 'Password must be at least 8 characters long' };
    }
    
    if (!/(?=.*[a-z])/.test(password)) {
      return { isValid: false, message: 'Password must contain at least one lowercase letter' };
    }
    
    if (!/(?=.*[A-Z])/.test(password)) {
      return { isValid: false, message: 'Password must contain at least one uppercase letter' };
    }
    
    if (!/(?=.*\d)/.test(password)) {
      return { isValid: false, message: 'Password must contain at least one number' };
    }
    
    return { isValid: true, message: 'Password is strong' };
  };

  /**
   * Validate form inputs
   */
  const validateForm = (): boolean => {
    const errors: {[key: string]: string} = {};

    // Name validation
    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }

    // Email validation
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (!passwordStrength.isValid) {
      errors.password = passwordStrength.message;
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    // Company validation (optional)
    if (formData.company && formData.company.trim().length < 2) {
      errors.company = 'Company name must be at least 2 characters';
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
   * Handle register form submission
   */
  const handleRegister = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      // Clear any previous errors
      dispatch(clearError());
      
      // Prepare registration data
      const registrationData = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        company: formData.company.trim() || undefined,
      };
      
      // Attempt registration
      await dispatch(registerUser(registrationData)).unwrap();

      // Success - show success message and redirect to login
      Alert.alert(
        'Registration Successful', 
        'Your account has been created successfully. Please sign in.',
        [
          {
            text: 'OK',
            onPress: () => router.replace('/login'),
          },
        ]
      );
    } catch (error) {
      // Error handling is done by Redux
      console.error('Registration error:', error);
    }
  };

  /**
   * Navigate to login page
   */
  const handleLogin = () => {
    router.push('/login');
  };

  /**
   * Handle logout (if user is already logged in)
   */
  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      Alert.alert('Success', 'Logged out successfully!');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Header title="DevConnect Register" showBackButton onBackPress={handleLogin} />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          <Card style={styles.registerCard}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join DevConnect and start managing your customers</Text>
            
            <View style={styles.form}>
              <Input
                label="Full Name"
                placeholder="Enter your full name"
                value={formData.name}
                onChangeText={(value) => handleInputChange('name', value)}
                error={formErrors.name}
                leftIcon="person"
                required
              />
              
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
                placeholder="Create a strong password"
                value={formData.password}
                onChangeText={(value) => handleInputChange('password', value)}
                secureTextEntry
                error={formErrors.password}
                leftIcon="lock-closed"
                required
              />
              
              {formData.password && passwordStrength.message && (
                <Text style={[
                  styles.passwordStrength,
                  { color: passwordStrength.isValid ? '#28A745' : '#DC3545' }
                ]}>
                  {passwordStrength.message}
                </Text>
              )}
              
              <Input
                label="Confirm Password"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChangeText={(value) => handleInputChange('confirmPassword', value)}
                secureTextEntry
                error={formErrors.confirmPassword}
                leftIcon="lock-closed"
                required
              />
              
              <Input
                label="Company (Optional)"
                placeholder="Enter your company name"
                value={formData.company}
                onChangeText={(value) => handleInputChange('company', value)}
                error={formErrors.company}
                leftIcon="business"
              />
              
              {error && (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}
              
              <Button
                title="Create Account"
                onPress={handleRegister}
                loading={loading}
                disabled={loading}
                style={styles.registerButton}
              />
            </View>
          </Card>
          
          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account?</Text>
            <Button
              title="Sign In"
              onPress={handleLogin}
              variant="outline"
              size="small"
            />
            {isAuthenticated && (
              <Button
                title="Logout"
                onPress={handleLogout}
                variant="danger"
                size="small"
                style={styles.logoutButton}
              />
            )}
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
  registerCard: {
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
  passwordStrength: {
    fontSize: 12,
    marginTop: -8,
    marginBottom: 8,
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
  registerButton: {
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
  logoutButton: {
    marginTop: 8,
  },
});

export default RegisterPage;
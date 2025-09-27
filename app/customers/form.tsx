import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { createCustomer, fetchCustomerById, updateCustomer } from '../../redux/slices/customerSlice';
import { AppDispatch, RootState } from '../../redux/store';
import Button from '../components/Button';
import Card from '../components/Card';
import Header from '../components/Header';
import Input from '../components/Input';

/**
 * Customer form page component
 * Handles both creating new customers and editing existing ones
 * Integrates with Redux store for state management
 */
const CustomerFormPage: React.FC = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const dispatch = useDispatch<AppDispatch>();
  
  // Redux state
  const { currentCustomer, loading } = useSelector((state: RootState) => state.customers);
  
  // Local state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
  });
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditing = !!id;

  // Load customer data if editing
  useEffect(() => {
    if (isEditing && id) {
      dispatch(fetchCustomerById(id));
    }
  }, [isEditing, id, dispatch]);

  // Populate form when customer data is loaded
  useEffect(() => {
    if (currentCustomer && isEditing) {
      setFormData({
        name: currentCustomer.name,
        email: currentCustomer.email,
        phone: currentCustomer.phone,
        company: currentCustomer.company,
      });
    }
  }, [currentCustomer, isEditing]);

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
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errors.email = 'Please enter a valid email address';
    }

    // Phone validation
    if (!formData.phone.trim()) {
      errors.phone = 'Phone number is required';
    } else if (!/^[\+]?[1-9][\d]{0,15}$/.test(formData.phone.replace(/\s/g, ''))) {
      errors.phone = 'Please enter a valid phone number';
    }

    // Company validation
    if (!formData.company.trim()) {
      errors.company = 'Company is required';
    } else if (formData.company.trim().length < 2) {
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
   * Handle form submission
   */
  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const customerData = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        company: formData.company.trim(),
      };

      if (isEditing && id) {
        // Update existing customer
        await dispatch(updateCustomer({ id, ...customerData })).unwrap();
        Alert.alert('Success', 'Customer updated successfully!');
      } else {
        // Create new customer
        await dispatch(createCustomer(customerData)).unwrap();
        Alert.alert('Success', 'Customer created successfully!');
      }

      // Navigate back to customers list
      router.back();
    } catch (error) {
      Alert.alert('Error', 'Failed to save customer. Please try again.');
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Handle cancel
   */
  const handleCancel = () => {
    if (isSubmitting) return;
    
    Alert.alert(
      'Cancel',
      'Are you sure you want to cancel? Any unsaved changes will be lost.',
      [
        { text: 'Keep Editing', style: 'cancel' },
        { text: 'Discard Changes', style: 'destructive', onPress: () => router.back() },
      ]
    );
  };

  if (loading && isEditing) {
    return (
      <View style={styles.container}>
        <Header title={isEditing ? 'Edit Customer' : 'Add Customer'} showBackButton />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading customer...</Text>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Header 
        title={isEditing ? 'Edit Customer' : 'Add Customer'} 
        showBackButton 
        onBackPress={handleCancel}
      />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          <Card style={styles.formCard}>
            <Text style={styles.formTitle}>
              {isEditing ? 'Edit Customer Information' : 'Customer Information'}
            </Text>
            <Text style={styles.formSubtitle}>
              {isEditing ? 'Update the customer details below' : 'Enter the customer details below'}
            </Text>
            
            <View style={styles.form}>
              <Input
                label="Full Name"
                placeholder="Enter customer's full name"
                value={formData.name}
                onChangeText={(value) => handleInputChange('name', value)}
                error={formErrors.name}
                leftIcon="person"
                required
              />
              
              <Input
                label="Email Address"
                placeholder="Enter customer's email"
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
                label="Phone Number"
                placeholder="Enter customer's phone number"
                value={formData.phone}
                onChangeText={(value) => handleInputChange('phone', value)}
                keyboardType="phone-pad"
                error={formErrors.phone}
                leftIcon="call"
                required
              />
              
              <Input
                label="Company"
                placeholder="Enter customer's company"
                value={formData.company}
                onChangeText={(value) => handleInputChange('company', value)}
                error={formErrors.company}
                leftIcon="business"
                required
              />
            </View>
          </Card>
          
          <View style={styles.actions}>
            <Button
              title="Cancel"
              onPress={handleCancel}
              variant="outline"
              disabled={isSubmitting}
              style={styles.cancelButton}
            />
            <Button
              title={isEditing ? 'Update Customer' : 'Create Customer'}
              onPress={handleSubmit}
              loading={isSubmitting}
              disabled={isSubmitting}
              style={styles.submitButton}
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
  },
  content: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#6C757D',
  },
  formCard: {
    padding: 24,
    marginBottom: 20,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 8,
  },
  formSubtitle: {
    fontSize: 14,
    color: '#6C757D',
    marginBottom: 24,
  },
  form: {
    gap: 16,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  cancelButton: {
    flex: 1,
  },
  submitButton: {
    flex: 2,
  },
});

export default CustomerFormPage;
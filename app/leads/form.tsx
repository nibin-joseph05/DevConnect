import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCustomers } from '../../redux/slices/customerSlice';
import { createLead, fetchLeadById, updateLead } from '../../redux/slices/leadSlice';
import { AppDispatch, RootState } from '../../redux/store';
import Button from '../components/Button';
import Card from '../components/Card';
import Header from '../components/Header';
import Input from '../components/Input';

/**
 * Lead form page component
 * Handles both creating new leads and editing existing ones
 * Integrates with Redux store for state management
 */
const LeadFormPage: React.FC = () => {
  const router = useRouter();
  const { id, customerId } = useLocalSearchParams<{ id?: string; customerId?: string }>();
  const dispatch = useDispatch<AppDispatch>();
  
  // Redux state
  const { currentLead, loading: leadLoading } = useSelector((state: RootState) => state.leads);
  const { customers } = useSelector((state: RootState) => state.customers);
  
  // Local state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'New' as 'New' | 'Contacted' | 'Converted' | 'Lost',
    value: '',
    customerId: customerId || '',
  });
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditing = !!id;
  const statusOptions = ['New', 'Contacted', 'Converted', 'Lost'];

  // Load lead data if editing
  useEffect(() => {
    if (isEditing && id) {
      dispatch(fetchLeadById(id));
    }
  }, [isEditing, id, dispatch]);

  // Load customers for dropdown
  useEffect(() => {
    dispatch(fetchCustomers({ limit: 100 }));
  }, [dispatch]);

  // Populate form when lead data is loaded
  useEffect(() => {
    if (currentLead && isEditing) {
      setFormData({
        title: currentLead.title,
        description: currentLead.description,
        status: currentLead.status,
        value: currentLead.value.toString(),
        customerId: currentLead.customerId,
      });
    }
  }, [currentLead, isEditing]);

  /**
   * Validate form inputs
   */
  const validateForm = (): boolean => {
    const errors: {[key: string]: string} = {};

    // Title validation
    if (!formData.title.trim()) {
      errors.title = 'Title is required';
    } else if (formData.title.trim().length < 3) {
      errors.title = 'Title must be at least 3 characters';
    }

    // Description validation
    if (!formData.description.trim()) {
      errors.description = 'Description is required';
    } else if (formData.description.trim().length < 10) {
      errors.description = 'Description must be at least 10 characters';
    }

    // Status validation
    if (!formData.status) {
      errors.status = 'Status is required';
    }

    // Value validation
    if (!formData.value.trim()) {
      errors.value = 'Value is required';
    } else {
      const value = parseFloat(formData.value);
      if (isNaN(value) || value < 0) {
        errors.value = 'Value must be a positive number';
      }
    }

    // Customer validation
    if (!formData.customerId) {
      errors.customerId = 'Customer is required';
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
      const leadData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        status: formData.status,
        value: parseFloat(formData.value),
        customerId: formData.customerId,
      };

      if (isEditing && id) {
        // Update existing lead
        await dispatch(updateLead({ id, ...leadData })).unwrap();
        Alert.alert('Success', 'Lead updated successfully!');
      } else {
        // Create new lead
        await dispatch(createLead(leadData)).unwrap();
        Alert.alert('Success', 'Lead created successfully!');
      }

      // Navigate back to leads list
      router.back();
    } catch (error) {
      Alert.alert('Error', 'Failed to save lead. Please try again.');
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

  if (leadLoading && isEditing) {
    return (
      <View style={styles.container}>
        <Header title={isEditing ? 'Edit Lead' : 'Add Lead'} showBackButton />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading lead...</Text>
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
        title={isEditing ? 'Edit Lead' : 'Add Lead'} 
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
              {isEditing ? 'Edit Lead Information' : 'Lead Information'}
            </Text>
            <Text style={styles.formSubtitle}>
              {isEditing ? 'Update the lead details below' : 'Enter the lead details below'}
            </Text>
            
            <View style={styles.form}>
              <Input
                label="Lead Title"
                placeholder="Enter lead title"
                value={formData.title}
                onChangeText={(value) => handleInputChange('title', value)}
                error={formErrors.title}
                leftIcon="document-text"
                required
              />
              
              <Input
                label="Description"
                placeholder="Enter lead description"
                value={formData.description}
                onChangeText={(value) => handleInputChange('description', value)}
                multiline
                numberOfLines={4}
                error={formErrors.description}
                leftIcon="information-circle"
                required
              />
              
              <View style={styles.statusContainer}>
                <Text style={styles.statusLabel}>Status *</Text>
                <View style={styles.statusOptions}>
                  {statusOptions.map((status) => (
                    <Button
                      key={status}
                      title={status}
                      onPress={() => handleInputChange('status', status)}
                      variant={formData.status === status ? 'primary' : 'outline'}
                      size="small"
                      style={styles.statusButton}
                    />
                  ))}
                </View>
                {formErrors.status && (
                  <Text style={styles.errorText}>{formErrors.status}</Text>
                )}
              </View>
              
              <Input
                label="Value ($)"
                placeholder="Enter lead value"
                value={formData.value}
                onChangeText={(value) => handleInputChange('value', value)}
                keyboardType="numeric"
                error={formErrors.value}
                leftIcon="cash"
                required
              />
              
              <View style={styles.customerContainer}>
                <Text style={styles.customerLabel}>Customer *</Text>
                <View style={styles.customerList}>
                  {customers.map((customer) => (
                    <Button
                      key={customer.id}
                      title={customer.name}
                      onPress={() => handleInputChange('customerId', customer.id)}
                      variant={formData.customerId === customer.id ? 'primary' : 'outline'}
                      size="small"
                      style={styles.customerButton}
                    />
                  ))}
                </View>
                {formErrors.customerId && (
                  <Text style={styles.errorText}>{formErrors.customerId}</Text>
                )}
              </View>
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
              title={isEditing ? 'Update Lead' : 'Create Lead'}
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
  statusContainer: {
    marginBottom: 8,
  },
  statusLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#212529',
    marginBottom: 8,
  },
  statusOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statusButton: {
    flex: 1,
    minWidth: 80,
  },
  customerContainer: {
    marginBottom: 8,
  },
  customerLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#212529',
    marginBottom: 8,
  },
  customerList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  customerButton: {
    flex: 1,
    minWidth: 120,
  },
  errorText: {
    fontSize: 12,
    color: '#DC3545',
    marginTop: 4,
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

export default LeadFormPage;
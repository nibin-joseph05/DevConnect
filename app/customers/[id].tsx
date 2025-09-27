import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { deleteCustomer, fetchCustomerById } from '../../redux/slices/customerSlice';
import { fetchLeads } from '../../redux/slices/leadSlice';
import { AppDispatch, RootState } from '../../redux/store';
import Button from '../components/Button';
import Card, { CardActions, CardContent } from '../components/Card';
import Header from '../components/Header';

/**
 * Customer details page component
 * Displays customer information and associated leads
 * Integrates with Redux store for state management
 */
const CustomerDetailsPage: React.FC = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const dispatch = useDispatch<AppDispatch>();
  
  // Redux state
  const { currentCustomer, loading: customerLoading, error: customerError } = useSelector((state: RootState) => state.customers);
  const { leads, loading: leadsLoading } = useSelector((state: RootState) => state.leads);
  
  // Local state
  const [refreshing, setRefreshing] = useState(false);

  /**
   * Load customer data
   */
  const loadCustomer = async () => {
    if (!id) return;
    
    try {
      await dispatch(fetchCustomerById(id)).unwrap();
    } catch (err) {
      console.error('Failed to load customer:', err);
    }
  };

  /**
   * Load customer leads
   */
  const loadLeads = async () => {
    if (!id) return;
    
    try {
      await dispatch(fetchLeads({ customerId: id, limit: 10 })).unwrap();
    } catch (err) {
      console.error('Failed to load leads:', err);
    }
  };

  /**
   * Handle refresh
   */
  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadCustomer(), loadLeads()]);
    setRefreshing(false);
  };

  /**
   * Handle edit customer
   */
  const handleEditCustomer = () => {
    router.push(`/customers/form?id=${id}`);
  };

  /**
   * Handle delete customer
   */
  const handleDeleteCustomer = () => {
    if (!currentCustomer) return;
    
    Alert.alert(
      'Delete Customer',
      `Are you sure you want to delete ${currentCustomer.name}? This will also delete all associated leads.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await dispatch(deleteCustomer(id!)).unwrap();
              router.back();
            } catch (err) {
              Alert.alert('Error', 'Failed to delete customer');
            }
          },
        },
      ]
    );
  };

  /**
   * Handle add lead
   */
  const handleAddLead = () => {
    router.push(`/leads/form?customerId=${id}`);
  };

  /**
   * Handle lead press
   */
  const handleLeadPress = (leadId: string) => {
    router.push(`/leads/${leadId}`);
  };

  /**
   * Get status color for lead
   */
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'New':
        return '#007AFF';
      case 'Contacted':
        return '#FFC107';
      case 'Converted':
        return '#28A745';
      case 'Lost':
        return '#DC3545';
      default:
        return '#6C757D';
    }
  };

  // Load data on component mount
  useEffect(() => {
    if (id) {
      loadCustomer();
      loadLeads();
    }
  }, [id]);

  if (customerLoading && !currentCustomer) {
    return (
      <View style={styles.container}>
        <Header title="Customer Details" showBackButton />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading customer...</Text>
        </View>
      </View>
    );
  }

  if (customerError || !currentCustomer) {
    return (
      <View style={styles.container}>
        <Header title="Customer Details" showBackButton />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            {customerError || 'Customer not found'}
          </Text>
          <Button title="Go Back" onPress={() => router.back()} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header 
        title="Customer Details" 
        showBackButton
        showLogout={true}
        rightComponent={
          <Button 
            title="Edit" 
            onPress={handleEditCustomer} 
            size="small"
            variant="outline"
          />
        }
      />
      
      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        <View style={styles.content}>
          {/* Customer Information */}
          <Card style={styles.customerCard}>
            <Text style={styles.customerName}>{currentCustomer.name}</Text>
            <View style={styles.customerInfo}>
              <View style={styles.infoRow}>
                <Ionicons name="mail-outline" size={20} color="#6C757D" />
                <Text style={styles.infoText}>{currentCustomer.email}</Text>
              </View>
              <View style={styles.infoRow}>
                <Ionicons name="call-outline" size={20} color="#6C757D" />
                <Text style={styles.infoText}>{currentCustomer.phone}</Text>
              </View>
              <View style={styles.infoRow}>
                <Ionicons name="business-outline" size={20} color="#6C757D" />
                <Text style={styles.infoText}>{currentCustomer.company}</Text>
              </View>
              <View style={styles.infoRow}>
                <Ionicons name="calendar-outline" size={20} color="#6C757D" />
                <Text style={styles.infoText}>
                  Added {new Date(currentCustomer.createdAt).toLocaleDateString()}
                </Text>
              </View>
            </View>
            
            <CardActions justifyContent="space-between">
              <Button
                title="Edit Customer"
                onPress={handleEditCustomer}
                variant="outline"
                size="small"
              />
              <Button
                title="Delete"
                onPress={handleDeleteCustomer}
                variant="danger"
                size="small"
              />
            </CardActions>
          </Card>

          {/* Leads Section */}
          <View style={styles.leadsSection}>
            <View style={styles.leadsHeader}>
              <Text style={styles.leadsTitle}>Associated Leads</Text>
              <Button
                title="Add Lead"
                onPress={handleAddLead}
                size="small"
                icon={<Ionicons name="add" size={16} color="#FFFFFF" />}
              />
            </View>

            {leadsLoading ? (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Loading leads...</Text>
              </View>
            ) : leads.length === 0 ? (
              <Card style={styles.emptyCard}>
                <CardContent>
                  <View style={styles.emptyContent}>
                    <Ionicons name="trending-up-outline" size={48} color="#6C757D" />
                    <Text style={styles.emptyTitle}>No leads yet</Text>
                    <Text style={styles.emptySubtitle}>
                      Add your first lead for this customer
                    </Text>
                    <Button
                      title="Add Lead"
                      onPress={handleAddLead}
                      size="small"
                    />
                  </View>
                </CardContent>
              </Card>
            ) : (
              leads.map((lead) => (
                <Card 
                  key={lead.id} 
                  style={styles.leadCard}
                  onPress={() => handleLeadPress(lead.id)}
                >
                  <CardContent>
                    <View style={styles.leadHeader}>
                      <Text style={styles.leadTitle}>{lead.title}</Text>
                      <Text style={[styles.leadStatus, { color: getStatusColor(lead.status) }]}>
                        {lead.status}
                      </Text>
                    </View>
                    <Text style={styles.leadDescription} numberOfLines={2}>
                      {lead.description}
                    </Text>
                    <View style={styles.leadFooter}>
                      <Text style={styles.leadValue}>${lead.value.toLocaleString()}</Text>
                      <Text style={styles.leadDate}>
                        {new Date(lead.createdAt).toLocaleDateString()}
                      </Text>
                    </View>
                  </CardContent>
                </Card>
              ))
            )}
          </View>
        </View>
      </ScrollView>
    </View>
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#DC3545',
    textAlign: 'center',
    marginBottom: 16,
  },
  customerCard: {
    marginBottom: 20,
    padding: 20,
  },
  customerName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 16,
  },
  customerInfo: {
    gap: 12,
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoText: {
    fontSize: 16,
    color: '#6C757D',
  },
  leadsSection: {
    marginBottom: 20,
  },
  leadsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  leadsTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#212529',
  },
  emptyCard: {
    padding: 20,
  },
  emptyContent: {
    alignItems: 'center',
    gap: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212529',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6C757D',
    textAlign: 'center',
  },
  leadCard: {
    marginBottom: 12,
    padding: 16,
  },
  leadHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  leadTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
    flex: 1,
  },
  leadStatus: {
    fontSize: 12,
    fontWeight: '500',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#F8F9FA',
  },
  leadDescription: {
    fontSize: 14,
    color: '#6C757D',
    marginBottom: 12,
  },
  leadFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leadValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#28A745',
  },
  leadDate: {
    fontSize: 12,
    color: '#6C757D',
  },
});

export default CustomerDetailsPage;
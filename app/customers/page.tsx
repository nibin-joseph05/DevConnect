import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, RefreshControl, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { deleteCustomer, fetchCustomers, setSearchQuery } from '../../redux/slices/customerSlice';
import { AppDispatch, RootState } from '../../redux/store';
import Button from '../components/Button';
import Card, { CardContent, CardHeader } from '../components/Card';
import Header from '../components/Header';

/**
 * Customers list page component
 * Displays paginated list of customers with search functionality
 * Integrates with Redux store for state management
 */
const CustomersPage: React.FC = () => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  
  // Redux state
  const { customers, loading, error, searchQuery, pagination } = useSelector((state: RootState) => state.customers);
  
  // Local state
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState(searchQuery);

  /**
   * Load customers data
   */
  const loadCustomers = useCallback(async (page: number = 1, search: string = '') => {
    try {
      await dispatch(fetchCustomers({
        page,
        limit: 10,
        search: search.trim(),
      })).unwrap();
    } catch (err) {
      console.error('Failed to load customers:', err);
    }
  }, [dispatch]);

  /**
   * Handle refresh
   */
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadCustomers(1, searchText);
    setRefreshing(false);
  };

  /**
   * Handle search
   */
  const handleSearch = (text: string) => {
    setSearchText(text);
    dispatch(setSearchQuery(text));
    loadCustomers(1, text);
  };

  /**
   * Handle customer press
   */
  const handleCustomerPress = (customerId: string) => {
    router.push(`/customers/${customerId}`);
  };

  /**
   * Handle add customer
   */
  const handleAddCustomer = () => {
    router.push('/customers/form');
  };

  /**
   * Handle edit customer
   */
  const handleEditCustomer = (customerId: string) => {
    router.push(`/customers/form?id=${customerId}`);
  };

  /**
   * Handle delete customer
   */
  const handleDeleteCustomer = (customerId: string, customerName: string) => {
    Alert.alert(
      'Delete Customer',
      `Are you sure you want to delete ${customerName}? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await dispatch(deleteCustomer(customerId)).unwrap();
              // Reload customers after deletion
              loadCustomers(pagination.page, searchText);
            } catch (err) {
              Alert.alert('Error', 'Failed to delete customer');
            }
          },
        },
      ]
    );
  };

  /**
   * Handle load more
   */
  const handleLoadMore = () => {
    if (pagination.page < Math.ceil(pagination.total / pagination.limit)) {
      loadCustomers(pagination.page + 1, searchText);
    }
  };

  // Load customers on component mount
  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  return (
    <View style={styles.container}>
      <Header 
        title="Customers" 
        rightComponent={
          <Button 
            title="Add" 
            onPress={handleAddCustomer} 
            size="small"
            icon={<Ionicons name="add" size={16} color="#FFFFFF" />}
          />
        } 
      />
      
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color="#6C757D" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search customers..."
            value={searchText}
            onChangeText={handleSearch}
            placeholderTextColor="#6C757D"
          />
          {searchText.length > 0 && (
            <TouchableOpacity 
              onPress={() => handleSearch('')}
              style={styles.clearButton}
            >
              <Ionicons name="close-circle" size={20} color="#6C757D" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        <View style={styles.content}>
          {loading && customers.length === 0 ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading customers...</Text>
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
              <Button title="Retry" onPress={() => loadCustomers()} />
            </View>
          ) : customers.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="people-outline" size={64} color="#6C757D" />
              <Text style={styles.emptyTitle}>No customers found</Text>
              <Text style={styles.emptySubtitle}>
                {searchText ? 'Try adjusting your search terms' : 'Add your first customer to get started'}
              </Text>
              {!searchText && (
                <Button title="Add Customer" onPress={handleAddCustomer} />
              )}
            </View>
          ) : (
            <>
              {customers.map((customer) => (
                <Card 
                  key={customer.id} 
                  style={styles.customerCard}
                  onPress={() => handleCustomerPress(customer.id)}
                >
                  <CardHeader
                    title={customer.name}
                    subtitle={customer.email}
                    rightComponent={
                      <View style={styles.customerActions}>
                        <TouchableOpacity 
                          onPress={() => handleEditCustomer(customer.id)}
                          style={styles.actionButton}
                        >
                          <Ionicons name="create-outline" size={20} color="#007AFF" />
                        </TouchableOpacity>
                        <TouchableOpacity 
                          onPress={() => handleDeleteCustomer(customer.id, customer.name)}
                          style={styles.actionButton}
                        >
                          <Ionicons name="trash-outline" size={20} color="#DC3545" />
                        </TouchableOpacity>
                      </View>
                    }
                  />
                  <CardContent>
                    <View style={styles.customerInfo}>
                      <View style={styles.infoRow}>
                        <Ionicons name="call-outline" size={16} color="#6C757D" />
                        <Text style={styles.infoText}>{customer.phone}</Text>
                      </View>
                      <View style={styles.infoRow}>
                        <Ionicons name="business-outline" size={16} color="#6C757D" />
                        <Text style={styles.infoText}>{customer.company}</Text>
                      </View>
                    </View>
                  </CardContent>
                </Card>
              ))}
              
              {pagination.page < Math.ceil(pagination.total / pagination.limit) && (
                <Button
                  title="Load More"
                  onPress={handleLoadMore}
                  variant="outline"
                  loading={loading}
                  style={styles.loadMoreButton}
                />
              )}
            </>
          )}
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
  searchContainer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#212529',
  },
  clearButton: {
    marginLeft: 8,
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
    alignItems: 'center',
    paddingVertical: 40,
  },
  errorText: {
    fontSize: 16,
    color: '#DC3545',
    textAlign: 'center',
    marginBottom: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212529',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6C757D',
    textAlign: 'center',
    marginBottom: 24,
  },
  customerCard: {
    marginBottom: 12,
  },
  customerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 4,
  },
  customerInfo: {
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#6C757D',
  },
  loadMoreButton: {
    marginTop: 16,
  },
});

export default CustomersPage;
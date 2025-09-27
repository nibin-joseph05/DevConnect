import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { deleteLead, fetchLeads, setFilterStatus } from '../../redux/slices/leadSlice';
import { AppDispatch, RootState } from '../../redux/store';
import Button from '../components/Button';
import Card, { CardActions, CardContent } from '../components/Card';
import Header from '../components/Header';

/**
 * Leads list page component
 * Displays paginated list of leads with filtering functionality
 * Integrates with Redux store for state management
 */
const LeadsPage: React.FC = () => {
  const router = useRouter();
  const { customerId } = useLocalSearchParams<{ customerId?: string }>();
  const dispatch = useDispatch<AppDispatch>();
  
  // Redux state
  const { leads, loading, error, filterStatus, pagination } = useSelector((state: RootState) => state.leads);
  
  // Local state
  const [refreshing, setRefreshing] = useState(false);

  const statusOptions = [
    { value: null, label: 'All Leads' },
    { value: 'New', label: 'New' },
    { value: 'Contacted', label: 'Contacted' },
    { value: 'Converted', label: 'Converted' },
    { value: 'Lost', label: 'Lost' },
  ];

  /**
   * Load leads data
   */
  const loadLeads = useCallback(async (page: number = 1, status: string | null = null) => {
    try {
      await dispatch(fetchLeads({
        customerId: customerId || undefined,
        page,
        limit: 10,
        status: status || undefined,
      })).unwrap();
    } catch (err) {
      console.error('Failed to load leads:', err);
    }
  }, [dispatch, customerId]);

  /**
   * Handle refresh
   */
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadLeads(1, filterStatus);
    setRefreshing(false);
  };

  /**
   * Handle status filter change
   */
  const handleStatusFilter = (status: string | null) => {
    dispatch(setFilterStatus(status));
    loadLeads(1, status);
  };

  /**
   * Handle lead press
   */
  const handleLeadPress = (leadId: string) => {
    router.push(`/leads/${leadId}`);
  };

  /**
   * Handle add lead
   */
  const handleAddLead = () => {
    const url = customerId ? `/leads/form?customerId=${customerId}` : '/leads/form';
    router.push(url);
  };

  /**
   * Handle edit lead
   */
  const handleEditLead = (leadId: string) => {
    router.push(`/leads/form?id=${leadId}`);
  };

  /**
   * Handle delete lead
   */
  const handleDeleteLead = (leadId: string, leadTitle: string) => {
    Alert.alert(
      'Delete Lead',
      `Are you sure you want to delete "${leadTitle}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await dispatch(deleteLead(leadId)).unwrap();
              // Reload leads after deletion
              loadLeads(pagination.page, filterStatus);
            } catch (err) {
              Alert.alert('Error', 'Failed to delete lead');
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
      loadLeads(pagination.page + 1, filterStatus);
    }
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

  // Load leads on component mount
  useEffect(() => {
    loadLeads();
  }, [loadLeads]);

  return (
    <View style={styles.container}>
      <Header 
        title={customerId ? "Customer Leads" : "All Leads"} 
        showBackButton
        rightComponent={
          <Button 
            title="Add" 
            onPress={handleAddLead} 
            size="small"
            icon={<Ionicons name="add" size={16} color="#FFFFFF" />}
          />
        } 
      />
      
      {/* Status Filter */}
      <View style={styles.filterContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          {statusOptions.map((option) => (
            <TouchableOpacity
              key={option.value || 'all'}
              style={[
                styles.filterButton,
                filterStatus === option.value && styles.filterButtonActive
              ]}
              onPress={() => handleStatusFilter(option.value)}
            >
              <Text style={[
                styles.filterButtonText,
                filterStatus === option.value && styles.filterButtonTextActive
              ]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        <View style={styles.content}>
          {loading && leads.length === 0 ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading leads...</Text>
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
              <Button title="Retry" onPress={() => loadLeads()} />
            </View>
          ) : leads.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="trending-up-outline" size={64} color="#6C757D" />
              <Text style={styles.emptyTitle}>No leads found</Text>
              <Text style={styles.emptySubtitle}>
                {filterStatus ? `No leads with status "${filterStatus}"` : 'Add your first lead to get started'}
              </Text>
              <Button title="Add Lead" onPress={handleAddLead} />
            </View>
          ) : (
            <>
              {leads.map((lead) => (
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
                      <View style={styles.leadInfo}>
                        <Text style={styles.leadValue}>${lead.value.toLocaleString()}</Text>
                        {lead.customerName && (
                          <Text style={styles.leadCustomer}>{lead.customerName}</Text>
                        )}
                      </View>
                      <Text style={styles.leadDate}>
                        {new Date(lead.createdAt).toLocaleDateString()}
                      </Text>
                    </View>
                  </CardContent>
                  
                  <CardActions justifyContent="flex-end">
                    <TouchableOpacity 
                      onPress={() => handleEditLead(lead.id)}
                      style={styles.actionButton}
                    >
                      <Ionicons name="create-outline" size={20} color="#007AFF" />
                    </TouchableOpacity>
                    <TouchableOpacity 
                      onPress={() => handleDeleteLead(lead.id, lead.title)}
                      style={styles.actionButton}
                    >
                      <Ionicons name="trash-outline" size={20} color="#DC3545" />
                    </TouchableOpacity>
                  </CardActions>
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
  filterContainer: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
    paddingVertical: 12,
  },
  filterScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  filterButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#6C757D',
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: '#FFFFFF',
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
  leadInfo: {
    flex: 1,
  },
  leadValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#28A745',
    marginBottom: 2,
  },
  leadCustomer: {
    fontSize: 12,
    color: '#6C757D',
  },
  leadDate: {
    fontSize: 12,
    color: '#6C757D',
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
  loadMoreButton: {
    marginTop: 16,
  },
});

export default LeadsPage;
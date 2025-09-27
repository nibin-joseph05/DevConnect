import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '../../redux/slices/authSlice';
import { fetchCustomers } from '../../redux/slices/customerSlice';
import { fetchLeads } from '../../redux/slices/leadSlice';
import { AppDispatch, RootState } from '../../redux/store';
import Button from '../components/Button';
import Card, { CardContent } from '../components/Card';
import Header from '../components/Header';

// Types for dashboard data
interface DashboardStats {
  totalCustomers: number;
  totalLeads: number;
  totalValue: number;
  leadsByStatus: {
    New: number;
    Contacted: number;
    Converted: number;
    Lost: number;
  };
  recentLeads: Array<{
    id: string;
    title: string;
    status: string;
    value: number;
    customerName: string;
    createdAt: string;
  }>;
}

/**
 * Dashboard page component
 * Displays key metrics, charts, and recent activity
 * Integrates with Redux store for state management
 */
const DashboardPage: React.FC = () => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  
  // Redux state
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { customers } = useSelector((state: RootState) => state.customers);
  const { leads } = useSelector((state: RootState) => state.leads);
  
  // Local state
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, router]);

  /**
   * Load dashboard data
   */
  const loadDashboardData = async () => {
    try {
      setError(null);
      
      // Fetch customers and leads
      await Promise.all([
        dispatch(fetchCustomers({ limit: 100 })),
        dispatch(fetchLeads({ limit: 100 }))
      ]);

      // Calculate stats from Redux state
      const totalCustomers = customers.length;
      const totalLeads = leads.length;
      const totalValue = leads.reduce((sum, lead) => sum + lead.value, 0);
      
      const leadsByStatus = {
        New: leads.filter(lead => lead.status === 'New').length,
        Contacted: leads.filter(lead => lead.status === 'Contacted').length,
        Converted: leads.filter(lead => lead.status === 'Converted').length,
        Lost: leads.filter(lead => lead.status === 'Lost').length,
      };

      const recentLeads = leads
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5)
        .map(lead => ({
          id: lead.id,
          title: lead.title,
          status: lead.status,
          value: lead.value,
          customerName: lead.customerName || 'Unknown',
          createdAt: lead.createdAt,
        }));

      setStats({
        totalCustomers,
        totalLeads,
        totalValue,
        leadsByStatus,
        recentLeads,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle refresh
   */
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  /**
   * Handle logout
   */
  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await dispatch(logoutUser());
            router.replace('/login');
          },
        },
      ]
    );
  };

  /**
   * Navigate to customers page
   */
  const handleCustomersPress = () => {
    router.push('/customers');
  };

  /**
   * Navigate to leads page
   */
  const handleLeadsPress = () => {
    router.push('/leads');
  };

  // Load data on component mount
  useEffect(() => {
    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <Header title="Dashboard" rightComponent={
          <Button title="Logout" onPress={handleLogout} variant="outline" size="small" />
        } />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading dashboard...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Header title="Dashboard" rightComponent={
          <Button title="Logout" onPress={handleLogout} variant="outline" size="small" />
        } />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <Button title="Retry" onPress={loadDashboardData} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header 
        title="Dashboard" 
        rightComponent={
          <Button title="Logout" onPress={handleLogout} variant="outline" size="small" />
        } 
      />
      
      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        <View style={styles.content}>
          {/* Welcome Section */}
          <Card style={styles.welcomeCard}>
            <Text style={styles.welcomeTitle}>Welcome back, {user?.name}!</Text>
            <Text style={styles.welcomeSubtitle}>
              Here's what's happening with your business today.
            </Text>
          </Card>

          {/* Stats Cards */}
          <View style={styles.statsContainer}>
            <Card style={styles.statCard}>
              <CardContent>
                <Text style={styles.statNumber}>{stats?.totalCustomers || 0}</Text>
                <Text style={styles.statLabel}>Total Customers</Text>
              </CardContent>
            </Card>
            
            <Card style={styles.statCard}>
              <CardContent>
                <Text style={styles.statNumber}>{stats?.totalLeads || 0}</Text>
                <Text style={styles.statLabel}>Total Leads</Text>
              </CardContent>
            </Card>
          </View>

          <View style={styles.statsContainer}>
            <Card style={styles.statCard}>
              <CardContent>
                <Text style={styles.statNumber}>${stats?.totalValue?.toLocaleString() || 0}</Text>
                <Text style={styles.statLabel}>Total Value</Text>
              </CardContent>
            </Card>
            
            <Card style={styles.statCard}>
              <CardContent>
                <Text style={styles.statNumber}>
                  {stats?.leadsByStatus?.Converted || 0}
                </Text>
                <Text style={styles.statLabel}>Converted</Text>
              </CardContent>
            </Card>
          </View>

          {/* Leads by Status */}
          <Card style={styles.chartCard}>
            <Text style={styles.cardTitle}>Leads by Status</Text>
            <View style={styles.statusContainer}>
              <View style={styles.statusItem}>
                <View style={[styles.statusIndicator, { backgroundColor: '#007AFF' }]} />
                <Text style={styles.statusText}>New: {stats?.leadsByStatus?.New || 0}</Text>
              </View>
              <View style={styles.statusItem}>
                <View style={[styles.statusIndicator, { backgroundColor: '#FFC107' }]} />
                <Text style={styles.statusText}>Contacted: {stats?.leadsByStatus?.Contacted || 0}</Text>
              </View>
              <View style={styles.statusItem}>
                <View style={[styles.statusIndicator, { backgroundColor: '#28A745' }]} />
                <Text style={styles.statusText}>Converted: {stats?.leadsByStatus?.Converted || 0}</Text>
              </View>
              <View style={styles.statusItem}>
                <View style={[styles.statusIndicator, { backgroundColor: '#DC3545' }]} />
                <Text style={styles.statusText}>Lost: {stats?.leadsByStatus?.Lost || 0}</Text>
              </View>
            </View>
          </Card>

          {/* Recent Leads */}
          <Card style={styles.recentCard}>
            <Text style={styles.cardTitle}>Recent Leads</Text>
            {stats?.recentLeads && stats.recentLeads.length > 0 ? (
              <View style={styles.leadsList}>
                {stats.recentLeads.slice(0, 5).map((lead) => (
                  <View key={lead.id} style={styles.leadItem}>
                    <View style={styles.leadInfo}>
                      <Text style={styles.leadTitle}>{lead.title}</Text>
                      <Text style={styles.leadCustomer}>{lead.customerName}</Text>
                    </View>
                    <View style={styles.leadDetails}>
                      <Text style={styles.leadValue}>${lead.value.toLocaleString()}</Text>
                      <Text style={[styles.leadStatus, { color: getStatusColor(lead.status) }]}>
                        {lead.status}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={styles.noDataText}>No recent leads</Text>
            )}
          </Card>

          {/* Quick Actions */}
          <View style={styles.actionsContainer}>
            <Button
              title="Manage Customers"
              onPress={handleCustomersPress}
              style={styles.actionButton}
            />
            <Button
              title="View Leads"
              onPress={handleLeadsPress}
              variant="outline"
              style={styles.actionButton}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

/**
 * Get color for lead status
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
  welcomeCard: {
    marginBottom: 16,
    padding: 20,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#6C757D',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#6C757D',
    textAlign: 'center',
  },
  chartCard: {
    marginBottom: 16,
    padding: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 16,
  },
  statusContainer: {
    gap: 12,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 14,
    color: '#212529',
  },
  recentCard: {
    marginBottom: 16,
    padding: 16,
  },
  leadsList: {
    gap: 12,
  },
  leadItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  leadInfo: {
    flex: 1,
  },
  leadTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#212529',
    marginBottom: 2,
  },
  leadCustomer: {
    fontSize: 12,
    color: '#6C757D',
  },
  leadDetails: {
    alignItems: 'flex-end',
  },
  leadValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#28A745',
    marginBottom: 2,
  },
  leadStatus: {
    fontSize: 12,
    fontWeight: '500',
  },
  noDataText: {
    fontSize: 14,
    color: '#6C757D',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  actionButton: {
    flex: 1,
  },
});

export default DashboardPage;
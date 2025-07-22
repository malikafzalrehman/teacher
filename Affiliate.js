import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  StatusBar,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Date formatting function - Add this at the top level of your file
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

const affiliate = () => {
  // State management
  const [affiliates, setAffiliates] = useState([
    { 
      id: '1', 
      name: 'ABC School', 
      contact: 'John Doe', 
      phone: '03001234567', 
      email: 'john@abc.edu', 
      status: 'Verified', 
      paid: false,
      registrationDate: '2023-05-15'
    },
    { 
      id: '2', 
      name: 'XYZ Coaching', 
      contact: 'Jane Smith', 
      phone: '03111234567', 
      email: 'jane@xyz.com', 
      status: 'Pending', 
      paid: false,
      registrationDate: '2023-06-20'
    },
    { 
      id: '3', 
      name: 'City College', 
      contact: 'Ali Khan', 
      phone: '03211234567', 
      email: 'ali@citycollege.edu', 
      status: 'Verified', 
      paid: true,
      registrationDate: '2023-04-10'
    },
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');

  // Calculate totals
  const totalRegistered = affiliates.length;
  const totalVerified = affiliates.filter(a => a.status === 'Verified').length;
  const totalPaid = affiliates.filter(a => a.paid).length;
  const totalPayout = totalPaid * 3;

  // Handle payment
  const handlePayment = (id) => {
    setAffiliates(affiliates.map(aff => 
      aff.id === id ? {...aff, paid: true} : aff
    ));
  };

  // Filter affiliates based on search and active filter
  const filteredAffiliates = affiliates.filter(aff => {
    const matchesSearch = 
      aff.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      aff.contact.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = 
      activeFilter === 'all' ||
      (activeFilter === 'verified' && aff.status === 'Verified') ||
      (activeFilter === 'pending' && aff.status === 'Pending') ||
      (activeFilter === 'paid' && aff.paid) ||
      (activeFilter === 'unpaid' && !aff.paid && aff.status === 'Verified');
    
    return matchesSearch && matchesFilter;
  });

  // Simulate data refresh
  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#3498db" barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Affiliate Program</Text>
        <Text style={styles.headerSubtitle}>Manage school/coaching center registrations</Text>
      </View>

      {/* Stats Cards */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.statsScroll}
        contentContainerStyle={styles.statsContainer}
      >
        <StatCard 
          value={totalRegistered} 
          label="Total" 
          icon="group" 
          color="#3498db"
        />
        <StatCard 
          value={totalVerified} 
          label="Verified" 
          icon="verified-user" 
          color="#2ecc71"
        />
        <StatCard 
          value={`$${totalPayout}`} 
          label="Payouts" 
          icon="attach-money" 
          color="#f39c12"
        />
        <StatCard 
          value={totalPaid} 
          label="Paid" 
          icon="check-circle" 
          color="#27ae60"
        />
      </ScrollView>

      {/* Search and Filter */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Icon name="search" size={20} color="#95a5a6" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search affiliates..."
            placeholderTextColor="#95a5a6"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <FilterTab 
          label="All" 
          active={activeFilter === 'all'} 
          onPress={() => setActiveFilter('all')}
        />
        <FilterTab 
          label="Verified" 
          active={activeFilter === 'verified'} 
          onPress={() => setActiveFilter('verified')}
        />
        <FilterTab 
          label="Pending" 
          active={activeFilter === 'pending'} 
          onPress={() => setActiveFilter('pending')}
        />
        <FilterTab 
          label="Unpaid" 
          active={activeFilter === 'unpaid'} 
          onPress={() => setActiveFilter('unpaid')}
        />
      </View>

      {/* Affiliates List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3498db" />
        </View>
      ) : (
        <ScrollView
          style={styles.listContainer}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={onRefresh}
              colors={['#3498db']}
            />
          }
        >
          {filteredAffiliates.length === 0 ? (
            <View style={styles.emptyState}>
              <Icon name="info-outline" size={50} color="#bdc3c7" />
              <Text style={styles.emptyText}>No affiliates found</Text>
            </View>
          ) : (
            filteredAffiliates.map((affiliate) => (
              <AffiliateCard 
                key={affiliate.id}
                data={affiliate}
                onPayment={handlePayment}
              />
            ))
          )}
        </ScrollView>
      )}

      {/* Add New Affiliate Button */}
      <TouchableOpacity style={styles.addButton}>
        <Icon name="add" size={24} color="#fff" />
        <Text style={styles.addButtonText}>New Registration</Text>
      </TouchableOpacity>
    </View>
  );
};

// Reusable Stat Card Component
const StatCard = ({ value, label, icon, color }) => (
  <View style={[styles.statCard, { backgroundColor: color }]}>
    <Icon name={icon} size={24} color="#fff" />
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

// Reusable Filter Tab Component
const FilterTab = ({ label, active, onPress }) => (
  <TouchableOpacity 
    style={[styles.filterTab, active && styles.activeFilterTab]}
    onPress={onPress}
  >
    <Text style={[styles.filterText, active && styles.activeFilterText]}>
      {label}
    </Text>
  </TouchableOpacity>
);

// Reusable Affiliate Card Component
const AffiliateCard = ({ data, onPayment }) => (
  <View style={styles.card}>
    <View style={styles.cardHeader}>
      <Text style={styles.cardTitle}>{data.name}</Text>
      <View style={[
        styles.statusBadge,
        data.status === 'Verified' ? styles.verifiedBadge : styles.pendingBadge
      ]}>
        <Text style={styles.statusText}>{data.status}</Text>
      </View>
    </View>
    
    <View style={styles.cardBody}>
      <View style={styles.infoRow}>
        <Icon name="person" size={16} color="#7f8c8d" />
        <Text style={styles.infoText}>{data.contact}</Text>
      </View>
      <View style={styles.infoRow}>
        <Icon name="phone" size={16} color="#7f8c8d" />
        <Text style={styles.infoText}>{data.phone}</Text>
      </View>
      <View style={styles.infoRow}>
        <Icon name="email" size={16} color="#7f8c8d" />
        <Text style={styles.infoText}>{data.email}</Text>
      </View>
      <View style={styles.infoRow}>
        <Icon name="calendar-today" size={16} color="#7f8c8d" />
        <Text style={styles.infoText}>Registered: {formatDate(data.registrationDate)}</Text>
      </View>
    </View>
    
    <View style={styles.cardFooter}>
      {!data.paid && data.status === 'Verified' ? (
        <TouchableOpacity 
          style={styles.payButton}
          onPress={() => onPayment(data.id)}
        >
          <Icon name="attach-money" size={16} color="#fff" />
          <Text style={styles.payButtonText}>Pay $3</Text>
        </TouchableOpacity>
      ) : (
        <View style={[
          styles.paymentStatus,
          data.paid ? styles.paidStatus : styles.unverifiedStatus
        ]}>
          <Icon 
            name={data.paid ? "check-circle" : "info"} 
            size={16} 
            color="#fff" 
          />
          <Text style={styles.paymentStatusText}>
            {data.paid ? 'Payment Completed' : 'Verify First'}
          </Text>
        </View>
      )}
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  headerContainer: {
    backgroundColor: '#3498db',
    padding: 20,
    paddingTop: 40,
    paddingBottom: 30,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  statsScroll: {
    marginTop: -20,
    marginBottom: 15,
    paddingHorizontal: 15,
  },
  statsContainer: {
    paddingBottom: 10,
  },
  statCard: {
    width: 120,
    padding: 15,
    borderRadius: 10,
    marginRight: 10,
    elevation: 2,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginVertical: 5,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    textTransform: 'uppercase',
  },
  searchContainer: {
    paddingHorizontal: 15,
    marginBottom: 10,
  },
  searchInputContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 8,
    alignItems: 'center',
    elevation: 1,
  },
  searchIcon: {
    marginLeft: 10,
  },
  searchInput: {
    flex: 1,
    padding: 12,
    fontSize: 16,
    color: '#2c3e50',
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  filterTab: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 10,
    borderRadius: 20,
    backgroundColor: '#ecf0f1',
  },
  activeFilterTab: {
    backgroundColor: '#3498db',
  },
  filterText: {
    color: '#7f8c8d',
    fontSize: 14,
  },
  activeFilterText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: 15,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    marginTop: 10,
    color: '#95a5a6',
    fontSize: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 15,
    elevation: 2,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  verifiedBadge: {
    backgroundColor: 'rgba(46, 204, 113, 0.2)',
  },
  pendingBadge: {
    backgroundColor: 'rgba(241, 196, 15, 0.2)',
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  cardBody: {
    padding: 15,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  infoText: {
    marginLeft: 10,
    color: '#34495e',
    fontSize: 14,
  },
  cardFooter: {
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  payButton: {
    flexDirection: 'row',
    backgroundColor: '#2ecc71',
    padding: 10,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  payButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 5,
  },
  paymentStatus: {
    flexDirection: 'row',
    padding: 10,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  paidStatus: {
    backgroundColor: '#27ae60',
  },
  unverifiedStatus: {
    backgroundColor: '#e67e22',
  },
  paymentStatusText: {
    color: '#fff',
    marginLeft: 5,
    fontSize: 14,
  },
  addButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#3498db',
    flexDirection: 'row',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 30,
    alignItems: 'center',
    elevation: 5,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 10,
    fontSize: 16,
  },
});

export default affiliate;
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  ScrollView,
  Alert,
  RefreshControl,
  Modal,
  Pressable
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const StudentPortal = () => {
  // State management
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Mock data generation
  const generateMockStudents = () => {
    const firstNames = ['John', 'Emma', 'Michael', 'Sophia', 'William', 'Olivia', 'James', 'Ava', 'Benjamin', 'Isabella'];
    const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Miller', 'Davis', 'Garcia', 'Rodriguez', 'Wilson'];
    const classes = Array.from({ length: 10 }, (_, i) => `Class ${i + 1}`);
    
    return Array.from({ length: 50 }, (_, i) => ({
      id: `STU${1000 + i}`,
      rollNo: i + 1,
      name: `${firstNames[i % 10]} ${lastNames[i % 10]}`,
      class: classes[Math.floor(Math.random() * 10)],
      fatherName: `Mr. ${lastNames[(i + 2) % 10]}`,
      contact: `+92${3000000000 + i}`,
      address: `${i + 1} Street, City ${(i % 5) + 1}`,
      status: ['Active', 'Inactive', 'Suspended'][Math.floor(Math.random() * 3)]
    }));
  };

  // Fetch students data
  const fetchStudents = async () => {
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      const mockStudents = generateMockStudents();
      setStudents(mockStudents);
      setError(null);
    } catch (err) {
      setError('Failed to load student data. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Refresh control
  const onRefresh = () => {
    setRefreshing(true);
    fetchStudents();
  };

  // Filter students based on search query
  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.rollNo.toString().includes(searchQuery) ||
    student.class.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle student selection
  const handleStudentPress = (student) => {
    setSelectedStudent(student);
    setModalVisible(true);
  };

  // Handle student deletion
  const handleDeleteStudent = (studentId) => {
    Alert.alert(
      'Confirm Deletion',
      'Are you sure you want to delete this student record?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setStudents(students.filter(student => student.id !== studentId));
            setModalVisible(false);
            Alert.alert('Success', 'Student record deleted successfully');
          }
        }
      ]
    );
  };

  // Initial data fetch
  useEffect(() => {
    fetchStudents();
  }, []);

  // Render student item
  const renderStudentItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.studentItem, { borderLeftColor: getStatusColor(item.status) }]}
      onPress={() => handleStudentPress(item)}
    >
      <View style={styles.studentInfo}>
        <Text style={styles.studentName}>{item.name}</Text>
        <Text style={styles.studentClass}>Class: {item.class} | Roll No: {item.rollNo}</Text>
      </View>
      <Icon name="chevron-right" size={24} color="#7f8c8d" />
    </TouchableOpacity>
  );

  // Get color based on student status
  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return '#2ecc71';
      case 'Inactive': return '#f39c12';
      case 'Suspended': return '#e74c3c';
      default: return '#95a5a6';
    }
  };

  // Loading state
  if (loading && !refreshing) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#3498db" />
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <ScrollView
        contentContainerStyle={styles.center}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Icon name="error-outline" size={50} color="#e74c3c" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchStudents}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Student Management Portal</Text>
        <Text style={styles.headerSubtitle}>Total Students: {students.length}</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Icon name="search" size={20} color="#95a5a6" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name, class or roll no..."
          placeholderTextColor="#95a5a6"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Student List */}
      <FlatList
        data={filteredStudents}
        renderItem={renderStudentItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="people-outline" size={60} color="#bdc3c7" />
            <Text style={styles.emptyText}>No students found</Text>
          </View>
        }
      />

      {/* Student Details Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {selectedStudent && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Student Details</Text>
                  <Pressable onPress={() => setModalVisible(false)}>
                    <Icon name="close" size={24} color="#7f8c8d" />
                  </Pressable>
                </View>

                <ScrollView style={styles.modalBody}>
                  <DetailRow icon="person" label="Name" value={selectedStudent.name} />
                  <DetailRow icon="class" label="Class" value={selectedStudent.class} />
                  <DetailRow icon="format-list-numbered" label="Roll No" value={selectedStudent.rollNo} />
                  <DetailRow icon="person-outline" label="Father's Name" value={selectedStudent.fatherName} />
                  <DetailRow icon="phone" label="Contact" value={selectedStudent.contact} />
                  <DetailRow icon="location-on" label="Address" value={selectedStudent.address} />
                  <DetailRow 
                    icon="circle" 
                    label="Status" 
                    value={selectedStudent.status} 
                    valueStyle={{ color: getStatusColor(selectedStudent.status) }}
                  />
                </ScrollView>

                <View style={styles.modalFooter}>
                  <TouchableOpacity 
                    style={[styles.modalButton, { backgroundColor: '#e74c3c' }]}
                    onPress={() => handleDeleteStudent(selectedStudent.id)}
                  >
                    <Icon name="delete" size={20} color="#fff" />
                    <Text style={styles.modalButtonText}>Delete</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.modalButton, { backgroundColor: '#3498db' }]}
                    onPress={() => {
                      // Handle edit functionality here
                      Alert.alert('Edit', 'Edit functionality would be implemented here');
                    }}
                  >
                    <Icon name="edit" size={20} color="#fff" />
                    <Text style={styles.modalButtonText}>Edit</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

// Helper component for detail rows
const DetailRow = ({ icon, label, value, valueStyle }) => (
  <View style={styles.detailRow}>
    <Icon name={icon} size={20} color="#7f8c8d" style={styles.detailIcon} />
    <Text style={styles.detailLabel}>{label}:</Text>
    <Text style={[styles.detailValue, valueStyle]}>{value}</Text>
  </View>
);

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    padding: 16,
    backgroundColor: '#3498db',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#eaf2f8',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    marginHorizontal: 16,
    marginVertical: 10,
    paddingHorizontal: 12,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    color: '#2c3e50',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 80,
  },
  studentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 5,
    elevation: 1,
  },
  studenInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
  },
  studentClass: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#bdc3c7',
    marginTop: 10,
  },
  errorText: {
    fontSize: 16,
    color: '#e74c3c',
    marginVertical: 16,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#3498db',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 6,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  modalBody: {
    padding: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailIcon: {
    marginRight: 10,
    width: 24,
  },
  detailLabel: {
    fontSize: 14,
    color: '#7f8c8d',
    width: 100,
  },
  detailValue: {
    flex: 1,
    fontSize: 14,
    color: '#2c3e50',
    fontWeight: '500',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#ecf0f1',
  },
  modalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    width: '48%',
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

export default StudentPortal;
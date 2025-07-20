import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, TextInput, SectionList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const AccountantReport = () => {
  const navigation = useNavigation();
  const [students, setStudents] = useState([]);
  const [selectedTab, setSelectedTab] = useState('all'); // 'all', 'paid', 'unpaid'
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedClasses, setExpandedClasses] = useState({});

  // Mock data with Pakistani classes and PKR currency
  useEffect(() => {
    const mockStudents = [
      { id: '1', name: 'Ali Khan', class: 'Class 1', feeAmount: 2000, paid: true, dueDate: '2023-07-15' },
      { id: '2', name: 'Fatima Ahmed', class: 'Class 1', feeAmount: 2000, paid: false, dueDate: '2023-07-15' },
      { id: '3', name: 'Usman Malik', class: 'Class 2', feeAmount: 2500, paid: true, dueDate: '2023-07-10' },
      { id: '4', name: 'Ayesha Raza', class: 'Class 2', feeAmount: 2500, paid: false, dueDate: '2023-07-20' },
      { id: '5', name: 'Bilal Hussain', class: 'Class 3', feeAmount: 3000, paid: false, dueDate: '2023-07-05' },
      { id: '6', name: 'Sana Sheikh', class: 'Class 3', feeAmount: 3000, paid: true, dueDate: '2023-07-12' },
      { id: '7', name: 'Zainab Akhtar', class: 'Class 4', feeAmount: 3500, paid: false, dueDate: '2023-07-18' },
      { id: '8', name: 'Omar Farooq', class: 'Class 4', feeAmount: 3500, paid: true, dueDate: '2023-07-22' },
    ];
    setStudents(mockStudents);
  }, []);

  // Filter students based on tab selection and search query
  const filteredStudents = students.filter(student => {
    const matchesTab = 
      selectedTab === 'all' || 
      (selectedTab === 'paid' && student.paid) || 
      (selectedTab === 'unpaid' && !student.paid);
    
    const matchesSearch = 
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      student.class.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesTab && matchesSearch;
  });

  // Group students by class
  const groupedStudents = filteredStudents.reduce((acc, student) => {
    if (!acc[student.class]) {
      acc[student.class] = [];
    }
    acc[student.class].push(student);
    return acc;
  }, {});

  // Prepare data for SectionList
  const sectionData = Object.keys(groupedStudents).map(classTitle => ({
    title: classTitle,
    data: groupedStudents[classTitle],
    isExpanded: expandedClasses[classTitle] !== false // Default to expanded
  }));

  const toggleClass = (classTitle) => {
    setExpandedClasses(prev => ({
      ...prev,
      [classTitle]: !prev[classTitle]
    }));
  };

  const sendNotification = (student) => {
    Alert.alert(
      'Send Reminder',
      `Send fee reminder to ${student.name}'s parents?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Send', onPress: () => {
          Alert.alert('Sent', `Reminder sent to ${student.name}'s parents`);
        }},
      ]
    );
  };

  const markAsPaid = (studentId) => {
    setStudents(students.map(student => 
      student.id === studentId ? { ...student, paid: true } : student
    ));
    Alert.alert('Updated', 'Fee status updated to paid');
  };

  const renderStudentItem = ({ item }) => (
    <View style={[styles.studentCard, item.paid ? styles.paidCard : styles.unpaidCard]}>
      <View style={styles.studentInfo}>
        <Text style={styles.studentName}>{item.name}</Text>
        <Text style={styles.studentClass}>PKR {item.feeAmount.toLocaleString()}</Text>
        <Text style={styles.dueDate}>Due: {item.dueDate}</Text>
      </View>
      <View style={styles.actionButtons}>
        {!item.paid && (
          <>
            <TouchableOpacity 
              style={styles.notifyButton}
              onPress={() => sendNotification(item)}
            >
              <Icon name="notifications" size={20} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.paidButton}
              onPress={() => markAsPaid(item.id)}
            >
              <Text style={styles.paidButtonText}>Mark Paid</Text>
            </TouchableOpacity>
          </>
        )}
        {item.paid && (
          <Text style={styles.paidText}>PAID</Text>
        )}
      </View>
    </View>
  );

  const renderSectionHeader = ({ section }) => (
    <TouchableOpacity 
      style={styles.sectionHeader} 
      onPress={() => toggleClass(section.title)}
    >
      <Text style={styles.sectionHeaderText}>{section.title}</Text>
      <Icon 
        name={section.isExpanded ? 'keyboard-arrow-up' : 'keyboard-arrow-down'} 
        size={24} 
        color="#555" 
      />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Fee Management System</Text>
      </View>

      <View style={styles.searchContainer}>
        <Icon name="search" size={20} color="#555" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name or class..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity 
          style={[styles.tab, selectedTab === 'all' && styles.activeTab]}
          onPress={() => setSelectedTab('all')}
        >
          <Text style={[styles.tabText, selectedTab === 'all' && styles.activeTabText]}>All</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, selectedTab === 'paid' && styles.activeTab]}
          onPress={() => setSelectedTab('paid')}
        >
          <Text style={[styles.tabText, selectedTab === 'paid' && styles.activeTabText]}>Paid</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, selectedTab === 'unpaid' && styles.activeTab]}
          onPress={() => setSelectedTab('unpaid')}
        >
          <Text style={[styles.tabText, selectedTab === 'unpaid' && styles.activeTabText]}>Unpaid</Text>
        </TouchableOpacity>
      </View>

      <SectionList
        sections={sectionData.filter(section => section.isExpanded)}
        renderItem={renderStudentItem}
        renderSectionHeader={renderSectionHeader}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        stickySectionHeadersEnabled={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No students found</Text>
          </View>
        }
      />

      <TouchableOpacity 
        style={styles.generateReportButton}
        onPress={() => navigation.navigate('FeeReport')}
      >
        <Text style={styles.generateReportText}>Generate Monthly Report</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 16,
    backgroundColor: '#046a38', // Pakistani green color
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    margin: 10,
    paddingHorizontal: 10,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    color: '#333',
  },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    backgroundColor: '#fff',
  },
  tab: {
    flex: 1,
    padding: 15,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#046a38',
  },
  tabText: {
    fontSize: 16,
    color: '#555',
  },
  activeTabText: {
    color: '#046a38',
    fontWeight: 'bold',
  },
  listContent: {
    paddingBottom: 20,
  },
  sectionHeader: {
    backgroundColor: '#fff',
    padding: 12,
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  sectionHeaderText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#046a38',
  },
  studentCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginHorizontal: 10,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 1,
  },
  paidCard: {
    borderLeftWidth: 5,
    borderLeftColor: '#2ecc71',
  },
  unpaidCard: {
    borderLeftWidth: 5,
    borderLeftColor: '#e74c3c',
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#333',
  },
  studentClass: {
    fontSize: 14,
    color: '#555',
    marginBottom: 4,
  },
  dueDate: {
    fontSize: 12,
    color: '#777',
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notifyButton: {
    backgroundColor: '#f39c12',
    padding: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  paidButton: {
    backgroundColor: '#2ecc71',
    padding: 8,
    borderRadius: 4,
  },
  paidButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  paidText: {
    color: '#2ecc71',
    fontWeight: 'bold',
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#777',
  },
  generateReportButton: {
    backgroundColor: '#046a38',
    padding: 15,
    margin: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  generateReportText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default AccountantReport;
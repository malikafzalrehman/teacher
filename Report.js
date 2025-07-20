import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, TextInput, ScrollView, Alert, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const Report = ({ userRole = 'teacher' }) => {
  const classes = ['All', 'KG', 'Pre-Prep', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
  const years = ['All', '2022', '2023', '2024'];
  const months = ['All', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const reportTypes = ['Monthly', 'Term', 'Annual', 'Special'];
  const statuses = ['All', 'Pending', 'Approved', 'Rejected'];

  const [reports, setReports] = useState([
    { id: '1', class: 'KG', month: 'January', year: '2023', teacher: 'Ms. Khan', subject: 'General Progress', fileUrl: '', uploadDate: '2023-01-10', type: 'Monthly', status: 'Approved' },
    { id: '2', class: 'Pre-Prep', month: 'February', year: '2023', teacher: 'Mr. Ahmed', subject: 'Language Skills', fileUrl: '', uploadDate: '2023-02-15', type: 'Monthly', status: 'Approved' },
    { id: '3', class: '5', month: 'March', year: '2023', teacher: 'Mr. Sharma', subject: 'Mathematics', fileUrl: '', uploadDate: '2023-03-05', type: 'Term', status: 'Approved' },
    { id: '4', class: '10', month: 'January', year: '2024', teacher: 'Ms. Gupta', subject: 'Science', fileUrl: '', uploadDate: '2024-01-20', type: 'Annual', status: 'Pending' },
  ]);

  const [filteredReports, setFilteredReports] = useState([]);
  const [selectedClass, setSelectedClass] = useState('All');
  const [selectedYear, setSelectedYear] = useState('All');
  const [selectedMonth, setSelectedMonth] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState(userRole === 'admin' ? 'Pending' : 'Approved');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isStatusModalVisible, setIsStatusModalVisible] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [newReport, setNewReport] = useState({
    class: '',
    month: '',
    year: '',
    subject: '',
    fileUrl: '',
    type: 'Monthly'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    let result = [...reports];
    
    if (selectedClass !== 'All') {
      result = result.filter(report => report.class === selectedClass);
    }
    
    if (selectedYear !== 'All') {
      result = result.filter(report => report.year === selectedYear);
    }
    
    if (selectedMonth !== 'All') {
      result = result.filter(report => report.month === selectedMonth);
    }
    
    if (selectedType !== 'All') {
      result = result.filter(report => report.type === selectedType);
    }
    
    if (selectedStatus !== 'All') {
      result = result.filter(report => report.status === selectedStatus);
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(report => 
        report.subject.toLowerCase().includes(query) ||
        report.teacher.toLowerCase().includes(query) ||
        report.class.toLowerCase().includes(query)
      );
    }
    
    if (userRole === 'teacher') {
      result = result.filter(report => 
        report.status === 'Approved' || 
        (report.status === 'Pending' && report.teacher === 'Current Teacher')
      );
    }
    
    setFilteredReports(result);
  }, [selectedClass, selectedYear, selectedMonth, selectedType, selectedStatus, reports, userRole, searchQuery]);

  const handleUploadReport = () => {
    if (!newReport.class || !newReport.year || !newReport.subject) {
      Alert.alert('Incomplete Form', 'Please fill all required fields');
      return;
    }

    setIsLoading(true);
    
    setTimeout(() => {
      const newReportWithDetails = {
        ...newReport,
        id: Date.now().toString(),
        teacher: 'Current Teacher',
        uploadDate: new Date().toISOString().split('T')[0],
        status: userRole === 'admin' ? 'Approved' : 'Pending'
      };
      
      setReports([...reports, newReportWithDetails]);
      setIsModalVisible(false);
      setNewReport({
        class: '',
        month: '',
        year: '',
        subject: '',
        fileUrl: '',
        type: 'Monthly'
      });
      
      setIsLoading(false);
      Alert.alert('Success', userRole === 'admin' 
        ? 'Report created and approved!' 
        : 'Report submitted for admin approval!');
    }, 1000);
  };

  const handleStatusChange = (status) => {
    const updatedReports = reports.map(report => 
      report.id === selectedReport.id ? { ...report, status } : report
    );
    
    setReports(updatedReports);
    setIsStatusModalVisible(false);
    Alert.alert('Status Updated', `Report has been ${status.toLowerCase()}`);
  };

  const renderReportItem = ({ item }) => (
    <TouchableOpacity 
      style={[
        styles.reportItem,
        item.status === 'Pending' && styles.pendingReport,
        item.status === 'Rejected' && styles.rejectedReport
      ]}
      onPress={() => {
        setSelectedReport(item);
      }}
      onLongPress={() => {
        if (userRole === 'admin') {
          setSelectedReport(item);
          setIsStatusModalVisible(true);
        }
      }}
    >
      <View style={styles.reportHeader}>
        <View>
          <Text style={styles.classText}>{item.class}</Text>
          <Text style={styles.dateText}>{item.month} {item.year}</Text>
        </View>
        <View style={[
          styles.reportTypeBadge,
          item.status === 'Pending' && styles.pendingBadge,
          item.status === 'Rejected' && styles.rejectedBadge
        ]}>
          <Text style={styles.reportTypeText}>{item.status}</Text>
        </View>
      </View>
      
      <Text style={styles.subjectText}>{item.subject}</Text>
      
      <View style={styles.teacherContainer}>
        <View style={styles.teacherInfo}>
          <Icon name="person" size={16} color="#6c757d" />
          <Text style={styles.teacherText}> {item.teacher}</Text>
        </View>
        <View style={styles.uploadInfo}>
          <Icon name="calendar-today" size={14} color="#adb5bd" />
          <Text style={styles.uploadDate}> {item.uploadDate}</Text>
        </View>
      </View>
      
      <View style={styles.reportFooter}>
        <View style={[
          styles.reportTypeBadge,
          { backgroundColor: '#e2f0fd', alignSelf: 'flex-start' }
        ]}>
          <Text style={styles.reportTypeText}>{item.type}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>School Report System</Text>
          <Text style={styles.headerSubtitle}>
            {userRole === 'admin' ? 'Admin Dashboard' : 'Teacher Portal'} | KG to Grade 10
          </Text>
        </View>
        <View style={styles.userBadge}>
          <Icon name={userRole === 'admin' ? 'admin-panel-settings' : 'school'} size={20} color="white" />
          <Text style={styles.userRoleText}>{userRole}</Text>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <Icon name="search" size={20} color="#6c757d" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search reports..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#adb5bd"
        />
        {searchQuery ? (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Icon name="close" size={20} color="#6c757d" />
          </TouchableOpacity>
        ) : null}
      </View>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        style={styles.filterScroll}
        contentContainerStyle={styles.filterScrollContent}
      >
        <View style={styles.filterGroup}>
          <View style={styles.filterLabelContainer}>
            <Text style={styles.filterLabel}>CLASS</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {classes.map(cls => (
              <TouchableOpacity
                key={cls}
                style={[styles.filterButton, selectedClass === cls && styles.activeFilter]}
                onPress={() => setSelectedClass(cls)}
              >
                <Text style={[styles.filterButtonText, selectedClass === cls && styles.activeFilterText]}>{cls}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.filterGroup}>
          <View style={styles.filterLabelContainer}>
            <Text style={styles.filterLabel}>YEAR</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {years.map(yr => (
              <TouchableOpacity
                key={yr}
                style={[styles.filterButton, selectedYear === yr && styles.activeFilter]}
                onPress={() => setSelectedYear(yr)}
              >
                <Text style={[styles.filterButtonText, selectedYear === yr && styles.activeFilterText]}>{yr}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.filterGroup}>
          <View style={styles.filterLabelContainer}>
            <Text style={styles.filterLabel}>MONTH</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {months.map(mn => (
              <TouchableOpacity
                key={mn}
                style={[styles.filterButton, selectedMonth === mn && styles.activeFilter]}
                onPress={() => setSelectedMonth(mn)}
              >
                <Text style={[styles.filterButtonText, selectedMonth === mn && styles.activeFilterText]}>{mn}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.filterGroup}>
          <View style={styles.filterLabelContainer}>
            <Text style={styles.filterLabel}>TYPE</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {reportTypes.map(typ => (
              <TouchableOpacity
                key={typ}
                style={[styles.filterButton, selectedType === typ && styles.activeFilter]}
                onPress={() => setSelectedType(typ)}
              >
                <Text style={[styles.filterButtonText, selectedType === typ && styles.activeFilterText]}>{typ}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {userRole === 'admin' && (
          <View style={styles.filterGroup}>
            <View style={styles.filterLabelContainer}>
              <Text style={styles.filterLabel}>STATUS</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {statuses.map(st => (
                <TouchableOpacity
                  key={st}
                  style={[styles.filterButton, selectedStatus === st && styles.activeFilter]}
                  onPress={() => setSelectedStatus(st)}
                >
                  <Text style={[styles.filterButtonText, selectedStatus === st && styles.activeFilterText]}>{st}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </ScrollView>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4a6da7" />
        </View>
      ) : (
        <FlatList
          data={filteredReports}
          renderItem={renderReportItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Icon name="find-in-page" size={50} color="#adb5bd" />
              <Text style={styles.emptyText}>
                {selectedStatus === 'Pending' ? 'No pending reports found' : 'No reports available'}
              </Text>
              <Text style={styles.emptySubtext}>Try changing your filters or upload a new report</Text>
            </View>
          }
        />
      )}

      {(userRole === 'teacher' || (userRole === 'admin' && selectedStatus === 'Approved')) && (
        <TouchableOpacity 
          style={styles.uploadButton}
          onPress={() => setIsModalVisible(true)}
        >
          <Icon name={userRole === 'admin' ? 'add' : 'cloud-upload'} size={24} color="white" />
          <Text style={styles.uploadButtonText}>
            {userRole === 'admin' ? 'Create Report' : 'Upload Report'}
          </Text>
        </TouchableOpacity>
      )}

      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <ScrollView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {userRole === 'admin' ? 'Create New Report' : 'Submit Report for Approval'}
            </Text>
            <TouchableOpacity 
              style={styles.modalCloseButton}
              onPress={() => setIsModalVisible(false)}
            >
              <Icon name="close" size={24} color="#6c757d" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Class *</Text>
            <View style={styles.classButtons}>
              {classes.filter(cls => cls !== 'All').map(cls => (
                <TouchableOpacity
                  key={cls}
                  style={[styles.classButton, newReport.class === cls && styles.selectedClass]}
                  onPress={() => setNewReport({...newReport, class: cls})}
                >
                  <Text style={styles.classButtonText}>{cls}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Report Type *</Text>
            <View style={styles.typeButtons}>
              {reportTypes.map(typ => (
                <TouchableOpacity
                  key={typ}
                  style={[styles.typeButton, newReport.type === typ && styles.selectedType]}
                  onPress={() => setNewReport({...newReport, type: typ})}
                >
                  <Text style={styles.typeButtonText}>{typ}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Month</Text>
            <View style={styles.pickerContainer}>
              {months.filter(mn => mn !== 'All').map(mn => (
                <TouchableOpacity
                  key={mn}
                  style={[styles.monthButton, newReport.month === mn && styles.selectedMonth]}
                  onPress={() => setNewReport({...newReport, month: mn})}
                >
                  <Text style={styles.monthButtonText}>{mn}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Year *</Text>
            <TextInput
              style={styles.input}
              placeholder="2023"
              keyboardType="numeric"
              value={newReport.year}
              onChangeText={text => setNewReport({...newReport, year: text})}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Subject/Title *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Mathematics or General Progress"
              value={newReport.subject}
              onChangeText={text => setNewReport({...newReport, subject: text})}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>File URL</Text>
            <TextInput
              style={styles.input}
              placeholder="Optional file link"
              value={newReport.fileUrl}
              onChangeText={text => setNewReport({...newReport, fileUrl: text})}
            />
          </View>

          <View style={styles.modalButtons}>
            <TouchableOpacity 
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => setIsModalVisible(false)}
            >
              <Text style={styles.modalButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.modalButton, styles.uploadButtonModal]}
              onPress={handleUploadReport}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.modalButtonText}>
                  {userRole === 'admin' ? 'Create Report' : 'Submit for Approval'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </Modal>

      {userRole === 'admin' && (
        <Modal
          visible={isStatusModalVisible}
          animationType="fade"
          transparent={true}
          onRequestClose={() => setIsStatusModalVisible(false)}
        >
          <View style={styles.statusModalContainer}>
            <View style={styles.statusModalContent}>
              <Text style={styles.statusModalTitle}>Change Report Status</Text>
              
              <View style={styles.statusModalInfo}>
                <Icon name="description" size={24} color="#4a6da7" />
                <Text style={styles.statusModalText}>{selectedReport?.subject}</Text>
              </View>
              
              <View style={styles.statusModalInfo}>
                <Icon name="class" size={24} color="#4a6da7" />
                <Text style={styles.statusModalText}>Class {selectedReport?.class}</Text>
              </View>
              
              <View style={styles.statusModalInfo}>
                <Icon name="person" size={24} color="#4a6da7" />
                <Text style={styles.statusModalText}>{selectedReport?.teacher}</Text>
              </View>
              
              <View style={styles.statusModalInfo}>
                <Icon name="event" size={24} color="#4a6da7" />
                <Text style={styles.statusModalText}>{selectedReport?.uploadDate}</Text>
              </View>
              
              <View style={styles.statusCurrentContainer}>
                <Text style={styles.statusCurrentText}>Current Status:</Text>
                <View style={[
                  styles.statusBadge,
                  selectedReport?.status === 'Pending' && styles.pendingBadge,
                  selectedReport?.status === 'Approved' && styles.approvedBadge,
                  selectedReport?.status === 'Rejected' && styles.rejectedBadge
                ]}>
                  <Text style={styles.statusBadgeText}>{selectedReport?.status}</Text>
                </View>
              </View>

              <View style={styles.statusButtonContainer}>
                <TouchableOpacity 
                  style={[styles.statusButton, styles.approveButton]}
                  onPress={() => handleStatusChange('Approved')}
                >
                  <Icon name="check" size={20} color="white" />
                  <Text style={styles.statusButtonText}>Approve</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.statusButton, styles.rejectButton]}
                  onPress={() => handleStatusChange('Rejected')}
                >
                  <Icon name="close" size={20} color="white" />
                  <Text style={styles.statusButtonText}>Reject</Text>
                </TouchableOpacity>
              </View>
              
              <TouchableOpacity 
                style={styles.statusCancelButton}
                onPress={() => setIsStatusModalVisible(false)}
              >
                <Text style={styles.statusCancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#4a6da7',
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 5,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: '#e0e0e0',
    fontSize: 14,
    marginTop: 2,
  },
  userBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3a5a8a',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    marginLeft: 10,
  },
  userRoleText: {
    color: 'white',
    fontSize: 14,
    marginLeft: 5,
    textTransform: 'capitalize',
  },
  searchContainer: {
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginHorizontal: 15,
    marginTop: 15,
    borderRadius: 10,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    color: '#495057',
    fontSize: 16,
  },
  filterScroll: {
    backgroundColor: 'white',
    paddingVertical: 10,
    elevation: 3,
  },
  filterScrollContent: {
    paddingHorizontal: 10,
  },
  filterGroup: {
    marginRight: 15,
    minWidth: 120,
  },
  filterLabelContainer: {
    marginBottom: 8,
  },
  filterLabel: {
    color: '#6c757d',
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  filterButton: {
    backgroundColor: '#e9ecef',
    padding: 8,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
    minWidth: 50,
    alignItems: 'center',
  },
  filterButtonText: {
    color: '#495057',
    fontSize: 14,
  },
  activeFilter: {
    backgroundColor: '#4a6da7',
  },
  activeFilterText: {
    color: 'white',
    fontWeight: 'bold',
  },
  listContainer: {
    padding: 15,
    paddingBottom: 80,
  },
  reportItem: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: '#4a6da7',
  },
  pendingReport: {
    borderLeftColor: '#ffc107',
    backgroundColor: '#fffcf5',
  },
  rejectedReport: {
    borderLeftColor: '#dc3545',
    backgroundColor: '#fff5f5',
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  classText: {
    fontWeight: 'bold',
    fontSize: 18,
    color: '#343a40',
  },
  dateText: {
    color: '#6c757d',
    fontSize: 14,
    marginTop: 2,
  },
  reportTypeBadge: {
    backgroundColor: '#e2f0fd',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  pendingBadge: {
    backgroundColor: '#fff3cd',
  },
  rejectedBadge: {
    backgroundColor: '#f8d7da',
  },
  approvedBadge: {
    backgroundColor: '#d4edda',
  },
  reportTypeText: {
    color: '#4a6da7',
    fontSize: 12,
    fontWeight: 'bold',
  },
  subjectText: {
    fontSize: 16,
    marginBottom: 8,
    color: '#495057',
    fontWeight: '600',
  },
  teacherContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  teacherInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  teacherText: {
    color: '#6c757d',
    fontSize: 13,
  },
  uploadInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  uploadDate: {
    color: '#adb5bd',
    fontSize: 12,
  },
  reportFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    color: '#6c757d',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 5,
  },
  emptySubtext: {
    color: '#adb5bd',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 15,
  },
  uploadButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#4a6da7',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 30,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  uploadButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#343a40',
    flex: 1,
  },
  modalCloseButton: {
    padding: 5,
  },
  inputGroup: {
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  inputLabel: {
    marginBottom: 8,
    fontWeight: 'bold',
    color: '#495057',
    fontSize: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f8f9fa',
  },
  classButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  classButton: {
    backgroundColor: '#e9ecef',
    padding: 10,
    borderRadius: 8,
    marginRight: 10,
    marginBottom: 10,
    minWidth: 60,
    alignItems: 'center',
  },
  selectedClass: {
    backgroundColor: '#4a6da7',
  },
  classButtonText: {
    color: '#495057',
    fontSize: 14,
  },
  typeButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  typeButton: {
    backgroundColor: '#e9ecef',
    padding: 10,
    borderRadius: 8,
    marginRight: 10,
    marginBottom: 10,
    minWidth: 80,
    alignItems: 'center',
  },
  selectedType: {
    backgroundColor: '#4a6da7',
  },
  typeButtonText: {
    color: '#495057',
    fontSize: 14,
  },
  pickerContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  monthButton: {
    backgroundColor: '#e9ecef',
    padding: 10,
    borderRadius: 8,
    marginRight: 10,
    marginBottom: 10,
    minWidth: 90,
    alignItems: 'center',
  },
  selectedMonth: {
    backgroundColor: '#4a6da7',
  },
  monthButtonText: {
    color: '#495057',
    fontSize: 14,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  modalButton: {
    padding: 15,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#e9ecef',
  },
  uploadButtonModal: {
    backgroundColor: '#4a6da7',
  },
  modalButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  statusModalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  statusModalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    width: '90%',
    padding: 20,
  },
  statusModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#343a40',
  },
  statusModalInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  statusModalText: {
    marginLeft: 10,
    fontSize: 15,
    color: '#495057',
    flex: 1,
  },
  statusCurrentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e9ecef',
  },
  statusCurrentText: {
    fontWeight: 'bold',
    color: '#495057',
    marginRight: 10,
  },
  statusBadge: {
    backgroundColor: '#e2f0fd',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  statusBadgeText: {
    color: '#4a6da7',
    fontSize: 14,
    fontWeight: 'bold',
  },
  statusButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  statusButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 5,
  },
  statusButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
  approveButton: {
    backgroundColor: '#28a745',
  },
  rejectButton: {
    backgroundColor: '#dc3545',
  },
  statusCancelButton: {
    marginTop: 15,
    alignItems: 'center',
  },
  statusCancelText: {
    color: '#6c757d',
    fontWeight: 'bold',
  },
});

export default Report;
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Modal, 
  TextInput, 
  Button, 
  ScrollView,
  ActivityIndicator,
  RefreshControl 
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Constants
const GRADE_LEVELS = ['KG', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
const ATTENDANCE_STATUS = {
  PRESENT: { label: 'Present', color: '#27ae60', icon: 'check-circle' },
  ABSENT: { label: 'Absent', color: '#e74c3c', icon: 'cancel' },
  LATE: { label: 'Late', color: '#f39c12', icon: 'watch-later' },
  EXCUSED: { label: 'Excused', color: '#9b59b6', icon: 'event-available' }
};

const Attendance = () => {
  const navigation = useNavigation();
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [attendanceData, setAttendanceData] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [date, setDate] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeGrade, setActiveGrade] = useState('KG');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Add the missing function
  const handleAddAttendance = useCallback(() => {
    setModalVisible(true);
  }, []);

  // Memoized filtered classes
  const filteredClasses = useMemo(() => 
    classes.filter(cls => cls.grade === activeGrade),
    [classes, activeGrade]
  );

  // Memoized filtered attendance data
  const filteredAttendance = useMemo(() => 
    attendanceData.filter(item => 
      item.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.rollNumber.toString().includes(searchQuery)
    ),
    [attendanceData, searchQuery]
  );

  // Fetch classes with error handling
  const fetchClasses = useCallback(async () => {
    try {
      setIsLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const allClasses = [
        // KG Sections
        { id: 'KG-A', name: 'KG-A', grade: 'KG', teacher: 'Ms. Amina', totalStudents: 25 },
        { id: 'KG-B', name: 'KG-B', grade: 'KG', teacher: 'Ms. Farah', totalStudents: 22 },
        
        // Grade 1-10 sections would follow the same pattern
        // ... (rest of your class data)
      ];
      
      setClasses(allClasses);
    } catch (error) {
      console.error('Failed to fetch classes:', error);
      // You might want to show an error message to the user here
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Fetch attendance for class with error handling
  const fetchAttendanceForClass = useCallback(async (classId) => {
    if (!classId) return;
    
    try {
      setIsLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Generate more realistic mock attendance data
      const classInfo = classes.find(c => c.id === classId);
      const mockAttendance = Array.from({ length: classInfo?.totalStudents || 20 }, (_, i) => {
        const statusKeys = Object.keys(ATTENDANCE_STATUS);
        const randomStatus = statusKeys[Math.floor(Math.random() * statusKeys.length)];
        return {
          id: `${classId}-${i+1}`,
          studentName: `Student ${i+1}`,
          status: ATTENDANCE_STATUS[randomStatus].label,
          date: formatDate(date),
          rollNumber: i+1,
          remarks: randomStatus === 'ABSENT' ? 'Sick' : ''
        };
      });
      
      setAttendanceData(mockAttendance);
    } catch (error) {
      console.error('Failed to fetch attendance:', error);
      // Show error to user
    } finally {
      setIsLoading(false);
    }
  }, [classes, date]);

  // Helper function to format date
  const formatDate = (dateObj) => {
    return dateObj.toISOString().split('T')[0];
  };

  // Handle refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchClasses();
    if (selectedClass) {
      fetchAttendanceForClass(selectedClass.id);
    }
  }, [fetchClasses, fetchAttendanceForClass, selectedClass]);

  // Initialize data
  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  // Handle class selection
  const handleClassSelect = useCallback((classItem) => {
    setSelectedClass(classItem);
    setSearchQuery(''); // Reset search when changing class
    fetchAttendanceForClass(classItem.id);
  }, [fetchAttendanceForClass]);

  // Handle date change
  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  // Submit attendance to backend
  const submitAttendance = useCallback(() => {
    // In a real app, you would send this to your backend
    console.log('Submitting attendance for:', selectedClass.name, 'on', formatDate(date));
    setModalVisible(false);
    fetchAttendanceForClass(selectedClass.id);
  }, [selectedClass, date, fetchAttendanceForClass]);

  // Render grade tab
  const renderGradeTab = (grade) => (
    <TouchableOpacity
      key={grade}
      style={[
        styles.gradeTab,
        activeGrade === grade && styles.activeGradeTab
      ]}
      onPress={() => {
        setActiveGrade(grade);
        setSelectedClass(null); // Reset selected class when changing grade
      }}
    >
      <Text style={[
        styles.gradeTabText,
        activeGrade === grade && styles.activeGradeTabText
      ]}>
        Grade {grade}
      </Text>
    </TouchableOpacity>
  );

  // Render class item
  const renderClassItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.classItem,
        selectedClass?.id === item.id && styles.selectedClassItem
      ]}
      onPress={() => handleClassSelect(item)}
    >
      <Text style={styles.className}>{item.name}</Text>
      <Text style={styles.teacherName}>{item.teacher}</Text>
      <Text style={styles.studentCount}>{item.totalStudents} students</Text>
    </TouchableOpacity>
  );

  // Render attendance item
  const renderAttendanceItem = ({ item }) => {
    const statusInfo = Object.values(ATTENDANCE_STATUS).find(s => s.label === item.status) || 
                      ATTENDANCE_STATUS.PRESENT;
                      
    return (
      <View style={styles.attendanceItem}>
        <Text style={styles.rollNumber}>{item.rollNumber}</Text>
        <Text style={styles.studentName}>{item.studentName}</Text>
        <View style={styles.statusContainer}>
          <Icon 
            name={statusInfo.icon} 
            size={18} 
            color={statusInfo.color} 
            style={styles.statusIcon}
          />
          <Text style={[styles.status, { color: statusInfo.color }]}>
            {item.status}
          </Text>
        </View>
        {item.remarks && (
          <Icon name="info-outline" size={16} color="#7f8c8d" />
        )}
        <Text style={styles.date}>{item.date}</Text>
      </View>
    );
  };

  // Calculate attendance summary
  const attendanceSummary = useMemo(() => {
    if (!filteredAttendance.length) return null;
    
    const presentCount = filteredAttendance.filter(a => a.status === 'Present').length;
    const absentCount = filteredAttendance.filter(a => a.status === 'Absent').length;
    const lateCount = filteredAttendance.filter(a => a.status === 'Late').length;
    const excusedCount = filteredAttendance.filter(a => a.status === 'Excused').length;
    
    return {
      present: presentCount,
      absent: absentCount,
      late: lateCount,
      excused: excusedCount,
      total: filteredAttendance.length,
      percentage: Math.round((presentCount / filteredAttendance.length) * 100)
    };
  }, [filteredAttendance]);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>School Attendance Management</Text>
      
      {/* Grade Selection Tabs */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.gradeTabsContainer}
        contentContainerStyle={styles.gradeTabsContent}
      >
        {GRADE_LEVELS.map(renderGradeTab)}
      </ScrollView>
      
      {/* Classes Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Classes - Grade {activeGrade}</Text>
        {isLoading && !refreshing ? (
          <ActivityIndicator size="small" color="#3498db" />
        ) : filteredClasses.length > 0 ? (
          <FlatList
            data={filteredClasses}
            renderItem={renderClassItem}
            keyExtractor={item => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            ListEmptyComponent={<Text>No classes found</Text>}
          />
        ) : (
          <Text style={styles.noDataText}>No classes found for this grade.</Text>
        )}
      </View>

      {/* Attendance Section */}
      {selectedClass && (
        <View style={styles.section}>
          <View style={styles.classHeader}>
            <View>
              <Text style={styles.sectionTitle}>Attendance for {selectedClass.name}</Text>
              {attendanceSummary && (
                <Text style={styles.summaryText}>
                  {attendanceSummary.present}/{attendanceSummary.total} present ({attendanceSummary.percentage}%)
                </Text>
              )}
            </View>
            <TouchableOpacity 
              style={styles.addButton} 
              onPress={handleAddAttendance}
              disabled={isLoading}
            >
              <Icon name="add" size={20} color="white" />
              <Text style={styles.addButtonText}>Add</Text>
            </TouchableOpacity>
          </View>
          
          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <Icon name="search" size={20} color="#7f8c8d" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search students..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              clearButtonMode="while-editing"
            />
          </View>
          
          {isLoading ? (
            <ActivityIndicator size="small" color="#3498db" />
          ) : filteredAttendance.length > 0 ? (
            <View style={styles.attendanceContainer}>
              <View style={styles.attendanceHeader}>
                <Text style={styles.headerCell}>Roll #</Text>
                <Text style={styles.headerCell}>Name</Text>
                <Text style={styles.headerCell}>Status</Text>
                <Text style={styles.headerCell}>Date</Text>
              </View>
              <FlatList
                data={filteredAttendance}
                renderItem={renderAttendanceItem}
                keyExtractor={item => item.id}
                refreshControl={
                  <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    colors={['#3498db']}
                  />
                }
                ListFooterComponent={
                  attendanceSummary && (
                    <View style={styles.summaryContainer}>
                      <View style={styles.summaryItem}>
                        <Text style={[styles.summaryBadge, { backgroundColor: ATTENDANCE_STATUS.PRESENT.color }]}>
                          {attendanceSummary.present}
                        </Text>
                        <Text>Present</Text>
                      </View>
                      <View style={styles.summaryItem}>
                        <Text style={[styles.summaryBadge, { backgroundColor: ATTENDANCE_STATUS.ABSENT.color }]}>
                          {attendanceSummary.absent}
                        </Text>
                        <Text>Absent</Text>
                      </View>
                      <View style={styles.summaryItem}>
                        <Text style={[styles.summaryBadge, { backgroundColor: ATTENDANCE_STATUS.LATE.color }]}>
                          {attendanceSummary.late}
                        </Text>
                        <Text>Late</Text>
                      </View>
                    </View>
                  )
                }
              />
            </View>
          ) : (
            <Text style={styles.noDataText}>
              {searchQuery ? 'No matching students found' : 'No attendance records found'}
            </Text>
          )}
        </View>
      )}

      {/* Add Attendance Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Add New Attendance</Text>
              
              <View style={styles.modalField}>
                <Text style={styles.label}>Class</Text>
                <Text style={styles.modalValue}>{selectedClass?.name}</Text>
              </View>
              
              <View style={styles.modalField}>
                <Text style={styles.label}>Date</Text>
                <TouchableOpacity 
                  style={styles.dateInput} 
                  onPress={() => setShowDatePicker(true)}
                >
                  <Text>{formatDate(date)}</Text>
                  <Icon name="calendar-today" size={20} color="#3498db" />
                </TouchableOpacity>
                {showDatePicker && (
                  <DateTimePicker
                    value={date}
                    mode="date"
                    display="default"
                    onChange={onDateChange}
                    maximumDate={new Date()}
                  />
                )}
              </View>
              
              <View style={styles.modalButtons}>
                <TouchableOpacity 
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.modalButton, styles.submitButton]}
                  onPress={submitAttendance}
                >
                  <Text style={styles.submitButtonText}>Submit</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f8f9fa',
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#2c3e50',
    textAlign: 'center',
  },
  gradeTabsContainer: {
    marginBottom: 12,
  },
  gradeTabsContent: {
    paddingHorizontal: 4,
  },
  gradeTab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 8,
    backgroundColor: '#e9ecef',
    borderRadius: 20,
  },
  activeGradeTab: {
    backgroundColor: '#3498db',
  },
  gradeTabText: {
    color: '#495057',
    fontSize: 14,
  },
  activeGradeTabText: {
    color: 'white',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    color: '#343a40',
  },
  classItem: {
    padding: 12,
    marginRight: 10,
    backgroundColor: 'white',
    borderRadius: 8,
    width: 160,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  selectedClassItem: {
    borderWidth: 2,
    borderColor: '#3498db',
    backgroundColor: '#e3f2fd',
  },
  className: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 4,
  },
  teacherName: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 4,
  },
  studentCount: {
    fontSize: 12,
    color: '#adb5bd',
  },
  classHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryText: {
    fontSize: 14,
    color: '#6c757d',
  },
  addButton: {
    backgroundColor: '#3498db',
    padding: 10,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 80,
  },
  addButtonText: {
    color: 'white',
    fontSize: 14,
    marginLeft: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
    height: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 14,
  },
  attendanceContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  attendanceHeader: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: '#3498db',
    borderRadius: 6,
    marginBottom: 4,
  },
  headerCell: {
    flex: 1,
    textAlign: 'center',
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  attendanceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  rollNumber: {
    flex: 0.6,
    textAlign: 'center',
    fontSize: 14,
  },
  studentName: {
    flex: 2,
    fontSize: 14,
  },
  statusContainer: {
    flex: 1.2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusIcon: {
    marginRight: 4,
  },
  status: {
    fontWeight: '500',
    fontSize: 14,
  },
  date: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    color: '#6c757d',
  },
  noDataText: {
    textAlign: 'center',
    color: '#6c757d',
    marginTop: 16,
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
    marginTop: 8,
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryBadge: {
    color: 'white',
    fontWeight: 'bold',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginBottom: 4,
    fontSize: 12,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContainer: {
    width: '90%',
    maxWidth: 400,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#2c3e50',
  },
  modalField: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 6,
    fontWeight: '500',
    color: '#495057',
  },
  modalValue: {
    fontSize: 16,
    color: '#212529',
  },
  dateInput: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ced4da',
    padding: 12,
    borderRadius: 6,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#e9ecef',
    marginRight: 10,
  },
  cancelButtonText: {
    color: '#495057',
    fontWeight: '500',
  },
  submitButton: {
    backgroundColor: '#3498db',
  },
  submitButtonText: {
    color: 'white',
    fontWeight: '500',
  },
});

export default Attendance;
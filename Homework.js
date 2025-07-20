import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  SafeAreaView, 
  TouchableOpacity, 
  SectionList,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Modal,
  TextInput,
  Alert,
  Platform
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import DateTimePicker from '@react-native-community/datetimepicker';

// Constants for better maintainability
const GRADES = ['KG', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
const SUBJECTS = [
  'Mathematics', 'English', 'Science', 'Social Studies', 
  'Urdu', 'Islamiyat', 'Computer', 'Arts', 'Physical Education'
];
const HOMEWORK_STATUS = {
  SUBMITTED: 'Submitted',
  PENDING: 'Pending',
  LATE: 'Late'
};
const STATUS_COLORS = {
  [HOMEWORK_STATUS.SUBMITTED]: { bg: '#d4edda', text: '#155724' },
  [HOMEWORK_STATUS.PENDING]: { bg: '#fffaf0', text: '#856404' },
  [HOMEWORK_STATUS.LATE]: { bg: '#fff5f5', text: '#721c24' }
};

const Homework = () => {
  // State management
  const [state, setState] = useState({
    homeworkData: [],
    loading: true,
    refreshing: false,
    selectedGrade: null,
    selectedSubject: null,
    modalVisible: false
  });
  
  const [newHomework, setNewHomework] = useState({
    grade: '',
    subject: '',
    title: '',
    description: '',
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Default: 1 week from now
  });
  
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Memoized data transformations
  const filteredData = useMemo(() => 
    state.homeworkData.filter(item => 
      (!state.selectedGrade || item.grade === state.selectedGrade) && 
      (!state.selectedSubject || item.subject === state.selectedSubject)
    ),
    [state.homeworkData, state.selectedGrade, state.selectedSubject]
  );

  const groupedData = useMemo(() => {
    const groups = state.homeworkData.reduce((acc, item) => {
      const gradeKey = `Grade ${item.grade}`;
      if (!acc[gradeKey]) {
        acc[gradeKey] = [];
      }
      acc[gradeKey].push(item);
      return acc;
    }, {});
    
    return Object.entries(groups)
      .map(([title, data]) => ({ title, data }))
      .sort((a, b) => {
        if (a.title === 'Grade KG') return -1;
        if (b.title === 'Grade KG') return 1;
        return parseInt(a.title.split(' ')[1]) - parseInt(b.title.split(' ')[1]);
      });
  }, [state.homeworkData]);

  // Data fetching
  useEffect(() => {
    const fetchHomeworkData = async () => {
      setState(prev => ({ ...prev, loading: true }));
      try {
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        const mockData = [
          { id: '1', grade: 'KG', subject: 'English', title: 'Alphabet Practice', 
            status: HOMEWORK_STATUS.SUBMITTED, dueDate: '2023-07-10', 
            description: 'Practice writing A to E', completion: '85%' },
          { id: '2', grade: 'KG', subject: 'Arts', title: 'Color the Picture', 
            status: HOMEWORK_STATUS.PENDING, dueDate: '2023-07-12', 
            description: 'Color the animal pictures', completion: '45%' },
          { id: '3', grade: '1', subject: 'Mathematics', title: 'Addition Problems', 
            status: HOMEWORK_STATUS.SUBMITTED, dueDate: '2023-07-08', 
            description: 'Solve 10 addition problems', completion: '92%' },
          { id: '4', grade: '5', subject: 'Science', title: 'Plant Growth Report', 
            status: HOMEWORK_STATUS.LATE, dueDate: '2023-07-05', 
            description: 'Submit plant growth observations', completion: '78%' },
          { id: '5', grade: '8', subject: 'Computer', title: 'HTML Basics', 
            status: HOMEWORK_STATUS.SUBMITTED, dueDate: '2023-07-15', 
            description: 'Create a simple HTML page', completion: '95%' },
          { id: '6', grade: '10', subject: 'Mathematics', title: 'Algebra Test Prep', 
            status: HOMEWORK_STATUS.PENDING, dueDate: '2023-07-18', 
            description: 'Complete practice problems', completion: '30%' },
        ];
        
        setState(prev => ({ ...prev, homeworkData: mockData }));
      } catch (error) {
        Alert.alert('Error', 'Failed to load homework data');
        console.error('Error:', error);
      } finally {
        setState(prev => ({ ...prev, loading: false }));
      }
    };

    fetchHomeworkData();
  }, []);

  // Handlers
  const handleRefresh = useCallback(() => {
    setState(prev => ({ ...prev, refreshing: true }));
    setTimeout(() => {
      setState(prev => ({ ...prev, refreshing: false }));
    }, 1500);
  }, []);

  const clearAllFilters = useCallback(() => {
    setState(prev => ({ ...prev, selectedGrade: null, selectedSubject: null }));
  }, []);

  const handleAddHomework = useCallback(() => {
    setState(prev => ({ ...prev, modalVisible: true }));
  }, []);

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setNewHomework(prev => ({ ...prev, dueDate: selectedDate }));
    }
  };

  const submitHomework = useCallback(() => {
    if (!newHomework.grade || !newHomework.subject || !newHomework.title) {
      Alert.alert('Validation Error', 'Please fill all required fields');
      return;
    }

    const newId = (state.homeworkData.length + 1).toString();
    const formattedDate = newHomework.dueDate.toISOString().split('T')[0];
    
    const newItem = {
      id: newId,
      grade: newHomework.grade,
      subject: newHomework.subject,
      title: newHomework.title,
      status: HOMEWORK_STATUS.PENDING,
      dueDate: formattedDate,
      description: newHomework.description,
      completion: '0%'
    };
    
    setState(prev => ({
      ...prev,
      homeworkData: [...prev.homeworkData, newItem],
      modalVisible: false
    }));
    
    setNewHomework({
      grade: '',
      subject: '',
      title: '',
      description: '',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });
  }, [newHomework, state.homeworkData]);

  // Render helpers
  const renderItem = useCallback(({ item }) => (
    <View style={styles.itemContainer}>
      <View style={styles.subjectHeader}>
        <Text style={styles.subjectText}>{item.subject}</Text>
        <View style={[
          styles.statusBadge,
          { backgroundColor: STATUS_COLORS[item.status].bg }
        ]}>
          <Text style={[styles.statusText, { color: STATUS_COLORS[item.status].text }]}>
            {item.status}
          </Text>
        </View>
      </View>
      <Text style={styles.titleText}>{item.title}</Text>
      <Text style={styles.descriptionText}>{item.description}</Text>
      
      <View style={styles.detailsContainer}>
        <View style={styles.detailItem}>
          <Icon name="calendar-today" size={16} color="#666" />
          <Text style={styles.detailText}> Due: {item.dueDate}</Text>
        </View>
        <View style={styles.detailItem}>
          <Icon name="group" size={16} color="#666" />
          <Text style={styles.detailText}> {item.completion} completed</Text>
        </View>
      </View>
      
      {state.selectedGrade && (
        <TouchableOpacity 
          style={styles.viewDetailsButton}
          onPress={() => Alert.alert('Navigation', 'Would navigate to submissions screen')}
        >
          <Text style={styles.viewDetailsText}>View Student Submissions</Text>
        </TouchableOpacity>
      )}
    </View>
  ), [state.selectedGrade]);

  const renderSectionHeader = useCallback(({ section }) => {
    const submittedCount = section.data.filter(d => d.status === HOMEWORK_STATUS.SUBMITTED).length;
    const submissionRate = Math.round((submittedCount / section.data.length) * 100) || 0;
    
    return (
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionHeaderText}>{section.title}</Text>
        <Text style={styles.sectionSubText}>
          {section.data.length} assignments • {submissionRate}% submission rate
        </Text>
      </View>
    );
  }, []);

  const renderFilterButton = useCallback((type, value) => {
    const isSelected = type === 'grade' 
      ? state.selectedGrade === value 
      : state.selectedSubject === value;
    
    return (
      <TouchableOpacity 
        key={value}
        style={[
          styles.filterButton, 
          isSelected && styles.selectedFilter
        ]}
        onPress={() => {
          setState(prev => ({
            ...prev,
            [type === 'grade' ? 'selectedGrade' : 'selectedSubject']: 
              isSelected ? null : value
          }));
        }}
      >
        <Text style={[
          styles.filterButtonText,
          isSelected && styles.selectedFilterText
        ]}>
          {value}
        </Text>
      </TouchableOpacity>
    );
  }, [state.selectedGrade, state.selectedSubject]);

  if (state.loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2c3e50" />
        <Text style={styles.loadingText}>Loading Homework Data...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <Text style={styles.header}>School Homework Management</Text>
        <TouchableOpacity 
          onPress={handleAddHomework} 
          style={styles.addButton}
          testID="add-homework-button"
        >
          <Icon name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>
      
      {/* Filter Controls */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterScrollContainer}
      >
        <View style={styles.filterContainer}>
          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>Grade Level:</Text>
            <View style={styles.filterButtonsContainer}>
              {GRADES.map(grade => renderFilterButton('grade', grade))}
            </View>
          </View>
          
          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>Subject:</Text>
            <View style={styles.filterButtonsContainer}>
              {SUBJECTS.map(subject => renderFilterButton('subject', subject))}
            </View>
          </View>
        </View>
      </ScrollView>

      {(state.selectedGrade || state.selectedSubject) && (
        <TouchableOpacity 
          onPress={clearAllFilters} 
          style={styles.clearAllButton}
          testID="clear-filters-button"
        >
          <Text style={styles.clearAllText}>Clear Filters</Text>
        </TouchableOpacity>
      )}

      {/* Homework List */}
      {state.selectedGrade || state.selectedSubject ? (
        <FlatList
          data={filteredData}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={state.refreshing}
              onRefresh={handleRefresh}
              colors={['#2c3e50']}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer} testID="empty-list">
              <Icon name="assignment" size={50} color="#ccc" />
              <Text style={styles.emptyText}>No homework found</Text>
              <Text style={styles.emptySubText}>Try different filters</Text>
            </View>
          }
        />
      ) : (
        <SectionList
          sections={groupedData}
          renderItem={renderItem}
          renderSectionHeader={renderSectionHeader}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={state.refreshing}
              onRefresh={handleRefresh}
              colors={['#2c3e50']}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Icon name="assignment" size={50} color="#ccc" />
              <Text style={styles.emptyText}>No homework available</Text>
              <Text style={styles.emptySubText}>Assign homework to get started</Text>
            </View>
          }
        />
      )}

      {/* Add Homework Modal */}
      <Modal
        animationType="slide"
        transparent={false}
        visible={state.modalVisible}
        onRequestClose={() => setState(prev => ({ ...prev, modalVisible: false }))}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Assign New Homework</Text>
            <TouchableOpacity 
              onPress={() => setState(prev => ({ ...prev, modalVisible: false }))}
              testID="close-modal-button"
            >
              <Icon name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          
          <ScrollView 
            contentContainerStyle={styles.modalContent}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Grade Level *</Text>
              <View style={styles.gradeButtonsContainer}>
                {GRADES.map(grade => (
                  <TouchableOpacity
                    key={grade}
                    style={[
                      styles.gradeButton,
                      newHomework.grade === grade && styles.selectedGradeButton
                    ]}
                    onPress={() => setNewHomework({...newHomework, grade})}
                    testID={`grade-${grade}-button`}
                  >
                    <Text style={[
                      styles.gradeButtonText,
                      newHomework.grade === grade && styles.selectedGradeButtonText
                    ]}>
                      {grade}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Subject *</Text>
              <View style={styles.subjectButtonsContainer}>
                {SUBJECTS.map(subject => (
                  <TouchableOpacity
                    key={subject}
                    style={[
                      styles.subjectButton,
                      newHomework.subject === subject && styles.selectedSubjectButton
                    ]}
                    onPress={() => setNewHomework({...newHomework, subject})}
                    testID={`subject-${subject}-button`}
                  >
                    <Text style={[
                      styles.subjectButtonText,
                      newHomework.subject === subject && styles.selectedSubjectButtonText
                    ]}>
                      {subject}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Title *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter homework title"
                value={newHomework.title}
                onChangeText={text => setNewHomework({...newHomework, title: text})}
                testID="homework-title-input"
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Description</Text>
              <TextInput
                style={[styles.textInput, styles.multilineInput]}
                placeholder="Enter detailed instructions"
                multiline
                value={newHomework.description}
                onChangeText={text => setNewHomework({...newHomework, description: text})}
                testID="homework-description-input"
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Due Date</Text>
              <TouchableOpacity 
                onPress={() => setShowDatePicker(true)}
                style={styles.dateInput}
                testID="due-date-button"
              >
                <Text style={styles.dateText}>
                  {newHomework.dueDate.toLocaleDateString()}
                </Text>
                <Icon name="calendar-today" size={20} color="#666" />
              </TouchableOpacity>
              
              {showDatePicker && (
                <DateTimePicker
                  value={newHomework.dueDate}
                  mode="date"
                  display="default"
                  onChange={handleDateChange}
                  minimumDate={new Date()}
                  testID="date-time-picker"
                />
              )}
            </View>
            
            <TouchableOpacity 
              style={[
                styles.submitButton,
                (!newHomework.grade || !newHomework.subject || !newHomework.title) && 
                  styles.disabledButton
              ]}
              onPress={submitHomework}
              disabled={!newHomework.grade || !newHomework.subject || !newHomework.title}
              testID="submit-homework-button"
            >
              <Text style={styles.submitButtonText}>Assign Homework</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

// Enhanced styles with better organization
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
  loadingText: {
    marginTop: 15,
    color: '#4a5568',
    fontSize: 16,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#2c3e50',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    flex: 1,
  },
  addButton: {
    backgroundColor: '#3498db',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
  filterScrollContainer: {
    paddingLeft: 15,
    backgroundColor: 'white',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e0e0e0',
  },
  filterContainer: {
    paddingVertical: 5,
  },
  filterSection: {
    marginBottom: 10,
  },
  filterLabel: {
    fontWeight: '600',
    marginBottom: 8,
    marginLeft: 5,
    color: '#555',
    fontSize: 14,
  },
  filterButtonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    marginRight: 10,
    marginBottom: 10,
    backgroundColor: '#edf2f7',
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#e2e8f0',
  },
  filterButtonText: {
    color: '#4a5568',
    fontSize: 14,
  },
  selectedFilter: {
    backgroundColor: '#2c3e50',
    borderColor: '#2c3e50',
  },
  selectedFilterText: {
    color: 'white',
    fontWeight: '500',
  },
  clearAllButton: {
    alignSelf: 'center',
    padding: 10,
    marginVertical: 10,
  },
  clearAllText: {
    color: '#2c3e50',
    fontWeight: '600',
    fontSize: 14,
  },
  listContainer: {
    paddingHorizontal: 15,
    paddingBottom: 20,
    paddingTop: 10,
  },
  itemContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionHeader: {
    backgroundColor: '#f1f5f9',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#3498db',
  },
  sectionHeaderText: {
    color: '#2c3e50',
    fontWeight: 'bold',
    fontSize: 16,
  },
  sectionSubText: {
    color: '#718096',
    fontSize: 13,
    marginTop: 4,
  },
  subjectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    alignItems: 'center',
  },
  subjectText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#2c3e50',
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  titleText: {
    fontSize: 16,
    color: '#4a5568',
    marginBottom: 8,
    fontWeight: '500',
  },
  descriptionText: {
    fontSize: 14,
    color: '#718096',
    marginBottom: 12,
    lineHeight: 20,
  },
  detailsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontSize: 14,
    color: '#718096',
    marginLeft: 5,
  },
  viewDetailsButton: {
    backgroundColor: '#e2e8f0',
    padding: 10,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 10,
  },
  viewDetailsText: {
    color: '#2c3e50',
    fontWeight: '500',
    fontSize: 14,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 50,
    padding: 20,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 18,
    color: '#4a5568',
    marginTop: 15,
    fontWeight: '500',
  },
  emptySubText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#a0aec0',
    marginTop: 5,
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
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e2e8f0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  modalContent: {
    padding: 20,
    paddingBottom: 40,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#4a5568',
  },
  gradeButtonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  gradeButton: {
    padding: 10,
    marginRight: 10,
    marginBottom: 10,
    backgroundColor: '#edf2f7',
    borderRadius: 8,
    minWidth: 40,
    alignItems: 'center',
  },
  gradeButtonText: {
    color: '#4a5568',
    fontSize: 14,
  },
  selectedGradeButton: {
    backgroundColor: '#2c3e50',
  },
  selectedGradeButtonText: {
    color: 'white',
  },
  subjectButtonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  subjectButton: {
    padding: 10,
    marginRight: 10,
    marginBottom: 10,
    backgroundColor: '#edf2f7',
    borderRadius: 8,
  },
  subjectButtonText: {
    color: '#4a5568',
    fontSize: 14,
  },
  selectedSubjectButton: {
    backgroundColor: '#2c3e50',
  },
  selectedSubjectButtonText: {
    color: 'white',
  },
  textInput: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 12,
    backgroundColor: 'white',
    fontSize: 16,
  },
  multilineInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  dateInput: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 12,
    backgroundColor: 'white',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 16,
    color: '#4a5568',
  },
  submitButton: {
    backgroundColor: '#2c3e50',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  disabledButton: {
    backgroundColor: '#a0aec0',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default Homework;
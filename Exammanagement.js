import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
  ScrollView,
  Alert,
  Modal,
  TextInput
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const ExamManagement = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedClassId, setExpandedClassId] = useState(null);
  const [selectedGrade, setSelectedGrade] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [subjectModalVisible, setSubjectModalVisible] = useState(false);
  const [newSubject, setNewSubject] = useState('');
  const [newExam, setNewExam] = useState({
    grade: '',
    subject: '',
    examType: '',
    date: ''
  });

  // All grade levels from KG to 10
  const gradeLevels = ['KG', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
  const examTypes = ['Mid-Term', 'Final', 'Monthly Test', 'Quiz', 'Practical'];
  const [subjects, setSubjects] = useState([
    'Mathematics', 'English', 'Science', 'Social Studies', 
    'Urdu', 'Islamiyat', 'Computer', 'Arts', 'Physical Education'
  ]);

  const generateMockClasses = () => {
    const teachers = [
      'Ms. Amina', 'Mr. Bilal', 'Ms. Fatima', 'Mr. Hamid', 
      'Ms. Iman', 'Mr. Javed', 'Ms. Komal', 'Mr. Latif', 
      'Ms. Nadia', 'Mr. Omar', 'Ms. Parveen'
    ];
    
    return gradeLevels.map((grade, index) => {
      const classSections = ['A', 'B'];
      return classSections.map(section => {
        const classId = `${grade}-${section}`;
        const classSubjects = [subjects[index % subjects.length], subjects[(index + 2) % subjects.length]];
        
        return {
          id: classId,
          className: `Grade ${grade} - Section ${section}`,
          grade,
          section,
          teacher: teachers[index % teachers.length],
          subjects: classSubjects,
          studentsCount: Math.floor(Math.random() * 15) + 25,
          exams: [
            { type: 'Mid-Term', date: '2023-11-15', status: 'Pending' },
            { type: 'Final', date: '2023-12-20', status: 'Pending' }
          ],
          reportSubmitted: false
        };
      });
    }).flat();
  };

  const fetchClasses = async () => {
    try {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      const mockClasses = generateMockClasses();
      setClasses(mockClasses);
    } catch (err) {
      Alert.alert('Error', 'Failed to fetch classes. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchClasses();
  };

  useEffect(() => {
    fetchClasses();
  }, [subjects]); // Refresh classes when subjects change

  const toggleExpand = (id) => {
    setExpandedClassId(prev => (prev === id ? null : id));
  };

  const handleReportSubmit = (id) => {
    setClasses(prev =>
      prev.map(cls =>
        cls.id === id ? { ...cls, reportSubmitted: true } : cls
      )
    );
    Alert.alert('Success', 'Exam report has been submitted.');
  };

  const handleAddExam = () => {
    setModalVisible(true);
  };

  const handleAddSubject = () => {
    setSubjectModalVisible(true);
  };

  const submitNewSubject = () => {
    if (!newSubject.trim()) {
      Alert.alert('Error', 'Please enter a subject name');
      return;
    }
    
    if (subjects.includes(newSubject.trim())) {
      Alert.alert('Error', 'This subject already exists');
      return;
    }
    
    setSubjects([...subjects, newSubject.trim()]);
    setNewSubject('');
    setSubjectModalVisible(false);
    Alert.alert('Success', 'New subject added successfully');
  };

  const submitNewExam = () => {
    if (!newExam.grade || !newExam.subject || !newExam.examType || !newExam.date) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    const updatedClasses = classes.map(cls => {
      if (cls.grade === newExam.grade) {
        return {
          ...cls,
          exams: [...cls.exams, { 
            type: newExam.examType, 
            date: newExam.date,
            status: 'Pending'
          }]
        };
      }
      return cls;
    });

    setClasses(updatedClasses);
    setModalVisible(false);
    setNewExam({ grade: '', subject: '', examType: '', date: '' });
    Alert.alert('Success', 'New exam has been added');
  };

  const filteredClasses = selectedGrade 
    ? classes.filter(cls => cls.grade === selectedGrade)
    : classes;

  const renderClassItem = ({ item }) => {
    const isExpanded = expandedClassId === item.id;
    
    return (
      <TouchableOpacity
        style={styles.classItem}
        onPress={() => toggleExpand(item.id)}
        activeOpacity={0.8}
      >
        <View style={styles.classHeader}>
          <Text style={styles.className}>{item.className}</Text>
          <Text style={styles.studentsCount}>{item.studentsCount} students</Text>
        </View>
        <Text style={styles.teacherName}>Teacher: {item.teacher}</Text>

        {isExpanded && (
          <>
            <Text style={styles.subjects}>Subjects: {item.subjects.join(', ')}</Text>
            
            <Text style={styles.examHeader}>Scheduled Exams:</Text>
            {item.exams.map((exam, index) => (
              <View key={index} style={styles.examItem}>
                <Text style={styles.examText}>
                  {exam.type} - {exam.date}
                </Text>
                <Text style={[
                  styles.examStatus,
                  exam.status === 'Completed' && styles.completedStatus,
                  exam.status === 'Pending' && styles.pendingStatus
                ]}>
                  {exam.status}
                </Text>
              </View>
            ))}

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={styles.detailsButton}
                onPress={() => Alert.alert(
                  'Exam Details',
                  `${item.className}\nSubjects: ${item.subjects.join(', ')}\nTeacher: ${item.teacher}`
                )}
              >
                <Text style={styles.buttonText}>View Details</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.submitButton,
                  item.reportSubmitted && styles.submittedButton
                ]}
                onPress={() => handleReportSubmit(item.id)}
                disabled={item.reportSubmitted}
              >
                <Text style={styles.buttonText}>
                  {item.reportSubmitted ? 'Submitted ✓' : 'Submit Report'}
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </TouchableOpacity>
    );
  };

  const renderGradeFilter = () => (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.filterContainer}
    >
      <TouchableOpacity
        style={[styles.filterButton, !selectedGrade && styles.activeFilter]}
        onPress={() => setSelectedGrade(null)}
      >
        <Text style={[styles.filterText, !selectedGrade && styles.activeFilterText]}>
          All Grades
        </Text>
      </TouchableOpacity>
      
      {gradeLevels.map(grade => (
        <TouchableOpacity
          key={grade}
          style={[styles.filterButton, selectedGrade === grade && styles.activeFilter]}
          onPress={() => setSelectedGrade(grade)}
        >
          <Text style={[styles.filterText, selectedGrade === grade && styles.activeFilterText]}>
            Grade {grade}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#3498db" />
        <Text style={styles.loadingText}>Loading Exam Data...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.header}>🏫 School Exam Management</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity onPress={handleAddSubject} style={styles.addSubjectButton}>
            <Icon name="playlist-add" size={20} color="white" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleAddExam} style={styles.addButton}>
            <Icon name="add" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>
      
      <Text style={styles.subHeader}>Academic Year 2023-24</Text>
      
      {renderGradeFilter()}

      <FlatList
        data={filteredClasses}
        renderItem={renderClassItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="class" size={50} color="#bdc3c7" />
            <Text style={styles.emptyText}>No classes found</Text>
            <Text style={styles.emptySubText}>Try changing filters</Text>
          </View>
        }
      />

      {/* Modal for adding new exam */}
      <Modal
        animationType="slide"
        transparent={false}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Schedule New Exam</Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Icon name="close" size={24} color="#7f8c8d" />
            </TouchableOpacity>
          </View>
          
          <ScrollView contentContainerStyle={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Grade Level</Text>
              <View style={styles.gradeButtons}>
                {gradeLevels.map(grade => (
                  <TouchableOpacity
                    key={grade}
                    style={[
                      styles.gradeButton,
                      newExam.grade === grade && styles.selectedGradeButton
                    ]}
                    onPress={() => setNewExam({...newExam, grade})}
                  >
                    <Text style={[
                      styles.gradeButtonText,
                      newExam.grade === grade && styles.selectedGradeButtonText
                    ]}>
                      {grade}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Subject</Text>
              <View style={styles.subjectButtons}>
                {subjects.map(subject => (
                  <TouchableOpacity
                    key={subject}
                    style={[
                      styles.subjectButton,
                      newExam.subject === subject && styles.selectedSubjectButton
                    ]}
                    onPress={() => setNewExam({...newExam, subject})}
                  >
                    <Text style={[
                      styles.subjectButtonText,
                      newExam.subject === subject && styles.selectedSubjectButtonText
                    ]}>
                      {subject}
                    </Text>
                  </TouchableOpacity>
                ))}
                <TouchableOpacity
                  style={styles.addSubjectButtonSmall}
                  onPress={() => {
                    setModalVisible(false);
                    handleAddSubject();
                  }}
                >
                  <Icon name="add" size={20} color="#3498db" />
                  <Text style={styles.addSubjectButtonText}>Add New</Text>
                </TouchableOpacity>
              </View>
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Exam Type</Text>
              <View style={styles.examTypeButtons}>
                {examTypes.map(type => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.examTypeButton,
                      newExam.examType === type && styles.selectedExamTypeButton
                    ]}
                    onPress={() => setNewExam({...newExam, examType: type})}
                  >
                    <Text style={[
                      styles.examTypeButtonText,
                      newExam.examType === type && styles.selectedExamTypeButtonText
                    ]}>
                      {type}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Exam Date (YYYY-MM-DD)</Text>
              <TextInput
                style={styles.textInput}
                placeholder="2023-12-15"
                value={newExam.date}
                onChangeText={text => setNewExam({...newExam, date: text})}
              />
            </View>
            
            <TouchableOpacity 
              style={styles.submitExamButton}
              onPress={submitNewExam}
            >
              <Text style={styles.submitExamButtonText}>Schedule Exam</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>

      {/* Modal for adding new subject */}
      <Modal
        animationType="slide"
        transparent={false}
        visible={subjectModalVisible}
        onRequestClose={() => setSubjectModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add New Subject</Text>
            <TouchableOpacity onPress={() => setSubjectModalVisible(false)}>
              <Icon name="close" size={24} color="#7f8c8d" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Subject Name</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter subject name"
                value={newSubject}
                onChangeText={text => setNewSubject(text)}
                autoFocus
              />
            </View>
            
            <TouchableOpacity 
              style={styles.submitExamButton}
              onPress={submitNewSubject}
            >
              <Text style={styles.submitExamButtonText}>Add Subject</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={() => {
                setSubjectModalVisible(false);
                setModalVisible(true);
              }}
            >
              <Text style={styles.cancelButtonText}>Back to Exam Form</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 15,
    color: '#7f8c8d',
    fontSize: 16,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#3498db',
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addButton: {
    backgroundColor: '#2980b9',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  addSubjectButton: {
    backgroundColor: '#2980b9',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addSubjectButtonSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    marginRight: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#3498db',
    borderRadius: 8,
  },
  addSubjectButtonText: {
    color: '#3498db',
    marginLeft: 5,
  },
  subHeader: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
    marginBottom: 10,
  },
  filterContainer: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: 'white',
  },
  filterButton: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    marginRight: 10,
    borderRadius: 20,
    backgroundColor: '#ecf0f1',
  },
  activeFilter: {
    backgroundColor: '#3498db',
  },
  filterText: {
    color: '#7f8c8d',
    fontWeight: '500',
  },
  activeFilterText: {
    color: 'white',
  },
  listContainer: {
    paddingHorizontal: 15,
    paddingBottom: 20,
  },
  classItem: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  classHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  className: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  studentsCount: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  teacherName: {
    fontSize: 15,
    color: '#34495e',
    marginBottom: 8,
  },
  subjects: {
    fontSize: 14,
    color: '#555',
    marginBottom: 10,
  },
  examHeader: {
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 6,
  },
  examItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  examText: {
    fontSize: 14,
    color: '#555',
  },
  examStatus: {
    fontSize: 13,
    fontWeight: 'bold',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
  },
  pendingStatus: {
    backgroundColor: '#f39c12',
    color: 'white',
  },
  completedStatus: {
    backgroundColor: '#27ae60',
    color: 'white',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  detailsButton: {
    backgroundColor: '#3498db',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 6,
  },
  submitButton: {
    backgroundColor: '#27ae60',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 6,
  },
  submittedButton: {
    backgroundColor: '#95a5a6',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
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
    color: '#7f8c8d',
    marginTop: 15,
  },
  emptySubText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#bdc3c7',
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
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  modalContent: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 10,
  },
  gradeButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  gradeButton: {
    padding: 10,
    marginRight: 10,
    marginBottom: 10,
    backgroundColor: '#ecf0f1',
    borderRadius: 8,
    minWidth: 40,
    alignItems: 'center',
  },
  selectedGradeButton: {
    backgroundColor: '#3498db',
  },
  gradeButtonText: {
    color: '#7f8c8d',
  },
  selectedGradeButtonText: {
    color: 'white',
  },
  subjectButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  subjectButton: {
    padding: 10,
    marginRight: 10,
    marginBottom: 10,
    backgroundColor: '#ecf0f1',
    borderRadius: 8,
  },
  selectedSubjectButton: {
    backgroundColor: '#3498db',
  },
  subjectButtonText: {
    color: '#7f8c8d',
  },
  selectedSubjectButtonText: {
    color: 'white',
  },
  examTypeButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  examTypeButton: {
    padding: 10,
    marginRight: 10,
    marginBottom: 10,
    backgroundColor: '#ecf0f1',
    borderRadius: 8,
  },
  selectedExamTypeButton: {
    backgroundColor: '#3498db',
  },
  examTypeButtonText: {
    color: '#7f8c8d',
  },
  selectedExamTypeButtonText: {
    color: 'white',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ecf0f1',
    borderRadius: 8,
    padding: 12,
    backgroundColor: 'white',
    fontSize: 16,
  },
  submitExamButton: {
    backgroundColor: '#27ae60',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  submitExamButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#3498db',
  },
  cancelButtonText: {
    color: '#3498db',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ExamManagement;
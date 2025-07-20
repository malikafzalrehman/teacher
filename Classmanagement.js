import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Alert, 
  Modal, 
  TextInput, 
  ScrollView,
  ActivityIndicator
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import firestore from '@react-native-firebase/firestore';

const ClassManagement = () => {
  // Constants
  const GRADES = ['Nursery', 'KG', 'Prep', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
  const SECTIONS = ['A', 'B', 'C', 'D', 'E', 'F'];
  const SUBJECTS = ['Math', 'Science', 'English', 'Urdu', 'Islamiyat', 'Social Studies', 'Computer', 'Physics', 'Chemistry', 'Biology'];

  // State
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assignmentModalVisible, setAssignmentModalVisible] = useState(false);
  const [classModalVisible, setClassModalVisible] = useState(false);
  const [teacherModalVisible, setTeacherModalVisible] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [newClass, setNewClass] = useState({
    grade: GRADES[0],
    section: SECTIONS[0]
  });
  const [newTeacher, setNewTeacher] = useState({
    name: '',
    qualification: '',
    contact: ''
  });
  const [assignmentData, setAssignmentData] = useState({
    teacher: '',
    subject: '',
    isClassIncharge: false
  });
  const [activeTab, setActiveTab] = useState('classes'); // 'classes' or 'teachers'

  // Load data
  useEffect(() => {
    const loadData = async () => {
      try {
        const [classesData, teachersData] = await Promise.all([
          AsyncStorage.getItem('classes'),
          AsyncStorage.getItem('teachers')
        ]);
        
        setClasses(classesData ? JSON.parse(classesData) : []);
        setTeachers(teachersData ? JSON.parse(teachersData) : []);
        setLoading(false);
      } catch (error) {
        Alert.alert('Error', 'Failed to load data');
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  // Save data
  useEffect(() => {
    const saveData = async () => {
      try {
        await Promise.all([
          AsyncStorage.setItem('classes', JSON.stringify(classes)),
          AsyncStorage.setItem('teachers', JSON.stringify(teachers))
        ]);
      } catch (error) {
        Alert.alert('Error', 'Failed to save data');
      }
    };
    
    if (!loading) {
      saveData();
    }
  }, [classes, teachers, loading]);

  // Fetch teachers from Firestore
  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        setLoading(true);
        const snapshot = await firestore().collection('Teacher').get();
        const teachersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setTeachers(teachersData);
      } catch (error) {
        console.error('Error fetching teachers:', error);
        Alert.alert('Error', 'Failed to load teachers. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchTeachers();
  }, []);

  // Class Management
  const handleAddClass = () => {
    setNewClass({ grade: GRADES[0], section: SECTIONS[0] });
    setClassModalVisible(true);
  };

  const saveClass = () => {
    if (!newClass.grade || !newClass.section) {
      Alert.alert('Error', 'Please select both grade and section');
      return;
    }

    const classExists = classes.some(
      c => c.grade === newClass.grade && c.section === newClass.section
    );

    if (classExists) {
      Alert.alert('Error', 'This class already exists');
      return;
    }

    const classToAdd = {
      id: Date.now().toString(),
      grade: newClass.grade,
      section: newClass.section,
      teacher: null,
      subject: null,
      isClassIncharge: false,
      createdAt: new Date().toISOString()
    };

    setClasses([...classes, classToAdd]);
    setClassModalVisible(false);
    Alert.alert('Success', 'Class added successfully');
  };

  const deleteClass = (classId) => {
    Alert.alert('Confirm Delete', 'Are you sure you want to delete this class?', [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Delete', 
        onPress: () => {
          setClasses(classes.filter(c => c.id !== classId));
          Alert.alert('Success', 'Class deleted successfully');
        }
      }
    ]);
  };

  // Teacher Management
  const handleAddTeacher = () => {
    setNewTeacher({ name: '', qualification: '', contact: '' });
    setTeacherModalVisible(true);
  };

  const saveTeacher = () => {
    if (!newTeacher.name.trim()) {
      Alert.alert('Error', 'Please enter teacher name');
      return;
    }

    const teacherExists = teachers.some(
      t => t.name.toLowerCase() === newTeacher.name.toLowerCase().trim()
    );

    if (teacherExists) {
      Alert.alert('Error', 'Teacher with this name already exists');
      return;
    }

    const teacherToAdd = {
      id: Date.now().toString(),
      name: newTeacher.name.trim(),
      qualification: newTeacher.qualification.trim(),
      contact: newTeacher.contact.trim(),
      isActive: true,
      createdAt: new Date().toISOString()
    };

    setTeachers([...teachers, teacherToAdd]);
    setTeacherModalVisible(false);
    Alert.alert('Success', 'Teacher added successfully');
  };

  const deleteTeacher = (teacherId) => {
    const isAssigned = classes.some(c => c.teacher === teacherId);
    
    if (isAssigned) {
      Alert.alert('Error', 'This teacher is assigned to a class and cannot be deleted');
      return;
    }

    Alert.alert('Confirm Delete', 'Are you sure you want to delete this teacher?', [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Delete', 
        onPress: () => {
          setTeachers(teachers.filter(t => t.id !== teacherId));
          Alert.alert('Success', 'Teacher deleted successfully');
        }
      }
    ]);
  };

  // Assignment Management
  const openAssignmentModal = (classItem) => {
    setSelectedClass(classItem);
    setAssignmentData({
      teacher: classItem.teacher || '',
      subject: classItem.subject || '',
      isClassIncharge: classItem.isClassIncharge || false
    });
    setAssignmentModalVisible(true);
  };

  const handleAssignTeacher = () => {
    if (!assignmentData.teacher || !assignmentData.subject) {
      Alert.alert('Error', 'Please select both teacher and subject');
      return;
    }

    // If setting as class incharge, remove from other classes
    let updatedClasses = [...classes];
    if (assignmentData.isClassIncharge) {
      updatedClasses = updatedClasses.map(c => ({
        ...c,
        isClassIncharge: c.teacher === assignmentData.teacher ? false : c.isClassIncharge
      }));
    }

    const finalClasses = updatedClasses.map(c => 
      c.id === selectedClass.id 
        ? { 
            ...c, 
            teacher: assignmentData.teacher,
            subject: assignmentData.subject,
            isClassIncharge: assignmentData.isClassIncharge,
            updatedAt: new Date().toISOString()
          } 
        : c
    );

    setClasses(finalClasses);
    setAssignmentModalVisible(false);
    Alert.alert('Success', 'Teacher assigned successfully');
  };

  const handleRemoveAssignment = (classId) => {
    setClasses(classes.map(c => 
      c.id === classId 
        ? { ...c, teacher: null, subject: null, isClassIncharge: false, updatedAt: new Date().toISOString() } 
        : c
    ));
  };

  // Render Methods
  const renderClassItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.classTitle}>{item.grade}-{item.section}</Text>
        <Text style={styles.classDate}>
          {new Date(item.createdAt).toLocaleDateString()}
          {item.updatedAt && ` (Updated: ${new Date(item.updatedAt).toLocaleDateString()})`}
        </Text>
      </View>
      
      {item.teacher ? (
        <>
          <View style={styles.assignmentInfo}>
            <Text style={styles.infoText}>
              <Text style={styles.infoLabel}>Teacher: </Text>
              {teachers.find(t => t.id === item.teacher)?.name || 'Unknown'}
            </Text>
            <Text style={styles.infoText}>
              <Text style={styles.infoLabel}>Subject: </Text>
              {item.subject}
            </Text>
            {item.isClassIncharge && (
              <Text style={styles.inchargeBadge}>Class Incharge</Text>
            )}
          </View>
          
          <View style={styles.cardActions}>
            <TouchableOpacity 
              style={[styles.actionButton, styles.changeButton]}
              onPress={() => openAssignmentModal(item)}
            >
              <Text style={styles.actionButtonText}>Change</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionButton, styles.removeButton]}
              onPress={() => handleRemoveAssignment(item.id)}
            >
              <Text style={styles.actionButtonText}>Remove</Text>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <View style={styles.unassignedContainer}>
          <Text style={styles.unassignedText}>No teacher assigned</Text>
          <TouchableOpacity 
            style={[styles.actionButton, styles.assignButton]}
            onPress={() => openAssignmentModal(item)}
          >
            <Text style={styles.actionButtonText}>Assign</Text>
          </TouchableOpacity>
        </View>
      )}
      
      <TouchableOpacity 
        style={styles.deleteButton}
        onPress={() => deleteClass(item.id)}
      >
        <Text style={styles.deleteButtonText}>Delete Class</Text>
      </TouchableOpacity>
    </View>
  );

  const renderTeacherItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.teacherName}>{item.name}</Text>
        <Text style={styles.teacherDate}>
          Added: {new Date(item.createdAt).toLocaleDateString()}
        </Text>
      </View>
      
      <View style={styles.teacherInfo}>
        <Text style={styles.infoText}>
          <Text style={styles.infoLabel}>Qualification: </Text>
          {item.qualification || 'Not specified'}
        </Text>
        <Text style={styles.infoText}>
          <Text style={styles.infoLabel}>Contact: </Text>
          {item.contact || 'Not specified'}
        </Text>
        <Text style={styles.infoText}>
          <Text style={styles.infoLabel}>Status: </Text>
          <Text style={item.isActive ? styles.activeStatus : styles.inactiveStatus}>
            {item.isActive ? 'Active' : 'Inactive'}
          </Text>
        </Text>
      </View>
      
      <View style={styles.cardActions}>
        <TouchableOpacity 
          style={[styles.actionButton, classes.some(c => c.teacher === item.id) ? styles.assignedButton : styles.assignButton]}
          onPress={() => {
            const assignedClass = classes.find(c => c.teacher === item.id);
            if (assignedClass) {
              setSelectedClass(assignedClass);
              setAssignmentData({
                teacher: item.id,
                subject: assignedClass.subject,
                isClassIncharge: assignedClass.isClassIncharge
              });
              setAssignmentModalVisible(true);
            }
          }}
        >
          <Text style={styles.actionButtonText}>
            {classes.some(c => c.teacher === item.id) ? 'View Assignment' : 'Not Assigned'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => deleteTeacher(item.id)}
        >
          <Text style={styles.actionButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderTeacherOption = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.optionItem,
        assignmentData.teacher === item.id && styles.selectedOption
      ]}
      onPress={() => setAssignmentData({...assignmentData, teacher: item.id})}
    >
      <Text style={styles.optionText}>{item.name}</Text>
      <Text style={styles.optionSubText}>{item.qualification}</Text>
      {classes.some(c => c.teacher === item.id && c.isClassIncharge) && (
        <Text style={styles.inchargeBadge}>Current Incharge</Text>
      )}
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3498db" />
        <Text style={styles.loadingText}>Loading School Data...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>School Teacher Management</Text>
        <Text style={styles.headerSubtitle}>
          {classes.length} Classes | {teachers.length} Teachers
        </Text>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionBar}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.primaryButton]}
          onPress={handleAddClass}
        >
          <Text style={styles.actionButtonText}>+ Add Class</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.primaryButton]}
          onPress={handleAddTeacher}
        >
          <Text style={styles.actionButtonText}>+ Add Teacher</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[
            styles.tab, 
            activeTab === 'classes' && styles.activeTab
          ]}
          onPress={() => setActiveTab('classes')}
        >
          <Text style={[
            styles.tabText, 
            activeTab === 'classes' && styles.activeTabText
          ]}>
            Classes
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.tab, 
            activeTab === 'teachers' && styles.activeTab
          ]}
          onPress={() => setActiveTab('teachers')}
        >
          <Text style={[
            styles.tabText, 
            activeTab === 'teachers' && styles.activeTabText
          ]}>
            Teachers
          </Text>
        </TouchableOpacity>
      </View>

      {/* Class List */}
      {activeTab === 'classes' ? (
        <FlatList
          data={classes}
          renderItem={renderClassItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No classes added yet</Text>
              <TouchableOpacity 
                style={[styles.actionButton, styles.primaryButton]}
                onPress={handleAddClass}
              >
                <Text style={styles.actionButtonText}>Add Your First Class</Text>
              </TouchableOpacity>
            </View>
          }
        />
      ) : (
        /* Teachers List */
        <FlatList
          data={teachers}
          renderItem={renderTeacherItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No teachers added yet</Text>
              <TouchableOpacity 
                style={[styles.actionButton, styles.primaryButton]}
                onPress={handleAddTeacher}
              >
                <Text style={styles.actionButtonText}>Add Your First Teacher</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}

      {/* Add Class Modal */}
      <Modal
        visible={classModalVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setClassModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Add New Class</Text>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>Grade:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {GRADES.map(grade => (
                <TouchableOpacity
                  key={grade}
                  style={[
                    styles.optionButton,
                    newClass.grade === grade && styles.selectedOptionButton
                  ]}
                  onPress={() => setNewClass({...newClass, grade})}
                >
                  <Text style={styles.optionButtonText}>{grade}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>Section:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {SECTIONS.map(section => (
                <TouchableOpacity
                  key={section}
                  style={[
                    styles.optionButton,
                    newClass.section === section && styles.selectedOptionButton
                  ]}
                  onPress={() => setNewClass({...newClass, section})}
                >
                  <Text style={styles.optionButtonText}>{section}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
          
          <View style={styles.modalActions}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => setClassModalVisible(false)}
            >
              <Text style={styles.modalButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.modalButton, styles.saveButton]}
              onPress={saveClass}
            >
              <Text style={styles.modalButtonText}>Save Class</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Add Teacher Modal */}
      <Modal
        visible={teacherModalVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setTeacherModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Add New Teacher</Text>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>Full Name:</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter teacher's full name"
              value={newTeacher.name}
              onChangeText={(text) => setNewTeacher({...newTeacher, name: text})}
            />
          </View>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>Qualification:</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. M.Ed, B.Sc"
              value={newTeacher.qualification}
              onChangeText={(text) => setNewTeacher({...newTeacher, qualification: text})}
            />
          </View>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>Contact Number:</Text>
            <TextInput
              style={styles.input}
              placeholder="+92 300 1234567"
              keyboardType="phone-pad"
              value={newTeacher.contact}
              onChangeText={(text) => setNewTeacher({...newTeacher, contact: text})}
            />
          </View>
          
          <View style={styles.modalActions}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => setTeacherModalVisible(false)}
            >
              <Text style={styles.modalButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.modalButton, styles.saveButton]}
              onPress={saveTeacher}
            >
              <Text style={styles.modalButtonText}>Save Teacher</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Assignment Modal */}
      <Modal
        visible={assignmentModalVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setAssignmentModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>
            {selectedClass ? `Assign Teacher to ${selectedClass.grade}-${selectedClass.section}` : 'Assign Teacher'}
          </Text>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>Select Teacher:</Text>
            <FlatList
              data={teachers}
              renderItem={renderTeacherOption}
              keyExtractor={item => item.id}
              style={styles.optionsList}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>No teachers available</Text>
                  <TouchableOpacity 
                    style={[styles.actionButton, styles.primaryButton]}
                    onPress={() => {
                      setAssignmentModalVisible(false);
                      handleAddTeacher();
                    }}
                  >
                    <Text style={styles.actionButtonText}>Add New Teacher</Text>
                  </TouchableOpacity>
                </View>
              }
            />
          </View>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>Select Subject:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {SUBJECTS.map(subject => (
                <TouchableOpacity
                  key={subject}
                  style={[
                    styles.optionButton,
                    assignmentData.subject === subject && styles.selectedOptionButton
                  ]}
                  onPress={() => setAssignmentData({...assignmentData, subject})}
                >
                  <Text style={styles.optionButtonText}>{subject}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
          
          <View style={styles.checkboxContainer}>
            <TouchableOpacity
              style={[
                styles.checkbox,
                assignmentData.isClassIncharge && styles.checkedCheckbox
              ]}
              onPress={() => setAssignmentData({
                ...assignmentData, 
                isClassIncharge: !assignmentData.isClassIncharge
              })}
            >
              {assignmentData.isClassIncharge && (
                <Text style={styles.checkboxIcon}>✓</Text>
              )}
            </TouchableOpacity>
            <Text style={styles.checkboxLabel}>Set as Class Incharge</Text>
          </View>
          
          <View style={styles.modalActions}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => setAssignmentModalVisible(false)}
            >
              <Text style={styles.modalButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.modalButton, styles.saveButton]}
              onPress={handleAssignTeacher}
            >
              <Text style={styles.modalButtonText}>Save Assignment</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

// Professional Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 15,
    color: '#6c757d',
    fontSize: 16,
  },
  header: {
    backgroundColor: '#343a40',
    paddingVertical: 20,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#dee2e6',
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '600',
    textAlign: 'center',
  },
  headerSubtitle: {
    color: '#adb5bd',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 5,
  },
  actionBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#dee2e6',
    backgroundColor: '#ffffff',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#007bff',
  },
  tabText: {
    color: '#6c757d',
    fontSize: 14,
    fontWeight: '500',
  },
  activeTabText: {
    color: '#007bff',
  },
  listContainer: {
    padding: 15,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  classTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212529',
  },
  teacherName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212529',
  },
  classDate: {
    fontSize: 12,
    color: '#6c757d',
  },
  teacherDate: {
    fontSize: 12,
    color: '#6c757d',
  },
  assignmentInfo: {
    marginBottom: 15,
  },
  teacherInfo: {
    marginBottom: 15,
  },
  infoText: {
    fontSize: 14,
    color: '#495057',
    marginBottom: 5,
  },
  infoLabel: {
    fontWeight: '500',
    color: '#343a40',
  },
  inchargeBadge: {
    backgroundColor: '#d4edda',
    color: '#155724',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    fontSize: 12,
    fontWeight: '500',
    alignSelf: 'flex-start',
    marginTop: 5,
  },
  activeStatus: {
    color: '#155724',
    fontWeight: '500',
  },
  inactiveStatus: {
    color: '#721c24',
    fontWeight: '500',
  },
  unassignedContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  unassignedText: {
    color: '#dc3545',
    fontStyle: 'italic',
    fontSize: 14,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 4,
    marginLeft: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#007bff',
  },
  assignButton: {
    backgroundColor: '#28a745',
  },
  changeButton: {
    backgroundColor: '#ffc107',
  },
  removeButton: {
    backgroundColor: '#dc3545',
  },
  assignedButton: {
    backgroundColor: '#6c757d',
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
  deleteButton: {
    marginTop: 10,
    padding: 8,
    borderRadius: 4,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#dc3545',
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#dc3545',
    fontSize: 14,
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 30,
  },
  emptyText: {
    color: '#6c757d',
    fontSize: 16,
    marginBottom: 15,
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 20,
    textAlign: 'center',
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#495057',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#ced4da',
    borderRadius: 4,
    padding: 10,
    fontSize: 14,
    color: '#495057',
  },
  optionButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 4,
    backgroundColor: '#e9ecef',
    marginRight: 8,
  },
  selectedOptionButton: {
    backgroundColor: '#007bff',
  },
  optionButtonText: {
    fontSize: 14,
    color: '#212529',
  },
  selectedOptionButtonText: {
    color: '#ffffff',
  },
  optionsList: {
    maxHeight: 200,
    marginBottom: 10,
  },
  optionItem: {
    padding: 12,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 4,
    marginBottom: 8,
  },
  selectedOption: {
    backgroundColor: '#e7f5ff',
    borderColor: '#007bff',
  },
  optionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#212529',
  },
  optionSubText: {
    fontSize: 12,
    color: '#6c757d',
    marginTop: 2,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: '#adb5bd',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  checkedCheckbox: {
    backgroundColor: '#007bff',
    borderColor: '#007bff',
  },
  checkboxIcon: {
    color: '#ffffff',
    fontSize: 12,
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#495057',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 4,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#dc3545',
    marginRight: 10,
  },
  saveButton: {
    backgroundColor: '#007bff',
    marginLeft: 10,
  },
  modalButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  cancelButtonText: {
    color: '#dc3545',
  },
  saveButtonText: {
    color: '#ffffff',
  },
});

export default ClassManagement;
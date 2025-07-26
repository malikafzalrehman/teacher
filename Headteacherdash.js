import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ScrollView, Modal, TextInput } from 'react-native';
import { useSelector } from 'react-redux';
import { getAllOfCollectionwhere, getAllOfCollectionwhere1, saveData } from './service/main';

// Enhanced Data Structures
const allGrades = ['Prep', 'Nursery', 'KG', ...Array.from({length: 12}, (_, i) => `Grade ${i+1}`)];
const allSections = ['A', 'B', 'C', 'D'];
const baseSubjects = ['Mathematics', 'Science', 'English', 'Urdu', 'Islamiyat', 'Physics', 'Chemistry', 'Biology', 'Computer Science', 'Pakistan Studies'];

// Generate comprehensive mock data
const generateMockTeachers = () => {
  return baseSubjects.map((subject, index) => ({
    id: `T-${index + 100}`,
    name: `Teacher ${index + 1}`,
    subjects: [subject],
    isAdminAdded: index % 3 === 0,
    qualifications: ['B.Ed', 'M.Ed', 'PhD'][index % 3],
    joiningDate: new Date(2023, index % 12, (index % 28) + 1).toISOString().split('T')[0],
    contact: `0300-${Math.floor(1000 + Math.random() * 9000)}`
  }));
};

const generateMockClasses = () => {
  return allGrades.flatMap(grade => 
    allSections.map((section, i) => ({
      id: `${grade}-${section}`,
      grade,
      section,
      classTeacher: i % 2 === 0 ? `T-${100 + (i % 10)}` : null,
      roomNumber: `${grade.slice(-2)}${section}${i + 1}`.replace(/\s/g, ''),
      subjects: [...baseSubjects]
    }))
  );
};

const generateMockTimetable = () => {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const periods = ['08:00-09:00', '09:00-10:00', '10:15-11:15', '11:15-12:15', '01:00-02:00'];
  
  return allGrades.flatMap(grade => 
    allSections.flatMap(section => 
      days.flatMap(day => 
        periods.map((period, i) => ({
          id: `${grade}-${section}-${day}-${period}`,
          day,
          time: period,
          grade,
          section,
          subject: baseSubjects[i % baseSubjects.length],
          teacherId: i % 3 === 0 ? `T-${100 + (i % 10)}` : null,
        }))
      )
    )
  ).slice(0, 50); // Limit to 50 entries for demo
};

const mockTeachers = generateMockTeachers();
const mockClasses = generateMockClasses();
const mockTimetable = generateMockTimetable();

const HeadteacherDash = () => {
  const [teachers, setTeachers] = useState([]);
  const [classes, setClasses] = useState(mockClasses);
  const [timetable, setTimetable] = useState(mockTimetable);
  const [subjects, setSubjects] = useState(baseSubjects);
  
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [selectedGrade, setSelectedGrade] = useState('Grade 12');
  const [selectedSection, setSelectedSection] = useState('A');
  const [selectedDay, setSelectedDay] = useState('Monday');
  
  const [isTeacherModalVisible, setIsTeacherModalVisible] = useState(false);
  const [isSubjectModalVisible, setIsSubjectModalVisible] = useState(false);
  const [newTeacher, setNewTeacher] = useState({
    name: '',
    subjects: [],
    qualifications: '',
    contact: ''
  });
  const state=useSelector(state=>state)
 
  const [newSubject, setNewSubject] = useState('');

  // Filter timetable based on selections
  const filteredTimetable = timetable.filter(item => 
    item.grade === selectedGrade && 
    item.section === selectedSection &&
    item.day === selectedDay
  );

  useEffect(()=>{
    getTEacherByheadID()
  },[])
  // Get current class details
  const currentClass = classes.find(c => 
    c.grade === selectedGrade && c.section === selectedSection
  );

  // Assign teacher to class period
  const assignTeacherToPeriod = (teacherId, periodId) => {
    const updatedTimetable = timetable.map(item => {
      if (item.id === periodId) {
        return {
          ...item,
          teacherId,
        };
      }
      return item;
    });
    setTimetable(updatedTimetable);
    Alert.alert('Success', 'Teacher assigned successfully!');
  };
const getTEacherByheadID=async()=>{
  console.log(state.counter.user.id);
  
  let data=await getAllOfCollectionwhere("Teacher","headid",state.counter.user.id)
  setTeachers(data)
  
}
  // Add new teacher
  const handleAddTeacher =async () => {
    // if (!newTeacher.name || !newTeacher.qualifications) {
    //   Alert.alert('Error', 'Please fill all required fields');
    //   return;
    // }
let id= `T-${Math.floor(1000 + Math.random() * 9000)}`
    const teacher = {
      id:id,
      ...newTeacher,
      isAdminAdded: true,
      joiningDate: new Date().toISOString().split('T')[0],
      headid:state.counter.user.id,
      schoolId:state.counter.user.schoolId,
      school:state.counter.user.school,
      role:
"teacher"

    };
    await saveData("Teacher",id,teacher)

    // setTeachers([...teachers, teacher]);
    // setNewTeacher({
    //   name: '',
    //   subjects: [],
    //   qualifications: '',
    //   contact: ''
    // });
       getTEacherByheadID()
    setIsTeacherModalVisible(false);
    Alert.alert('Success', 'Teacher added successfully!');
  };

  // Add new subject
  const handleAddSubject = () => {
    if (!newSubject.trim()) {
      Alert.alert('Error', 'Please enter a subject name');
      return;
    }

    if (subjects.includes(newSubject)) {
      Alert.alert('Error', 'Subject already exists');
      return;
    }

    setSubjects([...subjects, newSubject]);
    
    // Add subject to all classes
    const updatedClasses = classes.map(cls => ({
      ...cls,
      subjects: [...cls.subjects, newSubject]
    }));
    setClasses(updatedClasses);
    
    setNewSubject('');
    setIsSubjectModalVisible(false);
    Alert.alert('Success', 'Subject added successfully!');
  };

  // Get teacher name by ID
  const getTeacherName = (teacherId) => {
    const teacher = teachers.find(t => t.id === teacherId);
    return teacher ? teacher.name : 'Not assigned';
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Headteacher Dashboard</Text>
      
      {/* Class Selection Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Select Class</Text>
        
        <View style={styles.classSelector}>
          <Text style={styles.selectorLabel}>Grade:</Text>
          <View style={styles.gradeGrid}>
            {allGrades.map(grade => (
              <TouchableOpacity
                key={grade}
                style={[
                  styles.gradeButton,
                  selectedGrade === grade && styles.selectedGrade
                ]}
                onPress={() => {
                  setSelectedGrade(grade);
                  // Reset to first section when grade changes
                  setSelectedSection('A');
                }}
              >
                <Text style={styles.gradeText}>{grade}</Text>
              </TouchableOpacity>
            ))}
          </View>
          
          <Text style={styles.selectorLabel}>Section:</Text>
          <View style={styles.sectionRow}>
            {allSections.map(section => (
              <TouchableOpacity
                key={section}
                style={[
                  styles.sectionButton,
                  selectedSection === section && styles.selectedSection
                ]}
                onPress={() => setSelectedSection(section)}
              >
                <Text style={styles.sectionText}>{section}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        <Text style={styles.selectorLabel}>Day:</Text>
        <View style={styles.dayRow}>
          {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map(day => (
            <TouchableOpacity
              key={day}
              style={[
                styles.dayButton,
                selectedDay === day && styles.selectedDay
              ]}
              onPress={() => setSelectedDay(day)}
            >
              <Text style={styles.dayText}>{day.substring(0, 3)}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Class Information */}
      {currentClass && (
        <View style={styles.classInfo}>
          <Text style={styles.classTitle}>{selectedGrade}-{selectedSection}</Text>
          <Text>Class Teacher: {currentClass.classTeacher ? getTeacherName(currentClass.classTeacher) : 'Not assigned'}</Text>
          <Text>Room: {currentClass.roomNumber}</Text>
          
          <View style={styles.subjectsContainer}>
            <View style={styles.subjectsHeader}>
              <Text style={styles.subjectsTitle}>Subjects:</Text>
              <TouchableOpacity 
                style={styles.addSubjectButton}
                onPress={() => setIsSubjectModalVisible(true)}
              >
                <Text style={styles.addButtonText}>+ Add</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.subjectChips}>
              {currentClass.subjects.map(subject => (
                <View key={subject} style={styles.subjectChip}>
                  <Text style={styles.subjectText}>{subject}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      )}

      {/* Teacher Management */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Teachers</Text>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => setIsTeacherModalVisible(true)}
          >
            <Text style={styles.addButtonText}>+ Add Teacher</Text>
          </TouchableOpacity>
        </View>
        
        <FlatList
          horizontal
          data={teachers}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.teacherCard,
                selectedTeacher === item.id && styles.selectedTeacherCard
              ]}
              onPress={() => setSelectedTeacher(item.id)}
            >
              <Text style={styles.teacherName}>{item.name}</Text>
              <Text style={styles.teacherQualification}>{item.qualifications}</Text>
              <View style={styles.teacherSubjects}>
                {item.subjects.map(sub => (
                  <Text key={sub} style={styles.teacherSubject}>{sub}</Text>
                ))}
              </View>
              <Text style={styles.teacherContact}>{item.contact}</Text>
              {item.isAdminAdded && <Text style={styles.adminBadge}>Admin</Text>}
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Timetable Management */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          Timetable for {selectedGrade}-{selectedSection} ({selectedDay})
        </Text>
        
        {filteredTimetable.length === 0 ? (
          <Text style={styles.noDataText}>No timetable entries for this selection</Text>
        ) : (
          <View style={styles.timetableContainer}>
            {filteredTimetable.map(item => (
              <View key={item.id} style={styles.timetableSlot}>
                <View style={styles.slotHeader}>
                  <Text style={styles.slotTime}>{item.time}</Text>
                  <Text style={styles.slotSubject}>{item.subject}</Text>
                </View>
                
                <View style={styles.slotTeacher}>
                  <Text>Teacher: {item.teacherId ? getTeacherName(item.teacherId) : 'Not assigned'}</Text>
                  
                  {selectedTeacher && (
                    <TouchableOpacity
                      style={styles.assignButton}
                      onPress={() => assignTeacherToPeriod(selectedTeacher, item.id)}
                    >
                      <Text style={styles.assignButtonText}>
                        {item.teacherId ? 'Reassign' : 'Assign'}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Add Teacher Modal */}
      <Modal
        visible={isTeacherModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsTeacherModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Teacher</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Full Name"
              placeholderTextColor={"black"}
              value={newTeacher.name}
              onChangeText={text => setNewTeacher({...newTeacher, name: text})}
            />
            
            <TextInput
              style={styles.input}
              placeholderTextColor={"black"}

              placeholder="Qualifications (e.g., M.Ed)"
              value={newTeacher.qualifications}
              onChangeText={text => setNewTeacher({...newTeacher, qualifications: text})}
            />
            
            <TextInput
              placeholderTextColor={"black"}

style={styles.input}
              placeholder="Contact Number"
              value={newTeacher.contact}
              onChangeText={text => setNewTeacher({...newTeacher, contact: text})}
              keyboardType="phone-pad"
            />
             <TextInput
                placeholderTextColor={"black"}
              style={styles.input}
              placeholder="Email"
              value={newTeacher.password}
              onChangeText={text => setNewTeacher({...newTeacher, email: text})}
              keyboardType="email"
            />
              <TextInput
                 placeholderTextColor={"black"}
              style={styles.input}
              placeholder="Password"
              value={newTeacher.password}
              onChangeText={text => setNewTeacher({...newTeacher, password: text})}
              keyboardType="password"
            />
            <Text style={styles.subLabel}>Select Subjects:</Text>
            <View style={styles.modalSubjects}>
              {subjects.map(subject => (
                <TouchableOpacity
                  key={subject}
                  style={[
                    styles.subjectOption,
                    newTeacher.subjects.includes(subject) && styles.selectedSubjectOption
                  ]}
                  onPress={() => {
                    if (newTeacher.subjects.includes(subject)) {
                      setNewTeacher({
                        ...newTeacher,
                        subjects: newTeacher.subjects.filter(s => s !== subject)
                      });
                    } else {
                      setNewTeacher({
                        ...newTeacher,
                        subjects: [...newTeacher.subjects, subject]
                      });
                    }
                  }}
                >
                  <Text>{subject}</Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setIsTeacherModalVisible(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleAddTeacher}
              >
                <Text style={styles.buttonText}>Save Teacher</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Add Subject Modal */}
      <Modal
        visible={isSubjectModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsSubjectModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Subject</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Subject Name"
              value={newSubject}
              onChangeText={setNewSubject}
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setIsSubjectModalVisible(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleAddSubject}
              >
                <Text style={styles.buttonText}>Add Subject</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

// Enhanced Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: '#f5f5f5',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#2c3e50',
  },
  section: {
    marginBottom: 20,
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  classSelector: {
    marginBottom: 15,
  },
  selectorLabel: {
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#34495e',
  },
  gradeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  gradeButton: {
    width: '30%',
    padding: 10,
    margin: '1.5%',
    backgroundColor: '#ecf0f1',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedGrade: {
    backgroundColor: '#3498db',
  },
  gradeText: {
    fontSize: 14,
  },
  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sectionButton: {
    width: '22%',
    padding: 10,
    backgroundColor: '#ecf0f1',
    borderRadius: 8,
    alignItems: 'center',
  },
  selectedSection: {
    backgroundColor: '#3498db',
  },
  sectionText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  dayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayButton: {
    width: '18%',
    padding: 8,
    backgroundColor: '#ecf0f1',
    borderRadius: 8,
    alignItems: 'center',
  },
  selectedDay: {
    backgroundColor: '#3498db',
  },
  dayText: {
    fontSize: 14,
  },
  classInfo: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  classTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#2c3e50',
  },
  subjectsContainer: {
    marginTop: 10,
  },
  subjectsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  subjectsTitle: {
    fontWeight: 'bold',
    color: '#34495e',
  },
  subjectChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  subjectChip: {
    backgroundColor: '#e0f7fa',
    padding: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  subjectText: {
    fontSize: 14,
    color: '#00796b',
  },
  addSubjectButton: {
    backgroundColor: '#27ae60',
    padding: 6,
    borderRadius: 5,
    paddingHorizontal: 10,
  },
  teacherCard: {
    width: 180,
    padding: 12,
    marginRight: 10,
    backgroundColor: '#ecf0f1',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  selectedTeacherCard: {
    borderColor: '#3498db',
    borderWidth: 2,
    backgroundColor: '#d6eaf8',
  },
  teacherName: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 5,
  },
  teacherQualification: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 5,
  },
  teacherSubjects: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 5,
  },
  teacherSubject: {
    fontSize: 12,
    backgroundColor: '#d5f5e3',
    padding: 3,
    borderRadius: 4,
    marginRight: 5,
    marginBottom: 5,
  },
  teacherContact: {
    fontSize: 12,
    color: '#3498db',
  },
  adminBadge: {
    position: 'absolute',
    top: 5,
    right: 5,
    fontSize: 10,
    backgroundColor: '#e74c3c',
    color: 'white',
    padding: 2,
    borderRadius: 3,
  },
  timetableContainer: {
    marginTop: 10,
  },
  timetableSlot: {
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#3498db',
  },
  slotHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  slotTime: {
    fontWeight: 'bold',
    color: '#3498db',
  },
  slotSubject: {
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  slotTeacher: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  assignButton: {
    backgroundColor: '#3498db',
    padding: 6,
    borderRadius: 4,
    paddingHorizontal: 10,
  },
  assignButtonText: {
    color: 'white',
    fontSize: 12,
  },
  noDataText: {
    textAlign: 'center',
    color: '#7f8c8d',
    padding: 10,
  },
  addButton: {
    backgroundColor: '#27ae60',
    padding: 8,
    borderRadius: 5,
    paddingHorizontal: 12,
  },
  addButtonText: {
    color: 'white',
    fontSize: 14,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '90%',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#2c3e50',
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
    color:"black"
  },
  subLabel: {
    marginBottom: 10,
    color: '#34495e',
  },
  modalSubjects: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  subjectOption: {
    padding: 8,
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: '#ecf0f1',
    borderRadius: 5,
  },
  selectedSubjectOption: {
    backgroundColor: '#3498db',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    padding: 10,
    borderRadius: 5,
    width: '48%',
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#e74c3c',
  },
  saveButton: {
    backgroundColor: '#27ae60',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default HeadteacherDash;
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, Button, Alert, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Studentportal1 = () => {
  // Sample initial data
  const initialStudentData = {
    name: "Ayesha Ahmed",
    rollNumber: "S-2023-005",
    class: "Class 9 - Section B",
    institute: "The City School, Lahore",
    attendance: {
      totalClasses: 90,
      attended: 82,
      percentage: 91.11,
      lastMonth: {
        total: 20,
        attended: 18
      }
    },
    performance: {
      subjects: [
        { name: "Mathematics", marks: 92, grade: "A+", teacher: "Mr. Ali Raza" },
        { name: "English", marks: 85, grade: "A", teacher: "Ms. Fatima Khan" },
        { name: "Urdu", marks: 88, grade: "A", teacher: "Mr. Usman Ahmed" },
        { name: "Science", marks: 78, grade: "B+", teacher: "Ms. Hina Shah" },
        { name: "Islamiat", marks: 95, grade: "A+", teacher: "Mr. Abdul Qadir" },
      ],
      term: "Second Term 2023",
      remarks: "Excellent performance. Needs to focus more on Science subjects."
    },
    timetable: [
      { day: "Monday", subjects: ["English", "Math", "Science", "Urdu"] },
      { day: "Tuesday", subjects: ["Math", "Islamiat", "Computer", "English"] },
      { day: "Wednesday", subjects: ["Science", "Urdu", "Math", "Arts"] },
      { day: "Thursday", subjects: ["Islamiat", "Science", "English", "PE"] },
      { day: "Friday", subjects: ["Urdu", "Math", "Science", "Assembly"] },
      { day: "Saturday", subjects: [] }
    ],
    upcomingEvents: [
      { title: "Parent-Teacher Meeting", date: "2023-11-15", time: "10:00 AM" },
      { title: "Science Fair", date: "2023-11-22", time: "09:00 AM" },
      { title: "Term Exams Begin", date: "2023-12-05", time: "08:30 AM" },
    ]
  };

  const [studentData, setStudentData] = useState(initialStudentData);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isEditing, setIsEditing] = useState(false);
  const [currentDay, setCurrentDay] = useState('');
  const [newSubject, setNewSubject] = useState('');
  const [editIndex, setEditIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load saved data when component mounts
  useEffect(() => {
    const loadData = async () => {
      try {
        const savedData = await AsyncStorage.getItem('@studentData');
        if (savedData !== null) {
          setStudentData(JSON.parse(savedData));
        }
      } catch (error) {
        console.error('Failed to load data', error);
        setError('Failed to load data. Using default data.');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);

  // Save data whenever it changes
  useEffect(() => {
    if (!isLoading) {
      const saveData = async () => {
        try {
          await AsyncStorage.setItem('@studentData', JSON.stringify(studentData));
        } catch (error) {
          console.error('Failed to save data', error);
          setError('Failed to save changes. Please try again.');
        }
      };
      
      saveData();
    }
  }, [studentData, isLoading]);

  const handleAddSubject = (day) => {
    setCurrentDay(day);
    setNewSubject('');
    setEditIndex(-1);
    setIsEditing(true);
  };

  const handleEditSubject = (day, subject, index) => {
    setCurrentDay(day);
    setNewSubject(subject);
    setEditIndex(index);
    setIsEditing(true);
  };

  const handleSaveSubject = () => {
    if (!newSubject.trim()) {
      Alert.alert('Error', 'Subject name cannot be empty');
      return;
    }
    
    const updatedTimetable = [...studentData.timetable];
    const dayIndex = updatedTimetable.findIndex(day => day.day === currentDay);
    
    if (dayIndex === -1) {
      setError('Invalid day selected');
      return;
    }
    
    if (editIndex >= 0) {
      // Edit existing subject
      updatedTimetable[dayIndex].subjects[editIndex] = newSubject;
    } else {
      // Add new subject
      updatedTimetable[dayIndex].subjects.push(newSubject);
    }
    
    setStudentData({
      ...studentData,
      timetable: updatedTimetable
    });
    
    setIsEditing(false);
    setNewSubject('');
    setEditIndex(-1);
  };

  const handleDeleteSubject = (day, index) => {
    Alert.alert(
      "Delete Subject",
      "Are you sure you want to delete this subject?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        { 
          text: "Delete", 
          onPress: () => {
            const updatedTimetable = [...studentData.timetable];
            const dayIndex = updatedTimetable.findIndex(d => d.day === day);
            
            if (dayIndex !== -1) {
              updatedTimetable[dayIndex].subjects.splice(index, 1);
              
              setStudentData({
                ...studentData,
                timetable: updatedTimetable
              });
            }
          },
          style: "destructive"
        }
      ]
    );
  };

  const resetTimetable = () => {
    Alert.alert(
      "Reset Timetable",
      "This will restore the original timetable. Continue?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        { 
          text: "Reset", 
          onPress: () => {
            setStudentData({
              ...studentData,
              timetable: initialStudentData.timetable
            });
          },
          style: "destructive"
        }
      ]
    );
  };

  const calculateOverallGrade = () => {
    const totalMarks = studentData.performance.subjects.reduce((sum, subject) => sum + subject.marks, 0);
    const average = totalMarks / studentData.performance.subjects.length;
    return Math.round(average);
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#046a38" />
        <Text style={styles.loadingText}>Loading your data...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Error message */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={() => setError(null)}>
            <Text style={styles.errorClose}>✕</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Header Section with Profile */}
      <View style={styles.header}>
        <View style={styles.profileContainer}>
          <View style={styles.profileImagePlaceholder}>
            <Text style={styles.profileInitials}>
              {studentData.name.split(' ').map(name => name[0]).join('')}
            </Text>
          </View>
          <View style={styles.profileText}>
            <Text style={styles.welcomeText}>Assalam-o-Alaikum</Text>
            <Text style={styles.studentName}>{studentData.name}</Text>
          </View>
        </View>
        <View style={styles.infoContainer}>
          <Text style={styles.studentInfo}>
            <Text style={styles.infoLabel}>Roll No: </Text>
            {studentData.rollNumber}
          </Text>
          <Text style={styles.studentInfo}>
            <Text style={styles.infoLabel}>Class: </Text>
            {studentData.class}
          </Text>
          <Text style={styles.instituteInfo}>{studentData.institute}</Text>
        </View>
      </View>

      {/* Quick Stats Cards */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{studentData.attendance.percentage}%</Text>
          <Text style={styles.statLabel}>Attendance</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{calculateOverallGrade()}%</Text>
          <Text style={styles.statLabel}>Overall Grade</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{studentData.performance.subjects.length}</Text>
          <Text style={styles.statLabel}>Subjects</Text>
        </View>
      </View>

      {/* Navigation Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'dashboard' && styles.activeTab]}
          onPress={() => setActiveTab('dashboard')}
        >
          <Text style={styles.tabText}>Dashboard</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'academics' && styles.activeTab]}
          onPress={() => setActiveTab('academics')}
        >
          <Text style={styles.tabText}>Academics</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'schedule' && styles.activeTab]}
          onPress={() => setActiveTab('schedule')}
        >
          <Text style={styles.tabText}>Schedule</Text>
        </TouchableOpacity>
      </View>

      {/* Content Area */}
      <View style={styles.content}>
        {activeTab === 'dashboard' && (
          <View>
            {/* Attendance Summary */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Attendance Summary</Text>
              <View style={styles.attendanceSummary}>
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill, 
                      { width: `${studentData.attendance.percentage}%` }
                    ]}
                  />
                </View>
                <Text style={styles.attendanceText}>
                  {studentData.attendance.attended} of {studentData.attendance.totalClasses} classes attended
                </Text>
                <Text style={styles.attendanceSubText}>
                  Last month: {studentData.attendance.lastMonth.attended}/{studentData.attendance.lastMonth.total}
                </Text>
                {studentData.attendance.percentage < 75 && (
                  <Text style={styles.warningText}>⚠️ Your attendance is below school requirement</Text>
                )}
              </View>
            </View>

            {/* Upcoming Events */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Upcoming Events</Text>
              {studentData.upcomingEvents.map((event, index) => (
                <View key={index} style={styles.eventCard}>
                  <View style={styles.eventDateBox}>
                    <Text style={styles.eventDay}>{new Date(event.date).getDate()}</Text>
                    <Text style={styles.eventMonth}>
                      {new Date(event.date).toLocaleString('en-PK', { month: 'short' })}
                    </Text>
                  </View>
                  <View style={styles.eventDetails}>
                    <Text style={styles.eventTitle}>{event.title}</Text>
                    <Text style={styles.eventTime}>{event.time}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {activeTab === 'academics' && (
          <View>
            {/* Performance Summary */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Academic Performance - {studentData.performance.term}</Text>
              <View style={styles.remarksCard}>
                <Text style={styles.remarksText}>Teacher's Remarks:</Text>
                <Text style={styles.remarksContent}>"{studentData.performance.remarks}"</Text>
              </View>
              
              {studentData.performance.subjects.map((subject, index) => (
                <View key={index} style={styles.subjectCard}>
                  <View style={styles.subjectHeader}>
                    <Text style={styles.subjectName}>{subject.name}</Text>
                    <Text style={styles.subjectTeacher}>{subject.teacher}</Text>
                  </View>
                  <View style={styles.marksContainer}>
                    <View style={styles.gradeBadge}>
                      <Text style={styles.gradeText}>{subject.grade}</Text>
                    </View>
                    <Text style={styles.marksText}>{subject.marks}/100</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {activeTab === 'schedule' && (
          <View>
            <View style={styles.scheduleHeader}>
              <Text style={styles.sectionTitle}>Weekly Timetable</Text>
              <TouchableOpacity onPress={resetTimetable}>
                <Text style={styles.resetButton}>Reset</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.scheduleNote}>Tap on a subject to edit or long press to delete</Text>
            
            {studentData.timetable.map((day, index) => (
              <View key={index} style={styles.timetableDay}>
                <View style={styles.dayHeaderContainer}>
                  <Text style={styles.dayHeader}>{day.day}</Text>
                  <TouchableOpacity 
                    style={styles.addSubjectButton}
                    onPress={() => handleAddSubject(day.day)}
                  >
                    <Text style={styles.addSubjectButtonText}>+ Add Subject</Text>
                  </TouchableOpacity>
                </View>
                
                <View style={styles.subjectsContainer}>
                  {day.subjects.map((subject, subIndex) => (
                    <TouchableOpacity 
                      key={subIndex} 
                      style={styles.subjectPill}
                      onPress={() => handleEditSubject(day.day, subject, subIndex)}
                      onLongPress={() => handleDeleteSubject(day.day, subIndex)}
                    >
                      <Text style={styles.subjectPillText}>{subject}</Text>
                    </TouchableOpacity>
                  ))}
                  
                  {day.subjects.length === 0 && (
                    <Text style={styles.noSubjectsText}>No subjects added yet</Text>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Edit Subject Modal */}
      <Modal
        visible={isEditing}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsEditing(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editIndex >= 0 ? 'Edit Subject' : 'Add Subject'} for {currentDay}
            </Text>
            
            <TextInput
              style={styles.subjectInput}
              placeholder="Enter subject name"
              value={newSubject}
              onChangeText={setNewSubject}
              autoFocus={true}
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setIsEditing(false)}
              >
                <Text style={[styles.modalButtonText, { color: '#333' }]}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.saveButton, !newSubject.trim() && styles.disabledButton]}
                onPress={handleSaveSubject}
                disabled={!newSubject.trim()}
              >
                <Text style={styles.modalButtonText}>{editIndex >= 0 ? 'Update' : 'Add'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Need help? Contact school office: 042-1234567</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 18,
    color: '#046a38',
    marginTop: 20,
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  errorText: {
    color: '#c62828',
    flex: 1,
  },
  errorClose: {
    color: '#c62828',
    fontWeight: 'bold',
    paddingLeft: 10,
  },
  header: {
    backgroundColor: '#046a38',
    padding: 20,
    paddingBottom: 15,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  profileImagePlaceholder: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'white',
  },
  profileInitials: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#046a38',
  },
  profileText: {
    marginLeft: 15,
  },
  welcomeText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
  },
  studentName: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 3,
  },
  infoContainer: {
    marginTop: 5,
  },
  studentInfo: {
    color: 'white',
    fontSize: 14,
    marginBottom: 3,
  },
  infoLabel: {
    fontWeight: 'bold',
  },
  instituteInfo: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 12,
    marginTop: 5,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    marginTop: 20,
    marginBottom: 10,
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    width: '30%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#046a38',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 15,
    borderRadius: 10,
    overflow: 'hidden',
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tab: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#f0f9f0',
    borderBottomWidth: 3,
    borderBottomColor: '#046a38',
  },
  tabText: {
    color: '#333',
    fontWeight: '600',
    fontSize: 14,
  },
  content: {
    padding: 15,
    paddingBottom: 20,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    paddingLeft: 5,
  },
  scheduleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  resetButton: {
    color: '#e53935',
    fontSize: 14,
    fontWeight: '600',
  },
  scheduleNote: {
    fontSize: 13,
    color: '#666',
    marginBottom: 15,
    fontStyle: 'italic',
  },
  attendanceSummary: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  progressBar: {
    height: 10,
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
    marginBottom: 10,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 5,
  },
  attendanceText: {
    fontSize: 15,
    color: '#333',
    marginBottom: 3,
  },
  attendanceSubText: {
    fontSize: 13,
    color: '#666',
    marginBottom: 5,
  },
  warningText: {
    color: '#e53935',
    fontSize: 13,
    fontWeight: 'bold',
    marginTop: 8,
  },
  eventCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  eventDateBox: {
    backgroundColor: '#046a38',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    width: 50,
    marginRight: 15,
  },
  eventDay: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  eventMonth: {
    color: 'white',
    fontSize: 12,
    marginTop: -3,
  },
  eventDetails: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 3,
  },
  eventTime: {
    fontSize: 13,
    color: '#666',
  },
  remarksCard: {
    backgroundColor: '#fff8e1',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107',
  },
  remarksText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  remarksContent: {
    fontSize: 14,
    color: '#555',
    fontStyle: 'italic',
  },
  subjectCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  subjectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  subjectName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  subjectTeacher: {
    fontSize: 13,
    color: '#666',
  },
  marksContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  gradeBadge: {
    backgroundColor: '#e8f5e9',
    borderRadius: 15,
    paddingVertical: 5,
    paddingHorizontal: 12,
  },
  gradeText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2e7d32',
  },
  marksText: {
    fontSize: 15,
    color: '#333',
    fontWeight: '600',
  },
  timetableDay: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  dayHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  dayHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#046a38',
  },
  addSubjectButton: {
    backgroundColor: '#046a38',
    borderRadius: 15,
    paddingVertical: 5,
    paddingHorizontal: 12,
  },
  addSubjectButtonText: {
    color: 'white',
    fontSize: 13,
  },
  subjectsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  subjectPill: {
    backgroundColor: '#e3f2fd',
    borderRadius: 15,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  subjectPillText: {
    fontSize: 13,
    color: '#1565c0',
  },
  noSubjectsText: {
    fontSize: 13,
    color: '#999',
    fontStyle: 'italic',
  },
  footer: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    alignItems: 'center',
  },
  footerText: {
    color: '#666',
    fontSize: 12,
    textAlign: 'center',
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    width: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  subjectInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  modalButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginLeft: 10,
  },
  cancelButton: {
    backgroundColor: '#e0e0e0',
  },
  saveButton: {
    backgroundColor: '#046a38',
  },
  disabledButton: {
    backgroundColor: '#cccccc',
  },
  modalButtonText: {  
    color: 'white',
    fontWeight: 'bold',
  },
});

export default Studentportal1;
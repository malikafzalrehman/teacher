import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, FlatList, Modal, TextInput, Alert } from 'react-native';

const Headexammanagement = () => {
  // School information
  const [schoolInfo] = useState({
    name: 'Pakistani Public School',
    address: '123 Education Street, Karachi',
    principal: 'Mr. Ahmed Khan',
    phone: '021-1234567',
    established: '1985'
  });

  // Exam types
  const examTypes = ['Monthly', 'Term', 'Final', 'Yearly'];
  const [selectedExamType, setSelectedExamType] = useState('Monthly');

  // Subjects
  const initialSubjects = ['Mathematics', 'Science', 'English', 'Urdu', 'Islamiyat', 'Pakistan Studies'];
  const [subjects, setSubjects] = useState(initialSubjects);

  // Classes and sections
  const initialClasses = Array.from({length: 12}, (_, i) => ({
    name: `${i+1}${getOrdinalSuffix(i+1)}`,
    sections: ['A', 'B']
  }));

  const [classes, setClasses] = useState(initialClasses);
  const [newClassName, setNewClassName] = useState('');
  const [newSectionName, setNewSectionName] = useState('');
  const [selectedClassForSection, setSelectedClassForSection] = useState('1st');

  // Search functionality
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // UI state
  const [activeTab, setActiveTab] = useState('Mathematics');
  const [viewMode, setViewMode] = useState('subject');
  const [selectedClass, setSelectedClass] = useState('1st');
  const [selectedSection, setSelectedSection] = useState('A');
  const [isModalVisible, setModalVisible] = useState(false);
  const [isSubjectModalVisible, setSubjectModalVisible] = useState(false);
  const [isClassModalVisible, setClassModalVisible] = useState(false);
  const [isSectionModalVisible, setSectionModalVisible] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState('');

  // New student form state
  const [newStudent, setNewStudent] = useState({
    name: '',
    rollNo: '',
    class: '1st',
    section: 'A',
    examType: 'Monthly',
    subjects: {}
  });

  // Initialize subjects for new student
  useEffect(() => {
    const initialSubjectsState = subjects.reduce((acc, subject) => {
      acc[subject] = { marks: '', grade: '' };
      return acc;
    }, {});
    
    setNewStudent(prev => ({
      ...prev,
      subjects: initialSubjectsState
    }));
  }, [subjects]);

  // Students data
  const [students, setStudents] = useState(() => {
    const allStudents = [];
    classes.forEach(cls => {
      cls.sections.forEach(section => {
        examTypes.forEach(examType => {
          for (let i = 1; i <= 2; i++) {
            allStudents.push({
              id: `${cls.name}-${section}-${examType}-${i}`,
              name: `Student ${i} of ${cls.name}${section}`,
              rollNo: `2023-${cls.name}-${section}-${i.toString().padStart(3, '0')}`,
              class: cls.name,
              section: section,
              examType: examType,
              subjects: initialSubjects.reduce((acc, subject) => {
                acc[subject] = { 
                  marks: Math.floor(Math.random() * 50) + 50, 
                  grade: '' 
                };
                return acc;
              }, {})
            });
          }
        });
      });
    });
    return allStudents;
  });

  // Helper functions
  function getOrdinalSuffix(num) {
    const j = num % 10;
    const k = num % 100;
    if (j === 1 && k !== 11) return "st";
    if (j === 2 && k !== 12) return "nd";
    if (j === 3 && k !== 13) return "rd";
    return "th";
  }

  const calculateGrade = (marks) => {
    if (selectedClass === '1st' || selectedClass === '2nd' || selectedClass === '3rd') {
      if (marks >= 80) return 'A';
      if (marks >= 60) return 'B';
      if (marks >= 40) return 'C';
      return 'Needs Improvement';
    }
    
    if (marks >= 90) return 'A+';
    if (marks >= 80) return 'A';
    if (marks >= 70) return 'B';
    if (marks >= 60) return 'C';
    if (marks >= 50) return 'D';
    return 'F';
  };

  // Filter students based on current selections
  const filterStudents = () => {
    let filtered = students.filter(s => 
      s.class === selectedClass && 
      s.section === selectedSection &&
      s.examType === selectedExamType
    );

    if (isSearching && searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(student => 
        student.name.toLowerCase().includes(query) || 
        student.rollNo.toLowerCase().includes(query)
      );
    }

    return filtered;
  };

  // Add new subject
  const addSubject = () => {
    if (!newSubjectName.trim()) {
      Alert.alert('Error', 'Please enter a subject name');
      return;
    }
    
    if (subjects.includes(newSubjectName)) {
      Alert.alert('Error', 'Subject already exists');
      return;
    }
    
    const updatedSubjects = [...subjects, newSubjectName];
    setSubjects(updatedSubjects);
    
    // Add new subject to all students
    setStudents(students.map(student => ({
      ...student,
      subjects: {
        ...student.subjects,
        [newSubjectName]: { marks: '', grade: '' }
      }
    })));
    
    setNewSubjectName('');
    setSubjectModalVisible(false);
  };

  // Add new class
  const addClass = () => {
    if (!newClassName.trim()) {
      Alert.alert('Error', 'Please enter a class name');
      return;
    }

    if (classes.some(c => c.name === newClassName)) {
      Alert.alert('Error', 'Class already exists');
      return;
    }

    const newClass = {
      name: newClassName,
      sections: ['A']
    };

    setClasses([...classes, newClass]);
    setNewClassName('');
    setClassModalVisible(false);
  };

  // Add new section
  const addSection = () => {
    if (!newSectionName.trim()) {
      Alert.alert('Error', 'Please enter a section name');
      return;
    }

    const sectionName = newSectionName.toUpperCase();
    
    if (sectionName.length !== 1 || !sectionName.match(/[A-Z]/)) {
      Alert.alert('Error', 'Section must be a single letter (A-Z)');
      return;
    }

    const classIndex = classes.findIndex(c => c.name === selectedClassForSection);
    if (classIndex === -1) {
      Alert.alert('Error', 'Selected class not found');
      return;
    }

    if (classes[classIndex].sections.includes(sectionName)) {
      Alert.alert('Error', 'Section already exists for this class');
      return;
    }

    const updatedClasses = [...classes];
    updatedClasses[classIndex].sections.push(sectionName);
    setClasses(updatedClasses);
    setNewSectionName('');
    setSectionModalVisible(false);
  };

  // Add new student
  const addStudent = () => {
    // Validate required fields
    if (!newStudent.name.trim() || !newStudent.rollNo.trim()) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    // Check for duplicate roll number
    const isDuplicate = students.some(s => 
      s.rollNo === newStudent.rollNo && 
      s.class === newStudent.class &&
      s.section === newStudent.section &&
      s.examType === newStudent.examType
    );

    if (isDuplicate) {
      Alert.alert('Error', 'Roll number already exists in this class, section and exam type');
      return;
    }

    // Prepare subjects with grades
    const studentSubjects = {};
    subjects.forEach(subject => {
      const marks = parseInt(newStudent.subjects[subject]?.marks) || 0;
      studentSubjects[subject] = {
        marks: marks,
        grade: calculateGrade(marks)
      };
    });

    // Create new student
    const newStudentData = {
      id: `${newStudent.class}-${newStudent.section}-${newStudent.examType}-${Date.now()}`,
      name: newStudent.name.trim(),
      rollNo: newStudent.rollNo.trim(),
      class: newStudent.class,
      section: newStudent.section,
      examType: newStudent.examType,
      subjects: studentSubjects
    };

    setStudents([...students, newStudentData]);
    setModalVisible(false);
    resetNewStudentForm();
  };

  const resetNewStudentForm = () => {
    setNewStudent({
      name: '',
      rollNo: '',
      class: '1st',
      section: 'A',
      examType: 'Monthly',
      subjects: subjects.reduce((acc, subject) => {
        acc[subject] = { marks: '', grade: '' };
        return acc;
      }, {})
    });
  };

  // Print results
  const printResults = () => {
    const classStudents = filterStudents();
    
    if (classStudents.length === 0) {
      Alert.alert('No Students', `No students found in class ${selectedClass}${selectedSection} for ${selectedExamType} exam`);
      return;
    }

    Alert.alert(
      'Print Results',
      `Printing results for Class ${selectedClass}${selectedSection} - ${selectedExamType} Exam\n` +
      `Total Students: ${classStudents.length}\n\n` +
      `School: ${schoolInfo.name}\n` +
      `Established: ${schoolInfo.established}`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Print', onPress: () => console.log('Printing results...') }
      ]
    );
  };

  // Get sections for selected class
  const getSectionsForClass = (className) => {
    const cls = classes.find(c => c.name === className);
    return cls ? cls.sections : [];
  };

  // Render student item in subject view
  const renderStudentItem = ({ item }) => (
    <View style={styles.studentCard}>
      <View style={styles.studentInfo}>
        <Text style={styles.studentName}>{item.name}</Text>
        <Text style={styles.studentDetail}>Roll No: {item.rollNo}</Text>
        <Text style={styles.studentDetail}>Class: {item.class}{item.section}</Text>
        <Text style={styles.studentDetail}>Exam: {item.examType}</Text>
      </View>
      <View style={styles.marksContainer}>
        <Text style={styles.marksText}>
          Marks: {item.subjects[activeTab]?.marks || 'N/A'}
        </Text>
        <Text style={[
          styles.gradeText,
          { color: item.subjects[activeTab]?.grade === 'A+' ? '#2e7d32' : 
                   item.subjects[activeTab]?.grade === 'F' ? '#c62828' : 
                   item.subjects[activeTab]?.grade === 'Needs Improvement' ? '#d32f2f' : '#1565c0' }
        ]}>
          Grade: {item.subjects[activeTab]?.grade || 'N/A'}
        </Text>
      </View>
    </View>
  );

  // Render student result card
  const renderResultCard = ({ item }) => {
    const totalMarks = Object.values(item.subjects).reduce((sum, sub) => sum + (sub.marks || 0), 0);
    const percentage = (totalMarks / (subjects.length * 100)) * 100;
    const hasFailed = Object.values(item.subjects).some(sub => sub.grade === 'F' || sub.grade === 'Needs Improvement');
    const classPosition = students.filter(s => 
      s.class === item.class && 
      s.section === item.section &&
      s.examType === item.examType
    )
      .sort((a, b) => {
        const totalA = Object.values(a.subjects).reduce((sum, sub) => sum + (sub.marks || 0), 0);
        const totalB = Object.values(b.subjects).reduce((sum, sub) => sum + (sub.marks || 0), 0);
        return totalB - totalA;
      })
      .findIndex(s => s.id === item.id) + 1;

    const isPrimaryClass = ['1st', '2nd', '3rd'].includes(item.class);

    return (
      <View style={styles.resultCard}>
        <View style={styles.schoolHeader}>
          <Text style={styles.schoolName}>{schoolInfo.name}</Text>
          <Text style={styles.schoolAddress}>{schoolInfo.address}</Text>
          <Text style={styles.schoolContact}>
            Phone: {schoolInfo.phone} | Principal: {schoolInfo.principal}
          </Text>
        </View>
        
        <View style={styles.examTitleContainer}>
          <Text style={styles.examTitle}>
            {item.examType} Examination {new Date().getFullYear()}
          </Text>
          <Text style={styles.examClass}>Class: {item.class}{item.section} | Roll No: {item.rollNo}</Text>
        </View>
        
        <View style={styles.resultHeader}>
          <Text style={styles.resultName}>Student Name: {item.name}</Text>
        </View>
        
        <View style={styles.subjectResults}>
          {subjects.map(subject => (
            <View key={subject} style={styles.subjectResultItem}>
              <Text style={styles.subjectName}>{subject}</Text>
              <View style={styles.marksGradeContainer}>
                <Text style={styles.resultMarks}>{item.subjects[subject]?.marks || '0'}</Text>
                <Text style={[
                  styles.resultGrade,
                  { color: item.subjects[subject]?.grade === 'A+' ? '#2e7d32' : 
                           item.subjects[subject]?.grade === 'F' ? '#c62828' : 
                           item.subjects[subject]?.grade === 'Needs Improvement' ? '#d32f2f' : '#1565c0' }
                ]}>
                  {item.subjects[subject]?.grade || 'N/A'}
                </Text>
              </View>
            </View>
          ))}
        </View>
        
        <View style={styles.totalContainer}>
          {!isPrimaryClass && (
            <>
              <Text style={styles.totalText}>
                Total Marks: {totalMarks} / {subjects.length * 100}
              </Text>
              <Text style={styles.percentageText}>
                Percentage: {percentage.toFixed(2)}%
              </Text>
            </>
          )}
          {classPosition > 0 && (
            <Text style={styles.positionText}>
              Position in Class: {classPosition}
            </Text>
          )}
          <Text style={styles.remarksText}>
            Remarks: {hasFailed ? 'Needs Improvement' : 'Excellent Performance'}
          </Text>
        </View>
        
        <View style={styles.resultFooter}>
          <Text style={styles.footerText}>Date: {new Date().toLocaleDateString()}</Text>
          <Text style={styles.footerText}>Class Teacher: ___________________</Text>
          <Text style={styles.footerText}>Principal: ___________________</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{schoolInfo.name}</Text>
        <Text style={styles.subtitle}>Exam Management System</Text>
      </View>

      {/* Search Bar */}
      {isSearching && (
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name or roll number..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus={true}
          />
          <TouchableOpacity 
            style={styles.closeSearchButton}
            onPress={() => {
              setIsSearching(false);
              setSearchQuery('');
            }}
          >
            <Text style={styles.closeSearchText}>✕</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Mode Selection */}
      <View style={styles.modeSelector}>
        <TouchableOpacity
          style={[styles.modeButton, viewMode === 'subject' && styles.activeMode]}
          onPress={() => setViewMode('subject')}
        >
          <Text style={[styles.modeText, viewMode === 'subject' && styles.activeModeText]}>
            Subject View
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.modeButton, viewMode === 'result' && styles.activeMode]}
          onPress={() => setViewMode('result')}
        >
          <Text style={[styles.modeText, viewMode === 'result' && styles.activeModeText]}>
            Results View
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.searchButton}
          onPress={() => setIsSearching(!isSearching)}
        >
          <Text style={styles.searchButtonText}>🔍</Text>
        </TouchableOpacity>
      </View>

      {/* Exam Type Selection */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        style={styles.examTypeContainer}
      >
        {examTypes.map((type, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.examTypeButton, selectedExamType === type && styles.activeExamType]}
            onPress={() => setSelectedExamType(type)}
          >
            <Text style={[styles.examTypeText, selectedExamType === type && styles.activeExamTypeText]}>
              {type}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Class and Section Selection */}
      <View style={styles.selectionContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          style={styles.classContainer}
          contentContainerStyle={styles.classScrollContent}
        >
          {classes.map((cls, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.classButton, selectedClass === cls.name && styles.activeClass]}
              onPress={() => {
                setSelectedClass(cls.name);
                setSelectedSection(cls.sections[0]);
              }}
            >
              <Text style={[styles.classText, selectedClass === cls.name && styles.activeClassText]}>
                {cls.name}
              </Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            style={styles.addButtonSmall}
            onPress={() => setClassModalVisible(true)}
          >
            <Text style={styles.addButtonText}>+ Class</Text>
          </TouchableOpacity>
        </ScrollView>

        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          style={styles.sectionContainer}
          contentContainerStyle={styles.sectionScrollContent}
        >
          {getSectionsForClass(selectedClass).map((section, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.sectionButton, selectedSection === section && styles.activeSection]}
              onPress={() => setSelectedSection(section)}
            >
              <Text style={[styles.sectionText, selectedSection === section && styles.activeSectionText]}>
                {section}
              </Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            style={styles.addButtonSmall}
            onPress={() => {
              setSelectedClassForSection(selectedClass);
              setSectionModalVisible(true);
            }}
          >
            <Text style={styles.addButtonText}>+ Section</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Subject Tabs */}
      {viewMode === 'subject' && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabContainer}>
          {subjects.map((subject, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.tabButton, activeTab === subject && styles.activeTab]}
              onPress={() => setActiveTab(subject)}
            >
              <Text style={[styles.tabText, activeTab === subject && styles.activeTabText]}>
                {subject}
              </Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            style={styles.addSubjectButton}
            onPress={() => setSubjectModalVisible(true)}
          >
            <Text style={styles.addSubjectText}>+ Subject</Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      {/* View Title */}
      <View style={styles.viewHeader}>
        <Text style={styles.viewTitle}>
          {viewMode === 'subject' 
            ? `${activeTab} - Class ${selectedClass}${selectedSection} (${selectedExamType})` 
            : `Final Results - Class ${selectedClass}${selectedSection} (${selectedExamType})`}
        </Text>
        <Text style={styles.viewSubtitle}>
          {viewMode === 'result' && `Total Students: ${filterStudents().length}`}
        </Text>
      </View>

      {/* Students List or Results */}
      <FlatList
        data={filterStudents()}
        renderItem={viewMode === 'subject' ? renderStudentItem : renderResultCard}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {isSearching && searchQuery 
                ? 'No records found matching your search'
                : `No data available for class ${selectedClass}${selectedSection} for ${selectedExamType} exam`}
            </Text>
          </View>
        }
      />

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
          <Text style={styles.buttonText}>Add Student</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.printButton} onPress={printResults}>
          <Text style={styles.buttonText}>Print Results</Text>
        </TouchableOpacity>
      </View>

      {/* Add Student Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Student</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Student Name*"
              value={newStudent.name}
              onChangeText={text => setNewStudent({...newStudent, name: text})}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Roll Number*"
              value={newStudent.rollNo}
              onChangeText={text => setNewStudent({...newStudent, rollNo: text})}
            />
            
            <Text style={styles.sectionTitle}>Exam Type:</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.examTypeSelectionScroll}
            >
              {examTypes.map((type, index) => (
                <TouchableOpacity
                  key={index}
                  style={[styles.modalExamTypeButton, newStudent.examType === type && styles.modalActiveExamType]}
                  onPress={() => setNewStudent({...newStudent, examType: type})}
                >
                  <Text style={[styles.modalExamTypeText, newStudent.examType === type && styles.modalActiveExamTypeText]}>
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            
            <Text style={styles.sectionTitle}>Class:</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.classSelectionScroll}
            >
              {classes.map((cls, index) => (
                <TouchableOpacity
                  key={index}
                  style={[styles.modalClassButton, newStudent.class === cls.name && styles.modalActiveClass]}
                  onPress={() => {
                    setNewStudent({
                      ...newStudent, 
                      class: cls.name,
                      section: cls.sections[0]
                    });
                  }}
                >
                  <Text style={[styles.modalClassText, newStudent.class === cls.name && styles.modalActiveClassText]}>
                    {cls.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            
            <Text style={styles.sectionTitle}>Section:</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.sectionSelectionScroll}
            >
              {getSectionsForClass(newStudent.class).map((section, index) => (
                <TouchableOpacity
                  key={index}
                  style={[styles.modalSectionButton, newStudent.section === section && styles.modalActiveSection]}
                  onPress={() => setNewStudent({...newStudent, section: section})}
                >
                  <Text style={[styles.modalSectionText, newStudent.section === section && styles.modalActiveSectionText]}>
                    {section}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            
            <Text style={styles.sectionTitle}>Enter Marks (0-100):</Text>
            <ScrollView style={styles.marksScrollView}>
              {subjects.map(subject => (
                <View key={subject} style={styles.markInputContainer}>
                  <Text style={styles.subjectLabel}>{subject}:</Text>
                  <TextInput
                    style={styles.markInput}
                    placeholder="Marks"
                    keyboardType="numeric"
                    value={newStudent.subjects[subject]?.marks?.toString()}
                    onChangeText={text => {
                      const marks = parseInt(text) || 0;
                      if (marks >= 0 && marks <= 100) {
                        setNewStudent({
                          ...newStudent,
                          subjects: {
                            ...newStudent.subjects,
                            [subject]: {
                              marks: marks,
                              grade: calculateGrade(marks)
                            }
                          }
                        });
                      }
                    }}
                  />
                </View>
              ))}
            </ScrollView>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => {
                  setModalVisible(false);
                  resetNewStudentForm();
                }}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.submitButton}
                onPress={addStudent}
              >
                <Text style={styles.buttonText}>Add Student</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Add Subject Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={isSubjectModalVisible}
        onRequestClose={() => setSubjectModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.smallModalContent}>
            <Text style={styles.modalTitle}>Add New Subject</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Subject Name*"
              value={newSubjectName}
              onChangeText={setNewSubjectName}
              autoCapitalize="words"
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setSubjectModalVisible(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.submitButton}
                onPress={addSubject}
              >
                <Text style={styles.buttonText}>Add Subject</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Add Class Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={isClassModalVisible}
        onRequestClose={() => setClassModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.smallModalContent}>
            <Text style={styles.modalTitle}>Add New Class</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Class Name* (e.g., 13th, Nursery, KG)"
              value={newClassName}
              onChangeText={setNewClassName}
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setClassModalVisible(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.submitButton}
                onPress={addClass}
              >
                <Text style={styles.buttonText}>Add Class</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Add Section Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={isSectionModalVisible}
        onRequestClose={() => setSectionModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.smallModalContent}>
            <Text style={styles.modalTitle}>Add New Section to {selectedClassForSection}</Text>
            
            <Text style={styles.sectionHelpText}>
              Enter a single letter (A-Z) for the section name
            </Text>
            
            <TextInput
              style={styles.input}
              placeholder="Section Name* (e.g., A, B, C)"
              value={newSectionName}
              onChangeText={setNewSectionName}
              maxLength={1}
              autoCapitalize="characters"
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setSectionModalVisible(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.submitButton}
                onPress={addSection}
              >
                <Text style={styles.buttonText}>Add Section</Text>
              </TouchableOpacity>
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
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#1e3799',
    paddingVertical: 15,
    paddingHorizontal: 10,
  },
  title: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center'
  },
  subtitle: {
    color: 'white',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 5
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 10,
    marginHorizontal: 10,
    borderRadius: 5,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    padding: 5,
  },
  closeSearchButton: {
    marginLeft: 10,
    padding: 5,
  },
  closeSearchText: {
    fontSize: 18,
    color: '#666',
  },
  modeSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 10,
  },
  modeButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginHorizontal: 5,
    backgroundColor: '#f0f0f0'
  },
  activeMode: {
    backgroundColor: '#1e3799'
  },
  modeText: {
    color: '#333',
    fontWeight: '500'
  },
  activeModeText: {
    color: 'white'
  },
  searchButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
    marginHorizontal: 5,
    backgroundColor: '#f0f0f0'
  },
  searchButtonText: {
    fontSize: 16,
  },
  examTypeContainer: {
    marginVertical: 5,
    paddingHorizontal: 10,
  },
  examTypeButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
    marginHorizontal: 5,
    backgroundColor: '#f0f0f0'
  },
  activeExamType: {
    backgroundColor: '#1e3799'
  },
  examTypeText: {
    color: '#333'
  },
  activeExamTypeText: {
    color: 'white'
  },
  selectionContainer: {
    marginBottom: 5,
  },
  classContainer: {
    marginVertical: 5,
    paddingHorizontal: 10,
  },
  classScrollContent: {
    paddingRight: 20
  },
  sectionContainer: {
    marginBottom: 5,
    paddingHorizontal: 10,
  },
  sectionScrollContent: {
    paddingRight: 20
  },
  classButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
    marginHorizontal: 5,
    backgroundColor: '#f0f0f0'
  },
  activeClass: {
    backgroundColor: '#1e3799'
  },
  sectionButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
    marginHorizontal: 5,
    backgroundColor: '#f0f0f0'
  },
  activeSection: {
    backgroundColor: '#1e3799'
  },
  classText: {
    color: '#333'
  },
  sectionText: {
    color: '#333'
  },
  activeClassText: {
    color: 'white'
  },
  activeSectionText: {
    color: 'white'
  },
  addButtonSmall: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
    marginHorizontal: 5,
    backgroundColor: '#4caf50'
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold'
  },
  tabContainer: {
    marginVertical: 5,
    paddingHorizontal: 10,
  },
  tabButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
    marginHorizontal: 5,
    backgroundColor: '#f0f0f0'
  },
  activeTab: {
    backgroundColor: '#1e3799'
  },
  tabText: {
    color: '#333'
  },
  activeTabText: {
    color: 'white'
  },
  addSubjectButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
    marginHorizontal: 5,
    backgroundColor: '#4caf50'
  },
  addSubjectText: {
    color: 'white',
    fontWeight: 'bold'
  },
  viewHeader: {
    backgroundColor: '#e3f2fd',
    padding: 10,
    marginVertical: 5
  },
  viewTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e3799',
    textAlign: 'center'
  },
  viewSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 5
  },
  listContainer: {
    padding: 10,
    flexGrow: 1
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center'
  },
  studentCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
  },
  studentInfo: {
    flex: 2
  },
  studentName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333'
  },
  studentDetail: {
    fontSize: 14,
    color: '#666',
    marginTop: 2
  },
  marksContainer: {
    flex: 1,
    alignItems: 'flex-end',
    justifyContent: 'center'
  },
  marksText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e3799'
  },
  gradeText: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 5
  },
  resultsContainer: {
    padding: 10,
    flexGrow: 1
  },
  resultCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  schoolHeader: {
    borderBottomWidth: 1,
    borderBottomColor: '#1e3799',
    paddingBottom: 10,
    marginBottom: 10,
    alignItems: 'center'
  },
  schoolName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e3799',
    textAlign: 'center'
  },
  schoolAddress: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 5
  },
  schoolContact: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 5
  },
  examTitleContainer: {
    alignItems: 'center',
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 10
  },
  examTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e3799'
  },
  examClass: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginTop: 5
  },
  resultHeader: {
    marginBottom: 10
  },
  resultName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e3799'
  },
  subjectResults: {
    marginVertical: 5
  },
  subjectResultItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5'
  },
  subjectName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
    flex: 2
  },
  marksGradeContainer: {
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'space-between'
  },
  resultMarks: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1e3799',
    textAlign: 'right',
    width: 40
  },
  resultGrade: {
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'right',
    width: 40
  },
  totalContainer: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#ddd'
  },
  totalText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5
  },
  percentageText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1e3799',
    marginBottom: 5
  },
  remarksText: {
    fontSize: 15,
    fontStyle: 'italic',
    color: '#d32f2f',
    marginBottom: 5
  },
  positionText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5
  },
  resultFooter: {
    marginTop: 15,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#ddd'
  },
  footerText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 15,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#eee'
  },
  addButton: {
    backgroundColor: '#43a047',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 5,
    minWidth: 150
  },
  printButton: {
    backgroundColor: '#1e3799',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 5,
    minWidth: 150
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center'
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)'
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '90%',
    maxHeight: '80%'
  },
  smallModalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '90%',
    maxWidth: 400
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e3799',
    marginBottom: 15,
    textAlign: 'center'
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
    fontSize: 16
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 10
  },
  sectionHelpText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
    textAlign: 'center'
  },
  examTypeSelectionScroll: {
    marginBottom: 15,
  },
  modalExamTypeButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
    marginRight: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ddd'
  },
  modalActiveExamType: {
    backgroundColor: '#1e3799',
    borderColor: '#1e3799'
  },
  modalExamTypeText: {
    color: '#333'
  },
  modalActiveExamTypeText: {
    color: 'white'
  },
  classSelectionScroll: {
    marginBottom: 15,
  },
  modalClassButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
    marginRight: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ddd'
  },
  modalActiveClass: {
    backgroundColor: '#1e3799',
    borderColor: '#1e3799'
  },
  modalClassText: {
    color: '#333'
  },
  modalActiveClassText: {
    color: 'white'
  },
  sectionSelectionScroll: {
    marginBottom: 15,
  },
  modalSectionButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
    marginRight: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ddd'
  },
  modalActiveSection: {
    backgroundColor: '#1e3799',
    borderColor: '#1e3799'
  },
  modalSectionText: {
    color: '#333'
  },
  modalActiveSectionText: {
    color: 'white'
  },
  marksScrollView: {
    maxHeight: 200,
    marginBottom: 15
  },
  markInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10
  },
  subjectLabel: {
    flex: 1,
    fontSize: 15,
    color: '#333'
  },
  markInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 8,
    width: 80,
    textAlign: 'center'
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15
  },
  cancelButton: {
    backgroundColor: '#c62828',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    flex: 1,
    marginRight: 10
  },
  submitButton: {
    backgroundColor: '#43a047',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    flex: 1,
    marginLeft: 10
  }
});

export default Headexammanagement;
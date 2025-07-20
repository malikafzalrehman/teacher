import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  TextInput, 
  FlatList,
  Modal,
  Alert,
  KeyboardAvoidingView,
  Platform,
  RefreshControl
} from 'react-native';
import moment from 'moment';
import Icon from 'react-native-vector-icons/MaterialIcons';

const TeacherclassManagement = () => {
    // Sample initial data for classes
    const initialClasses = [
        { 
            id: '1', 
            period: '1', 
            subject: 'Mathematics', 
            time: '8:00 AM - 9:00 AM', 
            endTime: '09:00',
            students: [
                { id: '101', name: 'Rahul Sharma', rollNumber: '101', attendance: 'present' },
                { id: '102', name: 'Priya Patel', rollNumber: '102', attendance: 'present' }
            ] 
        },
        { 
            id: '2', 
            period: '2', 
            subject: 'Science', 
            time: '9:00 AM - 10:00 AM',
            endTime: '10:00',
            students: [
                { id: '201', name: 'Amit Singh', rollNumber: '201', attendance: 'absent' }
            ] 
        },
        { 
            id: '3', 
            period: '3', 
            subject: 'English', 
            time: '10:30 AM - 11:30 AM',
            endTime: '11:30',
            students: [] 
        },
    ];

    // State management
    const [classes, setClasses] = useState(initialClasses);
    const [selectedClass, setSelectedClass] = useState(null);
    const [newStudent, setNewStudent] = useState({ name: '', rollNumber: '' });
    const [editingClass, setEditingClass] = useState(null);
    const [classForm, setClassForm] = useState({ 
        period: '', 
        subject: '', 
        time: '', 
        endTime: '' 
    });
    const [isClassModalVisible, setClassModalVisible] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('students');
    const [currentTime, setCurrentTime] = useState(moment().format('HH:mm'));
    const [refreshing, setRefreshing] = useState(false);
    const [isTimePickerVisible, setTimePickerVisible] = useState(false);

    // Time management and alerts
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(moment().format('HH:mm'));
            checkForPeriodEnd();
        }, 60000); // Update every minute

        return () => clearInterval(timer);
    }, []);

    const checkForPeriodEnd = () => {
        classes.forEach(cls => {
            if (currentTime === cls.endTime) {
                Alert.alert(
                    'Period Ended',
                    `Period ${cls.period} (${cls.subject}) has ended.`,
                    [{ text: 'OK' }]
                );
            }
        });
    };

    // Refresh control
    const onRefresh = () => {
        setRefreshing(true);
        // Simulate data refresh
        setTimeout(() => {
            setRefreshing(false);
        }, 1000);
    };

    // Filter students based on search query
    const filteredStudents = selectedClass?.students.filter(student =>
        student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.rollNumber.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

    // Student management functions
    const addStudent = () => {
        if (!newStudent.name || !newStudent.rollNumber || !selectedClass) {
            Alert.alert('Error', 'Please fill all student details');
            return;
        }

        const studentExists = selectedClass.students.some(
            student => student.rollNumber === newStudent.rollNumber
        );

        if (studentExists) {
            Alert.alert('Error', 'Student with this roll number already exists');
            return;
        }

        const updatedClasses = classes.map(cls => {
            if (cls.id === selectedClass.id) {
                return {
                    ...cls,
                    students: [...cls.students, { 
                        id: Date.now().toString(), 
                        name: newStudent.name, 
                        rollNumber: newStudent.rollNumber,
                        attendance: 'present'
                    }]
                };
            }
            return cls;
        });

        setClasses(updatedClasses);
        setNewStudent({ name: '', rollNumber: '' });
        Alert.alert('Success', 'Student added successfully');
    };

    // Class management functions
    const saveClass = () => {
        if (!classForm.period || !classForm.subject || !classForm.time || !classForm.endTime) {
            Alert.alert('Error', 'Please fill all class details');
            return;
        }

        const periodExists = classes.some(
            cls => cls.period === classForm.period && cls.id !== editingClass?.id
        );

        if (periodExists) {
            Alert.alert('Error', 'Class with this period already exists');
            return;
        }

        if (editingClass) {
            const updatedClasses = classes.map(cls => 
                cls.id === editingClass.id ? { 
                    ...cls, 
                    ...classForm
                } : cls
            );
            setClasses(updatedClasses);
            Alert.alert('Success', 'Class updated successfully');
        } else {
            const newClass = {
                id: Date.now().toString(),
                ...classForm,
                students: []
            };
            setClasses([...classes, newClass]);
            Alert.alert('Success', 'Class added successfully');
        }

        resetClassForm();
    };

    const resetClassForm = () => {
        setClassForm({ period: '', subject: '', time: '', endTime: '' });
        setEditingClass(null);
        setClassModalVisible(false);
    };

    const confirmDeleteClass = (id) => {
        Alert.alert(
            'Confirm Delete',
            'Are you sure you want to delete this class and all its student data?',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Delete', onPress: () => deleteClass(id) }
            ]
        );
    };

    const deleteClass = (id) => {
        setClasses(classes.filter(cls => cls.id !== id));
        if (selectedClass && selectedClass.id === id) {
            setSelectedClass(null);
        }
    };

    // Attendance management
    const toggleAttendance = (studentId) => {
        if (!selectedClass) return;

        const updatedClasses = classes.map(cls => {
            if (cls.id === selectedClass.id) {
                return {
                    ...cls,
                    students: cls.students.map(student => 
                        student.id === studentId 
                            ? { 
                                ...student, 
                                attendance: student.attendance === 'present' ? 'absent' : 'present' 
                            } 
                            : student
                    )
                };
            }
            return cls;
        });

        setClasses(updatedClasses);
    };

    const removeStudent = (studentId) => {
        if (!selectedClass) return;

        const updatedClasses = classes.map(cls => {
            if (cls.id === selectedClass.id) {
                return {
                    ...cls,
                    students: cls.students.filter(student => student.id !== studentId)
                };
            }
            return cls;
        });

        setClasses(updatedClasses);
    };

    // Statistics calculation
    const getAttendanceStats = () => {
        if (!selectedClass) return { present: 0, absent: 0, total: 0, percentage: 0 };
        
        const present = selectedClass.students.filter(s => s.attendance === 'present').length;
        const total = selectedClass.students.length;
        
        return {
            present,
            absent: total - present,
            total,
            percentage: total > 0 ? Math.round((present / total) * 100) : 0
        };
    };

    const attendanceStats = getAttendanceStats();

    // Render functions for better organization
    const renderPeriodCards = () => (
        <ScrollView 
            horizontal 
            style={styles.periodSelector}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.periodScrollContent}
        >
            {classes.map(cls => (
                <TouchableOpacity 
                    key={cls.id} 
                    style={[
                        styles.periodButton, 
                        selectedClass?.id === cls.id && styles.selectedPeriod,
                        currentTime === cls.endTime && styles.endingPeriod
                    ]}
                    onPress={() => {
                        setSelectedClass(cls);
                        setActiveTab('students');
                        setSearchQuery('');
                    }}
                >
                    <Text style={styles.periodText}>Period {cls.period}</Text>
                    <Text style={styles.subjectText}>{cls.subject}</Text>
                    <Text style={styles.timeText}>{cls.time}</Text>
                    <View style={styles.studentCountContainer}>
                        <Icon name="people" size={14} color="#6c757d" />
                        <Text style={styles.studentCount}>
                            {cls.students.length}
                        </Text>
                    </View>
                    {currentTime === cls.endTime && (
                        <View style={styles.endingBadge}>
                            <Text style={styles.endingText}>Now</Text>
                        </View>
                    )}
                </TouchableOpacity>
            ))}
            
            <TouchableOpacity 
                style={styles.addPeriodButton}
                onPress={() => {
                    resetClassForm();
                    setClassModalVisible(true);
                }}
            >
                <Icon name="add" size={24} color="#495057" />
                <Text style={styles.addPeriodText}>Add Class</Text>
            </TouchableOpacity>
        </ScrollView>
    );

    const renderClassDetails = () => {
        if (!selectedClass) return (
            <View style={styles.emptyClassContainer}>
                <Icon name="class" size={40} color="#adb5bd" />
                <Text style={styles.emptyClassText}>Select a class or create a new one</Text>
            </View>
        );

        return (
            <View style={styles.classDetailsContainer}>
                <View style={styles.classHeader}>
                    <View>
                        <Text style={styles.classTitle}>
                            Period {selectedClass.period}: {selectedClass.subject}
                        </Text>
                        <Text style={styles.classTime}>{selectedClass.time}</Text>
                        <View style={styles.studentSummaryContainer}>
                            <Icon name="people" size={16} color="#495057" />
                            <Text style={styles.studentSummary}>
                                {selectedClass.students.length} enrolled
                            </Text>
                        </View>
                    </View>
                    <View style={styles.classActions}>
                        <TouchableOpacity 
                            style={styles.editButton}
                            onPress={() => {
                                setClassForm({
                                    period: selectedClass.period,
                                    subject: selectedClass.subject,
                                    time: selectedClass.time,
                                    endTime: selectedClass.endTime
                                });
                                setEditingClass(selectedClass);
                                setClassModalVisible(true);
                            }}
                        >
                            <Icon name="edit" size={16} color="#212529" />
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={styles.deleteButton}
                            onPress={() => confirmDeleteClass(selectedClass.id)}
                        >
                            <Icon name="delete" size={16} color="#212529" />
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.tabsContainer}>
                    <TouchableOpacity
                        style={[
                            styles.tabButton,
                            activeTab === 'students' && styles.activeTab
                        ]}
                        onPress={() => setActiveTab('students')}
                    >
                        <Icon 
                            name="person" 
                            size={16} 
                            color={activeTab === 'students' ? '#4dabf7' : '#6c757d'} 
                        />
                        <Text style={[
                            styles.tabText,
                            activeTab === 'students' && styles.activeTabText
                        ]}>
                            Students
                        </Text>
                        <View style={styles.tabBadge}>
                            <Text style={styles.tabBadgeText}>
                                {selectedClass.students.length}
                            </Text>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[
                            styles.tabButton,
                            activeTab === 'attendance' && styles.activeTab
                        ]}
                        onPress={() => setActiveTab('attendance')}
                    >
                        <Icon 
                            name="check-circle" 
                            size={16} 
                            color={activeTab === 'attendance' ? '#4dabf7' : '#6c757d'} 
                        />
                        <Text style={[
                            styles.tabText,
                            activeTab === 'attendance' && styles.activeTabText
                        ]}>
                            Attendance
                        </Text>
                        <View style={styles.tabBadge}>
                            <Text style={styles.tabBadgeText}>
                                {attendanceStats.percentage}%
                            </Text>
                        </View>
                    </TouchableOpacity>
                </View>

                <View style={styles.searchContainer}>
                    <Icon name="search" size={20} color="#6c757d" style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search students..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    {searchQuery ? (
                        <TouchableOpacity 
                            style={styles.clearSearchButton}
                            onPress={() => setSearchQuery('')}
                        >
                            <Icon name="close" size={20} color="#6c757d" />
                        </TouchableOpacity>
                    ) : null}
                </View>

                {activeTab === 'students' ? renderStudentsTab() : renderAttendanceTab()}
            </View>
        );
    };

    const renderStudentsTab = () => (
        <>
            <Text style={styles.sectionHeader}>Add New Student</Text>
            <View style={styles.studentForm}>
                <View style={styles.inputContainer}>
                    <Icon name="person" size={20} color="#6c757d" style={styles.inputIcon} />
                    <TextInput
                        style={styles.input}
                        placeholder="Student Name"
                        value={newStudent.name}
                        onChangeText={text => setNewStudent({...newStudent, name: text})}
                    />
                </View>
                <View style={styles.inputContainer}>
                    <Icon name="confirmation-number" size={20} color="#6c757d" style={styles.inputIcon} />
                    <TextInput
                        style={styles.input}
                        placeholder="Roll Number"
                        value={newStudent.rollNumber}
                        onChangeText={text => setNewStudent({...newStudent, rollNumber: text})}
                        keyboardType="numeric"
                    />
                </View>
                <TouchableOpacity 
                    style={styles.addButton} 
                    onPress={addStudent}
                >
                    <Icon name="person-add" size={20} color="white" />
                    <Text style={styles.addButtonText}>Add Student</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.studentListHeader}>
                <Text style={styles.sectionHeader}>
                    Student List
                </Text>
                <View style={styles.attendanceSummary}>
                    <View style={styles.attendancePill}>
                        <Icon name="check" size={14} color="#2b8a3e" />
                        <Text style={styles.attendancePillText}>
                            {attendanceStats.present} Present
                        </Text>
                    </View>
                    <View style={[styles.attendancePill, {backgroundColor: '#ffecf0'}]}>
                        <Icon name="close" size={14} color="#c92a2a" />
                        <Text style={[styles.attendancePillText, {color: '#c92a2a'}]}>
                            {attendanceStats.absent} Absent
                        </Text>
                    </View>
                </View>
            </View>
            
            {filteredStudents.length > 0 ? (
                <FlatList
                    data={filteredStudents}
                    keyExtractor={item => item.id}
                    renderItem={({ item, index }) => (
                        <View style={[
                            styles.studentItem,
                            index % 2 === 0 ? styles.evenItem : styles.oddItem
                        ]}>
                            <View style={styles.studentInfo}>
                                <Text style={styles.studentName}>{item.name}</Text>
                                <Text style={styles.studentRoll}>Roll No: {item.rollNumber}</Text>
                            </View>
                            <View style={styles.studentStatus}>
                                <TouchableOpacity 
                                    style={[
                                        styles.attendanceStatus,
                                        item.attendance === 'present' ? styles.presentStatus : styles.absentStatus
                                    ]}
                                    onPress={() => toggleAttendance(item.id)}
                                >
                                    <Text style={styles.attendanceStatusText}>
                                        {item.attendance}
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity 
                                    style={styles.deleteStudentButton}
                                    onPress={() => {
                                        Alert.alert(
                                            'Remove Student',
                                            `Remove ${item.name} from this class?`,
                                            [
                                                { text: 'Cancel', style: 'cancel' },
                                                { text: 'Remove', onPress: () => removeStudent(item.id) }
                                            ]
                                        );
                                    }}
                                >
                                    <Icon name="delete" size={18} color="#fa5252" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={['#4dabf7']}
                        />
                    }
                />
            ) : (
                <View style={styles.emptyListContainer}>
                    <Icon name="person-off" size={40} color="#adb5bd" />
                    <Text style={styles.emptyText}>No students found</Text>
                    {searchQuery ? (
                        <TouchableOpacity 
                            style={styles.clearSearchLink}
                            onPress={() => setSearchQuery('')}
                        >
                            <Text style={styles.clearSearchLinkText}>Clear search</Text>
                        </TouchableOpacity>
                    ) : null}
                </View>
            )}
        </>
    );

    const renderAttendanceTab = () => (
        <>
            <View style={styles.attendanceStats}>
                <View style={styles.statItem}>
                    <View style={[styles.statIcon, {backgroundColor: '#d3f9d8'}]}>
                        <Icon name="check" size={20} color="#2b8a3e" />
                    </View>
                    <Text style={styles.statNumber}>{attendanceStats.present}</Text>
                    <Text style={styles.statLabel}>Present</Text>
                </View>
                <View style={styles.statItem}>
                    <View style={[styles.statIcon, {backgroundColor: '#ffecf0'}]}>
                        <Icon name="close" size={20} color="#c92a2a" />
                    </View>
                    <Text style={styles.statNumber}>{attendanceStats.absent}</Text>
                    <Text style={styles.statLabel}>Absent</Text>
                </View>
                <View style={styles.statItem}>
                    <View style={[styles.statIcon, {backgroundColor: '#e7f5ff'}]}>
                        <Icon name="people" size={20} color="#1971c2" />
                    </View>
                    <Text style={styles.statNumber}>{attendanceStats.total}</Text>
                    <Text style={styles.statLabel}>Total</Text>
                </View>
                <View style={styles.statItem}>
                    <View style={[styles.statIcon, {backgroundColor: '#fff3bf'}]}>
                        <Icon name="bar-chart" size={20} color="#e67700" />
                    </View>
                    <Text style={styles.statNumber}>{attendanceStats.percentage}%</Text>
                    <Text style={styles.statLabel}>Attendance</Text>
                </View>
            </View>

            <Text style={styles.sectionHeader}>
                Student Attendance
            </Text>
            {selectedClass.students.length > 0 ? (
                <FlatList
                    data={selectedClass.students}
                    keyExtractor={item => item.id}
                    renderItem={({ item }) => (
                        <View style={styles.attendanceItem}>
                            <View style={styles.studentInfo}>
                                <Text style={styles.studentName}>{item.name}</Text>
                                <Text style={styles.studentRoll}>Roll No: {item.rollNumber}</Text>
                            </View>
                            <TouchableOpacity 
                                style={[
                                    styles.attendanceButton,
                                    item.attendance === 'present' 
                                        ? styles.presentButton 
                                        : styles.absentButton
                                ]}
                                onPress={() => toggleAttendance(item.id)}
                            >
                                <Icon 
                                    name={item.attendance === 'present' ? 'check' : 'close'} 
                                    size={16} 
                                    color="white" 
                                />
                                <Text style={styles.attendanceButtonText}>
                                    {item.attendance}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    )}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={['#4dabf7']}
                        />
                    }
                />
            ) : (
                <View style={styles.emptyListContainer}>
                    <Icon name="person-off" size={40} color="#adb5bd" />
                    <Text style={styles.emptyText}>No students to track attendance</Text>
                </View>
            )}
        </>
    );

    const renderClassModal = () => (
        <Modal
            visible={isClassModalVisible}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setClassModalVisible(false)}
        >
            <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>
                        {editingClass ? 'Edit Class' : 'Add New Class'}
                    </Text>
                    
                    <View style={styles.inputContainer}>
                        <Icon name="schedule" size={20} color="#6c757d" style={styles.inputIcon} />
                        <TextInput
                            style={styles.modalInput}
                            placeholder="Period (e.g., 1)"
                            value={classForm.period}
                            onChangeText={text => setClassForm({...classForm, period: text})}
                            keyboardType="numeric"
                        />
                    </View>
                    
                    <View style={styles.inputContainer}>
                        <Icon name="menu-book" size={20} color="#6c757d" style={styles.inputIcon} />
                        <TextInput
                            style={styles.modalInput}
                            placeholder="Subject"
                            value={classForm.subject}
                            onChangeText={text => setClassForm({...classForm, subject: text})}
                        />
                    </View>
                    
                    <View style={styles.inputContainer}>
                        <Icon name="access-time" size={20} color="#6c757d" style={styles.inputIcon} />
                        <TextInput
                            style={styles.modalInput}
                            placeholder="Time (e.g., 8:00 AM - 9:00 AM)"
                            value={classForm.time}
                            onChangeText={text => setClassForm({...classForm, time: text})}
                        />
                    </View>
                    
                    <View style={styles.inputContainer}>
                        <Icon name="timer-off" size={20} color="#6c757d" style={styles.inputIcon} />
                        <TextInput
                            style={styles.modalInput}
                            placeholder="End Time (24-hour format, e.g., 09:00)"
                            value={classForm.endTime}
                            onChangeText={text => setClassForm({...classForm, endTime: text})}
                        />
                    </View>
                    
                    <View style={styles.modalButtons}>
                        <TouchableOpacity 
                            style={styles.modalCancelButton}
                            onPress={() => setClassModalVisible(false)}
                        >
                            <Text style={styles.modalButtonText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={styles.modalSaveButton}
                            onPress={saveClass}
                        >
                            <Text style={styles.modalButtonText}>
                                {editingClass ? 'Update' : 'Save'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );

    return (
        <KeyboardAvoidingView 
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <View style={styles.headerContainer}>
                <Text style={styles.header}>Class Management</Text>
                <View style={styles.timeDisplay}>
                    <Icon name="access-time" size={16} color="white" />
                    <Text style={styles.currentTimeText}>{moment().format('hh:mm A')}</Text>
                </View>
            </View>
            
            {renderPeriodCards()}
            {renderClassDetails()}
            {renderClassModal()}
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    headerContainer: {
        padding: 16,
        backgroundColor: 'white',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#dee2e6',
    },
    header: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#343a40',
    },
    timeDisplay: {
        backgroundColor: '#343a40',
        padding: 8,
        borderRadius: 20,
        flexDirection: 'row',
        alignItems: 'center',
    },
    currentTimeText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 14,
        marginLeft: 4,
    },
    periodSelector: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#dee2e6',
    },
    periodScrollContent: {
        paddingRight: 16,
    },
    periodButton: {
        padding: 16,
        marginRight: 12,
        backgroundColor: '#e9ecef',
        borderRadius: 12,
        width: 160,
        alignItems: 'flex-start',
        justifyContent: 'center',
    },
    selectedPeriod: {
        backgroundColor: '#e7f5ff',
        borderWidth: 1,
        borderColor: '#4dabf7',
    },
    endingPeriod: {
        borderWidth: 2,
        borderColor: '#ff6b6b',
    },
    periodText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#343a40',
    },
    subjectText: {
        fontSize: 14,
        color: '#495057',
        marginVertical: 4,
    },
    timeText: {
        fontSize: 12,
        color: '#6c757d',
    },
    studentCountContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
    },
    studentCount: {
        fontSize: 12,
        color: '#6c757d',
        marginLeft: 4,
    },
    endingBadge: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: '#ff6b6b',
        borderRadius: 10,
        paddingHorizontal: 6,
        paddingVertical: 2,
    },
    endingText: {
        color: 'white',
        fontSize: 10,
        fontWeight: 'bold',
    },
    addPeriodButton: {
        padding: 16,
        marginRight: 12,
        backgroundColor: '#e9ecef',
        borderRadius: 12,
        width: 160,
        alignItems: 'center',
        justifyContent: 'center',
        borderStyle: 'dashed',
        borderWidth: 1,
        borderColor: '#adb5bd',
    },
    addPeriodText: {
        color: '#495057',
        fontWeight: 'bold',
        marginTop: 8,
    },
    classDetailsContainer: {
        flex: 1,
        backgroundColor: 'white',
        padding: 16,
    },
    classHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#dee2e6',
    },
    classTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#212529',
    },
    classTime: {
        fontSize: 14,
        color: '#6c757d',
        marginTop: 4,
    },
    studentSummaryContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    studentSummary: {
        fontSize: 13,
        color: '#495057',
        marginLeft: 4,
    },
    classActions: {
        flexDirection: 'row',
    },
    editButton: {
        backgroundColor: '#fff3bf',
        borderRadius: 20,
        padding: 8,
        marginRight: 8,
    },
    deleteButton: {
        backgroundColor: '#ffc9c9',
        borderRadius: 20,
        padding: 8,
    },
    tabsContainer: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#dee2e6',
        marginBottom: 12,
    },
    tabButton: {
        flex: 1,
        padding: 12,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
    },
    activeTab: {
        borderBottomWidth: 2,
        borderBottomColor: '#4dabf7',
    },
    tabText: {
        color: '#6c757d',
        fontWeight: '500',
        marginLeft: 4,
    },
    activeTabText: {
        color: '#4dabf7',
        fontWeight: 'bold',
    },
    tabBadge: {
        backgroundColor: '#e9ecef',
        borderRadius: 10,
        paddingHorizontal: 6,
        paddingVertical: 2,
        marginLeft: 4,
    },
    tabBadgeText: {
        fontSize: 12,
        fontWeight: 'bold',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f1f3f5',
        borderRadius: 8,
        paddingHorizontal: 12,
        marginBottom: 16,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        paddingVertical: 12,
        fontSize: 14,
    },
    clearSearchButton: {
        padding: 4,
    },
    sectionHeader: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#343a40',
        marginBottom: 12,
    },
    studentForm: {
        marginBottom: 20,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f1f3f5',
        borderRadius: 8,
        paddingHorizontal: 12,
        marginBottom: 12,
    },
    inputIcon: {
        marginRight: 8,
    },
    input: {
        flex: 1,
        paddingVertical: 12,
        fontSize: 14,
    },
    addButton: {
        flexDirection: 'row',
        backgroundColor: '#4dabf7',
        borderRadius: 8,
        padding: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    addButtonText: {
        color: 'white',
        fontWeight: 'bold',
        marginLeft: 8,
    },
    studentListHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    attendanceSummary: {
        flexDirection: 'row',
    },
    attendancePill: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#d3f9d8',
        borderRadius: 12,
        paddingHorizontal: 8,
        paddingVertical: 4,
        marginLeft: 8,
    },
    attendancePillText: {
        fontSize: 12,
        color: '#2b8a3e',
        marginLeft: 4,
    },
    studentItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#e9ecef',
    },
    evenItem: {
        backgroundColor: '#f8f9fa',
    },
    oddItem: {
        backgroundColor: 'white',
    },
    studentInfo: {
        flex: 1,
    },
    studentName: {
        fontSize: 15,
        fontWeight: '500',
        color: '#212529',
    },
    studentRoll: {
        fontSize: 13,
        color: '#6c757d',
        marginTop: 4,
    },
    studentStatus: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    attendanceStatus: {
        borderRadius: 12,
        paddingHorizontal: 8,
        paddingVertical: 4,
        marginRight: 8,
    },
    presentStatus: {
        backgroundColor: '#d3f9d8',
    },
    absentStatus: {
        backgroundColor: '#ffecf0',
    },
    attendanceStatusText: {
        fontSize: 12,
        fontWeight: 'bold',
    },
    deleteStudentButton: {
        padding: 4,
    },
    attendanceItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#e9ecef',
    },
    attendanceButton: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 6,
    },
    presentButton: {
        backgroundColor: '#40c057',
    },
    absentButton: {
        backgroundColor: '#fa5252',
    },
    attendanceButtonText: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
        marginLeft: 4,
    },
    emptyListContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    emptyText: {
        textAlign: 'center',
        color: '#adb5bd',
        marginTop: 12,
        fontSize: 14,
    },
    clearSearchLink: {
        marginTop: 8,
    },
    clearSearchLinkText: {
        color: '#4dabf7',
        fontSize: 14,
    },
    emptyClassContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    emptyClassText: {
        color: '#adb5bd',
        fontSize: 16,
        marginTop: 12,
    },
    attendanceStats: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    statItem: {
        alignItems: 'center',
        width: '23%',
    },
    statIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    statNumber: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#212529',
    },
    statLabel: {
        fontSize: 12,
        color: '#6c757d',
        marginTop: 4,
    },
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
        width: '90%',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#343a40',
        textAlign: 'center',
    },
    modalInput: {
        flex: 1,
        paddingVertical: 12,
        fontSize: 14,
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 16,
    },
    modalCancelButton: {
        backgroundColor: '#e9ecef',
        borderRadius: 8,
        padding: 14,
        flex: 1,
        marginRight: 8,
        alignItems: 'center',
    },
    modalSaveButton: {
        backgroundColor: '#4dabf7',
        borderRadius: 8,
        padding: 14,
        flex: 1,
        marginLeft: 8,
        alignItems: 'center',
    },
    modalButtonText: {
        fontWeight: 'bold',
    },
});

export default TeacherclassManagement;
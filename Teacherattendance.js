import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  ScrollView, 
  Modal, 
  TextInput,
  Button,
  Alert,
  Dimensions,
  Share,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator
} from 'react-native';

import { Delete, getAllOfCollectionwhere, getAllOfCollectionwhere1, getAllOfCollectionwherewhere, saveData, upDateCollectionData } from './service/main';
import { useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';

// Initialize Firebase (replace with your config)


// Utility functions
const formatDate = (date) => {
  const d = new Date(date);
  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

const formatMonth = (date) => {
  const d = new Date(date);
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const year = d.getFullYear();
  return `${month}/${year}`;
};

const formatYear = (date) => new Date(date).getFullYear().toString();

const TeacherAttendance = (props) => {
  const [attendance , setAttendance] = useState();
  const [state, setState] = useState({
    students: [],
    currentDate: new Date(),
    attendanceRecords: {},
    showAddStudentModal: false,
    newStudentName: '',
    newStudentRollNumber: '',
    newStudentEmail: '',
    newStudentSeaction: '',
    newStudentPhone: '',



    newStudentClass: '',
    searchQuery: '',
    viewMode: 'daily',
    holidays: [],
    showReportOptions: false,
    adminEmail: 'admin@school.edu',
    headEmail: 'head@school.edu',
    selectedStudent: null,
    selectedMonth: formatMonth(new Date()),
    showAbsentModal: false,
    absentReason: '',
    selectedAbsentStudent: null,
    showHolidayModal: false,
    newHoliday: { date: '', name: '' },
    userRole: 'teacher',
    loading: false,
    error: null
  });
const userData=useSelector(state=>state)
const[allAttendes,setAllAttendes]=useState([])
  // Load data from Firebase
  useEffect(() => {
  

    fetchData();
    // saveToFirebase
  }, []);
  const fetchData = async () => {
      try {
    
    
   const dateme=getCurrentDate()

        // Load students
        // const studentsSnapshot = await db.collection('students').orderBy('rollNumber').get();
        const students = await getAllOfCollectionwhere("students",  "teacherID",userData.counter.user.id)
        let count=0;
        for (let i = 0; i < students.length; i++) {
          const element = students[i];
                 let dataateendes=await getAllOfCollectionwherewhere("attendance","sid",element.id,"currentDate",dateme)
        
   if(dataateendes.length>0)
   {
       count++;
   }
          
        }
        if(count==0)
        {
          for (let i = 0; i < students.length; i++) {
          const element = students[i];
          
         await upDateCollectionData("students",element.id,{  absentReason: "present", present: true})
  
          
        }
      }
  
   
     
        // Load holidays
        // const holidaysSnapshot = await db.collection('holidays').get();
        // const holidays = holidaysSnapshot.docs.map(doc => ({
        //   id: doc.id,
        //   ...doc.data()
        // }));

        // // Load attendance records
        // const attendanceSnapshot = await db.collection('attendance').get();
        // const attendanceRecords = {};
        // attendanceSnapshot.forEach(doc => {
        //   attendanceRecords[doc.id] = doc.data().records;
        // });

        setState(prev => ({
          ...prev,
          students,
         
      
         
          error: null
        }));
      } catch (error) {
        console.error('Error loading data:', error);
        setState(prev => ({ 
          ...prev, 
          loading: false,
          error: 'Failed to load data. Please try again.' 
        }));
      }
    };
  // Save data to Firebase with error handling

  // Check if date is Sunday
  const isSunday = (date) => new Date(date).getDay() === 0;

  // Check if date is holiday
  const isHoliday = (date) => {
    const dateStr = formatDate(date);
    return state.holidays.some(holiday => holiday.date === dateStr);
  };

  // Get all dates in current month
  const getDatesInMonth = () => {
    const date = new Date(state.currentDate);
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    return Array.from({ length: daysInMonth }, (_, i) => new Date(year, month, i + 1));
  };

  // Calculate attendance percentage
  const calculateAttendancePercentage = () => {
    const totalDays = Object.keys(state.attendanceRecords).length;
    if (totalDays === 0) return;

    setState(prev => ({
      ...prev,
      students: prev.students.map(student => {
        const presentDays = Object.values(state.attendanceRecords)
          .filter(dayRecords => 
            dayRecords.find(s => s.id === student.id)?.present
          ).length;
        return {
          ...student,
          attendancePercentage: Math.round((presentDays / totalDays) * 100) || 0
        };
      })
    }));
  };

  // Load attendance for current date
  // useEffect(() => {
  //   if (state.viewMode === 'daily') {
  //     const dateKey = formatDate(state.currentDate);
  //     if (state.attendanceRecords[dateKey]) {
  //       setState(prev => ({
  //         ...prev,
  //         students: prev.students.map(student => {
  //           const savedRecord = state.attendanceRecords[dateKey].find(s => s.id === student.id);
  //           return savedRecord ? { 
  //             ...student, 
  //             present: savedRecord.present,
  //             absentReason: savedRecord.absentReason || ''
  //           } : student;
  //         })
  //       }));
  //     } else {
  //       setState(prev => ({
  //         ...prev,
  //         students: prev.students.map(student => ({ 
  //           ...student, 
  //           present: true,
  //           absentReason: '' 
  //         }))
  //       }));
        
  //     }
  //   }
  //   calculateAttendancePercentage();
  // }, [state.currentDate, state.viewMode, state.attendanceRecords]);

  // Filter students based on search query
  const filteredStudents = state.students.filter(student =>
    student.name.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
    student.rollNumber.toString().includes(state.searchQuery)
  );

  // Attendance actions
  const toggleAttendance = async(id) => {
    if (isHoliday(state.currentDate)) {
      Alert.alert('Holiday', 'Cannot mark attendance on a holiday');
      return;
    }
    
    if (isSunday(state.currentDate)) {
      Alert.alert('Sunday', 'School is closed on Sundays');
      return;
    }
    
    const student = state.students.find(s => s.id === id);
    if (student.present) {
      setState(prev => ({
        ...prev,
        selectedAbsentStudent: student,
        showAbsentModal: true,
        absentReason: ''
      }));
    } else {
      const dateme=getCurrentDate()
      setState(prev => ({
        ...prev,
        students: prev.students.map(student =>
          student.id === id ? { 
            ...student, 
            present: true,
            absentReason: '' 
          } : student
        )
      }));
   
          await upDateCollectionData("students",id,{  absentReason: "present", present: true})
          let dataateendes=await getAllOfCollectionwherewhere("attendance","sid",id,"currentDate",dateme)
        
   if(dataateendes.length>0)
   {
          await upDateCollectionData("attendance",dataateendes[0].id,{  absentReason: "present", present: true})
   }

    }
  };

  const handleAbsentSubmit =async () => {
    if (!state.absentReason.trim()) {
      Alert.alert('Error', 'Please provide a reason for absence');
      return;
    }
 
    
  
   
       const dateme=getCurrentDate()
    
    await upDateCollectionData("students",state.selectedAbsentStudent.id,{  absentReason: state.absentReason, present: false})
     
                       let dataateendes=await getAllOfCollectionwherewhere("attendance","sid",state.selectedAbsentStudent.id,"currentDate",dateme)
         console.log("==>",dataateendes,dateme)
   if(dataateendes.length>0)
   {
          await upDateCollectionData("attendance",dataateendes[0].id,{  absentReason: "absent", present: false})
   }else{

    let temp= state.selectedAbsentStudent
   temp.absentReason="absent"
   let id= Date.now().toString()
   temp.sid=temp.id
   temp.id=id
   temp.currentDate=dateme
   temp.present=false
   await saveData("attendance",id,temp)

   }
     setState(prev => ({
      ...prev,
      students: prev.students.map(student =>
        student.id === state.selectedAbsentStudent.id ? { 
          ...student, 
          present: false,
          absentReason: state.absentReason
        } : student
      ),
      showAbsentModal: false,
      absentReason: '',
      selectedAbsentStudent: null
    }));
  };

  const saveAttendance = async () => {
    if (isHoliday(state.currentDate)) {
      Alert.alert('Holiday', 'Cannot save attendance on a holiday');
      return;
    }
    
    if (isSunday(state.currentDate)) {
      Alert.alert('Sunday', 'Cannot save attendance on Sunday');
      return;
    }
    
    const dateKey = formatDate(state.currentDate);
    const updatedRecords = {
      ...state.attendanceRecords,
      [dateKey]: state.students.map(student => ({
        id: student.id,
        name: student.name,
        rollNumber: student.rollNumber,
        class: student.class,
        present: student.present,
        absentReason: student.absentReason
      }))
    };
    
    try {
      await db.collection('attendance').doc(dateKey).set({
        date: dateKey,
        records: updatedRecords[dateKey]
      });
      
      setState(prev => ({
        ...prev,
        attendanceRecords: updatedRecords
      }));
      Alert.alert('Success', `Attendance saved for ${dateKey}`);
    } catch (error) {
      console.error('Error saving attendance:', error);
      Alert.alert('Error', 'Failed to save attendance');
    }
  };

  // Date navigation
  const changeDate = (days) => {
    const newDate = new Date(state.currentDate);
    newDate.setDate(newDate.getDate() + days);
    // fetchData()
    setState(prev => ({ ...prev, currentDate: newDate }));
  };

  const changeMonth = (months) => {
    const newDate = new Date(state.currentDate);
    newDate.setMonth(newDate.getMonth() + months);
    setState(prev => ({ ...prev, currentDate: newDate }));
  };

  const changeYear = (years) => {
    const newDate = new Date(state.currentDate);
    newDate.setFullYear(newDate.getFullYear() + years);
    setState(prev => ({ ...prev, currentDate: newDate }));
  };

  function getCurrentDate() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}



// Usage:

  // Outputs: "2023-07-19" (or current date)
  // Student management
  const addNewStudent = async () => {
    //  console.log(1,state.newStudentRollNumber)
    if (!state.newStudentName.trim()) {
      Alert.alert('Error', 'Please enter student name');
      return;
    }
   

    if (!state.newStudentRollNumber.trim()) {
      Alert.alert('Error', 'Please enter roll number');
      return;
    }

    if (!state.newStudentClass.trim()) {
      Alert.alert('Error', 'Please enter class');
      return;
    }

    // Check if roll number already exists
    const rollNumberExists = state.students.some(
      student => student.rollNumber === state.newStudentRollNumber.trim()
    );

    if (rollNumberExists) {
      Alert.alert('Error', 'Roll number already exists');
      return;
    }
    const currentDate = getCurrentDate();
let id= Date.now().toString()
    const newStudent = {
      id: id,
      name: state.newStudentName.trim(),
      rollNumber: state.newStudentRollNumber.trim(),
      class: state.newStudentClass.trim(),
      present: true,
      absentReason: '',
      attendancePercentage: 100,
      teacherID:userData.counter.user.id,
    currentDate:currentDate,
    sid:id
    };
    // console.log(newStudent)
    try {
   await saveData("students",id,newStudent)
   await saveData("attendance",id,newStudent)

      
      setState(prev => ({
        ...prev,
        students: [...prev.students, newStudent],
        newStudentName: '',
        newStudentRollNumber: '',
        newStudentClass: '',
        showAddStudentModal: false
      }));
      Alert.alert('Success', `${newStudent.name} added successfully`);
    } catch (error) {
      console.error('Error adding student:', error);
      Alert.alert('Error', 'Failed to add student');
    }
  };

  // Holiday management
  const addHoliday = async () => {
    if (!state.newHoliday.date || !state.newHoliday.name) {
      Alert.alert('Error', 'Please provide both date and holiday name');
      return;
    }

    if (!/^\d{2}\/\d{2}\/\d{4}$/.test(state.newHoliday.date)) {
      Alert.alert('Error', 'Please enter date in DD/MM/YYYY format');
      return;
    }

    const holiday = {
      date: state.newHoliday.date,
      name: state.newHoliday.name,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    
    try {
      await db.collection('holidays').add(holiday);
      
      setState(prev => ({
        ...prev,
        holidays: [...prev.holidays, holiday],
        showHolidayModal: false,
        newHoliday: { date: '', name: '' }
      }));
      Alert.alert('Success', 'Holiday added successfully');
    } catch (error) {
      console.error('Error adding holiday:', error);
      Alert.alert('Error', 'Failed to add holiday');
    }
  };

  // Attendance calculations
  const getMonthlyAttendance = () => {
    const monthKey = formatMonth(state.currentDate);
    const monthRecords = Object.entries(state.attendanceRecords)
      .filter(([date]) => date.endsWith(monthKey.split('/').reverse().join('/')))
      .map(([date, records]) => ({ date, records }));
    
    const workingDays = getDatesInMonth().filter(date => 
      !isSunday(date) && !isHoliday(date)
    ).length;
    
    return {
      month: monthKey,
      workingDays,
      holidays: state.holidays.filter(h => 
        h.date.endsWith(monthKey.split('/').reverse().join('/'))
      ).length,
      records: monthRecords,
      allDates: getDatesInMonth()
    };
  };

  // Report generation
  const generateMonthlyReport = () => {
    const monthData = getMonthlyAttendance();
    let report = `Monthly Attendance Report - ${monthData.month}\n\n`;
    report += `Total Working Days: ${monthData.workingDays}\n`;
    report += `Total Holidays: ${monthData.holidays}\n\n`;
    report += `Student Attendance Summary:\n`;
    
    state.students.forEach(student => {
      const presentDays = monthData.records.filter(({ records }) => 
        records.find(s => s.id === student.id)?.present
      ).length;
      
      const absentDays = monthData.workingDays - presentDays;
      const percentage = Math.round((presentDays / monthData.workingDays) * 100) || 0;
      
      report += `${student.rollNumber}. ${student.name} (${student.class}):\n`;
      report += `Present: ${presentDays}/${monthData.workingDays} days (${percentage}%)\n`;
      report += `Absent: ${absentDays} days\n\n`;
    });
    
    return report;
  };

  const shareReport = async () => {
    try {
      const report = generateMonthlyReport();
      await Share.share({
        message: report,
        title: `Attendance Report - ${formatMonth(state.currentDate)}`
      });
    } catch (error) {
      console.error('Error sharing report:', error);
      Alert.alert('Error', 'Failed to share report');
    }
  };

  const sendReportToAdmin = () => {
    const report = generateMonthlyReport();
    Alert.alert(
      'Report Sent',
      `Monthly attendance report has been sent to:\nAdmin: ${state.adminEmail}\nHead: ${state.headEmail}`,
      [
        { text: 'OK', onPress: () => setState(prev => ({ ...prev, showReportOptions: false })) },
        { text: 'Share via Other Apps', onPress: shareReport }
      ]
    );
  };

  // Render components
  const renderStudentItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.studentItem, 
        { backgroundColor: item.present ? '#f0fff0' : '#fff0f0' }
      ]}
      onPress={() => toggleAttendance(item.id)}
      onLongPress={async() => {
        setState(prev => ({ ...prev, selectedStudent: item }))
        console.log(888)
        await Delete("students",item.id)
        fetchData()
      }}
    >
      <View style={styles.studentInfo}>
        <Text style={styles.studentRoll}>{item.rollNumber}</Text>
        <View style={styles.studentDetails}>
          <Text style={styles.studentName}>{item.name}</Text>
          <Text style={styles.studentClass}>Class: {item.class}</Text>
          {!item.present && item.absentReason && (
            <Text style={styles.absentReasonText}>Reason: {item.absentReason}</Text>
          )}
          <Text style={styles.attendancePercentageText}>
            Attendance: {item.attendancePercentage}%
          </Text>
        </View>
      </View>
      <View style={styles.attendanceStatus}>
        <Text style={[
          styles.statusText, 
          item.present ? styles.presentText : styles.absentText
        ]}>
          {item.present ? 'Present' : 'Absent'}
        </Text>
        <Text style={[styles.statusIcon, item.present ? styles.presentIcon : styles.absentIcon]}>
          {item.present ? '✓' : '✗'}
        </Text>
      </View>
    </TouchableOpacity>
  );
function formatDateToYYYYMMDD(dateString,type) {
  const [day, month, year] = dateString.split('/');
  let date1="0"
  if(type==1)
  {
   date1=(parseInt(day)-1).toString()
  }else{
    date1=(parseInt(day)+1).toString()
  }
  return `${year}-${month.padStart(2, '0')}-${date1.padStart(2, '0')}`;
}
function formatDateToYYYYMMDD2(dateString) {
  const [day, month, year] = dateString.split('/');
  
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}
  const renderDateNavigation = () => {
    const dateTexts = {
      daily: formatDate(state.currentDate),
      monthly: formatMonth(state.currentDate),
      yearly: formatYear(state.currentDate)
    };

    const changeFunctions = {
      daily: changeDate,
      monthly: changeMonth,
      yearly: changeYear
    };

    return (
      <View style={styles.dateContainer}>
        <TouchableOpacity 
          style={styles.navButton}
          onPress={async() => {
            changeFunctions[state.viewMode](-1)
           
            const formattedDate = formatDateToYYYYMMDD(dateTexts[state.viewMode],1);
            let students=await getAllOfCollectionwhere("attendance","currentDate",formattedDate)
           setState(prev => ({
          ...prev,
          students,
         
      
         
          error: null
        }));
            
          }}
        >
          <Text style={styles.navButtonText}>←</Text>
          
        </TouchableOpacity>
        <View style={styles.dateDisplayContainer}>
          <Text style={styles.dateText}>{dateTexts[state.viewMode]}</Text>
          {state.viewMode === 'daily' && isHoliday(state.currentDate) && (
            <Text style={styles.holidayBadge}>Holiday</Text>
          )}
          {state.viewMode === 'daily' && isSunday(state.currentDate) && (
            <Text style={styles.sundayBadge}>Sunday</Text>
          )}
        </View>
        <TouchableOpacity 
          style={styles.navButton}
          onPress={async() =>{ changeFunctions[state.viewMode](1)

              
            const formattedDate = formatDateToYYYYMMDD(dateTexts[state.viewMode],2);
            let students=await getAllOfCollectionwhere("attendance","currentDate",formattedDate)
           setState(prev => ({
          ...prev,
          students,
         
      
         
          error: null
        }));
          }}
        >
          <Text style={styles.navButtonText}>→</Text>
        </TouchableOpacity>
      </View>
      
    );
  };
// console.log(state.currentDate)
  const renderMonthlyView = () => {
    const monthData = getMonthlyAttendance();
    const currentMonth = formatMonth(state.currentDate);
    const nav=useNavigation()
    return (
      <ScrollView style={styles.monthlyView}>
        <Text style={styles.sectionHeader}>
          Monthly Attendance for {monthData.month}
        </Text>
        
        <View style={styles.summaryCard}>
          <Text style={styles.summaryText}>Working Days: {monthData.workingDays}</Text>
          <Text style={styles.summaryText}>Holidays: {monthData.holidays}</Text>
          <Text style={styles.summaryText}>Sundays: {monthData.allDates.filter(isSunday).length}</Text>
          
          {(state.userRole === 'admin' || state.userRole === 'teacher') && (
            <View style={styles.actionButtons}>
              <TouchableOpacity 
                style={[styles.actionButton, styles.reportButton]}
                onPress={() => setState(prev => ({ ...prev, showReportOptions: true }))}
              >
                <Text style={styles.actionButtonText}>Generate Report</Text>
              </TouchableOpacity>
              
              {state.userRole === 'admin' && (
                <TouchableOpacity 
                  style={[styles.actionButton, styles.holidayButton]}
                  onPress={() => setState(prev => ({ ...prev, showHolidayModal: true }))}
                >
                  <Text style={styles.actionButtonText}>Add Holiday</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
        
        <Text style={styles.sectionHeader}>Daily Records</Text>
        {monthData.allDates.map(date => {
          const dateStr = formatDate(date);
          const isDayHoliday = isHoliday(date);
          const isDaySunday = isSunday(date);
          const records = state.attendanceRecords[dateStr];
          
          return (
            <View key={dateStr} style={[
              styles.dayCard,
              isDayHoliday && styles.holidayCard,
              isDaySunday && styles.sundayCard
            ]}>
            <TouchableOpacity onPress={async()=>{
              console.log(dateStr)
              let datemy=formatDateToYYYYMMDD2(dateStr)
            let students=await getAllOfCollectionwhere("attendance","currentDate",datemy)
            console.log(students)
         nav.navigate("allAttendes",students)
            }}>
                <Text style={styles.dayHeader}>
                {dateStr} 
                {isDayHoliday && ' (Holiday)'}
                {isDaySunday && ' (Sunday)'}
              </Text>
            </TouchableOpacity>
              
              {records ? (
                <>
                  <Text>
                    Present: {records.filter(r => r.present).length} / {records.length}
                  </Text>
                  {records.filter(r => !r.present).length > 0 && (
                    <View style={styles.absentList}>
                      <Text style={styles.absentHeader}>Absent Students:</Text>
                      {records
                        .filter(r => !r.present)
                        .map(student => (
                          <Text key={student.id} style={styles.absentStudent}>
                            {student.rollNumber}. {student.name} ({student.class}): {student.absentReason || 'No reason provided'}
                          </Text>
                        ))}
                    </View>
                  )}
                </>
              ) : (
                <Text style={styles.noRecordsText}>
                  {isDayHoliday ? 'Holiday - No attendance' : 
                   isDaySunday ? 'Sunday - School closed' : 
                   'No attendance recorded'}
                </Text>
              )}
            </View>
          );
        })}
      </ScrollView>
    );
  };

  const renderReportOptionsModal = () => (
    <Modal
      visible={state.showReportOptions}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setState(prev => ({ ...prev, showReportOptions: false }))}
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalContainer}
      >
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Send Monthly Report</Text>
          
          <Text style={styles.modalText}>
            Send attendance report for {formatMonth(state.currentDate)} to admin and head
          </Text>
          
          <Text style={styles.modalLabel}>Admin Email:</Text>
          <TextInput
            style={styles.emailInput}
            value={state.adminEmail}
            onChangeText={(text) => setState(prev => ({ ...prev, adminEmail: text }))}
            keyboardType="email-address"
            editable={state.userRole === 'admin'}
          />
          
          <Text style={styles.modalLabel}>Head Email:</Text>
          <TextInput
            style={styles.emailInput}
            value={state.headEmail}
            onChangeText={(text) => setState(prev => ({ ...prev, headEmail: text }))}
            keyboardType="email-address"
            editable={state.userRole === 'admin'}
          />
          
          <View style={styles.modalButtonGroup}>
            <TouchableOpacity 
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => setState(prev => ({ ...prev, showReportOptions: false }))}
            >
              <Text style={styles.modalButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.modalButton, styles.sendButton]}
              onPress={sendReportToAdmin}
            >
              <Text style={styles.modalButtonText}>Send Report</Text>
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity 
            style={styles.shareButton}
            onPress={shareReport}
          >
            <Text style={styles.shareButtonText}>Share via Other Apps</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );

  const renderAbsentModal = () => (
    <Modal
      visible={state.showAbsentModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setState(prev => ({ ...prev, showAbsentModal: false }))}
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalContainer}
      >
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>
            Mark {state.selectedAbsentStudent?.name} as Absent
          </Text>
          
          <Text style={styles.modalText}>
            Please provide a reason for absence on {formatDate(state.currentDate)}:
          </Text>
          
          <TextInput
            style={[styles.input, styles.multilineInput]}
            placeholder="Reason for absence..."
            value={state.absentReason}
            onChangeText={(text) => setState(prev => ({ ...prev, absentReason: text }))}
            multiline={true}
            autoFocus={true}
          />
          
          <View style={styles.modalButtonGroup}>
            <TouchableOpacity 
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => setState(prev => ({ ...prev, showAbsentModal: false }))}
            >
              <Text style={styles.modalButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.modalButton, styles.sendButton]}
              onPress={handleAbsentSubmit}
            >
              <Text style={styles.modalButtonText}>Submit</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );

  const renderHolidayModal = () => (
    <Modal
      visible={state.showHolidayModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setState(prev => ({ ...prev, showHolidayModal: false }))}
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalContainer}
      >
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Add New Holiday</Text>
          
          <Text style={styles.modalLabel}>Date (DD/MM/YYYY):</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. 23/03/2023"
            value={state.newHoliday.date}
            onChangeText={(text) => setState(prev => ({ 
              ...prev, 
              newHoliday: { ...prev.newHoliday, date: text } 
            }))}
          />
          
          <Text style={styles.modalLabel}>Holiday Name:</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Pakistan Day"
            value={state.newHoliday.name}
            onChangeText={(text) => setState(prev => ({ 
              ...prev, 
              newHoliday: { ...prev.newHoliday, name: text } 
            }))}
          />
          
          <View style={styles.modalButtons}>
            <TouchableOpacity 
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => setState(prev => ({ 
                ...prev, 
                showHolidayModal: false,
                newHoliday: { date: '', name: '' } 
              }))}
            >
              <Text style={styles.modalButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.modalButton, styles.sendButton]}
              onPress={addHoliday}
            >
              <Text style={styles.modalButtonText}>Add Holiday</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );

  const renderAddStudentModal = () => (
    <Modal
      visible={state.showAddStudentModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setState(prev => ({ ...prev, showAddStudentModal: false }))}
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalContainer}
      >
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Add New Student</Text>
          
          <Text style={styles.modalLabel}>Full Name:</Text>
          
          <TextInput
            style={styles.input}
            placeholder="Enter student full name"
            value={state.newStudentName}
            onChangeText={(text) => setState(prev => ({ ...prev, newStudentName: text }))}
            autoFocus={true}
          />
          
          <Text style={styles.modalLabel}>Roll Number:</Text>
          <TextInput
          
            style={styles.input}
            placeholder="Enter roll number"
            value={state.newStudentRollNumber}
            onChangeText={(text) => setState(prev => ({ ...prev, newStudentRollNumber: text }))}
            keyboardType="numeric"
          />
             <Text style={styles.modalLabel}>Mobile Number:</Text>
          <TextInput
          
            style={styles.input}
            placeholder="Enter Mobile number"
            value={state.newStudentPhone}
            onChangeText={(text) => setState(prev => ({ ...prev, newStudentPhone: text }))}
            keyboardType="numeric"
          />
          
          <Text style={styles.modalLabel}>Class:</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter class/section"
            value={state.newStudentClass}
            onChangeText={(text) => setState(prev => ({ ...prev, newStudentClass: text }))}
          />
             <Text style={styles.modalLabel}>section:</Text>
          <TextInput
          
            style={styles.input}
            placeholder="Section"
            value={state.newStudentSeaction}
            onChangeText={(text) => setState(prev => ({ ...prev, newStudentSeaction: text }))}
         
          />
            <Text style={styles.modalLabel}>Email:</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Email"
            value={state.newStudentEmail}
            onChangeText={(text) => setState(prev => ({ ...prev, newStudentEmail: text }))}
          />
          <View style={styles.modalButtons}>
            <TouchableOpacity 
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => setState(prev => ({ 
                ...prev, 
                showAddStudentModal: false,
                newStudentName: '',
                newStudentRollNumber: '',
                newStudentClass: ''
              }))}
            >
              <Text style={styles.modalButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.modalButton, styles.sendButton]}
              onPress={addNewStudent}
            >
              <Text style={styles.modalButtonText}>Add Student</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );

  if (state.loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3498db" />
        <Text style={styles.loadingText}>Loading data...</Text>
      </View>
    );
  }

  if (state.error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{state.error}</Text>
        <Button 
          title="Retry" 
          onPress={() => setState(prev => ({ ...prev, loading: true, error: null }))}
          color="#3498db"
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Teacher Attendance System</Text>
        <Text style={styles.subHeaderText}>
          {state.viewMode === 'daily' ? formatDate(state.currentDate) : 
           state.viewMode === 'monthly' ? formatMonth(state.currentDate) : 
           formatYear(state.currentDate)}
        </Text>
        <Text style={styles.roleText}>
          Logged in as: {state.userRole.charAt(0).toUpperCase() + state.userRole.slice(1)}
        </Text>
      </View>

      <View style={styles.viewModeContainer}>
        {['daily', 'monthly', 'yearly'].map((mode) => (
          <TouchableOpacity
            key={mode}
            style={[styles.viewModeButton, state.viewMode === mode && styles.activeViewMode]}
            onPress={() => {setState(prev => ({ ...prev, viewMode: mode })),fetchData()}}
          >
            <Text style={[styles.viewModeText, state.viewMode === mode && styles.activeViewModeText]}>
              {mode.charAt(0).toUpperCase() + mode.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {renderDateNavigation()}

      {state.viewMode === 'daily' ? (
        <>
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search by name or roll number..."
              value={state.searchQuery}
              onChangeText={(text) => setState(prev => ({ ...prev, searchQuery: text }))}
            />
          </View>

          <FlatList
            data={filteredStudents}
            renderItem={renderStudentItem}
            keyExtractor={item => item.id}
            style={styles.list}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No students found</Text>
            }
          />
        </>
      ) : state.viewMode === 'monthly' ? (
        renderMonthlyView()
      ) : (
        <ScrollView style={styles.yearlyView}>
          <Text style={styles.sectionHeader}>
            Yearly Attendance for {formatYear(state.currentDate)}
          </Text>
          <Text style={styles.emptyText}>Select monthly view to generate reports</Text>
        </ScrollView>
      )}

      {(state.userRole === 'admin' || state.userRole === 'teacher') && (
        <View style={styles.buttonGroup}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.addButton]}
            onPress={() => setState(prev => ({ ...prev, showAddStudentModal: true }))}
          >
            <Text style={styles.actionButtonText}>Add Student</Text>
          </TouchableOpacity>
          {state.viewMode === 'daily' && (
            <TouchableOpacity 
              style={[styles.actionButton, styles.saveButton]}
              onPress={saveAttendance}
            >
              <Text style={styles.actionButtonText}>Save Attendance</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {renderAddStudentModal()}
      {renderReportOptionsModal()}
      {renderAbsentModal()}
      {renderHolidayModal()}
    </View>
  );
};

// Styles
const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: '#f8f9fa',
  },
  header: {
    marginBottom: 15,
    alignItems: 'center',
  },
  headerText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 5,
  },
  subHeaderText: {
    fontSize: 16,
    color: '#7f8c8d',
  },
  roleText: {
    fontSize: 14,
    color: '#95a5a6',
    marginTop: 3,
  },
  viewModeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 15,
    backgroundColor: '#ecf0f1',
    borderRadius: 10,
    padding: 5,
  },
  viewModeButton: {
    padding: 10,
    borderRadius: 5,
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 2,
  },
  activeViewMode: {
    backgroundColor: '#3498db',
  },
  viewModeText: {
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  activeViewModeText: {
    color: '#fff',
  },
  dateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 10,
    elevation: 2,
  },
  navButton: {
    padding: 10,
    borderRadius: 5,
    backgroundColor: '#3498db',
  },
  navButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  dateDisplayContainer: {
    alignItems: 'center',
  },
  dateText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  holidayBadge: {
    color: '#e74c3c',
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 2,
  },
  sundayBadge: {
    color: '#9b59b6',
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 2,
  },
  searchContainer: {
    marginBottom: 15,
  },
  searchInput: {
    height: 45,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
    fontSize: 16,
  },
  list: {
    flex: 1,
    marginBottom: 15,
  },
  studentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    marginBottom: 10,
    borderRadius: 10,
    elevation: 2,
  },
  studentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  studentRoll: {
    fontSize: 14,
    color: '#7f8c8d',
    marginRight: 10,
    fontWeight: 'bold',
    width: 40,
  },
  studentDetails: {
    flex: 1,
  },
  studentName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2c3e50',
  },
  studentClass: {
    fontSize: 12,
    color: '#3498db',
    marginTop: 2,
  },
  absentReasonText: {
    fontSize: 12,
    color: '#e74c3c',
    fontStyle: 'italic',
    marginTop: 2,
  },
  attendancePercentageText: {
    fontSize: 12,
    color: '#3498db',
    marginTop: 2,
  },
  attendanceStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    marginRight: 10,
    fontSize: 14,
    fontWeight: '500',
  },
  presentText: {
    color: '#2ecc71',
  },
  absentText: {
    color: '#e74c3c',
  },
  statusIcon: {
    fontSize: 20,
    fontWeight: 'bold'
  },
  presentIcon: {
    color: '#2ecc71',
  },
  absentIcon: {
    color: '#e74c3c',
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  actionButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: '#27ae60',
  },
  saveButton: {
    backgroundColor: '#3498db',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#95a5a6',
    fontSize: 16,
  },
  monthlyView: {
    flex: 1,
    marginBottom: 15,
  },
  yearlyView: {
    flex: 1,
    marginBottom: 15,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 10,
    marginTop: 5,
  },
  summaryCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    elevation: 3,
  },
  summaryText: {
    fontSize: 16,
    marginBottom: 5,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  reportButton: {
    backgroundColor: '#3498db',
  },
  holidayButton: {
    backgroundColor: '#9b59b6',
  },
  dayCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 2,
  },
  holidayCard: {
    backgroundColor: '#fdedec',
  },
  sundayCard: {
    backgroundColor: '#f5eef8',
  },
  dayHeader: {
    fontWeight: 'bold',
    marginBottom: 5,
    fontSize: 16,
  },
  absentList: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  absentHeader: {
    fontWeight: 'bold',
    color: '#e74c3c',
    marginBottom: 4,
  },
  absentStudent: {
    fontSize: 12,
    color: '#7f8c8d',
    marginBottom: 2,
  },
  noRecordsText: {
    color: '#95a5a6',
    fontStyle: 'italic',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: width * 0.85,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
    color: '#2c3e50',
  },
  modalText: {
    fontSize: 16,
    marginBottom: 15,
    textAlign: 'center',
  },
  modalLabel: {
    fontSize: 14,
    marginBottom: 5,
    color: '#2c3e50',
  },
  emailInput: {
    height: 45,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
  },
  modalButtonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: '#e74c3c',
  },
  sendButton: {
    backgroundColor: '#2ecc71',
  },
  shareButton: {
    backgroundColor: '#9b59b6',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  shareButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  input: {
    height: 45,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
  },
  multilineInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#7f8c8d',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#e74c3c',
    marginBottom: 20, 
    textAlign: 'center',
  },
});

export default TeacherAttendance;
// Affe.js - Professional School Payment Management System
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TextInput, 
  Button, 
  FlatList,
  TouchableOpacity,
  Modal,
  Alert,
  RefreshControl,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Affe = () => {
  // Main state
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [payments, setPayments] = useState([]);
  const [currentYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Form states
  const [classForm, setClassForm] = useState({
    name: '',
    tuition: '',
    books: '',
    uniform: '',
    admission: '',
    monthly: '',
    annual: ''
  });
  
  const [studentForm, setStudentForm] = useState({
    name: '',
    fatherName: '',
    rollNumber: '',
    className: '',
    contact: '',
    address: ''
  });
  
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    type: 'tuition',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    studentId: null
  });
  
  // UI states
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [currentReceipt, setCurrentReceipt] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Load data from storage
  const loadData = async () => {
    try {
      setLoading(true);
      const [classesData, studentsData, paymentsData] = await Promise.all([
        AsyncStorage.getItem('classes'),
        AsyncStorage.getItem('students'),
        AsyncStorage.getItem('payments')
      ]);
      
      setClasses(classesData ? JSON.parse(classesData) : []);
      setStudents(studentsData ? JSON.parse(studentsData) : []);
      setPayments(paymentsData ? JSON.parse(paymentsData) : []);
      
      // Initialize with sample data if empty
      if (!classesData || JSON.parse(classesData).length === 0) {
        const initialClasses = [
          { 
            id: generateId(), 
            name: 'Nursery', 
            feeStructure: { 
              tuition: 2000, 
              books: 500, 
              uniform: 800,
              admission: 1000,
              monthly: 500,
              annual: 2000
            } 
          },
          { 
            id: generateId(), 
            name: 'KG', 
            feeStructure: { 
              tuition: 2200, 
              books: 600, 
              uniform: 800,
              admission: 1000,
              monthly: 500,
              annual: 2000
            } 
          },
          { 
            id: generateId(), 
            name: '1st', 
            feeStructure: { 
              tuition: 2500, 
              books: 700, 
              uniform: 900,
              admission: 1000,
              monthly: 500,
              annual: 2000
            } 
          },
        ];
        setClasses(initialClasses);
        await AsyncStorage.setItem('classes', JSON.stringify(initialClasses));
      }
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  // Save data to storage
  const saveData = async (key, data) => {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving data:', error);
      Alert.alert('Error', 'Failed to save data');
    }
  };

  // Initialize data
  useEffect(() => {
    loadData();
  }, []);

  // Helper functions
  const generateId = () => Math.random().toString(36).substr(2, 9);
  const generateReceiptNumber = () => `RCPT-${currentYear}-${Math.floor(1000 + Math.random() * 9000)}`;
  
  const handleRefresh = () => {
    setRefreshing(true);
    loadData().finally(() => setRefreshing(false));
  };

  // Class Management
  const addClass = async () => {
    if (!classForm.name || !classForm.tuition) {
      Alert.alert('Error', 'Please enter class name and tuition fee');
      return;
    }
    
    const newClass = {
      id: generateId(),
      name: classForm.name.trim(),
      feeStructure: {
        tuition: parseFloat(classForm.tuition) || 0,
        books: parseFloat(classForm.books) || 0,
        uniform: parseFloat(classForm.uniform) || 0,
        admission: parseFloat(classForm.admission) || 0,
        monthly: parseFloat(classForm.monthly) || 0,
        annual: parseFloat(classForm.annual) || 0
      }
    };
    
    const updatedClasses = [...classes, newClass];
    setClasses(updatedClasses);
    await saveData('classes', updatedClasses);
    
    // Reset form
    setClassForm({
      name: '',
      tuition: '',
      books: '',
      uniform: '',
      admission: '',
      monthly: '',
      annual: ''
    });
    
    Alert.alert('Success', 'Class added successfully');
  };

  // Student Management
  const addStudent = async () => {
    if (!studentForm.name || !studentForm.className || !studentForm.rollNumber) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }
    
    // Check if roll number already exists in the same class
    const existingStudent = students.find(
      s => s.rollNumber === studentForm.rollNumber && s.className === studentForm.className
    );
    
    if (existingStudent) {
      Alert.alert('Error', 'A student with this roll number already exists in this class');
      return;
    }
    
    const newStudent = {
      id: generateId(),
      name: studentForm.name.trim(),
      fatherName: studentForm.fatherName.trim(),
      rollNumber: studentForm.rollNumber.trim(),
      className: studentForm.className,
      contact: studentForm.contact.trim(),
      address: studentForm.address.trim(),
      balance: 0,
      admissionDate: new Date().toISOString()
    };
    
    const updatedStudents = [...students, newStudent];
    setStudents(updatedStudents);
    await saveData('students', updatedStudents);
    
    // Reset form
    setStudentForm({
      name: '',
      fatherName: '',
      rollNumber: '',
      className: '',
      contact: '',
      address: ''
    });
    
    Alert.alert('Success', 'Student added successfully');
  };

  // Payment Processing
  const recordPayment = async () => {
    if (!paymentForm.studentId || !paymentForm.amount) {
      Alert.alert('Error', 'Please select student and enter amount');
      return;
    }
    
    const amount = parseFloat(paymentForm.amount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }
    
    const payment = {
      id: generateId(),
      studentId: paymentForm.studentId,
      amount: amount,
      type: paymentForm.type,
      month: paymentForm.month,
      year: paymentForm.year,
      date: new Date().toISOString(),
      receiptNumber: generateReceiptNumber()
    };
    
    // Update student balance
    const updatedStudents = students.map(student => {
      if (student.id === paymentForm.studentId) {
        return { ...student, balance: (student.balance || 0) + amount };
      }
      return student;
    });
    
    const updatedPayments = [...payments, payment];
    setPayments(updatedPayments);
    setStudents(updatedStudents);
    
    await Promise.all([
      saveData('payments', updatedPayments),
      saveData('students', updatedStudents)
    ]);
    
    // Reset form
    setPaymentForm({
      amount: '',
      type: 'tuition',
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
      studentId: null
    });
    
    setShowPaymentModal(false);
    
    // Show receipt
    const student = updatedStudents.find(s => s.id === paymentForm.studentId);
    if (student) {
      setCurrentReceipt({
        ...payment,
        studentName: student.name,
        fatherName: student.fatherName,
        className: student.className,
        rollNumber: student.rollNumber,
        contact: student.contact
      });
      setShowReceiptModal(true);
    }
  };

  // Calculate total fees for a class
  const calculateTotalFee = (className) => {
    const classInfo = classes.find(c => c.name === className);
    if (classInfo?.feeStructure) {
      return Object.values(classInfo.feeStructure).reduce((sum, fee) => sum + (fee || 0), 0);
    }
    return 0;
  };

  // Get filtered students based on search query
  const getFilteredStudents = () => {
    if (!searchQuery) return students;
    const query = searchQuery.toLowerCase();
    return students.filter(student => 
      student.name?.toLowerCase().includes(query) ||
      student.fatherName?.toLowerCase().includes(query) ||
      student.rollNumber?.toLowerCase().includes(query) ||
      student.className?.toLowerCase().includes(query)
    );
  };

  // Dashboard summary
  const getDashboardSummary = () => {
    const summary = {
      totalPayments: payments.length,
      totalAmount: payments.reduce((sum, p) => sum + (p.amount || 0), 0),
      byClass: classes.map(c => {
        const classStudents = students.filter(s => s.className === c.name);
        const classPayments = payments.filter(p => 
          classStudents.some(s => s.id === p.studentId)
        );
        return {
          className: c.name,
          totalPayments: classPayments.length,
          totalAmount: classPayments.reduce((sum, p) => sum + (p.amount || 0), 0),
          totalStudents: classStudents.length
        };
      })
    };
    return summary;
  };

  // Render Methods
  const renderDashboard = () => {
    const summary = getDashboardSummary();
    
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Dashboard - {currentYear}</Text>
        
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>School Overview</Text>
          <View style={styles.summaryRow}>
            <Text>Total Classes:</Text>
            <Text style={styles.summaryValue}>{classes.length}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text>Total Students:</Text>
            <Text style={styles.summaryValue}>{students.length}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text>Total Payments:</Text>
            <Text style={styles.summaryValue}>{summary.totalPayments}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text>Total Revenue:</Text>
            <Text style={styles.summaryValue}>Rs. {summary.totalAmount.toFixed(2)}</Text>
          </View>
        </View>
        
        <Text style={styles.subTitle}>Class-wise Summary</Text>
        <FlatList
          data={summary.byClass}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <View style={styles.classCard}>
              <Text style={styles.className}>{item.className}</Text>
              <View style={styles.classRow}>
                <Text>Students:</Text>
                <Text>{item.totalStudents}</Text>
              </View>
              <View style={styles.classRow}>
                <Text>Payments:</Text>
                <Text>{item.totalPayments}</Text>
              </View>
              <View style={styles.classRow}>
                <Text>Revenue:</Text>
                <Text>Rs. {item.totalAmount.toFixed(2)}</Text>
              </View>
            </View>
          )}
          numColumns={2}
          columnWrapperStyle={styles.classList}
        />
      </View>
    );
  };

  const renderClasses = () => {
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Class Management</Text>
        
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.form}
        >
          <TextInput
            style={styles.input}
            placeholder="Class Name"
            value={classForm.name}
            onChangeText={text => setClassForm({...classForm, name: text})}
          />
          
          <View style={styles.feeInputContainer}>
            <TextInput
              style={[styles.input, styles.feeInput]}
              placeholder="Tuition Fee"
              keyboardType="numeric"
              value={classForm.tuition}
              onChangeText={text => setClassForm({...classForm, tuition: text})}
            />
            <TextInput
              style={[styles.input, styles.feeInput]}
              placeholder="Books Fee"
              keyboardType="numeric"
              value={classForm.books}
              onChangeText={text => setClassForm({...classForm, books: text})}
            />
          </View>
          
          <View style={styles.feeInputContainer}>
            <TextInput
              style={[styles.input, styles.feeInput]}
              placeholder="Uniform Fee"
              keyboardType="numeric"
              value={classForm.uniform}
              onChangeText={text => setClassForm({...classForm, uniform: text})}
            />
            <TextInput
              style={[styles.input, styles.feeInput]}
              placeholder="Admission Fee"
              keyboardType="numeric"
              value={classForm.admission}
              onChangeText={text => setClassForm({...classForm, admission: text})}
            />
          </View>
          
          <View style={styles.feeInputContainer}>
            <TextInput
              style={[styles.input, styles.feeInput]}
              placeholder="Monthly Fee"
              keyboardType="numeric"
              value={classForm.monthly}
              onChangeText={text => setClassForm({...classForm, monthly: text})}
            />
            <TextInput
              style={[styles.input, styles.feeInput]}
              placeholder="Annual Fee"
              keyboardType="numeric"
              value={classForm.annual}
              onChangeText={text => setClassForm({...classForm, annual: text})}
            />
          </View>
          
          <Button 
            title="Add Class" 
            onPress={addClass} 
            color="#4CAF50"
          />
        </KeyboardAvoidingView>
        
        <Text style={styles.subTitle}>Class List ({classes.length})</Text>
        <FlatList
          data={classes}
          keyExtractor={item => item.id}
          renderItem={({ item }) => {
            const feeStructure = item.feeStructure || {};
            return (
              <View style={styles.classCard}>
                <Text style={styles.className}>{item.name}</Text>
                <View style={styles.feeDetails}>
                  <View style={styles.feeRow}>
                    <Text style={styles.feeLabel}>Tuition:</Text>
                    <Text>Rs. {feeStructure.tuition?.toFixed(2) || '0.00'}</Text>
                  </View>
                  <View style={styles.feeRow}>
                    <Text style={styles.feeLabel}>Books:</Text>
                    <Text>Rs. {feeStructure.books?.toFixed(2) || '0.00'}</Text>
                  </View>
                  <View style={styles.feeRow}>
                    <Text style={styles.feeLabel}>Uniform:</Text>
                    <Text>Rs. {feeStructure.uniform?.toFixed(2) || '0.00'}</Text>
                  </View>
                  <View style={styles.feeRow}>
                    <Text style={styles.feeLabel}>Total:</Text>
                    <Text style={styles.feeTotal}>
                      Rs. {calculateTotalFee(item.name).toFixed(2)}
                    </Text>
                  </View>
                </View>
                <Text style={styles.studentCount}>
                  Students: {students.filter(s => s.className === item.name).length}
                </Text>
              </View>
            );
          }}
          numColumns={2}
          columnWrapperStyle={styles.classList}
        />
      </View>
    );
  };

  const renderStudents = () => {
    const filteredStudents = getFilteredStudents();
    
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Student Management</Text>
        
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search students..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <Icon name="search" size={20} style={styles.searchIcon} />
        </View>
        
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.form}
        >
          <TextInput
            style={styles.input}
            placeholder="Student Name *"
            value={studentForm.name}
            onChangeText={text => setStudentForm({...studentForm, name: text})}
          />
          <TextInput
            style={styles.input}
            placeholder="Father's Name"
            value={studentForm.fatherName}
            onChangeText={text => setStudentForm({...studentForm, fatherName: text})}
          />
          <TextInput
            style={styles.input}
            placeholder="Roll Number *"
            value={studentForm.rollNumber}
            onChangeText={text => setStudentForm({...studentForm, rollNumber: text})}
          />
          <TextInput
            style={styles.input}
            placeholder="Contact Number"
            keyboardType="phone-pad"
            value={studentForm.contact}
            onChangeText={text => setStudentForm({...studentForm, contact: text})}
          />
          
          <View style={styles.picker}>
            <Text style={styles.pickerLabel}>Select Class *:</Text>
            <View style={styles.classOptions}>
              {classes.map((cls) => (
                <TouchableOpacity
                  key={cls.id}
                  style={[
                    styles.classOption,
                    studentForm.className === cls.name && styles.selectedClassOption
                  ]}
                  onPress={() => setStudentForm({...studentForm, className: cls.name})}
                >
                  <Text style={studentForm.className === cls.name && styles.selectedClassText}>
                    {cls.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          <TextInput
            style={styles.input}
            placeholder="Address"
            multiline
            numberOfLines={3}
            value={studentForm.address}
            onChangeText={text => setStudentForm({...studentForm, address: text})}
          />
          
          <Button 
            title="Add Student" 
            onPress={addStudent} 
            color="#4CAF50"
          />
        </KeyboardAvoidingView>
        
        <Text style={styles.subTitle}>
          Student List ({filteredStudents.length})
        </Text>
        <FlatList
          data={filteredStudents}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <View style={styles.studentCard}>
              <View style={styles.studentHeader}>
                <Text style={styles.studentName}>{item.name}</Text>
                <Text style={styles.studentClass}>{item.className} - {item.rollNumber}</Text>
              </View>
              <Text style={styles.studentFather}>Father: {item.fatherName}</Text>
              <Text style={styles.studentContact}>Contact: {item.contact || 'N/A'}</Text>
              
              <View style={styles.studentFooter}>
                <Text style={[
                  styles.studentBalance,
                  item.balance > 0 ? styles.positiveBalance : styles.zeroBalance
                ]}>
                  Balance: Rs. {(item.balance || 0).toFixed(2)}
                </Text>
                <TouchableOpacity
                  style={styles.paymentButton}
                  onPress={() => {
                    setPaymentForm({
                      ...paymentForm,
                      studentId: item.id
                    });
                    setShowPaymentModal(true);
                  }}
                >
                  <Text style={styles.paymentButtonText}>Add Payment</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      </View>
    );
  };

  const renderPayments = () => {
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Payment Records</Text>
        
        <View style={styles.paymentSummary}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Total Payments</Text>
            <Text style={styles.summaryValue}>{payments.length}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Total Revenue</Text>
            <Text style={styles.summaryValue}>
              Rs. {payments.reduce((sum, p) => sum + (p.amount || 0), 0).toFixed(2)}
            </Text>
          </View>
        </View>
        
        <FlatList
          data={payments.slice().reverse()}
          keyExtractor={item => item.id}
          renderItem={({ item }) => {
            const student = students.find(s => s.id === item.studentId);
            return (
              <View style={styles.paymentCard}>
                <View style={styles.paymentHeader}>
                  <Text style={styles.paymentReceipt}>{item.receiptNumber}</Text>
                  <Text style={styles.paymentDate}>
                    {new Date(item.date).toLocaleDateString()}
                  </Text>
                </View>
                
                {student && (
                  <View style={styles.paymentStudent}>
                    <Text style={styles.paymentName}>
                      {student.name} ({student.className})
                    </Text>
                    <Text style={styles.paymentRoll}>Roll No: {student.rollNumber}</Text>
                  </View>
                )}
                
                <View style={styles.paymentDetails}>
                  <Text style={styles.paymentType}>
                    {item.type?.charAt(0).toUpperCase() + item.type?.slice(1)}
                  </Text>
                  <Text style={styles.paymentAmount}>
                    Rs. {item.amount?.toFixed(2) || '0.00'}
                  </Text>
                </View>
                
                <TouchableOpacity
                  style={styles.receiptButton}
                  onPress={() => {
                    if (student) {
                      setCurrentReceipt({
                        ...item,
                        studentName: student.name,
                        fatherName: student.fatherName,
                        className: student.className,
                        rollNumber: student.rollNumber,
                        contact: student.contact
                      });
                      setShowReceiptModal(true);
                    }
                  }}
                >
                  <Text style={styles.receiptButtonText}>View Receipt</Text>
                </TouchableOpacity>
              </View>
            );
          }}
        />
      </View>
    );
  };

  const renderReceiptModal = () => {
    if (!currentReceipt) return null;
    
    return (
      <Modal 
        visible={showReceiptModal} 
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowReceiptModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.receiptContainer}>
            <View style={styles.receiptHeader}>
              <Text style={styles.receiptTitle}>SCHOOL PAYMENT RECEIPT</Text>
            </View>
            
            <View style={styles.receiptRow}>
              <Text style={styles.receiptLabel}>Receipt No:</Text>
              <Text style={styles.receiptValue}>{currentReceipt.receiptNumber}</Text>
            </View>
            
            <View style={styles.receiptRow}>
              <Text style={styles.receiptLabel}>Date:</Text>
              <Text style={styles.receiptValue}>
                {new Date(currentReceipt.date).toLocaleDateString()}
              </Text>
            </View>
            
            <View style={styles.receiptDivider} />
            
            <View style={styles.receiptRow}>
              <Text style={styles.receiptLabel}>Student Name:</Text>
              <Text style={styles.receiptValue}>{currentReceipt.studentName}</Text>
            </View>
            
            <View style={styles.receiptRow}>
              <Text style={styles.receiptLabel}>Father's Name:</Text>
              <Text style={styles.receiptValue}>{currentReceipt.fatherName}</Text>
            </View>
            
            <View style={styles.receiptRow}>
              <Text style={styles.receiptLabel}>Class:</Text>
              <Text style={styles.receiptValue}>
                {currentReceipt.className} (Roll No: {currentReceipt.rollNumber})
              </Text>
            </View>
            
            <View style={styles.receiptRow}>
              <Text style={styles.receiptLabel}>Contact:</Text>
              <Text style={styles.receiptValue}>{currentReceipt.contact || 'N/A'}</Text>
            </View>
            
            <View style={styles.receiptDivider} />
            
            <View style={styles.receiptRow}>
              <Text style={styles.receiptLabel}>Payment Type:</Text>
              <Text style={styles.receiptValue}>
                {currentReceipt.type?.charAt(0).toUpperCase() + currentReceipt.type?.slice(1)}
              </Text>
            </View>
            
            <View style={styles.receiptRow}>
              <Text style={styles.receiptLabel}>Month/Year:</Text>
              <Text style={styles.receiptValue}>
                {currentReceipt.month}/{currentReceipt.year}
              </Text>
            </View>
            
            <View style={styles.receiptRow}>
              <Text style={styles.receiptLabel}>Amount:</Text>
              <Text style={[styles.receiptValue, styles.receiptAmount]}>
                Rs. {currentReceipt.amount?.toFixed(2) || '0.00'}
              </Text>
            </View>
            
            <View style={styles.receiptDivider} />
            
            <Text style={styles.receiptFooter}>Thank you for your payment!</Text>
            
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowReceiptModal(false)}
              >
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.closeButton, {backgroundColor: '#4CAF50'}]}
                onPress={() => {
                  // Implement print functionality here
                  Alert.alert('Print', 'Receipt printing functionality would be implemented here');
                }}
              >
                <Text style={styles.closeButtonText}>Print</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  const renderPaymentModal = () => {
    const student = students.find(s => s.id === paymentForm.studentId);
    
    return (
      <Modal 
        visible={showPaymentModal} 
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowPaymentModal(false)}
      >
        <View style={styles.modalContainer}>
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.paymentForm}
          >
            <Text style={styles.modalTitle}>Record Payment</Text>
            
            {student && (
              <View style={styles.studentInfo}>
                <Text style={styles.studentInfoName}>{student.name}</Text>
                <Text>{student.className} - Roll No: {student.rollNumber}</Text>
                <Text>Father: {student.fatherName}</Text>
                <Text>Current Balance: Rs. {(student.balance || 0).toFixed(2)}</Text>
              </View>
            )}
            
            <TextInput
              style={styles.input}
              placeholder="Amount *"
              keyboardType="numeric"
              value={paymentForm.amount}
              onChangeText={text => setPaymentForm({...paymentForm, amount: text})}
            />
            
            <View style={styles.picker}>
              <Text style={styles.pickerLabel}>Payment Type:</Text>
              <View style={styles.paymentOptions}>
                {['tuition', 'books', 'uniform', 'monthly', 'annual', 'admission', 'other'].map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.paymentOption,
                      paymentForm.type === type && styles.selectedPaymentOption
                    ]}
                    onPress={() => setPaymentForm({...paymentForm, type})}
                  >
                    <Text style={paymentForm.type === type && styles.selectedPaymentText}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            <View style={styles.dateInputContainer}>
              <View style={styles.dateInput}>
                <Text style={styles.dateLabel}>Month:</Text>
                <TextInput
                  style={[styles.input, styles.numberInput]}
                  keyboardType="numeric"
                  value={paymentForm.month.toString()}
                  onChangeText={text => {
                    const month = Math.min(12, Math.max(1, parseInt(text) || 1));
                    setPaymentForm({...paymentForm, month});
                  }}
                />
              </View>
              
              <View style={styles.dateInput}>
                <Text style={styles.dateLabel}>Year:</Text>
                <TextInput
                  style={[styles.input, styles.numberInput]}
                  keyboardType="numeric"
                  value={paymentForm.year.toString()}
                  onChangeText={text => setPaymentForm({...paymentForm, year: parseInt(text) || currentYear})}
                />
              </View>
            </View>
            
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={[styles.modalButton, styles.submitButton]}
                onPress={recordPayment}
              >
                <Text style={styles.modalButtonText}>Record Payment</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowPaymentModal(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading School Data...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>School Payment System</Text>
        <Text style={styles.headerSubtitle}>Manage all school payments in one place</Text>
      </View>
      
      {/* Navigation Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'dashboard' && styles.activeTab]}
          onPress={() => setActiveTab('dashboard')}
        >
          <Icon 
            name="dashboard" 
            size={20} 
            color={activeTab === 'dashboard' ? '#4CAF50' : '#666'} 
          />
          <Text style={[
            styles.tabText,
            activeTab === 'dashboard' && styles.activeTabText
          ]}>
            Dashboard
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'classes' && styles.activeTab]}
          onPress={() => setActiveTab('classes')}
        >
          <Icon 
            name="class" 
            size={20} 
            color={activeTab === 'classes' ? '#4CAF50' : '#666'} 
          />
          <Text style={[
            styles.tabText,
            activeTab === 'classes' && styles.activeTabText
          ]}>
            Classes
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'students' && styles.activeTab]}
          onPress={() => setActiveTab('students')}
        >
          <Icon 
            name="people" 
            size={20} 
            color={activeTab === 'students' ? '#4CAF50' : '#666'} 
          />
          <Text style={[
            styles.tabText,
            activeTab === 'students' && styles.activeTabText
          ]}>
            Students
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'payments' && styles.activeTab]}
          onPress={() => setActiveTab('payments')}
        >
          <Icon 
            name="payment" 
            size={20} 
            color={activeTab === 'payments' ? '#4CAF50' : '#666'} 
          />
          <Text style={[
            styles.tabText,
            activeTab === 'payments' && styles.activeTabText
          ]}>
            Payments
          </Text>
        </TouchableOpacity>
      </View>
      
      {/* Main Content */}
      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#4CAF50']}
          />
        }
      >
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'classes' && renderClasses()}
        {activeTab === 'students' && renderStudents()}
        {activeTab === 'payments' && renderPayments()}
      </ScrollView>
      
      {/* Modals */}
      {renderPaymentModal()}
      {renderReceiptModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 20,
    color: '#666',
    fontSize: 16,
  },
  header: {
    backgroundColor: '#4CAF50',
    padding: 15,
    paddingTop: 40,
    paddingBottom: 20,
    alignItems: 'center',
  },
  headerTitle: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    marginTop: 5,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    elevation: 3,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#4CAF50',
  },
  tabText: {
    fontSize: 12,
    marginTop: 5,
    color: '#666',
  },
  activeTabText: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 10,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
    paddingHorizontal: 5,
  },
  subTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 10,
    color: '#555',
    paddingHorizontal: 5,
  },
  form: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    elevation: 2,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
  },
  searchContainer: {
    position: 'relative',
    marginBottom: 15,
  },
  searchInput: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 12,
    paddingLeft: 40,
    fontSize: 16,
    elevation: 2,
  },
  searchIcon: {
    position: 'absolute',
    left: 10,
    top: 12,
    color: '#666',
  },
  feeInputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  feeInput: {
    width: '48%',
  },
  picker: {
    marginBottom: 15,
  },
  pickerLabel: {
    marginBottom: 8,
    fontWeight: '500',
    color: '#555',
  },
  classOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 5,
  },
  classOption: {
    padding: 10,
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: '#eee',
    borderRadius: 6,
  },
  selectedClassOption: {
    backgroundColor: '#4CAF50',
  },
  selectedClassText: {
    color: 'white',
  },
  paymentOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 5,
  },
  paymentOption: {
    padding: 10,
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: '#eee',
    borderRadius: 6,
  },
  selectedPaymentOption: {
    backgroundColor: '#4CAF50',
  },
  selectedPaymentText: {
    color: 'white',
  },
  dateInputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  dateInput: {
    width: '48%',
  },
  dateLabel: {
    marginBottom: 5,
    color: '#555',
  },
  numberInput: {
    textAlign: 'center',
    padding: 10,
  },
  summaryCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    elevation: 2,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#4CAF50',
    textAlign: 'center',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  summaryValue: {
    fontWeight: 'bold',
  },
  classList: {
    justifyContent: 'space-between',
  },
  classCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    width: '48%',
    elevation: 1,
  },
  className: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 10,
    color: '#333',
    textAlign: 'center',
  },
  classRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  feeDetails: {
    marginVertical: 10,
  },
  feeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  feeLabel: {
    fontWeight: '500',
    color: '#555',
  },
  feeTotal: {
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  studentCount: {
    marginTop: 10,
    textAlign: 'center',
    color: '#666',
    fontSize: 12,
  },
  studentCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 1,
  },
  studentHeader: {
    marginBottom: 10,
  },
  studentName: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#333',
  },
  studentClass: {
    color: '#666',
    fontSize: 14,
  },
  studentFather: {
    color: '#555',
    marginBottom: 5,
  },
  studentContact: {
    color: '#555',
    marginBottom: 10,
  },
  studentFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  studentBalance: {
    fontWeight: 'bold',
  },
  positiveBalance: {
    color: '#E91E63',
  },
  zeroBalance: {
    color: '#4CAF50',
  },
  paymentButton: {
    backgroundColor: '#4CAF50',
    padding: 8,
    borderRadius: 4,
    paddingHorizontal: 12,
  },
  paymentButtonText: {
    color: 'white',
    fontSize: 14,
  },
  paymentSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  summaryItem: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    width: '48%',
    alignItems: 'center',
    elevation: 1,
  },
  summaryLabel: {
    color: '#666',
    marginBottom: 5,
  },
  summaryValue: {
    fontWeight: 'bold',
    fontSize: 18,
    color: '#4CAF50',
  },
  paymentCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 1,
  },
  paymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  paymentReceipt: {
    fontWeight: 'bold',
    color: '#333',
  },
  paymentDate: {
    color: '#666',
  },
  paymentStudent: {
    marginBottom: 10,
  },
  paymentName: {
    fontWeight: '500',
    color: '#333',
  },
  paymentRoll: {
    color: '#666',
    fontSize: 14,
  },
  paymentDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  paymentType: {
    color: '#555',
  },
  paymentAmount: {
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  receiptButton: {
    backgroundColor: '#2196F3',
    padding: 8,
    borderRadius: 4,
    alignItems: 'center',
  },
  receiptButtonText: {
    color: 'white',
    fontSize: 14,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 20,
  },
  paymentForm: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  studentInfo: {
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  studentInfoName: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 5,
    color: '#333',
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  modalButton: {
    padding: 12,
    borderRadius: 6,
    width: '48%',
    alignItems: 'center',
  },
  submitButton: {
    backgroundColor: '#4CAF50',
  },
  cancelButton: {
    backgroundColor: '#f44336',
  },
  modalButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  closeButton: {
    backgroundColor: '#2196F3',
    padding: 12,
    borderRadius: 6,
    marginTop: 15,
    alignItems: 'center',
    width: '48%',
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  receiptContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
  },
  receiptHeader: {
    marginBottom: 20,
    alignItems: 'center',
  },
  receiptTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  receiptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  receiptLabel: {
    fontWeight: '500',
    color: '#555',
  },
  receiptValue: {
    fontWeight: 'bold',
    color: '#333',
  },
  receiptAmount: {
    color: '#4CAF50',
    fontSize: 16,
  },
  receiptDivider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 15,
  },
  receiptFooter: {
    textAlign: 'center',
    marginTop: 10,
    fontStyle: 'italic',
    color: '#666',
  },
});

export default Affe;
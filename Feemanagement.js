import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  FlatList,
  Modal,
  Pressable,
  RefreshControl
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import Icon from 'react-native-vector-icons/MaterialIcons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';

const FeeManagement = () => {
  // School ID - should be dynamic in real app
  const schoolId = 'abc-school';

  // State for different sections
  const [bankDetails, setBankDetails] = useState({
    jazzcash: '',
    easypaisa: '',
    bankName: '',
    accountTitle: '',
    iban: ''
  });

  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [feeRecords, setFeeRecords] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Form states
  const [newFee, setNewFee] = useState({
    amount: '',
    dueDate: new Date(),
    status: 'pending',
    paymentMethod: '',
    receiptNo: '',
    description: ''
  });

  const [notificationForm, setNotificationForm] = useState({
    title: '',
    message: '',
    studentId: 'all'
  });

  // UI states
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState({
    bank: true,
    students: true,
    fees: true,
    notifications: true
  });
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isEdited, setIsEdited] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [notificationModalVisible, setNotificationModalVisible] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [activeTab, setActiveTab] = useState('bankDetails');

  // Validation patterns
  const VALIDATION = {
    jazzcash: { pattern: /^03\d{9}$/, message: 'Invalid JazzCash number (03XXXXXXXXX)' },
    easypaisa: { pattern: /^03\d{9}$/, message: 'Invalid EasyPaisa number (03XXXXXXXXX)' },
    bankName: { required: true, message: 'Bank name is required' },
    accountTitle: { required: true, message: 'Account title is required' },
    iban: { pattern: /^PK\d{2}[A-Z]{4}\d{16}$/, message: 'Invalid IBAN format (PK36ABCD1234567890123456)' },
    amount: { pattern: /^\d+$/, message: 'Please enter a valid amount' },
    receiptNo: { pattern: /^[A-Z0-9]+$/, message: 'Invalid receipt number' },
    title: { required: true, message: 'Notification title is required' },
    message: { required: true, message: 'Notification message is required' }
  };

  // Payment methods
  const PAYMENT_METHODS = [
    { label: 'JazzCash', value: 'jazzcash' },
    { label: 'EasyPaisa', value: 'easypaisa' },
    { label: 'Bank Transfer', value: 'bank' },
    { label: 'Cash', value: 'cash' },
    { label: 'Other', value: 'other' }
  ];

  // Fetch data from Firestore
  const fetchData = useCallback(async () => {
    try {
      // Fetch bank details
      const bankDoc = await firestore().collection('bankDetails').doc(schoolId).get();
      if (bankDoc.exists) setBankDetails(bankDoc.data());

      // Fetch students
      const studentsSnapshot = await firestore()
        .collection('students')
        .where('schoolId', '==', schoolId)
        .get();
      const studentsData = studentsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setStudents(studentsData);
      setFilteredStudents(studentsData);

      // Fetch notifications
      const notificationsSnapshot = await firestore()
        .collection('notifications')
        .where('schoolId', '==', schoolId)
        .orderBy('createdAt', 'desc')
        .limit(10)
        .get();
      setNotifications(notificationsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt.toDate()
      })));

    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load data. Please try again later.');
    } finally {
      setLoading({
        bank: false,
        students: false,
        fees: false,
        notifications: false
      });
      setRefreshing(false);
    }
  }, [schoolId]);

  // Fetch fee records for selected student
  const fetchFeeRecords = useCallback(async (studentId) => {
    try {
      const snapshot = await firestore()
        .collection('feeRecords')
        .where('studentId', '==', studentId)
        .orderBy('dueDate', 'desc')
        .get();

      const feeRecordsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        dueDate: doc.data().dueDate.toDate(),
        createdAt: doc.data().createdAt.toDate()
      }));
      setFeeRecords(feeRecordsData);
    } catch (error) {
      console.error('Error loading fee records:', error);
      Alert.alert('Error', 'Failed to load fee records. Please try again later.');
    }
  }, []);

  // Handle refresh
  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
    if (selectedStudent) {
      fetchFeeRecords(selectedStudent.id);
    }
  }, [fetchData, fetchFeeRecords, selectedStudent]);

  // Handle search
  const handleSearch = useCallback((text) => {
    setSearchQuery(text);
    if (text.trim() === '') {
      setFilteredStudents(students);
    } else {
      const filtered = students.filter(student =>
        `${student.firstName} ${student.lastName}`.toLowerCase().includes(text.toLowerCase()) ||
        student.rollNumber.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredStudents(filtered);
    }
  }, [students]);

  // Handle form changes
  const handleBankDetailChange = useCallback((field, value) => {
    setBankDetails(prev => ({ ...prev, [field]: value }));
    setIsEdited(true);
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  }, [errors]);

  const handleFeeChange = useCallback((field, value) => {
    setNewFee(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  }, [errors]);

  const handleNotificationChange = useCallback((field, value) => {
    setNotificationForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  }, [errors]);

  const handleDateChange = useCallback((event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      handleFeeChange('dueDate', selectedDate);
    }
  }, [handleFeeChange]);

  // Validation functions
  const validate = useCallback((data, fields) => {
    const newErrors = {};
    
    fields.forEach(field => {
      const rules = VALIDATION[field];
      const value = data[field]?.toString().trim() || '';
      
      if (rules.required && !value) {
        newErrors[field] = rules.message;
      } else if (rules.pattern && value && !rules.pattern.test(value)) {
        newErrors[field] = rules.message;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, []);

  // Database operations
  const saveBankDetails = useCallback(async () => {
    if (!validate(bankDetails, ['jazzcash', 'easypaisa', 'bankName', 'accountTitle', 'iban'])) {
      Alert.alert('Validation Error', 'Please correct the errors before saving.');
      return;
    }

    setSaving(true);
    try {
      await firestore()
        .collection('bankDetails')
        .doc(schoolId)
        .set(bankDetails, { merge: true });

      Alert.alert('Success', 'Bank details saved successfully!');
      setIsEdited(false);
    } catch (error) {
      console.error('Error saving bank details:', error);
      Alert.alert('Error', 'Failed to save bank details. Please try again.');
    } finally {
      setSaving(false);
    }
  }, [bankDetails, validate]);

  const addFeeRecord = useCallback(async () => {
    if (!validate(newFee, ['amount'])) {
      Alert.alert('Validation Error', 'Please correct the errors before saving.');
      return;
    }

    setSaving(true);
    try {
      const feeData = {
        ...newFee,
        studentId: selectedStudent.id,
        studentName: `${selectedStudent.firstName} ${selectedStudent.lastName}`,
        studentClass: selectedStudent.class,
        createdAt: firestore.FieldValue.serverTimestamp(),
        amount: parseInt(newFee.amount),
        dueDate: firestore.Timestamp.fromDate(newFee.dueDate)
      };

      await firestore()
        .collection('feeRecords')
        .add(feeData);

      Alert.alert('Success', 'Fee record added successfully!');
      setModalVisible(false);
      setNewFee({
        amount: '',
        dueDate: new Date(),
        status: 'pending',
        paymentMethod: '',
        receiptNo: '',
        description: ''
      });
      fetchFeeRecords(selectedStudent.id);
    } catch (error) {
      console.error('Error adding fee record:', error);
      Alert.alert('Error', 'Failed to add fee record. Please try again.');
    } finally {
      setSaving(false);
    }
  }, [newFee, selectedStudent, validate, fetchFeeRecords]);

  const sendNotification = useCallback(async () => {
    if (!validate(notificationForm, ['title', 'message'])) {
      Alert.alert('Validation Error', 'Please correct the errors before sending.');
      return;
    }

    setSaving(true);
    try {
      const notificationData = {
        ...notificationForm,
        schoolId,
        createdAt: firestore.FieldValue.serverTimestamp(),
        read: false,
        studentName: notificationForm.studentId === 'all' 
          ? 'All Students' 
          : `${selectedStudent.firstName} ${selectedStudent.lastName}`
      };

      await firestore()
        .collection('notifications')
        .add(notificationData);

      Alert.alert('Success', 'Notification sent successfully!');
      setNotificationModalVisible(false);
      setNotificationForm({
        title: '',
        message: '',
        studentId: 'all'
      });
      fetchData(); // Refresh notifications
    } catch (error) {
      console.error('Error sending notification:', error);
      Alert.alert('Error', 'Failed to send notification. Please try again.');
    } finally {
      setSaving(false);
    }
  }, [notificationForm, selectedStudent, validate, fetchData]);

  // Initial data load
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Load fee records when student is selected
  useEffect(() => {
    if (selectedStudent) {
      fetchFeeRecords(selectedStudent.id);
    }
  }, [selectedStudent, fetchFeeRecords]);

  // Render components
  const renderInputField = (label, field, placeholder, options = {}) => (
    <View style={styles.inputContainer}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        placeholder={placeholder}
        style={[styles.input, errors[field] && styles.inputError]}
        value={bankDetails[field]}
        onChangeText={v => handleBankDetailChange(field, v)}
        {...options}
      />
      {errors[field] && <Text style={styles.errorText}>{errors[field]}</Text>}
    </View>
  );

  const renderFeeInputField = (label, field, placeholder, options = {}) => (
    <View style={styles.inputContainer}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        placeholder={placeholder}
        style={[styles.input, errors[field] && styles.inputError]}
        value={newFee[field]}
        onChangeText={v => handleFeeChange(field, v)}
        {...options}
      />
      {errors[field] && <Text style={styles.errorText}>{errors[field]}</Text>}
    </View>
  );

  const renderNotificationInputField = (label, field, placeholder, options = {}) => (
    <View style={styles.inputContainer}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        placeholder={placeholder}
        style={[styles.input, errors[field] && styles.inputError]}
        value={notificationForm[field]}
        onChangeText={v => handleNotificationChange(field, v)}
        {...options}
      />
      {errors[field] && <Text style={styles.errorText}>{errors[field]}</Text>}
    </View>
  );

  const renderBankDetailsTab = () => (
    <>
      <View style={styles.header}>
        <Icon name="account-balance" size={28} color="#4A90E2" />
        <Text style={styles.title}>Bank Account Details</Text>
      </View>

      <Text style={styles.sectionTitle}>Mobile Payment Accounts</Text>
      {renderInputField('JazzCash Number', 'jazzcash', '03XXXXXXXXX', { 
        keyboardType: 'phone-pad', 
        maxLength: 11 
      })}
      {renderInputField('EasyPaisa Number', 'easypaisa', '03XXXXXXXXX', { 
        keyboardType: 'phone-pad', 
        maxLength: 11 
      })}

      <Text style={styles.sectionTitle}>Bank Account Information</Text>
      {renderInputField('Bank Name', 'bankName', 'e.g. HBL, UBL, etc.')}
      {renderInputField('Account Holder Name', 'accountTitle', 'Name as in bank account')}
      {renderInputField('IBAN Number', 'iban', 'PK36ABCD1234567890123456', { 
        autoCapitalize: 'characters' 
      })}

      <TouchableOpacity
        style={[styles.saveButton, (!isEdited || saving) && styles.disabledButton]}
        onPress={saveBankDetails}
        disabled={!isEdited || saving}
        activeOpacity={0.7}
      >
        {saving ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <View style={styles.buttonContent}>
            <Icon name="save" size={18} color="#fff" />
            <Text style={styles.saveButtonText}>Save Details</Text>
          </View>
        )}
      </TouchableOpacity>
    </>
  );

  const renderStudentFeeTab = () => (
    <>
      <View style={styles.header}>
        <Icon name="school" size={28} color="#4A90E2" />
        <Text style={styles.title}>Student Fee Management</Text>
      </View>

      <Text style={styles.sectionTitle}>Select Student</Text>
      <View style={styles.searchContainer}>
        <Icon name="search" size={20} color="#64748b" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name or roll number..."
          value={searchQuery}
          onChangeText={handleSearch}
        />
      </View>

      {filteredStudents.length > 0 ? (
        <FlatList
          data={filteredStudents}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.studentItem,
                selectedStudent?.id === item.id && styles.selectedStudentItem
              ]}
              onPress={() => setSelectedStudent(item)}
            >
              <View style={styles.studentInfo}>
                <Text style={styles.studentName}>{`${item.firstName} ${item.lastName}`}</Text>
                <Text style={styles.studentClass}>{item.class} • Roll #: {item.rollNumber}</Text>
              </View>
              <Icon 
                name={selectedStudent?.id === item.id ? "radio-button-checked" : "radio-button-unchecked"} 
                size={20} 
                color="#4A90E2" 
              />
            </TouchableOpacity>
          )}
          style={styles.studentList}
        />
      ) : (
        <Text style={styles.noRecordsText}>No students found</Text>
      )}

      {selectedStudent && (
        <>
          <View style={styles.studentDetailsContainer}>
            <View>
              <Text style={styles.studentName}>{`${selectedStudent.firstName} ${selectedStudent.lastName}`}</Text>
              <Text style={styles.studentInfo}>{`Class: ${selectedStudent.class}`}</Text>
              <Text style={styles.studentInfo}>{`Roll #: ${selectedStudent.rollNumber}`}</Text>
            </View>
            <View style={styles.studentContact}>
              <Text style={styles.studentInfo}>{`Parent: ${selectedStudent.parentName}`}</Text>
              <Text style={styles.studentInfo}>{`Phone: ${selectedStudent.parentPhone}`}</Text>
            </View>
          </View>

          <View style={styles.feeActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => setModalVisible(true)}
            >
              <Icon name="add" size={18} color="#fff" />
              <Text style={styles.actionButtonText}>Add Fee</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.notifyButton]}
              onPress={() => {
                setNotificationForm({
                  title: 'Fee Reminder',
                  message: `Dear parent, please submit the pending fee for ${selectedStudent.firstName}`,
                  studentId: selectedStudent.id
                });
                setNotificationModalVisible(true);
              }}
            >
              <Icon name="notifications" size={18} color="#fff" />
              <Text style={styles.actionButtonText}>Notify</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.sectionTitle}>Fee History</Text>
          {feeRecords.length > 0 ? (
            <FlatList
              data={feeRecords}
              keyExtractor={item => item.id}
              renderItem={({ item }) => (
                <View style={styles.feeItem}>
                  <View style={styles.feeItemHeader}>
                    <Text style={styles.feeAmount}>Rs. {item.amount}</Text>
                    <Text style={[
                      styles.feeStatus,
                      item.status === 'paid' ? styles.paidStatus : styles.pendingStatus
                    ]}>
                      {item.status.toUpperCase()}
                    </Text>
                  </View>
                  <Text style={styles.feeDate}>Due: {item.dueDate.toLocaleDateString()}</Text>
                  {item.paymentMethod && (
                    <Text style={styles.feeMethod}>Method: {item.paymentMethod}</Text>
                  )}
                  {item.receiptNo && (
                    <Text style={styles.feeReceipt}>Receipt: {item.receiptNo}</Text>
                  )}
                  {item.description && (
                    <Text style={styles.feeDescription}>Note: {item.description}</Text>
                  )}
                </View>
              )}
            />
          ) : (
            <Text style={styles.noRecordsText}>No fee records found</Text>
          )}
        </>
      )}
    </>
  );

  const renderNotificationTab = () => (
    <>
      <View style={styles.header}>
        <Icon name="notifications" size={28} color="#4A90E2" />
        <Text style={styles.title}>Notifications</Text>
      </View>

      <TouchableOpacity
        style={[styles.actionButton, styles.fullWidthButton]}
        onPress={() => {
          setNotificationForm({
            title: '',
            message: '',
            studentId: 'all'
          });
          setNotificationModalVisible(true);
        }}
      >
        <Icon name="add" size={18} color="#fff" />
        <Text style={styles.actionButtonText}>Create New Notification</Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Recent Notifications</Text>
      {notifications.length > 0 ? (
        <FlatList
          data={notifications}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <View style={styles.notificationItem}>
              <Text style={styles.notificationTitle}>{item.title}</Text>
              <Text style={styles.notificationMessage}>{item.message}</Text>
              <View style={styles.notificationFooter}>
                <Text style={styles.notificationRecipient}>
                  {item.studentId === 'all' ? 'All Parents' : item.studentName}
                </Text>
                <Text style={styles.notificationDate}>
                  {item.createdAt.toLocaleDateString()}
                </Text>
              </View>
            </View>
          )}
        />
      ) : (
        <Text style={styles.noRecordsText}>No notifications found</Text>
      )}
    </>
  );

  if (loading.bank && loading.students && loading.notifications) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4A90E2" />
        <Text style={styles.loadingText}>Loading data...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.flex}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'bankDetails' && styles.activeTab]}
          onPress={() => setActiveTab('bankDetails')}
        >
          <Icon name="account-balance" size={20} color="#4A90E2" />
          <Text style={styles.tabText}>Bank</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'studentFees' && styles.activeTab]}
          onPress={() => setActiveTab('studentFees')}
        >
          <Icon name="school" size={20} color="#4A90E2" />
          <Text style={styles.tabText}>Fees</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'notifications' && styles.activeTab]}
          onPress={() => setActiveTab('notifications')}
        >
          <Icon name="notifications" size={20} color="#4A90E2" />
          <Text style={styles.tabText}>Alerts</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        contentContainerStyle={styles.container} 
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#4A90E2']}
            tintColor="#4A90E2"
          />
        }
      >
        {activeTab === 'bankDetails' && renderBankDetailsTab()}
        {activeTab === 'studentFees' && renderStudentFeeTab()}
        {activeTab === 'notifications' && renderNotificationTab()}
      </ScrollView>

      {/* Add Fee Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Add Fee Record</Text>
            {selectedStudent && (
              <Text style={styles.modalSubtitle}>
                For {selectedStudent.firstName} {selectedStudent.lastName} ({selectedStudent.class})
              </Text>
            )}

            {renderFeeInputField('Amount (Rs.)', 'amount', 'e.g. 2500', { 
              keyboardType: 'numeric' 
            })}

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Due Date</Text>
              <TouchableOpacity
                style={styles.dateInput}
                onPress={() => setShowDatePicker(true)}
              >
                <Text>{newFee.dueDate.toLocaleDateString()}</Text>
                <Icon name="calendar-today" size={18} color="#4A90E2" />
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={newFee.dueDate}
                  mode="date"
                  display="default"
                  onChange={handleDateChange}
                />
              )}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Payment Method</Text>
              <Picker
                selectedValue={newFee.paymentMethod}
                onValueChange={(itemValue) => handleFeeChange('paymentMethod', itemValue)}
                style={styles.picker}
                dropdownIconColor="#4A90E2"
              >
                <Picker.Item label="Select method..." value="" />
                {PAYMENT_METHODS.map(method => (
                  <Picker.Item 
                    key={method.value} 
                    label={method.label} 
                    value={method.value} 
                  />
                ))}
              </Picker>
            </View>

            {renderFeeInputField('Receipt Number (optional)', 'receiptNo', 'e.g. RCPT12345')}
            {renderFeeInputField('Description (optional)', 'description', 'e.g. Monthly fee')}

            <View style={styles.modalButtons}>
              <Pressable
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.modalButton, styles.saveButton]}
                onPress={addFeeRecord}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.modalButtonText}>Save</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Notification Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={notificationModalVisible}
        onRequestClose={() => setNotificationModalVisible(false)}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>
              {notificationForm.studentId === 'all' ? 
                'Send to All Parents' : 
                `Notify ${selectedStudent?.firstName}'s Parent`
              }
            </Text>

            {renderNotificationInputField('Title', 'title', 'e.g. Fee Reminder')}
            {renderNotificationInputField('Message', 'message', 'Type your message here', {
              multiline: true,
              numberOfLines: 4,
              style: { height: 100 }
            })}

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Recipient</Text>
              <Picker
                selectedValue={notificationForm.studentId}
                onValueChange={(itemValue) => handleNotificationChange('studentId', itemValue)}
                style={styles.picker}
                dropdownIconColor="#4A90E2"
              >
                <Picker.Item label="All Parents" value="all" />
                {selectedStudent && (
                  <Picker.Item 
                    label={`${selectedStudent.firstName}'s Parent Only`} 
                    value={selectedStudent.id} 
                  />
                )}
              </Picker>
            </View>

            <View style={styles.modalButtons}>
              <Pressable
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setNotificationModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.modalButton, styles.saveButton]}
                onPress={sendNotification}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.modalButtonText}>Send</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: '#f8fafc'
  },
  container: {
    padding: 16,
    paddingBottom: 40
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc'
  },
  loadingText: {
    marginTop: 16,
    color: '#64748b',
    fontSize: 16
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0'
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    marginLeft: 12,
    color: '#1e293b'
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#4A90E2',
    marginTop: 24,
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0'
  },
  inputContainer: {
    marginBottom: 16
  },
  label: {
    fontSize: 14,
    color: '#475569',
    marginBottom: 8,
    marginLeft: 4,
    fontWeight: '500'
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    padding: 14,
    borderRadius: 8,
    fontSize: 16,
    color: '#1e293b'
  },
  inputError: {
    borderColor: '#ef4444',
    backgroundColor: '#fef2f2'
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
    marginTop: 6,
    marginLeft: 6
  },
  saveButton: {
    backgroundColor: '#4A90E2',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24
  },
  disabledButton: {
    backgroundColor: '#a5b4fc'
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    backgroundColor: '#fff'
  },
  tabButton: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
      justifyContent: 'center',
      borderBottomWidth: 2,
      borderBottomColor: 'transparent'
    },
    activeTab: {
      borderBottomColor: '#4A90E2'
    },
    tabText: {
      fontSize: 14,
      fontWeight: '500',
      color: '#4A90E2',
      marginTop: 4
    },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#fff',
      borderWidth: 1,
      borderColor: '#cbd5e1',
      borderRadius: 8,
      paddingHorizontal: 12,
      marginBottom: 16
    },
    searchIcon: {
      marginRight: 8
    },
    searchInput: {
      flex: 1,
      paddingVertical: 12,
      fontSize: 16,
      color: '#1e293b'
    },
    studentList: {
      marginBottom: 16,
      maxHeight: 200
    },
    studentItem: {
      backgroundColor: '#fff',
      padding: 16,
      borderRadius: 8,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: '#e2e8f0',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between'
    },
    selectedStudentItem: {
      backgroundColor: '#f0f7ff',
      borderColor: '#4A90E2'
    },
    studentInfo: {
      flex: 1
    },
    studentName: {
      fontSize: 16,
      fontWeight: '600',
      color: '#1e293b',
      marginBottom: 4
    },
    studentClass: {
      fontSize: 12,
      color: '#64748b'
    },
    studentDetailsContainer: {
      backgroundColor: '#fff',
      padding: 16,
      borderRadius: 8,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: '#e2e8f0',
      flexDirection: 'row',
      justifyContent: 'space-between'
    },
    studentContact: {
      alignItems: 'flex-end'
    },
    studentInfo: {
      fontSize: 14,
      color: '#64748b',
      marginBottom: 4
    },
    feeActions: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 16
    },
    actionButton: {
      backgroundColor: '#4A90E2',
      padding: 12,
      borderRadius: 8,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      flex: 1,
      marginHorizontal: 5
    },
    notifyButton: {
      backgroundColor: '#10b981'
    },
    fullWidthButton: {
      marginHorizontal: 0,
      marginBottom: 20
    },
    actionButtonText: {
      color: '#fff',
      fontSize: 14,
      fontWeight: '500',
      marginLeft: 8
    },
    feeItem: {
      backgroundColor: '#fff',
      padding: 16,
      borderRadius: 8,
      marginBottom: 10,
      borderWidth: 1,
      borderColor: '#e2e8f0'
    },
    feeItemHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 8
    },
    feeAmount: {
      fontSize: 16,
      fontWeight: '600',
      color: '#1e293b'
    },
    feeStatus: {
      fontSize: 12,
      fontWeight: '600',
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 4
    },
    paidStatus: {
      backgroundColor: '#d1fae5',
      color: '#065f46'
    },
    pendingStatus: {
      backgroundColor: '#fee2e2',
      color: '#b91c1c'
    },
    feeDate: {
      fontSize: 12,
      color: '#64748b',
      marginBottom: 4
    },
    feeMethod: {
      fontSize: 12,
      color: '#64748b',
      marginBottom: 4
    },
    feeReceipt: {
      fontSize: 12,
      color: '#64748b',
      marginBottom: 4
    },
    feeDescription: {
      fontSize: 12,
      color: '#64748b',
      fontStyle: 'italic'
    },
    noRecordsText: {
      textAlign: 'center',
      color: '#64748b',
      marginTop: 20,
      marginBottom: 40
    },
    centeredView: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0,0,0,0.5)'
    },
    modalView: {
      backgroundColor: 'white',
      borderRadius: 10,
      padding: 20,
      width: '90%',
      maxHeight: '80%'
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: '600',
      marginBottom: 8,
      color: '#1e293b',
      textAlign: 'center'
    },
    modalSubtitle: {
      fontSize: 14,
      color: '#64748b',
      marginBottom: 16,
      textAlign: 'center'
    },
    dateInput: {
      backgroundColor: '#fff',
      borderWidth: 1,
      borderColor: '#cbd5e1',
      padding: 14,
      borderRadius: 8,
      fontSize: 16,
      color: '#1e293b',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    picker: {
      backgroundColor: '#fff',
      borderWidth: 1,
      borderColor: '#cbd5e1',
      borderRadius: 8
    },
    modalButtons: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 20
    },
    modalButton: {
      padding: 12,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
      flex: 1,
      marginHorizontal: 5
    },
    cancelButton: {
      backgroundColor: '#e2e8f0'
    },
    modalButtonText: {
      color: '#fff',
      fontSize: 14,
      fontWeight: '500'
    },
    notificationItem: {
      backgroundColor: '#fff',
      padding: 16,
      borderRadius: 8,
      marginBottom: 10,
      borderWidth: 1,
      borderColor: '#e2e8f0'
    },
    notificationTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: '#1e293b',
      marginBottom: 8
    },
    notificationMessage: {
      fontSize: 14,
      color: '#475569',
      marginBottom: 12
    },
    notificationFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between'
    },
    notificationRecipient: {
      fontSize: 12,
      color: '#64748b',
      fontStyle: 'italic'
    },
    notificationDate: {
      fontSize: 12,
      color: '#64748b'
    }
  });

  export default FeeManagement;
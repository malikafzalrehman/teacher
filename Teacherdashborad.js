import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  TextInput, 
  Modal, 
  Animated,
  Easing,
  ScrollView,
  Platform,
  Alert,
  KeyboardAvoidingView,
  Keyboard,
  ActivityIndicator
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import firestore from '@react-native-firebase/firestore';

const TeacherDashboard = () => {
  const [activeTab, setActiveTab] = useState('teachers');
  const [teachers, setTeachers] = useState([]);
  const [staff, setStaff] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [salaryModalVisible, setSalaryModalVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(300));
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    designation: '',
    joiningDate: '',
    address: '',
    status: 'Active',
    type: 'teacher',
    salary: '',
    department: '',
    bankAccount: '',
    qualifications: '',
    experience: '',
    salaryPeriod: 'Monthly'
  });

  // Fetch data from Firestore
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

    const fetchStaff = async () => {
      try {
        const snapshot = await firestore().collection('Staff').get();
        const staffData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setStaff(staffData);
      } catch (error) {
        console.error('Error fetching staff:', error);
        Alert.alert('Error', 'Failed to load staff. Please try again.');
      }
    };

    fetchTeachers();
    fetchStaff();
  }, []);

  // Filter data based on search query
  const filteredData = activeTab === 'teachers' 
    ? teachers.filter(teacher => 
        teacher.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        teacher.subject?.toLowerCase().includes(searchQuery.toLowerCase()))
    : staff.filter(staffMember => 
        staffMember.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        staffMember.designation?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        staffMember.department?.toLowerCase().includes(searchQuery.toLowerCase()));

  // Calculate monthly salary conversion
  const calculateMonthlySalary = (salary, period) => {
    const salaryValue = parseInt(salary) || 0;
    switch(period) {
      case 'Weekly': return salaryValue * 4;
      case 'Bi-Weekly': return salaryValue * 2;
      case 'Annual': return Math.round(salaryValue / 12);
      default: return salaryValue;
    }
  };

  // Calculate total monthly salary
  const totalMonthlySalary = (items) => {
    return items.reduce((sum, item) => sum + calculateMonthlySalary(item.salary, item.salaryPeriod), 0);
  };

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const animateModalIn = () => {
    slideAnim.setValue(300);
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      easing: Easing.out(Easing.back(1)),
      useNativeDriver: true,
    }).start();
  };

  const animateModalOut = (callback = () => {}) => {
    Animated.timing(slideAnim, {
      toValue: 300,
      duration: 250,
      easing: Easing.in(Easing.ease),
      useNativeDriver: true,
    }).start(() => {
      Keyboard.dismiss();
      if (callback) callback();
    });
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      subject: '',
      designation: '',
      joiningDate: '',
      address: '',
      status: 'Active',
      type: activeTab === 'teachers' ? 'teacher' : 'staff',
      salary: '',
      department: '',
      bankAccount: '',
      qualifications: '',
      experience: '',
      salaryPeriod: 'Monthly'
    });
    setCurrentItem(null);
    setEditMode(false);
    setSelectedDate(new Date());
  };

  const handleAdd = () => {
    resetForm();
    setModalVisible(true);
    animateModalIn();
  };

  const handleEdit = (item) => {
    setFormData({
      name: item.name,
      email: item.email,
      phone: item.phone,
      subject: item.subject || '',
      designation: item.designation || '',
      joiningDate: item.joiningDate,
      address: item.address,
      status: item.status,
      type: item.type,
      salary: item.salary || '',
      department: item.department || '',
      bankAccount: item.bankAccount || '',
      qualifications: item.qualifications || '',
      experience: item.experience || '',
      salaryPeriod: item.salaryPeriod || 'Monthly'
    });
    
    // Parse the joining date if it exists
    if (item.joiningDate) {
      const [day, month, year] = item.joiningDate.split('/');
      setSelectedDate(new Date(year, month - 1, day));
    }
    
    setCurrentItem(item);
    setEditMode(true);
    setModalVisible(true);
    animateModalIn();
  };

  const handleSalaryEdit = (item) => {
    setCurrentItem(item);
    setSalaryModalVisible(true);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setSelectedDate(selectedDate);
      const formattedDate = `${selectedDate.getDate()}/${selectedDate.getMonth() + 1}/${selectedDate.getFullYear()}`;
      handleInputChange('joiningDate', formattedDate);
    }
  };

  const showDatepicker = () => {
    setShowDatePicker(true);
    Keyboard.dismiss();
  };

  const confirmDelete = (id, type, name) => {
    Alert.alert(
      'Confirm Delete',
      `Are you sure you want to delete ${name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => handleDelete(id, type) },
      ],
      { cancelable: false }
    );
  };

  const handleDelete = async (id, type) => {
    try {
      await firestore().collection(type === 'teacher' ? 'Teacher' : 'Staff').doc(id).delete();
      
      if (type === 'teacher') {
        setTeachers(teachers.filter(t => t.id !== id));
      } else {
        setStaff(staff.filter(s => s.id !== id));
      }
      
      Animated.sequence([
        Animated.timing(fadeAnim, { toValue: 0.5, duration: 100, useNativeDriver: true }),
        Animated.timing(fadeAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
      ]).start();
    } catch (error) {
      console.error('Error deleting document:', error);
      Alert.alert('Error', 'Failed to delete. Please try again.');
    }
  };

  const handleSalaryStatusChange = async (month, paid) => {
    if (!currentItem) return;

    const updatedSalaryHistory = currentItem.salaryHistory?.map(item => 
      item.month === month ? { ...item, paid } : item
    ) || [];

    try {
      await firestore()
        .collection(currentItem.type === 'teacher' ? 'Teacher' : 'Staff')
        .doc(currentItem.id)
        .update({ salaryHistory: updatedSalaryHistory });

      if (currentItem.type === 'teacher') {
        setTeachers(teachers.map(t => 
          t.id === currentItem.id ? { ...t, salaryHistory: updatedSalaryHistory } : t
        ));
      } else {
        setStaff(staff.map(s => 
          s.id === currentItem.id ? { ...s, salaryHistory: updatedSalaryHistory } : s
        ));
      }
    } catch (error) {
      console.error('Error updating salary status:', error);
      Alert.alert('Error', 'Failed to update salary status. Please try again.');
    }
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.email) {
      Alert.alert('Validation Error', 'Name and Email are required fields');
      return;
    }

    if (formData.type === 'teacher' && !formData.subject) {
      Alert.alert('Validation Error', 'Subject is required for teachers');
      return;
    }

    if (formData.type === 'staff' && !formData.designation) {
      Alert.alert('Validation Error', 'Designation is required for staff');
      return;
    }

    const currentDate = new Date();
    const currentMonth = currentDate.toLocaleString('default', { month: 'short' }) + ' ' + currentDate.getFullYear();
    const monthlySalary = calculateMonthlySalary(formData.salary, formData.salaryPeriod);
    const defaultSalaryHistory = [
      { month: currentMonth, amount: monthlySalary.toString(), paid: false }
    ];

    const newItem = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      status: formData.status,
      joiningDate: formData.joiningDate || `${selectedDate.getDate()}/${selectedDate.getMonth() + 1}/${selectedDate.getFullYear()}`,
      address: formData.address,
      type: formData.type,
      salary: monthlySalary.toString(),
      salaryPeriod: 'Monthly',
      salaryHistory: editMode ? currentItem.salaryHistory || defaultSalaryHistory : defaultSalaryHistory,
      ...(formData.type === 'teacher' 
        ? { 
            subject: formData.subject,
            qualifications: formData.qualifications,
            experience: formData.experience
          } 
        : { 
            designation: formData.designation,
            department: formData.department,
            bankAccount: formData.bankAccount
          })
    };

    try {
      const collectionName = formData.type === 'teacher' ? 'Teacher' : 'Staff';
      const docId = editMode ? currentItem.id : `id-${Date.now()}`;
      
      await firestore()
        .collection(collectionName)
        .doc(docId)
        .set(newItem, { merge: true });

      if (editMode) {
        if (formData.type === 'teacher') {
          setTeachers(teachers.map(t => t.id === currentItem.id ? { ...newItem, id: docId } : t));
        } else {
          setStaff(staff.map(s => s.id === currentItem.id ? { ...newItem, id: docId } : s));
        }
      } else {
        if (formData.type === 'teacher') {
          setTeachers([...teachers, { ...newItem, id: docId }]);
        } else {
          setStaff([...staff, { ...newItem, id: docId }]);
        }
      }

      animateModalOut(() => {
        resetForm();
        setModalVisible(false);
      });
    } catch (error) {
      console.error('Error saving data:', error);
      Alert.alert('Error', 'Failed to save data. Please try again.');
    }
  };

  const renderSalaryItem = ({ item }) => (
    <View style={styles.salaryItem}>
      <Text style={styles.salaryMonth}>{item.month}</Text>
      <Text style={styles.salaryAmount}>PKR {item.amount}</Text>
      <TouchableOpacity
        style={[
          styles.salaryStatus,
          item.paid ? styles.salaryPaid : styles.salaryPending
        ]}
        onPress={() => handleSalaryStatusChange(item.month, !item.paid)}
      >
        <Text style={styles.salaryStatusText}>
          {item.paid ? 'Paid' : 'Pending'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderItem = ({ item }) => (
    <Animated.View style={[styles.item, { 
      opacity: fadeAnim,
      transform: [{ translateY: fadeAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [50, 0]
      })}],
    }]}>
      <TouchableOpacity 
        style={styles.itemContent}
        onPress={() => handleEdit(item)}
        activeOpacity={0.7}
      >
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{item.name?.charAt(0) || '?'}</Text>
        </View>
        <View style={styles.infoContainer}>
          <View style={styles.nameContainer}>
            <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
            <View style={[
              styles.status, 
              { backgroundColor: item.status === 'Active' ? '#4CAF50' : '#FF9800' }
            ]}>
              <Text style={styles.statusText}>{item.status}</Text>
            </View>
          </View>
          <Text style={styles.detail} numberOfLines={1}>
            <Icon name="email" size={14} color="#666" /> {item.email}
          </Text>
          {item.phone && (
            <Text style={styles.detail} numberOfLines={1}>
              <Icon name="phone" size={14} color="#666" /> {item.phone}
            </Text>
          )}
          <Text style={styles.detail} numberOfLines={1}>
            <Icon name={item.type === 'teacher' ? 'school' : 'badge'} size={14} color="#666" /> 
            {item.type === 'teacher' ? item.subject : item.designation}
          </Text>
          {item.salary && (
            <Text style={styles.detail} numberOfLines={1}>
              <Icon name="attach-money" size={14} color="#666" /> 
              Salary: PKR {item.salary} (Monthly)
            </Text>
          )}
        </View>
      </TouchableOpacity>
      <View style={styles.itemActions}>
        <TouchableOpacity 
          style={styles.salaryButton}
          onPress={() => handleSalaryEdit(item)}
        >
          <Icon name="account-balance" size={20} color="#3F51B5" />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.deleteButton} 
          onPress={() => confirmDelete(item.id, item.type, item.name)}
        >
          <Icon name="delete" size={20} color="white" />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3F51B5" />
        <Text style={styles.loadingText}>Loading data...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
    >
      <Animated.View style={[styles.innerContainer, { opacity: fadeAnim }]}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>School Management System</Text>
          <Text style={styles.headerSubtitle}>
            {activeTab === 'teachers' ? 'Teacher' : 'Staff'} Dashboard
          </Text>
        </View>

        <View style={styles.searchContainer}>
          <Icon name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder={`Search ${activeTab === 'teachers' ? 'teachers...' : 'staff...'}`}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#999"
          />
          {searchQuery ? (
            <TouchableOpacity 
              style={styles.clearSearchButton}
              onPress={() => setSearchQuery('')}
            >
              <Icon name="close" size={18} color="#666" />
            </TouchableOpacity>
          ) : null}
        </View>

        <View style={styles.tabs}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'teachers' && styles.activeTab]}
            onPress={() => setActiveTab('teachers')}
          >
            <Icon name="people" size={20} color={activeTab === 'teachers' ? 'white' : '#3F51B5'} />
            <Text style={[styles.tabText, activeTab === 'teachers' && styles.activeTabText]}>
              Teachers ({teachers.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'staff' && styles.activeTab]}
            onPress={() => setActiveTab('staff')}
          >
            <Icon name="engineering" size={20} color={activeTab === 'staff' ? 'white' : '#3F51B5'} />
            <Text style={[styles.tabText, activeTab === 'staff' && styles.activeTabText]}>
              Staff ({staff.length})
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Icon name="group" size={24} color="#3F51B5" />
            <Text style={styles.statNumber}>
              {activeTab === 'teachers' ? teachers.length : staff.length}
            </Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statCard}>
            <Icon name="check-circle" size={24} color="#4CAF50" />
            <Text style={styles.statNumber}>
              {activeTab === 'teachers' 
                ? teachers.filter(t => t.status === 'Active').length 
                : staff.filter(s => s.status === 'Active').length}
            </Text>
            <Text style={styles.statLabel}>Active</Text>
          </View>
          <View style={styles.statCard}>
            <Icon name="attach-money" size={24} color="#FF5722" />
            <Text style={styles.statNumber}>
              PKR {activeTab === 'teachers' 
                ? totalMonthlySalary(teachers).toLocaleString('en-PK')
                : totalMonthlySalary(staff).toLocaleString('en-PK')}
            </Text>
            <Text style={styles.statLabel}>Monthly Salary</Text>
          </View>
        </View>

        <FlatList
          data={filteredData}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Icon name="info" size={40} color="#3F51B5" />
              <Text style={styles.emptyText}>
                No {activeTab === 'teachers' ? 'teachers' : 'staff'} found
              </Text>
              <Text style={styles.emptySubtext}>
                {searchQuery ? 'Try a different search' : 'Add new records to get started'}
              </Text>
            </View>
          }
          showsVerticalScrollIndicator={false}
        />

        <TouchableOpacity 
          style={styles.addButton} 
          onPress={handleAdd}
          activeOpacity={0.8}
        >
          <Icon name="add" size={30} color="white" />
        </TouchableOpacity>

        {/* Main Edit/Add Modal */}
        <Modal
          animationType="none"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => animateModalOut(() => setModalVisible(false))}
          onShow={animateModalIn}
        >
          <View style={styles.modalOverlay}>
            <Animated.View style={[
              styles.modalContainer, 
              { transform: [{ translateY: slideAnim }] }
            ]}>
              <ScrollView 
                style={styles.modalScrollView}
                contentContainerStyle={styles.modalContent}
                keyboardShouldPersistTaps="handled"
              >
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>
                    {editMode ? 'Edit' : 'Add New'} {activeTab === 'teachers' ? 'Teacher' : 'Staff'}
                  </Text>
                  <TouchableOpacity 
                    style={styles.closeButton}
                    onPress={() => animateModalOut(() => setModalVisible(false))}
                  >
                    <Icon name="close" size={24} color="#666" />
                  </TouchableOpacity>
                </View>
                
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Full Name *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter full name"
                    value={formData.name}
                    onChangeText={(text) => handleInputChange('name', text)}
                    returnKeyType="next"
                  />
                </View>
                
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Email *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter email address"
                    value={formData.email}
                    onChangeText={(text) => handleInputChange('email', text)}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    returnKeyType="next"
                  />
                </View>
                
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Phone Number</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter phone number"
                    value={formData.phone}
                    onChangeText={(text) => handleInputChange('phone', text)}
                    keyboardType="phone-pad"
                    returnKeyType="next"
                  />
                </View>
                
                {activeTab === 'teachers' ? (
                  <>
                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Subject *</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="Enter subject taught"
                        value={formData.subject}
                        onChangeText={(text) => handleInputChange('subject', text)}
                        returnKeyType="next"
                      />
                    </View>
                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Qualifications</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="Enter qualifications"
                        value={formData.qualifications}
                        onChangeText={(text) => handleInputChange('qualifications', text)}
                        returnKeyType="next"
                      />
                    </View>
                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Experience</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="Enter years of experience"
                        value={formData.experience}
                        onChangeText={(text) => handleInputChange('experience', text)}
                        returnKeyType="next"
                      />
                    </View>
                  </>
                ) : (
                  <>
                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Designation *</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="Enter staff designation"
                        value={formData.designation}
                        onChangeText={(text) => handleInputChange('designation', text)}
                        returnKeyType="next"
                      />
                    </View>
                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Department</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="Enter department"
                        value={formData.department}
                        onChangeText={(text) => handleInputChange('department', text)}
                        returnKeyType="next"
                      />
                    </View>
                  </>
                )}
                
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Salary (PKR) *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter salary amount"
                    value={formData.salary}
                    onChangeText={(text) => handleInputChange('salary', text)}
                    keyboardType="numeric"
                    returnKeyType="next"
                  />
                </View>
                
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Salary Period *</Text>
                  <Picker
                    selectedValue={formData.salaryPeriod}
                    style={styles.picker}
                    onValueChange={(itemValue) => handleInputChange('salaryPeriod', itemValue)}
                  >
                    <Picker.Item label="Monthly" value="Monthly" />
                    <Picker.Item label="Weekly" value="Weekly" />
                    <Picker.Item label="Bi-Weekly" value="Bi-Weekly" />
                    <Picker.Item label="Annual" value="Annual" />
                  </Picker>
                </View>
                
                {activeTab === 'staff' && (
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Bank Account</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Enter bank account number"
                      value={formData.bankAccount}
                      onChangeText={(text) => handleInputChange('bankAccount', text)}
                      keyboardType="numeric"
                      returnKeyType="next"
                    />
                  </View>
                )}
                
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Joining Date</Text>
                  <TouchableOpacity 
                    style={styles.dateInput}
                    onPress={showDatepicker}
                  >
                    <Text style={formData.joiningDate ? styles.dateText : styles.placeholderText}>
                      {formData.joiningDate || 'Select joining date'}
                    </Text>
                    <Icon name="calendar-today" size={20} color="#666" />
                  </TouchableOpacity>
                  {showDatePicker && (
                    <DateTimePicker
                      value={selectedDate}
                      mode="date"
                      display="default"
                      onChange={handleDateChange}
                    />
                  )}
                </View>
                
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Address</Text>
                  <TextInput
                    style={[styles.input, styles.multilineInput]}
                    placeholder="Enter address"
                    value={formData.address}
                    onChangeText={(text) => handleInputChange('address', text)}
                    multiline
                    numberOfLines={3}
                    returnKeyType="done"
                  />
                </View>
                
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Status</Text>
                  <View style={styles.statusOptions}>
                    <TouchableOpacity 
                      style={[
                        styles.statusButton, 
                        formData.status === 'Active' && styles.activeStatusButton
                      ]}
                      onPress={() => handleInputChange('status', 'Active')}
                    >
                      <Icon name="check-circle" size={16} color={formData.status === 'Active' ? 'white' : '#4CAF50'} />
                      <Text style={[
                        styles.statusButtonText,
                        formData.status === 'Active' && styles.activeStatusButtonText
                      ]}>
                        Active
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[
                        styles.statusButton, 
                        formData.status === 'Inactive' && styles.inactiveStatusButton
                      ]}
                      onPress={() => handleInputChange('status', 'Inactive')}
                    >
                      <Icon name="remove-circle" size={16} color={formData.status === 'Inactive' ? 'white' : '#FF9800'} />
                      <Text style={[
                        styles.statusButtonText,
                        formData.status === 'Inactive' && styles.inactiveStatusButtonText
                      ]}>
                        Inactive
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
                
                <View style={styles.modalButtons}>
                  <TouchableOpacity 
                    style={styles.cancelButton}
                    onPress={() => animateModalOut(() => setModalVisible(false))}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.submitButton}
                    onPress={handleSubmit}
                  >
                    <Text style={styles.submitButtonText}>
                      {editMode ? 'Update' : 'Save'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </Animated.View>
          </View>
        </Modal>

        {/* Salary Management Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={salaryModalVisible}
          onRequestClose={() => setSalaryModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.salaryModalContainer}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {currentItem?.name}'s Salary History
                </Text>
                <TouchableOpacity 
                  style={styles.closeButton}
                  onPress={() => setSalaryModalVisible(false)}
                >
                  <Icon name="close" size={24} color="#666" />
                </TouchableOpacity>
              </View>
              
              <View style={styles.salarySummary}>
                <Text style={styles.salarySummaryText}>
                  Monthly Salary: PKR {currentItem?.salary || '0'}
                </Text>
              </View>
              
              <FlatList
                data={currentItem?.salaryHistory || []}
                renderItem={renderSalaryItem}
                keyExtractor={(item, index) => index.toString()}
                contentContainerStyle={styles.salaryListContainer}
                ListEmptyComponent={
                  <Text style={styles.emptySalaryText}>No salary records found</Text>
                }
              />
              
              <View style={styles.modalButtons}>
                <TouchableOpacity 
                  style={styles.cancelButton}
                  onPress={() => setSalaryModalVisible(false)}
                >
                  <Text style={styles.cancelButtonText}>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </Animated.View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  innerContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#3F51B5',
  },
  header: {
    padding: 20,
    backgroundColor: '#3F51B5',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 4,
  },
  headerTitle: {
    fontSize: 22,
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 10,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    paddingHorizontal: 12,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 45,
    color: '#333',
    fontSize: 14,
  },
  clearSearchButton: {
    padding: 5,
  },
  tabs: {
    flexDirection: 'row',
    borderRadius: 10,
    marginHorizontal: 16,
    marginVertical: 12,
    overflow: 'hidden',
    elevation: 2,
  },
  tab: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
    backgroundColor: 'white',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  activeTab: {
    backgroundColor: '#3F51B5',
  },
  tabText: {
    color: '#333',
    fontWeight: '600',
    fontSize: 14,
    marginLeft: 8,
  },
  activeTabText: {
    color: 'white',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 4,
    elevation: 2,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3F51B5',
    marginVertical: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    flexGrow: 1,
  },
  item: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    elevation: 2,
  },
  itemContent: {
    flexDirection: 'row',
    padding: 16,
    flex: 1,
  },
  itemActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  salaryButton: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  deleteButton: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f44336',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#3F51B5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flexShrink: 1,
  },
  detail: {
    fontSize: 13,
    color: '#666',
    marginVertical: 2,
  },
  status: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 11,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    color: '#3F51B5',
    fontWeight: '600',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
  addButton: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    backgroundColor: '#3F51B5',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  salaryModalContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
    paddingBottom: 20,
  },
  modalScrollView: {
    flexGrow: 1,
  },
  modalContent: {
    padding: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3F51B5',
    flex: 1,
  },
  closeButton: {
    padding: 8,
    marginLeft: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    color: '#333',
    backgroundColor: '#f9f9f9',
  },
  picker: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
  },
  multilineInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#f9f9f9',
  },
  dateText: {
    fontSize: 15,
    color: '#333',
  },
  placeholderText: {
    fontSize: 15,
    color: '#999',
  },
  statusOptions: {
    flexDirection: 'row',
    marginTop: 8,
  },
  statusButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 12,
    backgroundColor: 'white',
  },
  activeStatusButton: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  inactiveStatusButton: {
    backgroundColor: '#FF9800',
    borderColor: '#FF9800',
  },
  statusButtonText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
  activeStatusButtonText: {
    color: 'white',
  },
  inactiveStatusButtonText: {
    color: 'white',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    paddingHorizontal: 24,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f1f1f1',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    marginRight: 12,
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: '600',
    fontSize: 16,
  },
  submitButton: {
    flex: 1,
    backgroundColor: '#3F51B5',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
  },
  submitButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  salarySummary: {
    paddingHorizontal: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  salarySummaryText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
  },
  salaryListContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  salaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 8,
    marginBottom: 8,
    elevation: 1,
  },
  salaryMonth: {
    flex: 2,
    fontSize: 14,
    color: '#333',
  },
  salaryAmount: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    fontWeight: 'bold',
    textAlign: 'right',
    marginRight: 16,
  },
  salaryStatus: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  salaryPaid: {
    backgroundColor: '#4CAF50',
  },
  salaryPending: {
    backgroundColor: '#FF9800',
  },
  salaryStatusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptySalaryText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 20,
  },
});

export default TeacherDashboard;
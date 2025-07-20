import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  TextInput,
  Modal,
  FlatList,
  Alert,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';

const schoolonlinesetup = () => {
  // Form states
  const [admissionForm, setAdmissionForm] = useState({
    studentName: '',
    fatherName: '',
    motherName: '',
    contactNumber: '',
    alternateContact: '',
    email: '',
    applyingClass: 'Nursery',
    dob: new Date(),
    address: '',
    previousSchool: ''
  });

  const [errors, setErrors] = useState({});
  const [applications, setApplications] = useState([]);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');

  // Simulate loading data
  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setRefreshing(false);
    }, 1000);
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchApplications();
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    if (!admissionForm.studentName.trim()) {
      newErrors.studentName = 'Student name is required';
    }
    
    if (!admissionForm.fatherName.trim()) {
      newErrors.fatherName = "Father's name is required";
    }
    
    if (!admissionForm.contactNumber.trim()) {
      newErrors.contactNumber = 'Contact number is required';
    } else if (!/^\d{10,15}$/.test(admissionForm.contactNumber)) {
      newErrors.contactNumber = 'Invalid contact number';
    }
    
    if (admissionForm.email && !/^\S+@\S+\.\S+$/.test(admissionForm.email)) {
      newErrors.email = 'Invalid email format';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = () => {
    if (!validateForm()) return;

    const newApplication = {
      id: Date.now().toString(),
      ...admissionForm,
      dob: admissionForm.dob.toLocaleDateString(),
      status: 'Pending',
      submissionDate: new Date().toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
    };

    setApplications([newApplication, ...applications]);
    resetForm();
    Alert.alert('Success', 'Application submitted successfully!');
  };

  const resetForm = () => {
    setAdmissionForm({
      studentName: '',
      fatherName: '',
      motherName: '',
      contactNumber: '',
      alternateContact: '',
      email: '',
      applyingClass: 'Nursery',
      dob: new Date(),
      address: '',
      previousSchool: ''
    });
    setErrors({});
  };

  // Application status management
  const updateStatus = (id, status) => {
    setApplications(applications.map(app => 
      app.id === id ? {...app, status} : app
    ));
    setViewModalVisible(false);
    Alert.alert(
      status === 'Approved' ? 'Approved' : 'Rejected',
      `Application has been ${status.toLowerCase()}`
    );
  };

  // Filter applications based on search and status
  const filteredApplications = applications.filter(app => {
    const matchesSearch = app.studentName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         app.applyingClass.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'All' || app.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Class options
  const classOptions = [
    'Nursery', 'LKG', 'UKG', '1', '2', '3', '4', '5', 
    '6', '7', '8', '9', '10', '11', '12'
  ];

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>School Admission System</Text>
        <Text style={styles.headerSubtitle}>Manage student applications</Text>
      </View>

      {/* Application Form */}
      <ScrollView 
        style={styles.formContainer}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.sectionTitle}>New Admission Form</Text>
        
        <Text style={styles.inputLabel}>Student Information</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.input, errors.studentName && styles.inputError]}
            placeholder="Student Full Name *"
            value={admissionForm.studentName}
            onChangeText={(text) => setAdmissionForm({...admissionForm, studentName: text})}
          />
          {errors.studentName && <Text style={styles.errorText}>{errors.studentName}</Text>}
        </View>

        <View style={styles.row}>
          <View style={[styles.inputContainer, {flex: 1, marginRight: 10}]}>
            <TextInput
              style={[styles.input, errors.fatherName && styles.inputError]}
              placeholder="Father's Name *"
              value={admissionForm.fatherName}
              onChangeText={(text) => setAdmissionForm({...admissionForm, fatherName: text})}
            />
            {errors.fatherName && <Text style={styles.errorText}>{errors.fatherName}</Text>}
          </View>
          <View style={[styles.inputContainer, {flex: 1}]}>
            <TextInput
              style={styles.input}
              placeholder="Mother's Name"
              value={admissionForm.motherName}
              onChangeText={(text) => setAdmissionForm({...admissionForm, motherName: text})}
            />
          </View>
        </View>

        <Text style={styles.inputLabel}>Contact Information</Text>
        <View style={styles.row}>
          <View style={[styles.inputContainer, {flex: 1, marginRight: 10}]}>
            <TextInput
              style={[styles.input, errors.contactNumber && styles.inputError]}
              placeholder="Contact Number *"
              keyboardType="phone-pad"
              value={admissionForm.contactNumber}
              onChangeText={(text) => setAdmissionForm({...admissionForm, contactNumber: text})}
              maxLength={15}
            />
            {errors.contactNumber && <Text style={styles.errorText}>{errors.contactNumber}</Text>}
          </View>
          <View style={[styles.inputContainer, {flex: 1}]}>
            <TextInput
              style={styles.input}
              placeholder="Alternate Contact"
              keyboardType="phone-pad"
              value={admissionForm.alternateContact}
              onChangeText={(text) => setAdmissionForm({...admissionForm, alternateContact: text})}
              maxLength={15}
            />
          </View>
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.input, errors.email && styles.inputError]}
            placeholder="Email Address"
            keyboardType="email-address"
            value={admissionForm.email}
            onChangeText={(text) => setAdmissionForm({...admissionForm, email: text})}
          />
          {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
        </View>

        <Text style={styles.inputLabel}>Academic Information</Text>
        <View style={styles.row}>
          <View style={[styles.inputContainer, {flex: 1, marginRight: 10}]}>
            <Text style={styles.pickerLabel}>Applying Class *</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={admissionForm.applyingClass}
                onValueChange={(itemValue) => setAdmissionForm({...admissionForm, applyingClass: itemValue})}
                style={styles.picker}
              >
                {classOptions.map((cls) => (
                  <Picker.Item key={cls} label={cls} value={cls} />
                ))}
              </Picker>
            </View>
          </View>
          <View style={[styles.inputContainer, {flex: 1}]}>
            <Text style={styles.pickerLabel}>Date of Birth *</Text>
            <TouchableOpacity 
              style={styles.dateInput}
              onPress={() => setShowDatePicker(true)}
            >
              <Text>{admissionForm.dob.toLocaleDateString()}</Text>
              <Icon name="event" size={20} color="#555" />
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={admissionForm.dob}
                mode="date"
                display="default"
                maximumDate={new Date()}
                onChange={(event, selectedDate) => {
                  setShowDatePicker(false);
                  if (selectedDate) {
                    setAdmissionForm({...admissionForm, dob: selectedDate});
                  }
                }}
              />
            )}
          </View>
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Previous School (if any)"
            value={admissionForm.previousSchool}
            onChangeText={(text) => setAdmissionForm({...admissionForm, previousSchool: text})}
          />
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.input, {height: 80}]}
            placeholder="Address"
            multiline
            value={admissionForm.address}
            onChangeText={(text) => setAdmissionForm({...admissionForm, address: text})}
          />
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity 
            style={[styles.button, styles.resetButton]}
            onPress={resetForm}
          >
            <Text style={styles.buttonText}>Reset</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.button, styles.submitButton]}
            onPress={handleSubmit}
          >
            <Text style={styles.buttonText}>Submit Application</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Applications List */}
      <View style={styles.listContainer}>
        <View style={styles.listHeader}>
          <Text style={styles.sectionTitle}>Applications ({applications.length})</Text>
          
          <View style={styles.filterRow}>
            <View style={styles.searchContainer}>
              <Icon name="search" size={20} color="#777" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search applications..."
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
            
            <View style={styles.filterContainer}>
              <Picker
                selectedValue={filterStatus}
                onValueChange={setFilterStatus}
                style={styles.filterPicker}
                dropdownIconColor="#555"
              >
                <Picker.Item label="All Status" value="All" />
                <Picker.Item label="Pending" value="Pending" />
                <Picker.Item label="Approved" value="Approved" />
                <Picker.Item label="Rejected" value="Rejected" />
              </Picker>
            </View>
          </View>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#3498db" />
          </View>
        ) : filteredApplications.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Icon name="inbox" size={60} color="#ddd" />
            <Text style={styles.emptyText}>
              {applications.length === 0 ? 'No applications received yet' : 'No matching applications found'}
            </Text>
            {applications.length > 0 && (
              <TouchableOpacity 
                style={styles.clearFiltersButton}
                onPress={() => {
                  setSearchQuery('');
                  setFilterStatus('All');
                }}
              >
                <Text style={styles.clearFiltersText}>Clear filters</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <FlatList
            data={filteredApplications}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={[
                  styles.applicationCard,
                  item.status === 'Approved' && styles.approvedCard,
                  item.status === 'Rejected' && styles.rejectedCard
                ]}
                onPress={() => {
                  setSelectedApplication(item);
                  setViewModalVisible(true);
                }}
              >
                <View style={styles.cardHeader}>
                  <Text style={styles.studentName}>{item.studentName}</Text>
                  <View style={[
                    styles.statusBadge,
                    item.status === 'Approved' && styles.approvedBadge,
                    item.status === 'Rejected' && styles.rejectedBadge
                  ]}>
                    <Text style={styles.statusText}>{item.status}</Text>
                  </View>
                </View>
                <Text style={styles.classInfo}>Class: {item.applyingClass}</Text>
                <View style={styles.cardFooter}>
                  <Text style={styles.dateText}>{item.submissionDate}</Text>
                  <Icon name="chevron-right" size={20} color="#95a5a6" />
                </View>
              </TouchableOpacity>
            )}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={['#3498db']}
              />
            }
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        )}
      </View>

      {/* Application Details Modal */}
      <Modal
        visible={viewModalVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setViewModalVisible(false)}
      >
        {selectedApplication && (
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Application Details</Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setViewModalVisible(false)}
              >
                <Icon name="close" size={24} color="#7f8c8d" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalContent}>
              <View style={styles.detailSection}>
                <Text style={styles.sectionTitle}>Student Information</Text>
                <DetailRow label="Full Name" value={selectedApplication.studentName} />
                <DetailRow label="Father's Name" value={selectedApplication.fatherName} />
                <DetailRow label="Mother's Name" value={selectedApplication.motherName} />
                <DetailRow label="Date of Birth" value={selectedApplication.dob} />
              </View>

              <View style={styles.detailSection}>
                <Text style={styles.sectionTitle}>Contact Information</Text>
                <DetailRow label="Contact Number" value={selectedApplication.contactNumber} />
                <DetailRow label="Alternate Contact" value={selectedApplication.alternateContact} />
                <DetailRow label="Email Address" value={selectedApplication.email} />
                <DetailRow label="Address" value={selectedApplication.address} />
              </View>

              <View style={styles.detailSection}>
                <Text style={styles.sectionTitle}>Academic Information</Text>
                <DetailRow label="Applying Class" value={selectedApplication.applyingClass} />
                <DetailRow label="Previous School" value={selectedApplication.previousSchool} />
                <DetailRow label="Submission Date" value={selectedApplication.submissionDate} />
                <DetailRow 
                  label="Status" 
                  value={selectedApplication.status} 
                  valueStyle={[
                    styles.statusValue,
                    selectedApplication.status === 'Approved' && styles.approvedValue,
                    selectedApplication.status === 'Rejected' && styles.rejectedValue
                  ]}
                />
              </View>
            </ScrollView>
            
            {selectedApplication.status === 'Pending' && (
              <View style={styles.actionButtons}>
                <TouchableOpacity 
                  style={[styles.actionButton, styles.rejectButton]}
                  onPress={() => updateStatus(selectedApplication.id, 'Rejected')}
                >
                  <Icon name="close" size={20} color="white" />
                  <Text style={styles.actionButtonText}>Reject</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.actionButton, styles.approveButton]}
                  onPress={() => updateStatus(selectedApplication.id, 'Approved')}
                >
                  <Icon name="check" size={20} color="white" />
                  <Text style={styles.actionButtonText}>Approve</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </Modal>
    </KeyboardAvoidingView>
  );
};

// Reusable DetailRow component
const DetailRow = ({ label, value, valueStyle }) => (
  <View style={styles.detailRow}>
    <Text style={styles.detailLabel}>{label}:</Text>
    <Text style={[styles.detailValue, valueStyle]}>{value || 'N/A'}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  header: {
    backgroundColor: '#3498db',
    padding: 16,
    paddingTop: Platform.OS === 'ios' ? 50 : 16,
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  headerTitle: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 5,
  },
  formContainer: {
    backgroundColor: 'white',
    margin: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
    maxHeight: '45%',
  },
  listContainer: {
    flex: 1,
    backgroundColor: '#f5f7fa',
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#7f8c8d',
    marginBottom: 8,
    marginTop: 12,
  },
  inputContainer: {
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: 'black',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    backgroundColor: '#b4cbdb',
  },
  inputError: {
    borderColor: 'black',
  },
  errorText: {
    color: '#b4cbdb',
    fontSize: 12,
    marginTop: 4,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#b4cbdb',
    borderRadius: 8,
    backgroundColor: '#b4cbdb',
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  pickerLabel: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 8,
  },
  dateInput: {
    borderWidth: 1,
    borderColor: '#dfe6e9',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#b4cbdb',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  button: {
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    flexDirection: 'row',
  },
  submitButton: {
    backgroundColor: '#3498db',
    marginLeft: 10,
  },
  resetButton: {
    backgroundColor: '#95a5a6',
    marginRight: 10,
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  listHeader: {
    marginBottom: 12,
  },
  filterRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#b4cbdb',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#dfe6e9',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 14,
  },
  filterContainer: {
    flex: 0.6,
    borderWidth: 1,
    borderColor: '#dfe6e9',
    borderRadius: 8,
    backgroundColor: '#b4cbdb',
    overflow: 'hidden',
  },
  filterPicker: {
    height: 42,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#95a5a6',
    marginTop: 16,
    textAlign: 'center',
  },
  clearFiltersButton: {
    marginTop: 16,
    padding: 8,
  },
  clearFiltersText: {
    color: '#3498db',
    fontSize: 14,
    fontWeight: '500',
  },
  applicationCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  approvedCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#2ecc71',
  },
  rejectedCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#e74c3c',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  studentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#f39c12',
  },
  approvedBadge: {
    backgroundColor: '#2ecc71',
  },
  rejectedBadge: {
    backgroundColor: '#e74c3c',
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  classInfo: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 8,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 12,
    color: '#bdc3c7',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
  },
  closeButton: {
    padding: 4,
  },
  modalContent: {
    padding: 16,
  },
  detailSection: {
    marginBottom: 24,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 14,
    color: '#7f8c8d',
    fontWeight: '500',
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    color: '#2c3e50',
    fontWeight: '500',
    flex: 1.5,
    textAlign: 'right',
  },
  statusValue: {
    fontWeight: '600',
  },
  approvedValue: {
    color: '#2ecc71',
  },
  rejectedValue: {
    color: '#e74c3c',
  },
  actionButtons: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  actionButton: {
    flex: 1,
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginHorizontal: 8,
  },
  approveButton: {
    backgroundColor: '#2ecc71',
  },
  rejectButton: {
    backgroundColor: '#e74c3c',
  },
  actionButtonText: {
    color: 'white',
    fontWeight: '600',
    marginLeft: 8,
    fontSize: 16,
  },
});


export default schoolonlinesetup;
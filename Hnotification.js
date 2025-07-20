import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput, 
  FlatList, 
  Alert,
  Modal,
  KeyboardAvoidingView,
  Platform
} from 'react-native';

const Hnotification = ({ userType, userId, userName }) => {
  const [notificationText, setNotificationText] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [selectedRecipient, setSelectedRecipient] = useState(null);
  const [showRecipientModal, setShowRecipientModal] = useState(false);
  const [filter, setFilter] = useState('all'); // 'all', 'sent', 'received'

  // Sample data - replace with your actual data
  const recipients = [
    { id: 'all', name: 'Everyone', type: 'group' },
    { id: 'teachers', name: 'All Teachers', type: 'group' },
    { id: 'students', name: 'All Students', type: 'group' },
    { id: 'parents', name: 'All Parents', type: 'group' },
    { id: 't1', name: 'Math Department', type: 'group', members: 'teachers' },
    { id: 'c10a', name: 'Class 10A', type: 'group', members: ['students', 'parents'] },
    { id: 's101', name: 'John Doe (Student)', type: 'student' },
    { id: 's102', name: 'Sarah Smith (Student)', type: 'student' },
    { id: 'p101', name: 'Mr. Doe (Parent)', type: 'parent' },
    { id: 't101', name: 'Ms. Johnson (Teacher)', type: 'teacher' },
  ];

  // Filter recipients based on user type
  const filteredRecipients = recipients.filter(recipient => {
    if (userType === 'admin') return true;
    if (userType === 'teacher') return recipient.id !== 'teachers';
    if (userType === 'student') return false; // Students can't send notifications in this version
    if (userType === 'parent') return false; // Parents can't send notifications in this version
    return false;
  });

  // Load sample notifications on component mount
  useEffect(() => {
    const sampleNotifications = [
      { 
        id: '1', 
        text: 'Welcome to the school notification system!', 
        sender: 'Admin', 
        senderId: 'admin',
        time: '10:00 AM',
        recipient: 'Everyone',
        recipientId: 'all'
      },
      { 
        id: '2', 
        text: 'Parent-teacher meeting scheduled for Friday', 
        sender: 'Ms. Johnson', 
        senderId: 't101',
        time: 'Yesterday',
        recipient: 'Class 10A Parents',
        recipientId: 'c10a'
      },
    ];
    
    if (userType === 'teacher') {
      sampleNotifications.push({
        id: '3',
        text: 'Please submit your assignments by Monday',
        sender: userName,
        senderId: userId,
        time: '2 hours ago',
        recipient: 'Class 10A',
        recipientId: 'c10a'
      });
    }
    
    setNotifications(sampleNotifications);
  }, [userType, userId, userName]);

  const handleSendNotification = () => {
    if (!notificationText.trim()) {
      Alert.alert('Error', 'Please enter notification text');
      return;
    }

    if (!selectedRecipient && userType !== 'admin') {
      Alert.alert('Error', 'Please select a recipient');
      return;
    }

    const newNotification = {
      id: Date.now().toString(),
      text: notificationText,
      sender: userName || 'You',
      senderId: userId,
      time: 'Just now',
      recipient: selectedRecipient ? selectedRecipient.name : 'Everyone',
      recipientId: selectedRecipient ? selectedRecipient.id : 'all'
    };

    setNotifications([newNotification, ...notifications]);
    setNotificationText('');
    setSelectedRecipient(null);
    Alert.alert('Success', 'Notification sent successfully');
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'sent') return notification.senderId === userId;
    if (filter === 'received') {
      // Check if notification was sent to everyone, to user's type, or specifically to this user
      return notification.recipientId === 'all' || 
             notification.recipientId === userType + 's' || 
             notification.recipientId === userId;
    }
    return true;
  });

  const renderNotificationItem = ({ item }) => (
    <View style={[
      styles.notificationItem,
      item.senderId === userId && styles.myNotification
    ]}>
      <View style={styles.notificationHeader}>
        <Text style={styles.senderText}>{item.sender}</Text>
        <Text style={styles.recipientText}>To: {item.recipient}</Text>
      </View>
      <Text style={styles.notificationText}>{item.text}</Text>
      <Text style={styles.timeText}>{item.time}</Text>
    </View>
  );

  const renderRecipientItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.recipientItem}
      onPress={() => {
        setSelectedRecipient(item);
        setShowRecipientModal(false);
      }}
    >
      <Text style={styles.recipientName}>{item.name}</Text>
      <Text style={styles.recipientType}>{item.type}</Text>
    </TouchableOpacity>
  );

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <Text style={styles.header}>School Notification System</Text>
      
      {/* Filter buttons */}
      <View style={styles.filterContainer}>
        <TouchableOpacity 
          style={[styles.filterButton, filter === 'all' && styles.activeFilter]}
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.filterText, filter === 'all' && styles.activeFilterText]}>All</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.filterButton, filter === 'sent' && styles.activeFilter]}
          onPress={() => setFilter('sent')}
        >
          <Text style={[styles.filterText, filter === 'sent' && styles.activeFilterText]}>Sent</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.filterButton, filter === 'received' && styles.activeFilter]}
          onPress={() => setFilter('received')}
        >
          <Text style={[styles.filterText, filter === 'received' && styles.activeFilterText]}>Received</Text>
        </TouchableOpacity>
      </View>
      
      {/* Notification input (only for admin and teachers) */}
      {(userType === 'admin' || userType === 'teacher') && (
        <View style={styles.inputContainer}>
          <TouchableOpacity 
            style={styles.recipientSelector}
            onPress={() => setShowRecipientModal(true)}
          >
            <Text style={selectedRecipient ? styles.recipientSelected : styles.recipientPlaceholder}>
              {selectedRecipient ? `To: ${selectedRecipient.name}` : 'Select Recipient'}
            </Text>
          </TouchableOpacity>

          <TextInput
            style={styles.input}
            placeholder="Type your notification here..."
            value={notificationText}
            onChangeText={setNotificationText}
            multiline
            numberOfLines={4}
          />
          
          <TouchableOpacity 
            style={styles.sendButton} 
            onPress={handleSendNotification}
          >
            <Text style={styles.sendButtonText}>Send Notification</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Notifications list */}
      {filteredNotifications.length > 0 ? (
        <FlatList
          data={filteredNotifications}
          renderItem={renderNotificationItem}
          keyExtractor={(item) => item.id}
          style={styles.list}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No notifications found</Text>
        </View>
      )}

      {/* Recipient Selection Modal */}
      <Modal
        visible={showRecipientModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowRecipientModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Recipient</Text>
            <FlatList
              data={filteredRecipients}
              renderItem={renderRecipientItem}
              keyExtractor={(item) => item.id}
            />
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setShowRecipientModal(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#2c3e50',
    textAlign: 'center',
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 15,
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    backgroundColor: '#ecf0f1',
  },
  activeFilter: {
    backgroundColor: '#3498db',
  },
  filterText: {
    color: '#7f8c8d',
  },
  activeFilterText: {
    color: 'white',
    fontWeight: 'bold',
  },
  inputContainer: {
    marginBottom: 20,
  },
  recipientSelector: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  recipientPlaceholder: {
    color: '#95a5a6',
  },
  recipientSelected: {
    color: '#2c3e50',
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    minHeight: 100,
    textAlignVertical: 'top',
  },
  sendButton: {
    backgroundColor: '#3498db',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#95a5a6',
  },
  notificationItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#3498db',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  myNotification: {
    borderLeftColor: '#2ecc71',
    backgroundColor: '#f8f9fa',
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  senderText: {
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  recipientText: {
    color: '#7f8c8d',
    fontSize: 12,
  },
  notificationText: {
    fontSize: 16,
    marginBottom: 8,
    color: '#34495e',
  },
  timeText: {
    fontSize: 12,
    color: '#7f8c8d',
    textAlign: 'right',
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 10,
    padding: 15,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#2c3e50',
  },
  recipientItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  recipientName: {
    fontSize: 16,
    color: '#2c3e50',
  },
  recipientType: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 2,
  },
  closeButton: {
    marginTop: 15,
    padding: 10,
    backgroundColor: '#e74c3c',
    borderRadius: 5,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default Hnotification;
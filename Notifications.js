import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Modal, Button } from 'react-native';

const Notifications = () => {
  // Sample user data (in a real app, this would come from your backend)
  const [users, setUsers] = useState([
    { id: '1', name: 'John Doe', role: 'student', class: '10A' },
    { id: '2', name: 'Jane Smith', role: 'student', class: '10B' },
    { id: '3', name: 'Robert Johnson', role: 'parent', student: 'John Doe' },
    { id: '4', name: 'Sarah Williams', role: 'parent', student: 'Jane Smith' },
    { id: '5', name: 'Mr. Sharma', role: 'teacher', subject: 'Mathematics' },
    { id: '6', name: 'Ms. Gupta', role: 'teacher', subject: 'Science' },
    { id: '7', name: 'Principal Patel', role: 'head' },
  ]);

  const [notifications, setNotifications] = useState([
    { id: '1', title: 'PTM Reminder', message: 'Parent-teacher meeting on Friday', sender: 'Principal Patel', date: '2023-05-15', recipients: ['parent'] },
    { id: '2', title: 'Homework', message: 'Complete chapter 5 exercises', sender: 'Mr. Sharma', date: '2023-05-14', recipients: ['student'] },
  ]);

  const [newNotification, setNewNotification] = useState({
    title: '',
    message: '',
    recipients: [],
  });

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedClass, setSelectedClass] = useState('all');

  const sendNotification = () => {
    const sender = 'Current User'; // In real app, get from auth context
    const date = new Date().toISOString().split('T')[0];
    
    let recipientRoles = [];
    if (selectedRole === 'all') {
      recipientRoles = ['student', 'parent', 'teacher', 'head'];
    } else {
      recipientRoles = [selectedRole];
    }

    const newNotif = {
      id: (notifications.length + 1).toString(),
      title: newNotification.title,
      message: newNotification.message,
      sender,
      date,
      recipients: recipientRoles,
      class: selectedClass !== 'all' ? selectedClass : null,
    };

    setNotifications([newNotif, ...notifications]);
    setNewNotification({ title: '', message: '', recipients: [] });
    setModalVisible(false);
  };

  const filteredNotifications = (role) => {
    // In a real app, filter based on actual user role and class
    return notifications.filter(notif => 
      notif.recipients.includes(role) || 
      (role === 'student' && notif.recipients.includes('parent'))
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>School Notifications</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.addButtonText}>+ New</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity 
          style={[styles.tab, selectedRole === 'all' && styles.activeTab]}
          onPress={() => setSelectedRole('all')}
        >
          <Text>All</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, selectedRole === 'student' && styles.activeTab]}
          onPress={() => setSelectedRole('student')}
        >
          <Text>Students</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, selectedRole === 'parent' && styles.activeTab]}
          onPress={() => setSelectedRole('parent')}
        >
          <Text>Parents</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, selectedRole === 'teacher' && styles.activeTab]}
          onPress={() => setSelectedRole('teacher')}
        >
          <Text>Teachers</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={selectedRole === 'all' ? notifications : filteredNotifications(selectedRole)}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.notificationCard}>
            <Text style={styles.notificationTitle}>{item.title}</Text>
            <Text style={styles.notificationMessage}>{item.message}</Text>
            <View style={styles.notificationMeta}>
              <Text style={styles.notificationSender}>From: {item.sender}</Text>
              <Text style={styles.notificationDate}>{item.date}</Text>
            </View>
            {item.class && <Text style={styles.notificationClass}>Class: {item.class}</Text>}
          </View>
        )}
      />

      {/* New Notification Modal */}
      <Modal
        animationType="slide"
        transparent={false}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Create New Notification</Text>
          
          <TextInput
            style={styles.input}
            placeholder="Title"
            value={newNotification.title}
            onChangeText={(text) => setNewNotification({...newNotification, title: text})}
          />
          
          <TextInput
            style={[styles.input, styles.messageInput]}
            placeholder="Message"
            multiline
            numberOfLines={4}
            value={newNotification.message}
            onChangeText={(text) => setNewNotification({...newNotification, message: text})}
          />
          
          <Text style={styles.sectionTitle}>Send To:</Text>
          <View style={styles.recipientOptions}>
            <TouchableOpacity 
              style={[styles.roleButton, selectedRole === 'all' && styles.selectedRole]}
              onPress={() => setSelectedRole('all')}
            >
              <Text>Everyone</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.roleButton, selectedRole === 'student' && styles.selectedRole]}
              onPress={() => setSelectedRole('student')}
            >
              <Text>Students</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.roleButton, selectedRole === 'parent' && styles.selectedRole]}
              onPress={() => setSelectedRole('parent')}
            >
              <Text>Parents</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.roleButton, selectedRole === 'teacher' && styles.selectedRole]}
              onPress={() => setSelectedRole('teacher')}
            >
              <Text>Teachers</Text>
            </TouchableOpacity>
          </View>
          
          <Text style={styles.sectionTitle}>Class (optional):</Text>
          <View style={styles.classOptions}>
            <TouchableOpacity 
              style={[styles.classButton, selectedClass === 'all' && styles.selectedClass]}
              onPress={() => setSelectedClass('all')}
            >
              <Text>All Classes</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.classButton, selectedClass === '10A' && styles.selectedClass]}
              onPress={() => setSelectedClass('10A')}
            >
              <Text>10A</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.classButton, selectedClass === '10B' && styles.selectedClass]}
              onPress={() => setSelectedClass('10B')}
            >
              <Text>10B</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.modalButtons}>
            <Button title="Cancel" onPress={() => setModalVisible(false)} />
            <Button title="Send" onPress={sendNotification} />
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#3498db',
  },
  headerText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: '#2ecc71',
    padding: 8,
    borderRadius: 5,
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  tabs: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10,
    backgroundColor: '#ecf0f1',
  },
  tab: {
    padding: 10,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#3498db',
  },
  notificationCard: {
    backgroundColor: 'white',
    padding: 15,
    margin: 10,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  notificationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  notificationMessage: {
    fontSize: 16,
    marginBottom: 10,
    color: '#555',
  },
  notificationMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  notificationSender: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  notificationDate: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  notificationClass: {
    fontSize: 14,
    color: '#3498db',
    fontStyle: 'italic',
  },
  modalContainer: {
    flex: 1,
    padding: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    marginBottom: 15,
    borderRadius: 5,
  },
  messageInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 10,
  },
  recipientOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  roleButton: {
    padding: 10,
    marginRight: 10,
    marginBottom: 10,
    backgroundColor: '#ecf0f1',
    borderRadius: 5,
  },
  selectedRole: {
    backgroundColor: '#3498db',
    color: 'white',
  },
  classOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  classButton: {
    padding: 10,
    marginRight: 10,
    marginBottom: 10,
    backgroundColor: '#ecf0f1',
    borderRadius: 5,
  },
  selectedClass: {
    backgroundColor: '#2ecc71',
    color: 'white',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
});

export default Notifications;
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  Platform,
  StatusBar
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import firestore from '@react-native-firebase/firestore';
import { CheckBox } from 'react-native-elements';

const ComposeNotification = ({ navigation }) => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [isImportant, setIsImportant] = useState(false);
  const [sending, setSending] = useState(false);
  const [recipients, setRecipients] = useState({
    teachers: false,
    students: false,
    parents: false,
  });

  const handleSend = async () => {
    if (!title.trim() || !message.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (!recipients.teachers && !recipients.students && !recipients.parents) {
      Alert.alert('Error', 'Please select at least one recipient group');
      return;
    }

    setSending(true);

    try {
      const selectedRecipients = [];
      if (recipients.teachers) selectedRecipients.push('Teachers');
      if (recipients.students) selectedRecipients.push('Students');
      if (recipients.parents) selectedRecipients.push('Parents');

      await firestore().collection('notifications').add({
        title,
        message,
        important: isImportant,
        recipients: selectedRecipients,
        createdAt: firestore.FieldValue.serverTimestamp(),
      });

      Alert.alert('Success', 'Notification sent successfully');
      navigation.goBack();
    } catch (error) {
      console.error('Error sending notification:', error);
      Alert.alert('Error', 'Failed to send notification');
    } finally {
      setSending(false);
    }
  };

  const toggleRecipient = (key) => {
    setRecipients(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#2c3e50" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Notification</Text>
        <TouchableOpacity onPress={handleSend} disabled={sending}>
          <Text style={styles.sendButtonText}>
            {sending ? 'Sending...' : 'Send'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.label}>Title</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter notification title"
          value={title}
          onChangeText={setTitle}
          maxLength={100}
        />

        <Text style={styles.label}>Message</Text>
        <TextInput
          style={[styles.input, styles.messageInput]}
          placeholder="Enter notification message"
          value={message}
          onChangeText={setMessage}
          multiline
          numberOfLines={4}
          maxLength={500}
        />

        <View style={styles.importantContainer}>
          <CheckBox
            title="Mark as important"
            checked={isImportant}
            onPress={() => setIsImportant(!isImportant)}
            containerStyle={styles.checkboxContainer}
            textStyle={styles.checkboxText}
            checkedColor="#e74c3c"
          />
        </View>

        <View style={styles.recipientsContainer}>
          <Text style={styles.recipientsTitle}>Send to:</Text>
          
          <CheckBox
            title="Teachers"
            checked={recipients.teachers}
            onPress={() => toggleRecipient('teachers')}
            containerStyle={styles.checkboxContainer}
            textStyle={styles.checkboxText}
            checkedColor="#3498db"
          />
          
          <CheckBox
            title="Students"
            checked={recipients.students}
            onPress={() => toggleRecipient('students')}
            containerStyle={styles.checkboxContainer}
            textStyle={styles.checkboxText}
            checkedColor="#3498db"
          />
          
          <CheckBox
            title="Parents"
            checked={recipients.parents}
            onPress={() => toggleRecipient('parents')}
            containerStyle={styles.checkboxContainer}
            textStyle={styles.checkboxText}
            checkedColor="#3498db"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
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
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: 'white',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
  },
  sendButtonText: {
    color: '#3498db',
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    color: '#2c3e50',
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  messageInput: {
    height: 120,
    textAlignVertical: 'top',
  },
  importantContainer: {
    marginBottom: 20,
  },
  recipientsContainer: {
    marginBottom: 20,
  },
  recipientsTitle: {
    fontSize: 16,
    color: '#2c3e50',
    marginBottom: 10,
    fontWeight: '500',
  },
  checkboxContainer: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    padding: 0,
    marginLeft: 0,
    marginBottom: 5,
  },
  checkboxText: {
    fontWeight: 'normal',
    color: '#2c3e50',
  },
});

export default ComposeNotification;
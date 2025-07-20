import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Image,
  Alert,
  ActivityIndicator,
  PermissionsAndroid,
  Linking,
  ScrollView,
  Dimensions,
  Modal
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Icon5 from 'react-native-vector-icons/FontAwesome5';
import CryptoJS from 'crypto-js';
import DocumentPicker from 'react-native-document-picker';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import RNFS from 'react-native-fs';

// Constants
const { width, height } = Dimensions.get('window');
const SECRET_KEY = 'your-secret-key-1234567890';
const MAX_MESSAGE_LENGTH = 500;
const audioRecorderPlayer = new AudioRecorderPlayer();

// Sample data
const contacts = [
  {
    id: '1',
    name: 'Mrs. Johnson',
    role: 'Class Teacher - Grade 5',
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    phone: '1234567890',
    email: 'johnson@school.edu',
    subjects: ['English', 'Social Studies'],
    availability: 'Mon-Fri, 8:00 AM - 3:00 PM',
    preferredContact: ['sms', 'messenger'] // Added preferred contact methods
  },
  {
    id: '2',
    name: 'Mr. Smith',
    role: 'Math Teacher',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    phone: '9876543210',
    email: 'smith@school.edu',
    subjects: ['Mathematics', 'Physics'],
    availability: 'Mon-Thu, 9:00 AM - 4:00 PM',
    preferredContact: ['call', 'messenger']
  },
  {
    id: '3',
    name: 'Ms. Davis',
    role: 'Science Teacher',
    avatar: 'https://randomuser.me/api/portraits/women/68.jpg',
    phone: '4561237890',
    email: 'davis@school.edu',
    subjects: ['Biology', 'Chemistry'],
    availability: 'Mon-Fri, 8:30 AM - 3:30 PM',
    preferredContact: ['email', 'messenger']
  }
];

const Messages = () => {
  // State management
  const [viewMode, setViewMode] = useState('contacts');
  const [activeContact, setActiveContact] = useState(null);
  const [messages, setMessages] = useState({});
  const [message, setMessage] = useState('');
  const [isEncrypted, setIsEncrypted] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordTime, setRecordTime] = useState('00:00');
  const [showContactOptions, setShowContactOptions] = useState(false);
  const [selectedContactMethod, setSelectedContactMethod] = useState('messenger');
  
  // Refs
  const flatListRef = useRef(null);
  const recordTimeRef = useRef(null);
  const inputRef = useRef(null);

  // Initialize messages
  useEffect(() => {
    const initialMessages = {};
    contacts.forEach(contact => {
      initialMessages[contact.id] = generateSampleMessages(contact);
    });
    setMessages(initialMessages);
  }, []);

  // Helper functions
  const generateSampleMessages = (contact) => [
    {
      id: '1' + contact.id,
      text: `Hello there! How is your child doing in my class?`,
      sender: 'teacher',
      time: '10:30 AM',
      isEncrypted: false,
      type: 'text'
    },
    {
      id: '2' + contact.id,
      text: `They're doing well, thank you for asking!`,
      sender: 'parent',
      time: '10:32 AM',
      isEncrypted: true,
      type: 'text'
    },
    {
      id: '3' + contact.id,
      text: `Great to hear! We have a parent-teacher meeting scheduled for next week.`,
      sender: 'teacher',
      time: '10:33 AM',
      isEncrypted: true,
      type: 'text'
    },
  ];

  // Encryption utilities
  const encryptMessage = useCallback((text) => {
    if (!isEncrypted || !text) return text;
    try {
      return CryptoJS.AES.encrypt(text, SECRET_KEY).toString();
    } catch (error) {
      console.error('Encryption error:', error);
      return text;
    }
  }, [isEncrypted]);

  const decryptMessage = useCallback((ciphertext) => {
    if (!ciphertext || !isEncrypted) return ciphertext;
    try {
      const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
      return bytes.toString(CryptoJS.enc.Utf8) || ciphertext;
    } catch (e) {
      console.warn('Decryption failed:', e);
      return ciphertext;
    }
  }, [isEncrypted]);

  // Message handling
  const handleSend = useCallback(async () => {
    if (!message.trim() || isSending || message.length > MAX_MESSAGE_LENGTH) return;

    setIsSending(true);
    
    try {
      const newMessage = {
        id: Date.now().toString(),
        text: encryptMessage(message),
        sender: 'parent',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isEncrypted,
        status: 'sent',
        type: 'text',
        contactMethod: selectedContactMethod
      };

      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setMessages(prev => ({
        ...prev,
        [activeContact.id]: [...(prev[activeContact.id] || []), newMessage]
      }));
      setMessage('');
      
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
      
      // If sending via SMS, actually send the SMS
      if (selectedContactMethod === 'sms') {
        handleSendSMS();
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to send message');
      console.error('Send error:', error);
    } finally {
      setIsSending(false);
    }
  }, [message, isEncrypted, isSending, activeContact, encryptMessage, selectedContactMethod]);

  const handleSendSMS = useCallback(async () => {
    try {
      if (!activeContact.phone) {
        Alert.alert('Error', 'No phone number available for this contact');
        return;
      }

      const url = `sms:${activeContact.phone}?body=${encodeURIComponent(message)}`;
      const canOpen = await Linking.canOpenURL(url);
      
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Error', 'Could not open SMS app');
      }
    } catch (error) {
      console.error('Error sending SMS:', error);
      Alert.alert('Error', 'Failed to send SMS');
    }
  }, [message, activeContact]);

  // File attachment
  const handleAttachment = useCallback(async () => {
    try {
      const res = await DocumentPicker.pick({
        type: [DocumentPicker.types.allFiles],
      });

      const newMessage = {
        id: Date.now().toString(),
        text: res.name,
        sender: 'parent',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isEncrypted: false,
        status: 'sent',
        type: 'file',
        fileUri: res.uri,
        fileType: res.type,
        contactMethod: selectedContactMethod
      };

      setMessages(prev => ({
        ...prev,
        [activeContact.id]: [...(prev[activeContact.id] || []), newMessage]
      }));
      
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    } catch (err) {
      if (!DocumentPicker.isCancel(err)) {
        Alert.alert('Error', 'Failed to attach file');
        console.error('Attachment error:', err);
      }
    }
  }, [activeContact, selectedContactMethod]);

  // Audio recording
  const startRecording = useCallback(async () => {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          {
            title: 'Microphone Permission',
            message: 'App needs access to your microphone to record audio',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) return;
      }

      const audioPath = `${RNFS.DocumentDirectoryPath}/voice_message_${Date.now()}.mp3`;
      await audioRecorderPlayer.startRecorder(audioPath);
      setIsRecording(true);

      let seconds = 0;
      recordTimeRef.current = setInterval(() => {
        seconds++;
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        setRecordTime(
          `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
        );
      }, 1000);
    } catch (error) {
      console.error('Recording error:', error);
      Alert.alert('Error', 'Failed to start recording');
    }
  }, []);

  const stopRecording = useCallback(async () => {
    try {
      const audioPath = await audioRecorderPlayer.stopRecorder();
      clearInterval(recordTimeRef.current);
      setIsRecording(false);
      setRecordTime('00:00');

      const newMessage = {
        id: Date.now().toString(),
        text: 'Voice message',
        sender: 'parent',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isEncrypted: false,
        status: 'sent',
        type: 'audio',
        audioUri: audioPath,
        duration: recordTime,
        contactMethod: selectedContactMethod
      };

      setMessages(prev => ({
        ...prev,
        [activeContact.id]: [...(prev[activeContact.id] || []), newMessage]
      }));
      
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    } catch (error) {
      console.error('Stop recording error:', error);
      Alert.alert('Error', 'Failed to stop recording');
    }
  }, [activeContact, recordTime, selectedContactMethod]);

  const playAudio = useCallback(async (audioUri) => {
    try {
      await audioRecorderPlayer.startPlayer(audioUri);
      audioRecorderPlayer.addPlayBackListener((e) => {
        if (e.current_position === e.duration) {
          audioRecorderPlayer.stopPlayer();
          audioRecorderPlayer.removePlayBackListener();
        }
      });
    } catch (error) {
      console.error('Play audio error:', error);
      Alert.alert('Error', 'Failed to play audio');
    }
  }, []);

  // Contact method selection
  const selectContactMethod = (method) => {
    setSelectedContactMethod(method);
    setShowContactOptions(false);
  };

  // UI Components
  const MessageItem = useCallback(({ item }) => {
    const isMyMessage = item.sender === 'parent';
    const decryptedText = item.isEncrypted ? decryptMessage(item.text) : item.text;
    
    return (
      <View style={[styles.messageContainer, isMyMessage ? styles.myMessage : styles.otherMessage]}>
        {!isMyMessage && (
          <Image source={{ uri: activeContact.avatar }} style={styles.avatarSmall} />
        )}
        
        <View style={[styles.messageBubble, isMyMessage ? styles.myBubble : styles.otherBubble]}>
          {item.type === 'text' ? (
            <Text style={styles.messageText}>{decryptedText}</Text>
          ) : item.type === 'file' ? (
            <TouchableOpacity style={styles.fileContainer} onPress={() => Linking.openURL(item.fileUri)}>
              <Icon name="insert-drive-file" size={24} color="#075E54" />
              <Text style={styles.fileName} numberOfLines={1}>{item.text}</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.audioContainer} onPress={() => playAudio(item.audioUri)}>
              <Icon5 name="play" size={16} color="#075E54" />
              <Text style={styles.audioDuration}>{item.duration}</Text>
              <Text style={styles.audioLabel}>Voice message</Text>
            </TouchableOpacity>
          )}
          
          <View style={styles.messageMeta}>
            <Text style={styles.messageTime}>{item.time}</Text>
            {item.contactMethod === 'sms' && <Icon name="sms" size={12} color="#666" style={styles.methodIcon} />}
            {item.contactMethod === 'messenger' && <Icon name="chat" size={12} color="#666" style={styles.methodIcon} />}
            {item.isEncrypted && <Icon name="lock" size={12} color="#666" style={styles.lockIcon} />}
            {isMyMessage && (
              <Icon 
                name={item.status === 'sent' ? 'done-all' : 'access-time'} 
                size={12} 
                color={item.status === 'sent' ? '#4CAF50' : '#666'} 
                style={styles.statusIcon} 
              />
            )}
          </View>
        </View>
      </View>
    );
  }, [activeContact, decryptMessage, playAudio]);

  const ContactItem = useCallback(({ item }) => (
    <TouchableOpacity
      style={[styles.contactItem, activeContact?.id === item.id && styles.activeContact]}
      onPress={() => {
        setActiveContact(item);
        setViewMode('profile');
        setSelectedContactMethod(item.preferredContact.includes('messenger') ? 'messenger' : item.preferredContact[0]);
      }}
    >
      <Image source={{ uri: item.avatar }} style={styles.contactAvatar} />
      <View style={styles.contactInfo}>
        <Text style={styles.contactName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.contactRole} numberOfLines={1}>{item.role}</Text>
        <Text style={styles.contactLastMessage} numberOfLines={1}>
          {messages[item.id]?.[0]?.text || 'No messages yet'}
        </Text>
      </View>
      {messages[item.id]?.some(m => !m.status || m.status === 'unread') && (
        <View style={styles.unreadBadge} />
      )}
    </TouchableOpacity>
  ), [activeContact, messages]);

  const ProfileSection = () => (
    <ScrollView style={styles.profileContainer}>
      <View style={styles.profileHeader}>
        <Image source={{ uri: activeContact.avatar }} style={styles.profileAvatar} />
        <Text style={styles.profileName}>{activeContact.name}</Text>
        <Text style={styles.profileRole}>{activeContact.role}</Text>
      </View>

      <View style={styles.profileSection}>
        <Text style={styles.sectionTitle}>Contact Information</Text>
        <ContactInfoItem icon="phone" text={activeContact.phone} />
        <ContactInfoItem icon="email" text={activeContact.email} />
        <ContactInfoItem icon="schedule" text={activeContact.availability} />
      </View>

      <View style={styles.profileSection}>
        <Text style={styles.sectionTitle}>Subjects Taught</Text>
        {activeContact.subjects.map((subject, index) => (
          <ContactInfoItem key={index} icon="book" text={subject} />
        ))}
      </View>

      <View style={styles.profileSection}>
        <Text style={styles.sectionTitle}>Preferred Contact Methods</Text>
        {activeContact.preferredContact.map((method, index) => (
          <ContactInfoItem 
            key={index} 
            icon={
              method === 'sms' ? 'sms' : 
              method === 'call' ? 'call' : 
              method === 'email' ? 'email' : 'chat'
            } 
            text={
              method === 'sms' ? 'SMS' : 
              method === 'call' ? 'Phone Call' : 
              method === 'email' ? 'Email' : 'In-App Messenger'
            } 
          />
        ))}
      </View>

      <View style={styles.buttonGroup}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.messageButton]}
          onPress={() => {
            setSelectedContactMethod(
              activeContact.preferredContact.includes('messenger') ? 
              'messenger' : activeContact.preferredContact[0]
            );
            setViewMode('messages');
          }}
        >
          <Icon name="chat" size={20} color="white" />
          <Text style={styles.actionButtonText}>Send Message</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.callButton]}
          onPress={() => Linking.openURL(`tel:${activeContact.phone}`)}
          disabled={!activeContact.phone || !activeContact.preferredContact.includes('call')}
        >
          <Icon name="call" size={20} color="white" />
          <Text style={styles.actionButtonText}>Call Teacher</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  const ContactInfoItem = ({ icon, text }) => (
    <View style={styles.infoItem}>
      <Icon name={icon} size={20} color="#075E54" style={styles.infoIcon} />
      <Text style={styles.infoText}>{text}</Text>
    </View>
  );

  const ContactMethodModal = () => (
    <Modal
      transparent={true}
      visible={showContactOptions}
      animationType="slide"
      onRequestClose={() => setShowContactOptions(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Select Contact Method</Text>
          
          {activeContact.preferredContact.includes('messenger') && (
            <TouchableOpacity 
              style={styles.contactMethodOption}
              onPress={() => selectContactMethod('messenger')}
            >
              <Icon name="chat" size={24} color="#075E54" />
              <Text style={styles.contactMethodText}>In-App Messenger</Text>
            </TouchableOpacity>
          )}
          
          {activeContact.preferredContact.includes('sms') && (
            <TouchableOpacity 
              style={styles.contactMethodOption}
              onPress={() => selectContactMethod('sms')}
            >
              <Icon name="sms" size={24} color="#075E54" />
              <Text style={styles.contactMethodText}>SMS</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity 
            style={styles.cancelButton}
            onPress={() => setShowContactOptions(false)}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const MessagesSection = () => (
    <>
      <View style={styles.messagesHeader}>
        <TouchableOpacity style={styles.backButton} onPress={() => setViewMode('profile')}>
          <Icon name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <Image source={{ uri: activeContact.avatar }} style={styles.avatar} />
          <View>
            <Text style={styles.headerTitle}>{activeContact.name}</Text>
            <Text style={styles.headerSubtitle}>{activeContact.role}</Text>
          </View>
        </View>
        
        <View style={styles.headerRight}>
          <TouchableOpacity onPress={toggleEncryption}>
            <Icon 
              name={isEncrypted ? "lock" : "lock-open"} 
              size={24} 
              color="white" 
              style={styles.encryptionIcon}
            />
          </TouchableOpacity>
          
          <TouchableOpacity onPress={() => setShowContactOptions(true)}>
            <Icon 
              name={
                selectedContactMethod === 'sms' ? 'sms' : 
                selectedContactMethod === 'call' ? 'call' : 
                selectedContactMethod === 'email' ? 'email' : 'chat'
              } 
              size={24} 
              color="white" 
            />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages[activeContact.id] || []}
        renderItem={MessageItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.messagesList}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
        initialNumToRender={10}
        maxToRenderPerBatch={5}
        windowSize={7}
      />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
      >
        <View style={styles.inputContainer}>
          <TouchableOpacity 
            style={styles.attachmentButton}
            onPress={handleAttachment}
            disabled={isRecording || selectedContactMethod !== 'messenger'}
          >
            <Icon 
              name="attachment" 
              size={24} 
              color={
                isRecording || selectedContactMethod !== 'messenger' ? '#aaa' : '#075E54'
              } 
            />
          </TouchableOpacity>
          
          {isRecording ? (
            <View style={styles.recordingContainer}>
              <Icon name="mic" size={24} color="#FF0000" />
              <Text style={styles.recordingTime}>{recordTime}</Text>
              <TouchableOpacity 
                style={styles.stopRecordingButton}
                onPress={stopRecording}
              >
                <Text style={styles.stopRecordingText}>Stop</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <TouchableOpacity 
                style={styles.voiceButton}
                onPress={startRecording}
                disabled={isSending || selectedContactMethod !== 'messenger'}
              >
                <Icon 
                  name="mic" 
                  size={24} 
                  color={
                    isSending || selectedContactMethod !== 'messenger' ? '#aaa' : '#075E54'
                  } 
                />
              </TouchableOpacity>
              
              <TextInput
                ref={inputRef}
                style={styles.input}
                value={message}
                onChangeText={setMessage}
                placeholder={
                  selectedContactMethod === 'sms' ? 'Type SMS message...' : 
                  'Type a message...'
                }
                placeholderTextColor="#999"
                multiline
                onSubmitEditing={handleSend}
                editable={!isSending && !isRecording}
                maxLength={MAX_MESSAGE_LENGTH}
                blurOnSubmit={false}
              />
            </>
          )}
          
          <View style={styles.sendOptions}>
            <TouchableOpacity 
              style={[
                styles.sendButton,
                (!message.trim() && !isRecording || isSending) && styles.sendButtonDisabled
              ]}
              onPress={isRecording ? stopRecording : handleSend}
              disabled={(!message.trim() && !isRecording) || isSending}
            >
              {isSending ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Icon 
                  name={isRecording ? "stop" : "send"} 
                  size={20} 
                  color="white" 
                />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
      
      <ContactMethodModal />
    </>
  );

  const toggleEncryption = useCallback(() => {
    Alert.alert(
      'Encryption',
      `Messages will now be ${isEncrypted ? 'unencrypted' : 'encrypted'}`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Confirm', onPress: () => setIsEncrypted(prev => !prev) }
      ]
    );
  }, [isEncrypted]);

  // Main render
  return (
    <SafeAreaView style={styles.container}>
      {/* Contacts sidebar */}
      <View style={styles.contactsContainer}>
        <Text style={styles.contactsTitle}>Teachers</Text>
        <FlatList
          data={contacts}
          renderItem={ContactItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.contactsList}
          showsVerticalScrollIndicator={false}
        />
      </View>

      {/* Main content area */}
      <View style={styles.mainContainer}>
        {viewMode === 'contacts' && (
          <View style={styles.emptyStateContainer}>
            <Icon name="people" size={60} color="#075E54" style={styles.emptyStateIcon} />
            <Text style={styles.emptyStateTitle}>Select a Teacher</Text>
            <Text style={styles.emptyStateText}>
              Choose a teacher from the list to view their profile and messages
            </Text>
          </View>
        )}
        
        {viewMode === 'profile' && activeContact && <ProfileSection />}
        {viewMode === 'messages' && activeContact && <MessagesSection />}
      </View>
    </SafeAreaView>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e5ddd5',
    flexDirection: 'row',
  },
  contactsContainer: {
    width: width * 0.35,
    maxWidth: 250,
    backgroundColor: '#f0f0f0',
    borderRightWidth: 1,
    borderRightColor: '#ddd',
  },
  contactsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    padding: 15,
    paddingBottom: 10,
    color: '#075E54',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  contactsList: {
    paddingTop: 5,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    position: 'relative',
  },
  activeContact: {
    backgroundColor: '#e0e0e0',
  },
  contactAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  contactRole: {
    fontSize: 13,
    color: '#666',
    marginBottom: 2,
  },
  contactLastMessage: {
    fontSize: 12,
    color: '#999',
  },
  unreadBadge: {
    position: 'absolute',
    right: 12,
    top: 12,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#075E54',
  },
  mainContainer: {
    flex: 1,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  emptyStateIcon: {
    marginBottom: 20,
    opacity: 0.6,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#075E54',
    marginBottom: 10,
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  messagesHeader: {
    backgroundColor: '#075E54',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    paddingTop: Platform.OS === 'android' ? 35 : 15,
    borderBottomWidth: 1,
    borderBottomColor: '#054D44',
  },
  backButton: {
    marginRight: 10,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  encryptionIcon: {
    marginRight: 15,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 15,
    borderWidth: 2,
    borderColor: 'white',
  },
  avatarSmall: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
    marginTop: 2,
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
  },
  profileContainer: {
    flex: 1,
    padding: 20,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  profileAvatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 15,
    borderWidth: 3,
    borderColor: '#075E54',
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
    textAlign: 'center',
  },
  profileRole: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  profileSection: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#075E54',
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingBottom: 8,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 5,
  },
  infoIcon: {
    marginRight: 12,
    width: 24,
    textAlign: 'center',
  },
  infoText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 8,
    marginHorizontal: 5,
  },
  messageButton: {
    backgroundColor: '#075E54',
  },
  callButton: {
    backgroundColor: '#4CAF50',
  },
  actionButtonDisabled: {
    opacity: 0.6,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  messagesList: {
    padding: 15,
    paddingBottom: 5,
  },
  messageContainer: {
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  myMessage: {
    justifyContent: 'flex-end',
  },
  otherMessage: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  myBubble: {
    backgroundColor: '#DCF8C6',
    borderBottomRightRadius: 0,
  },
  otherBubble: {
    backgroundColor: 'white',
    borderBottomLeftRadius: 0,
  },
  messageText: {
    fontSize: 16,
    color: 'black',
    lineHeight: 22,
  },
  fileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: 'rgba(7, 94, 84, 0.1)',
    borderRadius: 8,
    marginBottom: 5,
  },
  fileName: {
    marginLeft: 8,
    color: '#075E54',
    fontSize: 14,
    flexShrink: 1,
  },
  audioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: 'rgba(7, 94, 84, 0.1)',
    borderRadius: 8,
    marginBottom: 5,
  },
  audioDuration: {
    marginLeft: 8,
    color: '#075E54',
    fontSize: 14,
  },
  audioLabel: {
    marginLeft: 8,
    color: '#075E54',
    fontSize: 14,
    fontStyle: 'italic',
  },
  messageMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 5,
  },
  messageTime: {
    fontSize: 11,
    color: '#666',
    marginRight: 4,
  },
  methodIcon: {
    marginHorizontal: 2,
  },
  lockIcon: {
    marginHorizontal: 2,
  },
  statusIcon: {
    marginLeft: 2,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 120,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    paddingHorizontal: 15,
    marginHorizontal: 5,
    color: 'black',
    fontSize: 16,
    paddingTop: 10,
    paddingBottom: 10,
    textAlignVertical: 'center',
  },
  voiceButton: {
    padding: 8,
    marginRight: 5,
  },
  attachmentButton: {
    padding: 8,
  },
  recordingContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    paddingHorizontal: 15,
    marginHorizontal: 5,
    height: 40,
  },
  recordingTime: {
    marginLeft: 8,
    color: '#FF0000',
    fontSize: 14,
  },
  stopRecordingButton: {
    marginLeft: 'auto',
    backgroundColor: '#FF0000',
    borderRadius: 15,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  stopRecordingText: {
    color: 'white',
    fontSize: 12,
  },
  sendOptions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sendButton: {
    backgroundColor: '#075E54',
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.6,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: width * 0.8,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#075E54',
    marginBottom: 20,
    textAlign: 'center',
  },
  contactMethodOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  contactMethodText: {
    fontSize: 16,
    marginLeft: 15,
    color: '#333',
  },
  cancelButton: {
    marginTop: 15,
    padding: 10,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#FF0000',
    fontSize: 16,
  },
});

export default Messages;
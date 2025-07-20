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
  Linking
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Icon5 from 'react-native-vector-icons/FontAwesome5';
import CryptoJS from 'crypto-js';
import DocumentPicker from 'react-native-document-picker';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import RNFS from 'react-native-fs';

// Constants
const SECRET_KEY = 'your-secret-key-1234567890';
const audioRecorderPlayer = new AudioRecorderPlayer();

// Sample contacts data
const contacts = [
  {
    id: '1',
    name: 'Mrs. Johnson',
    role: 'Class Teacher - Grade 5',
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    phone: '1234567890'
  },
  {
    id: '2',
    name: 'Mr. Smith',
    role: 'Math Teacher',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    phone: '9876543210'
  },
  {
    id: '3',
    name: 'Ms. Davis',
    role: 'Science Teacher',
    avatar: 'https://randomuser.me/api/portraits/women/68.jpg',
    phone: '4561237890'
  }
];

const TeacherMessages = () => {
  // State management
  const [activeContact, setActiveContact] = useState(contacts[0]);
  const [messages, setMessages] = useState({});
  const [message, setMessage] = useState('');
  const [isEncrypted, setIsEncrypted] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordTime, setRecordTime] = useState('00:00');
  
  // Refs
  const flatListRef = useRef(null);
  const recordTimeRef = useRef(null);

  // Initialize messages
  useEffect(() => {
    const initialMessages = {};
    
    contacts.forEach(contact => {
      initialMessages[contact.id] = [
        {
          id: '1' + contact.id,
          text: `Hello there! How is your child doing? (${contact.name})`,
          sender: 'teacher',
          time: '10:30 AM',
          isEncrypted: false,
          type: 'text'
        },
        {
          id: '2' + contact.id,
          text: `They are doing well, thank you for asking! (${contact.name})`,
          sender: 'parent',
          time: '10:32 AM',
          isEncrypted: true,
          type: 'text'
        },
        {
          id: '3' + contact.id,
          text: `Great to hear! We have a parent-teacher meeting next week. (${contact.name})`,
          sender: 'teacher',
          time: '10:33 AM',
          isEncrypted: true,
          type: 'text'
        },
      ];
    });
    
    setMessages(initialMessages);
  }, []);

  // Encryption/Decryption functions
  const encryptMessage = useCallback((text) => {
    if (!isEncrypted || !text) return text;
    return CryptoJS.AES.encrypt(text, SECRET_KEY).toString();
  }, [isEncrypted]);

  const decryptMessage = useCallback((ciphertext) => {
    if (!ciphertext || !isEncrypted) return ciphertext;
    try {
      const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
      const decrypted = bytes.toString(CryptoJS.enc.Utf8);
      return decrypted || ciphertext;
    } catch (e) {
      console.warn('Decryption failed:', e);
      return ciphertext;
    }
  }, [isEncrypted]);

  // Message handling
  const handleSend = useCallback(async () => {
    if (!message.trim() || isSending) return;

    setIsSending(true);
    
    try {
      const newMessage = {
        id: Date.now().toString(),
        text: encryptMessage(message),
        sender: 'parent',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isEncrypted,
        status: 'sent',
        type: 'text'
      };

      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setMessages(prev => ({
        ...prev,
        [activeContact.id]: [...(prev[activeContact.id] || []), newMessage]
      }));
      setMessage('');
      
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      Alert.alert('Error', 'Failed to send message');
      console.error('Send error:', error);
    } finally {
      setIsSending(false);
    }
  }, [message, isEncrypted, isSending, activeContact, encryptMessage]);

  const handleSendSMS = async () => {
    try {
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
  };

  // File attachment handling
  const handleAttachment = async () => {
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
        fileType: res.type
      };

      setMessages(prev => ({
        ...prev,
        [activeContact.id]: [...(prev[activeContact.id] || []), newMessage]
      }));
      
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (err) {
      if (!DocumentPicker.isCancel(err)) {
        Alert.alert('Error', 'Failed to attach file');
        console.error('Attachment error:', err);
      }
    }
  };

  // Audio recording functions
  const startRecording = async () => {
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
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          return;
        }
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
  };

  const stopRecording = async () => {
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
        duration: recordTime
      };

      setMessages(prev => ({
        ...prev,
        [activeContact.id]: [...(prev[activeContact.id] || []), newMessage]
      }));
      
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      console.error('Stop recording error:', error);
      Alert.alert('Error', 'Failed to stop recording');
    }
  };

  const playAudio = async (audioUri) => {
    try {
      await audioRecorderPlayer.startPlayer(audioUri);
    } catch (error) {
      console.error('Play audio error:', error);
      Alert.alert('Error', 'Failed to play audio');
    }
  };

  // UI Components
  const renderMessage = useCallback(({ item }) => {
    const isMyMessage = item.sender === 'parent';
    const decryptedText = item.isEncrypted ? decryptMessage(item.text) : item.text;
    const bubbleStyle = isMyMessage ? styles.myBubble : styles.otherBubble;
    const containerStyle = isMyMessage ? styles.myMessage : styles.otherMessage;

    return (
      <View style={[styles.messageContainer, containerStyle]}>
        {!isMyMessage && (
          <Image
            source={{ uri: activeContact.avatar }}
            style={styles.avatarSmall}
          />
        )}
        <View style={[styles.messageBubble, bubbleStyle]}>
          {item.type === 'text' && (
            <Text style={styles.messageText}>{decryptedText}</Text>
          )}
          
          {item.type === 'file' && (
            <TouchableOpacity 
              style={styles.fileContainer}
              onPress={() => Linking.openURL(item.fileUri)}
            >
              <Icon name="insert-drive-file" size={24} color="#075E54" />
              <Text style={styles.fileName} numberOfLines={1}>{item.text}</Text>
            </TouchableOpacity>
          )}
          
          {item.type === 'audio' && (
            <TouchableOpacity 
              style={styles.audioContainer}
              onPress={() => playAudio(item.audioUri)}
            >
              <Icon5 name="play" size={16} color="#075E54" />
              <Text style={styles.audioDuration}>{item.duration}</Text>
              <Text style={styles.audioLabel}>Voice message</Text>
            </TouchableOpacity>
          )}
          
          <View style={styles.messageMeta}>
            <Text style={styles.messageTime}>{item.time}</Text>
            {item.isEncrypted && (
              <Icon name="lock" size={12} color="#666" style={styles.lockIcon} />
            )}
            {isMyMessage && (
              <Icon 
                name={item.status === 'sent' ? 'done' : 'access-time'} 
                size={12} 
                color={item.status === 'sent' ? '#4CAF50' : '#666'} 
                style={styles.statusIcon} 
              />
            )}
          </View>
        </View>
      </View>
    );
  }, [activeContact, decryptMessage]);

  const toggleEncryption = () => {
    Alert.alert(
      'Encryption',
      `Messages will now be ${isEncrypted ? 'unencrypted' : 'encrypted'}`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Confirm', onPress: () => setIsEncrypted(prev => !prev) }
      ]
    );
  };

  const renderContact = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.contactItem,
        activeContact.id === item.id && styles.activeContact
      ]}
      onPress={() => setActiveContact(item)}
    >
      <Image source={{ uri: item.avatar }} style={styles.contactAvatar} />
      <View style={styles.contactInfo}>
        <Text style={styles.contactName}>{item.name}</Text>
        <Text style={styles.contactRole}>{item.role}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Contacts sidebar */}
      <View style={styles.contactsContainer}>
        <FlatList
          data={contacts}
          renderItem={renderContact}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.contactsList}
        />
      </View>

      {/* Chat area */}
      <View style={styles.chatContainer}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Image
              source={{ uri: activeContact.avatar }}
              style={styles.avatar}
            />
            <View>
              <Text style={styles.headerTitle}>{activeContact.name}</Text>
              <Text style={styles.headerSubtitle}>{activeContact.role}</Text>
            </View>
          </View>
          <TouchableOpacity onPress={toggleEncryption}>
            <Icon 
              name={isEncrypted ? "lock" : "lock-open"} 
              size={24} 
              color="white" 
            />
          </TouchableOpacity>
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
        >
          {messages[activeContact.id]?.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No messages yet</Text>
            </View>
          ) : (
            <FlatList
              ref={flatListRef}
              data={messages[activeContact.id] || []}
              renderItem={renderMessage}
              keyExtractor={item => item.id}
              contentContainerStyle={styles.messagesList}
              showsVerticalScrollIndicator={false}
              onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
              onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
            />
          )}

          <View style={styles.inputContainer}>
            <TouchableOpacity 
              style={styles.attachmentButton}
              onPress={handleAttachment}
            >
              <Icon name="attachment" size={24} color="#075E54" />
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
                >
                  <Icon name="mic" size={24} color="#075E54" />
                </TouchableOpacity>
                
                <TextInput
                  style={styles.input}
                  value={message}
                  onChangeText={setMessage}
                  placeholder="Type a message..."
                  placeholderTextColor="#999"
                  multiline
                  onSubmitEditing={handleSend}
                  editable={!isSending}
                />
              </>
            )}
            
            <View style={styles.sendOptions}>
              {message.trim() && !isRecording && (
                <TouchableOpacity 
                  style={styles.smsButton}
                  onPress={handleSendSMS}
                >
                  <Icon name="sms" size={20} color="#075E54" />
                </TouchableOpacity>
              )}
              
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
                  <Icon name={isRecording ? "stop" : "send"} size={20} color="white" />
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
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
    width: '30%',
    backgroundColor: '#f0f0f0',
    borderRightWidth: 1,
    borderRightColor: '#ddd',
  },
  contactsList: {
    paddingTop: 10,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  activeContact: {
    backgroundColor: '#e0e0e0',
  },
  contactAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  contactRole: {
    fontSize: 12,
    color: '#666',
  },
  chatContainer: {
    flex: 1,
  },
  header: {
    backgroundColor: '#075E54',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    paddingTop: Platform.OS === 'android' ? 35 : 15,
    borderBottomWidth: 1,
    borderBottomColor: '#054D44',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
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
    width: 30,
    height: 30,
    borderRadius: 15,
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
  keyboardView: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
  messagesList: {
    padding: 15,
    paddingBottom: 5,
  },
  messageContainer: {
    marginBottom: 10,
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
    maxWidth: '75%',
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
  smsButton: {
    marginRight: 8,
    padding: 8,
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
});

export default TeacherMessages;
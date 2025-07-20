import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import AItuition from './AIScreen';

const AItuition = () => {
  // State management
  const [messages, setMessages] = useState([
    { id: '1', text: 'Hello! How can I help you today?', sender: 'bot' }
  ]);
  const [inputText, setInputText] = useState('');
  const flatListRef = useRef(null);

  // Sample subjects for Pakistani curriculum
  const subjects = [
    { id: 'math', name: 'Mathematics', icon: 'calculator' },
    { id: 'physics', name: 'Physics', icon: 'atom' },
    { id: 'urdu', name: 'Urdu', icon: 'language' },
    { id: 'islamiat', name: 'Islamiat', icon: 'mosque' },
    { id: 'computer', name: 'Computer', icon: 'laptop' },
  ];

  const handleSend = () => {
    if (inputText.trim() === '') return;

    // Add user message
    const newUserMessage = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user'
    };

    setMessages(prev => [...prev, newUserMessage]);
    setInputText('');

    // Here you'll later add the API call to ChatGPT
    // For now, we'll just add a dummy bot response
    setTimeout(() => {
      const botResponse = {
        id: Date.now().toString() + 'b',
        text: "This is where ChatGPT's response will appear when you add the API key",
        sender: 'bot'
      };
      setMessages(prev => [...prev, botResponse]);
    }, 1000);
  };

  const renderMessage = ({ item }) => (
    <View style={[
      styles.messageContainer,
      item.sender === 'user' ? styles.userMessage : styles.botMessage
    ]}>
      <View style={[
        styles.messageBubble,
        item.sender === 'user' ? styles.userBubble : styles.botBubble
      ]}>
        <Text style={styles.messageText}>{item.text}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
        keyboardVerticalOffset={90}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Pak Learning Assistant</Text>
          <Text style={styles.headerSubtitle}>Ask anything about your subjects</Text>
        </View>

        {/* Subjects Horizontal Scroll */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.subjectsContainer}>
          {subjects.map(subject => (
            <TouchableOpacity key={subject.id} style={styles.subjectCard}>
              <FontAwesome name={subject.icon} size={24} color="#6200EE" />
              <Text style={styles.subjectText}>{subject.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Chat Messages */}
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.messagesContainer}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Image
                source={require('./assets/empty-chat.png')} // Add your image
                style={styles.emptyImage}
              />
              <Text style={styles.emptyText}>Start by sending a message</Text>
            </View>
          }
        />

        {/* Input Area */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Type your question..."
            placeholderTextColor="#999"
            multiline
          />
          <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
            <Icon name="send" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff'
  },
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA'
  },
  header: {
    padding: 16,
    backgroundColor: '#6200EE',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center'
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'white',
    textAlign: 'center',
    marginTop: 4
  },
  subjectsContainer: {
    paddingVertical: 12,
    backgroundColor: 'white',
    elevation: 2
  },
  subjectCard: {
    padding: 12,
    marginHorizontal: 8,
    borderRadius: 12,
    backgroundColor: '#F3EDF7',
    alignItems: 'center',
    minWidth: 100
  },
  subjectText: {
    marginTop: 8,
    color: '#6200EE',
    fontWeight: '500'
  },
  messagesContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexGrow: 1
  },
  messageContainer: {
    marginVertical: 8,
    flexDirection: 'row'
  },
  userMessage: {
    justifyContent: 'flex-end'
  },
  botMessage: {
    justifyContent: 'flex-start'
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 12
  },
  userBubble: {
    backgroundColor: '#6200EE',
    borderTopRightRadius: 0
  },
  botBubble: {
    backgroundColor: '#E3F2FD',
    borderTopLeftRadius: 0
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22
  },
  userText: {
    color: 'white'
  },
  botText: {
    color: '#333'
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#eee'
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 48,
    maxHeight: 120,
    backgroundColor: 'white',
    fontSize: 16
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#6200EE',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40
  },
  emptyImage: {
    width: 150,
    height: 150,
    marginBottom: 20
  },
  emptyText: {
    fontSize: 18,
    color: '#6200EE',
    fontWeight: '500'
  }
});

export default AItuition;
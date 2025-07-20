// import libraries
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, FlatList, TextInput, Button } from 'react-native';

// create a component
const AItuition = () => {
   
    // State management
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    // Subjects aligned with Pakistan's curriculum
    const subjects = [
      { id: 'math', name: 'Mathematics', icon: 'calculator' },
      { id: 'physics', name: 'Physics', icon: 'atom' },
      { id: 'chemistry', name: 'Chemistry', icon: 'flask' },
      { id: 'biology', name: 'Biology', icon: 'dna' },
      { id: 'english', name: 'English', icon: 'language' },
      { id: 'urdu', name: 'Urdu', icon: 'quran' },
      { id: 'islamiat', name: 'Islamiat', icon: 'mosque' },
      { id: 'pak_studies', name: 'Pakistan Studies', icon: 'landmark' },
      { id: 'computer', name: 'Computer Science', icon: 'laptop-code' },
    ];
  useEffect(()=>{
    sendMessage()
  },)
    const sendMessage = async () => {
    //   if (!input.trim()) return;
  
    //   const userMessage = { role: 'user', content: input };
    //   const newMessages = [...messages, userMessage];
  
    //   setMessages(newMessages);
    //   setInput('');
  
     try {
    const response = await axios.post('https://api.deepseek.com/v1/chat/completions', {
      model: 'deepseek-chat',
      messages: [{ role: 'user', content: "ibad kn hy" }],
    }, {
      headers: {
        'Authorization': `Bearer sk-4f029c1942ce42dc9c57d19c36c164d3`,
        'Content-Type': 'application/json',
      }
    });

    res.json({ reply: response.data.choices[0].message.content });
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).send('Error contacting DeepSeek API');
  }

    };
    return (
       <View style={styles.container}>
        <FlatList
          data={messages}
          keyExtractor={(_, index) => index.toString()}
          renderItem={({ item }) => (
            <Text style={{ margin: 5, color: item.role === 'user' ? 'blue' : 'green' }}>
              {item.role === 'user' ? 'You' : 'Bot'}: {item.content}
            </Text>
          )}
        />
        <View style={styles.inputContainer}>
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Type your message"
            style={styles.input}
          />
          <Button title="Send" onPress={sendMessage} />
        </View>
      </View>
    );
  };
  
  const styles = StyleSheet.create({
    container: { flex: 1, padding: 10, marginTop: 40 },
    inputContainer: { flexDirection: 'row', alignItems: 'center' },
    input: { flex: 1, borderWidth: 1, padding: 8, borderRadius: 5, marginRight: 5 },
  });

// make this component available to the app
export default AItuition;

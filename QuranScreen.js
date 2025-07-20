// QuranScreen.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';

const QuranScreen = ({ navigation }) => {
  const quranLessons = [
    { id: 1, title: 'سورۃ الفاتحہ', description: 'کھولنے والی سورۃ' },
    { id: 2, title: 'سورۃ اخلاص', description: 'خلوص کی سورۃ' },
    { id: 3, title: 'سورۃ الفلق', description: 'صبح کی سورۃ' },
    { id: 4, title: 'سورۃ الناس', description: 'لوگوں کی سورۃ' },
    { id: 5, title: 'آیت الکرسی', description: 'اللہ کی عظمت والی آیت' },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.header}>📖 قرآن پاک کی سورتیں</Text>
      <ScrollView>
        {quranLessons.map((lesson) => (
          <TouchableOpacity
            key={lesson.id}
            style={styles.lessonCard}
            onPress={() => navigation.navigate('QuranLesson', { lesson })}>
            <Text style={styles.lessonTitle}>{lesson.title}</Text>
            <Text style={styles.lessonDesc}>{lesson.description}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => navigation.goBack()}>
        <Text style={styles.backButtonText}>واپس جائیں</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#e8f5e9',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
    color: '#27ae60',
  },
  lessonCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    elevation: 3,
  },
  lessonTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'right', // Right-to-left for Urdu/Arabic
  },
  lessonDesc: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 5,
    textAlign: 'right', // Right-to-left for Urdu
  },
  backButton: {
    backgroundColor: '#27ae60',
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
    alignItems: 'center',
  },
  backButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default QuranScreen;
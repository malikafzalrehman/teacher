import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';

const CoursesScreen = ({ navigation }) => {
  const courses = [
    { id: '1', title: 'AI Fundamentals', lessons: 12, duration: '8 hours' },
    { id: '2', title: 'Machine Learning', lessons: 18, duration: '12 hours' },
    { id: '3', title: 'Deep Learning', lessons: 15, duration: '10 hours' },
    { id: '4', title: 'Natural Language', lessons: 10, duration: '7 hours' },
    { id: '5', title: 'Computer Vision', lessons: 14, duration: '9 hours' },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.header}>My Courses</Text>
      
      <FlatList
        data={courses}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.courseCard}
            onPress={() => navigation.navigate('TopicDetail', { topic: item })}
          >
            <Text style={styles.courseTitle}>{item.title}</Text>
            <View style={styles.courseInfo}>
              <Text style={styles.courseDetail}>📖 {item.lessons} lessons</Text>
              <Text style={styles.courseDetail}>⏱ {item.duration}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  courseCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  courseTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  courseInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  courseDetail: {
    fontSize: 14,
    color: '#666',
  },
});

export default CoursesScreen;
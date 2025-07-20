import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';

const TopicDetailScreen = ({ route, navigation }) => {
  const { topic } = route.params || {
    title: 'AI Fundamentals',
    description: 'Learn the core concepts of artificial intelligence',
    progress: 35,
    lessons: [
      { id: '1', title: 'Introduction to AI', duration: '30 min', completed: true },
      { id: '2', title: 'History of AI', duration: '45 min', completed: true },
      { id: '3', title: 'Machine Learning Basics', duration: '1 hour', completed: false },
      { id: '4', title: 'Neural Networks', duration: '1.5 hours', completed: false },
    ]
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>{topic.title}</Text>
      <Text style={styles.description}>{topic.description}</Text>
      
      <View style={styles.progressContainer}>
        <Text style={styles.progressText}>Progress: {topic.progress}%</Text>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${topic.progress}%` }]} />
        </View>
      </View>

      <Text style={styles.sectionTitle}>Lessons</Text>
      {topic.lessons.map((lesson) => (
        <TouchableOpacity key={lesson.id} style={styles.lessonCard}>
          <View style={styles.lessonStatus}>
            {lesson.completed ? (
              <Text style={styles.completedIcon}>✓</Text>
            ) : (
              <View style={styles.incompleteIcon} />
            )}
          </View>
          <View style={styles.lessonInfo}>
            <Text style={styles.lessonTitle}>{lesson.title}</Text>
            <Text style={styles.lessonDuration}>{lesson.duration}</Text>
          </View>
        </TouchableOpacity>
      ))}

      <TouchableOpacity style={styles.startButton}>
        <Text style={styles.startButtonText}>Continue Learning</Text>
      </TouchableOpacity>
    </ScrollView>
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
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  progressContainer: {
    marginBottom: 30,
  },
  progressText: {
    fontSize: 16,
    color: '#444',
    marginBottom: 5,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e2e8f0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#5a67d8',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  lessonCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 1,
  },
  lessonStatus: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#5a67d8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  completedIcon: {
    color: '#5a67d8',
    fontWeight: 'bold',
  },
  incompleteIcon: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  lessonInfo: {
    flex: 1,
  },
  lessonTitle: {
    fontSize: 16,
    color: '#333',
    marginBottom: 5,
  },
  lessonDuration: {
    fontSize: 14,
    color: '#666',
  },
  startButton: {
    backgroundColor: '#5a67d8',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginTop: 20,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default TopicDetailScreen;
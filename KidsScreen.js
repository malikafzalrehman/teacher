// Import libraries
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal } from 'react-native';

// Kids categories with more detailed information
const categories = [
  { 
    name: '📖 Quran', 
    color: '#27ae60',
    description: 'Learn Quran with fun stories and easy verses',
    ageGroup: '3-10 years'
  },
  { 
    name: '🔤 English', 
    color: '#2980b9',
    description: 'ABCs, phonics, and simple English words',
    ageGroup: '2-8 years'
  },
  { 
    name: '📚 Urdu', 
    color: '#8e44ad',
    description: 'Urdu alphabets and basic vocabulary',
    ageGroup: '3-8 years'
  },
  { 
    name: '➕ Math', 
    color: '#d35400',
    description: 'Counting, addition and shapes',
    ageGroup: '4-10 years'
  },
  { 
    name: '🎨 Drawing', 
    color: '#e67e22',
    description: 'Learn to draw with simple steps',
    ageGroup: '3-12 years'
  },
  { 
    name: '🎮 Learning Games', 
    color: '#c0392b',
    description: 'Educational games for fun learning',
    ageGroup: '3-12 years'
  },
];

// Progress tracking component
const ProgressTracker = ({ progress }) => (
  <View style={styles.progressContainer}>
    <Text style={styles.progressText}>Your Progress: {progress}%</Text>
    <View style={styles.progressBar}>
      <View style={[styles.progressFill, { width: `${progress}%` }]} />
    </View>
  </View>
);

// Create KidsScreen component
const KidsScreen = () => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [progress, setProgress] = useState(15); // Example progress
  
  // Simple function to increase progress
  const completeActivity = () => {
    if (progress < 100) {
      setProgress(progress + 5);
    }
    setSelectedCategory(null);
  };
  
  

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🧒 Kids Learning Zone</Text>
      <Text style={styles.subtitle}>Learn with fun activities!</Text>
      
      <ProgressTracker progress={progress} />
      
      <ScrollView contentContainerStyle={styles.buttonContainer}>
        {categories.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.button, { backgroundColor: item.color }]}
            onPress={() => setSelectedCategory(item)}>
            <View style={styles.buttonContent}>
              <View>
                <Text style={styles.buttonText}>{item.name}</Text>
                <Text style={styles.ageText}>{item.ageGroup}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Category Detail Modal */}
      <Modal
        visible={!!selectedCategory}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSelectedCategory(null)}>
        <View style={styles.modalContainer}>
          {selectedCategory && (
            <View style={[styles.modalContent, { backgroundColor: selectedCategory.color }]}>
              <Text style={styles.modalTitle}>{selectedCategory.name}</Text>
              <Text style={styles.modalText}>{selectedCategory.description}</Text>
              <Text style={styles.modalText}>Age: {selectedCategory.ageGroup}</Text>
              
              <View style={styles.modalButtonContainer}>
                <TouchableOpacity 
                  style={styles.startButton}
                  onPress={completeActivity}>
                  <Text style={styles.startButtonText}>Start Learning</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.closeButton}
                  onPress={() => setSelectedCategory(null)}>
                  <Text style={styles.closeButtonText}>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </Modal>
      
      {/* Daily Reward Badge */}
      <View style={styles.rewardBadge}>
        <Text style={styles.rewardText}>🌟 Daily Reward!</Text>
      </View>
    </View>
  );
};

// Enhanced Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    paddingTop: 40,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5,
    color: '#2c3e50',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: '#7f8c8d',
  },
  buttonContainer: {
    paddingBottom: 30,
  },
  button: {
    width: '100%',
    padding: 15,
    borderRadius: 12,
    marginVertical: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: '600',
  },
  ageText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
  },
  progressContainer: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: 'white',
    borderRadius: 10,
    elevation: 2,
  },
  progressText: {
    fontSize: 16,
    color: '#2c3e50',
    marginBottom: 5,
  },
  progressBar: {
    height: 10,
    backgroundColor: '#ecf0f1',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2ecc71',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '85%',
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
  },
  modalText: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    marginBottom: 8,
  },
  modalButtonContainer: {
    flexDirection: 'row',
    marginTop: 20,
  },
  startButton: {
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 8,
    marginRight: 10,
  },
  startButtonText: {
    color: '#2c3e50',
    fontWeight: 'bold',
  },
  closeButton: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    padding: 10,
    borderRadius: 8,
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  rewardBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#f1c40f',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 20,
  },
  rewardText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
});

export default KidsScreen;
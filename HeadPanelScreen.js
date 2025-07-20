// HeadPanelScreen.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const HeadPanelScreen = ({ navigation }) => {
  const features = [
    { title: 'Staff Management', icon: 'people', color: '#C62828' },
    { title: 'School Settings', icon: 'settings', color: '#1E88E5' },
    { title: 'Attendance Reports', icon: 'document-text', color: '#43A047' },
    { title: 'Fee Collection', icon: 'cash', color: '#FB8C00' },
    { title: 'Academic Calendar', icon: 'calendar', color: '#8E24AA' },
    { title: 'Analytics Dashboard', icon: 'stats-chart', color: '#00ACC1' },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Head Panel Dashboard</Text>
      </View>

      <View style={styles.grid}>
        {features.map((item, index) => (
          <TouchableOpacity 
            key={index} 
            style={[styles.card, { backgroundColor: item.color }]}
          >
            <Icon name={item.icon} size={30} color="#fff" />
            <Text style={styles.cardText}>{item.title}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backButtonText}>Back to Modules</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { 
    padding: 20, 
    backgroundColor: '#2E7D32',
    marginBottom: 20
  },
  title: { 
    fontSize: 24, 
    color: '#fff', 
    fontWeight: 'bold',
    textAlign: 'center'
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    padding: 15,
  },
  card: {
    width: '48%',
    height: 120,
    borderRadius: 10,
    marginBottom: 15,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  cardText: {
    color: '#fff',
    fontWeight: 'bold',
    marginTop: 10,
    textAlign: 'center',
    fontSize: 14,
  },
  backButton: {
    margin: 20,
    padding: 15,
    backgroundColor: '#2E7D32',
    borderRadius: 8,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default HeadPanelScreen;
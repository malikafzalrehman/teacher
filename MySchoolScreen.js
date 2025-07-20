import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const MySchoolScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>🏫 Welcome to My School Section</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  text: { fontSize: 20, fontWeight: 'bold' },
});

export default MySchoolScreen;

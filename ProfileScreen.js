//import liraries
import React, { Component } from 'react';
import { View, Text, StyleSheet } from 'react-native';

// create a component
const profilScreen = ({ currentUserRole, setCurrentUserRole, schoolInfo }) => {
   return (
     <ScrollView style={styles.container}>
       <View style={[styles.header, { paddingBottom: 20 }]}>
         <Text style={styles.title}>Profile</Text>
       </View>
       
       <View style={styles.section}>
         <View style={styles.profileCard}>
           <Icon name="person-circle" size={80} color="#2E7D32" />
           <Text style={styles.profileName}>
             {currentUserRole.charAt(0).toUpperCase() + currentUserRole.slice(1)} User
           </Text>
           <Text style={styles.profileRole}>Role: {currentUserRole}</Text>
           
           <View style={styles.profileInfo}>
             <View style={styles.infoRow}>
               <Icon name="business" size={20} color="#555" />
               <Text style={styles.infoText}>{schoolInfo.name || 'Not set'}</Text>
             </View>
             <View style={styles.infoRow}>
               <Icon name="mail" size={20} color="#555" />
               <Text style={styles.infoText}>{currentUserRole}@{schoolInfo.name ? schoolInfo.name.toLowerCase().replace(/\s+/g, '') + '.edu' : 'studyproai.edu'}</Text>
             </View>
             <View style={styles.infoRow}>
               <Icon name="calendar" size={20} color="#555" />
               <Text style={styles.infoText}>Member since: Jan 2025</Text>
             </View>
           </View>
           
           <TouchableOpacity
             style={styles.logoutButton}
             onPress={() => setCurrentUserRole(ROLES.STUDENT)}
           >
             <Text style={styles.logoutButtonText}>Switch Role</Text>
           </TouchableOpacity>
         </View>
       </View>
     </ScrollView>
   );
};

// define your styles
const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#2c3e50',
    },
});

//make this component available to the app
export default profilScreen;

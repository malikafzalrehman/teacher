import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ImageBackground
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const Myuniversity = () => {
  const announcements = [
    { id: 1, title: 'Admissions Open 2024', date: '15 Sep 2024' },
    { id: 2, title: 'Final Exams Schedule', date: '20 Oct 2024' },
    { id: 3, title: 'HEC Scholarship Program', date: '5 Nov 2024' },
  ];

  return (
    <ScrollView style={styles.container}>
      {/* Header with background image */}
      <ImageBackground
        source={{ uri: 'https://images.unsplash.com/photo-1596495577886-d920f1fb7238' }}
        style={styles.header}
        imageStyle={styles.headerImage}
      >
        <View style={styles.headerOverlay}>
          <Icon name="school" size={50} color="#FFF" style={styles.headerIcon} />
          <Text style={styles.title}>My University</Text>
          <Text style={styles.subtitle}>Pakistani University Admin Portal</Text>
        </View>
      </ImageBackground>

      {/* Quick Stats */}
      <View style={styles.statsContainer}>
        <StatCard icon="people" value="5,240" label="Students" />
        <StatCard icon="person" value="320" label="Faculty" />
        <StatCard icon="book" value="42" label="Programs" />
      </View>

      {/* Announcements */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Announcements</Text>
          <TouchableOpacity>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>
        {announcements.map(item => (
          <AnnouncementCard key={item.id} title={item.title} date={item.date} />
        ))}
      </View>

      {/* University Services */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>University Services</Text>
        <View style={styles.featuresGrid}>
          <Feature icon="library" label="Degree Programs" />
          <Feature icon="card" label="Student Portal" />
          <Feature icon="cash" label="Fee Payment" />
          <Feature icon="business" label="Departments" />
        </View>
      </View>

      {/* Education Management */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Education Management</Text>
        <View style={styles.featuresGrid}>
          <Feature icon="person-add" label="Add Student" />
          <Feature icon="person-add-outline" label="Add Teacher" />
          <Feature icon="people" label="Student List" />
          <Feature icon="people-circle" label="Teacher List" />
          <Feature icon="calendar" label="Attendance" />
          <Feature icon="create" label="Exams" />
          <Feature icon="book" label="Library" />
          <Feature icon="clipboard" label="Admissions" />
          <Feature icon="notifications" label="Notifications" />
          <Feature icon="chatbubble" label="Chat System" />
          <Feature icon="settings" label="Settings" />
          <Feature icon="help-circle" label="Help Desk" />
        </View>
      </View>
    </ScrollView>
  );
};

// Reusable Components
const StatCard = ({ icon, value, label }) => (
  <View style={styles.statCard}>
    <Icon name={icon} size={24} color="#0277BD" />
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const Feature = ({ icon, label }) => (
  <TouchableOpacity style={styles.featureCard}>
    <View style={styles.featureIconContainer}>
      <Icon name={icon} size={20} color="#0277BD" />
    </View>
    <Text style={styles.featureText}>{label}</Text>
  </TouchableOpacity>
);

const AnnouncementCard = ({ title, date }) => (
  <TouchableOpacity style={styles.announcementCard}>
    <View style={styles.announcementBadge} />
    <View style={styles.announcementContent}>
      <Text style={styles.announcementTitle}>{title}</Text>
      <Text style={styles.announcementDate}>{date}</Text>
    </View>
    <MaterialIcons name="chevron-right" size={24} color="#9E9E9E" />
  </TouchableOpacity>
);

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    height: 200,
    justifyContent: 'center',
  },
  headerImage: {
    opacity: 0.7,
  },
  headerOverlay: {
    backgroundColor: 'rgba(2, 119, 189, 0.7)',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  headerIcon: {
    marginBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
  },
  subtitle: {
    fontSize: 16,
    color: '#FFF',
    marginTop: 5,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    marginTop: -30,
    zIndex: 1,
  },
  statCard: {
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 15,
    width: '30%',
    alignItems: 'center',
    elevation: 3,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#757575',
    textAlign: 'center',
  },
  section: {
    padding: 15,
    marginTop: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  seeAll: {
    color: '#0277BD',
    fontSize: 14,
  },
  announcementCard: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 1,
  },
  announcementBadge: {
    width: 8,
    height: 40,
    backgroundColor: '#0277BD',
    borderRadius: 4,
    marginRight: 15,
  },
  announcementContent: {
    flex: 1,
  },
  announcementTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  announcementDate: {
    fontSize: 12,
    color: '#757575',
    marginTop: 3,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  featureCard: {
    width: '48%',
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 1,
  },
  featureIconContainer: {
    backgroundColor: '#E3F2FD',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  featureText: {
    fontSize: 14,
    flexShrink: 1,
  },
});

export default Myuniversity;

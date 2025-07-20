import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  RefreshControl,
  ActivityIndicator,
  Linking,
  Platform
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useNavigation } from '@react-navigation/native';
import moment from 'moment';

// Mock API Service
const fetchChildrenData = () => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve([
        {
          id: 1,
          name: 'Ali Haider',
          grade: '5th Grade',
          progress: 75,
          avatar: 'https://i.pravatar.cc/150?img=5',
          attendance: '92%',
          upcomingAssignments: [
            { id: 1, subject: 'Math', dueDate: moment().add(1, 'day').format('MMM D'), title: 'Algebra Worksheet', details: 'Complete problems 1-20 on page 45', completed: false },
            { id: 2, subject: 'Science', dueDate: moment().add(2, 'days').format('MMM D'), title: 'Solar System Project', details: 'Create a model of the solar system with labels', completed: false }
          ],
          subjects: [
            { id: 1, name: 'Math', progress: 80, teacher: 'Mr. Patel', upcomingTest: moment().add(5, 'days').format('MMM D'), lastTestScore: '85%' },
            { id: 2, name: 'Science', progress: 70, teacher: 'Ms. Gupta', upcomingTest: moment().add(8, 'days').format('MMM D'), lastTestScore: '78%' },
            { id: 3, name: 'English', progress: 75, teacher: 'Mrs. Kumar', upcomingTest: moment().add(10, 'days').format('MMM D'), lastTestScore: '82%' }
          ],
          bus: {
            route: 'Bus A',
            status: 'On Time',
            lastUpdated: moment().subtract(2, 'minutes').fromNow(),
            location: 'Near City Park',
            eta: '10 minutes',
            driver: 'Mr. Singh',
            contact: '+919876543210',
            coordinates: { lat: 24.8607, lng: 67.0011 }
          },
          performance: {
            gradeAverage: 'A-',
            classRank: '12/120',
            behavior: 'Excellent',
            lastReportDate: moment().subtract(1, 'month').format('MMM D, YYYY')
          }
        },
        {
          id: 2,
          name: 'Fatima Zahra',
          grade: '3rd Grade',
          progress: 88,
          avatar: 'https://i.pravatar.cc/150?img=8',
          attendance: '95%',
          upcomingAssignments: [
            { id: 1, subject: 'English', dueDate: moment().format('MMM D'), title: 'Reading Comprehension', details: 'Read chapter 3 and answer questions', completed: false },
            { id: 2, subject: 'Math', dueDate: moment().add(1, 'day').format('MMM D'), title: 'Multiplication Practice', details: 'Complete multiplication tables up to 12', completed: false }
          ],
          subjects: [
            { id: 1, name: 'Math', progress: 90, teacher: 'Mrs. Iyer', upcomingTest: moment().add(6, 'days').format('MMM D'), lastTestScore: '92%' },
            { id: 2, name: 'Science', progress: 85, teacher: 'Mr. Joshi', upcomingTest: moment().add(9, 'days').format('MMM D'), lastTestScore: '88%' },
            { id: 3, name: 'English', progress: 89, teacher: 'Ms. Reddy', upcomingTest: moment().add(11, 'days').format('MMM D'), lastTestScore: '91%' }
          ],
          bus: {
            route: 'Bus B',
            status: 'Delayed',
            lastUpdated: moment().subtract(5, 'minutes').fromNow(),
            location: 'At Main Street',
            eta: '25 minutes',
            driver: 'Mrs. Kapoor',
            contact: '+919876543211',
            coordinates: { lat: 24.8615, lng: 67.0023 }
          },
          performance: {
            gradeAverage: 'A',
            classRank: '5/95',
            behavior: 'Outstanding',
            lastReportDate: moment().subtract(3, 'weeks').format('MMM D, YYYY')
          }
        }
      ]);
    }, 1000);
  });
};

// Child Card Component
const ChildCard = ({ child, selected, onPress }) => (
  <TouchableOpacity 
    style={[
      styles.childCard, 
      selected && styles.selectedChildCard
    ]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    {child.avatar ? (
      <Image 
        source={{ uri: child.avatar }} 
        style={styles.childImage}
      />
    ) : (
      <View style={styles.avatarPlaceholder}>
        <Icon name="user" size={24} color="#7f8c8d" />
      </View>
    )}
    <Text style={styles.childName}>{child.name}</Text>
    <Text style={styles.childGrade}>{child.grade}</Text>
    <View style={styles.attendanceBadge}>
      <Text style={styles.attendanceText}>{child.attendance}</Text>
    </View>
  </TouchableOpacity>
);

// Progress Tab Component
const ProgressTab = ({ child }) => {
  const renderProgressBar = (progress, color = '#3498db') => {
    return (
      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBar, { width: `${progress}%`, backgroundColor: color }]} />
        <Text style={styles.progressText}>{progress}%</Text>
      </View>
    );
  };

  return (
    <View>
      <View style={styles.summaryCard}>
        <Text style={styles.sectionHeader}>Overall Progress</Text>
        {renderProgressBar(child.progress)}
        
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Attendance</Text>
            <Text style={styles.statValue}>{child.attendance}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Grade Average</Text>
            <Text style={styles.statValue}>{child.performance.gradeAverage}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Class Rank</Text>
            <Text style={styles.statValue}>{child.performance.classRank}</Text>
          </View>
        </View>
      </View>

      <Text style={styles.sectionHeader}>Subject-wise Progress</Text>
      {child.subjects.map(subject => (
        <View key={subject.id} style={styles.subjectDetailCard}>
          <View style={styles.subjectHeader}>
            <Text style={styles.subjectTitle}>{subject.name}</Text>
            <Text style={styles.teacherText}>Teacher: {subject.teacher}</Text>
          </View>
          <View style={styles.subjectInfoRow}>
            <Text style={styles.subjectInfoText}>Upcoming Test: {subject.upcomingTest}</Text>
            <Text style={styles.subjectInfoText}>Last Score: {subject.lastTestScore}</Text>
          </View>
          {renderProgressBar(subject.progress)}
        </View>
      ))}
    </View>
  );
};

// Bus Tab Component
const BusTab = ({ child }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'On Time': return '#2ecc71';
      case 'Delayed': return '#e74c3c';
      case 'Early': return '#f39c12';
      default: return '#3498db';
    }
  };

  const openMap = () => {
    const { lat, lng } = child.bus.coordinates;
    const url = Platform.select({
      ios: `maps://app?daddr=${lat},${lng}`,
      android: `geo://?q=${lat},${lng}`
    });
    
    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        Linking.openURL(url);
      } else {
        console.log("Don't know how to open URI: " + url);
      }
    });
  };

  const callDriver = () => {
    Linking.openURL(`tel:${child.bus.contact}`);
  };

  return (
    <View>
      <Text style={styles.sectionHeader}>Bus Information</Text>
      <View style={styles.busInfoCard}>
        <View style={styles.infoRow}>
          <Icon name="bus" size={20} color="#3498db" />
          <Text style={styles.infoText}>Route: {child.bus.route}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Icon 
            name="clock-o" 
            size={20} 
            color={getStatusColor(child.bus.status)} 
          />
          <View>
            <Text style={styles.infoText}>Status: {child.bus.status}</Text>
            <Text style={styles.etaText}>ETA: {child.bus.eta}</Text>
          </View>
        </View>
        
        <View style={styles.infoRow}>
          <Icon name="map-marker" size={20} color="#3498db" />
          <Text style={styles.infoText}>Current Location: {child.bus.location}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Icon name="user" size={20} color="#3498db" />
          <Text style={styles.infoText}>Driver: {child.bus.driver}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Icon name="phone" size={20} color="#3498db" />
          <Text style={styles.infoText}>Contact: {child.bus.contact}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Icon name="refresh" size={20} color="#3498db" />
          <Text style={styles.infoText}>Updated: {child.bus.lastUpdated}</Text>
        </View>
        
        <View style={styles.buttonGroup}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.mapButton]}
            onPress={openMap}
          >
            <Icon name="map" size={18} color="white" />
            <Text style={styles.actionButtonText}>View on Map</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.actionButton, styles.callButton]}
            onPress={callDriver}
          >
            <Icon name="phone" size={18} color="white" />
            <Text style={styles.actionButtonText}>Call Driver</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

// Assignments Tab Component
const AssignmentsTab = ({ child, updateAssignmentStatus }) => {
  const toggleAssignmentStatus = (assignmentId) => {
    updateAssignmentStatus(child.id, assignmentId);
  };

  return (
    <View>
      <Text style={styles.sectionHeader}>Upcoming Assignments</Text>
      {child.upcomingAssignments.length > 0 ? (
        child.upcomingAssignments.map((assignment) => (
          <View key={assignment.id} style={styles.assignmentCard}>
            <View style={styles.assignmentHeader}>
              <Text style={styles.assignmentSubject}>{assignment.subject}</Text>
              <Text style={[
                styles.assignmentDue,
                assignment.dueDate === moment().format('MMM D') && styles.dueToday
              ]}>
                Due: {assignment.dueDate}
              </Text>
            </View>
            <Text style={styles.assignmentTitle}>{assignment.title}</Text>
            <Text style={styles.assignmentDetails}>{assignment.details}</Text>
            <View style={styles.assignmentFooter}>
              <TouchableOpacity 
                style={styles.smallButton}
                onPress={() => {/* Navigate to assignment details */}}
              >
                <Text style={styles.smallButtonText}>View Details</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[
                  styles.smallButton, 
                  assignment.completed ? styles.completedButton : styles.completeButton
                ]}
                onPress={() => toggleAssignmentStatus(assignment.id)}
              >
                <Text style={[styles.smallButtonText, styles.completeButtonText]}>
                  {assignment.completed ? 'Completed' : 'Mark Complete'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ))
      ) : (
        <View style={styles.noAssignmentsContainer}>
          <Icon name="check-circle" size={50} color="#2ecc71" />
          <Text style={styles.noAssignmentsText}>No upcoming assignments!</Text>
          <Text style={styles.noAssignmentsSubText}>All caught up for now.</Text>
        </View>
      )}
    </View>
  );
};

// Main Parent Portal Component
const Parentportal1 = () => {
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [activeTab, setActiveTab] = useState('progress');

  // Fetch children data  
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchChildrenData();
      setChildren(data);
      setSelectedChild(data[0]);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Initial data load
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, [fetchData]);

  // Update assignment status
  const updateAssignmentStatus = (childId, assignmentId) => {
    setChildren(prevChildren => 
      prevChildren.map(child => {
        if (child.id === childId) {
          return {
            ...child,
            upcomingAssignments: child.upcomingAssignments.map(assignment => 
              assignment.id === assignmentId 
                ? { ...assignment, completed: !assignment.completed } 
                : assignment
            )
          };
        }
        return child;
      })
    );
  };

  // Tab navigation
  const renderTabContent = () => {
    if (!selectedChild) return null;

    switch (activeTab) {
      case 'progress':
        return <ProgressTab child={selectedChild} />;
      case 'location':
        return <BusTab child={selectedChild} />;
      case 'assignments':
        return <AssignmentsTab child={selectedChild} updateAssignmentStatus={updateAssignmentStatus} />;
      default:
        return null;
    }
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3498db" />
        <Text style={styles.loadingText}>Loading your child's data...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <Text style={styles.header}>Parent Portal</Text>
        <TouchableOpacity 
          onPress={() => navigation.navigate('Notifications')}
          style={styles.notificationIcon}
        >
          <Icon name="bell" size={24} color="#2c3e50" />
          <View style={styles.notificationBadge}>
            <Text style={styles.notificationText}>2</Text>
          </View>
        </TouchableOpacity>
      </View>
      
      {/* Children Selection */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        style={styles.childrenList}
        contentContainerStyle={styles.childrenListContent}
      >
        {children.map(child => (
          <ChildCard 
            key={child.id}
            child={child}
            selected={selectedChild?.id === child.id}
            onPress={() => setSelectedChild(child)}
          />
        ))}
      </ScrollView>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[
            styles.tabButton, 
            activeTab === 'progress' && styles.activeTab
          ]}
          onPress={() => setActiveTab('progress')}
        >
          <Icon 
            name="book" 
            size={20} 
            color={activeTab === 'progress' ? '#3498db' : '#7f8c8d'} 
          />
          <Text style={[
            styles.tabText,
            activeTab === 'progress' && styles.activeTabText
          ]}>
            Study Progress
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.tabButton, 
            activeTab === 'location' && styles.activeTab
          ]}
          onPress={() => setActiveTab('location')}
        >
          <Icon 
            name="bus" 
            size={20} 
            color={activeTab === 'location' ? '#3498db' : '#7f8c8d'} 
          />
          <Text style={[
            styles.tabText,
            activeTab === 'location' && styles.activeTabText
          ]}>
            Bus Location
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[
            styles.tabButton, 
            activeTab === 'assignments' && styles.activeTab
          ]}
          onPress={() => setActiveTab('assignments')}
        >
          <Icon 
            name="tasks" 
            size={20} 
            color={activeTab === 'assignments' ? '#3498db' : '#7f8c8d'} 
          />
          <Text style={[
            styles.tabText,
            activeTab === 'assignments' && styles.activeTabText
          ]}>
            Assignments
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content Area */}
      <ScrollView 
        style={styles.contentContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#3498db']}
            tintColor="#3498db"
          />
        }
      >
        {selectedChild ? (
          renderTabContent()
        ) : (
          <View style={styles.noSelectionContainer}>
            <Icon name="child" size={50} color="#bdc3c7" />
            <Text style={styles.noSelectionText}>Please select a child to view details</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 15,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 20,
    color: '#7f8c8d',
    fontSize: 16,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  notificationIcon: {
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    right: -5,
    top: -5,
    backgroundColor: '#e74c3c',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  childrenList: {
    marginBottom: 20,
  },
  childrenListContent: {
    paddingHorizontal: 5,
  },
  childCard: {
    width: 140,
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginRight: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  selectedChildCard: {
    borderWidth: 2,
    borderColor: '#3498db',
    shadowColor: '#3498db',
    shadowOpacity: 0.2,
  },
  childImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: '#ecf0f1',
  },
  avatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: '#ecf0f1',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  childName: {
    fontWeight: '600',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 2,
    textTransform: 'capitalize',
  },
  childGrade: {
    fontSize: 12,
    color: '#7f8c8d',
    textAlign: 'center',
    marginBottom: 5,
  },
  attendanceBadge: {
    backgroundColor: '#2ecc71',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  attendanceText: {
    color: 'white',
    fontSize: 11,
    fontWeight: 'bold',
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#ebf5fb',
  },
  tabText: {
    marginLeft: 8,
    color: '#7f8c8d',
    fontSize: 14,
    fontWeight: '500',
  },
  activeTabText: {
    color: '#3498db',
    fontWeight: '600',
  },
  contentContainer: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  noSelectionContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  noSelectionText: {
    textAlign: 'center',
    marginTop: 15,
    color: '#7f8c8d',
    fontSize: 16,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 16,
  },
  summaryCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  progressBarContainer: {
    height: 24,
    backgroundColor: '#ecf0f1',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBar: {
    height: '100%',
    borderRadius: 12,
  },
  progressText: {
    position: 'absolute',
    right: 10,
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  subjectDetailCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  subjectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  subjectTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
  },
  teacherText: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  subjectInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  subjectInfoText: {
    fontSize: 13,
    color: '#7f8c8d',
    fontWeight: '500',
  },
  busInfoCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoText: {
    marginLeft: 12,
    fontSize: 15,
    color: '#2c3e50',
  },
  etaText: {
    fontSize: 13,
    color: '#7f8c8d',
    marginLeft: 32,
    marginTop: 2,
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    width: '48%',
  },
  mapButton: {
    backgroundColor: '#3498db',
  },
  callButton: {
    backgroundColor: '#2ecc71',
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 8,
  },
  assignmentCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  assignmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  assignmentSubject: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3498db',
  },
  assignmentDue: {
    fontSize: 14,
    color: '#e74c3c',
    fontWeight: '500',
  },
  dueToday: {
    color: '#e74c3c',
    fontWeight: 'bold',
  },
  assignmentTitle: {
    fontSize: 15,
    color: '#2c3e50',
    marginBottom: 8,
    fontWeight: '500',
  },
  assignmentDetails: {
    fontSize: 13,
    color: '#7f8c8d',
    marginBottom: 12,
  },
  assignmentFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  smallButton: {
    borderWidth: 1,
    borderColor: '#3498db',
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  smallButtonText: {
    color: '#3498db',
    fontSize: 13,
    fontWeight: '500',
  },
  completeButton: {
    backgroundColor: '#3498db',
  },
  completedButton: {
    backgroundColor: '#2ecc71',
    borderColor: '#2ecc71',
  },
  completeButtonText: {
    color: 'white',
  },
  noAssignmentsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  noAssignmentsText: {
    textAlign: 'center',
    color: '#2c3e50',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 15,
  },
  noAssignmentsSubText: {
    textAlign: 'center',
    color: '#7f8c8d',
    fontSize: 14,
    marginTop: 5,
  }
});

export default Parentportal1;
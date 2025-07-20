import React, { useState, useMemo, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  FlatList,
  StatusBar,
  Modal,
  TextInput,
  RefreshControl,
  SafeAreaView,
  Alert
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';

const ParentPortal = () => {
  const navigation = useNavigation();
  const [modalVisible, setModalVisible] = useState(false);
  const [announcementText, setAnnouncementText] = useState('');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [parents, setParents] = useState([
    { 
      id: '1', 
      name: 'Ahmed Khan', 
      email: 'ahmed@example.com',
      phone: '03001234567',
      children: [
        { name: 'Ali Ahmed', class: 'Class 5-B', rollNumber: '25' },
        { name: 'Ayesha Ahmed', class: 'Class 3-A', rollNumber: '12' }
      ]
    },
    { 
      id: '2', 
      name: 'Fatima Ali', 
      email: 'fatima@example.com',
      phone: '03007654321',
      children: [
        { name: 'Usman Ali', class: 'Class 7-C', rollNumber: '8' }
      ]
    }
  ]);
  const [newParentModal, setNewParentModal] = useState(false);
  const [newParent, setNewParent] = useState({
    name: '',
    email: '',
    phone: '',
    children: [{ name: '', class: '', rollNumber: '' }]
  });
  const [selectedParent, setSelectedParent] = useState(null);
  const [editParentModal, setEditParentModal] = useState(false);

  // Sample data with memoization for performance
  const [announcements, setAnnouncements] = useState([
    { 
      id: '1', 
      title: 'Annual Day', 
      date: '15 June 2024', 
      content: 'Annual day celebration on 15th June at 5 PM in school auditorium.' 
    },
    { 
      id: '2', 
      title: 'PTA Meeting', 
      date: '20 June 2024', 
      content: 'Monthly PTA meeting on 20th June at 10 AM. All parents must attend.' 
    },
  ]);

  const classes = useMemo(() => [
    'Class 1-A', 'Class 1-B', 'Class 2-A', 'Class 2-B', 
    'Class 3-A', 'Class 3-B', 'Class 4-A', 'Class 4-B',
    'Class 5-A', 'Class 5-B', 'Class 6-A', 'Class 6-B',
    'Class 7-A', 'Class 7-B', 'Class 8-A', 'Class 8-B'
  ], []);

  const events = useMemo(() => [
    { id: '1', title: 'Parent-Teacher Meeting', date: '25 June 2024', time: '10:00 AM', location: 'School Conference Room' },
    { id: '2', title: 'Sports Day', date: '30 June 2024', time: '8:00 AM', location: 'School Ground' },
    { id: '3', title: 'Science Fair', date: '5 July 2024', time: '9:00 AM', location: 'School Lab' },
  ], []);

  const menuItems = useMemo(() => [
    { id: '1', title: 'Events', icon: 'event', screen: 'Events' },
    { id: '2', title: 'Performance', icon: 'star', screen: 'Performance' },
    { id: '3', title: 'Calendar', icon: 'calendar-today', screen: 'Calendar' },
    { id: '4', title: 'Attendance', icon: 'check-circle', screen: 'Attendance' },
    { id: '5', title: 'Parents', icon: 'group', action: 'manageParents' },
  ], []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate data refresh
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  }, []);

  const handleAddAnnouncement = useCallback(() => {
    if (announcementText.trim()) {
      const newAnnouncement = {
        id: Date.now().toString(),
        title: 'New Announcement',
        date: new Date().toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        }),
        content: announcementText
      };
      setAnnouncements(prev => [newAnnouncement, ...prev]);
      setAnnouncementText('');
      setModalVisible(false);
    }
  }, [announcementText]);

  const handleAddChildField = useCallback(() => {
    setNewParent(prev => ({
      ...prev,
      children: [...prev.children, { name: '', class: '', rollNumber: '' }]
    }));
  }, []);

  const handleRemoveChildField = useCallback((index) => {
    if (newParent.children.length > 1) {
      setNewParent(prev => ({
        ...prev,
        children: prev.children.filter((_, i) => i !== index)
      }));
    }
  }, [newParent.children.length]);

  const handleChildChange = useCallback((index, field, value) => {
    const updatedChildren = [...newParent.children];
    updatedChildren[index][field] = value;
    setNewParent(prev => ({
      ...prev,
      children: updatedChildren
    }));
  }, [newParent.children]);

  const handleAddParent = useCallback(() => {
    if (!newParent.name.trim() || !newParent.email.trim() || !newParent.phone.trim()) {
      Alert.alert('Error', 'Please fill all required parent fields');
      return;
    }

    // Validate children
    for (const child of newParent.children) {
      if (!child.name.trim() || !child.class || !child.rollNumber.trim()) {
        Alert.alert('Error', 'Please fill all fields for each child');
        return;
      }
    }
    
    const parent = {
      id: Date.now().toString(),
      name: newParent.name,
      email: newParent.email,
      phone: newParent.phone,
      children: newParent.children.filter(child => 
        child.name.trim() && child.class && child.rollNumber.trim()
      )
    };

    setParents(prev => [...prev, parent]);
    setNewParent({
      name: '',
      email: '',
      phone: '',
      children: [{ name: '', class: '', rollNumber: '' }]
    });
    setNewParentModal(false);
  }, [newParent]);

  const handleEditParent = useCallback(() => {
    if (!selectedParent.name.trim() || !selectedParent.email.trim() || !selectedParent.phone.trim()) {
      Alert.alert('Error', 'Please fill all required parent fields');
      return;
    }

    // Validate children
    for (const child of selectedParent.children) {
      if (!child.name.trim() || !child.class || !child.rollNumber.trim()) {
        Alert.alert('Error', 'Please fill all fields for each child');
        return;
      }
    }

    setParents(prev => prev.map(parent => 
      parent.id === selectedParent.id ? selectedParent : parent
    ));
    setEditParentModal(false);
  }, [selectedParent]);

  const handleDeleteParent = useCallback((parentId) => {
    Alert.alert(
      'Delete Parent',
      'Are you sure you want to delete this parent?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            setParents(prev => prev.filter(parent => parent.id !== parentId));
            setEditParentModal(false);
          }
        }
      ]
    );
  }, []);

  const renderAnnouncement = useCallback(({ item }) => (
    <TouchableOpacity style={styles.announcementCard}>
      <View style={styles.announcementHeader}>
        <Text style={styles.announcementTitle}>{item.title}</Text>
        <Text style={styles.announcementDate}>{item.date}</Text>
      </View>
      <Text style={styles.announcementContent}>{item.content}</Text>
    </TouchableOpacity>
  ), []);

  const renderEvent = useCallback(({ item }) => (
    <TouchableOpacity 
      style={styles.eventCard}
      onPress={() => setSelectedEvent(item)}
    >
      <View style={styles.eventIconContainer}>
        <Icon name="event" size={24} color="#fff" />
      </View>
      <View style={styles.eventDetails}>
        <Text style={styles.eventTitle}>{item.title}</Text>
        <View style={styles.eventInfoRow}>
          <Icon name="calendar-today" size={14} color="#7f8c8d" />
          <Text style={styles.eventInfoText}>{item.date}</Text>
        </View>
        <View style={styles.eventInfoRow}>
          <Icon name="access-time" size={14} color="#7f8c8d" />
          <Text style={styles.eventInfoText}>{item.time}</Text>
        </View>
      </View>
    </TouchableOpacity>
  ), []);

  const renderMenuItem = useCallback(({ item }) => (
    <TouchableOpacity 
      style={styles.menuItem}
      onPress={() => {
        if (item.action === 'manageParents') {
          setNewParentModal(true);
        } else {
          navigation.navigate(item.screen);
        }
      }}
    >
      <View style={styles.menuIconContainer}>
        <Icon name={item.icon} size={26} color="#3498db" />
      </View>
      <Text style={styles.menuText}>{item.title}</Text>
    </TouchableOpacity>
  ), [navigation]);

  const renderParentItem = useCallback(({ item }) => (
    <TouchableOpacity 
      style={styles.parentCard}
      onPress={() => {
        setSelectedParent({...item});
        setEditParentModal(true);
      }}
    >
      <View style={styles.parentHeader}>
        <Icon name="person" size={24} color="#3498db" />
        <Text style={styles.parentName}>{item.name}</Text>
      </View>
      <View style={styles.parentDetail}>
        <Icon name="email" size={18} color="#7f8c8d" />
        <Text style={styles.parentText}>{item.email}</Text>
      </View>
      <View style={styles.parentDetail}>
        <Icon name="phone" size={18} color="#7f8c8d" />
        <Text style={styles.parentText}>{item.phone}</Text>
      </View>
      <View style={styles.childrenContainer}>
        <Text style={styles.childrenTitle}>Children:</Text>
        {item.children.map((child, index) => (
          <View key={index} style={styles.childItem}>
            <Icon name="child-care" size={18} color="#7f8c8d" />
            <View style={styles.childDetails}>
              <Text style={styles.childText}>{child.name}</Text>
              <Text style={styles.childClassText}>{child.class} (Roll: {child.rollNumber})</Text>
            </View>
          </View>
        ))}
      </View>
    </TouchableOpacity>
  ), []);

  const renderChildInput = (child, index) => (
    <View key={index} style={styles.childInputContainer}>
      <View style={styles.childInputRow}>
        <TextInput
          style={[styles.input, styles.childInput]}
          placeholder="Child Name"
          placeholderTextColor="#95a5a6"
          value={child.name}
          onChangeText={(text) => handleChildChange(index, 'name', text)}
        />
        <TextInput
          style={[styles.input, styles.childInput, styles.classInput]}
          placeholder="Class"
          placeholderTextColor="#95a5a6"
          value={child.class}
          onChangeText={(text) => handleChildChange(index, 'class', text)}
        />
        <TextInput
          style={[styles.input, styles.childInput, styles.rollInput]}
          placeholder="Roll #"
          placeholderTextColor="#95a5a6"
          keyboardType="numeric"
          value={child.rollNumber}
          onChangeText={(text) => handleChildChange(index, 'rollNumber', text)}
        />
        {newParent.children.length > 1 && (
          <TouchableOpacity 
            style={styles.removeChildButton}
            onPress={() => handleRemoveChildField(index)}
          >
            <Icon name="remove" size={20} color="#e74c3c" />
          </TouchableOpacity>
        )}
      </View>
      {index === newParent.children.length - 1 && (
        <TouchableOpacity 
          style={styles.addChildButton}
          onPress={handleAddChildField}
        >
          <Icon name="add" size={20} color="#2ecc71" />
          <Text style={styles.addChildText}>Add Another Child</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor="#3498db" barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.profileContainer}>
          <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
            <View style={styles.profileIcon}>
              <Icon name="account-circle" size={44} color="#fff" />
            </View>
          </TouchableOpacity>
          <View>
            <Text style={styles.welcomeText}>Welcome, Headmaster</Text>
            <Text style={styles.adminName}>Mr. Admin</Text>
          </View>
        </View>
        
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.notificationBtn}
            onPress={() => navigation.navigate('Notifications')}
          >
            <Icon name="notifications" size={22} color="#fff" />
            <View style={styles.badge}></View>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.addBtn}
            onPress={() => setModalVisible(true)}
          >
            <Icon name="add" size={22} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#3498db']}
            tintColor="#3498db"
          />
        }
      >
        {/* Quick Actions */}
        <Text style={styles.sectionHeading}>Quick Actions</Text>
        <FlatList
          data={menuItems}
          renderItem={renderMenuItem}
          keyExtractor={item => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.menuContainer}
        />

        {/* Parents List */}
        <View style={styles.announcementHeader}>
          <Text style={styles.sectionHeading}>Parents</Text>
          <TouchableOpacity onPress={() => setNewParentModal(true)}>
            <Text style={styles.seeAll}>Add Parent</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          data={parents}
          renderItem={renderParentItem}
          keyExtractor={item => item.id}
          scrollEnabled={false}
          contentContainerStyle={styles.announcementList}
        />

        {/* Announcements */}
        <View style={styles.announcementHeader}>
          <Text style={styles.sectionHeading}>Announcements</Text>
          <TouchableOpacity onPress={() => setModalVisible(true)}>
            <Text style={styles.seeAll}>Add New</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          data={announcements}
          renderItem={renderAnnouncement}
          keyExtractor={item => item.id}
          scrollEnabled={false}
          contentContainerStyle={styles.announcementList}
        />
      </ScrollView>

      {/* Add Announcement Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Create New Announcement</Text>
            <TextInput
              style={styles.input}
              multiline
              placeholder="Type your announcement here..."
              placeholderTextColor="#95a5a6"
              value={announcementText}
              onChangeText={setAnnouncementText}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.submitButton]}
                onPress={handleAddAnnouncement}
                disabled={!announcementText.trim()}
              >
                <Text style={styles.buttonText}>Post Announcement</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Add Parent Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={newParentModal}
        onRequestClose={() => setNewParentModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Add New Parent</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Parent Name"
              placeholderTextColor="#95a5a6"
              value={newParent.name}
              onChangeText={(text) => setNewParent({...newParent, name: text})}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#95a5a6"
              keyboardType="email-address"
              value={newParent.email}
              onChangeText={(text) => setNewParent({...newParent, email: text})}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Phone Number"
              placeholderTextColor="#95a5a6"
              keyboardType="phone-pad"
              value={newParent.phone}
              onChangeText={(text) => setNewParent({...newParent, phone: text})}
            />
            
            <Text style={styles.childrenTitle}>Children Information:</Text>
            {newParent.children.map((child, index) => renderChildInput(child, index))}
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setNewParentModal(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.submitButton]}
                onPress={handleAddParent}
              >
                <Text style={styles.buttonText}>Add Parent</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit Parent Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={editParentModal}
        onRequestClose={() => setEditParentModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, styles.editModalContainer]}>
            <Text style={styles.modalTitle}>Edit Parent</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Parent Name"
              placeholderTextColor="#95a5a6"
              value={selectedParent?.name || ''}
              onChangeText={(text) => setSelectedParent({...selectedParent, name: text})}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#95a5a6"
              keyboardType="email-address"
              value={selectedParent?.email || ''}
              onChangeText={(text) => setSelectedParent({...selectedParent, email: text})}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Phone Number"
              placeholderTextColor="#95a5a6"
              keyboardType="phone-pad"
              value={selectedParent?.phone || ''}
              onChangeText={(text) => setSelectedParent({...selectedParent, phone: text})}
            />
            
            <Text style={styles.childrenTitle}>Children Information:</Text>
            {selectedParent?.children?.map((child, index) => (
              <View key={index} style={styles.childInputContainer}>
                <View style={styles.childInputRow}>
                  <TextInput
                    style={[styles.input, styles.childInput]}
                    placeholder="Child Name"
                    placeholderTextColor="#95a5a6"
                    value={child.name}
                    onChangeText={(text) => {
                      const updatedChildren = [...selectedParent.children];
                      updatedChildren[index].name = text;
                      setSelectedParent({...selectedParent, children: updatedChildren});
                    }}
                  />
                  <TextInput
                    style={[styles.input, styles.childInput, styles.classInput]}
                    placeholder="Class"
                    placeholderTextColor="#95a5a6"
                    value={child.class}
                    onChangeText={(text) => {
                      const updatedChildren = [...selectedParent.children];
                      updatedChildren[index].class = text;
                      setSelectedParent({...selectedParent, children: updatedChildren});
                    }}
                  />
                  <TextInput
                    style={[styles.input, styles.childInput, styles.rollInput]}
                    placeholder="Roll #"
                    placeholderTextColor="#95a5a6"
                    keyboardType="numeric"
                    value={child.rollNumber}
                    onChangeText={(text) => {
                      const updatedChildren = [...selectedParent.children];
                      updatedChildren[index].rollNumber = text;
                      setSelectedParent({...selectedParent, children: updatedChildren});
                    }}
                  />
                </View>
              </View>
            ))}
            
            <View style={styles.editModalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.deleteButton]}
                onPress={() => handleDeleteParent(selectedParent?.id)}
              >
                <Text style={styles.buttonText}>Delete</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setEditParentModal(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.submitButton]}
                onPress={handleEditParent}
              >
                <Text style={styles.buttonText}>Save Changes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Event Details Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={!!selectedEvent}
        onRequestClose={() => setSelectedEvent(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.eventModalContainer}>
            <Text style={styles.modalTitle}>{selectedEvent?.title}</Text>
            
            <View style={styles.eventInfoContainer}>
              <View style={styles.eventModalInfo}>
                <Icon name="date-range" size={20} color="#3498db" />
                <Text style={styles.eventModalText}>{selectedEvent?.date}</Text>
              </View>
              <View style={styles.eventModalInfo}>
                <Icon name="access-time" size={20} color="#3498db" />
                <Text style={styles.eventModalText}>{selectedEvent?.time}</Text>
              </View>
              <View style={styles.eventModalInfo}>
                <Icon name="location-on" size={20} color="#3498db" />
                <Text style={styles.eventModalText}>{selectedEvent?.location}</Text>
              </View>
            </View>
            
            <TouchableOpacity 
              style={[styles.modalButton, styles.notifyButton]}
              onPress={() => {
                alert(`Notification sent to all parents about ${selectedEvent?.title}`);
                setSelectedEvent(null);
              }}
            >
              <Text style={styles.buttonText}>Notify All Parents</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.modalButton, styles.closeButton]}
              onPress={() => setSelectedEvent(null)}
            >
              <Text style={styles.buttonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#3498db',
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 16,
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileIcon: {
    marginRight: 12,
  },
  welcomeText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 13,
  },
  adminName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificationBtn: {
    position: 'relative',
    padding: 6,
    marginRight: 8,
  },
  addBtn: {
    backgroundColor: '#2980b9',
    borderRadius: 20,
    padding: 6,
  },
  badge: {
    position: 'absolute',
    right: 3,
    top: 3,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#e74c3c',
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '600',
    marginHorizontal: 16,
    marginVertical: 12,
    color: '#2c3e50',
  },
  menuContainer: {
    paddingHorizontal: 8,
    paddingBottom: 8,
  },
  menuItem: {
    width: 100,
    alignItems: 'center',
    marginHorizontal: 8,
  },
  menuIconContainer: {
    backgroundColor: '#fff',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    marginBottom: 6,
  },
  menuText: {
    fontSize: 13,
    color: '#2c3e50',
    textAlign: 'center',
    fontWeight: '500',
  },
  announcementHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 8,
  },
  seeAll: {
    color: '#3498db',
    fontWeight: '600',
    fontSize: 14,
  },
  announcementList: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  announcementCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  announcementTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2c3e50',
  },
  announcementDate: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  announcementContent: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
    marginTop: 8,
  },
  parentCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  parentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  parentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginLeft: 10,
  },
  parentDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  parentText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#555',
  },
  childrenContainer: {
    marginTop: 10,
  },
  childrenTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  childItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingLeft: 5,
  },
  childDetails: {
    marginLeft: 10,
  },
  childText: {
    fontSize: 14,
    color: '#555',
  },
  childClassText: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 2,
  },
  childInputContainer: {
    marginBottom: 12,
  },
  childInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  childInput: {
    flex: 1,
    marginRight: 8,
    padding: 10,
  },
  classInput: {
    flex: 0.8,
  },
  rollInput: {
    flex: 0.5,
  },
  removeChildButton: {
    padding: 5,
  },
  addChildButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#ecf0f1',
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  addChildText: {
    marginLeft: 5,
    color: '#2ecc71',
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContainer: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    maxHeight: '90%',
  },
  editModalContainer: {
    maxHeight: '80%',
  },
  eventModalContainer: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#2c3e50',
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 14,
    marginBottom: 12,
    fontSize: 15,
    color: '#333',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  editModalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  modalButton: {
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    flex: 1,
  },
  cancelButton: {
    backgroundColor: '#e74c3c',
    marginRight: 8,
  },
  submitButton: {
    backgroundColor: '#2ecc71',
    marginLeft: 8,
  },
  deleteButton: {
    backgroundColor: '#e74c3c',
    marginRight: 8,
    flex: 1,
  },
  notifyButton: {
    backgroundColor: '#3498db',
    marginVertical: 8,
  },
  closeButton: {
    backgroundColor: '#95a5a6',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
  eventInfoContainer: {
    marginBottom: 16,
  },
  eventModalInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  eventModalText: {
    marginLeft: 12,
    fontSize: 15,
    color: '#555',
    flex: 1,
  },
});

export default ParentPortal;
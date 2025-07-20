import React, { useState, useCallback, useMemo } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  StyleSheet, 
  TouchableOpacity, 
  Modal, 
  Pressable,
  SafeAreaView,
  StatusBar,
  TextInput,
  Alert,
  Image,
  FlatList
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';


// Constants
const COLORS = {
  primary: '#2E7D32',
  primaryLight: '#81C784',
  primaryDark: '#1B5E20',
  secondary: '#FFC107',
  background: '#F5F5F5',
  card: '#FFFFFF',
  text: '#212121',
  textSecondary: '#757575',
  border: '#E0E0E0',
  error: '#D32F2F',
  success: '#388E3C'
};

const MAIN_MODULES = [
  { 
    id: '1',
    title: 'My School', 
    icon: 'school', 
    color: '#396346',
    description: 'Manage your school information and settings',
    screen: 'newFile'
  },
  { 
    id: '2',
    title: 'Self Study', 
    icon: 'book', 
    color: '#baa077',
    description: 'Access self-study materials and resources',
    screen: 'selfStudy'
  },
  { 
    id: '3',
    title: 'AI Tuition', 
    icon: 'sparkles', 
    color: '#48b8b2',
    description: 'AI-powered tutoring and learning assistance',
    screen: 'aituition'
  },
  { 
    id: '4',
    title: 'Book', 
    icon: 'library', 
    color: '#2f5494',
    description: 'Access digital books and learning materials',
    screen: 'bookscreen'
  },
  { 
    id: '5',
    title: 'Online Academy', 
    icon: 'globe', 
    color: '#94392f',
    description: 'Connect to online courses and classes',
    screen: 'academy'
  },
  { 
    id: '6',
    title: 'Certificate Checker', 
    icon: 'book-outline', 
    color: '#302e2e',
    description: 'Verify certificates and credentials',
    screen: 'cck'
  },
  { 
    id: '7',
    title: 'kid section', 
    icon: 'people', 
    color: '#236170',
    description: 'Search across all learning resources',
    screen: 'kids'
  },
  // New modules added here
  { 
    id: '8',
    title: 'Affiliate Program ', 
    icon: 'business', 
    color: '#6A1B9A',
    description: 'Manage your college information, courses, and academic records',
    screen: 'college'
  },
  { 
    id: '9',
    title: 'My University', 
    icon: 'school', 
    color: '#0277BD',
    description: 'Access university resources, degree programs, and administration',
    screen: 'university'
  }
  
];

const TAB_CONFIG = [
  { id: 'home', icon: 'home', label: 'Home' },
  { id: 'messages', icon: 'chatbubbles', label: 'Messages' },
  { id: 'notifications', icon: 'notifications', label: 'Alerts' },
  { id: 'profile', icon: 'person', label: 'Profile' }
];

// Main App Component
const MainHome = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('home');
  const [selectedModule, setSelectedModule] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const renderScreen = useCallback(() => {
    const screens = {
      home: <HomeScreen 
              setSelectedModule={setSelectedModule}
              setModalVisible={setModalVisible}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              navigation={navigation}
            />,
      messages: <MessagesScreen />,
      notifications: <NotificationsScreen />,
      profile: <ProfileScreen />
    };
    return screens[activeTab] || null;
  }, [activeTab, searchQuery, navigation]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor={COLORS.primary} barStyle="light-content" />
      
      {renderScreen()}

      <BottomTabNavigation 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
      />

      <ModuleModal 
        modalVisible={modalVisible}
        setModalVisible={setModalVisible}
        selectedModule={selectedModule}
      />
    </SafeAreaView>
  );
};

// Bottom Tab Navigation Component
const BottomTabNavigation = ({ activeTab, setActiveTab }) => {
  return (
    <View style={styles.bottomTab}>
      {TAB_CONFIG.map((tab) => (
        <TabButton 
          key={tab.id}
          tab={tab}
          isActive={activeTab === tab.id}
          onPress={() => setActiveTab(tab.id)}
        />
      ))}
    </View>
  );
};

const TabButton = ({ tab, isActive, onPress }) => (
  <TouchableOpacity 
    style={styles.tabButton}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <Icon 
      name={tab.icon} 
      size={24} 
      color={isActive ? COLORS.secondary : '#E8F5E9'} 
    />
    <Text style={[
      styles.tabButtonText,
      isActive && styles.activeTabText
    ]}>
      {tab.label}
    </Text>
  </TouchableOpacity>
);

// Module Modal Component
const ModuleModal = ({ modalVisible, setModalVisible, selectedModule }) => (
  <Modal
    animationType="fade"
    transparent={true}
    visible={modalVisible}
    onRequestClose={() => setModalVisible(false)}
  >
    <View style={styles.modalContainer}>
      <View style={styles.modalContent}>
        {selectedModule && (
          <>
            <View style={[styles.modalHeader, { backgroundColor: selectedModule.color }]}>
              <Icon name={selectedModule.icon} size={30} color="#fff" />
              <Text style={styles.modalTitle}>{selectedModule.title}</Text>
            </View>
            <View style={styles.modalBody}>
              <Text style={styles.modalDescription}>{selectedModule.description}</Text>
            </View>
          </>
        )}
        <Pressable
          style={styles.closeButton}
          onPress={() => setModalVisible(false)}
          android_ripple={{ color: COLORS.primaryLight }}
        >
          <Text style={styles.closeButtonText}>Close</Text>
        </Pressable>
      </View>
    </View>
  </Modal>
);

// Home Screen Component
const HomeScreen = ({ setSelectedModule, setModalVisible, searchQuery, setSearchQuery, navigation }) => {
  const filteredModules = useMemo(() => 
    MAIN_MODULES.filter(module => 
      module.title.toLowerCase().includes(searchQuery.toLowerCase())
    ), 
    [searchQuery]
  );

  const handleModulePress = useCallback((module) => {
    if (module.screen) {
      navigation.navigate(module.screen);
    } else {
      setSelectedModule(module);
      setModalVisible(true);
    }
    
  }, [navigation]);

  return (
    <ScrollView 
      style={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Icon name="school" size={40} color="#fff" />
        </View>
        <Text style={styles.title}>Study Pro AI</Text>
        <Text style={styles.subtitle}>Your Complete Learning Platform</Text>
      </View>

      <SearchBar 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Features</Text>
        
        {filteredModules.length === 0 ? (
          <EmptyState />
        ) : (
          <ModuleGrid 
            modules={filteredModules}
            onModulePress={handleModulePress}
          />
        )}
      </View>
    </ScrollView>
  );
};

const SearchBar = ({ searchQuery, setSearchQuery }) => (
  <View style={styles.searchContainer}>
    <Icon name="search" size={20} color={COLORS.textSecondary} style={styles.searchIcon} />
    <TextInput
      style={styles.searchInput}
      placeholder="Search ..."
      placeholderTextColor={COLORS.textSecondary}
      value={searchQuery}
      onChangeText={setSearchQuery}
      clearButtonMode="while-editing"
    />
    {searchQuery ? (
      <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={10}>
        <Icon name="close-circle" size={20} color={COLORS.textSecondary} />
      </TouchableOpacity>
    ) : null}
  </View>
);

const EmptyState = () => (
  <View style={styles.emptyState}>
    <Icon name="warning" size={40} color={COLORS.textSecondary} />
    <Text style={styles.emptyText}>No modules found matching your search</Text>
  </View>
);

const ModuleGrid = ({ modules, onModulePress }) => (
  <FlatList
    data={modules}
    numColumns={2}
    columnWrapperStyle={styles.grid}
    keyExtractor={(item) => item.id}
    renderItem={({ item }) => (
      <ModuleCard 
        module={item}
        onPress={() => onModulePress(item)}
      />
    )}
    scrollEnabled={false}
  />
);

const ModuleCard = ({ module, onPress }) => (
  <TouchableOpacity 
    style={[styles.card, { backgroundColor: module.color }]}
    onPress={onPress}
    activeOpacity={0.8}
  >
    <Icon name={module.icon} size={28} color="#fff" />
    <Text style={styles.cardText}>{module.title}</Text>
  </TouchableOpacity>
);

// Messages Screen Component
const MessagesScreen = () => (
  <View style={[styles.container, styles.centerContent]}>
    <View style={styles.screenIcon}>
      <Icon name="chatbubbles" size={50} color="#5E35B1" />
    </View>
    <Text style={styles.screenTitle}>Messages</Text>
    <Text style={styles.screenSubtitle}>Your messages will appear here</Text>
  </View>
);

// Notifications Screen Component
const NotificationsScreen = () => (
  <View style={[styles.container, styles.centerContent]}>
    <View style={styles.screenIcon}>
      <Icon name="notifications" size={50} color="#039BE5" />
    </View>
    <Text style={styles.screenTitle}>Notifications</Text>
    <Text style={styles.screenSubtitle}>Your notifications will appear here</Text>
  </View>
);

// Profile Screen Component
const ProfileScreen = () => {
  const profileInfo = [
    { icon: 'mail', text: 'user@educonnect.com' },
    { icon: 'calendar', text: 'Member since: Jan 2025' },
    { icon: 'trophy', text: 'Learning Streak: 15 days' }
  ];

  return (
    <ScrollView 
      style={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.header, { paddingBottom: 20 }]}>
        <Text style={styles.title}>Profile</Text>
      </View>
      
      <View style={styles.section}>
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Icon name="person-circle" size={80} color={COLORS.primary} />
          </View>
          <Text style={styles.profileName}>User Profile</Text>
          <Text style={styles.profileRole}>Premium Member</Text>
          
          <View style={styles.profileInfo}>
            {profileInfo.map((info, index) => (
              <ProfileInfoRow 
                key={index}
                icon={info.icon}
                text={info.text}
                isLast={index === profileInfo.length - 1}
              />
            ))}
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const ProfileInfoRow = ({ icon, text, isLast }) => (
  <View style={[
    styles.infoRow,
    !isLast && { 
      borderBottomWidth: 1,
      borderBottomColor: COLORS.border
    }
  ]}>
    <Icon name={icon} size={20} color={COLORS.primary} />
    <Text style={styles.infoText}>{text}</Text>
  </View>
);

// Styles
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  header: {
    padding: 20,
    backgroundColor: COLORS.primary,
    paddingBottom: 25,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 4,
    shadowColor: '#557822',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(126, 56, 56, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 15
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 5
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginBottom: 15
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 5,
    elevation: 2
  },
  searchIcon: {
    marginRight: 10
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text
  },
  section: {
    padding: 20
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 15
  },
  grid: {
    justifyContent: 'space-between',
    marginBottom: 15
  },
  card: {
    width: '48%',
    aspectRatio: 1,
    borderRadius: 12,
    marginBottom: 15,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardText: {
    color: '#fff',
    fontWeight: '600',
    marginTop: 10,
    fontSize: 14,
    textAlign: 'center'
  },
  emptyState: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    marginTop: 10
  },
  emptyText: {
    color: COLORS.textSecondary,
    marginTop: 10,
    textAlign: 'center'
  },
  bottomTab: {
    flexDirection: 'row',
    height: 60,
    backgroundColor: COLORS.primary,
    borderTopWidth: 1,
    borderTopColor: COLORS.primaryDark
  },
  tabButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  tabButtonText: {
    color: '#E8F5E9',
    fontSize: 12,
    marginTop: 4
  },
  activeTabText: {
    color: COLORS.secondary,
    fontWeight: 'bold'
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)'
  },
  modalContent: {
    width: '90%',
    backgroundColor: COLORS.card,
    borderRadius: 12,
    overflow: 'hidden'
  },
  modalHeader: {
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center'
  },
  modalTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 10
  },
  modalBody: {
    padding: 20
  },
  modalDescription: {
    fontSize: 16,
    color: COLORS.text,
    lineHeight: 24,
    marginBottom: 20
  },
  closeButton: {
    padding: 15,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: COLORS.border
  },
  closeButtonText: {
    color: COLORS.primary,
    fontWeight: 'bold',
    fontSize: 16
  },
  profileCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  avatar: {
    alignItems: 'center',
    marginBottom: 15
  },
  profileName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 5
  },
  profileRole: {
    fontSize: 16,
    color: COLORS.primary,
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: '600'
  },
  profileInfo: {
    marginTop: 15
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    paddingBottom: 15
  },
  infoText: {
    marginLeft: 10,
    fontSize: 16,
    color: COLORS.text
  },
  screenIcon: {
    backgroundColor: 'rgba(30, 136, 229, 0.1)',
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 10
  },
  screenSubtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 30
  }
});

export default MainHome;
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Image, 
  TextInput, 
  FlatList 
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Entypo from 'react-native-vector-icons/Entypo';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
const UiScreen = () => {
  const [activeTab, setActiveTab] = useState('school');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeLevel, setActiveLevel] = useState('A');
  const [imageUri, setImageUri] = useState(null);

  const openCamera = () => {
    launchCamera({ mediaType: 'photo' }, (response) => {
      if (!response.didCancel && !response.errorCode && response.assets) {
        setImageUri(response.assets[0].uri);
      }
    });
  };

  const openGallery = () => {
    launchImageLibrary({ mediaType: 'photo' }, (response) => {
      if (!response.didCancel && !response.errorCode && response.assets) {
        setImageUri(response.assets[0].uri);
      }
    });
  };
  // Sample data
  const schoolSubjects = [
    { id: '1', name: 'Mathematics', icon: 'calculate' },
    { id: '2', name: 'Science', icon: 'science' },
    { id: '3', name: 'English', icon: 'menu-book' },
    { id: '4', name: 'History', icon: 'history' },
    { id: '5', name: 'Computer Science', icon: 'computer' },
  ];

  const selfStudyTopics = [
    { id: '1', title: 'Algebra Fundamentals', level: 'A', progress: 65 },
    { id: '2', title: 'Chemistry Basics', level: 'A', progress: 40 },
    { id: '3', title: 'Advanced Calculus', level: 'A+', progress: 20 },
    { id: '4', title: 'Literature Analysis', level: 'B', progress: 80 },
  ];

  const aiTutorQuestions = [
    { id: '1', question: 'Explain the Pythagorean theorem with examples.' },
    { id: '2', question: 'What are the main themes in Shakespeare\'s Macbeth?' },
    { id: '3', question: 'How does photosynthesis work in plants?' },
  ];

  const levels = ['A', 'A+', 'B', 'C', 'D', 'E'];

  const renderSubjectItem = ({ item }) => (
    <TouchableOpacity style={styles.subjectCard}>
      <Icon name={item.icon} size={40} color="#4e9af1" />
      <Text style={styles.subjectName}>{item.name}</Text>
    </TouchableOpacity>
  );

  const renderSelfStudyItem = ({ item }) => (
    <TouchableOpacity style={styles.studyCard}>
      <View style={styles.studyCardHeader}>
        <Text style={styles.studyLevel}>Level: {item.level}</Text>
        <FontAwesome name="bookmark" size={20} color="#ff6b6b" />
      </View>
      <Text style={styles.studyTitle}>{item.title}</Text>
      <View style={styles.progressContainer}>
        <View style={[styles.progressBar, { width: `${item.progress}%` }]} />
      </View>
      <Text style={styles.progressText}>{item.progress}% Complete</Text>
      <TouchableOpacity style={styles.continueButton}>
        <Text style={styles.continueButtonText}>Continue</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderQuestionItem = ({ item }) => (
    <TouchableOpacity style={styles.questionCard}>
      <Text style={styles.questionText}>{item.question}</Text>
      <View style={styles.questionActions}>
        <TouchableOpacity style={styles.askButton}>
          <Text style={styles.askButtonText}>Ask AI Tutor</Text>
        </TouchableOpacity>
        <TouchableOpacity>
          <Entypo name="chevron-right" size={24} color="#4e9af1" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>StudyProAI</Text>
        <TouchableOpacity>
          <Ionicons name="notifications-outline" size={24} color="black" />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Icon name="search" size={24} color="gray" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search for topics, questions..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'school' && styles.activeTab]}
          onPress={() => setActiveTab('school')}
        >
          <Text style={[styles.tabText, activeTab === 'school' && styles.activeTabText]}>School</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'selfStudy' && styles.activeTab]}
          onPress={() => setActiveTab('selfStudy')}
        >
          <Text style={[styles.tabText, activeTab === 'selfStudy' && styles.activeTabText]}>Self Study</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'aiTutor' && styles.activeTab]}
          onPress={() =>{
            //  setActiveTab('aiTutor')
            openGallery()
          }}
        >
          <Text style={[styles.tabText, activeTab === 'aiTutor' && styles.activeTabText]}>AI Tutor</Text>
        </TouchableOpacity>
      </View>

      {/* Content based on active tab */}
      <ScrollView style={styles.contentContainer}>
        {activeTab === 'school' && (
          <>
            <Text style={styles.sectionTitle}>Your School Subjects</Text>
            <FlatList
              data={schoolSubjects}
              renderItem={renderSubjectItem}
              keyExtractor={item => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.subjectList}
            />
            
            <Text style={styles.sectionTitle}>Recent Activities</Text>
            <View style={styles.activityCard}>
              <Image source={{ uri: 'https://example.com/math_quiz.png' }} style={styles.activityImage} />
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>Math Quiz Results</Text>
                <Text style={styles.activitySubtitle}>Scored 85/100 - Top 10% of class</Text>
                <Text style={styles.activityTime}>2 days ago</Text>
              </View>
            </View>
          </>
        )}

        {activeTab === 'selfStudy' && (
          <>
            <Text style={styles.sectionTitle}>Your Study Progress</Text>
            <View style={styles.levelSelector}>
              {levels.map(level => (
                <TouchableOpacity
                  key={level}
                  style={[styles.levelButton, activeLevel === level && styles.activeLevelButton]}
                  onPress={() => setActiveLevel(level)}
                >
                  <Text style={[styles.levelText, activeLevel === level && styles.activeLevelText]}>
                    {level}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <FlatList
              data={selfStudyTopics.filter(item => item.level === activeLevel || activeLevel === 'A')}
              renderItem={renderSelfStudyItem}
              keyExtractor={item => item.id}
              scrollEnabled={false}
            />
            
            <TouchableOpacity style={styles.addButton}>
              <Text style={styles.addButtonText}>+ Add New Study Topic</Text>
            </TouchableOpacity>
          </>
        )}

        {activeTab === 'aiTutor' && (
          <>
            <Text style={styles.sectionTitle}>Ask AI Tutor</Text>
            <View style={styles.aiPromptContainer}>
              <TextInput
                style={styles.aiInput}
                placeholder="Ask any question about your studies..."
                multiline
              />
              <TouchableOpacity style={styles.aiSendButton}>
                <Icon name="send" size={24} color="white" />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.sectionTitle}>Recent Questions</Text>
            <FlatList
              data={aiTutorQuestions}
              renderItem={renderQuestionItem}
              keyExtractor={item => item.id}
              scrollEnabled={false}
            />
            
            <Text style={styles.sectionTitle}>Suggested Questions</Text>
            <View style={styles.suggestedQuestions}>
              <TouchableOpacity style={styles.suggestedQuestion}>
                <Text style={styles.suggestedQuestionText}>Explain quantum physics basics</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.suggestedQuestion}>
                <Text style={styles.suggestedQuestionText}>Help with algebra problem</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.suggestedQuestion}>
                <Text style={styles.suggestedQuestionText}>History of ancient Rome</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
    paddingTop: 50,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginHorizontal: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tab: {
    paddingBottom: 10,
    marginRight: 25,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#4e9af1',
  },
  tabText: {
    fontSize: 16,
    color: 'gray',
  },
  activeTabText: {
    color: '#2c3e50',
    fontWeight: 'bold',
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#2c3e50',
  },
  subjectList: {
    paddingBottom: 10,
  },
  subjectCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
    width: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  subjectName: {
    marginTop: 10,
    fontSize: 14,
    textAlign: 'center',
  },
  activityCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    flexDirection: 'row',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  activityImage: {
    width: 60,
    height: 60,
    borderRadius: 10,
    marginRight: 15,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  activitySubtitle: {
    fontSize: 14,
    color: 'gray',
    marginBottom: 5,
  },
  activityTime: {
    fontSize: 12,
    color: '#4e9af1',
  },
  levelSelector: {
    flexDirection: 'row',
    marginBottom: 15,
    flexWrap: 'wrap',
  },
  levelButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#e0e0e0',
    marginRight: 10,
    marginBottom: 10,
  },
  activeLevelButton: {
    backgroundColor: '#4e9af1',
  },
  levelText: {
    color: '#2c3e50',
  },
  activeLevelText: {
    color: 'white',
  },
  studyCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  studyCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  studyLevel: {
    color: '#4e9af1',
    fontWeight: 'bold',
  },
  studyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  progressContainer: {
    height: 5,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
    marginBottom: 5,
  },
  progressBar: {
    height: 5,
    backgroundColor: '#4e9af1',
    borderRadius: 5,
  },
  progressText: {
    fontSize: 12,
    color: 'gray',
    marginBottom: 15,
  },
  continueButton: {
    backgroundColor: '#4e9af1',
    paddingVertical: 8,
    borderRadius: 5,
    alignItems: 'center',
  },
  continueButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  addButton: {
    borderWidth: 1,
    borderColor: '#4e9af1',
    borderRadius: 5,
    padding: 15,
    alignItems: 'center',
    marginBottom: 20,
  },
  addButtonText: {
    color: '#4e9af1',
    fontWeight: 'bold',
  },
  aiPromptContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  aiInput: {
    minHeight: 100,
    textAlignVertical: 'top',
    fontSize: 16,
    marginBottom: 15,
  },
  aiSendButton: {
    backgroundColor: '#4e9af1',
    borderRadius: 25,
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-end',
  },
  questionCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  questionText: {
    fontSize: 16,
    marginBottom: 15,
  },
  questionActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  askButton: {
    backgroundColor: '#4e9af1',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 5,
  },
  askButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  suggestedQuestions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  suggestedQuestion: {
    backgroundColor: '#e3f2fd',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 10,
    marginBottom: 10,
  },
  suggestedQuestionText: {
    color: '#1976d2',
  },
});

export default UiScreen;
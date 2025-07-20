import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  Alert,
  Linking,
  Image,
  RefreshControl,
  Platform,
  StatusBar,
  Dimensions,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  TextInput
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useFocusEffect } from '@react-navigation/native';

// Constants
const { width, height } = Dimensions.get('window');
const IS_IPHONE_X = Platform.OS === 'ios' && (height >= 812 || width >= 812);
const RESOURCE_TYPES = {
  BOOK: { icon: 'book', color: '#3498db', label: 'Textbook' },
  PDF: { icon: 'picture-as-pdf', color: '#e74c3c', label: 'PDF' },
  VIDEO: { icon: 'ondemand-video', color: '#9b59b6', label: 'Video' },
  EXAM: { icon: 'assignment', color: '#f39c12', label: 'Exam' },
  PAST_PAPER: { icon: 'history-edu', color: '#16a085', label: 'Past Paper' },
  MODEL_PAPER: { icon: 'description', color: '#8e44ad', label: 'Model Paper' },
  NOTES: { icon: 'note', color: '#27ae60', label: 'Notes' }
};

const SelfStudy = ({ navigation }) => {
  // State management
  const [state, setState] = useState({
    loading: true,
    refreshing: false,
    studyLevels: [],
    selectedLevel: null,
    resources: [],
    subjects: [],
    selectedSubject: null,
    boards: [],
    selectedBoard: null,
    favorites: [],
    searchQuery: '',
    resourceFilter: 'all' // 'all', 'past_papers', 'model_papers', 'videos', 'books'
  });

  // Memoized data
  const filteredResources = useMemo(() => {
    let filtered = state.resources.filter(resource =>
      resource.title.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
      (resource.author && resource.author.toLowerCase().includes(state.searchQuery.toLowerCase()))
    );

    // Apply resource type filter
    switch (state.resourceFilter) {
      case 'past_papers':
        filtered = filtered.filter(r => r.type === 'PAST_PAPER');
        break;
      case 'model_papers':
        filtered = filtered.filter(r => r.type === 'MODEL_PAPER');
        break;
      case 'videos':
        filtered = filtered.filter(r => r.type === 'VIDEO');
        break;
      case 'books':
        filtered = filtered.filter(r => r.type === 'BOOK' || r.type === 'PDF');
        break;
      default:
        break;
    }

    return filtered;
  }, [state.resources, state.searchQuery, state.resourceFilter]);

  // Data fetching
  const loadData = useCallback(() => {
    setState(prev => ({ ...prev, loading: true }));
    
    // Simulate API call with realistic data structure
    setTimeout(() => {
      const levels = [
        // School Levels (6th-10th)
        { id: '6', name: 'Class 6', description: '6th Grade', icon: 'school', type: 'school' },
        { id: '7', name: 'Class 7', description: '7th Grade', icon: 'school', type: 'school' },
        { id: '8', name: 'Class 8', description: '8th Grade', icon: 'school', type: 'school' },
        { id: '9', name: 'Class 9', description: '9th Grade (Matric Part 1)', icon: 'school', type: 'school' },
        { id: '10', name: 'Class 10', description: '10th Grade (Matric Part 2)', icon: 'school', type: 'school' },
        
        // College/University Levels
        { id: '11', name: '1st Year', description: 'Intermediate Part 1', icon: 'apartment', type: 'college' },
        { id: '12', name: '2nd Year', description: 'Intermediate Part 2', icon: 'apartment', type: 'college' },
        { id: '13', name: '3rd Year', description: 'Bachelor Degree', icon: 'apartment', type: 'college' },
        { id: '14', name: '4th Year', description: 'Bachelor Degree', icon: 'apartment', type: 'college' },
        
        // Special Programs
        { id: 'olevel', name: 'O-Level', description: 'Cambridge International', icon: 'language', type: 'special' },
        { id: 'alevel', name: 'A-Level', description: 'Cambridge Advanced', icon: 'star', type: 'special' }
      ];

      const boards = [
        { id: 'b1', name: 'FBISE', region: 'Federal', shortName: 'FBISE' },
        { id: 'b2', name: 'Punjab Board', region: 'Punjab', shortName: 'Punjab' },
        { id: 'b3', name: 'Sindh Board', region: 'Sindh', shortName: 'Sindh' },
        { id: 'b4', name: 'KPK Board', region: 'Khyber Pakhtunkhwa', shortName: 'KPK' },
        { id: 'b5', name: 'Balochistan Board', region: 'Balochistan', shortName: 'Baloch' },
        { id: 'b6', name: 'AJK Board', region: 'Azad Kashmir', shortName: 'AJK' }
      ];

      // Common subjects for all levels
      const commonSubjects = [
        { id: 'math', name: 'Mathematics', icon: 'calculate' },
        { id: 'physics', name: 'Physics', icon: 'science' },
        { id: 'chemistry', name: 'Chemistry', icon: 'experiment' },
        { id: 'biology', name: 'Biology', icon: 'nature' },
        { id: 'english', name: 'English', icon: 'translate' },
        { id: 'urdu', name: 'Urdu', icon: 'menu-book' },
        { id: 'islamiat', name: 'Islamiat', icon: 'mosque' },
        { id: 'pakstudies', name: 'Pakistan Studies', icon: 'public' }
      ];

      // Additional subjects for higher classes
      const higherSubjects = [
        { id: 'computer', name: 'Computer Science', icon: 'computer' },
        { id: 'economics', name: 'Economics', icon: 'trending-up' },
        { id: 'accounting', name: 'Accounting', icon: 'calculate' },
        { id: 'statistics', name: 'Statistics', icon: 'bar-chart' }
      ];

      setState(prev => ({
        ...prev,
        studyLevels: levels,
        boards,
        subjects: [...commonSubjects, ...higherSubjects],
        loading: false,
        refreshing: false
      }));
    }, 800);
  }, []);

  // Refresh control
  const onRefresh = useCallback(() => {
    setState(prev => ({ ...prev, refreshing: true }));
    loadData();
  }, [loadData]);

  // Resource fetching with caching simulation
  const fetchResources = useCallback((level, subject = null, board = null) => {
    setState(prev => ({
      ...prev,
      selectedLevel: level,
      selectedSubject: subject,
      selectedBoard: board,
      loading: true,
      resourceFilter: 'all'
    }));

    // Simulate API call with caching
    setTimeout(() => {
      const resources = generateMockResources(level, subject, board);
      setState(prev => ({
        ...prev,
        resources,
        loading: false
      }));
    }, 600);
  }, []);

  // Enhanced resource generation logic with more past papers and model papers
  const generateMockResources = (level, subject, board) => {
    const currentYear = new Date().getFullYear();
    const baseResources = [
      {
        id: `resource-${Date.now()}-1`,
        title: `${board ? board.shortName + ' ' : ''}${level.name} ${subject?.name || 'Textbook'}`,
        type: 'BOOK',
        author: board ? `${board.name}` : 'Punjab Textbook Board',
        url: 'https://ptb.gon.pk',
        description: 'Official curriculum textbook with solved examples',
        rating: 4.5,
        views: 12450,
        lastUpdated: '2023-05-15',
        level: level.id,
        year: currentYear
      }
    ];

    // Add past papers for 9th-12th grades
    if (['9', '10', '11', '12'].includes(level.id)) {
      // Add 5 years of past papers
      for (let year = currentYear - 1; year >= currentYear - 5; year--) {
        baseResources.push({
          id: `past-paper-${level.id}-${subject?.id || 'general'}-${year}`,
          title: `${board?.shortName || ''} ${level.name} ${subject?.name || ''} Past Paper ${year}`,
          type: 'PAST_PAPER',
          author: board ? board.name : 'Board Official',
          url: `https://www.pastpapers.pk/${level.id}/${subject?.id || 'general'}/${year}`,
          description: `Board examination paper ${year} with marking scheme`,
          rating: 4.7,
          views: 15000 + (currentYear - year) * 1000,
          lastUpdated: `${year}-12-15`,
          level: level.id,
          year
        });
      }

      // Add model papers
      baseResources.push({
        id: `model-paper-${level.id}-${subject?.id || 'general'}`,
        title: `${board?.shortName || ''} ${level.name} ${subject?.name || ''} Model Paper`,
        type: 'MODEL_PAPER',
        author: board ? board.name : 'Board Official',
        url: `https://www.modelpapers.pk/${level.id}/${subject?.id || 'general'}`,
        description: 'Board-issued model paper with solutions',
        rating: 4.6,
        views: 12000,
        lastUpdated: `${currentYear}-01-10`,
        level: level.id,
        year: currentYear
      });

      // Add guess papers for important subjects
      if (subject && ['math', 'physics', 'chemistry', 'biology', 'computer'].includes(subject.id)) {
        baseResources.push({
          id: `guess-paper-${level.id}-${subject.id}`,
          title: `${board?.shortName || ''} ${level.name} ${subject.name} Guess Paper`,
          type: 'PDF',
          author: 'Expert Teachers',
          url: `https://www.guesspapers.pk/${level.id}/${subject.id}`,
          description: 'Important questions likely to appear in exams',
          rating: 4.4,
          views: 9800,
          lastUpdated: `${currentYear}-03-01`,
          level: level.id,
          year: currentYear
        });
      }
    }

    // Add common resources
    baseResources.push(
      {
        id: `resource-${Date.now()}-2`,
        title: `${level.name} ${subject?.name || ''} Solved Exercises`,
        type: 'PDF',
        author: 'Ilm Ki Dunya',
        url: 'https://www.ilmkidunya.com',
        description: 'Step-by-step solutions to textbook problems',
        rating: 4.2,
        views: 8920,
        lastUpdated: '2023-03-22',
        level: level.id,
        year: currentYear
      },
      {
        id: `resource-${Date.now()}-3`,
        title: `${level.name} ${subject?.name || ''} Short Notes`,
        type: 'NOTES',
        author: 'Study Portal',
        url: 'https://www.studyportal.com',
        description: 'Condensed notes for quick revision',
        rating: 4.3,
        views: 10500,
        lastUpdated: '2023-04-18',
        level: level.id,
        year: currentYear
      }
    );

    // Add level-specific resources
    if (level.type === 'school') {
      baseResources.push(
        {
          id: `resource-${Date.now()}-4`,
          title: `${level.name} ${subject?.name || 'Science'} Video Lectures`,
          type: 'VIDEO',
          author: 'Taleem City',
          url: 'https://taleemcity.com',
          description: 'Urdu/Hindi video explanations of all chapters',
          rating: 4.7,
          views: 18700,
          lastUpdated: '2023-02-18',
          level: level.id,
          year: currentYear
        }
      );
      
      // Add special resources for 9th and 10th grade
      if (['9', '10'].includes(level.id)) {
        baseResources.push({
          id: `resource-${Date.now()}-5`,
          title: `${level.name} Matric Preparation Guide`,
          type: 'BOOK',
          author: 'Ilm Ki Dunya',
          url: 'https://www.ilmkidunya.com/matric',
          description: 'Complete preparation guide for matric exams',
          rating: 4.6,
          views: 15300,
          lastUpdated: '2023-03-15',
          level: level.id,
          year: currentYear
        });
      }
    } else if (level.type === 'college') {
      baseResources.push(
        {
          id: `resource-${Date.now()}-6`,
          title: `${level.name} ${subject?.name || ''} Lecture Notes`,
          type: 'NOTES',
          author: 'Virtual University',
          url: 'https://vu.edu.pk',
          description: 'Comprehensive lecture notes for college students',
          rating: 4.4,
          views: 9800,
          lastUpdated: '2023-04-20',
          level: level.id,
          year: currentYear
        },
        {
          id: `resource-${Date.now()}-7`,
          title: `${level.name} Solved Assignments`,
          type: 'PDF',
          author: 'All Boards',
          url: 'https://www.ilmkidunya.com/assignments',
          description: 'Solved assignments for practice',
          rating: 4.2,
          views: 11200,
          lastUpdated: '2023-02-10',
          level: level.id,
          year: currentYear
        }
      );
    } else {
      // Special programs (O-Level/A-Level)
      baseResources.push(
        {
          id: `resource-${Date.now()}-8`,
          title: `${level.name} ${subject?.name || ''} Revision Guide`,
          type: 'BOOK',
          author: 'Cambridge International',
          url: 'https://www.cambridgeinternational.org',
          description: 'Condensed notes for quick revision before exams',
          rating: 4.6,
          views: 10500,
          lastUpdated: '2023-06-01',
          level: level.id,
          year: currentYear
        }
      );
    }

    return baseResources;
  };

  // Handlers
  const handleResourcePress = useCallback((url) => {
    Alert.alert(
      "Open Resource",
      "This will open in your browser. Do you want to continue?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Open", 
          onPress: () => Linking.openURL(url).catch(() => {
            Alert.alert("Error", "Couldn't open the link. Please check your internet connection.");
          })
        }
      ]
    );
  }, []);

  const toggleFavorite = useCallback((resourceId) => {
    setState(prev => {
      const newFavorites = prev.favorites.includes(resourceId)
        ? prev.favorites.filter(id => id !== resourceId)
        : [...prev.favorites, resourceId];
      
      // Show feedback to user
      if (newFavorites.length > prev.favorites.length) {
        Alert.alert("Saved", "Resource added to your favorites");
      }
      
      return { ...prev, favorites: newFavorites };
    });
  }, []);

  const setResourceFilter = useCallback((filter) => {
    setState(prev => ({ ...prev, resourceFilter: filter }));
  }, []);

  // Navigation effects
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  // Render items with memoization
  const renderLevelItem = useCallback(({ item }) => (
    <TouchableOpacity
      style={[
        styles.levelItem,
        state.selectedLevel?.id === item.id && styles.selectedLevel,
        item.type === 'school' && styles.schoolLevel,
        item.type === 'college' && styles.collegeLevel,
        item.type === 'special' && styles.specialLevel
      ]}
      onPress={() => fetchResources(item)}
      accessibilityLabel={`${item.name} level`}
      accessibilityHint={`Select ${item.description}`}
    >
      <Icon 
        name={item.icon} 
        size={28} 
        color={state.selectedLevel?.id === item.id ? '#fff' : 
              item.type === 'school' ? '#046a38' :
              item.type === 'college' ? '#8e44ad' : '#e67e22'} 
        style={styles.levelIcon}
      />
      <Text style={[
        styles.levelTitle,
        state.selectedLevel?.id === item.id && styles.selectedText
      ]}>
        {item.name}
      </Text>
      <Text style={[
        styles.levelDescription,
        state.selectedLevel?.id === item.id && styles.selectedText
      ]}>
        {item.description}
      </Text>
    </TouchableOpacity>
  ), [state.selectedLevel, fetchResources]);

  const renderBoardItem = useCallback(({ item }) => (
    <TouchableOpacity
      style={[
        styles.boardItem,
        state.selectedBoard?.id === item.id && styles.selectedBoard
      ]}
      onPress={() => fetchResources(state.selectedLevel, null, item)}
      accessibilityLabel={`${item.name} board`}
    >
      <View style={styles.boardIconContainer}>
        <Text style={[
          styles.boardIconText,
          state.selectedBoard?.id === item.id && styles.selectedText
        ]}>
          {item.shortName}
        </Text>
      </View>
      <Text style={[
        styles.boardTitle,
        state.selectedBoard?.id === item.id && styles.selectedText
      ]}>
        {item.name}
      </Text>
    </TouchableOpacity>
  ), [state.selectedLevel, state.selectedBoard, fetchResources]);

  const renderSubjectItem = useCallback(({ item }) => (
    <TouchableOpacity
      style={[
        styles.subjectItem,
        state.selectedSubject?.id === item.id && styles.selectedSubject
      ]}
      onPress={() => fetchResources(state.selectedLevel, item, state.selectedBoard)}
      accessibilityLabel={`${item.name} subject`}
    >
      <Icon 
        name={item.icon} 
        size={22} 
        color={state.selectedSubject?.id === item.id ? '#fff' : '#046a38'} 
      />
      <Text style={[
        styles.subjectTitle,
        state.selectedSubject?.id === item.id && styles.selectedText
      ]}>
        {item.name}
      </Text>
    </TouchableOpacity>
  ), [state.selectedLevel, state.selectedBoard, state.selectedSubject, fetchResources]);

  const renderResourceItem = useCallback(({ item }) => {
    const resourceType = RESOURCE_TYPES[item.type] || RESOURCE_TYPES.BOOK;
    
    return (
      <View style={styles.resourceItem}>
        <View style={styles.resourceHeader}>
          <View style={[styles.resourceTypeBadge, { backgroundColor: resourceType.color }]}>
            <Icon name={resourceType.icon} size={18} color="#fff" />
            <Text style={styles.resourceTypeText}>{resourceType.label}</Text>
          </View>
          {item.year && (
            <View style={styles.yearBadge}>
              <Text style={styles.yearText}>{item.year}</Text>
            </View>
          )}
          <TouchableOpacity
            onPress={() => toggleFavorite(item.id)}
            accessibilityLabel={state.favorites.includes(item.id) ? 
              "Remove from favorites" : "Add to favorites"}
          >
            <Icon
              name={state.favorites.includes(item.id) ? 'favorite' : 'favorite-border'}
              size={24}
              color={state.favorites.includes(item.id) ? '#e74c3c' : '#95a5a6'}
            />
          </TouchableOpacity>
        </View>
        
        <TouchableWithoutFeedback 
          onPress={() => handleResourcePress(item.url)}
          accessibilityLabel={`Open ${item.title}`}
        >
          <View>
            <Text style={styles.resourceTitle} numberOfLines={2}>{item.title}</Text>
            <Text style={styles.resourceMeta}>
              {item.author} • {item.views.toLocaleString()} views
            </Text>
            <Text style={styles.resourceDescription} numberOfLines={2}>
              {item.description}
            </Text>
            
            <View style={styles.resourceFooter}>
              <View style={styles.ratingContainer}>
                <Icon name="star" size={16} color="#f39c12" />
                <Text style={styles.ratingText}>{item.rating}</Text>
                <Text style={styles.updateText}>Updated: {item.lastUpdated}</Text>
              </View>
              
              <View style={styles.openButton}>
                <Text style={styles.openButtonText}>Open</Text>
                <Icon name="chevron-right" size={16} color="#046a38" />
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </View>
    );
  }, [state.favorites, toggleFavorite, handleResourcePress]);

  // Loading state
  if (state.loading && state.studyLevels.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#046a38" />
        <Text style={styles.loadingText}>Loading Educational Resources...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <StatusBar backgroundColor="#01411C" barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.headerContainer}>
        <Image
          source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/3/32/Flag_of_Pakistan.svg' }}
          style={styles.flagIcon}
          accessibilityLabel="Pakistan Flag"
        />
        <View>
          <Text style={styles.header}>Pakistan e-Learning</Text>
          <Text style={styles.subHeader}>Free Educational Resources</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={state.refreshing}
            onRefresh={onRefresh}
            colors={['#046a38']}
            tintColor="#046a38"
          />
        }
        keyboardShouldPersistTaps="handled"
      >
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Icon name="search" size={20} color="#7f8c8d" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search resources..."
            placeholderTextColor="#95a5a6"
            value={state.searchQuery}
            onChangeText={(text) => setState(prev => ({ ...prev, searchQuery: text }))}
            clearButtonMode="while-editing"
          />
        </View>

        {/* Education Level Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Select Your Class/Year</Text>
          <Text style={styles.sectionSubtitle}>School (6th-10th) • College/University (1st-4th Year)</Text>
          <FlatList
            horizontal
            data={state.studyLevels}
            renderItem={renderLevelItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.levelList}
            showsHorizontalScrollIndicator={false}
          />
        </View>

        {/* Board Selection (Conditional) */}
        {state.selectedLevel && !['olevel', 'alevel'].includes(state.selectedLevel.id) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>2. Select Your Education Board</Text>
            <FlatList
              horizontal
              data={state.boards}
              renderItem={renderBoardItem}
              keyExtractor={item => item.id}
              contentContainerStyle={styles.boardList}
              showsHorizontalScrollIndicator={false}
            />
          </View>
        )}

        {/* Subject Selection (Conditional) */}
        {state.selectedLevel && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              3. Select Subject{state.selectedBoard ? ` for ${state.selectedBoard.shortName}` : ''}
            </Text>
            <FlatList
              horizontal
              data={state.subjects}
              renderItem={renderSubjectItem}
              keyExtractor={item => item.id}
              contentContainerStyle={styles.subjectList}
              showsHorizontalScrollIndicator={false}
            />
          </View>
        )}

        {/* Resources Display */}
        {state.selectedLevel ? (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                {state.selectedSubject ? 
                  `${state.selectedBoard?.shortName || ''} ${state.selectedLevel.name} ${state.selectedSubject.name}` : 
                  `${state.selectedBoard?.shortName || ''} ${state.selectedLevel.name} Resources`
                }
              </Text>
              {filteredResources.length > 0 && (
                <Text style={styles.sectionRightText}>{filteredResources.length} resources</Text>
              )}
            </View>
            
            {/* Resource Type Filter */}
            {filteredResources.length > 0 && (
              <View style={styles.filterContainer}>
                <TouchableOpacity
                  style={[
                    styles.filterButton,
                    state.resourceFilter === 'all' && styles.filterButtonActive
                  ]}
                  onPress={() => setResourceFilter('all')}
                >
                  <Text style={[
                    styles.filterButtonText,
                    state.resourceFilter === 'all' && styles.filterButtonTextActive
                  ]}>
                    All
                  </Text>
                </TouchableOpacity>
                
                {['9', '10', '11', '12'].includes(state.selectedLevel.id) && (
                  <>
                    <TouchableOpacity
                      style={[
                        styles.filterButton,
                        state.resourceFilter === 'past_papers' && styles.filterButtonActive
                      ]}
                      onPress={() => setResourceFilter('past_papers')}
                    >
                      <Text style={[
                        styles.filterButtonText,
                        state.resourceFilter === 'past_papers' && styles.filterButtonTextActive
                      ]}>
                        Past Papers
                      </Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={[
                        styles.filterButton,
                        state.resourceFilter === 'model_papers' && styles.filterButtonActive
                      ]}
                      onPress={() => setResourceFilter('model_papers')}
                    >
                      <Text style={[
                        styles.filterButtonText,
                        state.resourceFilter === 'model_papers' && styles.filterButtonTextActive
                      ]}>
                        Model Papers
                      </Text>
                    </TouchableOpacity>
                  </>
                )}
                
                <TouchableOpacity
                  style={[
                    styles.filterButton,
                    state.resourceFilter === 'videos' && styles.filterButtonActive
                  ]}
                  onPress={() => setResourceFilter('videos')}
                >
                  <Text style={[
                    styles.filterButtonText,
                    state.resourceFilter === 'videos' && styles.filterButtonTextActive
                  ]}>
                    Videos
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.filterButton,
                    state.resourceFilter === 'books' && styles.filterButtonActive
                  ]}
                  onPress={() => setResourceFilter('books')}
                >
                  <Text style={[
                    styles.filterButtonText,
                    state.resourceFilter === 'books' && styles.filterButtonTextActive
                  ]}>
                    Books/PDFs
                  </Text>
                </TouchableOpacity>
              </View>
            )}
            
            {state.loading ? (
              <ActivityIndicator size="large" color="#046a38" style={styles.resourceLoader} />
            ) : filteredResources.length > 0 ? (
              <FlatList
                data={filteredResources}
                renderItem={renderResourceItem}
                keyExtractor={item => item.id}
                scrollEnabled={false}
                ListEmptyComponent={
                  <View style={styles.noResults}>
                    <Icon name="search-off" size={40} color="#bdc3c7" />
                    <Text style={styles.noResultsText}>No matching resources found</Text>
                  </View>
                }
              />
            ) : (
              <View style={styles.noResources}>
                <Icon name="search-off" size={40} color="#bdc3c7" />
                <Text style={styles.noResourcesText}>No resources found for this selection</Text>
                <TouchableOpacity
                  style={styles.tryAgainButton}
                  onPress={() => fetchResources(state.selectedLevel, state.selectedSubject, state.selectedBoard)}
                >
                  <Text style={styles.tryAgainText}>Try Again</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ) : (
          <View style={styles.placeholder}>
            <Icon name="school" size={50} color="#bdc3c7" />
            <Text style={styles.placeholderText}>
              Select your class/year above to view available learning resources
            </Text>
          </View>
        )}

        {/* Help Section */}
        <View style={[styles.section, { paddingHorizontal: 0 }]}>
          <Text style={[styles.sectionTitle, { paddingHorizontal: 16 }]}>Need Help? Educational Support</Text>
          
          <View style={styles.supportGrid}>
            <TouchableOpacity 
              style={styles.supportButton} 
              onPress={() => handleResourcePress('https://elearn.punjab.gov.pk')}
            >
              <Icon name="cast-for-education" size={24} color="#fff" />
              <Text style={styles.supportButtonText}>Punjab e-Learn</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.supportButton} 
              onPress={() => handleResourcePress('https://taleem360.com')}
            >
              <Icon name="menu-book" size={24} color="#fff" />
              <Text style={styles.supportButtonText}>Textbooks</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.supportButton} 
              onPress={() => handleResourcePress('https://www.urdulessons.com')}
            >
              <Icon name="translate" size={24} color="#fff" />
              <Text style={styles.supportButtonText}>Urdu Learning</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.helpButton}
            onPress={() => navigation.navigate('HelpScreen')}
          >
            <Icon name="help" size={24} color="#fff" />
            <Text style={styles.helpButtonText}>More Help Resources</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Pakistan e-Learning Resources</Text>
          <Text style={styles.footerText}>All materials are for educational purposes only</Text>
          <Text style={styles.footerText}>Version 1.3.0</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  headerContainer: {
    backgroundColor: '#01411C',
    padding: 16,
    paddingTop: IS_IPHONE_X ? 44 : 16,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  flagIcon: {
    width: 30,
    height: 20,
    marginRight: 12,
    borderRadius: 2,
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  subHeader: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 16,
    color: '#7f8c8d',
    fontSize: 16,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#01411C',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 12,
  },
  sectionRightText: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  levelList: {
    paddingBottom: 8,
  },
  levelItem: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginRight: 12,
    width: 160,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  schoolLevel: {
    borderColor: '#046a38',
  },
  collegeLevel: {
    borderColor: '#8e44ad',
  },
  specialLevel: {
    borderColor: '#e67e22',
  },
  selectedLevel: {
    backgroundColor: '#046a38',
    borderColor: '#046a38',
  },
  levelIcon: {
    marginBottom: 8,
  },
  levelTitle: {
    fontWeight: 'bold',
    color: '#2c3e50',
    fontSize: 16,
    textAlign: 'center',
  },
  levelDescription: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 4,
    textAlign: 'center',
  },
  selectedText: {
    color: '#fff',
  },
  boardList: {
    paddingBottom: 8,
  },
  boardItem: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 10,
    marginRight: 10,
    width: 110,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  selectedBoard: {
    backgroundColor: '#046a38',
    borderColor: '#046a38',
  },
  boardIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e8f5e9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  boardIconText: {
    fontWeight: 'bold',
    color: '#046a38',
    fontSize: 16,
  },
  boardTitle: {
    fontWeight: '600',
    color: '#2c3e50',
    fontSize: 14,
    textAlign: 'center',
  },
  subjectList: {
    paddingBottom: 8,
  },
  subjectItem: {
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  selectedSubject: {
    backgroundColor: '#046a38',
    borderColor: '#046a38',
  },
  subjectTitle: {
    fontWeight: '500',
    color: '#2c3e50',
    marginLeft: 8,
    fontSize: 14,
  },
  resourceItem: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  resourceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    alignItems: 'center',
  },
  resourceTypeBadge: {
    flexDirection: 'row',
    paddingHorizontal: 8,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resourceTypeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  yearBadge: {
    backgroundColor: '#f1f1f1',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 8,
  },
  yearText: {
    fontSize: 12,
    color: '#7f8c8d',
    fontWeight: '500',
  },
  resourceTitle: {
    fontWeight: '600',
    color: '#2c3e50',
    fontSize: 16,
    lineHeight: 22,
  },
  resourceMeta: {
    fontSize: 13,
    color: '#7f8c8d',
    marginTop: 4,
  },
  resourceDescription: {
    fontSize: 14,
    color: '#34495e',
    marginTop: 8,
    lineHeight: 20,
  },
  resourceFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 14,
    color: '#f39c12',
    marginLeft: 4,
    fontWeight: 'bold',
    marginRight: 12,
  },
  updateText: {
    fontSize: 12,
    color: '#95a5a6',
  },
  openButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  openButtonText: {
    fontSize: 14,
    color: '#046a38',
    fontWeight: '500',
  },
  placeholder: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 16,
  },
  placeholderText: {
    color: '#7f8c8d',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 24,
  },
  noResources: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  noResourcesText: {
    color: '#7f8c8d',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
  },
  noResults: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  noResultsText: {
    color: '#7f8c8d',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 8,
  },
  tryAgainButton: {
    marginTop: 16,
    paddingVertical: 8,
    paddingHorizontal: 24,
    backgroundColor: '#046a38',
    borderRadius: 20,
  },
  tryAgainText: {
    color: '#fff',
    fontWeight: '500',
    fontSize: 14,
  },
  resourceLoader: {
    marginVertical: 20,
  },
  supportGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  supportButton: {
    backgroundColor: '#046a38',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    width: '48%',
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  supportButtonText: {
    color: '#fff',
    fontWeight: '500',
    marginLeft: 8,
    fontSize: 14,
  },
  helpButton: {
    backgroundColor: '#01411C',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
    marginHorizontal: 16,
  },
  helpButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
  footer: {
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#ecf0f1',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  footerText: {
    color: '#7f8c8d',
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 16,
    margin: 16,
    marginBottom: 8,
    height: 48,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    color: '#2c3e50',
  },
  filterContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: '#f8f9fa',
  },
  filterButtonActive: {
    backgroundColor: '#046a38',
    borderColor: '#046a38',
  },
  filterButtonText: {
    fontSize: 12,
    color: '#7f8c8d',
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: '#fff',
  },
});

export default SelfStudy;
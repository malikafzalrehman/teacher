import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator,
  Alert,
  RefreshControl,
  StatusBar,
  SafeAreaView,
  ScrollView,
  Platform,
  Linking,
  Modal,
  TextInput
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import FileViewer from 'react-native-file-viewer';
import RNFetchBlob from 'rn-fetch-blob';
import DocumentPicker from 'react-native-document-picker';
import moment from 'moment';

// Constants
const HomeworkStatus = {
  PENDING: 'pending',
  SUBMITTED: 'submitted',
  OVERDUE: 'overdue',
  GRADED: 'graded'
};

const FILE_VIEWER_ERROR_MSG = 'Could not open file. Make sure you have an app installed that can view this file type.';

const studentHomework = () => {
  // State management
  const [state, setState] = useState({
    homeworks: [],
    loading: false,
    refreshing: false,
    subjects: [],
    selectedSubject: null,
    downloading: false,
    activeFilter: 'all',
    searchQuery: '',
    submissionModalVisible: false,
    selectedHomework: null,
    submissionFiles: [],
    submissionNotes: ''
  });

  // Fetch homework data
  const fetchHomeworkData = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true }));
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockData = [
        {
          id: '1',
          subject: 'Mathematics',
          title: 'Algebra Assignment',
          description: 'Complete exercises 1-10 from chapter 3',
          dueDate: '2023-06-25',
          fileUrl: 'https://www.africau.edu/images/default/sample.pdf',
          fileName: 'math_assignment.pdf',
          submitted: false,
          grade: null,
          submissionDate: null,
          attachments: [
            { name: 'Worksheet.pdf', size: '2.4 MB' },
            { name: 'Instructions.docx', size: '1.2 MB' }
          ]
        },
        {
          id: '2',
          subject: 'Science',
          title: 'Physics Lab Report',
          description: 'Write a lab report on Newton\'s Laws of Motion',
          dueDate: '2023-06-28',
          fileUrl: 'https://www.africau.edu/images/default/sample.pdf',
          fileName: 'physics_report.pdf',
          submitted: true,
          grade: 'A',
          submissionDate: '2023-06-27',
          attachments: [
            { name: 'Lab Template.docx', size: '1.8 MB' }
          ]
        },
        {
          id: '3',
          subject: 'Mathematics',
          title: 'Geometry Problems',
          description: 'Solve the geometry problems sheet on triangles and circles',
          dueDate: '2023-06-30',
          fileUrl: 'https://www.africau.edu/images/default/sample.pdf',
          fileName: 'geometry_problems.pdf',
          submitted: false,
          grade: null,
          submissionDate: null,
          attachments: []
        },
      ];
      
      const uniqueSubjects = [...new Set(mockData.map(hw => hw.subject))];
      setState(prev => ({
        ...prev,
        homeworks: mockData,
        subjects: uniqueSubjects,
        loading: false,
        refreshing: false
      }));
    } catch (error) {
      Alert.alert('Error', 'Failed to load homework data');
      console.error('Fetch error:', error);
      setState(prev => ({ ...prev, loading: false, refreshing: false }));
    }
  }, []);

  useEffect(() => {
    fetchHomeworkData();
  }, [fetchHomeworkData]);

  // Refresh handler
  const onRefresh = useCallback(() => {
    setState(prev => ({ ...prev, refreshing: true }));
    fetchHomeworkData();
  }, [fetchHomeworkData]);

  // Helper functions
  const getHomeworkStatus = useCallback((homework) => {
    if (homework.grade) return HomeworkStatus.GRADED;
    if (homework.submitted) return HomeworkStatus.SUBMITTED;
    if (new Date(homework.dueDate) < new Date()) return HomeworkStatus.OVERDUE;
    return HomeworkStatus.PENDING;
  }, []);

  const getMimeType = useCallback((filename) => {
    const extension = filename.split('.').pop().toLowerCase();
    const mimeTypes = {
      pdf: 'application/pdf',
      doc: 'application/msword',
      docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      xls: 'application/vnd.ms-excel',
      xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      ppt: 'application/vnd.ms-powerpoint',
      pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      txt: 'text/plain'
    };
    return mimeTypes[extension] || 'application/octet-stream';
  }, []);

  // Filter homeworks
  const filteredHomeworks = useMemo(() => {
    return state.homeworks.filter(hw => {
      const subjectMatch = !state.selectedSubject || hw.subject === state.selectedSubject;
      const statusMatch = state.activeFilter === 'all' || 
        (state.activeFilter === 'submitted' && hw.submitted) ||
        (state.activeFilter === 'pending' && !hw.submitted && new Date(hw.dueDate) >= new Date()) ||
        (state.activeFilter === 'overdue' && !hw.submitted && new Date(hw.dueDate) < new Date());
      
      const searchMatch = hw.title.toLowerCase().includes(state.searchQuery.toLowerCase()) || 
                         hw.description.toLowerCase().includes(state.searchQuery.toLowerCase());
      
      return subjectMatch && statusMatch && (state.searchQuery === '' || searchMatch);
    });
  }, [state.homeworks, state.selectedSubject, state.activeFilter, state.searchQuery]);

  // File handling
  const handleViewFile = useCallback(async (fileUrl, fileName) => {
    try {
      setState(prev => ({ ...prev, loading: true }));
      
      // For iOS, try to open directly first
      if (Platform.OS === 'ios') {
        try {
          const canOpen = await Linking.canOpenURL(fileUrl);
          if (canOpen) {
            await Linking.openURL(fileUrl);
            return;
          }
        } catch (e) {
          console.log('Direct open failed, falling back to download');
        }
      }

      // Download and open for Android or if direct open fails
      const { dirs } = RNFetchBlob.fs;
      const fileExtension = fileName.split('.').pop();
      const path = `${dirs.DownloadDir}/temp_${Date.now()}.${fileExtension}`;
      
      const res = await RNFetchBlob.config({
        fileCache: true,
        path,
      }).fetch('GET', fileUrl);
      
      await FileViewer.open(res.path(), { 
        showOpenWithDialog: true,
        onDismiss: () => RNFetchBlob.fs.unlink(res.path())
      });
    } catch (error) {
      console.error('Error opening file:', error);
      Alert.alert('Error', FILE_VIEWER_ERROR_MSG);
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  }, []);

  const downloadFile = useCallback(async (fileUrl, fileName) => {
    try {
      setState(prev => ({ ...prev, downloading: true }));
      const { dirs } = RNFetchBlob.fs;
      const path = `${dirs.DownloadDir}/${fileName}`;
      
      await RNFetchBlob.config({
        fileCache: false,
        path,
        addAndroidDownloads: {
          useDownloadManager: true,
          notification: true,
          title: fileName,
          description: 'Homework file download',
          mime: getMimeType(fileName),
        },
      }).fetch('GET', fileUrl);
      
      Alert.alert('Download Complete', `File saved to Downloads folder`);
    } catch (error) {
      console.error('Download error:', error);
      Alert.alert('Error', 'Download failed. Please try again.');
    } finally {
      setState(prev => ({ ...prev, downloading: false }));
    }
  }, [getMimeType]);

  // Submission functions
  const openSubmissionModal = useCallback((homework) => {
    setState(prev => ({
      ...prev,
      submissionModalVisible: true,
      selectedHomework: homework,
      submissionFiles: [],
      submissionNotes: ''
    }));
  }, []);

  const closeSubmissionModal = useCallback(() => {
    setState(prev => ({
      ...prev,
      submissionModalVisible: false,
      selectedHomework: null,
      submissionFiles: [],
      submissionNotes: ''
    }));
  }, []);

  const pickSubmissionFile = useCallback(async () => {
    try {
      const res = await DocumentPicker.pick({
        type: [DocumentPicker.types.allFiles],
        allowMultiSelection: true,
      });
      
      setState(prev => ({
        ...prev,
        submissionFiles: [...prev.submissionFiles, ...res]
      }));
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        // User cancelled the picker
      } else {
        Alert.alert('Error', 'Failed to pick files');
        console.error('File pick error:', err);
      }
    }
  }, []);

  const removeSubmissionFile = useCallback((index) => {
    setState(prev => {
      const newFiles = [...prev.submissionFiles];
      newFiles.splice(index, 1);
      return {
        ...prev,
        submissionFiles: newFiles
      };
    });
  }, []);

  const submitHomework = useCallback(() => {
    // In a real app, you would upload files to server here
    const { selectedHomework, submissionFiles, submissionNotes } = state;
    
    if (submissionFiles.length === 0) {
      Alert.alert('Error', 'Please add at least one file');
      return;
    }

    setState(prev => ({ ...prev, loading: true }));
    
    // Simulate API call
    setTimeout(() => {
      Alert.alert('Success', 'Homework submitted successfully!');
      
      // Update homework status
      setState(prev => ({
        ...prev,
        homeworks: prev.homeworks.map(hw => 
          hw.id === selectedHomework.id 
            ? { 
                ...hw, 
                submitted: true, 
                submissionDate: new Date().toISOString() 
              } 
            : hw
        ),
        loading: false,
        submissionModalVisible: false
      }));
    }, 1500);
  }, [state.selectedHomework, state.submissionFiles, state.submissionNotes]);

  // Render helpers
  const renderStatusBadge = useCallback((status) => {
    const statusConfig = {
      [HomeworkStatus.PENDING]: {
        icon: 'schedule',
        color: '#3498db',
        text: 'Pending'
      },
      [HomeworkStatus.SUBMITTED]: {
        icon: 'check-circle',
        color: '#2ecc71',
        text: 'Submitted'
      },
      [HomeworkStatus.OVERDUE]: {
        icon: 'warning',
        color: '#e74c3c',
        text: 'Overdue'
      },
      [HomeworkStatus.GRADED]: {
        icon: 'grade',
        color: '#f39c12',
        text: 'Graded'
      }
    };
    
    const config = statusConfig[status];
    return (
      <View style={[styles.statusBadge, { backgroundColor: `${config.color}20` }]}>
        <Icon name={config.icon} size={14} color={config.color} />
        <Text style={[styles.statusText, { color: config.color }]}>
          {config.text}
        </Text>
      </View>
    );
  }, []);

  const renderAttachment = useCallback((attachment, index) => (
    <View key={index} style={styles.attachmentContainer}>
      <Icon name="attachment" size={16} color="#7f8c8d" />
      <Text style={styles.attachmentText}>
        {attachment.name} ({attachment.size})
      </Text>
    </View>
  ), []);

  const renderHomeworkItem = useCallback(({ item }) => {
    const status = getHomeworkStatus(item);
    const isPending = status === HomeworkStatus.PENDING;
    
    return (
      <View style={[
        styles.homeworkCard,
        styles[`${status}Card`]
      ]}>
        <View style={styles.cardHeader}>
          <Text style={styles.subjectText}>{item.subject}</Text>
          {renderStatusBadge(status)}
        </View>
        
        <Text style={styles.titleText}>{item.title}</Text>
        <Text style={styles.descriptionText}>{item.description}</Text>
        
        {item.attachments.length > 0 && (
          <View style={styles.attachmentsContainer}>
            <Text style={styles.sectionTitle}>Attachments:</Text>
            {item.attachments.map(renderAttachment)}
          </View>
        )}
        
        <View style={styles.dueDateContainer}>
          <Icon name="schedule" size={14} color="#7f8c8d" />
          <Text style={styles.dueDateText}>
            Due: {moment(item.dueDate).format('MMM D, YYYY')}
          </Text>
        </View>
        
        {item.submissionDate && (
          <View style={styles.submissionDateContainer}>
            <Icon name="send" size={14} color="#7f8c8d" />
            <Text style={styles.submissionDateText}>
              Submitted: {moment(item.submissionDate).format('MMM D, YYYY')}
            </Text>
          </View>
        )}
        
        {item.grade && (
          <View style={styles.gradeContainer}>
            <Icon name="grade" size={14} color="#f39c12" />
            <Text style={styles.gradeText}>Grade: {item.grade}</Text>
          </View>
        )}
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.viewButton}
            onPress={() => handleViewFile(item.fileUrl, item.fileName)}
            disabled={state.loading}
          >
            <Icon name="visibility" size={18} color="#fff" />
            <Text style={styles.buttonText}> View</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.downloadButton}
            onPress={() => downloadFile(item.fileUrl, item.fileName)}
            disabled={state.downloading}
          >
            {state.downloading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Icon name="file-download" size={18} color="#fff" />
                <Text style={styles.buttonText}> Download</Text>
              </>
            )}
          </TouchableOpacity>
          
          {isPending && (
            <TouchableOpacity 
              style={styles.submitButton}
              onPress={() => openSubmissionModal(item)}
              disabled={state.loading}
            >
              <Icon name="send" size={18} color="#fff" />
              <Text style={styles.buttonText}> Submit</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }, [getHomeworkStatus, renderStatusBadge, renderAttachment, handleViewFile, downloadFile, state.loading, state.downloading, openSubmissionModal]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Homework</Text>
        <TouchableOpacity 
          style={styles.searchButton}
          onPress={() => {/* Implement search functionality */}}
        >
          <Icon name="search" size={24} color="#3498db" />
        </TouchableOpacity>
      </View>
      
      {state.loading && !state.refreshing ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#3498db" />
        </View>
      ) : (
        <>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterContainer}
          >
            <TouchableOpacity 
              style={[styles.filterButton, state.activeFilter === 'all' && styles.activeFilter]}
              onPress={() => setState(prev => ({ ...prev, activeFilter: 'all' }))}
            >
              <Text style={[styles.filterButtonText, state.activeFilter === 'all' && styles.activeFilterText]}>
                All
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.filterButton, state.activeFilter === 'pending' && styles.activeFilter]}
              onPress={() => setState(prev => ({ ...prev, activeFilter: 'pending' }))}
            >
              <Text style={[styles.filterButtonText, state.activeFilter === 'pending' && styles.activeFilterText]}>
                Pending
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.filterButton, state.activeFilter === 'submitted' && styles.activeFilter]}
              onPress={() => setState(prev => ({ ...prev, activeFilter: 'submitted' }))}
            >
              <Text style={[styles.filterButtonText, state.activeFilter === 'submitted' && styles.activeFilterText]}>
                Submitted
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.filterButton, state.activeFilter === 'overdue' && styles.activeFilter]}
              onPress={() => setState(prev => ({ ...prev, activeFilter: 'overdue' }))}
            >
              <Text style={[styles.filterButtonText, state.activeFilter === 'overdue' && styles.activeFilterText]}>
                Overdue
              </Text>
            </TouchableOpacity>
          </ScrollView>
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.subjectFilterContainer}
          >
            <TouchableOpacity 
              style={[styles.subjectButton, !state.selectedSubject && styles.activeSubjectButton]}
              onPress={() => setState(prev => ({ ...prev, selectedSubject: null }))}
            >
              <Text style={[styles.subjectButtonText, !state.selectedSubject && styles.activeSubjectButtonText]}>
                All Subjects
              </Text>
            </TouchableOpacity>
            
            {state.subjects.map(subject => (
              <TouchableOpacity 
                key={subject}
                style={[styles.subjectButton, state.selectedSubject === subject && styles.activeSubjectButton]}
                onPress={() => setState(prev => ({ ...prev, selectedSubject: subject }))}
              >
                <Text style={[styles.subjectButtonText, state.selectedSubject === subject && styles.activeSubjectButtonText]}>
                  {subject}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          
          <FlatList
            data={filteredHomeworks}
            renderItem={renderHomeworkItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContainer}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Icon name="assignment" size={50} color="#bdc3c7" />
                <Text style={styles.emptyText}>No homework assignments found</Text>
                <TouchableOpacity 
                  style={styles.refreshButton}
                  onPress={onRefresh}
                >
                  <Text style={styles.refreshButtonText}>Refresh</Text>
                </TouchableOpacity>
              </View>
            }
            refreshControl={
              <RefreshControl
                refreshing={state.refreshing}
                onRefresh={onRefresh}
                colors={['#3498db']}
                tintColor="#3498db"
              />
            }
            initialNumToRender={5}
            maxToRenderPerBatch={5}
            windowSize={10}
          />
        </>
      )}

      {/* Submission Modal */}
      <Modal
        visible={state.submissionModalVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={closeSubmissionModal}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              Submit {state.selectedHomework?.title}
            </Text>
            <TouchableOpacity onPress={closeSubmissionModal}>
              <Icon name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <Text style={styles.sectionTitle}>Add Files:</Text>
            
            <TouchableOpacity 
              style={styles.addFileButton}
              onPress={pickSubmissionFile}
            >
              <Icon name="add" size={20} color="#3498db" />
              <Text style={styles.addFileButtonText}>Add Files</Text>
            </TouchableOpacity>

            {state.submissionFiles.length > 0 && (
              <View style={styles.fileListContainer}>
                {state.submissionFiles.map((file, index) => (
                  <View key={index} style={styles.fileItem}>
                    <Icon name="insert-drive-file" size={20} color="#7f8c8d" />
                    <Text style={styles.fileName} numberOfLines={1}>
                      {file.name}
                    </Text>
                    <TouchableOpacity 
                      style={styles.removeFileButton}
                      onPress={() => removeSubmissionFile(index)}
                    >
                      <Icon name="close" size={16} color="#e74c3c" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            <Text style={styles.sectionTitle}>Notes:</Text>
            <TextInput
              style={styles.notesInput}
              multiline
              numberOfLines={4}
              placeholder="Add any additional notes..."
              value={state.submissionNotes}
              onChangeText={(text) => setState(prev => ({ ...prev, submissionNotes: text }))}
            />

            <TouchableOpacity 
              style={styles.submitButtonModal}
              onPress={submitHomework}
              disabled={state.loading}
            >
              {state.loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Icon name="send" size={18} color="#fff" />
                  <Text style={styles.submitButtonText}>Submit Homework</Text>
                </>
              )}
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  searchButton: {
    padding: 5,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterContainer: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  subjectFilterContainer: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  filterButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 10,
    borderRadius: 20,
    backgroundColor: '#e0e0e0',
  },
  activeFilter: {
    backgroundColor: '#3498db',
  },
  filterButtonText: {
    color: '#333',
    fontSize: 14,
    fontWeight: '500',
  },
  activeFilterText: {
    color: '#fff',
  },
  subjectButton: {
    paddingHorizontal: 15,
    paddingVertical: 6,
    marginRight: 10,
    borderRadius: 15,
    backgroundColor: '#f0f0f0',
  },
  activeSubjectButton: {
    backgroundColor: '#3498db',
  },
  subjectButtonText: {
    color: '#333',
    fontSize: 13,
  },
  activeSubjectButtonText: {
    color: '#fff',
  },
  listContainer: {
    padding: 15,
    paddingBottom: 20,
  },
  homeworkCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  pendingCard: {
    borderLeftWidth: 5,
    borderLeftColor: '#3498db',
  },
  submittedCard: {
    borderLeftWidth: 5,
    borderLeftColor: '#2ecc71',
  },
  overdueCard: {
    borderLeftWidth: 5,
    borderLeftColor: '#e74c3c',
  },
  gradedCard: {
    borderLeftWidth: 5,
    borderLeftColor: '#f39c12',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  subjectText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3498db',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 5,
  },
  titleText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 6,
    color: '#2c3e50',
  },
  descriptionText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 5,
  },
  attachmentsContainer: {
    marginBottom: 10,
  },
  attachmentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  attachmentText: {
    fontSize: 12,
    color: '#7f8c8d',
    marginLeft: 5,
  },
  dueDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  dueDateText: {
    fontSize: 12,
    color: '#7f8c8d',
    marginLeft: 5,
  },
  submissionDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  submissionDateText: {
    fontSize: 12,
    color: '#7f8c8d',
    marginLeft: 5,
  },
  gradeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  gradeText: {
    fontSize: 14,
    color: '#f39c12',
    marginLeft: 5,
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  viewButton: {
    backgroundColor: '#2ecc71',
    padding: 10,
    borderRadius: 6,
    flex: 1,
    marginRight: 8,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  downloadButton: {
    backgroundColor: '#3498db',
    padding: 10,
    borderRadius: 6,
    flex: 1,
    marginLeft: 8,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  submitButton: {
    backgroundColor: '#9b59b6',
    padding: 10,
    borderRadius: 6,
    flex: 1,
    marginLeft: 8,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 5,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    marginTop: 50,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 15,
    fontSize: 16,
    color: '#7f8c8d',
  },
  refreshButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#3498db',
    borderRadius: 5,
  },
  refreshButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  modalContent: {
    flex: 1,
    padding: 15,
  },
  addFileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderWidth: 1,
    borderColor: '#3498db',
    borderRadius: 5,
    marginBottom: 15,
  },
  addFileButtonText: {
    color: '#3498db',
    marginLeft: 10,
    fontWeight: '500',
  },
  fileListContainer: {
    marginBottom: 15,
  },
  fileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 5,
    marginBottom: 5,
  },
  fileName: {
    flex: 1,
    marginLeft: 10,
    color: '#333',
  },
  removeFileButton: {
    padding: 5,
  },
  notesInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    minHeight: 100,
    marginBottom: 15,
    textAlignVertical: 'top',
  },
  submitButtonModal: {
    backgroundColor: '#2ecc71',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 10,
  },
});

export default studentHomework;
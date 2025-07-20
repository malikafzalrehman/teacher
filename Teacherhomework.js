import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  Modal, 
  Pressable, 
  Image,
  Alert,
  Platform,
  PermissionsAndroid,
  ActivityIndicator
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DocumentPicker from 'react-native-document-picker';
import ImagePicker from 'react-native-image-crop-picker';
import AudioRecorderPlayer, {
  AVEncoderAudioQualityIOSType,
  AVEncodingOption,
  AudioEncoderAndroidType,
  AudioSourceAndroidType,
} from 'react-native-audio-recorder-player';
import Icon from 'react-native-vector-icons/MaterialIcons';
import DateTimePicker from '@react-native-community/datetimepicker';
import RNFS from 'react-native-fs';
import moment from 'moment';

const TeacherHomework = () => {
    // State for basic homework info
    const [selectedClass, setSelectedClass] = useState('');
    const [selectedSection, setSelectedSection] = useState('');
    const [selectedSubject, setSelectedSubject] = useState('');
    const [homeworkText, setHomeworkText] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [sentHomework, setSentHomework] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    
    // State for custom subjects
    const [customSubject, setCustomSubject] = useState('');
    const [showAddSubjectModal, setShowAddSubjectModal] = useState(false);
    
    // State for attachments
    const [images, setImages] = useState([]);
    const [document, setDocument] = useState(null);
    const [audioPath, setAudioPath] = useState('');
    const [isRecording, setIsRecording] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [audioDuration, setAudioDuration] = useState('00:00');
    const [recordTime, setRecordTime] = useState('00:00');
    const [recordSecs, setRecordSecs] = useState(0);
    
    const audioRecorderPlayer = useRef(new AudioRecorderPlayer()).current;
    
    // Classes, sections and subjects
    const classes = [
        'Prep KG', 'Prep 1', 'Prep 2', 
        'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5',
        'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10'
    ];
    
    const sections = ['A', 'B', 'C', 'D', 'E'];
    
    const [subjects, setSubjects] = useState([
        'Math', 'Science', 'English', 'History', 'Geography',
        'Urdu', 'Islamiyat', 'Computer Science', 'Physics', 'Chemistry', 'Biology'
    ]);

    // Cleanup audio player on unmount
    useEffect(() => {
        return () => {
            audioRecorderPlayer.stopPlayer();
            audioRecorderPlayer.removePlayBackListener();
        };
    }, []);

    // Request microphone permission for Android
    useEffect(() => {
        const requestPermissions = async () => {
            if (Platform.OS === 'android') {
                try {
                    const grants = await PermissionsAndroid.requestMultiple([
                        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
                        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
                        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
                    ]);
                    
                    if (grants['android.permission.RECORD_AUDIO'] !== PermissionsAndroid.RESULTS.GRANTED) {
                        Alert.alert(
                            'Permission Required',
                            'Microphone permission is needed to record voice notes',
                            [{ text: 'OK' }]
                        );
                    }
                } catch (err) {
                    console.error('Permission error:', err);
                }
            }
        };
        requestPermissions();
    }, []);

    // Add custom subject
    const addCustomSubject = () => {
        const trimmedSubject = customSubject.trim();
        if (trimmedSubject && !subjects.includes(trimmedSubject)) {
            setSubjects([...subjects, trimmedSubject]);
            setSelectedSubject(trimmedSubject);
            setCustomSubject('');
            setShowAddSubjectModal(false);
        } else if (subjects.includes(trimmedSubject)) {
            Alert.alert('Subject Exists', 'This subject is already in the list');
        }
    };

    // Select image from gallery with better error handling
    const selectImage = async () => {
        try {
            setIsLoading(true);
            const selectedImages = await ImagePicker.openPicker({
                mediaType: 'photo',
                cropping: false,
                multiple: true,
                maxFiles: 5,
                compressImageQuality: 0.8,
                writeTempFile: true,
            });
            
            if (selectedImages.length + images.length > 5) {
                Alert.alert('Limit Exceeded', 'You can select up to 5 images total');
                return;
            }
            
            setImages(prev => [...prev, ...(Array.isArray(selectedImages) ? selectedImages : [selectedImages])]);
        } catch (error) {
            if (error.code !== 'E_PICKER_CANCELLED') {
                console.error('Image picker error:', error);
                Alert.alert('Error', 'Failed to select images. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    // Select document with type validation
    const selectDocument = async () => {
        try {
            const doc = await DocumentPicker.pick({
                type: [
                    DocumentPicker.types.pdf,
                    DocumentPicker.types.doc,
                    DocumentPicker.types.docx,
                    DocumentPicker.types.plainText,
                ],
                allowMultiSelection: false,
            });
            
            if (doc.size > 10 * 1024 * 1024) { // 10MB limit
                Alert.alert('File Too Large', 'Please select a file smaller than 10MB');
                return;
            }
            
            setDocument(doc);
        } catch (error) {
            if (!DocumentPicker.isCancel(error)) {
                console.error('Document picker error:', error);
                Alert.alert('Error', 'Failed to select document. Please try again.');
            }
        }
    };

    // Record audio with proper configuration
    const onStartRecord = async () => {
        try {
            const audioDir = Platform.OS === 'android' 
                ? RNFS.ExternalDirectoryPath 
                : RNFS.DocumentDirectoryPath;
            
            const audioFilePath = `${audioDir}/homework_audio_${Date.now()}.mp3`;
            
            const audioSet = {
                AudioEncoderAndroid: AudioEncoderAndroidType.AAC,
                AudioSourceAndroid: AudioSourceAndroidType.MIC,
                AVEncoderAudioQualityKeyIOS: AVEncoderAudioQualityIOSType.high,
                AVNumberOfChannelsKeyIOS: 2,
                AVFormatIDKeyIOS: AVEncodingOption.aac,
            };
            
            const uri = await audioRecorderPlayer.startRecorder(audioFilePath, audioSet);
            setIsRecording(true);
            setAudioPath(uri);
            
            audioRecorderPlayer.addRecordBackListener((e) => {
                setRecordSecs(e.currentPosition);
                setRecordTime(audioRecorderPlayer.mmss(Math.floor(e.currentPosition / 1000)));
                return;
            });
        } catch (error) {
            console.error('Recording error:', error);
            Alert.alert('Error', 'Failed to start recording. Please check permissions.');
        }
    };

    // Stop recording with cleanup
    const onStopRecord = async () => {
        try {
            const result = await audioRecorderPlayer.stopRecorder();
            audioRecorderPlayer.removeRecordBackListener();
            setIsRecording(false);
            setAudioDuration(recordTime);
        } catch (error) {
            console.error('Stop recording error:', error);
            Alert.alert('Error', 'Failed to stop recording');
        }
    };

    // Play recorded audio with proper state management
    const onPlayAudio = async () => {
        try {
            setIsPlaying(true);
            await audioRecorderPlayer.startPlayer(audioPath);
            
            audioRecorderPlayer.addPlayBackListener((e) => {
                if (e.currentPosition === e.duration) {
                    onStopAudio();
                }
                return;
            });
        } catch (error) {
            console.error('Playback error:', error);
            setIsPlaying(false);
            Alert.alert('Error', 'Failed to play recording');
        }
    };

    // Stop playing audio
    const onStopAudio = async () => {
        try {
            await audioRecorderPlayer.stopPlayer();
            audioRecorderPlayer.removePlayBackListener();
            setIsPlaying(false);
        } catch (error) {
            console.error('Stop playback error:', error);
        }
    };

    // Date picker handler
    const onChangeDate = (event, selectedDate) => {
        setShowDatePicker(Platform.OS === 'ios');
        if (selectedDate) {
            setDueDate(moment(selectedDate).format('YYYY-MM-DD'));
        }
    };

    // Validate form before submission
    const validateForm = () => {
        if (!selectedClass) {
            Alert.alert('Required Field', 'Please select a class');
            return false;
        }
        
        if (!selectedSection) {
            Alert.alert('Required Field', 'Please select a section');
            return false;
        }
        
        if (!selectedSubject) {
            Alert.alert('Required Field', 'Please select a subject');
            return false;
        }
        
        if (!homeworkText && images.length === 0 && !document && !audioPath) {
            Alert.alert('Required Field', 'Please add homework details or at least one attachment');
            return false;
        }
        
        if (!dueDate) {
            Alert.alert('Required Field', 'Please set a due date');
            return false;
        }
        
        return true;
    };

    // Send homework with all attachments
    const sendHomework = async () => {
        if (!validateForm()) return;
        
        try {
            setIsLoading(true);
            
            const newHomework = {
                id: Date.now(),
                class: selectedClass,
                section: selectedSection,
                subject: selectedSubject,
                text: homeworkText,
                date: dueDate,
                images: images.map(img => ({
                    uri: img.path,
                    name: img.filename || `image_${Date.now()}.jpg`,
                    type: img.mime,
                })),
                document: document ? {
                    uri: document.uri,
                    name: document.name,
                    type: document.type,
                } : null,
                audio: audioPath ? {
                    uri: audioPath,
                    duration: audioDuration,
                } : null,
                timestamp: moment().format('YYYY-MM-DD HH:mm:ss'),
            };
            
            setSentHomework(prev => [newHomework, ...prev]);
            resetForm();
            
            Alert.alert(
                'Success', 
                'Homework sent successfully!',
                [{ text: 'OK' }]
            );
        } catch (error) {
            console.error('Submission error:', error);
            Alert.alert(
                'Error', 
                'Failed to send homework. Please try again.',
                [{ text: 'OK' }]
            );
        } finally {
            setIsLoading(false);
        }
    };

    // Reset form after submission
    const resetForm = () => {
        setHomeworkText('');
        setDueDate('');
        setImages([]);
        setDocument(null);
        setAudioPath('');
        setAudioDuration('00:00');
        setRecordTime('00:00');
        setRecordSecs(0);
    };

    // Remove attachment with confirmation
    const removeAttachment = (type, index = null) => {
        Alert.alert(
            'Confirm Removal',
            `Are you sure you want to remove this ${type}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                { 
                    text: 'Remove', 
                    style: 'destructive',
                    onPress: () => {
                        if (type === 'image' && index !== null) {
                            setImages(prev => prev.filter((_, i) => i !== index));
                        } else if (type === 'document') {
                            setDocument(null);
                        } else if (type === 'audio') {
                            setAudioPath('');
                            setAudioDuration('00:00');
                            setRecordTime('00:00');
                            setRecordSecs(0);
                        }
                    }
                }
            ]
        );
    };

    // Format homework list by date
    const groupHomeworkByDate = () => {
        const grouped = {};
        sentHomework.forEach(hw => {
            const date = hw.timestamp.split(' ')[0];
            if (!grouped[date]) {
                grouped[date] = [];
            }
            grouped[date].push(hw);
        });
        return grouped;
    };

    const groupedHomework = groupHomeworkByDate();

    // Render attachment previews
    const renderAttachmentPreviews = () => {
        if (images.length === 0) return null;
        
        return (
            <View style={styles.attachmentPreviewContainer}>
                {images.map((img, index) => (
                    <View key={`img-${index}`} style={styles.imagePreview}>
                        <Image 
                            source={{ uri: img.path }} 
                            style={styles.previewImage} 
                        />
                        <TouchableOpacity 
                            style={styles.removeButton}
                            onPress={() => removeAttachment('image', index)}>
                            <Icon name="close" size={16} color="white" />
                        </TouchableOpacity>
                    </View>
                ))}
            </View>
        );
    };

    // Render document preview
    const renderDocumentPreview = () => {
        if (!document) return null;
        
        return (
            <View style={styles.documentPreview}>
                <Icon name="description" size={24} color="#7f8c8d" />
                <Text style={styles.documentName} numberOfLines={1}>
                    {document.name}
                </Text>
                <TouchableOpacity 
                    style={styles.removeButton}
                    onPress={() => removeAttachment('document')}>
                    <Icon name="close" size={16} color="white" />
                </TouchableOpacity>
            </View>
        );
    };

    // Render audio controls
    const renderAudioControls = () => {
        if (!audioPath) {
            return (
                <TouchableOpacity 
                    style={[styles.recordButton, isRecording && styles.recordingButton]}
                    onPress={isRecording ? onStopRecord : onStartRecord}
                    disabled={isLoading}>
                    <Icon 
                        name={isRecording ? "stop" : "mic"} 
                        size={20} 
                        color="white" 
                    />
                    <Text style={styles.recordButtonText}>
                        {isRecording ? `Recording... ${recordTime}` : 'Record Voice Note'}
                    </Text>
                </TouchableOpacity>
            );
        }
        
        return (
            <View style={styles.audioPreview}>
                <TouchableOpacity 
                    style={styles.playButton}
                    onPress={isPlaying ? onStopAudio : onPlayAudio}>
                    <Icon 
                        name={isPlaying ? "stop" : "play-arrow"} 
                        size={24} 
                        color="#3498db" 
                    />
                </TouchableOpacity>
                <Text style={styles.audioDuration}>{audioDuration}</Text>
                <TouchableOpacity 
                    style={styles.removeButton}
                    onPress={() => removeAttachment('audio')}>
                    <Icon name="close" size={16} color="white" />
                </TouchableOpacity>
            </View>
        );
    };

    // Render homework items
    const renderHomeworkItems = () => {
        if (Object.keys(groupedHomework).length === 0) {
            return <Text style={styles.noHomework}>No homework sent yet</Text>;
        }
        
        return Object.entries(groupedHomework).map(([date, homeworks]) => (
            <View key={`date-${date}`}>
                <Text style={styles.dateHeader}>{moment(date).format('MMMM D, YYYY')}</Text>
                {homeworks.map((hw) => (
                    <View key={`hw-${hw.id}`} style={styles.homeworkItem}>
                        <View style={styles.homeworkHeader}>
                            <Text style={styles.homeworkClass}>
                                {hw.class} - {hw.section} • {hw.subject}
                            </Text>
                            <Text style={styles.dueDateBadge}>
                                Due: {moment(hw.date).format('MMM D')}
                            </Text>
                        </View>
                        {hw.text && <Text style={styles.homeworkText}>{hw.text}</Text>}
                        
                        <View style={styles.attachmentsContainer}>
                            {hw.images && hw.images.length > 0 && (
                                <View style={styles.attachmentBadge}>
                                    <Icon name="image" size={14} color="#3498db" />
                                    <Text style={styles.attachmentBadgeText}>{hw.images.length} image(s)</Text>
                                </View>
                            )}
                            {hw.document && (
                                <View style={styles.attachmentBadge}>
                                    <Icon name="insert-drive-file" size={14} color="#3498db" />
                                    <Text style={styles.attachmentBadgeText}>1 document</Text>
                                </View>
                            )}
                            {hw.audio && (
                                <View style={styles.attachmentBadge}>
                                    <Icon name="mic" size={14} color="#3498db" />
                                    <Text style={styles.attachmentBadgeText}>Voice note ({hw.audio.duration})</Text>
                                </View>
                            )}
                        </View>
                        
                        <Text style={styles.homeworkTimestamp}>
                            Sent at {moment(hw.timestamp).format('h:mm A')}
                        </Text>
                    </View>
                ))}
            </View>
        ));
    };

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Teacher Homework Portal</Text>
            
            <ScrollView 
                contentContainerStyle={styles.scrollContainer}
                keyboardShouldPersistTaps="handled">
                
                {isLoading && (
                    <View style={styles.loadingOverlay}>
                        <ActivityIndicator size="large" color="#3498db" />
                    </View>
                )}
                
                <View style={styles.formContainer}>
                    {/* Class Selection */}
                    <Text style={styles.label}>Select Class:</Text>
                    <Picker
                        selectedValue={selectedClass}
                        style={styles.picker}
                        dropdownIconColor="#3498db"
                        onValueChange={(itemValue) => setSelectedClass(itemValue)}>
                        <Picker.Item label="Select a class" value="" />
                        {classes.map((cls) => (
                            <Picker.Item key={`class-${cls}`} label={cls} value={cls} />
                        ))}
                    </Picker>

                    {/* Section Selection */}
                    <Text style={styles.label}>Select Section:</Text>
                    <Picker
                        selectedValue={selectedSection}
                        style={styles.picker}
                        dropdownIconColor="#3498db"
                        onValueChange={(itemValue) => setSelectedSection(itemValue)}>
                        <Picker.Item label="Select a section" value="" />
                        {sections.map((section) => (
                            <Picker.Item key={`section-${section}`} label={section} value={section} />
                        ))}
                    </Picker>

                    {/* Subject Selection */}
                    <View style={styles.subjectContainer}>
                        <Text style={styles.label}>Select Subject:</Text>
                        <TouchableOpacity 
                            style={styles.addButton}
                            onPress={() => setShowAddSubjectModal(true)}>
                            <Text style={styles.addButtonText}>+ Add Subject</Text>
                        </TouchableOpacity>
                    </View>
                    <Picker
                        selectedValue={selectedSubject}
                        style={styles.picker}
                        dropdownIconColor="#3498db"
                        onValueChange={(itemValue) => setSelectedSubject(itemValue)}>
                        <Picker.Item label="Select a subject" value="" />
                        {subjects.map((subject) => (
                            <Picker.Item key={`subject-${subject}`} label={subject} value={subject} />
                        ))}
                    </Picker>

                    {/* Homework Details */}
                    <Text style={styles.label}>Homework Details:</Text>
                    <TextInput
                        style={styles.input}
                        multiline
                        numberOfLines={4}
                        placeholder="Enter homework details..."
                        placeholderTextColor="#95a5a6"
                        value={homeworkText}
                        onChangeText={setHomeworkText}
                    />

                    {/* Due Date */}
                    <Text style={styles.label}>Due Date:</Text>
                    <TouchableOpacity 
                        style={styles.dateInput}
                        onPress={() => setShowDatePicker(true)}>
                        <Text style={dueDate ? styles.dateText : styles.placeholderText}>
                            {dueDate || 'Select due date'}
                        </Text>
                        <Icon name="calendar-today" size={20} color="#3498db" />
                    </TouchableOpacity>
                    
                    {showDatePicker && (
                        <DateTimePicker
                            value={dueDate ? new Date(dueDate) : new Date()}
                            mode="date"
                            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                            onChange={onChangeDate}
                            minimumDate={new Date()}
                        />
                    )}

                    {/* Attachments Section */}
                    <Text style={styles.label}>Attachments:</Text>
                    
                    {/* Image Attachment */}
                    <View style={styles.attachmentSection}>
                        <TouchableOpacity 
                            style={styles.attachmentButton}
                            onPress={selectImage}
                            disabled={isLoading || images.length >= 5}>
                            <Icon name="image" size={20} color="#3498db" />
                            <Text style={styles.attachmentButtonText}>
                                Add Images ({images.length}/5)
                            </Text>
                        </TouchableOpacity>
                        {renderAttachmentPreviews()}
                    </View>
                    
                    {/* Document Attachment */}
                    <View style={styles.attachmentSection}>
                        <TouchableOpacity 
                            style={styles.attachmentButton}
                            onPress={selectDocument}
                            disabled={isLoading}>
                            <Icon name="insert-drive-file" size={20} color="#3498db" />
                            <Text style={styles.attachmentButtonText}>
                                {document ? 'Replace Document' : 'Add Document (PDF, DOC)'}
                            </Text>
                        </TouchableOpacity>
                        {renderDocumentPreview()}
                    </View>
                    
                    {/* Voice Note Attachment */}
                    <View style={styles.attachmentSection}>
                        <View style={styles.voiceNoteContainer}>
                            {renderAudioControls()}
                        </View>
                    </View>

                    {/* Send Button */}
                    <TouchableOpacity 
                        style={[styles.button, isLoading && styles.disabledButton]}
                        onPress={sendHomework}
                        disabled={isLoading}>
                        <Text style={styles.buttonText}>
                            {isLoading ? 'Sending...' : 'Send Homework'}
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Recently Sent Homework List */}
                <View style={styles.homeworkList}>
                    <Text style={styles.sectionTitle}>Sent Homework:</Text>
                    {renderHomeworkItems()}
                </View>
            </ScrollView>

            {/* Add Subject Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={showAddSubjectModal}
                onRequestClose={() => setShowAddSubjectModal(false)}>
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Add New Subject</Text>
                        <TextInput
                            style={styles.modalInput}
                            placeholder="Enter subject name"
                            placeholderTextColor="#95a5a6"
                            value={customSubject}
                            onChangeText={setCustomSubject}
                            autoFocus={true}
                            maxLength={50}
                            onSubmitEditing={addCustomSubject}
                        />
                        <View style={styles.modalButtonContainer}>
                            <Pressable
                                style={[styles.modalButton, styles.cancelButton]}
                                onPress={() => setShowAddSubjectModal(false)}>
                                <Text style={styles.modalButtonText}>Cancel</Text>
                            </Pressable>
                            <Pressable
                                style={[styles.modalButton, styles.addButton, !customSubject.trim() && styles.disabledButton]}
                                onPress={addCustomSubject}
                                disabled={!customSubject.trim()}>
                                <Text style={styles.modalButtonText}>Add</Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    scrollContainer: {
        padding: 20,
        paddingBottom: 40,
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
        color: '#2c3e50',
        paddingTop: 10,
    },
    formContainer: {
        backgroundColor: 'white',
        padding: 15,
        borderRadius: 10,
        marginBottom: 20,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    label: {
        fontSize: 16,
        marginBottom: 5,
        color: '#2c3e50',
        fontWeight: '500',
    },
    picker: {
        height: 50,
        width: '100%',
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 5,
        backgroundColor: 'white',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 5,
        padding: 10,
        marginBottom: 15,
        fontSize: 16,
        backgroundColor: 'white',
        textAlignVertical: 'top',
        color: '#2c3e50',
        minHeight: 100,
    },
    dateInput: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 5,
        padding: 10,
        marginBottom: 15,
        backgroundColor: 'white',
    },
    dateText: {
        fontSize: 16,
        color: '#2c3e50',
    },
    placeholderText: {
        fontSize: 16,
        color: '#95a5a6',
    },
    button: {
        backgroundColor: '#3498db',
        padding: 15,
        borderRadius: 5,
        alignItems: 'center',
        marginTop: 10,
    },
    disabledButton: {
        backgroundColor: '#bdc3c7',
        opacity: 0.7,
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    homeworkList: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#2c3e50',
    },
    dateHeader: {
        fontSize: 16,
        fontWeight: '600',
        color: '#7f8c8d',
        marginTop: 15,
        marginBottom: 8,
    },
    homeworkItem: {
        backgroundColor: 'white',
        padding: 15,
        borderRadius: 10,
        marginBottom: 10,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
    },
    homeworkHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    homeworkClass: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#3498db',
        flex: 1,
    },
    dueDateBadge: {
        backgroundColor: '#f8d7da',
        color: '#721c24',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 10,
        fontSize: 12,
        fontWeight: '500',
    },
    homeworkText: {
        fontSize: 14,
        marginBottom: 10,
        color: '#333',
        lineHeight: 20,
    },
    homeworkTimestamp: {
        fontSize: 11,
        color: '#7f8c8d',
        marginTop: 5,
        textAlign: 'right',
    },
    noHomework: {
        textAlign: 'center',
        color: '#7f8c8d',
        marginTop: 20,
        fontStyle: 'italic',
    },
    subjectContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 5,
    },
    addButton: {
        backgroundColor: '#27ae60',
        padding: 8,
        borderRadius: 5,
    },
    addButtonText: {
        color: 'white',
        fontSize: 14,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
        width: '90%',
        maxWidth: 400,
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
        elevation: 5,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
        textAlign: 'center',
        color: '#2c3e50',
    },
    modalInput: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 5,
        padding: 12,
        marginBottom: 15,
        fontSize: 16,
        color: '#2c3e50',
    },
    modalButtonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    modalButton: {
        padding: 12,
        borderRadius: 5,
        width: '48%',
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: '#e74c3c',
    },
    modalButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    attachmentSection: {
        marginBottom: 15,
    },
    attachmentButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderWidth: 1,
        borderColor: '#3498db',
        borderRadius: 5,
        backgroundColor: '#f8f9fa',
    },
    attachmentButtonText: {
        marginLeft: 10,
        color: '#3498db',
        fontSize: 14,
    },
    attachmentPreviewContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 10,
    },
    imagePreview: {
        width: 80,
        height: 80,
        marginRight: 10,
        marginBottom: 10,
        position: 'relative',
    },
    previewImage: {
        width: '100%',
        height: '100%',
        borderRadius: 5,
    },
    documentPreview: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 5,
        marginTop: 10,
        backgroundColor: '#f8f9fa',
    },
    documentName: {
        flex: 1,
        marginLeft: 10,
        color: '#7f8c8d',
        fontSize: 14,
    },
    voiceNoteContainer: {
        marginTop: 10,
    },
    recordButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
        borderRadius: 5,
        backgroundColor: '#e74c3c',
    },
    recordingButton: {
        backgroundColor: '#c0392b',
    },
    recordButtonText: {
        marginLeft: 10,
        color: 'white',
        fontSize: 14,
    },
    audioPreview: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 5,
        backgroundColor: '#f8f9fa',
    },
    playButton: {
        marginRight: 15,
    },
    audioDuration: {
        flex: 1,
        color: '#7f8c8d',
        fontSize: 14,
    },
    removeButton: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#e74c3c',
        justifyContent: 'center',
        alignItems: 'center',
    },
    attachmentsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 5,
        marginBottom: 5,
    },
    attachmentBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ebf5fb',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        marginRight: 8,
        marginBottom: 5,
    },
    attachmentBadgeText: {
        marginLeft: 4,
        fontSize: 12,
        color: '#3498db',
    },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(255,255,255,0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },
});

export default TeacherHomework;
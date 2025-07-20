import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Alert,
  Vibration,
  Platform,
  Modal,
  TouchableWithoutFeedback
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Sound from 'react-native-sound';

// Initialize sound
let notificationSound = new Sound('notification.mp3', Sound.MAIN_BUNDLE, (error) => {
  if (error) {
    console.log('Failed to load the sound', error);
  }
});

const Teachernotification = () => {
    const [notifications, setNotifications] = useState([
        {
            id: '1',
            title: 'New Assignment Submitted',
            message: 'Student Ali has submitted the Math assignment',
            time: '10 mins ago',
            read: false,
            type: 'assignment',
            details: 'Assignment Details:\n- Subject: Mathematics\n- Topic: Algebra\n- Due Date: June 25, 2023\n- Grade: A'
        },
        {
            id: '2',
            title: 'Parent Meeting Reminder',
            message: 'Meeting with Mr. Ahmed scheduled for tomorrow at 10:00 AM',
            time: '1 hour ago',
            read: true,
            type: 'meeting',
            details: 'Meeting Details:\n- Parent: Mr. Ahmed (Father of Ali)\n- Date: June 26, 2023\n- Time: 10:00 AM\n- Duration: 30 minutes\n- Agenda: Progress discussion'
        },
        {
            id: '3',
            title: 'School Event Update',
            message: 'Science fair has been rescheduled to next Friday',
            time: '3 hours ago',
            read: false,
            type: 'event',
            details: 'Event Details:\n- Event: Annual Science Fair\n- New Date: June 30, 2023\n- Time: 9:00 AM to 3:00 PM\n- Venue: School Auditorium\n- Participants: All students grades 6-12'
        },
        {
            id: '4',
            title: 'New Message',
            message: 'You have received a message from the Principal',
            time: '5 hours ago',
            read: true,
            type: 'message',
            details: 'Message from Principal:\n\nDear Teachers,\n\nPlease be informed that we will have a staff meeting tomorrow immediately after school. The agenda includes discussion of the upcoming parent-teacher conferences and the new curriculum implementation. Please bring your grade books and any concerns you would like to address.\n\nBest regards,\nPrincipal Khan'
        },
    ]);

    const [selectedNotification, setSelectedNotification] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);

    // Simulate new notification every 10 seconds for demo
    useEffect(() => {
        const interval = setInterval(() => {
            const newNotification = {
                id: Math.random().toString(),
                title: 'New Announcement',
                message: 'Staff meeting tomorrow at 9:00 AM',
                time: 'Just now',
                read: false,
                type: 'announcement',
                details: 'Staff Meeting Announcement:\n\nAll teaching staff are required to attend the monthly staff meeting tomorrow at 9:00 AM in the conference room. Agenda items include:\n1. Review of mid-term results\n2. Upcoming school events\n3. Professional development opportunities\n4. Any other business\n\nPlease bring your laptops and be prepared to discuss your class progress.'
            };
            
            setNotifications(prev => [newNotification, ...prev]);
            
            // Play sound and vibrate for new notification
            playNotificationAlert();
            
            // Show alert popup
            Alert.alert(
                "New Notification",
                newNotification.title,
                [
                    { text: "OK", onPress: () => console.log("OK Pressed") }
                ],
                { cancelable: false }
            );
        }, 10000); // 10 seconds

        return () => clearInterval(interval);
    }, []);

    const playNotificationAlert = () => {
        // Play sound
        notificationSound.play((success) => {
            if (!success) {
                console.log('Sound did not play');
            }
        });
        
        // Vibrate
        if (Platform.OS === 'android') {
            Vibration.vibrate([500, 500, 500]);
        }
    };

    const handleNotificationPress = (item) => {
        markAsRead(item.id);
        setSelectedNotification(item);
        setModalVisible(true);
    };

    const markAsRead = (id) => {
        setNotifications(notifications.map(item => 
            item.id === id ? {...item, read: true} : item
        ));
    };

    const markAllAsRead = () => {
        setNotifications(notifications.map(item => ({...item, read: true})));
    };

    const getNotificationIcon = (type) => {
        switch(type) {
            case 'assignment': return 'assignment';
            case 'meeting': return 'people';
            case 'event': return 'event';
            case 'message': return 'mail';
            case 'announcement': return 'announcement';
            default: return 'notifications';
        }
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity 
            style={[styles.notificationItem, item.read ? styles.readItem : styles.unreadItem]}
            activeOpacity={0.7}
            onPress={() => handleNotificationPress(item)}
        >
            <View style={styles.notificationIcon}>
                <Icon 
                    name={getNotificationIcon(item.type)} 
                    size={24} 
                    color={item.read ? '#95a5a6' : '#3498db'} 
                />
            </View>
            <View style={styles.notificationContent}>
                <Text style={styles.notificationTitle}>{item.title}</Text>
                <Text style={styles.notificationMessage}>{item.message}</Text>
                <Text style={styles.notificationTime}>{item.time}</Text>
            </View>
            {!item.read && <View style={styles.unreadBadge} />}
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Notifications</Text>
                <TouchableOpacity onPress={markAllAsRead}>
                    <Text style={styles.markAllRead}>Mark all as read</Text>
                </TouchableOpacity>
            </View>
            
            <FlatList
                data={notifications}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContainer}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Icon name="notifications-off" size={50} color="#cccccc" />
                        <Text style={styles.emptyText}>No notifications yet</Text>
                    </View>
                }
            />

            {/* Notification Details Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => {
                    setModalVisible(!modalVisible);
                }}
            >
                <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
                    <View style={styles.modalOverlay} />
                </TouchableWithoutFeedback>
                
                <View style={styles.modalContainer}>
                    {selectedNotification && (
                        <>
                            <View style={styles.modalHeader}>
                                <Icon 
                                    name={getNotificationIcon(selectedNotification.type)} 
                                    size={30} 
                                    color="#3498db" 
                                    style={styles.modalIcon}
                                />
                                <Text style={styles.modalTitle}>{selectedNotification.title}</Text>
                                <TouchableOpacity 
                                    style={styles.closeButton}
                                    onPress={() => setModalVisible(false)}
                                >
                                    <Icon name="close" size={24} color="#666" />
                                </TouchableOpacity>
                            </View>
                            
                            <View style={styles.modalContent}>
                                <Text style={styles.modalTime}>
                                    <Icon name="access-time" size={16} color="#666" /> {selectedNotification.time}
                                </Text>
                                
                                <Text style={styles.modalMessage}>{selectedNotification.message}</Text>
                                
                                <View style={styles.detailsContainer}>
                                    <Text style={styles.detailsTitle}>Details:</Text>
                                    <Text style={styles.detailsText}>{selectedNotification.details}</Text>
                                </View>
                            </View>
                            
                            <View style={styles.modalFooter}>
                                <TouchableOpacity 
                                    style={styles.modalButton}
                                    onPress={() => setModalVisible(false)}
                                >
                                    <Text style={styles.modalButtonText}>Close</Text>
                                </TouchableOpacity>
                            </View>
                        </>
                    )}
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
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#ffffff',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333333',
    },
    markAllRead: {
        color: '#3498db',
        fontSize: 14,
    },
    listContainer: {
        paddingBottom: 16,
    },
    notificationItem: {
        flexDirection: 'row',
        padding: 16,
        marginTop: 8,
        marginHorizontal: 16,
        borderRadius: 8,
        backgroundColor: '#ffffff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    readItem: {
        opacity: 0.8,
    },
    unreadItem: {
        backgroundColor: '#f8f9fa',
    },
    notificationIcon: {
        marginRight: 12,
        justifyContent: 'center',
    },
    notificationContent: {
        flex: 1,
    },
    notificationTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333333',
        marginBottom: 4,
    },
    notificationMessage: {
        fontSize: 14,
        color: '#666666',
        marginBottom: 4,
        lineHeight: 20,
    },
    notificationTime: {
        fontSize: 12,
        color: '#999999',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    emptyText: {
        fontSize: 16,
        color: '#999999',
        marginTop: 16,
    },
    unreadBadge: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#3498db',
        alignSelf: 'center',
        marginLeft: 8,
    },
    // Modal styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'white',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        maxHeight: '80%',
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    modalIcon: {
        marginRight: 10,
    },
    modalTitle: {
        flex: 1,
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    closeButton: {
        padding: 5,
    },
    modalContent: {
        paddingHorizontal: 5,
    },
    modalTime: {
        fontSize: 14,
        color: '#666',
        marginBottom: 15,
    },
    modalMessage: {
        fontSize: 16,
        color: '#333',
        marginBottom: 20,
        lineHeight: 24,
    },
    detailsContainer: {
        backgroundColor: '#f9f9f9',
        borderRadius: 10,
        padding: 15,
        marginBottom: 20,
    },
    detailsTitle: {
        fontWeight: 'bold',
        fontSize: 16,
        marginBottom: 10,
        color: '#444',
    },
    detailsText: {
        fontSize: 14,
        color: '#555',
        lineHeight: 22,
    },
    modalFooter: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    modalButton: {
        backgroundColor: '#3498db',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
    },
    modalButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
});

export default Teachernotification;
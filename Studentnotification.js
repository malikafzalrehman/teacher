// Studentnotification.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, Pressable } from 'react-native';

// Mock data for notifications
const mockNotifications = [
  {
    id: '1',
    senderName: 'Mr. Ali',
    message: 'Your assignment has been graded. You scored 85/100. Well done!',
    type: 'assignment',
    assignmentTitle: 'Math Chapter 5',
    timestamp: new Date('2023-05-15T10:30:00')
  },
  {
    id: '2',
    senderName: 'Admin',
    message: 'School will be closed tomorrow due to maintenance work. Classes will resume on Monday.',
    type: 'announcement',
    timestamp: new Date('2023-05-14T09:15:00')
  },
  {
    id: '3',
    senderName: 'Ms. Fatima',
    message: 'Please submit your project by Friday 5 PM. Late submissions will not be accepted.',
    type: 'reminder',
    timestamp: new Date('2023-05-12T14:45:00')
  }
];

const Studentnotification = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedNotification, setSelectedNotification] = useState(null);

    useEffect(() => {
        // Simulate loading data
        setLoading(true);
        setTimeout(() => {
            setNotifications(mockNotifications);
            setLoading(false);
        }, 1000);
    }, []);

    const handleNotificationPress = (notification) => {
        setSelectedNotification(notification);
        setModalVisible(true);
    };

    const renderNotification = ({ item }) => (
        <TouchableOpacity 
            style={styles.notificationCard}
            onPress={() => handleNotificationPress(item)}
        >
            <View style={styles.notificationHeader}>
                <View style={styles.avatarPlaceholder}>
                    <Text style={styles.avatarText}>
                        {item.senderName.charAt(0)}
                    </Text>
                </View>
                <Text style={styles.senderName}>{item.senderName}</Text>
                <Text style={styles.notificationTime}>
                    {item.timestamp.toLocaleString()}
                </Text>
            </View>
            <Text style={styles.notificationText} numberOfLines={1} ellipsizeMode="tail">
                {item.message}
            </Text>
            {item.type === 'assignment' && (
                <Text style={styles.assignmentText}>New Assignment: {item.assignmentTitle}</Text>
            )}
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Notifications</Text>
            
            {loading ? (
                <Text>Loading notifications...</Text>
            ) : notifications.length === 0 ? (
                <Text style={styles.noNotifications}>No notifications yet</Text>
            ) : (
                <FlatList
                    data={notifications}
                    renderItem={renderNotification}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContainer}
                />
            )}

            {/* Notification Detail Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => {
                    setModalVisible(!modalVisible);
                }}
            >
                <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                        {selectedNotification && (
                            <>
                                <View style={styles.modalHeader}>
                                    <View style={styles.modalAvatar}>
                                        <Text style={styles.avatarText}>
                                            {selectedNotification.senderName.charAt(0)}
                                        </Text>
                                    </View>
                                    <View>
                                        <Text style={styles.modalSender}>{selectedNotification.senderName}</Text>
                                        <Text style={styles.modalTime}>
                                            {selectedNotification.timestamp.toLocaleString()}
                                        </Text>
                                    </View>
                                </View>
                                
                                <Text style={styles.modalMessage}>{selectedNotification.message}</Text>
                                
                                {selectedNotification.type === 'assignment' && (
                                    <Text style={styles.modalAssignment}>
                                        Assignment: {selectedNotification.assignmentTitle}
                                    </Text>
                                )}
                            </>
                        )}
                        
                        <Pressable
                            style={[styles.button, styles.buttonClose]}
                            onPress={() => setModalVisible(false)}
                        >
                            <Text style={styles.textStyle}>Close</Text>
                        </Pressable>
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
        padding: 15,
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#2c3e50',
    },
    listContainer: {
        paddingBottom: 20,
    },
    notificationCard: {
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 15,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    notificationHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    avatarPlaceholder: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#3498db',
        marginRight: 10,
        justifyContent: 'center',
        alignItems: 'center'
    },
    avatarText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16
    },
    senderName: {
        fontWeight: 'bold',
        color: '#2c3e50',
        marginRight: 10,
    },
    notificationTime: {
        fontSize: 12,
        color: '#95a5a6',
    },
    notificationText: {
        fontSize: 16,
        marginBottom: 5,
    },
    assignmentText: {
        color: '#3498db',
        fontStyle: 'italic',
    },
    noNotifications: {
        textAlign: 'center',
        marginTop: 50,
        fontSize: 16,
        color: '#7f8c8d',
    },
    // Modal styles
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalView: {
        margin: 20,
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 25,
        width: '90%',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    modalAvatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#3498db',
        marginRight: 15,
        justifyContent: 'center',
        alignItems: 'center'
    },
    modalSender: {
        fontWeight: 'bold',
        fontSize: 18,
        color: '#2c3e50',
    },
    modalTime: {
        fontSize: 12,
        color: '#95a5a6',
    },
    modalMessage: {
        fontSize: 16,
        marginBottom: 15,
        lineHeight: 22,
    },
    modalAssignment: {
        color: '#3498db',
        fontStyle: 'italic',
        marginBottom: 20,
    },
    button: {
        borderRadius: 10,
        padding: 12,
        elevation: 2,
    },
    buttonClose: {
        backgroundColor: '#3498db',
    },
    textStyle: {
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center',
    },
});

export default Studentnotification;
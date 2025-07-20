import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image, Modal, TextInput } from 'react-native';

const ParentHomework = () => {
    const [children, setChildren] = useState([
        { 
            id: '1', 
            name: 'Ahmed Khan', 
            homeworkStatus: 'Completed', 
            subject: 'Mathematics',
            dueDate: '2023-06-20',
            teacher: 'Mrs. Saeed',
            grade: 'A',
            avatar: 'https://i.pravatar.cc/150?img=5'
        },
        { 
            id: '2', 
            name: 'Fatima Raza', 
            homeworkStatus: 'Pending', 
            subject: 'Science',
            dueDate: '2023-06-22',
            teacher: 'Mr. Rehman',
            grade: 'B+',
            avatar: 'https://i.pravatar.cc/150?img=6'
        },
        { 
            id: '3', 
            name: 'Bilal Ahmed', 
            homeworkStatus: 'In Progress', 
            subject: 'English',
            dueDate: '2023-06-18',
            teacher: 'Ms. Khan',
            grade: 'A-',
            avatar: 'https://i.pravatar.cc/150?img=7'
        },
        { 
            id: '4', 
            name: 'Ayesha Malik', 
            homeworkStatus: 'Not Started', 
            subject: 'Urdu',
            dueDate: '2023-06-25',
            teacher: 'Mr. Hussain',
            grade: 'B',
            avatar: 'https://i.pravatar.cc/150?img=8'
        },
    ]);

    const [selectedChild, setSelectedChild] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');

    const refreshStatus = (childId) => {
        setChildren(prevChildren => 
            prevChildren.map(child => 
                child.id === childId 
                    ? { ...child, homeworkStatus: getRandomStatus() } 
                    : child
            )
        );
    };

    const getRandomStatus = () => {
        const statuses = ['Completed', 'Pending', 'In Progress', 'Not Started'];
        return statuses[Math.floor(Math.random() * statuses.length)];
    };

    const openChildDetails = (child) => {
        setSelectedChild(child);
        setIsModalVisible(true);
    };

    const filteredChildren = children.filter(child => {
        const matchesSearch = child.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            child.subject.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = filterStatus === 'All' || child.homeworkStatus === filterStatus;
        return matchesSearch && matchesFilter;
    });

    const renderItem = ({ item }) => (
        <TouchableOpacity onPress={() => openChildDetails(item)}>
            <View style={styles.childCard}>
                <View style={styles.cardHeader}>
                    <Image source={{ uri: item.avatar }} style={styles.avatar} />
                    <View style={styles.headerText}>
                        <Text style={styles.childName}>{item.name}</Text>
                        <Text style={styles.subject}>{item.subject}</Text>
                    </View>
                    <View style={[
                        styles.statusBadge,
                        item.homeworkStatus === 'Completed' && styles.completedBadge,
                        item.homeworkStatus === 'Pending' && styles.pendingBadge,
                        item.homeworkStatus === 'In Progress' && styles.inProgressBadge,
                        item.homeworkStatus === 'Not Started' && styles.notStartedBadge,
                    ]}>
                        <Text style={styles.badgeText}>{item.homeworkStatus}</Text>
                    </View>
                </View>
                
                <View style={styles.cardDetails}>
                    <Text style={styles.detailText}>Due: {item.dueDate}</Text>
                    <Text style={styles.detailText}>Teacher: {item.teacher}</Text>
                    <Text style={styles.detailText}>Grade: {item.grade}</Text>
                </View>
                
                <TouchableOpacity 
                    style={styles.refreshButton}
                    onPress={() => refreshStatus(item.id)}
                >
                    <Text style={styles.buttonText}>Update Status</Text>
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Homework Tracker</Text>
            
            <View style={styles.searchContainer}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search by name or subject..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
                
                <View style={styles.filterContainer}>
                    <Text style={styles.filterLabel}>Filter by:</Text>
                    <TouchableOpacity 
                        style={[styles.filterButton, filterStatus === 'All' && styles.activeFilter]}
                        onPress={() => setFilterStatus('All')}
                    >
                        <Text style={styles.filterText}>All</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={[styles.filterButton, filterStatus === 'Completed' && styles.activeFilter]}
                        onPress={() => setFilterStatus('Completed')}
                    >
                        <Text style={styles.filterText}>Completed</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={[styles.filterButton, filterStatus === 'Pending' && styles.activeFilter]}
                        onPress={() => setFilterStatus('Pending')}
                    >
                        <Text style={styles.filterText}>Pending</Text>
                    </TouchableOpacity>
                </View>
            </View>
            
            <FlatList
                data={filteredChildren}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContainer}
                ListEmptyComponent={
                    <Text style={styles.emptyText}>No homework found matching your criteria</Text>
                }
            />
            
            <Modal
                visible={isModalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setIsModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        {selectedChild && (
                            <>
                                <View style={styles.modalHeader}>
                                    <Image source={{ uri: selectedChild.avatar }} style={styles.modalAvatar} />
                                    <Text style={styles.modalName}>{selectedChild.name}</Text>
                                </View>
                                
                                <View style={styles.modalDetails}>
                                    <DetailRow label="Subject" value={selectedChild.subject} />
                                    <DetailRow label="Teacher" value={selectedChild.teacher} />
                                    <DetailRow label="Due Date" value={selectedChild.dueDate} />
                                    <DetailRow label="Current Grade" value={selectedChild.grade} />
                                    <DetailRow label="Status" value={selectedChild.homeworkStatus} />
                                </View>
                                
                                <TouchableOpacity 
                                    style={styles.closeButton}
                                    onPress={() => setIsModalVisible(false)}
                                >
                                    <Text style={styles.closeButtonText}>Close</Text>
                                </TouchableOpacity>
                            </>
                        )}
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const DetailRow = ({ label, value }) => (
    <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>{label}:</Text>
        <Text style={styles.detailValue}>{value}</Text>
    </View>
);

// Styles remain the same as in the previous English version
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
        padding: 15,
    },
    header: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#2c3e50',
        textAlign: 'center',
    },
    searchContainer: {
        marginBottom: 15,
    },
    searchInput: {
        backgroundColor: 'white',
        padding: 12,
        borderRadius: 8,
        fontSize: 16,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    filterContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    filterLabel: {
        marginRight: 10,
        fontSize: 16,
        color: '#555',
    },
    filterButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 15,
        marginRight: 8,
        backgroundColor: '#e0e0e0',
    },
    activeFilter: {
        backgroundColor: '#3498db',
    },
    filterText: {
        color: '#333',
        fontSize: 14,
    },
    activeFilterText: {
        color: 'white',
    },
    listContainer: {
        paddingBottom: 20,
    },
    childCard: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 15,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 3,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 12,
    },
    headerText: {
        flex: 1,
    },
    childName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2c3e50',
    },
    subject: {
        fontSize: 16,
        color: '#555',
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    completedBadge: {
        backgroundColor: '#d4edda',
    },
    pendingBadge: {
        backgroundColor: '#fff3cd',
    },
    inProgressBadge: {
        backgroundColor: '#cce5ff',
    },
    notStartedBadge: {
        backgroundColor: '#f8d7da',
    },
    badgeText: {
        fontSize: 12,
        fontWeight: '600',
    },
    cardDetails: {
        marginBottom: 12,
    },
    detailText: {
        fontSize: 14,
        color: '#666',
        marginBottom: 4,
    },
    refreshButton: {
        backgroundColor: '#3498db',
        padding: 10,
        borderRadius: 8,
        alignItems: 'center',
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 20,
        fontSize: 16,
        color: '#777',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 20,
        width: '90%',
        maxWidth: 400,
    },
    modalHeader: {
        alignItems: 'center',
        marginBottom: 20,
    },
    modalAvatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        marginBottom: 10,
    },
    modalName: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#2c3e50',
    },
    modalDetails: {
        marginBottom: 20,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
        paddingBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    detailLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#555',
    },
    detailValue: {
        fontSize: 16,
        color: '#2c3e50',
    },
    closeButton: {
        backgroundColor: '#3498db',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    closeButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
});

export default ParentHomework;
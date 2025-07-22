import React from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const AllAttendees = ({ route }) => {
    // Enhanced data validation with student ID handling
    const attendeeData = React.useMemo(() => {
        if (!route?.params) return [];
        const data = Array.isArray(route.params) ? route.params : [route.params];
        return data.map(item => ({
            ...item,
            id: item.studentId || item.id || Math.random().toString(36).substring(7), // Prioritize studentId
            isPresent: item.present ?? true,
            type: item.type || 'student',
            studentId: item.studentId || 'N/A' // Ensure studentId exists
        }));
    }, [route?.params]);

    const [isLoading, setIsLoading] = React.useState(false);

    const renderItem = ({ item }) => (
        <TouchableOpacity 
            style={[
                styles.item,
                !item.isPresent && styles.absentItem
            ]}
            activeOpacity={0.7}
        >
            <View style={styles.itemHeader}>
                <Icon 
                    name={item.present?   'person' : 'school'} 
                    size={20} 
                    color={item.isPresent ? '#3498db' : '#95a5a6'} 
                />
                <Text style={styles.itemText} numberOfLines={1}>
                    {item.name || 'Unnamed Attendee'}
                </Text>
            </View>

            <View style={styles.detailRow}>
                <Text style={styles.typeText}>
                    {item.present ?'Parent' : 'Student'}
                </Text>
                <Text style={styles.idText}>ID: {item.studentId}</Text>
            </View>

            <View style={styles.statusContainer}>
                <View style={[
                    styles.statusBadge,
                    item.isPresent ? styles.presentBadge : styles.absentBadge
                ]}>
                    <Text style={styles.statusText}>
                        {item.isPresent ? 'PRESENT' : 'ABSENT'}
                    </Text>
                </View>
                {item.type === 'student' && (
                    <Text style={styles.gradeText}>
                        Grade: {item.grade || 'N/A'}
                    </Text>
                )}
            </View>
        </TouchableOpacity>
    );

    if (isLoading) {
        return (
            <View style={[styles.container, styles.center]}>
                <ActivityIndicator size="large" color="#3498db" />
            </View>
        );
    }

    // Count present/absent students
    const presentCount = attendeeData.filter(a => a.isPresent).length;
    const absentCount = attendeeData.length - presentCount;

    return (
        <View style={styles.container}>
            <View style={styles.summaryContainer}>
                <Text style={styles.summaryText}>
                    Total: {attendeeData.length} | Present: {presentCount} | Absent: {absentCount}
                </Text>
            </View>

            <FlatList
                data={attendeeData}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Icon name="people-outline" size={50} color="#bdc3c7" />
                        <Text style={styles.emptyText}>No attendees found</Text>
                    </View>
                }
                ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    center: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    summaryContainer: {
        backgroundColor: '#3498db',
        padding: 10,
    },
    summaryText: {
        color: 'white',
        textAlign: 'center',
        fontWeight: '500',
    },
    listContent: {
        padding: 16,
    },
    item: {
        backgroundColor: 'white',
        padding: 16,
        borderRadius: 10,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    absentItem: {
        backgroundColor: '#f9f9f9',
    },
    itemHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    itemText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#2c3e50',
        marginLeft: 10,
        flex: 1,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    typeText: {
        fontSize: 14,
        color: '#7f8c8d',
        backgroundColor: '#ecf0f1',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 10,
    },
    statusContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 12,
    },
    presentBadge: {
        backgroundColor: '#e8f5e9',
    },
    absentBadge: {
        backgroundColor: '#ffebee',
    },
    statusText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#2c3e50',
    },
    idText: {
        fontSize: 14,
        color: '#3498db',
        fontWeight: '500',
    },
    gradeText: {
        fontSize: 13,
        color: '#7f8c8d',
        fontStyle: 'italic',
    },
    separator: {
        height: 8,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    emptyText: {
        fontSize: 16,
        color: '#7f8c8d',
        marginTop: 16,
    },
});

export default AllAttendees;
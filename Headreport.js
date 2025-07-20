import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  ActivityIndicator, 
  FlatList,
  TextInput,
  Alert,
  Modal,
  Button
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { db } from './firebaseConfig';
import { collection, addDoc, getDocs, doc, deleteDoc } from 'firebase/firestore';

const Headreport = () => {
    const [reportTitle, setReportTitle] = useState('');
    const [reportContent, setReportContent] = useState('');
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);

    const fetchReports = async () => {
        setLoading(true);
        try {
            const querySnapshot = await getDocs(collection(db, 'school_reports'));
            const reportsData = [];
            querySnapshot.forEach((doc) => {
                reportsData.push({ id: doc.id, ...doc.data() });
            });
            setReports(reportsData);
        } catch (error) {
            console.error("Error fetching reports: ", error);
            Alert.alert('Error', 'Failed to fetch reports');
        } finally {
            setLoading(false);
        }
    };

    const addReport = async () => {
        if (!reportTitle || !reportContent) {
            Alert.alert('Error', 'Please fill all fields');
            return;
        }

        setLoading(true);
        try {
            await addDoc(collection(db, 'school_reports'), {
                title: reportTitle,
                content: reportContent,
                date: new Date().toLocaleDateString(),
                timestamp: new Date()
            });
            fetchReports();
            setReportTitle('');
            setReportContent('');
            setModalVisible(false);
        } catch (error) {
            console.error("Error adding report: ", error);
            Alert.alert('Error', 'Failed to add report');
        } finally {
            setLoading(false);
        }
    };

    const deleteReport = async (id) => {
        setLoading(true);
        try {
            await deleteDoc(doc(db, 'school_reports', id));
            fetchReports();
        } catch (error) {
            console.error("Error deleting report: ", error);
            Alert.alert('Error', 'Failed to delete report');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReports();
    }, []);

    return (
        <View style={styles.container}>
            <Text style={styles.header}>School Report Panel</Text>
            
            <TouchableOpacity 
                style={styles.addButton}
                onPress={() => setModalVisible(true)}
            >
                <Icon name="add" size={24} color="white" />
                <Text style={styles.addButtonText}>Add New Report</Text>
            </TouchableOpacity>
            
            {loading ? (
                <ActivityIndicator size="large" color="#2c3e50" />
            ) : (
                <FlatList
                    data={reports}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContainer}
                    renderItem={({ item }) => (
                        <View style={styles.reportCard}>
                            <View style={styles.cardHeader}>
                                <Text style={styles.cardTitle}>{item.title}</Text>
                                <TouchableOpacity onPress={() => deleteReport(item.id)}>
                                    <Icon name="delete" size={24} color="#e74c3c" />
                                </TouchableOpacity>
                            </View>
                            <Text style={styles.cardDate}>Posted on: {item.date}</Text>
                            <Text style={styles.cardContent}>{item.content}</Text>
                        </View>
                    )}
                    ListEmptyComponent={
                        <Text style={styles.emptyText}>No reports available</Text>
                    }
                />
            )}

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
                        <Text style={styles.modalTitle}>Add New Report</Text>
                        
                        <TextInput
                            placeholder="Report Title"
                            value={reportTitle}
                            onChangeText={setReportTitle}
                            style={styles.input}
                        />
                        
                        <TextInput
                            placeholder="Report Content"
                            value={reportContent}
                            onChangeText={setReportContent}
                            style={[styles.input, styles.multilineInput]}
                            multiline
                            numberOfLines={5}
                        />
                        
                        <View style={styles.buttonGroup}>
                            <TouchableOpacity 
                                style={[styles.button, styles.submitButton]}
                                onPress={addReport}
                                disabled={loading}
                            >
                                {loading ? (
                                    <ActivityIndicator color="white" />
                                ) : (
                                    <Text style={styles.buttonText}>Submit</Text>
                                )}
                            </TouchableOpacity>
                            
                            <TouchableOpacity 
                                style={[styles.button, styles.cancelButton]}
                                onPress={() => setModalVisible(false)}
                            >
                                <Text style={styles.buttonText}>Cancel</Text>
                            </TouchableOpacity>
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
        padding: 16,
        backgroundColor: '#f8f9fa',
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginVertical: 20,
        color: '#2c3e50',
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#2c3e50',
        padding: 12,
        borderRadius: 5,
        marginBottom: 16,
    },
    addButtonText: {
        color: 'white',
        marginLeft: 8,
        fontSize: 16,
        fontWeight: 'bold',
    },
    listContainer: {
        paddingBottom: 20,
    },
    reportCard: {
        backgroundColor: 'white',
        borderRadius: 8,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2c3e50',
    },
    cardDate: {
        fontSize: 12,
        color: '#7f8c8d',
        marginBottom: 12,
    },
    cardContent: {
        fontSize: 14,
        color: '#34495e',
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 20,
        fontSize: 16,
        color: '#7f8c8d',
    },
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalView: {
        width: '90%',
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
        color: '#2c3e50',
    },
    input: {
        height: 50,
        borderColor: '#ddd',
        borderWidth: 1,
        borderRadius: 5,
        paddingHorizontal: 10,
        marginBottom: 16,
        backgroundColor: '#fff',
    },
    multilineInput: {
        height: 150,
        textAlignVertical: 'top',
        paddingTop: 10,
    },
    buttonGroup: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    button: {
        flex: 1,
        padding: 12,
        borderRadius: 5,
        alignItems: 'center',
        justifyContent: 'center',
    },
    submitButton: {
        backgroundColor: '#2c3e50',
        marginRight: 8,
    },
    cancelButton: {
        backgroundColor: '#e74c3c',
        marginLeft: 8,
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
    },
});

export default Headreport;
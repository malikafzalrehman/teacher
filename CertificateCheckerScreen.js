// CertificateCheckerScreen.js

import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput,
  TouchableOpacity, ScrollView, Alert, 
  ActivityIndicator, Linking
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Extended mock database with more boards and their official websites
const mockDatabase = {
  'HEC': {
    website: 'https://hec.gov.pk',
    records: {
      '12345678': {
        name: "Muhammad Ali",
        degree: "BS Computer Science",
        university: "University of Punjab",
        year: "2020",
        status: "Verified with HEC"
      }
    }
  },
  'BISE Lahore': {
    website: 'http://biselahore.com',
    records: {
      '98765432': {
        name: "Ayesha Khan",
        degree: "Matriculation",
        school: "Lahore Grammar School",
        year: "2015",
        status: "Verified with BISE Lahore"
      }
    }
  },
  'FBISE': {
    website: 'https://fbise.edu.pk',
    records: {
      '11223344': {
        name: "Ahmed Raza",
        degree: "Intermediate Pre-Engineering",
        college: "Pak-Turk Maarif College",
        year: "2017",
        status: "Verified with FBISE"
      }
    }
  },
  'BISE Karachi': {
    website: 'http://biek.edu.pk',
    records: {
      '22223333': {
        name: "Fatima Ahmed",
        degree: "Matriculation",
        school: "Bay View High School",
        year: "2014",
        status: "Verified with BISE Karachi"
      }
    }
  },
  'BISE Rawalpindi': {
    website: 'http://biserawalpindi.edu.pk',
    records: {
      '33445566': {
        name: "Zeeshan Tariq",
        degree: "Intermediate",
        college: "Fazaia Inter College",
        year: "2018",
        status: "Verified with BISE Rawalpindi"
      }
    }
  },
  'BISE Multan': {
    website: 'http://bisemultan.edu.pk',
    records: {
      '44556677': {
        name: "Asma Bibi",
        degree: "Matric",
        school: "Allied School Multan",
        year: "2016",
        status: "Verified with BISE Multan"
      }
    }
  },
  'AIOU': {
    website: 'https://aiou.edu.pk',
    records: {
      '55667788': {
        name: "Imran Haider",
        degree: "BA",
        university: "Allama Iqbal Open University",
        year: "2019",
        status: "Verified with AIOU"
      }
    }
  },
  'Aga Khan University': {
    website: 'https://www.aku.edu',
    records: {
      '66778899': {
        name: "Sara Yusuf",
        degree: "O-Levels",
        school: "The Lyceum",
        year: "2013",
        status: "Verified with Aga Khan Board"
      }
    }
  },
  'BISE Peshawar': {
    website: 'http://bisep.edu.pk',
    records: {
      '77889900': {
        name: "Hassan Nawaz",
        degree: "Intermediate",
        college: "Islamia College Peshawar",
        year: "2017",
        status: "Verified with BISE Peshawar"
      }
    }
  },
  'BISE Quetta': {
    website: 'http://biseq.edu.pk',
    records: {
      '88990011': {
        name: "Noor Baloch",
        degree: "Matric",
        school: "Quetta Public School",
        year: "2016",
        status: "Verified with BISE Quetta"
      }
    }
  }
};

const educationBoards = Object.keys(mockDatabase);

const ResultBox = ({ result, board }) => {
  const isValid = result.valid;
  const details = result.details;
  const boardWebsite = mockDatabase[board]?.website;

  const handleVisitWebsite = () => {
    if (boardWebsite) {
      Linking.openURL(boardWebsite).catch(err => {
        Alert.alert('Error', 'Could not open website');
      });
    }
  };

  return (
    <View style={[
      styles.resultContainer,
      isValid ? styles.validResult : styles.invalidResult
    ]}>
      <Text style={styles.resultTitle}>
        {isValid ? '✅ Verified Certificate' : '❌ Certificate Not Found'}
      </Text>
      
      <View style={styles.detailsContainer}>
        {Object.entries(details).map(([key, value]) => (
          <View key={key} style={styles.detailRow}>
            <Text style={styles.detailLabel}>
              {key.replace(/^\w/, c => c.toUpperCase())}:
            </Text>
            <Text style={styles.detailValue}>{value}</Text>
          </View>
        ))}
      </View>

      <View style={styles.websiteContainer}>
        <Text style={styles.websiteText}>For official verification:</Text>
        <TouchableOpacity 
          style={styles.websiteButton} 
          onPress={handleVisitWebsite}
          disabled={!boardWebsite}
        >
          <Icon name="open-in-new" size={16} color="#fff" />
          <Text style={styles.websiteButtonText}>
            Visit {board} Website
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.note}>
        Note: This is a demonstration application. For official verification, please visit the respective board's website.
      </Text>
    </View>
  );
};

const CertificateCheckerScreen = () => {
  const [degreeNumber, setDegreeNumber] = useState('');
  const [selectedBoard, setSelectedBoard] = useState(educationBoards[0]);
  const [verificationResult, setVerificationResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const verifyDegree = () => {
    if (!degreeNumber.trim()) {
      Alert.alert('Error', 'Please enter a degree or roll number');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const boardData = mockDatabase[selectedBoard]?.records;
      const result = boardData?.[degreeNumber];

      setLoading(false);
      if (result) {
        setVerificationResult({ valid: true, details: result });
      } else {
        setVerificationResult({
          valid: false,
          details: {
            status: `Not found in ${selectedBoard} records`,
            message: "This certificate could not be verified in our system."
          }
        });
      }
    }, 1000);
  };

  const resetForm = () => {
    setDegreeNumber('');
    setVerificationResult(null);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Pakistan Certificate Verification</Text>
        <Text style={styles.subtitle}>
          Verify educational certificates from HEC and all Pakistan Boards
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Certificate Details</Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Select Education Board</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={selectedBoard}
              onValueChange={setSelectedBoard}
              style={styles.picker}
              dropdownIconColor="#666"
            >
              {educationBoards.map(board => (
                <Picker.Item 
                  key={board} 
                  label={board} 
                  value={board} 
                />
              ))}
            </Picker>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Certificate/Roll Number</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your certificate or roll number"
            placeholderTextColor="#999"
            value={degreeNumber}
            onChangeText={setDegreeNumber}
            keyboardType="number-pad"
          />
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#2e86de" style={styles.loader} />
        ) : verificationResult ? (
          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={resetForm}
          >
            <Text style={styles.buttonText}>Check Another Certificate</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            style={styles.button}
            onPress={verifyDegree}
            disabled={loading}
          >
            <Text style={styles.buttonText}>Verify Certificate</Text>
          </TouchableOpacity>
        )}
      </View>

      {verificationResult && (
        <ResultBox result={verificationResult} board={selectedBoard} />
      )}

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          This service is provided for informational purposes only.
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
    backgroundColor: '#f5f7fa',
  },
  header: {
    marginBottom: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
    lineHeight: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#34495e',
    marginBottom: 8,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#dfe6e9',
    borderRadius: 8,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    color: '#2d3436',
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#dfe6e9',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#2d3436',
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#2e86de',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  secondaryButton: {
    backgroundColor: '#10ac84',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loader: {
    marginVertical: 20,
  },
  resultContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  validResult: {
    borderLeftWidth: 5,
    borderLeftColor: '#1dd1a1',
  },
  invalidResult: {
    borderLeftWidth: 5,
    borderLeftColor: '#ff6b6b',
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: 16,
  },
  detailsContainer: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  detailLabel: {
    fontWeight: '600',
    color: '#7f8c8d',
    width: 120,
  },
  detailValue: {
    flex: 1,
    color: '#2d3436',
  },
  websiteContainer: {
    marginTop: 16,
    marginBottom: 16,
    borderTopWidth: 1,
    borderTopColor: '#ecf0f1',
    paddingTop: 16,
  },
  websiteText: {
    color: '#7f8c8d',
    fontSize: 14,
    marginBottom: 12,
  },
  websiteButton: {
    backgroundColor: '#3498db',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  websiteButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  note: {
    fontSize: 12,
    color: '#95a5a6',
    fontStyle: 'italic',
    marginTop: 16,
    lineHeight: 18,
  },
  footer: {
    marginTop: 16,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#ecf0f1',
  },
  footerText: {
    fontSize: 12,
    color: '#95a5a6',
    textAlign: 'center',
  },
});

export default CertificateCheckerScreen;
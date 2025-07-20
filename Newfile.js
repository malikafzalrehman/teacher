import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Modal,
  SafeAreaView,
  StatusBar,
  TextInput,
  Alert
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';

// Constants
const ROLES = {
  ADMIN: 'Admin',
  HEAD: 'Head',
  TEACHER: 'Teacher',
  STUDENT: 'Student',
  PARENT: 'Parent',
  ACCOUNTANT: 'Accountant'
};

// Module Components
const AdminDashboardScreen = () => (
  <ModuleScreen
    icon="settings"
    color="#D32F2F"
    title="Admin Dashboard"
    description="System configuration and user management"
  />
);

const HeadPanelScreen = () => (
  <ModuleScreen
    icon="shield-checkmark"
    color="#C62828"
    title="Head Panel"
    description="School overview and management"
  />
);

const TeacherDashboardScreen = () => (
  <ModuleScreen
    icon="person"
    color="#1E88E5"
    title="Teacher Dashboard"
    description="Your teaching schedule and resources"
  />
);

const StudentPortalScreen = () => (
  <ModuleScreen
    icon="person"
    color="#43A047"
    title="Student Portal"
    description="Your student dashboard"
  />
);

const ParentPortalScreen = () => (
  <ModuleScreen
    icon="home"
    color="#6D4C41"
    title="Parent Portal"
    description="Monitor your child's progress"
  />
);

const AccountantDashboardScreen = () => (
  <ModuleScreen
    icon="cash"
    color="#F4511E"
    title="Accountant Dashboard"
    description="Manage school finances"
  />
);

const ClassManagementScreen = () => (
  <ModuleScreen
    icon="school"
    color="#00897B"
    title="Class Management"
    description="Manage your classes and students"
  />
);

const AttendanceScreen = () => (
  <ModuleScreen
    icon="checkbox"
    color="#00ACC1"
    title="Attendance"
    description="Take and manage student attendance"
  />
);

const HomeworkScreen = () => (
  <ModuleScreen
    icon="document-text"
    color="#FB8C00"
    title="Homework"
    description="Assign and check homework"
  />
);

const ExamManagementScreen = () => (
  <ModuleScreen
    icon="create"
    color="#8E24AA"
    title="Exam Management"
    description="Create and manage exams"
  />
);

const MessagesScreen = () => (
  <ModuleScreen
    icon="chatbubbles"
    color="#5E35B1"
    title="Messages"
    description="Communicate with others"
  />
);

const NotificationsScreen = () => (
  <ModuleScreen
    icon="notifications"
    color="#039BE5"
    title="Notifications"
    description="View system notifications"
  />
);

const ReportsScreen = () => (
  <ModuleScreen
    icon="stats-chart"
    color="#009688"
    title="Reports"
    description="Generate and view reports"
  />
);

// Reusable Module Screen Component
const ModuleScreen = ({ icon, color, title, description, }) => (
  <View style={[styles.container, styles.centerContent]}>
    <Icon name={icon} size={50} color={color} />
    <Text style={styles.screenTitle}>{title}</Text>
    <Text style={styles.moduleDescription}>{description}</Text>
  </View>
);

// School Setup Component
const SchoolSetupScreen = ({ schoolInfo, setSchoolInfo, onClose }) => {
  const [formData, setFormData] = useState({
    name: schoolInfo.name || '',
    address: schoolInfo.address || '',
    phone: schoolInfo.phone || '',
    email: schoolInfo.email || '',
    principal: schoolInfo.principal || '',
    establishedYear: schoolInfo.establishedYear || '',
    motto: schoolInfo.motto || ''
  });

  const handleInputChange = (name, value) => {
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = () => {
    if (!formData.name) {
      Alert.alert('Error', 'School name is required');
      return;
    }

    setSchoolInfo(formData);
    onClose();
    Alert.alert('Success', 'School information saved successfully');
  };

  return (
    <ScrollView style={styles.setupContainer}>
      <Text style={styles.setupTitle}>School Information Setup</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>School Name*</Text>
        <TextInput
          style={styles.input}
          value={formData.name}
          onChangeText={(text) => handleInputChange('name', text)}
          placeholder="Enter school name"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Address</Text>
        <TextInput
          style={styles.input}
          value={formData.address}
          onChangeText={(text) => handleInputChange('address', text)}
          placeholder="Enter school address"
          multiline
        />
      </View>

      <View style={styles.buttonGroup}>
        <TouchableOpacity
          style={[styles.actionButton, styles.cancelButton]}
          onPress={onClose}
        >
          <Text style={styles.buttonText}>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.submitButton]}
          onPress={handleSubmit}
        >
          <Text style={styles.buttonText}>Save Information</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

// Dashboard Component
const DashboardScreen = ({
  currentUserRole,
  setCurrentUserRole,
  onModuleSelect,
  schoolInfo,
  onSchoolSetupPress,
}) => {
  const navigation = useNavigation();
  const state = useSelector(e => e)
  useEffect(() => {
    setCurrentUserRole(state.counter.user.role)
  }, [])
  const MODULES = [
    {
      title: 'Admin Dashboard',
      icon: 'settings',
      color: '#D32F2F',
      roles: [ROLES.ADMIN],
      component: AdminDashboardScreen,

    },
    {
      title: 'Admission form',
      icon: 'business',
      color: '#7B1FA2',
      roles: [ROLES.ADMIN],
      specialAction: onSchoolSetupPress
    },
    {
      title: 'Head Panel',
      icon: 'shield-checkmark',
      color: '#C62828',
      roles: [ROLES.ADMIN, ROLES.HEAD],
      component: HeadPanelScreen
    },
    {
      title: 'Teacher Dashboard',
      icon: 'person',
      color: '#1E88E5',
      roles: [ROLES.ADMIN, ROLES.HEAD, ROLES.TEACHER],
      component: TeacherDashboardScreen
    },
    {
      title: 'Class Management',
      icon: 'school',
      color: '#00897B',
      roles: [ROLES.ADMIN, ROLES.HEAD, ROLES.TEACHER],
      component: ClassManagementScreen
    },
    {
      title: 'Attendance',
      icon: 'checkbox',
      color: '#00ACC1',
      roles: [ROLES.ADMIN, ROLES.HEAD, ROLES.TEACHER],
      component: AttendanceScreen
    },
    {
      title: 'Homework',
      icon: 'document-text',
      color: '#FB8C00',
      roles: [ROLES.ADMIN, ROLES.TEACHER, ROLES.STUDENT, ROLES.PARENT],
      component: HomeworkScreen
    },
    {
      title: 'Exam Management',
      icon: 'create',
      color: '#8E24AA',
      roles: [ROLES.ADMIN, ROLES.HEAD, ROLES.TEACHER],
      component: ExamManagementScreen
    },
    {
      title: 'Student Portal',
      icon: 'person',
      color: '#43A047',
      roles: [ROLES.ADMIN, ROLES.STUDENT],
      component: StudentPortalScreen
    },
    {
      title: 'Parent Portal',
      icon: 'home',
      color: '#6D4C41',
      roles: [ROLES.ADMIN, ROLES.PARENT],
      component: ParentPortalScreen
    },
    {
      title: 'Fee Management',
      icon: 'cash',
      color: '#F4511E',
      roles: [ROLES.ADMIN, ROLES.ACCOUNTANT],
      component: AccountantDashboardScreen
    },
    {
      title: 'Messages',
      icon: 'chatbubbles',
      color: '#5E35B1',
      roles: [ROLES.ADMIN, ROLES.HEAD, ROLES.TEACHER, ROLES.STUDENT, ROLES.PARENT],
      component: MessagesScreen
    },
    {
      title: 'Notifications',
      icon: 'notifications',
      color: '#039BE5',
      roles: [ROLES.ADMIN, ROLES.HEAD, ROLES.TEACHER, ROLES.STUDENT, ROLES.PARENT],
      component: NotificationsScreen
    },
    {
      title: 'Reports',
      icon: 'stats-chart',
      color: '#009688',
      roles: [ROLES.ADMIN, ROLES.HEAD, ROLES.ACCOUNTANT],
      component: ReportsScreen
    },
  ];

  const filteredModules = MODULES.filter(module =>
    module.roles.includes(currentUserRole)
  );

  const handleModulePress = (module) => {
    if (module.specialAction) {
      module.specialAction();
    } else {
      onModuleSelect(module);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{schoolInfo.name || '🏫 StudyProAI'}</Text>
        <Text style={styles.subtitle}>
          {schoolInfo.motto || 'Complete Educational Management System'}
        </Text>

        <View style={styles.roleSelector}>
          <Text style={styles.roleLabel}>Select Role:</Text>
          <View style={styles.roleButtons}>
            {Object.values(ROLES).map(role => {

              return role.toLocaleLowerCase() == state.counter.user.role ? (
                <TouchableOpacity
                  key={role}
                  style={[
                    styles.roleButton,
                    currentUserRole === role && styles.selectedRoleButton
                  ]}
                  onPress={() => setCurrentUserRole(role)}
                >
                  <Text style={styles.roleButtonText}>{role}</Text>
                </TouchableOpacity>
              ) :null
            })}
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          {currentUserRole.charAt(0).toUpperCase() + currentUserRole.slice(1)} Dashboard
        </Text>

        {filteredModules.length === 0 ? (
          <Text style={styles.noAccessText}>No modules available for this role.</Text>
        ) : (
          <View style={styles.grid}>
            {filteredModules.map((module, index) => {
           
              return (
                <TouchableOpacity
                  key={index}
                  style={[styles.card, { backgroundColor: module.color }]}
                  onPress={() => {

                    if (module.title == "Admin Dashboard") {
                      navigation.navigate("admin")

                    }
                    else if (module.title == "Admission form") {
                      navigation.navigate("schoolonlinesetup")
                      return
                    }
                    else if (module.title == "Head Panel") {
                      navigation.navigate("headpanel")
                      return

                    }
                    else if (module.title == "Teacher Dashboard") {
                      if (currentUserRole == "Admin") {
                        navigation.navigate("teacherdashborad")
                        return
                      } else if (currentUserRole == "Head") {
                        navigation.navigate("headteacherdash")
                        return

                      } else {
                        navigation.navigate("teacherprofile")
                        return

                      }

                    }

                    else if (module.title == "Class Management") {
                      if (currentUserRole == "Admin") {
                        navigation.navigate("classmanagement")
                        return


                      } else if (currentUserRole == "Head") {
                        navigation.navigate("teacherclass")
                        return

                      }
                      else {
                        navigation.navigate("teacherclassmanagement")
                        return

                      }


                    }

                    else if (module.title == "Attendance") {
                      if (currentUserRole == "Admin") {
                        navigation.navigate("attendanc")
                        return

                      } else {
                        navigation.navigate("teacherattendance")
                        return

                      }

                    }
                    else if (module.title == "Homework") {
                      if (currentUserRole == "Admin") {
                        navigation.navigate("homework")
                        return

                      }
                      if (currentUserRole == "Teacher") {
                        navigation.navigate("teacherhomework")
                        return

                      }
                      if (currentUserRole == "Student") {
                        navigation.navigate("studenthomework")
                        return

                      }
                      if (currentUserRole == "Parent") {
                        navigation.navigate("parenthomwork")
                        return

                      }


                    }
                    else if (module.title == "Exam Management") {


                      if (currentUserRole == "Admin") {
                        navigation.navigate("exammanagement")
                        return
                      } else if (currentUserRole == "Head") {
                        navigation.navigate("exammanagement")
                        return
                      }
                      else {
                        navigation.navigate("headexammanagement")
                        return
                      }


                    }
                    else if (module.title == "Student Portal") {

                      if (currentUserRole == "Admin") {
                        navigation.navigate("studentportal")
                        return
                      } else if (currentUserRole == "Student") {
                        navigation.navigate("studentportal1")
                        return
                      }





                    }

                    else if (module.title == "Fee Management") {
                      if (currentUserRole == "Admin") {
                        navigation.navigate("feemanagement")
                        return
                      } else {
                        navigation.navigate("afee")
                        return

                      }

                    }
                    else if (module.title == "Messages") {
                      if (currentUserRole == "Admin") {
                        navigation.navigate("massages")
                        return

                      }

                      if (currentUserRole == "Head") {
                        navigation.navigate("headmessages")
                        return
                      }

                      if (currentUserRole == "Teacher") {
                        navigation.navigate("teachermessages")
                        return
                      }
                      if (currentUserRole == "Student") {
                        navigation.navigate("studentmessages")
                        return
                      }
                      if (currentUserRole == "Parent") {
                        navigation.navigate("parentmessages")
                        return
                      }


                    }





                    else if (module.title == "Parent Portal") {
                      if (currentUserRole == "Admin") {
                        navigation.navigate("parentprotal")
                      } if (currentUserRole == "Parent") {
                        navigation.navigate("parentprotal1")


                      }


                    }

                    else if (module.title == "Notifications") {
                      if (currentUserRole == "Admin")
                        navigation.navigate("notifications")



                      if (currentUserRole == "Head") {
                        navigation.navigate("headnotification")
                        return
                      }
                      if (currentUserRole == "Teacher") {
                        navigation.navigate("tnotification")
                        return
                      }


                      if (currentUserRole == "Student") {
                        navigation.navigate("studentnotification")
                        return
                      }

                      if (currentUserRole == "Parent") {
                        navigation.navigate("parentnotification")
                        return
                      }


                    }





                    else if (module.title == "Reports") {
                      if (currentUserRole == "Admin")
                        navigation.navigate("report")



                      if (currentUserRole == "Head") {
                        console.log(999)
                        navigation.navigate("headreport")
                        return
                      }
                      if (currentUserRole == "Accountant") {
                        navigation.navigate("accountantreport")
                      }
                    }



                  }}
                >
                  <Icon name={module.icon} size={30} color="#fff" />
                  <Text style={styles.cardText}>{module.title}</Text>
                </TouchableOpacity>
              )
            })}
          </View>
        )}
      </View>
    </ScrollView>
  );
};

// Main App Component
const SchoolManagementApp = () => {
  const [currentUserRole, setCurrentUserRole] = useState(ROLES.ADMIN);
  const [currentScreen, setCurrentScreen] = useState('dashboard');
  const [selectedModule, setSelectedModule] = useState(null);
  const [schoolInfo, setSchoolInfo] = useState({});
  const [showSchoolSetup, setShowSchoolSetup] = useState(false);

  const handleModuleSelect = (module) => {
    setSelectedModule(module);
    setCurrentScreen('module');
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'dashboard':
        return (
          <DashboardScreen
            currentUserRole={currentUserRole}
            setCurrentUserRole={setCurrentUserRole}
            onModuleSelect={handleModuleSelect}
            schoolInfo={schoolInfo}

            onSchoolSetupPress={() => setShowSchoolSetup(true)}
          />
        );
      case 'module':
        if (selectedModule?.component) {
          const ModuleComponent = selectedModule.component;
          return <ModuleComponent />;
        }
        return null;
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor="#2E7D32" />

      {showSchoolSetup ? (
        <SchoolSetupScreen
          schoolInfo={schoolInfo}
          setSchoolInfo={setSchoolInfo}
          onClose={() => setShowSchoolSetup(false)}
        />
      ) : renderScreen()}
    </SafeAreaView>
  );
};

// Styles
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff'
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    padding: 20
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 10,
    color: '#333'
  },
  moduleDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center'
  },
  header: {
    padding: 20,
    backgroundColor: '#2E7D32',
    paddingBottom: 30
  },
  title: {
    fontSize: 28,
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center'
  },
  subtitle: {
    fontSize: 16,
    color: '#c8e6c9',
    textAlign: 'center',
    marginBottom: 15
  },
  roleSelector: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 10,
    padding: 10,
  },
  roleLabel: {
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 5
  },
  roleButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center'
  },
  roleButton: {
    padding: 8,
    margin: 3,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 5,
    minWidth: 80
  },
  selectedRoleButton: {
    backgroundColor: '#FFC107',
  },
  roleButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 12
  },
  section: {
    padding: 20,
    paddingTop: 10
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 5
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: '47%',
    height: 100,
    borderRadius: 10,
    marginBottom: 15,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  cardText: {
    color: '#fff',
    fontWeight: 'bold',
    marginTop: 10,
    textAlign: 'center',
    fontSize: 12,
  },
  noAccessText: {
    textAlign: 'center',
    color: '#999',
    fontSize: 16,
    marginTop: 20,
    padding: 20,
    backgroundColor: '#f5f5f5',
    borderRadius: 10
  },
  // School Setup Styles
  setupContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff'
  },
  setupTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#2E7D32',
    textAlign: 'center'
  },
  inputGroup: {
    marginBottom: 15
  },
  inputLabel: {
    fontSize: 16,
    marginBottom: 5,
    color: '#555',
    fontWeight: 'bold'
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9'
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20
  },
  actionButton: {
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5
  },
  cancelButton: {
    backgroundColor: '#757575'
  },
  submitButton: {
    backgroundColor: '#2E7D32'
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16
  }
});

export default SchoolManagementApp;
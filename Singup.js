import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import Ionicons from 'react-native-vector-icons/Ionicons';
import firestore from '@react-native-firebase/firestore';
const SignUp = ({navigation}) => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    age: '',
    role: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleChange = (key, value) => {
    setForm({ ...form, [key]: value });
  };

  const handleSubmit = () => {
    if (!form.name || !form.email || !form.phone || !form.age || !form.role || !password) {
      Alert.alert('Missing Information', 'Please fill in all fields to continue.');
      return;
    }

    if (password.length < 8) {
      Alert.alert('Weak Password', 'Password must be at least 8 characters long.');
      return;
    }
    let id="id-"+Date.now()
    form.id=id
    form.password=password
    console.log(form)
 
firestore()
  .collection('Users')
  .doc(id)
  .set(form)
  .then(() => {
    console.log('User added!');
  });
 
    Alert.alert('Account Created', `Welcome ${form.name}! You've signed up as ${form.role}.`);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <ScrollView 
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <Image 
          // source={require('./assets/signup-icon.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        
        <Text style={styles.title}>Create Your Account</Text>
        <Text style={styles.subtitle}>Join our community today</Text>

        {/* Name Input */}
        <View style={styles.inputContainer}>
          <Ionicons name="person-outline" size={20} color="#64748b" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Full Name"
            placeholderTextColor="#94a3b8"
            value={form.name}
            onChangeText={(text) => handleChange('name', text)}
          />
        </View>

        {/* Email Input */}
        <View style={styles.inputContainer}>
          <Ionicons name="mail-outline" size={20} color="#64748b" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Email Address"
            placeholderTextColor="#94a3b8"
            keyboardType="email-address"
            autoCapitalize="none"
            value={form.email}
            onChangeText={(text) => handleChange('email', text)}
          />
        </View>

        {/* Password Input */}
        <View style={styles.inputContainer}>
          <Ionicons name="lock-closed-outline" size={20} color="#64748b" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#94a3b8"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity 
            style={styles.eyeIcon} 
            onPress={() => setShowPassword(!showPassword)}
          >
            <Ionicons 
              name={showPassword ? "eye-off-outline" : "eye-outline"} 
              size={20} 
              color="#64748b" 
            />
          </TouchableOpacity>
        </View>

        {/* Phone Input */}
        <View style={styles.inputContainer}>
          <Ionicons name="call-outline" size={20} color="#64748b" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Phone Number"
            placeholderTextColor="#94a3b8"
            keyboardType="phone-pad"
            value={form.phone}
            onChangeText={(text) => handleChange('phone', text)}
          />
        </View>

        {/* Age Input */}
        <View style={styles.inputContainer}>
          <Ionicons name="calendar-outline" size={20} color="#64748b" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Age"
            placeholderTextColor="#94a3b8"
            keyboardType="numeric"
            value={form.age}
            onChangeText={(text) => handleChange('age', text)}
          />
        </View>

        {/* Role Dropdown - Improved */}
        <View style={styles.inputContainer}>
  <Ionicons name="people-outline" size={20} color="#64748b" style={styles.inputIcon} />
  <RNPickerSelect
    onValueChange={(value) => handleChange('role', value)}
    onOpen={() => setDropdownOpen(true)}
    onClose={() => setDropdownOpen(false)}
    placeholder={{
      label: 'Select Your Role',
      value: '',
      color: '#94a3b8',
    }}
    value={form.role}
    items={[
      { label: 'Head', value: 'head' },
      { label: 'Teacher', value: 'teacher' },
      { label: 'Student', value: 'student' },
      { label: 'Parent', value: 'parent' },
       { label: 'Admin', value: 'Admin' }
    ]}
    style={{
      ...pickerSelectStyles,
      iconContainer: {
        top: 18,
        right: 15,
      },
    }}
    useNativeAndroidPickerStyle={false}
    Icon={() => (
      <Ionicons 
        name={dropdownOpen ? "chevron-up" : "chevron-down"} 
        size={20} 
        color="#64748b" 
      />
    )}
  />
</View>


        {/* Submit Button */}
        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
          <Text style={styles.buttonText}>Sign Up</Text>
        </TouchableOpacity>

        {/* Login Link */}
        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>Already have an account?</Text>
          <TouchableOpacity
           onPress={()=>{
                navigation.navigate("login")
                }}>
            <Text style={styles.loginLink}> Log In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default SignUp;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#ffffff',
    padding: 30,
    paddingTop: 50,
  },
  logo: {
    width: 100,
    height: 100,
    alignSelf: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 5,
    color: '#1e293b',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 30,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  dropdownContainer: {
    flex: 1,
    height: 55,
    justifyContent: 'center',
  },
  inputIcon: {
    marginLeft: 15,
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 55,
    paddingHorizontal: 10,
    fontSize: 16,
    color: '#1e293b',
  },
  eyeIcon: {
    padding: 15,
  },
  button: {
    backgroundColor: '#4f46e5',
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 20,
    width: '100%',
    shadowColor: '#4f46e5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 18,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 25,
  },
  loginText: {
    color: '#64748b',
  },
  loginLink: {
    color: '#4f46e5',
    fontWeight: '600',
  },
});
const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    color: '#0f172a', // text color
    paddingRight: 30, // for dropdown icon
    backgroundColor: '#fff',
  },
  inputAndroid: {
    fontSize: 16,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    color: '#0f172a', // text color
    paddingRight: 30,
    backgroundColor: '#fff',
  },
});
 
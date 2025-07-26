import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ImageBackground,
  ActivityIndicator
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import firestore from '@react-native-firebase/firestore';
import { useDispatch } from 'react-redux';
import { userData } from './redux/slices/counterSlices';
import { getAllOfCollectionwherewhere } from './service/main';

const Login = (props) => {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({
    email: '',
    password: ''
  });
  const dispatch = useDispatch();

  // Validation functions
  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };

  const validatePassword = (password) => {
    return password.length >= 8;
  };

  const validateForm = () => {
    let valid = true;
    const newErrors = { email: '', password: '' };

    // Email validation
    if (!email.trim()) {
      newErrors.email = 'Email is required';
      valid = false;
    } else if (!validateEmail(email)) {
      newErrors.email = 'Please enter a valid email address';
      valid = false;
    }

    // Password validation
    if (!password) {
      newErrors.password = 'Password is required';
      valid = false;
    } else if (!validatePassword(password)) {
      newErrors.password = 'Password must be at least 8 characters';
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleLogin = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      const querySnapshot = await firestore().collection('Users').get();
      let userFound = false;
      let count=0;
      querySnapshot.forEach(documentSnapshot => {
        const item = documentSnapshot.data();
        if (item.email === email && password === item.password) {
          
          userFound = true;
          dispatch(userData(item));
          props.navigation.navigate("Home");
        }
      });
      
      if (!userFound) {
        // console.log("Teacher","email",email,"password",password);
        
         const querySnapshot = await getAllOfCollectionwherewhere("Teacher","email",email,"password",password);
      
          if(querySnapshot.length>0)
          {
            dispatch(userData(querySnapshot[0]));
          props.navigation.navigate("Home");
       
          }else{
               const querySnapshot = await getAllOfCollectionwherewhere("students","email",email,"password",password);
             if(querySnapshot.length>0)
          {
            dispatch(userData(querySnapshot[0]));
          props.navigation.navigate("Home");
       
          }else{
             Alert.alert('Error', 'Invalid email or password');
          }
          }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to login. Please try again.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ImageBackground
      source={require('./logo.png.png')}
      style={styles.background}
      resizeMode="cover"
      blurRadius={2}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.card}>
            <View style={styles.header}>
              <Text style={styles.title}>School Portal Login</Text>
              <Text style={styles.subtitle}>Access your educational resources</Text>
            </View>

            <View style={styles.formContainer}>
              {/* Email Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Email Address</Text>
                <TextInput
                  placeholder="student@school.edu"
                  placeholderTextColor="#a0a0a0"
                  style={[styles.input, errors.email && styles.inputError]}
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    if (errors.email) setErrors({...errors, email: ''});
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}
              </View>

              {/* Password Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Password</Text>
                <TextInput
                  placeholder="••••••••"
                  placeholderTextColor="#a0a0a0"
                  style={[styles.input, errors.password && styles.inputError]}
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (errors.password) setErrors({...errors, password: ''});
                  }}
                  secureTextEntry
                  autoCapitalize="none"
                />
                {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}
              </View>

              {/* Forgot Password Link */}
              <TouchableOpacity 
                style={styles.forgotPassword}
                onPress={() => navigation.navigate('ForgotPassword')}
              >
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
              </TouchableOpacity>

              {/* Submit Button */}
              <TouchableOpacity
                style={styles.button}
                onPress={handleLogin}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Sign In</Text>
                )}
              </TouchableOpacity>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>Don't have an account?</Text>
              <TouchableOpacity onPress={() => navigation.navigate('singup')}>
                <Text style={styles.footerLink}>Register here</Text>
              </TouchableOpacity>
            </View>
          </View>         
        </ScrollView>
      </KeyboardAvoidingView> 
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    marginHorizontal: 24,
    padding: 32,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
  header: {
    marginBottom: 32,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
  },
  formContainer: {
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 10, // Reduced from 20 to accommodate error text
  },
  label: {
    fontSize: 14,
    color: '#34495e',
    marginBottom: 8,
    fontWeight: '600',
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
  inputError: {
    borderColor: '#e74c3c',
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 12,
    marginTop: 4,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: '#3498db',
    fontSize: 14,
    fontWeight: '500',
  },
  button: {
    height: 50,
    backgroundColor: '#3498db',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#3498db',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  footerText: {
    color: '#7f8c8d',
    fontSize: 14,
    marginRight: 4,
  },
  footerLink: {
    color: '#3498db',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default Login;
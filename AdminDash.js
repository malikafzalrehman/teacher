import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
  Platform,
  PermissionsAndroid,
  KeyboardAvoidingView,
  Animated,
  Dimensions,
  Modal,
  Pressable,
  Linking
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Icon2 from 'react-native-vector-icons/MaterialCommunityIcons';
import MapView, { Marker } from 'react-native-maps';
import Geocoder from 'react-native-geocoding';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { useSelector } from 'react-redux';
import { getAllOfCollectionwhere } from './service/main';

// Initialize Geocoder with your Google Maps API key
Geocoder.init('YOUR_GOOGLE_MAPS_API_KEY');

const { width, height } = Dimensions.get('window');

const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.0922;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

const AdminDash = () => {
  // State for school data
  const [schoolData, setSchoolData] = useState({
    basicInfo: {
      name: '',
      address: '',
      location: '',
      latitude: null,
      longitude: null,
      totalStudents: '',
      schoolPicture: null,
    },
    contactInfo: {
      principal: '',
      contact: '',
      email: '',
      website: '',
    },
    profileInfo: {
      profilePicture: null,
      motto: '',
      establishedYear: '',
      schoolType: 'public', // 'public' or 'private'
      facilities: [],
    }
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [activeField, setActiveField] = useState(null);
  const [mapModalVisible, setMapModalVisible] = useState(false);
  const [imagePickerModalVisible, setImagePickerModalVisible] = useState(false);
  const [currentImageType, setCurrentImageType] = useState(null);
  const [currentTab, setCurrentTab] = useState('basic'); // 'basic', 'contact', 'profile'
  const [region, setRegion] = useState({
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: LATITUDE_DELTA,
    longitudeDelta: LONGITUDE_DELTA,
  });
  const [savedSchools, setSavedSchools] = useState([]);
  const [showProfile, setShowProfile] = useState(false);
  const [selectedSchoolData, setSelectedSchoolData] = useState([]);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef();
  const mapRef = useRef();
const sate=useSelector(state=>state);
  // Fetch saved schools on component mount
  useEffect(() => {
  getAllSchool()
    
  }, []);
const getAllSchool=async()=>{
  let data=await getAllOfCollectionwhere("Schools","adminId", sate.counter.user.id)
  if(data.length>0)
  {
    setSavedSchools(data)
  }
 
}
  // Animation functions
  const animateIn = () => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const animateOut = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  // Permission handling
  const requestCameraPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.CAMERA,
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        ]);
        
        return (
          granted['android.permission.CAMERA'] === PermissionsAndroid.RESULTS.GRANTED &&
          granted['android.permission.READ_EXTERNAL_STORAGE'] === PermissionsAndroid.RESULTS.GRANTED &&
          granted['android.permission.ACCESS_FINE_LOCATION'] === PermissionsAndroid.RESULTS.GRANTED
        );
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true;
  };

  // Image handling
  const openImagePickerModal = (type) => {
    setCurrentImageType(type);
    setImagePickerModalVisible(true);
  };

  const handleImageSelection = async (type, source) => {
    setImagePickerModalVisible(false);
    
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
      Alert.alert(
        'Permission Required',
        'We need camera and storage permissions to upload images',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open Settings', onPress: () => Linking.openSettings() }
        ]
      );
      return;
    }

    const options = {
      mediaType: 'photo',
      quality: 0.8,
      maxWidth: 1024,
      maxHeight: 1024,
      includeBase64: false,
      saveToPhotos: false,
    };

    try {
      let response;
      if (source === 'camera') {
        response = await launchCamera(options);
      } else {
        response = await launchImageLibrary(options);
      }

      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorCode) {
        Alert.alert('Error', `Failed to select image: ${response.errorMessage}`);
      } else if (response.assets && response.assets[0].fileSize > 5 * 1024 * 1024) {
        Alert.alert('Error', 'Image size should be less than 5MB');
      } else if (response.assets && response.assets[0]) {
        const asset = response.assets[0];
        const imageData = {
          uri: asset.uri,
          name: asset.fileName || `image_${Date.now()}.jpg`,
          type: asset.type || 'image/jpeg',
        };

        setSchoolData(prev => {
          if (type === 'school') {
            return {
              ...prev,
              basicInfo: {
                ...prev.basicInfo,
                schoolPicture: imageData
              }
            };
          } else {
            return {
              ...prev,
              profileInfo: {
                ...prev.profileInfo,
                profilePicture: imageData
              }
            };
          }
        });
      }
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert('Error', 'Failed to select image. Please try again.');
    }
  };

  const uploadImage = async (image, path) => {
    if (!image) return null;
    
    const reference = storage().ref(`${path}/${Date.now()}_${image.name}`);
    const task = reference.putFile(image.uri);
    
    task.on('state_changed', (taskSnapshot) => {
      const progress = (taskSnapshot.bytesTransferred / taskSnapshot.totalBytes) * 100;
      setUploadProgress(progress);
    });
    
    try {
      await task;
      const url = await reference.getDownloadURL();
      return url;
    } catch (e) {
      console.log('Upload error:', e);
      throw new Error('Failed to upload image. Please try again.');
    }
  };

  // Form validation
  const validateForm = () => {
    const newErrors = {};
    
    // Basic Info validation
    if (!schoolData.basicInfo.name.trim()) newErrors.name = 'School name is required';
    if (!schoolData.basicInfo.address.trim()) newErrors.address = 'Address is required';
    if (!schoolData.basicInfo.location.trim()) newErrors.location = 'Location is required';
    
    // Contact Info validation
    if (!schoolData.contactInfo.principal.trim()) newErrors.principal = 'Principal name is required';
    
    const contactRegex = /^[0-9]{10,15}$/;
    if (!contactRegex.test(schoolData.contactInfo.contact)) {
      newErrors.contact = 'Valid 10-15 digit contact number is required';
    }
    
    if (schoolData.contactInfo.email && !/^\S+@\S+\.\S+$/.test(schoolData.contactInfo.email)) {
      newErrors.email = 'Invalid email format';
    }
    
    if (schoolData.contactInfo.website && !/^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/.test(schoolData.contactInfo.website)) {
      newErrors.website = 'Invalid website URL';
    }
    
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length > 0) {
      scrollViewRef.current.scrollTo({ y: 0, animated: true });
      return false;
    }
    
    return true;
  };

  // Input handling
  const handleInputChange = (section, field, value) => {
    setSchoolData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
    
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  const handleFocus = (field) => {
    setActiveField(field);
    animateIn();
  };

  const handleBlur = () => {
    setActiveField(null);
    animateOut();
  };

  // Location handling
  const openMapModal = () => {
    setMapModalVisible(true);
  };

  const handleMapPress = async (e) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    
    try {
      const response = await Geocoder.from(latitude, longitude);
      const address = response.results[0].formatted_address;
      
      setSchoolData(prev => ({
        ...prev,
        basicInfo: {
          ...prev.basicInfo,
          location: address,
          latitude,
          longitude
        }
      }));
      
      setMapModalVisible(false);
    } catch (error) {
      console.error('Geocoding error:', error);
      Alert.alert('Error', 'Could not get address for this location');
    }
  };

  const searchLocation = async () => {
    if (!schoolData.basicInfo.location.trim()) return;
    
    try {
      const response = await Geocoder.from(schoolData.basicInfo.location);
      if (response.results.length > 0) {
        const { lat, lng } = response.results[0].geometry.location;
        
        setRegion({
          latitude: lat,
          longitude: lng,
          latitudeDelta: LATITUDE_DELTA,
          longitudeDelta: LONGITUDE_DELTA,
        });
        
        mapRef.current?.animateToRegion({
          latitude: lat,
          longitude: lng,
          latitudeDelta: LATITUDE_DELTA,
          longitudeDelta: LONGITUDE_DELTA,
        }, 1000);
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      Alert.alert('Error', 'Could not find this location');
    }
  };

  // Form submission
  const addSchool = async () => {
    if (!validateForm()) return;
    
    setIsLoading(true);
    setUploading(true);
    
    try {
      // Upload images
      const [schoolPictureUrl, profilePictureUrl] = await Promise.all([
        uploadImage(schoolData.basicInfo.schoolPicture, 'school-pictures'),
        uploadImage(schoolData.profileInfo.profilePicture, 'profile-pictures')
      ]);

      // Prepare school data for Firestore
      const schoolToAdd = {
        basicInfo: {
          name: schoolData.basicInfo.name,
          address: schoolData.basicInfo.address,
          location: schoolData.basicInfo.location,
          coordinates: schoolData.basicInfo.latitude && schoolData.basicInfo.longitude ? 
            new firestore.GeoPoint(schoolData.basicInfo.latitude, schoolData.basicInfo.longitude) : null,
          totalStudents: schoolData.basicInfo.totalStudents || null,
          schoolPicture: schoolPictureUrl,
        },
        contactInfo: {
          principal: schoolData.contactInfo.principal,
          contact: schoolData.contactInfo.contact,
          email: schoolData.contactInfo.email || null,
          website: schoolData.contactInfo.website || null,
        },
        profileInfo: {
          ...schoolData.profileInfo,
          profilePicture: profilePictureUrl,
          facilities: schoolData.profileInfo.facilities.join(', '),
        },
        id: `sch-${Date.now()}`,
        adminId:sate.counter.user.id,
        createdAt: firestore.FieldValue.serverTimestamp(),
        updatedAt: firestore.FieldValue.serverTimestamp()
      };
      
      // Add to Firestore
      await firestore()
        .collection('Schools')
        .doc(schoolToAdd.id)
        .set(schoolToAdd);
      
      Alert.alert(
        'Success',
        'School added successfully!',
        [{ text: 'OK', onPress: () => resetForm() }]
      );
    } catch (error) {
      console.error('Error:', error);
      Alert.alert(
        'Error',
        error.message || 'Failed to add school. Please try again.'
      );
    } finally {
      setIsLoading(false);
      setUploading(false);
      setUploadProgress(0);
    }
  };

  // Form reset
  const resetForm = () => {
     getAllSchool()
    setSchoolData({
      basicInfo: {
        name: '',
        address: '',
        location: '',
        latitude: null,
        longitude: null,
        totalStudents: '',
        schoolPicture: null,
      },
      contactInfo: {
        principal: '',
        contact: '',
        email: '',
        website: '',
      },
      profileInfo: {
        profilePicture: null,
        motto: '',
        establishedYear: '',
        schoolType: 'public',
        facilities: [],
      }
    });
    setErrors({});
    setCurrentTab('basic');
  };

  // Image removal
  const removeImage = (type) => {
    if (type === 'school') {
      setSchoolData(prev => ({
        ...prev,
        basicInfo: {
          ...prev.basicInfo,
          schoolPicture: null
        }
      }));
    } else {
      setSchoolData(prev => ({
        ...prev,
        profileInfo: {
          ...prev.profileInfo,
          profilePicture: null
        }
      }));
    }
  };

  // Facility management
  const toggleFacility = (facility) => {
    setSchoolData(prev => {
      const facilities = [...prev.profileInfo.facilities];
      const index = facilities.indexOf(facility);
      
      if (index > -1) {
        facilities.splice(index, 1);
      } else {
        facilities.push(facility);
      }
      
      return {
        ...prev,
        profileInfo: {
          ...prev.profileInfo,
          facilities
        }
      };
    });
  };

  // View school profile
  const viewSchoolProfile = (school) => {
    // setSelectedSchool(school);
    setShowProfile(true);
  };

  // Close profile view
  const closeProfileView = () => {
    setShowProfile(false);
    // setSelectedSchool(null);
  };

  // Render functions for different tabs
  const renderBasicInfoTab = () => (
    <>
      {/* School Image */}
      <View style={styles.imageSection}>
        <Text style={styles.label}>School Picture</Text>
        <View style={styles.imagePickerContainer}>
          <TouchableOpacity 
            style={styles.imagePicker} 
            onPress={() => openImagePickerModal('school')}
            activeOpacity={0.7}
          >
            {schoolData.basicInfo.schoolPicture ? (
              <>
                <Image 
                  source={{ uri: schoolData.basicInfo.schoolPicture.uri }} 
                  style={styles.imagePreview}
                />
                <TouchableOpacity 
                  style={styles.removeImageButton}
                  onPress={() => removeImage('school')}
                >
                  <Icon name="close" size={20} color="#fff" />
                </TouchableOpacity>
              </>
            ) : (
              <View style={styles.imagePlaceholder}>
                <Icon name="school" size={40} color="#95a5a6" />
                <Text style={styles.imagePlaceholderText}>Add School Image</Text>
              </View>
            )}
          </TouchableOpacity>
          <Text style={styles.imageHintText}>Max size: 5MB (Recommended: 1024x1024)</Text>
        </View>
      </View>
      
      {/* School Name */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>School Name *</Text>
        <TextInput
          style={[
            styles.input, 
            errors.name && styles.errorInput,
            activeField === 'name' && styles.activeInput
          ]}
          placeholder="Enter school name"
          value={schoolData.basicInfo.name}
          onChangeText={(text) => handleInputChange('basicInfo', 'name', text)}
          onFocus={() => handleFocus('name')}
          onBlur={handleBlur}
          returnKeyType="next"
        />
        {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
      </View>
      
      {/* Address */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Address *</Text>
        <TextInput
          style={[
            styles.input, 
            styles.multilineInput,
            errors.address && styles.errorInput,
            activeField === 'address' && styles.activeInput
          ]}
          placeholder="Enter full address"
          value={schoolData.basicInfo.address}
          onChangeText={(text) => handleInputChange('basicInfo', 'address', text)}
          onFocus={() => handleFocus('address')}
          onBlur={handleBlur}
          multiline
          numberOfLines={3}
        />
        {errors.address && <Text style={styles.errorText}>{errors.address}</Text>}
      </View>
      
      {/* Location */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Location (City/Region) *</Text>
        <View style={styles.locationContainer}>
          <TextInput
            style={[
              styles.input, 
              styles.locationInput,
              errors.location && styles.errorInput,
              activeField === 'location' && styles.activeInput
            ]}
            placeholder="Enter city/region or select on map"
            value={schoolData.basicInfo.location}
            onChangeText={(text) => handleInputChange('basicInfo', 'location', text)}
            onFocus={() => handleFocus('location')}
            onBlur={handleBlur}
          />
          <TouchableOpacity 
            style={styles.mapButton}
            onPress={openMapModal}
          >
            <Icon name="map" size={24} color="#3498db" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.searchButton}
            onPress={searchLocation}
          >
            <Icon name="search" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
        {errors.location && <Text style={styles.errorText}>{errors.location}</Text>}
      </View>
      
      {/* Total Students */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Total Students</Text>
        <TextInput
          style={[
            styles.input,
            activeField === 'totalStudents' && styles.activeInput
          ]}
          placeholder="Enter total students"
          value={schoolData.basicInfo.totalStudents}
          onChangeText={(text) => handleInputChange('basicInfo', 'totalStudents', text)}
          onFocus={() => handleFocus('totalStudents')}
          onBlur={handleBlur}
          keyboardType="numeric"
        />
      </View>
    </>
  );

  const renderContactInfoTab = () => (
    <>
      {/* Principal Name */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Principal Name *</Text>
        <TextInput
          style={[
            styles.input, 
            errors.principal && styles.errorInput,
            activeField === 'principal' && styles.activeInput
          ]}
          placeholder="Enter principal's name"
          value={schoolData.contactInfo.principal}
          onChangeText={(text) => handleInputChange('contactInfo', 'principal', text)}
          onFocus={() => handleFocus('principal')}
          onBlur={handleBlur}
        />
        {errors.principal && <Text style={styles.errorText}>{errors.principal}</Text>}
      </View>
      
      {/* Contact Number */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Contact Number *</Text>
        <TextInput
          style={[
            styles.input, 
            errors.contact && styles.errorInput,
            activeField === 'contact' && styles.activeInput
          ]}
          placeholder="Enter contact number"
          value={schoolData.contactInfo.contact}
          onChangeText={(text) => handleInputChange('contactInfo', 'contact', text)}
          onFocus={() => handleFocus('contact')}
          onBlur={handleBlur}
          keyboardType="phone-pad"
          maxLength={15}
        />
        {errors.contact && <Text style={styles.errorText}>{errors.contact}</Text>}
      </View>
      
      {/* Email */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={[
            styles.input, 
            errors.email && styles.errorInput,
            activeField === 'email' && styles.activeInput
          ]}
          placeholder="Enter school email"
          value={schoolData.contactInfo.email}
          onChangeText={(text) => handleInputChange('contactInfo', 'email', text)}
          onFocus={() => handleFocus('email')}
          onBlur={handleBlur}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
      </View>
      
      {/* Website */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Website</Text>
        <TextInput
          style={[
            styles.input, 
            errors.website && styles.errorInput,
            activeField === 'website' && styles.activeInput
          ]}
          placeholder="Enter website URL (https://...)"
          value={schoolData.contactInfo.website}
          onChangeText={(text) => handleInputChange('contactInfo', 'website', text)}
          onFocus={() => handleFocus('website')}
          onBlur={handleBlur}
          autoCapitalize="none"
        />
        {errors.website && <Text style={styles.errorText}>{errors.website}</Text>}
      </View>
    </>
  );

  const renderProfileInfoTab = () => (
    <>
      {/* Profile Image */}
      <View style={styles.imageSection}>
        <Text style={styles.label}>Profile Picture</Text>
        <View style={styles.imagePickerContainer}>
          <TouchableOpacity 
            style={styles.imagePicker} 
            onPress={() => openImagePickerModal('profile')}
            activeOpacity={0.7}
          >
            {schoolData.profileInfo.profilePicture ? (
              <>
                <Image 
                  source={{ uri: schoolData.profileInfo.profilePicture.uri }} 
                  style={styles.imagePreview}
                />
                <TouchableOpacity 
                  style={styles.removeImageButton}
                  onPress={() => removeImage('profile')}
                >
                  <Icon name="close" size={20} color="#fff" />
                </TouchableOpacity>
              </>
            ) : (
              <View style={styles.imagePlaceholder}>
                <Icon name="person" size={40} color="#95a5a6" />
                <Text style={styles.imagePlaceholderText}>Add Profile Image</Text>
              </View>
            )}
          </TouchableOpacity>
          <Text style={styles.imageHintText}>Max size: 5MB (Recommended: 1024x1024)</Text>
        </View>
      </View>
      
      {/* School Motto */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>School Motto</Text>
        <TextInput
          style={[
            styles.input,
            styles.multilineInput,
            activeField === 'motto' && styles.activeInput
          ]}
          placeholder="Enter school motto"
          value={schoolData.profileInfo.motto}
          onChangeText={(text) => handleInputChange('profileInfo', 'motto', text)}
          onFocus={() => handleFocus('motto')}
          onBlur={handleBlur}
          multiline
          numberOfLines={2}
        />
      </View>
      
      {/* Established Year */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Established Year</Text>
        <TextInput
          style={[
            styles.input,
            activeField === 'establishedYear' && styles.activeInput
          ]}
          placeholder="Enter established year"
          value={schoolData.profileInfo.establishedYear}
          onChangeText={(text) => handleInputChange('profileInfo', 'establishedYear', text)}
          onFocus={() => handleFocus('establishedYear')}
          onBlur={handleBlur}
          keyboardType="numeric"
          maxLength={4}
        />
      </View>
      
      {/* School Type */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>School Type</Text>
        <View style={styles.radioContainer}>
          <TouchableOpacity
            style={styles.radioButton}
            onPress={() => handleInputChange('profileInfo', 'schoolType', 'public')}
          >
            <View style={styles.radioCircle}>
              {schoolData.profileInfo.schoolType === 'public' && <View style={styles.selectedRb} />}
            </View>
            <Text style={styles.radioText}>Public</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.radioButton}
            onPress={() => handleInputChange('profileInfo', 'schoolType', 'private')}
          >
            <View style={styles.radioCircle}>
              {schoolData.profileInfo.schoolType === 'private' && <View style={styles.selectedRb} />}
            </View>
            <Text style={styles.radioText}>Private</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Facilities */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Facilities</Text>
        <View style={styles.facilitiesContainer}>
          {['Library', 'Computer Lab', 'Playground', 'Cafeteria', 'Auditorium', 'Sports', 'Transport'].map((facility) => (
            <TouchableOpacity
              key={facility}
              style={[
                styles.facilityButton,
                schoolData.profileInfo.facilities.includes(facility) && styles.selectedFacility
              ]}
              onPress={() => toggleFacility(facility)}
            >
              <Text style={[
                styles.facilityText,
                schoolData.profileInfo.facilities.includes(facility) && styles.selectedFacilityText
              ]}>
                {facility}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </>
  );

  // Render saved schools list
  const renderSavedSchools = () => (
    <View style={styles.savedSchoolsContainer}>
      <Text style={styles.sectionTitle}>Saved Schools</Text>
      {savedSchools.length === 0 ? (
        <Text style={styles.noSchoolsText}>No schools added yet</Text>
      ) : (
        <ScrollView style={styles.schoolsList}>
          {savedSchools.map((school) => (
            <TouchableOpacity
              key={school.id}
              style={styles.schoolCard}
              onPress={() => viewSchoolProfile(school)}
            >
              <View style={styles.schoolCardHeader}>
                {school.basicInfo.schoolPicture ? (
                  <Image 
                    source={{ uri: school.basicInfo.schoolPicture }} 
                    style={styles.schoolCardImage}
                  />
                ) : (
                  <View style={styles.schoolCardImagePlaceholder}>
                    <Icon name="school" size={30} color="#95a5a6" />
                  </View>
                )}
                <View style={styles.schoolCardTitle}>
                  <Text style={styles.schoolName} numberOfLines={1}>{school.basicInfo.name}</Text>
                  <Text style={styles.schoolLocation} numberOfLines={1}>
                    <Icon name="location-on" size={14} color="#7f8c8d" /> {school.basicInfo.location}
                  </Text>
                </View>
              </View>
              <View style={styles.schoolCardFooter}>
                <Text style={styles.schoolPrincipal}>
                  <Icon name="person" size={14} color="#7f8c8d" /> {school.contactInfo.principal}
                </Text>
                <Text style={styles.schoolType}>
                  {school.profileInfo.schoolType === 'public' ? 'Public School' : 'Private School'}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );

  // Render school profile view
  const renderSchoolProfile = () => {
  

    return (
      <ScrollView style={styles.profileContainer}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={closeProfileView}
        >
          <Icon name="arrow-back" size={24} color="#3498db" />
          <Text style={styles.backButtonText}>Back to List</Text>
        </TouchableOpacity>
{
  savedSchools.map(selectedSchool=>{
 
    return(
   <View contentContainerStyle={styles.profileScrollContainer}>
          {/* School Header */}
          <View style={styles.profileHeader}>
            {selectedSchool?.basicInfo?.schoolPicture ? (
              <Image 
                source={{ uri: selectedSchool.basicInfo.schoolPicture }} 
                style={styles.profileSchoolImage}
              />
            ) : (
              <View style={styles.profileImagePlaceholder}>
                <Icon name="school" size={50} color="#95a5a6" />
              </View>
            )}
            <Text style={styles.profileName}>{selectedSchool.basicInfo.name}</Text>
            <Text style={styles.profileLocation}>
              <Icon name="location-on" size={16} color="#7f8c8d" /> {selectedSchool.basicInfo.location}
            </Text>
            <Text style={styles.profileType}>
              {selectedSchool.profileInfo.schoolType === 'public' ? 'Public School' : 'Private School'}
            </Text>
          </View>

          {/* Profile Image */}
          {selectedSchool.profileInfo.profilePicture && (
            <View style={styles.profileImageContainer}>
              <Image 
                source={{ uri: selectedSchool.profileInfo.profilePicture }} 
                style={styles.profileImage}
              />
            </View>
          )}

          {/* Basic Info */}
          <View style={styles.profileSection}>
            <Text style={styles.profileSectionTitle}>Basic Information</Text>
            <View style={styles.profileInfoRow}>
              <Icon name="home" size={20} color="#3498db" style={styles.profileInfoIcon} />
              <Text style={styles.profileInfoText}>{selectedSchool.basicInfo.address}</Text>
            </View>
            <View style={styles.profileInfoRow}>
              <Icon name="people" size={20} color="#3498db" style={styles.profileInfoIcon} />
              <Text style={styles.profileInfoText}>
                {selectedSchool.basicInfo.totalStudents || 'N/A'} students
              </Text>
            </View>
            {selectedSchool.profileInfo.establishedYear && (
              <View style={styles.profileInfoRow}>
                <Icon name="event" size={20} color="#3498db" style={styles.profileInfoIcon} />
                <Text style={styles.profileInfoText}>
                  Established in {selectedSchool.profileInfo.establishedYear}
                </Text>
              </View>
            )}
            {selectedSchool.profileInfo.motto && (
              <View style={styles.profileInfoRow}>
                <Icon name="format-quote" size={20} color="#3498db" style={styles.profileInfoIcon} />
                <Text style={[styles.profileInfoText, styles.profileMotto]}>
                  "{selectedSchool.profileInfo.motto}"
                </Text>
              </View>
            )}
          </View>

          {/* Contact Info */}
          <View style={styles.profileSection}>
            <Text style={styles.profileSectionTitle}>Contact Information</Text>
            <View style={styles.profileInfoRow}>
              <Icon name="person" size={20} color="#3498db" style={styles.profileInfoIcon} />
              <Text style={styles.profileInfoText}>{selectedSchool.contactInfo.principal}</Text>
            </View>
            <View style={styles.profileInfoRow}>
              <Icon name="phone" size={20} color="#3498db" style={styles.profileInfoIcon} />
              <Text style={styles.profileInfoText}>{selectedSchool.contactInfo.contact}</Text>
            </View>
            {selectedSchool.contactInfo.email && (
              <View style={styles.profileInfoRow}>
                <Icon name="email" size={20} color="#3498db" style={styles.profileInfoIcon} />
                <Text style={styles.profileInfoText}>{selectedSchool.contactInfo.email}</Text>
              </View>
            )}
            {selectedSchool.contactInfo.website && (
              <View style={styles.profileInfoRow}>
                <Icon name="public" size={20} color="#3498db" style={styles.profileInfoIcon} />
                <Text 
                  style={[styles.profileInfoText, styles.profileLink]}
                  onPress={() => Linking.openURL(
                    selectedSchool.contactInfo.website.startsWith('http') ? 
                    selectedSchool.contactInfo.website : 
                    `https://${selectedSchool.contactInfo.website}`
                  )}
                >
                  {selectedSchool.contactInfo.website}
                </Text>
              </View>
            )}
          </View>

          {/* Facilities */}
          {selectedSchool.profileInfo.facilities && (
            <View style={styles.profileSection}>
              <Text style={styles.profileSectionTitle}>Facilities</Text>
              <View style={styles.profileFacilities}>
                {selectedSchool.profileInfo.facilities.split(', ').map((facility, index) => (
                  <View key={index} style={styles.profileFacility}>
                    <Icon name="check-circle" size={16} color="#2ecc71" />
                    <Text style={styles.profileFacilityText}>{facility}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Map View */}
          {selectedSchool.basicInfo.coordinates && (
            <View style={styles.profileSection}>
              <Text style={styles.profileSectionTitle}>Location</Text>
              <View style={styles.profileMapContainer}>
                <MapView
                  style={styles.profileMap}
                  initialRegion={{
                    latitude: selectedSchool.basicInfo.coordinates.latitude,
                    longitude: selectedSchool.basicInfo.coordinates.longitude,
                    latitudeDelta: LATITUDE_DELTA,
                    longitudeDelta: LONGITUDE_DELTA,
                  }}
                  scrollEnabled={false}
                  zoomEnabled={false}
                >
                  <Marker
                    coordinate={{
                      latitude: selectedSchool.basicInfo.coordinates.latitude,
                      longitude: selectedSchool.basicInfo.coordinates.longitude,
                    }}
                  />
                </MapView>
              </View>
            </View>
          )}
        </View>
    )
  })
}
       
      </ScrollView>
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.keyboardAvoidingContainer}
    >
     
      {showProfile ? (
        renderSchoolProfile()
      ) : (
        <>
          <View style={styles.toggleViewContainer}>
            <TouchableOpacity
              style={[styles.toggleViewButton, !showProfile && styles.activeToggleButton]}
              onPress={() => setShowProfile(false)}
            >
              <Text style={styles.toggleViewButtonText}>Add New School</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleViewButton, showProfile && styles.activeToggleButton]}
              onPress={() => setShowProfile(true)}
            >
              <Text style={styles.toggleViewButtonText}>View Saved Schools</Text>
            </TouchableOpacity>
          </View>

          {showProfile ? (
            renderSavedSchools()
          ) : (
            <ScrollView 
              ref={scrollViewRef}
              contentContainerStyle={styles.scrollContainer}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.container}>
                <Text style={styles.title}>Add New School</Text>
                
                {/* Navigation Tabs */}
                <View style={styles.tabContainer}>
                  <TouchableOpacity
                    style={[styles.tabButton, currentTab === 'basic' && styles.activeTab]}
                    onPress={() => setCurrentTab('basic')}
                  >
                    <Text style={[styles.tabText, currentTab === 'basic' && styles.activeTabText]}>Basic Info</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.tabButton, currentTab === 'contact' && styles.activeTab]}
                    onPress={() => setCurrentTab('contact')}
                  >
                    <Text style={[styles.tabText, currentTab === 'contact' && styles.activeTabText]}>Contact Info</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.tabButton, currentTab === 'profile' && styles.activeTab]}
                    onPress={() => setCurrentTab('profile')}
                  >
                    <Text style={[styles.tabText, currentTab === 'profile' && styles.activeTabText]}>Profile</Text>
                  </TouchableOpacity>
                </View>
                
                {/* Current Tab Content */}
                {currentTab === 'basic' && renderBasicInfoTab()}
                {currentTab === 'contact' && renderContactInfoTab()}
                {currentTab === 'profile' && renderProfileInfoTab()}
                
                {/* Upload Progress */}
                {uploading && (
                  <Animated.View 
                    style={[styles.progressContainer, { opacity: fadeAnim }]}
                  >
                    <Text style={styles.progressText}>
                      Uploading: {Math.round(uploadProgress)}%
                    </Text>
                    <View style={styles.progressBar}>
                      <View 
                        style={[styles.progressFill, { width: `${uploadProgress}%` }]} 
                      />
                    </View>
                  </Animated.View>
                )}
                
                {/* Buttons */}
                <View style={styles.buttonContainer}>
                  <TouchableOpacity 
                    style={[styles.button, styles.submitButton]} 
                    onPress={addSchool}
                    disabled={isLoading || uploading}
                    activeOpacity={0.8}
                  >
                    {isLoading ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <>
                        <Icon name="add" size={20} color="#fff" />
                        <Text style={styles.buttonText}>Add School</Text>
                      </>
                    )}
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.button, styles.resetButton]} 
                    onPress={resetForm}
                    disabled={isLoading || uploading}
                    activeOpacity={0.8}
                  >
                    <Icon name="refresh" size={20} color="#fff" />
                    <Text style={styles.buttonText}>Reset</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          )}
        </>
      )}

      {/* Map Modal */}
      <Modal
        animationType="slide"
        transparent={false}
        visible={mapModalVisible}
        onRequestClose={() => setMapModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select School Location</Text>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setMapModalVisible(false)}
            >
              <Icon name="close" size={24} color="#2c3e50" />
            </TouchableOpacity>
          </View>
          
          <MapView
            ref={mapRef}
            style={styles.map}
            initialRegion={region}
            onPress={handleMapPress}
            showsUserLocation={true}
            showsMyLocationButton={true}
          >
            {schoolData.basicInfo.latitude && schoolData.basicInfo.longitude && (
              <Marker
                coordinate={{
                  latitude: schoolData.basicInfo.latitude,
                  longitude: schoolData.basicInfo.longitude
                }}
              />
            )}
          </MapView>
          
          <View style={styles.mapFooter}>
            <Text style={styles.mapInstructions}>
              Tap on the map to select school location
            </Text>
            <Pressable
              style={styles.confirmButton}
              onPress={() => setMapModalVisible(false)}
            >
              <Text style={styles.confirmButtonText}>Confirm Location</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Image Picker Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={imagePickerModalVisible}
        onRequestClose={() => setImagePickerModalVisible(false)}
      >
        <View style={styles.imagePickerModalContainer}>
          <View style={styles.imagePickerModal}>
            <Text style={styles.imagePickerTitle}>Select Image Source</Text>
            
            <View style={styles.imagePickerOptions}>
              <TouchableOpacity 
                style={styles.imagePickerOption}
                onPress={() => handleImageSelection(currentImageType, 'camera')}
              >
                <View style={styles.imagePickerOptionIcon}>
                  <Icon2 name="camera" size={30} color="#3498db" />
                </View>
                <Text style={styles.imagePickerOptionText}>Take Photo</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.imagePickerOption}
                onPress={() => handleImageSelection(currentImageType, 'gallery')}
              >
                <View style={styles.imagePickerOptionIcon}>
                  <Icon2 name="image" size={30} color="#3498db" />
                </View>
                <Text style={styles.imagePickerOptionText}>Choose from Gallery</Text>
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity 
              style={styles.imagePickerCancelButton}
              onPress={() => setImagePickerModalVisible(false)}
            >
              <Text style={styles.imagePickerCancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  keyboardAvoidingContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 30,
  },
  container: {
    flex: 1,
    padding: 25,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 25,
    textAlign: 'center',
    color: '#2c3e50',
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    backgroundColor: '#ecf0f1',
    borderRadius: 10,
    overflow: 'hidden',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#3498db',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7f8c8d',
  },
  activeTabText: {
    color: '#fff',
  },
  imageSection: {
    marginBottom: 20,
  },
  imagePickerContainer: {
    alignItems: 'center',
  },
  imagePicker: {
    height: 160,
    width: '100%',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  imagePlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
  },
  imagePlaceholderText: {
    marginTop: 10,
    color: '#95a5a6',
    textAlign: 'center',
    fontSize: 14,
  },
  imageHintText: {
    marginTop: 5,
    color: '#7f8c8d',
    fontSize: 12,
    fontStyle: 'italic',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  removeImageButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    marginBottom: 8,
    fontWeight: '600',
    color: '#34495e',
    fontSize: 15,
  },
  input: {
    height: 50,
    borderColor: '#dfe6e9',
    borderWidth: 1,
    paddingHorizontal: 15,
    borderRadius: 10,
    backgroundColor: '#fff',
    fontSize: 16,
    color: '#2d3436',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationInput: {
    flex: 1,
    paddingRight: 50,
  },
  mapButton: {
    position: 'absolute',
    right: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    padding: 8,
  },
  searchButton: {
    position: 'absolute',
    right: 50,
    backgroundColor: '#3498db',
    borderRadius: 20,
    padding: 8,
  },
  activeInput: {
    borderColor: '#3498db',
    borderWidth: 1.5,
    shadowColor: '#3498db',
    shadowOpacity: 0.2,
  },
  multilineInput: {
    height: 100,
    paddingTop: 15,
    textAlignVertical: 'top',
  },
  errorInput: {
    borderColor: '#e74c3c',
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 13,
    marginTop: 5,
  },
  radioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  radioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  radioCircle: {
    height: 20,
    width: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#3498db',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  selectedRb: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#3498db',
  },
  radioText: {
    fontSize: 16,
    color: '#2d3436',
  },
  facilitiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  facilityButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#bdc3c7',
    marginRight: 8,
    marginBottom: 8,
  },
  selectedFacility: {
    backgroundColor: '#3498db',
    borderColor: '#3498db',
  },
  facilityText: {
    fontSize: 14,
    color: '#2d3436',
  },
  selectedFacilityText: {
    color: '#fff',
  },
  progressContainer: {
    marginTop: 15,
    marginBottom: 25,
  },
  progressText: {
    textAlign: 'center',
    marginBottom: 8,
    color: '#3498db',
    fontSize: 14,
    fontWeight: '500',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#ecf0f1',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3498db',
  },
  buttonContainer: {
    marginTop: 25,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    width: '48%',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  submitButton: {
    backgroundColor: '#3498db',
  },
  resetButton: {
    backgroundColor: '#e67e22',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 8,
    fontSize: 16,
  },
  // Map Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  closeButton: {
    padding: 5,
  },
  map: {
    flex: 1,
  },
  mapFooter: {
    padding: 15,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  mapInstructions: {
    textAlign: 'center',
    marginBottom: 10,
    color: '#7f8c8d',
  },
  confirmButton: {
    backgroundColor: '#3498db',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  // Image Picker Modal Styles
  imagePickerModalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  imagePickerModal: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  imagePickerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#2c3e50',
  },
  imagePickerOptions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 20,
  },
  imagePickerOption: {
    alignItems: 'center',
    padding: 15,
  },
  imagePickerOptionIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f0f8ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  imagePickerOptionText: {
    fontSize: 14,
    color: '#2c3e50',
    textAlign: 'center',
  },
  imagePickerCancelButton: {
    width: '100%',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    alignItems: 'center',
  },
  imagePickerCancelButtonText: {
    color: '#e74c3c',
    fontSize: 16,
    fontWeight: '500',
  },
  // Saved Schools Styles
  toggleViewContainer: {
    flexDirection: 'row',
    backgroundColor: '#ecf0f1',
    paddingVertical: 10,
  },
  toggleViewButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  activeToggleButton: {
    backgroundColor: '#3498db',
  },
  toggleViewButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7f8c8d',
  },
  savedSchoolsContainer: {
    flex: 1,
    padding: 15,
    backgroundColor: '#f8f9fa',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#2c3e50',
  },
  noSchoolsText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#7f8c8d',
    fontSize: 16,
  },
  schoolsList: {
    flex: 1,
  },
  schoolCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  schoolCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  schoolCardImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
  },
  schoolCardImagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#ecf0f1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  schoolCardTitle: {
    flex: 1,
  },
  schoolName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 5,
  },
  schoolLocation: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  schoolCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  schoolPrincipal: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  schoolType: {
    fontSize: 14,
    color: '#3498db',
    fontWeight: '500',
  },
  // Profile View Styles
  profileContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  backButtonText: {
    marginLeft: 10,
    color: '#3498db',
    fontSize: 16,
  },
  profileScrollContainer: {
    paddingBottom: 30,
  },
  profileHeader: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    marginBottom: 15,
  },
  profileSchoolImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 15,
  },
  profileImagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#ecf0f1',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  profileName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 5,
    textAlign: 'center',
  },
  profileLocation: {
    fontSize: 16,
    color: '#7f8c8d',
    marginBottom: 5,
  },
  profileType: {
    fontSize: 16,
    color: '#3498db',
    fontWeight: '500',
  },
  profileImageContainer: {
    alignItems: 'center',
    marginBottom: 15,
  },
  profileImage: {
    width: 200,
    height: 200,
    borderRadius: 100,
  },
  profileSection: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    marginHorizontal: 15,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  profileSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 10,
  },
  profileInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  profileInfoIcon: {
    marginRight: 10,
    width: 24,
  },
  profileInfoText: {
    flex: 1,
    fontSize: 16,
    color: '#2d3436',
  },
  profileMotto: {
    fontStyle: 'italic',
  },
  profileLink: {
    color: '#3498db',
    textDecorationLine: 'underline',
  },
  profileFacilities: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  profileFacility: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
    marginBottom: 10,
  },
  profileFacilityText: {
    marginLeft: 5,
    fontSize: 14,
    color: '#2d3436',
  },
  profileMapContainer: {
    height: 200,
    borderRadius: 10,
    overflow: 'hidden',
  },
  profileMap: {
    ...StyleSheet.absoluteFillObject,
  },
});

export default AdminDash;
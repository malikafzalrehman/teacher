import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image,
  PermissionsAndroid,
  Modal,
  FlatList,
  Share,
  RefreshControl,
  Dimensions
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Icon2 from 'react-native-vector-icons/MaterialCommunityIcons';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import { Dropdown } from 'react-native-element-dropdown';
import ImagePicker from 'react-native-image-crop-picker';
import moment from 'moment';

const { width } = Dimensions.get('window');

const HeadPanel = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    school: '',
    password: '',
    role: 'head',
    profileImage: null
  });

  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [isFocus, setIsFocus] = useState(false);
  const [imageUri, setImageUri] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [galleryVisible, setGalleryVisible] = useState(false);
  const [galleryImages, setGalleryImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [viewProfileModal, setViewProfileModal] = useState(false);
  const [headsList, setHeadsList] = useState([]);
  const [selectedHead, setSelectedHead] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [posts, setPosts] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    getAllSchools();
    fetchHeads();
  }, []);

  useEffect(() => {
    if (selectedHead) {
      fetchUserPosts(selectedHead.id);
    }
  }, [selectedHead, activeTab]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchHeads();
    if (selectedHead) {
      await fetchUserPosts(selectedHead.id);
    }
    setRefreshing(false);
  };

  const getAllSchools = async () => {
    try {
      const schoolRef = firestore().collection('School');
      const querySnapshot = await schoolRef.get();
      
      const schoolList = querySnapshot.docs.map(doc => ({
        label: doc.data().name,
        value: doc.data().name,
        id: doc.id
      }));
      
      setData(schoolList);
    } catch (error) {
      console.error("Error fetching schools: ", error);
      Alert.alert("Error", "Failed to load schools");
    }
  };

  const fetchHeads = async () => {
    try {
      const teacherRef = firestore().collection('Teacher');
      const querySnapshot = await teacherRef.where('role', '==', 'head').get();
      
      const heads = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setHeadsList(heads);
    } catch (error) {
      console.error("Error fetching heads: ", error);
      Alert.alert("Error", "Failed to load school heads");
    }
  };

  const fetchUserPosts = async (userId) => {
    if (activeTab !== 'posts') return;
    
    try {
      const postsRef = firestore().collection('Posts');
      const querySnapshot = await postsRef
        .where('userId', '==', userId)
        .orderBy('createdAt', 'desc')
        .get();
      
      const userPosts = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setPosts(userPosts);
    } catch (error) {
      console.error("Error fetching user posts: ", error);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.phone) newErrors.phone = 'Phone is required';
    if (!formData.school) newErrors.school = 'School is required';
    if (!formData.password) newErrors.password = 'Password is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      school: '',
      password: '',
      role: 'head',
      profileImage: null
    });
    setErrors({});
  };

  const uploadImage = async (uri) => {
    setUploading(true);
    try {
      const filename = uri.substring(uri.lastIndexOf('/') + 1);
      const reference = storage().ref(`profile_images/${filename}`);
      await reference.putFile(uri);
      const url = await reference.getDownloadURL();
      return url;
    } catch (error) {
      console.error("Error uploading image: ", error);
      throw error;
    } finally {
      setUploading(false);
    }
  };

  const handleAddHead = async () => {
    if (!validateForm()) return;
    setIsLoading(true);

    try {
      const teacherRef = firestore().collection('Teacher');
      
      // Check if email exists
      const emailQuery = await teacherRef.where('email', '==', formData.email).get();
      if (!emailQuery.empty) {
        Alert.alert("Error", "This email is already registered");
        setIsLoading(false);
        return;
      }

      // Upload image if exists
      let imageUrl = null;
      if (formData.profileImage) {
        imageUrl = await uploadImage(formData.profileImage);
      }

      // Get selected school ID
      const selectedSchool = data.find(item => item.value === formData.school);
      
      const headData = {
        ...formData,
        id: "head-" + Date.now(),
        schoolId: selectedSchool?.id || '',
        createdAt: firestore.FieldValue.serverTimestamp(),
        role: 'head',
        profileImage: imageUrl || null
      };

      await teacherRef.doc(headData.id).set(headData);

      Alert.alert("Success", "School head added successfully");
      resetForm();
      setImageUri(null);
      await fetchHeads();
    } catch (error) {
      console.error("Error adding school head: ", error);
      Alert.alert("Error", "Failed to add school head");
    } finally {
      setIsLoading(false);
    }
  };

  const handleImagePicker = async () => {
    try {
      const image = await ImagePicker.openPicker({
        width: 300,
        height: 300,
        cropping: true,
        cropperCircleOverlay: true,
        compressImageQuality: 0.7
      });

      setImageUri(image.path);
      setFormData({...formData, profileImage: image.path});
    } catch (error) {
      if (error.code !== 'E_PICKER_CANCELLED') {
        console.log('ImagePicker Error: ', error);
        Alert.alert('Error', 'Failed to pick image');
      }
    }
  };

  const shareProfile = async (head) => {
    try {
      const message = `Check out ${head.name}'s profile:\n\nName: ${head.name}\nEmail: ${head.email}\nSchool: ${head.school}\nPhone: ${head.phone}`;
      
      await Share.share({
        message,
        title: `${head.name}'s Profile`
      });
    } catch (error) {
      console.error('Error sharing profile:', error);
    }
  };

  const renderPostItem = ({ item }) => (
    <View style={styles.postItem}>
      <View style={styles.postHeader}>
        {selectedHead?.profileImage ? (
          <Image 
            source={{ uri: selectedHead.profileImage }} 
            style={styles.postAvatar} 
          />
        ) : (
          <View style={styles.postAvatarPlaceholder}>
            <Icon name="person" size={20} color="#aaa" />
          </View>
        )}
        <View>
          <Text style={styles.postAuthor}>{selectedHead?.name}</Text>
          <Text style={styles.postTime}>
            {moment(item.createdAt?.toDate()).fromNow()}
          </Text>
        </View>
      </View>
      <Text style={styles.postText}>{item.text}</Text>
      {item.imageUrl && (
        <Image 
          source={{ uri: item.imageUrl }} 
          style={styles.postImage} 
          resizeMode="cover"
        />
      )}
      <View style={styles.postFooter}>
        <TouchableOpacity style={styles.postAction}>
          <Icon name="thumb-up" size={18} color="#666" />
          <Text style={styles.postActionText}>Like</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.postAction}>
          <Icon name="comment" size={18} color="#666" />
          <Text style={styles.postActionText}>Comment</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.postAction}>
          <Icon name="share" size={18} color="#666" />
          <Text style={styles.postActionText}>Share</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderHeadItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.headItem}
      onPress={() => {
        setSelectedHead(item);
        setViewProfileModal(true);
        setActiveTab('profile');
      }}
    >
      {item.profileImage ? (
        <Image source={{ uri: item.profileImage }} style={styles.headImage} />
      ) : (
        <View style={styles.headImagePlaceholder}>
          <Icon name="person" size={30} color="#aaa" />
        </View>
      )}
      <View style={styles.headInfo}>
        <Text style={styles.headName}>{item.name}</Text>
        <Text style={styles.headSchool}>{item.school}</Text>
        <Text style={styles.headEmail} numberOfLines={1}>{item.email}</Text>
      </View>
      <TouchableOpacity 
        onPress={() => shareProfile(item)}
        style={styles.shareButtonSmall}
      >
        <Icon2 name="share-variant" size={20} color="#3498db" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.keyboardAvoidingView}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            colors={['#3498db']}
            tintColor="#3498db"
          />
        }
      >
        <View style={styles.container}>
          <Text style={styles.title}>Add School Head</Text>
          
          <View style={styles.formContainer}>
            <Text style={styles.label}>Name</Text>
            <TextInput
              style={[styles.input, errors.name && styles.errorInput]}
              placeholder="Enter name"
              value={formData.name}
              onChangeText={(text) => setFormData({...formData, name: text})}
            />
            {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}

            <Text style={styles.label}>Email</Text>
            <TextInput
              style={[styles.input, errors.email && styles.errorInput]}
              placeholder="Enter email"
              value={formData.email}
              onChangeText={(text) => setFormData({...formData, email: text})}
              keyboardType="email-address"
            />
            {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

            <Text style={styles.label}>Phone</Text>
            <TextInput
              style={[styles.input, errors.phone && styles.errorInput]}
              placeholder="Enter phone number"
              value={formData.phone}
              onChangeText={(text) => setFormData({...formData, phone: text})}
              keyboardType="phone-pad"
            />
            {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}

            <Text style={styles.label}>Password</Text>
            <TextInput
              style={[styles.input, errors.password && styles.errorInput]}
              placeholder="Enter password"
              value={formData.password}
              onChangeText={(text) => setFormData({...formData, password: text})}
              secureTextEntry
            />
            {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

            <Text style={styles.label}>School</Text>
            <Dropdown
              style={[styles.dropdown, isFocus && { borderColor: 'blue' }]}
              placeholderStyle={styles.placeholderStyle}
              selectedTextStyle={styles.selectedTextStyle}
              inputSearchStyle={styles.inputSearchStyle}
              iconStyle={styles.iconStyle}
              data={data}
              search
              maxHeight={300}
              labelField="label"
              valueField="value"
              placeholder={!isFocus ? 'Select school' : '...'}
              searchPlaceholder="Search..."
              value={formData.school}
              onFocus={() => setIsFocus(true)}
              onBlur={() => setIsFocus(false)}
              onChange={item => {
                setFormData({...formData, school: item.value});
                setIsFocus(false);
              }}
            />
            {errors.school && <Text style={styles.errorText}>{errors.school}</Text>}

            <Text style={styles.label}>Profile Image</Text>
            <TouchableOpacity 
              style={styles.imagePicker} 
              onPress={handleImagePicker}
            >
              {imageUri ? (
                <Image source={{ uri: imageUri }} style={styles.imagePreview} />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Icon name="add-a-photo" size={30} color="#aaa" />
                  <Text style={styles.imagePlaceholderText}>Select Image</Text>
                </View>
              )}
            </TouchableOpacity>
            {uploading && <ActivityIndicator size="small" color="#3498db" />}

            <TouchableOpacity
              style={styles.button}
              onPress={handleAddHead}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Add School Head</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.listContainer}>
            <Text style={styles.listTitle}>School Heads</Text>
            {headsList.length === 0 ? (
              <Text style={styles.noDataText}>No school heads found</Text>
            ) : (
              <FlatList
                data={headsList}
                renderItem={renderHeadItem}
                keyExtractor={item => item.id}
                scrollEnabled={false}
              />
            )}
          </View>
        </View>
      </ScrollView>

      <Modal
        visible={viewProfileModal}
        transparent={false}
        animationType="slide"
        onRequestClose={() => setViewProfileModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity 
              onPress={() => setViewProfileModal(false)}
              style={styles.backButton}
            >
              <Icon name="arrow-back" size={24} color="#3498db" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Head Profile</Text>
            <TouchableOpacity 
              onPress={() => shareProfile(selectedHead)}
              style={styles.shareButtonHeader}
            >
              <Icon2 name="share-variant" size={22} color="#3498db" />
            </TouchableOpacity>
          </View>
          
          {selectedHead && (
            <View style={styles.profileContainer}>
              <View style={styles.profileHeader}>
                <View>
                  {selectedHead.profileImage ? (
                    <Image 
                      source={{ uri: selectedHead.profileImage }} 
                      style={styles.viewProfileImage} 
                    />
                  ) : (
                    <View style={styles.viewProfileImagePlaceholder}>
                      <Icon name="person" size={60} color="#aaa" />
                    </View>
                  )}
                  <Text style={styles.profileName}>{selectedHead.name}</Text>
                </View>
                
                <View style={styles.profileStats}>
                  <View style={styles.statItem}>
                    <Text style={styles.statNumber}>{posts.length}</Text>
                    <Text style={styles.statLabel}>Posts</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Icon name="school" size={24} color="#3498db" />
                    <Text style={styles.statLabel}>{selectedHead.school}</Text>
                  </View>
                </View>
              </View>
              
              <View style={styles.tabContainer}>
                <TouchableOpacity
                  style={[styles.tabButton, activeTab === 'profile' && styles.activeTab]}
                  onPress={() => setActiveTab('profile')}
                >
                  <Icon 
                    name="person" 
                    size={20} 
                    color={activeTab === 'profile' ? '#3498db' : '#666'} 
                  />
                  <Text style={[
                    styles.tabText,
                    activeTab === 'profile' && styles.activeTabText
                  ]}>
                    Profile
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.tabButton, activeTab === 'posts' && styles.activeTab]}
                  onPress={() => setActiveTab('posts')}
                >
                  <Icon 
                    name="article" 
                    size={20} 
                    color={activeTab === 'posts' ? '#3498db' : '#666'} 
                  />
                  <Text style={[
                    styles.tabText,
                    activeTab === 'posts' && styles.activeTabText
                  ]}>
                    Posts
                  </Text>
                </TouchableOpacity>
              </View>
              
              {activeTab === 'profile' ? (
                <ScrollView style={styles.profileDetails}>
                  <View style={styles.detailCard}>
                    <Text style={styles.detailCardTitle}>Contact Information</Text>
                    
                    <View style={styles.detailItem}>
                      <Icon name="email" size={20} color="#3498db" />
                      <View style={styles.detailTextContainer}>
                        <Text style={styles.detailLabel}>Email</Text>
                        <Text style={styles.detailText}>{selectedHead.email}</Text>
                      </View>
                    </View>
                    
                    <View style={styles.detailItem}>
                      <Icon name="phone" size={20} color="#3498db" />
                      <View style={styles.detailTextContainer}>
                        <Text style={styles.detailLabel}>Phone</Text>
                        <Text style={styles.detailText}>{selectedHead.phone}</Text>
                      </View>
                    </View>
                  </View>
                  
                  <View style={styles.detailCard}>
                    <Text style={styles.detailCardTitle}>School Information</Text>
                    
                    <View style={styles.detailItem}>
                      <Icon name="school" size={20} color="#3498db" />
                      <View style={styles.detailTextContainer}>
                        <Text style={styles.detailLabel}>School</Text>
                        <Text style={styles.detailText}>{selectedHead.school}</Text>
                      </View>
                    </View>
                    
                    <View style={styles.detailItem}>
                      <Icon name="badge" size={20} color="#3498db" />
                      <View style={styles.detailTextContainer}>
                        <Text style={styles.detailLabel}>Role</Text>
                        <Text style={styles.detailText}>School Head</Text>
                      </View>
                    </View>
                  </View>
                </ScrollView>
              ) : (
                <FlatList
                  data={posts}
                  renderItem={renderPostItem}
                  keyExtractor={item => item.id}
                  ListEmptyComponent={
                    <View style={styles.noPostsContainer}>
                      <Icon name="article" size={50} color="#ddd" />
                      <Text style={styles.noPostsText}>No posts available</Text>
                    </View>
                  }
                  contentContainerStyle={styles.postsContainer}
                  refreshControl={
                    <RefreshControl
                      refreshing={refreshing}
                      onRefresh={onRefresh}
                      colors={['#3498db']}
                    />
                  }
                />
              )}
            </View>
          )}
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#2c3e50',
    textAlign: 'center',
  },
  formContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#2c3e50',
    fontWeight: '500',
  },
  input: {
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  errorInput: {
    borderColor: 'red',
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
    fontSize: 14,
  },
  dropdown: {
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    backgroundColor: '#f9f9f9',
  },
  placeholderStyle: {
    fontSize: 16,
    color: '#999',
  },
  selectedTextStyle: {
    fontSize: 16,
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
  },
  imagePicker: {
    height: 150,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    backgroundColor: '#f9f9f9',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  imagePlaceholder: {
    alignItems: 'center',
  },
  imagePlaceholderText: {
    marginTop: 10,
    color: '#999',
  },
  button: {
    backgroundColor: '#3498db',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  listContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  listTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#2c3e50',
  },
  noDataText: {
    textAlign: 'center',
    color: '#999',
    fontSize: 16,
    marginVertical: 20,
  },
  headItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  headImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  headImagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headInfo: {
    flex: 1,
    marginLeft: 12,
  },
  headName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  headSchool: {
    fontSize: 14,
    color: '#3498db',
    marginTop: 3,
  },
  headEmail: {
    fontSize: 13,
    color: '#666',
    marginTop: 3,
  },
  shareButtonSmall: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#f0f8ff',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
  },
  backButton: {
    padding: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  shareButtonHeader: {
    padding: 5,
  },
  profileContainer: {
    flex: 1,
  },
  profileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: '#f9f9f9',
  },
  viewProfileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#3498db',
  },
  viewProfileImagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#3498db',
    backgroundColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 10,
    textAlign: 'center',
    color: '#2c3e50',
  },
  profileStats: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  statItem: {
    alignItems: 'center',
    marginBottom: 15,
  },
  statNumber: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#3498db',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
  },
  tabButton: {
    flex: 1,
    padding: 15,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  activeTab: {
    borderBottomWidth: 3,
    borderBottomColor: '#3498db',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
    color: '#666',
  },
  activeTabText: {
    color: '#3498db',
  },
  profileDetails: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  detailCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    margin: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  detailCardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#2c3e50',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  detailTextContainer: {
    marginLeft: 15,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
  },
  detailText: {
    fontSize: 16,
    color: '#333',
    marginTop: 3,
  },
  postsContainer: {
    paddingBottom: 20,
  },
  postItem: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    marginHorizontal: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  postAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  postAvatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  postAuthor: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#2c3e50',
  },
  postTime: {
    fontSize: 12,
    color: '#999',
  },
  postText: {
    fontSize: 16,
    marginBottom: 12,
    lineHeight: 22,
    color: '#333',
  },
  postImage: {
    width: '100%',
    height: width * 0.7,
    borderRadius: 8,
    marginBottom: 12,
  },
  postFooter: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 10,
  },
  postAction: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 5,
  },
  postActionText: {
    marginLeft: 5,
    color: '#666',
    fontSize: 14,
  },
  noPostsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  noPostsText: {
    fontSize: 16,
    color: '#999',
    marginTop: 15,
  },
});

export default HeadPanel;
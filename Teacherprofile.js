import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
  Platform,
  Dimensions,
  KeyboardAvoidingView,
  ActivityIndicator
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Picker } from '@react-native-picker/picker';

const { width, height } = Dimensions.get('window');

const Teacherprofile = () => {
  // Profile Data
  const [profile, setProfile] = useState({
    name: 'Dr. Sarah Johnson',
    email: 'sarah.johnson@school.edu',
    department: 'Science',
    designation: 'Senior Professor',
    bio: 'Passionate educator with 15 years of experience in Chemistry and Physics',
    profileImage: 'https://randomuser.me/api/portraits/women/44.jpg',
    coverImage: 'https://source.unsplash.com/random/800x200/?university',
    contactNumber: '+1 555-123-4567'
  });

  // Posts
  const [posts, setPosts] = useState([
    {
      id: 1,
      content: 'Excited to start the new semester with all my students!',
      date: '2 hours ago',
      likes: 24,
      comments: 5,
      liked: false
    },
    {
      id: 2,
      content: 'Don\'t forget to submit your assignments by Friday',
      date: '1 day ago',
      likes: 18,
      comments: 3,
      liked: false
    }
  ]);

  const [newPost, setNewPost] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [tempProfile, setTempProfile] = useState({...profile});
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('posts');

  // Departments for picker
  const departments = ['Science', 'Mathematics', 'English', 'History', 'Arts'];
  const designations = ['Professor', 'Associate Professor', 'Assistant Professor', 'Lecturer'];

  const handleProfileUpdate = () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setProfile(tempProfile);
      setIsEditing(false);
      setIsLoading(false);
      Alert.alert('Success', 'Profile updated successfully!');
    }, 1500);
  };

  const addPost = () => {
    if (newPost.trim() === '') {
      Alert.alert('Error', 'Please write something to post');
      return;
    }

    const newPostObj = {
      id: posts.length + 1,
      content: newPost,
      date: 'Just now',
      likes: 0,
      comments: 0,
      liked: false
    };

    setPosts([newPostObj, ...posts]);
    setNewPost('');
  };

  const toggleLike = (postId) => {
    setPosts(posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          liked: !post.liked,
          likes: post.liked ? post.likes - 1 : post.likes + 1
        };
      }
      return post;
    }));
  };

  const simulateImagePicker = (type) => {
    Alert.alert(
      `Change ${type === 'profile' ? 'Profile' : 'Cover'} Picture`,
      'Select an option',
      [
        {
          text: 'Use Sample Image 1',
          onPress: () => setTempProfile({
            ...tempProfile,
            [type === 'profile' ? 'profileImage' : 'coverImage']: 
              type === 'profile' 
                ? 'https://randomuser.me/api/portraits/women/45.jpg' 
                : 'https://source.unsplash.com/random/800x200/?campus'
          })
        },
        {
          text: 'Use Sample Image 2',
          onPress: () => setTempProfile({
            ...tempProfile,
            [type === 'profile' ? 'profileImage' : 'coverImage']: 
              type === 'profile' 
                ? 'https://randomuser.me/api/portraits/women/68.jpg' 
                : 'https://source.unsplash.com/random/800x200/?education'
          })
        },
        {
          text: 'Remove Current',
          onPress: () => setTempProfile({
            ...tempProfile,
            [type === 'profile' ? 'profileImage' : 'coverImage']: null
          }),
          style: 'destructive'
        },
        {
          text: 'Cancel',
          style: 'cancel'
        }
      ]
    );
  };

  const renderProfileSection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>About</Text>
      {isEditing ? (
        <TextInput
          style={styles.bioInput}
          multiline
          value={tempProfile.bio}
          onChangeText={(text) => setTempProfile({...tempProfile, bio: text})}
          placeholder="Tell something about yourself..."
          placeholderTextColor="#95a5a6"
        />
      ) : (
        <Text style={styles.bioText}>{profile.bio}</Text>
      )}

      <View style={styles.infoItem}>
        <Icon name="email" size={20} color="#7f8c8d" style={styles.infoIcon} />
        <Text style={styles.infoText}>{profile.email}</Text>
      </View>

      <View style={styles.infoItem}>
        <Icon name="phone" size={20} color="#7f8c8d" style={styles.infoIcon} />
        {isEditing ? (
          <TextInput
            style={styles.editableInfoText}
            value={tempProfile.contactNumber}
            onChangeText={(text) => setTempProfile({...tempProfile, contactNumber: text})}
            placeholder="Contact Number"
            keyboardType="phone-pad"
          />
        ) : (
          <Text style={styles.infoText}>{profile.contactNumber}</Text>
        )}
      </View>

      <View style={styles.infoItem}>
        <Icon name="school" size={20} color="#7f8c8d" style={styles.infoIcon} />
        <Text style={styles.infoText}>
          {profile.designation}, {profile.department} Department
        </Text>
      </View>
    </View>
  );

  const renderEditSection = () => (
    <View style={styles.editSection}>
      <View style={styles.inputRow}>
        <Icon name="person" size={20} color="#7f8c8d" style={styles.inputIcon} />
        <TextInput
          style={styles.inputField}
          value={tempProfile.name}
          onChangeText={(text) => setTempProfile({...tempProfile, name: text})}
          placeholder="Full Name"
          placeholderTextColor="#95a5a6"
        />
      </View>

      <View style={styles.inputRow}>
        <Icon name="email" size={20} color="#7f8c8d" style={styles.inputIcon} />
        <TextInput
          style={styles.inputField}
          value={tempProfile.email}
          onChangeText={(text) => setTempProfile({...tempProfile, email: text})}
          placeholder="Email"
          keyboardType="email-address"
          placeholderTextColor="#95a5a6"
        />
      </View>

      <View style={styles.inputRow}>
        <Icon name="work" size={20} color="#7f8c8d" style={styles.inputIcon} />
        <Picker
          selectedValue={tempProfile.department}
          onValueChange={(itemValue) => setTempProfile({...tempProfile, department: itemValue})}
          style={styles.picker}
          dropdownIconColor="#7f8c8d"
        >
          {departments.map((dept, index) => (
            <Picker.Item key={index} label={dept} value={dept} />
          ))}
        </Picker>
      </View>

      <View style={styles.inputRow}>
        <Icon name="badge" size={20} color="#7f8c8d" style={styles.inputIcon} />
        <Picker
          selectedValue={tempProfile.designation}
          onValueChange={(itemValue) => setTempProfile({...tempProfile, designation: itemValue})}
          style={styles.picker}
          dropdownIconColor="#7f8c8d"
        >
          {designations.map((desg, index) => (
            <Picker.Item key={index} label={desg} value={desg} />
          ))}
        </Picker>
      </View>
    </View>
  );

  const renderPostsSection = () => (
    <>
      <View style={styles.createPostContainer}>
        <TextInput
          style={styles.postInput}
          placeholder="Share something with your students..."
          placeholderTextColor="#95a5a6"
          multiline
          value={newPost}
          onChangeText={setNewPost}
        />
        <TouchableOpacity style={styles.postButton} onPress={addPost}>
          <Text style={styles.postButtonText}>Post</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Your Posts</Text>
        {posts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Icon name="article" size={50} color="#bdc3c7" />
            <Text style={styles.emptyText}>No posts yet</Text>
            <Text style={styles.emptySubText}>Share updates with your students</Text>
          </View>
        ) : (
          posts.map(post => (
            <View key={post.id} style={styles.postContainer}>
              <View style={styles.postHeader}>
                <Image
                  source={{ uri: profile.profileImage || 'https://via.placeholder.com/150' }}
                  style={styles.postProfileImage}
                />
                <View style={styles.postUserInfo}>
                  <Text style={styles.postUserName}>{profile.name}</Text>
                  <Text style={styles.postDate}>{post.date}</Text>
                </View>
              </View>
              <Text style={styles.postContent}>{post.content}</Text>
              <View style={styles.postFooter}>
                <TouchableOpacity 
                  style={styles.postAction}
                  onPress={() => toggleLike(post.id)}
                >
                  <Icon 
                    name={post.liked ? "favorite" : "favorite-border"} 
                    size={20} 
                    color={post.liked ? "#e74c3c" : "#7f8c8d"} 
                  />
                  <Text style={[styles.postActionText, post.liked && styles.likedAction]}>
                    {post.likes}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.postAction}>
                  <Icon name="comment" size={20} color="#7f8c8d" />
                  <Text style={styles.postActionText}>{post.comments}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.postAction}>
                  <Icon name="share" size={20} color="#7f8c8d" />
                  <Text style={styles.postActionText}>Share</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </View>
    </>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <ScrollView style={styles.container}>
        {/* Cover Photo */}
        <View style={styles.coverContainer}>
          <Image
            source={{ uri: isEditing ? (tempProfile.coverImage || 'https://via.placeholder.com/800x200') : profile.coverImage }}
            style={styles.coverImage}
            resizeMode="cover"
          />
          <TouchableOpacity 
            style={styles.editCoverButton}
            onPress={() => simulateImagePicker('cover')}
          >
            <Icon name="edit" size={20} color="white" />
          </TouchableOpacity>
        </View>

        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.profileImageContainer}>
            <TouchableOpacity onPress={() => simulateImagePicker('profile')}>
              <Image
                source={{ uri: isEditing ? (tempProfile.profileImage || 'https://via.placeholder.com/150') : profile.profileImage }}
                style={styles.profileImage}
              />
              <View style={styles.cameraIcon}>
                <Icon name="photo-camera" size={16} color="white" />
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.profileInfo}>
            <Text style={styles.name}>{isEditing ? tempProfile.name : profile.name}</Text>
            <Text style={styles.designation}>{isEditing ? tempProfile.designation : profile.designation}</Text>
            <Text style={styles.department}>{isEditing ? tempProfile.department : profile.department} Department</Text>
          </View>

          <TouchableOpacity 
            style={styles.editButton}
            onPress={() => {
              if (isEditing) {
                handleProfileUpdate();
              } else {
                setTempProfile({...profile});
                setIsEditing(true);
              }
            }}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Text style={styles.editButtonText}>
                {isEditing ? 'Save' : 'Edit'}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Navigation Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'profile' && styles.activeTab]}
            onPress={() => setActiveTab('profile')}
          >
            <Icon 
              name="person" 
              size={20} 
              color={activeTab === 'profile' ? '#3498db' : '#7f8c8d'} 
            />
            <Text style={[styles.tabText, activeTab === 'profile' && styles.activeTabText]}>
              Profile
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'posts' && styles.activeTab]}
            onPress={() => setActiveTab('posts')}
          >
            <Icon 
              name="article" 
              size={20} 
              color={activeTab === 'posts' ? '#3498db' : '#7f8c8d'} 
            />
            <Text style={[styles.tabText, activeTab === 'posts' && styles.activeTabText]}>
              Posts
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content Sections */}
        {activeTab === 'profile' ? (
          <>
            {renderProfileSection()}
            {isEditing && renderEditSection()}
          </>
        ) : (
          renderPostsSection()
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  coverContainer: {
    height: height * 0.25,
    position: 'relative',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  editCoverButton: {
    position: 'absolute',
    bottom: 15,
    right: 15,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 8,
    borderRadius: 20,
  },
  profileHeader: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 20,
    marginTop: -60,
    alignItems: 'flex-end',
  },
  profileImageContainer: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: 'white',
  },
  cameraIcon: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: '#3498db',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  profileInfo: {
    flex: 1,
    marginLeft: 20,
    marginBottom: 15,
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  designation: {
    fontSize: 16,
    color: '#7f8c8d',
    marginTop: 4,
  },
  department: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 2,
  },
  editButton: {
    backgroundColor: '#3498db',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    alignSelf: 'center',
    minWidth: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  section: {
    backgroundColor: 'white',
    padding: 20,
    marginVertical: 10,
    marginHorizontal: 15,
    borderRadius: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
  },
  bioText: {
    fontSize: 15,
    color: '#34495e',
    lineHeight: 22,
    marginBottom: 15,
  },
  bioInput: {
    fontSize: 15,
    color: '#34495e',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    minHeight: 100,
    marginBottom: 15,
    textAlignVertical: 'top',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  infoIcon: {
    marginRight: 15,
    width: 24,
  },
  infoText: {
    fontSize: 15,
    color: '#2c3e50',
    flex: 1,
  },
  editableInfoText: {
    fontSize: 15,
    color: '#2c3e50',
    flex: 1,
    paddingVertical: 8,
  },
  editSection: {
    backgroundColor: 'white',
    padding: 20,
    margin: 15,
    borderRadius: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 10,
  },
  inputIcon: {
    marginRight: 15,
    width: 24,
  },
  inputField: {
    flex: 1,
    fontSize: 16,
    color: '#2c3e50',
    paddingVertical: 8,
  },
  picker: {
    flex: 1,
    color: '#2c3e50',
  },
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    marginHorizontal: 15,
    marginTop: 10,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#3498db',
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#7f8c8d',
    marginLeft: 8,
  },
  activeTabText: {
    color: '#3498db',
  },
  createPostContainer: {
    backgroundColor: 'white',
    padding: 15,
    margin: 15,
    borderRadius: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  postInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    minHeight: 100,
    fontSize: 15,
    color: '#34495e',
    marginBottom: 10,
    textAlignVertical: 'top',
  },
  postButton: {
    backgroundColor: '#3498db',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  postButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  postContainer: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 15,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  postProfileImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
  },
  postUserInfo: {
    flex: 1,
  },
  postUserName: {
    fontWeight: 'bold',
    color: '#2c3e50',
    fontSize: 16,
  },
  postDate: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 2,
  },
  postContent: {
    fontSize: 15,
    color: '#34495e',
    lineHeight: 22,
    marginBottom: 12,
  },
  postFooter: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  postAction: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  postActionText: {
    marginLeft: 6,
    color: '#7f8c8d',
    fontSize: 14,
  },
  likedAction: {
    color: '#e74c3c',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  emptyText: {
    fontSize: 16,
    color: '#7f8c8d',
    marginTop: 10,
    fontWeight: '600',
  },
  emptySubText: {
    fontSize: 14,
    color: '#bdc3c7',
    marginTop: 5,
  },
});

export default Teacherprofile;
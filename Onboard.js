
// //import liraries
// import React, { Component } from 'react';
// import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';

// // create a component
// const Homescreen = (props) => {
//     return (
//         <View>
//           <View style={{padding:40}}>
//             <Text style={{color:'#cca7cb',textAlign:'center',fontSize:40,}}>LOgin</Text>
//           </View>
//           <View style={{marginVertical:20}}>
//           <View style={{paddingLeft:33,}}>
//             <Text style={{fontSize:20}}>
//                 UserName
//             </Text>
//           </View>
//           <View style={{paddingVertical:10}}>
//             <TextInput style={{height:45,width:300,backgroundColor:'white',alignSelf:'center',borderRadius:15,borderBottomWidth:1,
//                 elevation:7,paddingHorizontal:20,color:'black'
//             }}
//             placeholder='Type Your Name '
//           placeholderTextColor={'black'}
//             />
//           </View>
//           </View>
//           <View>
//          <View style={{paddingLeft:33}}>
//             <Text style={{fontSize:20}}>Password</Text> </View>
//             <View style={{paddingVertical:10}}>
//                 <TextInput
//                 placeholder='Password'
//                 placeholderTextColor={'black'}
//                  style={{height:45,width:300,backgroundColor:'white',alignSelf:'center',borderRadius:15,borderBottomWidth:1,
//                     elevation:7,paddingHorizontal:20,color:'black'
//                 }}/>
//             </View>
//             <View style={{}}>
//                 <Text style={{textAlign:'right',left:-30,color:'#cca7cb'}}>Forgot Your Password</Text>
//             </View>
//             </View>
//             <View style={{padding:45}}>
//                <TouchableOpacity style={{width:230,height:45,backgroundColor:'#cca7cb',alignSelf:'center',borderRadius:20,
            
//                 }}>
//                     <Text style={{textAlign:'center',top:10}}>Login</Text>
//                 </TouchableOpacity>
//                 <View style={{padding:20,flexDirection:'row'}}>
//                     <Text style={{textAlign:'right'}}>
//                         Don't have an account?
//                     </Text>
//                     <TouchableOpacity onPress={()=>{
//                     props.navigation.navigate("hello")
//                 }}>
//                         <Text style={{color:'#cca7cb'}}>SignUp</Text>
//                     </TouchableOpacity>
//                 </View>
//                </View>
               
//         </View>
//     );
// };

// // define your styles
// const styles = StyleSheet.create({    
// });

// //make this component available to the app
// export default Homescreen;

import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Entypo from'react-native-vector-icons/Entypo';


const { width } = Dimensions.get('window');
const SignUp = (props) => {
  return (
 
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>

  
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Username</Text>
        <View style={styles.input}>
        <Ionicons 
        name="person" size={20} style={{color:"#a4599d",}}/>
        <TextInput
          placeholder="Type your name"
          placeholderTextColor="#888"
          
        />
        
        
        
        </View>
    
      </View>
      
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Email</Text>
        <View style={styles.input}>
        <Ionicons 
        name="person" size={20} style={{color:"#a4599d",}}/>
        <TextInput
          placeholder="Type your name"
          placeholderTextColor="#888"
          
        />
        
        
        
        </View>
    
      </View>


      <View style={styles.inputGroup1}>
        <Text style={styles.label1}>Password</Text>
        <View style={styles.input1}> 
        <MaterialIcons name="password" size={20} style={{color:"#a4599d",}}/>
       
        
        <TextInput
          placeholder="Enter your password"
          placeholderTextColor="#888"
          secureTextEntry
        />
         <AntDesign name="eye" size={20} style={{color:"#a4599d",}}/>
        </View>
        <Text style={styles.forgotText}>Forgot Your Password?</Text>
      </View>
      <View style={styles.inputGroup1}>
        <Text style={styles.label1}>Re-Password</Text>
        <View style={styles.input1}> 
        <MaterialIcons name="password" size={20} style={{color:"#a4599d",}}/>
       
        
        <TextInput
          placeholder="Re-enter your password"
          placeholderTextColor="#888"
          secureTextEntry
        />
         <AntDesign name="eye" size={20} style={{color:"#a4599d",}}/>
        </View>
       
      </View>

     
      <TouchableOpacity style={styles.loginButton}
      onPress={() => props.navigation.navigate("hello")}>
        <Text style={styles.loginText}>Login</Text>
      </TouchableOpacity>

      {/* Signup */}
      <View style={styles.signupContainer}>
        <Text style={{ color: '#555' }}>Don't have an account?</Text>
        <TouchableOpacity>
          <Text style={styles.signupText}> Sign Up</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 80,
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#a4599d',
    marginBottom: 40,
  },
  inputGroup: {
    width: width * 0.85,
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#444',
  },
  input: {
    height: 45,
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 15,
    borderColor: '#ddd',
    borderWidth: 1,
    color: '#000',
    flexDirection:"row",
    justifyContent:"flex-start",
    alignItems:"center",
    width:300
  },inputGroup1: {
    width: width * 0.85,
    marginBottom: 20,
  },
  label1: {
    fontSize: 16,
    marginBottom: 8,
    color: '#444'
  },
  input1: {
    height: 45,
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 15,
    borderColor: '#ddd',
    borderWidth: 1,
    color: '#000',
    flexDirection:"row",
    justifyContent:"space-between",
    alignItems:"center",
    width:300,
    textAlign:'right'
    
  },
  forgotText: {
    textAlign: 'right',
    marginTop: 5,
    fontSize: 13,
    color: '#a4599d',
  },
  loginButton: {
    width: width * 0.6,
    height: 45,
    backgroundColor: '#a4599d',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 25,
  },
  loginText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  signupContainer: {
    flexDirection: 'row',
    marginTop: 25,
  },
  signupText: {
    color: '#a4599d',
    fontWeight: 'bold',
    marginLeft: 5,
  },
});

export default SignUp;






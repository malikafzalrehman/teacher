import React from 'react';
import { View, Text, StyleSheet, ImageBackground, TouchableOpacity } from 'react-native';

const Splash = (props) => {
    return (
        
        <View style={styles.container}>
            
            <ImageBackground
                source={require('./logo.png.png')}
                style={styles.background} 
                resizeMode="cover"
            >
                
                <TouchableOpacity onPress={()=>{
                    props.navigation.navigate("singup")
                }}>
                <View style={styles.overlay}>
                    <Text style={styles.text}>Study pro Ai</Text>
                </View>
                </TouchableOpacity>
            </ImageBackground>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    background: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    overlay: {
        backgroundColor: 'rgba(117, 111, 111, 0.5)', // 
        padding: 20,
        borderRadius: 10,
    },
    text: {
         
        color: 'rgba(92, 202, 202, 0.5)',
        fontSize: 24,
        fontWeight: 'bold',
    },
});

export default Splash;
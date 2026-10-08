import { Fontisto } from '@expo/vector-icons';
import { CameraCapturedPicture } from 'expo-camera';
import React from 'react'
import { TouchableOpacity, Image, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context'; 
const PhotoPreviewSection = ({
    photo,
    handleRetakePhoto, // retake button call
    handleSavePhoto, // save button call
}: {
    photo: CameraCapturedPicture;
        handleRetakePhoto: () => void;
        handleSavePhoto: () => void;
}) => ( 
    <SafeAreaView edges={['top', 'bottom']} style={styles.container}>
        <Image style={styles.previewContainer} source={{ uri: photo.uri }} />
        <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button} onPress={handleRetakePhoto}>
                <Fontisto name="trash" size={32} color="white" /> 
            </TouchableOpacity> 
            <TouchableOpacity style={styles.button} onPress={handleSavePhoto}>
                <Fontisto name="save" size={32} color="white" />
            </TouchableOpacity>
        </View>
    </SafeAreaView>
);
//  i need to figure out how to pass the image into the "analyse item" function in the ML folder 
const styles = StyleSheet.create({
    container:{
        flex: 1,
        backgroundColor: 'black',
        alignItems: 'center',
        justifyContent: 'center',
    },
    box: {
        borderRadius: 15,
        padding: 1,
        width: '95%',
        backgroundColor: 'darkgray',
        justifyContent: 'center',
        alignItems: "center",
    },
    previewContainer: {
        width: '95%',
        height: '85%',
        borderRadius: 15
    },
    buttonContainer: {
        marginTop: '4%',
        flexDirection: 'row',
        justifyContent: "space-evenly",
        width: '100%',
    },
    button: {
        backgroundColor: 'gray',
        borderRadius: 25,
        padding: 10,
        alignItems: 'center',
        justifyContent: 'center',
    }
});
export default PhotoPreviewSection;
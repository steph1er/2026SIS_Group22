import { AntDesign, Feather } from '@expo/vector-icons';
import { CameraType, CameraView, useCameraPermissions } from 'expo-camera';
import { useRef, useState } from 'react';
import {
  Button,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { ThemedText } from './themed-text';
import PhotoPreviewSection from './photo-preview';
import * as ImagePicker from 'expo-image-picker'; 


export default function Camera() {
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [photo, setPhoto] = useState<any>(null);
  const cameraRef = useRef<CameraView | null>(null);

  if (!permission) {
    // Camera permissions are still loading.
    return <View />;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet.
    return(<View style={styles.permissionContainer}>
      <Text style={styles.permissionText}>
        We need your permission to show the camera
      </Text> 
      <Button onPress={requestPermission} title="Grant Permission" />
    </View>); 
  }

  function toggleCameraFacing() {
    setFacing((current) => (current === 'back' ? 'front' : 'back'));
  }

  const handleTakePhoto = async () => {
    if (cameraRef.current) {
      const options = {
        quality: 1,
        base64: true,
        exif: false,
      };
      const takedPhoto = await cameraRef.current.takePictureAsync(options);
      setPhoto(takedPhoto);
    }
  };

  const handleRetakePhoto = () => setPhoto(null);

  const handleSavePhoto = () => {
  // TODO: upload/save the photo (e.g. send photo.uri to the backend)
  console.log('save photo', photo?.uri);
  // setPhoto(null); // return to the camera after saving
}; 

  const handlePickFromLibrary = async () => {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'], // photos only, no videos
    quality: 1,
  });

  if (!result.canceled) {
    setPhoto(result.assets[0]); // opens the same preview as a camera photo
  }
};

  if (photo) 
    {return (
      <PhotoPreviewSection photo={photo} 
      handleRetakePhoto={handleRetakePhoto} 
      handleSavePhoto={handleSavePhoto}
      /> 
    );
} 

  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} facing={facing} ref={cameraRef} />
      <View style={styles.sheet}>
        <View style={styles.controlsRow}>
          <TouchableOpacity style={styles.wardrobeThumb} onPress={handlePickFromLibrary}>
            <Feather name="image" size={20} color="#fff" />
          </TouchableOpacity>
          <Pressable style={styles.shutterOuter} onPress={handleTakePhoto}>
            <View style={styles.shutterInner} />
          </Pressable> 

            <TouchableOpacity
              style={[styles.iconButton, styles.iconButtonActive]}
              onPress={toggleCameraFacing}
            >
              <Feather name="camera" size={18} color="#D98E73" />
            </TouchableOpacity>

        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  }, 
  permissionContainer: {
  flex: 1,
  backgroundColor: '#000',
  justifyContent: 'center', 
  alignItems: 'center',     
  paddingHorizontal: 24,    
  gap: 12,                  
},
permissionText: {
  color: '#fff',
  fontSize: 16,
  textAlign: 'center',
},
  camera: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
  },
  headerRight: {
    flexDirection: 'row',
    gap: 10,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconButtonActive: {
    backgroundColor: '#FBEAE3',
  },
  sheet: {
    backgroundColor: '#FAF6F2',
    paddingTop: 18,
    paddingBottom: 28,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  tabRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    marginBottom: 20,
  },
  tabWithDot: {
    alignItems: 'center',
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
    color: '#999',
  },
  tabLabelActive: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
    color: '#D98E73',
  },
  tabDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D98E73',
    marginTop: 4,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 32,
  },
  wardrobeThumb: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#8B5E3C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterOuter: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 3,
    borderColor: '#EDBBA3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#EDBBA3',
  },
  uploadButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
});
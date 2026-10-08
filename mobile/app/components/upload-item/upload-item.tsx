import { AntDesign, Feather } from '@expo/vector-icons';
import { CameraType, CameraView, useCameraPermissions } from 'expo-camera';
import { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Button,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { ThemedText } from '../themed-text';
import PhotoPreviewSection from './photo-preview';
import * as ImagePicker from 'expo-image-picker'; 
import ItemTagsForm, { type ConfirmedItem } from './edit-item-tags';
import { preparePhotoForUpload } from '../../services/upload-item/prep-image';
import { analyseItemPhoto, type AnalyseItemResult } from '../../services/upload-item/analyse-item-service';


export default function Camera() {
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [photo, setPhoto] = useState<any>(null);
  const cameraRef = useRef<CameraView | null>(null);
  const [showTip, setShowTip] = useState(true);
  const [analysing, setAnalysing] = useState(false);
  const [result, setResult] = useState<AnalyseItemResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  

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

  const handleRetakePhoto = () => {
    setPhoto(null);
    setAnalysing(false);
    setResult(null);
    setError(null);
  };

  const handleSavePhoto = async () => {
    setAnalysing(true);
    setError(null);
    try {
      const resized = await preparePhotoForUpload(photo);
      setResult(await analyseItemPhoto(resized));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong. Please try again.');
    } finally {
      setAnalysing(false);
    }
}; 

  const handleConfirm = (item: ConfirmedItem) => {
    // TODO: save the item to the wardrobe (next step), then open the wardrobe page.
    console.log('confirmed item', { ...item, embedding: `${item.embedding.length} numbers` });
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

 //  the next three "if" blocks pick which screen to show. They are checked
  // before the existing preview check, so once save is pressed they take over.

  // Results came back: show them, editable.
  if (photo && result) {
    return (
      <ItemTagsForm
        photoUri={photo.uri}
        result={result}
        onConfirm={handleConfirm}
        onRetake={handleRetakePhoto}
      />
    );
  }

  // Loading screen while the ML service works.
  if (photo && analysing) {
    return (
      <View style={styles.statusContainer}>
        <ActivityIndicator size="large" color="#D98E73" />
        <Text style={styles.statusTitle}>Analysing…</Text>
        <Text style={styles.statusText}>This can take up to 20 seconds.</Text>
      </View>
    );
  }

  // Something went wrong: let the user try again or retake.
  if (photo && error) {
    return (
      <View style={styles.statusContainer}>
        <Feather name="alert-circle" size={32} color="#B3261E" />
        <Text style={styles.statusTitle}>Couldn't analyse the photo</Text>
        <Text style={styles.statusText}>{error}</Text>
        <Pressable style={styles.statusButton} onPress={handleSavePhoto}>
          <Text style={styles.statusButtonText}>Try again</Text>
        </Pressable>
        <Pressable onPress={handleRetakePhoto}>
          <Text style={styles.statusLink}>Retake photo</Text>
        </Pressable>
      </View>
    );
  }

  // UNCHANGED from here: the preview and the camera.
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
      
      <View style={styles.camera}>
        <CameraView style={StyleSheet.absoluteFill} facing={facing} ref={cameraRef} />

        {showTip && (
          <View style={styles.tipBanner}>
            <Feather name="alert-circle" size={18} color="#8B5E3C" />
            <Text style={styles.tipText}>
              Please ensure the item being uploaded is clearly visable with no obstructions. 
            </Text>
            <TouchableOpacity
              onPress={() => setShowTip(false)}
              hitSlop={10}
              accessibilityLabel="Dismiss tip"
            >
              <Feather name="x" size={18} color="#8B5E3C" />
            </TouchableOpacity>
          </View>
        )}
      </View>

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
    statusContainer: {
    flex: 1,
    backgroundColor: '#FAF6F2',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 12,
  },
  statusTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#4A3A30',
    textAlign: 'center',
  },
  statusText: {
    fontSize: 14,
    color: '#7A6A60',
    textAlign: 'center',
  },
  statusButton: {
    backgroundColor: '#D98E73',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 28,
    marginTop: 8,
  },
  statusButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  statusLink: {
    color: '#8B5E3C',
    fontSize: 15,
    fontWeight: '600',
    paddingVertical: 8,
  },
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
  tipBanner: {
  position: 'absolute',
  top: 50,
  left: 16,
  right: 16,
  flexDirection: 'row',
  alignItems: 'center',
  gap: 10,
  backgroundColor: '#FAF6F2',
  borderRadius: 14,
  paddingVertical: 12,
  paddingHorizontal: 14,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.15,
  shadowRadius: 6,
  elevation: 3,
  },
  tipText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    color: '#4A3A30',
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
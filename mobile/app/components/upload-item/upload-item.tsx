import { AntDesign, Feather } from '@expo/vector-icons';
import { CameraType, CameraView, useCameraPermissions } from 'expo-camera';
import { useEffect, useRef, useState } from 'react';
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
import { useStyleUColors, useThemedStyles } from '../../hooks/use-theme';
import type { StyleUColors } from '../../services/styleu-theme';
import * as ImagePicker from 'expo-image-picker'; 
import { preparePhotoForUpload } from '../../../src/upload-item/prep-image';
import { addWardrobeItem, wardrobeItemHref } from '../../services/wardrobe/wardrobe-service';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BackButton } from '../back-button';
// import { router } from '../../../.expo/types/router';
import { router } from 'expo-router';

// Shown one after another while the photo is analysed. The backend doesn't report progress,
// so these move on a timer and the last one stays until the analysis finishes.
const ANALYSING_STEPS = ['Scanning image...', 'Categorising...', 'Finalising details...'];
const ANALYSING_STEP_MS = 2000;

export default function Camera() {
  const colors = useStyleUColors();
  const styles = useThemedStyles(createStyles);
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [photo, setPhoto] = useState<any>(null);
  const cameraRef = useRef<CameraView | null>(null);
  const [showTip, setShowTip] = useState(true);
  const [analysing, setAnalysing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [analysingStep, setAnalysingStep] = useState(0);

  // Move through the analysing messages while the ML service works.
  useEffect(() => {
    if (!analysing) return;
    const timer = setInterval(
      () => setAnalysingStep((step) => Math.min(step + 1, ANALYSING_STEPS.length - 1)),
      ANALYSING_STEP_MS,
    );
    return () => clearInterval(timer);
  }, [analysing]);
  
  const insets = useSafeAreaInsets();

  // Uploading is a task started from the + menu, so it closes (✕) rather than going back.
  const closeButton = (
    <BackButton icon="close" variant="floating" fallback="/home-dashboard" style={[styles.closeButton, { top: insets.top + 8 }]} />
  );

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
      {closeButton}
    </View>); 
  }

  function toggleCameraFacing() {
    setFacing((current) => (current === 'back' ? 'front' : 'back'));
  }

  const handleTakePhoto = async () => {
    if (!cameraRef.current || !cameraReady) return;
    try {
      const options = {
        quality: 1,
        base64: true,
        exif: false,
      };
      const takedPhoto = await cameraRef.current.takePictureAsync(options);
      setPhoto(takedPhoto);
    } catch (e) {
      console.warn('Could not take photo', e);
    }
  };
  

  const handleRetakePhoto = () => {
    setCameraReady(false);
    setPhoto(null);
    setAnalysing(false);
    setError(null);
  };

  const handleSavePhoto = async () => {
    setAnalysingStep(0);
    setAnalysing(true);
    setError(null);
    try {
      const resized = await preparePhotoForUpload(photo);
      const saved = await addWardrobeItem(resized);
      // The backend has saved the item with the ML's guesses; let the user check them
      // on the wardrobe item screen, which opens in edit mode for new items.
      router.replace(wardrobeItemHref(saved.id, true));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong. Please try again.');
    } finally {
      setAnalysing(false);
    }
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

 //  the next two "if" blocks pick which screen to show. They are checked
  // before the existing preview check, so once save is pressed they take over.

  // Loading screen while the ML service works.
  if (photo && analysing) {
    return (
      <View style={styles.statusContainer}>
        <ActivityIndicator size="large" color="#D98E73" />
        <Text style={styles.statusTitle}>Analysing…</Text>
        <Text style={styles.statusText}>{ANALYSING_STEPS[analysingStep]}</Text>
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
      {/* One area for the camera; everything inside floats on top of it */}
      <View style={styles.cameraArea}>
        <CameraView
          style={StyleSheet.absoluteFill}
          facing={facing}
          ref={cameraRef}
          onCameraReady={() => setCameraReady(true)}
        />

        {closeButton}

        {/* Rendered after the close button so it sits in front of it */}
        {showTip && (
          <View style={[styles.tipBanner, { top: insets.top + 8 }]}>
            <Feather name="alert-circle" size={18} color="#8B5E3C" />
            <Text style={styles.tipText}>
              Please ensure the item being uploaded is clearly visible with no obstructions.
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
            <Feather name="image" size={20} color={colors.onAccent} />
          </TouchableOpacity>
          <Pressable
            style={[styles.shutterOuter, !cameraReady && { opacity: 0.4 }]}
            onPress={handleTakePhoto}
            disabled={!cameraReady}
          >
            <View style={styles.shutterInner} />
          </Pressable>

          <TouchableOpacity
            style={[styles.iconButton, styles.iconButtonActive]}
            onPress={toggleCameraFacing}
          >
            <Feather name="camera" size={18} color={colors.accentStrong} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
const createStyles = (colors: StyleUColors) =>
  StyleSheet.create({ 
    statusContainer: {
    flex: 1,
    backgroundColor: '#FAF6F2',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 12,
  },
    cameraArea: {
    flex: 1,
    overflow: 'hidden',
    backgroundColor: '#000',
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
    backgroundColor: colors.surface,
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
  color: colors.onAccent,
  fontSize: 16,
  textAlign: 'center',
},
  camera: {
    flex: 1,
  },
  closeButton: {
    position: 'absolute',
    left: 20,
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
    color: colors.onAccent,
  },
  headerRight: {
    flexDirection: 'row',
    gap: 10,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconButtonActive: {
    backgroundColor: colors.accentSoft,
  },
  sheet: {
    backgroundColor: colors.surface,
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
    color: colors.iconInactive,
  },
  tabLabelActive: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
    color: colors.accentStrong,
  },
    tipBanner: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 10,
    elevation: 10,
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
    backgroundColor: colors.accentStrong,
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
    borderColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.accent,
  },
  uploadButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
});
import { Feather } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import type { ColourAnalysisPhoto } from '../../../src/colour-analysis/types';
import { useStyleUColors, useThemedStyles } from '../../hooks/use-theme';
import type { StyleUColors } from '../../services/styleu-theme';

type Props = {
  onCancel: () => void;
  onPhoto: (photo: ColourAnalysisPhoto) => void;
};

export function ColourAnalysisCamera({ onCancel, onPhoto }: Props) {
  const colors = useStyleUColors();
  const styles = useThemedStyles(createStyles);
  const cameraRef = useRef<CameraView | null>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [isTakingPhoto, setIsTakingPhoto] = useState(false);

  const takePhoto = async () => {
    if (!cameraRef.current || isTakingPhoto) return;
    setIsTakingPhoto(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.9, exif: false });
      if (photo) onPhoto(photo);
    } finally {
      setIsTakingPhoto(false);
    }
  };

  if (!permission) {
    return <ActivityIndicator color={colors.accent} size="large" style={styles.loader} />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionCard}>
        <Feather name="camera" size={34} color={colors.text} />
        <Text style={styles.permissionTitle}>Camera access needed</Text>
        <Text style={styles.permissionText}>Allow camera access to take a face photo for colour analysis.</Text>
        <Pressable style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.buttonLabel}>Allow Camera</Text>
        </Pressable>
        <Pressable onPress={onCancel} hitSlop={12}>
          <Text style={styles.cancelLabel}>Cancel</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView ref={cameraRef} style={styles.camera} facing="front" mirror />
      <View pointerEvents="none" style={styles.faceGuide} />
      <View style={styles.tipContainer} pointerEvents="none">
        <Text style={styles.tip}>Face the camera in soft natural daylight</Text>
      </View>
      <View style={styles.controls}>
        <Pressable onPress={onCancel} style={styles.sideButton} accessibilityLabel="Cancel camera">
          <Feather name="x" size={23} color={colors.onAccent} />
        </Pressable>
        <Pressable
          onPress={takePhoto}
          disabled={isTakingPhoto}
          style={({ pressed }) => [styles.shutterOuter, (pressed || isTakingPhoto) && styles.pressed]}
          accessibilityLabel="Take photo"
        >
          {isTakingPhoto ? <ActivityIndicator color={colors.onAccent} /> : <View style={styles.shutterInner} />}
        </Pressable>
        <View style={styles.sidePlaceholder} />
      </View>
    </View>
  );
}

const createStyles = (colors: StyleUColors) =>
  StyleSheet.create({
  container: { flex: 1, minHeight: 420, overflow: 'hidden', backgroundColor: '#000', borderRadius: 24 },
  camera: StyleSheet.absoluteFill,
  faceGuide: {
    position: 'absolute', alignSelf: 'center', top: '13%', width: '66%', height: '61%',
    borderRadius: 160, borderWidth: 2, borderColor: 'rgba(255,255,255,0.8)',
  },
  tipContainer: { position: 'absolute', top: 18, left: 16, right: 16, alignItems: 'center' },
  tip: { color: colors.onAccent, fontSize: 13, fontWeight: '700', backgroundColor: colors.scrim, borderRadius: 14, paddingHorizontal: 12, paddingVertical: 7 },
  controls: { position: 'absolute', bottom: 22, left: 24, right: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  shutterOuter: { width: 76, height: 76, borderRadius: 38, borderWidth: 3, borderColor: colors.onAccent, alignItems: 'center', justifyContent: 'center' },
  shutterInner: { width: 60, height: 60, borderRadius: 30, backgroundColor: colors.accent },
  sideButton: { width: 46, height: 46, borderRadius: 23, backgroundColor: colors.scrim, alignItems: 'center', justifyContent: 'center' },
  sidePlaceholder: { width: 46 },
  pressed: { opacity: 0.7 },
  loader: { flex: 1 },
  permissionCard: { flex: 1, minHeight: 380, backgroundColor: colors.surface, borderRadius: 24, alignItems: 'center', justifyContent: 'center', padding: 28, gap: 14 },
  permissionTitle: { color: colors.text, fontSize: 20, fontWeight: '700' },
  permissionText: { color: colors.mutedText, textAlign: 'center', fontSize: 15, lineHeight: 22 },
  permissionButton: { backgroundColor: colors.accent, borderRadius: 18, paddingVertical: 14, paddingHorizontal: 26, marginTop: 8 },
  buttonLabel: { color: colors.buttonText, fontSize: 16, fontWeight: '700' },
  cancelLabel: { color: colors.mutedText, fontSize: 15, fontWeight: '600', padding: 8 },
});

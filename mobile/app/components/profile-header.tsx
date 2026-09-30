import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, StyleSheet, TouchableOpacity, View } from 'react-native';

import type { Profile } from '../../src/profile/profile-service';
import { ThemedText } from './themed-text';

type ProfileHeaderProps = {
  /** The signed-in user's email, from their auth account. */
  email: string | null | undefined;
  /** The signed-in user's own profile, or null while loading or if it could not be loaded. */
  profile: Profile | null;
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
};

/** The signed-in user's avatar, name and email, shared by the Profile and Saved tabs. */
export function ProfileHeader({ email, profile, isLoading, error, onRetry }: ProfileHeaderProps) {
  return (
    <View style={styles.userRow}>
      <View style={styles.avatar}>
        <Ionicons name="person-outline" size={26} />
      </View>
      {isLoading ? (
        <ActivityIndicator />
      ) : profile ? (
        <View style={styles.details}>
          <ThemedText type="subtitle">{profile.display_name?.trim() || 'Add your name in Settings'}</ThemedText>
          {email ? <ThemedText style={styles.muted}>{email}</ThemedText> : null}
        </View>
      ) : (
        <View style={styles.details}>
          <ThemedText type="subtitle">{error ? "Couldn't load your profile" : 'Profile not found'}</ThemedText>
          {error ? <ThemedText style={styles.muted}>{error}</ThemedText> : null}
          <TouchableOpacity onPress={onRetry}>
            <ThemedText style={styles.retry}>Try again</ThemedText>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(0,0,0,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  details: {
    flex: 1,
  },
  muted: {
    opacity: 0.6,
    fontSize: 13,
  },
  retry: {
    color: '#C97B63',
    fontWeight: '600',
    fontSize: 13,
    marginTop: 4,
  },
});

import {ActivityIndicator, Alert, Modal, Pressable, ScrollView, Switch, TextInput, TouchableOpacity, View, StyleSheet} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';

import { ThemedView } from '../../components/themed-view';
import { ThemedText } from '../../components/themed-text';
import { PrimaryButton } from '../../components/primary-button';

import { signOut } from '../../../src/auth/auth-service';
import { useProfile } from '../../../src/profile/use-profile';
import { router } from 'expo-router';

// Only the toggles below are local UI state. There are no database fields for
// them yet, so they are not saved anywhere. Account details (display name,
// email) come from the signed-in user's profile and auth account instead.
type SettingsState = {
  preferences: {
    notifications: boolean;
    darkMode: boolean;
    language: string;
  };
  privacy: {
    profileVisibility: boolean;
    dataSharing: boolean;
  };
};

const initialSettingsState: SettingsState = {
  preferences: {
    notifications: true,
    darkMode: false,
    language: 'English',
  },
  privacy: {
    profileVisibility: true,
    dataSharing: false,
  },
};

const languageOptions = [
  'English',
  'Spanish',
  'French',
  'German',
  'Japanese',
];

export default function SettingsScreen() {
  const { user, profile, error, isLoading, refetch, update } = useProfile();

  const [settings, setSettings] =
    useState<SettingsState>(initialSettingsState);

  const [languageModalVisible, setLanguageModalVisible] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [saving, setSaving] = useState(false);

  // The unsaved display name, tagged with the account it was typed for so a
  // draft can never carry over to a different signed-in user.
  const [nameDraft, setNameDraft] = useState<{ userId: string; text: string } | null>(null);

  const savedName = profile?.display_name ?? '';
  const displayName =
    nameDraft && nameDraft.userId === user?.id ? nameDraft.text : savedName;
  const hasNameChange = Boolean(profile) && displayName.trim() !== savedName.trim();

  const updateSettings = <K extends keyof SettingsState>(
    section: K,
    values: Partial<SettingsState[K]>
  ) => {
    setSettings((current) => ({
      ...current,
      [section]: {
        ...(current[section] as object),
        ...values,
      },
    }));
  };

  const handleSave = async () => {
    const name = displayName.trim();

    if (!name) {
      Alert.alert('Display Name Required', 'Please enter a display name.');
      return;
    }

    setSaving(true);

    try {
      // useProfile scopes the update to profiles.user_id = the signed-in user's id.
      await update({ display_name: name });
      setNameDraft(null);
      Alert.alert('Changes Saved', 'Your display name has been updated.');
    } catch (saveError) {
      Alert.alert(
        'Unable to Save',
        saveError instanceof Error ? saveError.message : 'An unexpected error occurred.'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: async () => {
          setLoggingOut(true);

          try {
            const { error } = await signOut();

            if (error) {
              setLoggingOut(false);
              Alert.alert('Unable to Log Out', error.message);
              return;
            }

            // `replace` only swaps this screen, leaving Profile and Home underneath for
            // Back to return to. Clear the whole authenticated history first, then
            // rebuild the logged-out stack as Welcome > Login.
            if (router.canDismiss()) router.dismissAll();
            router.replace('/');
            router.push('/login');
          } catch (error) {
            setLoggingOut(false);

            Alert.alert(
              'Unable to Log Out',
              error instanceof Error
                ? error.message
                : 'An unexpected error occurred.'
            );
          }
        },
      },
    ]);
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <TouchableOpacity>
              <Ionicons name="search-outline" size={22} />
            </TouchableOpacity>

            <ThemedText type="title">Settings</ThemedText>

            <View style={styles.headerSpacer} />
          </View>

          <Section title="Profile">
            <View style={styles.profileRow}>
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="person-outline" size={24} />
              </View>

              <View style={styles.profileInfo}>
                {isLoading ? (
                  <ActivityIndicator />
                ) : (
                  <>
                    <ThemedText type="subtitle">
                      {profile
                        ? savedName.trim() || 'Add your name below'
                        : 'Profile unavailable'}
                    </ThemedText>

                    {user?.email ? (
                      <ThemedText style={styles.muted}>
                        {user.email}
                      </ThemedText>
                    ) : null}
                  </>
                )}
              </View>
            </View>
          </Section>

          <Section title="Account Settings">
            {isLoading ? (
              <View style={[styles.statusRow, styles.rowBorder]}>
                <ActivityIndicator />
              </View>
            ) : !profile ? (
              <View style={[styles.statusRow, styles.rowBorder]}>
                <ThemedText style={styles.muted}>
                  {error ?? 'Your profile could not be found.'}
                </ThemedText>

                <TouchableOpacity onPress={refetch}>
                  <ThemedText style={styles.link}>
                    Try again
                  </ThemedText>
                </TouchableOpacity>
              </View>
            ) : (
              <EditableRow
                label="Display Name"
                value={displayName}
                onChangeText={(text) => {
                  if (user) setNameDraft({ userId: user.id, text });
                }}
                placeholder="Enter your name"
                autoCapitalize="words"
              />
            )}

            <ReadOnlyRow
              label="Email"
              value={user?.email ?? 'Not available'}
              last
            />
          </Section>

          <Section title="Preferences">
            <ToggleRow
              label="Notifications"
              description="Push alerts and email updates"
              value={settings.preferences.notifications}
              onValueChange={(notifications) =>
                updateSettings('preferences', { notifications })
              }
            />

            <ToggleRow
              label="Dark Mode"
              description="Switch to a darker interface"
              value={settings.preferences.darkMode}
              onValueChange={(darkMode) =>
                updateSettings('preferences', { darkMode })
              }
            />

            <ChevronRow
              label="Language"
              description="Choose your preferred language"
              value={settings.preferences.language}
              onPress={() => setLanguageModalVisible(true)}
              last
            />
          </Section>

          <Section title="Privacy">
            <ToggleRow
              label="Profile Visibility"
              description="Control who can see your profile"
              value={settings.privacy.profileVisibility}
              onValueChange={(profileVisibility) =>
                updateSettings('privacy', { profileVisibility })
              }
            />

            <ToggleRow
              label="Data Sharing"
              description="Allow anonymous usage insights"
              value={settings.privacy.dataSharing}
              onValueChange={(dataSharing) =>
                updateSettings('privacy', { dataSharing })
              }
              last
            />
          </Section>

          {hasNameChange && (
            <TouchableOpacity
              style={[styles.saveButton, saving && styles.saveButtonDisabled]}
              onPress={handleSave}
              disabled={saving}
              activeOpacity={0.8}
            >
              <ThemedText style={styles.saveText}>
                {saving ? 'Saving…' : 'Save Changes'}
              </ThemedText>
            </TouchableOpacity>
          )}

         <PrimaryButton
          label={loggingOut ? 'Logging Out…' : 'Log Out'}
          onPress={handleLogout}
          disabled={loggingOut}
        />
        </ScrollView>

        <Modal
          visible={languageModalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setLanguageModalVisible(false)}
        >
          <Pressable
            style={styles.modalOverlay}
            onPress={() => setLanguageModalVisible(false)}
          >
            <Pressable
              style={styles.languageModal}
              onPress={(event) => event.stopPropagation()}
            >
              <ThemedText type="subtitle" style={styles.modalTitle}>
                Choose Language
              </ThemedText>

              {languageOptions.map((language) => (
                <TouchableOpacity
                  key={language}
                  style={styles.languageOption}
                  onPress={() => {
                    updateSettings('preferences', { language });
                    setLanguageModalVisible(false);
                  }}
                >
                  <ThemedText>{language}</ThemedText>

                  {settings.preferences.language === language && (
                    <Ionicons
                      name="checkmark"
                      size={20}
                      color="#C97B63"
                    />
                  )}
                </TouchableOpacity>
              ))}
            </Pressable>
          </Pressable>
        </Modal>
      </SafeAreaView>
    </ThemedView>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <View style={styles.section}>
      <ThemedText style={styles.sectionTitle}>
        {title}
      </ThemedText>

      <View style={styles.sectionBody}>{children}</View>
    </View>
  );
}

function EditableRow({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  autoCapitalize,
  last,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  keyboardType?: 'default' | 'email-address' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  last?: boolean;
}) {
  return (
    <View style={[styles.editableRow, !last && styles.rowBorder]}>
      <ThemedText style={styles.inputLabel}>
        {label}
      </ThemedText>

      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        style={styles.input}
        placeholderTextColor="rgba(0,0,0,0.35)"
      />
    </View>
  );
}

function ReadOnlyRow({
  label,
  value,
  last,
}: {
  label: string;
  value: string;
  last?: boolean;
}) {
  return (
    <View style={[styles.editableRow, !last && styles.rowBorder]}>
      <ThemedText style={styles.inputLabel}>
        {label}
      </ThemedText>

      <ThemedText style={styles.readOnlyValue}>
        {value}
      </ThemedText>
    </View>
  );
}

function ToggleRow({
  label,
  description,
  value,
  onValueChange,
  last,
}: {
  label: string;
  description: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  last?: boolean;
}) {
  return (
    <View style={[styles.row, !last && styles.rowBorder]}>
      <View style={styles.rowContent}>
        <ThemedText type="subtitle">{label}</ThemedText>

        <ThemedText style={styles.muted}>
          {description}
        </ThemedText>
      </View>

      <Switch
        value={value}
        onValueChange={onValueChange}
      />
    </View>
  );
}

function ChevronRow({
  label,
  description,
  value,
  onPress,
  last,
}: {
  label: string;
  description: string;
  value: string;
  onPress: () => void;
  last?: boolean;
}) {
  return (
    <TouchableOpacity
      style={[styles.row, !last && styles.rowBorder]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.rowContent}>
        <ThemedText type="subtitle">{label}</ThemedText>

        <ThemedText style={styles.muted}>
          {description}
        </ThemedText>
      </View>

      <View style={styles.chevronValue}>
        <ThemedText style={styles.muted}>
          {value}
        </ThemedText>

        <Ionicons name="chevron-forward" size={16} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  safeArea: {
    flex: 1,
  },

  content: {
    padding: 20,
    gap: 24,
    paddingBottom: 100,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  headerSpacer: {
    width: 22,
  },

  muted: {
    opacity: 0.6,
    fontSize: 13,
  },

  link: {
    color: '#C97B63',
    fontWeight: '600',
    fontSize: 13,
  },

  section: {
    gap: 8,
  },

  sectionTitle: {
    fontWeight: '600',
    fontSize: 13,
    opacity: 0.5,
    textTransform: 'uppercase',
  },

  sectionBody: {
    backgroundColor: 'rgba(0,0,0,0.03)',
    borderRadius: 16,
    paddingHorizontal: 16,
  },

  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 16,
  },

  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0,0,0,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },

  profileInfo: {
    flex: 1,
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
  },

  editableRow: {
    paddingVertical: 12,
  },

  rowContent: {
    flex: 1,
    paddingRight: 12,
  },

  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.06)',
  },

  inputLabel: {
    fontSize: 12,
    opacity: 0.55,
    marginBottom: 4,
  },

  input: {
    fontSize: 15,
    paddingVertical: 2,
    paddingHorizontal: 0,
  },

  readOnlyValue: {
    fontSize: 15,
    paddingVertical: 2,
    opacity: 0.6,
  },

  statusRow: {
    paddingVertical: 12,
    gap: 8,
  },

  chevronValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  saveButton: {
    backgroundColor: '#C97B63',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },

  saveButtonDisabled: {
    opacity: 0.6,
  },

  saveText: {
    fontWeight: '600',
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    padding: 24,
  },

  languageModal: {
    backgroundColor: '#F6FAF0',
    borderRadius: 20,
    padding: 20,
  },

  modalTitle: {
    marginBottom: 12,
  },

  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.06)',
  },
});

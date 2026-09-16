import {Alert, Image, Modal, Pressable, ScrollView, Switch, TextInput, TouchableOpacity, View, StyleSheet} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';

import { ThemedView } from '../../components/themed-view';
import { ThemedText } from '../../components/themed-text';
import { PrimaryButton } from '../../components/primary-button';

import { signOut } from '../../../src/auth/auth-service';
import { router } from 'expo-router';

type SettingsState = {
  profile: {
    name: string;
    photoUri: string | null;
  };
  account: {
    username: string;
    email: string;
    password: string;
    phoneNumber: string;
  };
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

  // Dummy data for now; in a real app, this would be fetched from the backend
  profile: {
    name: 'Amanda Smith',
    photoUri: null,
  },
  account: {
    username: 'amanda_designs',
    email: 'amanda@designs.co',
    password: 'password123',
    phoneNumber: '+1 (555) 014-2288',
  },
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
  const [settings, setSettings] =
    useState<SettingsState>(initialSettingsState);

  const [showPassword, setShowPassword] = useState(false);
  const [languageModalVisible, setLanguageModalVisible] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

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

    setHasChanges(true);
  };

  const handleSave = () => {
    /*
     * FUTURE DATABASE IMPLEMENTATION:
     *
     * This is where the settings object can be sent to Supabase.
     *
     * Example:
     *
     * await supabase
     *   .from('profiles')
     *   .update({
     *     username: settings.account.username,
     *     email: settings.account.email,
     *     phone_number: settings.account.phoneNumber,
     *     ...
     *   })
     *   .eq('id', user.id);
     *
     * Keeping the UI state separate from the database makes
     * the screen easier to connect to a backend later.
     */

    setHasChanges(false);

    Alert.alert(
      'Changes Saved',
      'Your settings have been updated locally. Database saving can be connected later.'
    );
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

            router.replace('/login');
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
              <TouchableOpacity
                style={styles.avatarPlaceholder}
                onPress={() => {
                  // Future: open image picker here
                  Alert.alert(
                    'Profile Photo',
                    'Photo selection can be connected here later.'
                  );
                }}
              >
                {settings.profile.photoUri ? (
                  <Image
                    source={{ uri: settings.profile.photoUri }}
                    style={styles.avatar}
                  />
                ) : (
                  <Ionicons name="person-outline" size={24} />
                )}
              </TouchableOpacity>

              <View style={styles.profileInfo}>
                <ThemedText type="subtitle">
                  {settings.profile.name}
                </ThemedText>

                <ThemedText style={styles.muted}>
                  Manage your account photo
                </ThemedText>
              </View>

              <TouchableOpacity
                onPress={() => {
                  Alert.alert(
                    'Profile Photo',
                    'Photo selection can be connected here later.'
                  );
                }}
              >
                <ThemedText style={styles.link}>
                  Change Photo
                </ThemedText>
              </TouchableOpacity>
            </View>
          </Section>

          <Section title="Account Settings">
            <EditableRow
              label="Username"
              value={settings.account.username}
              onChangeText={(username) =>
                updateSettings('account', { username })
              }
              placeholder="Enter username"
              autoCapitalize="none"
            />

            <EditableRow
              label="Email"
              value={settings.account.email}
              onChangeText={(email) =>
                updateSettings('account', { email })
              }
              placeholder="Enter email"
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <PasswordRow
              value={settings.account.password}
              showPassword={showPassword}
              onToggleVisibility={() =>
                setShowPassword((current) => !current)
              }
              onChangeText={(password) =>
                updateSettings('account', { password })
              }
            />

            <EditableRow
              label="Phone Number"
              value={settings.account.phoneNumber}
              onChangeText={(phoneNumber) =>
                updateSettings('account', { phoneNumber })
              }
              placeholder="Enter phone number"
              keyboardType="phone-pad"
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

          {hasChanges && (
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSave}
              activeOpacity={0.8}
            >
              <ThemedText style={styles.saveText}>
                Save Changes
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

function PasswordRow({
  value,
  showPassword,
  onToggleVisibility,
  onChangeText,
}: {
  value: string;
  showPassword: boolean;
  onToggleVisibility: () => void;
  onChangeText: (value: string) => void;
}) {
  return (
    <View style={[styles.editableRow, styles.rowBorder]}>
      <ThemedText style={styles.inputLabel}>
        Password
      </ThemedText>

      <View style={styles.passwordContainer}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={!showPassword}
          style={styles.passwordInput}
          placeholder="Enter password"
          placeholderTextColor="rgba(0,0,0,0.35)"
        />

        <TouchableOpacity onPress={onToggleVisibility}>
          <Ionicons
            name={showPassword ? 'eye-off-outline' : 'eye-outline'}
            size={20}
            opacity={0.6}
          />
        </TouchableOpacity>
      </View>
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

  avatar: {
    width: '100%',
    height: '100%',
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

  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  passwordInput: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 2,
    paddingHorizontal: 0,
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

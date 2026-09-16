import { ScrollView, View, TouchableOpacity, Switch, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedView } from '../../components/themed-view';
import { ThemedText } from '../../components/themed-text';
import { BottomNavBar } from '../../components/bottom-nav-bar';

export default function SettingsScreen() {
  return (
    <ThemedView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity>
            <Ionicons name="search-outline" size={22} />
          </TouchableOpacity>
          <ThemedText type="title">Settings</ThemedText>
          <View style={{ width: 22 }} />
        </View>

        {/* Profile section */}
        <Section title="Profile">
          <View style={styles.profileRow}>
            <View style={styles.avatarPlaceholder}>
              <Ionicons name="person-outline" size={24} />
            </View>
            <View style={{ flex: 1 }}>
              <ThemedText type="subtitle">Amanda Smith</ThemedText>
              <ThemedText style={styles.muted}>Manage your account photo</ThemedText>
            </View>
            <TouchableOpacity>
              <ThemedText style={styles.link}>Change Photo</ThemedText>
            </TouchableOpacity>
          </View>
        </Section>

        {/* Account settings */}
        <Section title="Account Settings">
          <ValueRow label="Username" value="amanda_designs" />
          <ValueRow label="Email" value="amanda@designs.co" />
          <ValueRow label="Password" value="••••••••••••" />
          <ValueRow label="Phone Number" value="+1 (555) 014-2288" last />
        </Section>

        {/* Preferences */}
        <Section title="Preferences">
          <ToggleRow
            label="Notifications"
            description="Push alerts and email updates"
            value={true}
          />
          <ToggleRow
            label="Dark Mode"
            description="Switch to a darker interface"
            value={false}
          />
          <ChevronRow
            label="Language"
            description="Choose your preferred language"
            value="English"
            last
          />
        </Section>

        {/* Privacy */}
        <Section title="Privacy">
          <ToggleRow
            label="Profile Visibility"
            description="Control who can see your profile"
            value={true}
          />
          <ToggleRow
            label="Data Sharing"
            description="Allow anonymous usage insights"
            value={false}
            last
          />
        </Section>

        {/* Log out */}
        <TouchableOpacity style={styles.logoutButton}>
          <ThemedText style={styles.logoutText}>Log Out</ThemedText>
        </TouchableOpacity>
      </ScrollView>
      <BottomNavBar />
    </ThemedView>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <ThemedText style={styles.sectionTitle}>{title}</ThemedText>
      <View style={styles.sectionBody}>{children}</View>
    </View>
  );
}

function ValueRow({
  label,
  value,
  last,
}: {
  label: string;
  value: string;
  last?: boolean;
}) {
  return (
    <View style={[styles.row, !last && styles.rowBorder]}>
      <ThemedText style={styles.muted}>{label}</ThemedText>
      <ThemedText>{value}</ThemedText>
    </View>
  );
}

function ToggleRow({
  label,
  description,
  value,
  last,
}: {
  label: string;
  description: string;
  value: boolean;
  last?: boolean;
}) {
  return (
    <View style={[styles.row, !last && styles.rowBorder]}>
      <View style={{ flex: 1 }}>
        <ThemedText type="subtitle">{label}</ThemedText>
        <ThemedText style={styles.muted}>{description}</ThemedText>
      </View>
      <Switch value={value} />
    </View>
  );
}

function ChevronRow({
  label,
  description,
  value,
  last,
}: {
  label: string;
  description: string;
  value: string;
  last?: boolean;
}) {
  return (
    <TouchableOpacity style={[styles.row, !last && styles.rowBorder]}>
      <View style={{ flex: 1 }}>
        <ThemedText type="subtitle">{label}</ThemedText>
        <ThemedText style={styles.muted}>{description}</ThemedText>
      </View>
      <View style={styles.chevronValue}>
        <ThemedText style={styles.muted}>{value}</ThemedText>
        <Ionicons name="chevron-forward" size={16} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
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
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.06)',
  },
  chevronValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  logoutButton: {
    backgroundColor: '#EBB6A2',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  logoutText: {
    fontWeight: '600',
  },
});
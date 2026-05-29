import { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import client from '../api/client';
import { useTheme } from '../theme/ThemeContext';
import { themes, type ThemeName } from '../theme/themes';

const THEME_OPTIONS: { name: ThemeName; label: string; preview: string }[] = [
  { name: 'light',    label: 'Light',     preview: '#f2f2f7' },
  { name: 'dark',     label: 'Dark',      preview: '#1c1c1e' },
  { name: 'darkBlue', label: 'Dark Blue', preview: '#17212b' },
  { name: 'green',    label: 'Green',     preview: '#111b21' },
];

export default function ProfileScreen() {
  const { theme, setTheme } = useTheme();
  const s = makeStyles(theme);

  const [username, setUsername] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [email, setEmail] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [themePickerOpen, setThemePickerOpen] = useState(false);

  useEffect(() => {
    client.get('/users/me').then((res) => {
      setUsername(res.data.username);
      setNewUsername(res.data.username);
      setEmail(res.data.email);
      setNewEmail(res.data.email);
    }).finally(() => setFetching(false));
  }, []);

  const save = async () => {
    const body: { username?: string; email?: string; password?: string } = {};
    if (newUsername.trim() && newUsername !== username) body.username = newUsername.trim();
    if (newEmail.trim() && newEmail !== email) body.email = newEmail.trim();
    if (password.trim()) body.password = password.trim();
    if (!Object.keys(body).length) {
      Alert.alert('No changes to save');
      return;
    }
    setLoading(true);
    try {
      await client.patch('/users/me', body);
      setUsername(newUsername);
      setEmail(newEmail);
      setPassword('');
      Alert.alert('Profile updated');
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.message ?? 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <SafeAreaView style={[s.safe, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <ScrollView contentContainerStyle={s.container} keyboardShouldPersistTaps="handled">
        <Text style={s.title}>Profile</Text>

        {/* Account fields */}
        <View style={s.card}>
          <Text style={s.label}>Username</Text>
          <TextInput
            style={s.input}
            value={newUsername}
            onChangeText={setNewUsername}
            autoCapitalize="none"
            placeholder="Username"
            placeholderTextColor={theme.placeholder}
          />
          <Text style={s.label}>Email</Text>
          <TextInput
            style={s.input}
            value={newEmail}
            onChangeText={setNewEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="Email"
            placeholderTextColor={theme.placeholder}
          />
          <Text style={s.label}>New Password</Text>
          <TextInput
            style={s.input}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="Leave blank to keep current"
            placeholderTextColor={theme.placeholder}
          />
        </View>

        <TouchableOpacity
          style={[s.saveButton, loading && s.saveButtonDisabled]}
          onPress={save}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={s.saveButtonText}>Save Changes</Text>}
        </TouchableOpacity>

        {/* Theme picker */}
        <Text style={s.sectionTitle}>Appearance</Text>
        <TouchableOpacity style={s.card} onPress={() => setThemePickerOpen(true)} activeOpacity={0.7}>
          <View style={s.themeRow}>
            <View>
              <Text style={s.themeRowLabel}>Theme</Text>
              <Text style={s.themeRowValue}>{themes[theme.name].label}</Text>
            </View>
            <View style={[s.themePreviewDot, { backgroundColor: THEME_OPTIONS.find(t => t.name === theme.name)?.preview }]} />
          </View>
        </TouchableOpacity>
      </ScrollView>

      {/* Theme picker modal */}
      <Modal visible={themePickerOpen} transparent animationType="fade" onRequestClose={() => setThemePickerOpen(false)}>
        <TouchableOpacity style={s.modalBackdrop} activeOpacity={1} onPress={() => setThemePickerOpen(false)}>
          <View style={s.modalSheet}>
            <Text style={s.modalTitle}>Choose Theme</Text>
            {THEME_OPTIONS.map((opt) => {
              const active = theme.name === opt.name;
              return (
                <TouchableOpacity
                  key={opt.name}
                  style={[s.themeOption, active && s.themeOptionActive]}
                  onPress={() => { setTheme(opt.name); setThemePickerOpen(false); }}
                >
                  <View style={[s.optionDot, { backgroundColor: opt.preview }]} />
                  <Text style={[s.optionLabel, active && { color: theme.primary, fontWeight: '700' }]}>
                    {opt.label}
                  </Text>
                  {active && <Text style={[s.checkmark, { color: theme.primary }]}>✓</Text>}
                </TouchableOpacity>
              );
            })}
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

function makeStyles(theme: ReturnType<typeof useTheme>['theme']) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: theme.background },
    container: { padding: 24 },
    title: { fontSize: 28, fontWeight: '700', marginBottom: 24, color: theme.text },
    sectionTitle: { fontSize: 13, fontWeight: '600', color: theme.subtext, marginBottom: 8, marginTop: 24, textTransform: 'uppercase', letterSpacing: 0.5 },
    card: {
      backgroundColor: theme.card,
      borderRadius: 12,
      padding: 16,
      marginBottom: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.08,
      shadowRadius: 4,
      elevation: 2,
    },
    label: { fontSize: 13, fontWeight: '600', color: theme.subtext, marginBottom: 6, marginTop: 12 },
    input: {
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 8,
      padding: 12,
      fontSize: 16,
      color: theme.text,
      backgroundColor: theme.inputBackground,
    },
    saveButton: {
      backgroundColor: theme.primary,
      borderRadius: 12,
      padding: 16,
      alignItems: 'center',
      marginBottom: 4,
    },
    saveButtonDisabled: { opacity: 0.6 },
    saveButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
    themeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    themeRowLabel: { fontSize: 16, color: theme.text, fontWeight: '500' },
    themeRowValue: { fontSize: 13, color: theme.subtext, marginTop: 2 },
    themePreviewDot: { width: 28, height: 28, borderRadius: 14, borderWidth: 2, borderColor: theme.border },
    modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalSheet: {
      backgroundColor: theme.card,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      padding: 24,
      paddingBottom: 40,
    },
    modalTitle: { fontSize: 18, fontWeight: '700', color: theme.text, marginBottom: 16 },
    themeOption: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 14,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.border,
    },
    themeOptionActive: { backgroundColor: 'transparent' },
    optionDot: { width: 24, height: 24, borderRadius: 12, marginRight: 14, borderWidth: 1, borderColor: theme.border },
    optionLabel: { flex: 1, fontSize: 16, color: theme.text },
    checkmark: { fontSize: 18, fontWeight: '700' },
  });
}

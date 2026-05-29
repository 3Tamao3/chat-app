import { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
  Button,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import client from '../api/client';
import { getToken } from '../utils/storage';
import { jwtDecode } from 'jwt-decode';
import { decrypt } from '../utils/crypto';
import type { RootStackParamList } from '../../App';

type Nav = NativeStackNavigationProp<RootStackParamList>;

type Chat = {
  id: string;
  user1: { id: string; username: string };
  user2: { id: string; username: string };
  lastMessage: string | null;
};

type User = { id: string; username: string };

export default function ChatListScreen() {
  const navigation = useNavigation<Nav>();
  const [chats, setChats] = useState<Chat[]>([]);
  const [myId, setMyId] = useState('');
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<User[]>([]);

  useEffect(() => {
    const load = async () => {
      const token = await getToken();
      if (token) {
        const decoded = jwtDecode<{ sub: string }>(token);
        setMyId(decoded.sub);
      }
      const res = await client.get('/chats');
      setChats(res.data);
    };
    load();
  }, []);

  const handleSearch = async () => {
    if (!search.trim()) return;
    try {
      const res = await client.get(`/users/search?username=${search}`);
      setResults(res.data);
    } catch {
      Alert.alert('Search failed');
    }
  };

  const startChat = async (otherUser: User) => {
    try {
      const res = await client.post('/chats/create-or-get', { userId: otherUser.id });
      setResults([]);
      setSearch('');
      navigation.navigate('ChatScreen', {
        chatId: res.data.id,
        otherUsername: otherUser.username,
      });
    } catch {
      Alert.alert('Could not start chat');
    }
  };

  const getOther = (chat: Chat) =>
    chat.user1.id === myId ? chat.user2 : chat.user1;

  return (
    <View style={styles.container}>
      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search users..."
          value={search}
          onChangeText={setSearch}
        />
        <Button title="Search" onPress={handleSearch} />
      </View>

      {results.length > 0 && (
        <View style={styles.results}>
          {results.map((u) => (
            <TouchableOpacity key={u.id} style={styles.resultRow} onPress={() => startChat(u)}>
              <Text>{u.username}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <FlatList
        data={chats}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const other = getOther(item);
          return (
            <TouchableOpacity
              style={styles.row}
              onPress={() =>
                navigation.navigate('ChatScreen', {
                  chatId: item.id,
                  otherUsername: other.username,
                })
              }
            >
              <Text style={styles.name}>{other.username}</Text>
              <Text style={styles.last}>{item.lastMessage ? (decrypt(item.lastMessage, item.id) || item.lastMessage) : 'No messages yet'}</Text>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  searchRow: { flexDirection: 'row', marginBottom: 8, alignItems: 'center' },
  searchInput: { flex: 1, borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, marginRight: 8 },
  results: { backgroundColor: '#f9f9f9', borderRadius: 8, marginBottom: 8 },
  resultRow: { padding: 12, borderBottomWidth: 1, borderColor: '#eee' },
  row: { paddingVertical: 14, borderBottomWidth: 1, borderColor: '#eee' },
  name: { fontSize: 16, fontWeight: '600' },
  last: { color: '#888', marginTop: 2 },
});

import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Button } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import client from '../api/client';
import { getToken, removeToken } from '../utils/storage';
import { jwtDecode } from 'jwt-decode';
import type { RootStackParamList } from '../../App';

type Props = NativeStackScreenProps<RootStackParamList, 'ChatList'>;

type Chat = {
  id: string;
  user1: { id: string; username: string };
  user2: { id: string; username: string };
  lastMessage: string | null;
};

export default function ChatListScreen({ navigation }: Props) {
  const [chats, setChats] = useState<Chat[]>([]);
  const [myId, setMyId] = useState('');

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

  const logout = async () => {
    await removeToken();
    navigation.replace('Login');
  };

  const getOther = (chat: Chat) =>
    chat.user1.id === myId ? chat.user2 : chat.user1;

  return (
    <View style={styles.container}>
      <Button title="Logout" onPress={logout} />
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
              <Text style={styles.last}>{item.lastMessage ?? 'No messages yet'}</Text>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  row: { paddingVertical: 14, borderBottomWidth: 1, borderColor: '#eee' },
  name: { fontSize: 16, fontWeight: '600' },
  last: { color: '#888', marginTop: 2 },
});

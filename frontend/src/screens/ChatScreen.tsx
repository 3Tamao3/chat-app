import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { io, Socket } from 'socket.io-client';
import client from '../api/client';
import { getToken } from '../utils/storage';
import { jwtDecode } from 'jwt-decode';
import { encrypt, decrypt } from '../utils/crypto';
import type { RootStackParamList } from '../../App';

type Props = NativeStackScreenProps<RootStackParamList, 'ChatScreen'>;

type Message = {
  id: string;
  content: string;
  senderId: string;
  createdAt: string;
};

export default function ChatScreen({ route }: Props) {
  const { chatId, otherUsername: _otherUsername } = route.params;
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const [myId, setMyId] = useState('');
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const init = async () => {
      const token = await getToken();
      if (!token) return;

      const decoded = jwtDecode<{ sub: string }>(token);
      setMyId(decoded.sub);

      const res = await client.get(`/messages/${chatId}`);
      const decrypted = res.data.map((m: Message) => ({
        ...m,
        content: decrypt(m.content, chatId),
      }));
      setMessages(decrypted);

      const socket = io('http://192.168.0.249:3000');
      socketRef.current = socket;
      socket.emit('joinChat', chatId);
      socket.on('newMessage', (msg: Message) => {
        setMessages((prev) => [...prev, { ...msg, content: decrypt(msg.content, chatId) }]);
      });
    };

    init();

    return () => {
      socketRef.current?.disconnect();
    };
  }, [chatId]);

  const send = async () => {
    if (!text.trim()) return;
    const encrypted = encrypt(text, chatId);
    await client.post('/messages/send', { chatId, content: encrypted });
    setText('');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View
            style={[
              styles.bubble,
              item.senderId === myId ? styles.mine : styles.theirs,
            ]}
          >
            <Text style={[styles.bubbleText, item.senderId === myId && styles.bubbleTextMine]}>
              {item.content}
            </Text>
          </View>
        )}
      />
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={text}
          onChangeText={setText}
          placeholder="Message"
        />
        <Button title="Send" onPress={send} />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  bubble: { margin: 8, padding: 10, borderRadius: 12, maxWidth: '75%' },
  mine: { backgroundColor: '#007AFF', alignSelf: 'flex-end' },
  theirs: { backgroundColor: '#eee', alignSelf: 'flex-start' },
  bubbleText: { color: '#000' },
  bubbleTextMine: { color: '#fff' },
  inputRow: { flexDirection: 'row', padding: 8, alignItems: 'center', borderTopWidth: 1, borderColor: '#eee' },
  input: { flex: 1, borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, marginRight: 8 },
});

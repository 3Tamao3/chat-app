import { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
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
import { useTheme } from '../theme/ThemeContext';
import type { RootStackParamList } from '../../App';

type Props = NativeStackScreenProps<RootStackParamList, 'ChatScreen'>;

type Message = {
  id: string;
  content: string;
  senderId: string;
  createdAt: string;
};

export default function ChatScreen({ route }: Props) {
  const { theme } = useTheme();
  const s = makeStyles(theme);

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

  const send = () => {
    if (!text.trim() || !socketRef.current) return;
    const encrypted = encrypt(text, chatId);
    socketRef.current.emit('sendMessage', { chatId, senderId: myId, content: encrypted });
    setText('');
  };

  return (
    <KeyboardAvoidingView
      style={s.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={[s.bubble, item.senderId === myId ? s.mine : s.theirs]}>
            <Text style={[s.bubbleText, item.senderId === myId ? s.bubbleTextMine : s.bubbleTextTheirs]}>
              {item.content}
            </Text>
          </View>
        )}
      />
      <View style={s.inputRow}>
        <TextInput
          style={s.input}
          value={text}
          onChangeText={setText}
          placeholder="Message"
          placeholderTextColor={theme.placeholder}
        />
        <TouchableOpacity style={s.sendButton} onPress={send}>
          <Text style={s.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

function makeStyles(theme: ReturnType<typeof useTheme>['theme']) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.background },
    bubble: { margin: 8, padding: 10, borderRadius: 12, maxWidth: '75%' },
    mine: { backgroundColor: theme.bubbleMine, alignSelf: 'flex-end' },
    theirs: { backgroundColor: theme.bubbleTheirs, alignSelf: 'flex-start' },
    bubbleText: { fontSize: 15 },
    bubbleTextMine: { color: theme.bubbleTextMine },
    bubbleTextTheirs: { color: theme.bubbleTextTheirs },
    inputRow: {
      flexDirection: 'row',
      padding: 8,
      alignItems: 'center',
      borderTopWidth: StyleSheet.hairlineWidth,
      borderColor: theme.border,
      backgroundColor: theme.card,
    },
    input: {
      flex: 1,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 20,
      paddingHorizontal: 14,
      paddingVertical: 8,
      marginRight: 8,
      color: theme.text,
      backgroundColor: theme.inputBackground,
    },
    sendButton: { backgroundColor: theme.primary, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8 },
    sendButtonText: { color: '#fff', fontWeight: '600' },
  });
}

import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import ChatListScreen from './src/screens/ChatListScreen';
import ChatScreen from './src/screens/ChatScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import { removeToken } from './src/utils/storage';
import { View, Text, StyleSheet } from 'react-native';

function TabIcon({ emoji, color }: { emoji: string; color: string }) {
  return <Text style={{ fontSize: 22, color }}>{emoji}</Text>;
}

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Main: undefined;
  ChatScreen: { chatId: string; otherUsername: string };
};

export type MainTabParamList = {
  Chats: undefined;
  Profile: undefined;
  Logout: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

function LogoutScreen() {
  return <View />;
}

function MainTabs({ navigation }: NativeStackScreenProps<RootStackParamList, 'Main'>) {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#8e8e93',
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarIcon: ({ color }) => {
          if (route.name === 'Chats') return <TabIcon emoji="💬" color={color} />;
          if (route.name === 'Profile') return <TabIcon emoji="👤" color={color} />;
          if (route.name === 'Logout') return <TabIcon emoji="🚪" color="#ff3b30" />;
        },
        tabBarLabel: ({ focused, color }) => {
          if (route.name === 'Logout') {
            return <Text style={[styles.tabBarLabel, { color: '#ff3b30' }]}>Logout</Text>;
          }
          return <Text style={[styles.tabBarLabel, { color }]}>{route.name}</Text>;
        },
      })}
    >
      <Tab.Screen name="Chats" component={ChatListScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
      <Tab.Screen
        name="Logout"
        component={LogoutScreen}
        listeners={{
          tabPress: (e) => {
            e.preventDefault();
            removeToken().then(() => navigation.replace('Login'));
          },
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Login">
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Main" component={MainTabs} options={{ headerShown: false }} />
          <Stack.Screen
            name="ChatScreen"
            component={ChatScreen}
            options={({ route }) => ({ title: route.params.otherUsername })}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#fff',
    borderTopColor: '#e0e0e0',
    borderTopWidth: StyleSheet.hairlineWidth,
    height: 60,
    paddingBottom: 8,
    paddingTop: 4,
  },
  tabBarLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
});

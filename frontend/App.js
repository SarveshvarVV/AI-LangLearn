import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppProvider, AppContext } from './AppContext';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';

import HomeScreen from './screens/HomeScreen';
import ChatScreen from './screens/ChatScreen';
import ProfileScreen from './screens/ProfileScreen';
import OnboardingScreen from './screens/OnboardingScreen';
import LessonScreen from './screens/LessonScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Path" component={HomeScreen} />
      <Stack.Screen name="Lesson" component={LessonScreen} />
    </Stack.Navigator>
  );
}

function AppContent() {
  const { language } = useContext(AppContext);

  if (!language) {
    return <OnboardingScreen />;
  }

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarIcon: ({ focused, color, size }) => {
            if (route.name === 'Learn') {
              return <FontAwesome5 name="home" size={size} color={color} />;
            } else if (route.name === 'Tutor') {
              return <Ionicons name="chatbubbles" size={size} color={color} />;
            } else if (route.name === 'Profile') {
              return <FontAwesome5 name="user-alt" size={size} color={color} />;
            }
          },
          tabBarActiveTintColor: '#1CB0F6',
          tabBarInactiveTintColor: '#AFAFAF',
          tabBarStyle: {
            borderTopWidth: 2,
            borderColor: '#E5E5E5',
            paddingBottom: 5,
            height: 60,
          },
          tabBarLabelStyle: {
            fontWeight: 'bold',
          }
        })}
      >
        <Tab.Screen name="Learn" component={HomeStack} />
        <Tab.Screen name="Tutor" component={ChatScreen} />
        <Tab.Screen name="Profile" component={ProfileScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </SafeAreaProvider>
  );
}

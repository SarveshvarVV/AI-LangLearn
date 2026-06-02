import React, { useState, useContext } from 'react';
import { API_URL } from '../config';
import { AppContext } from '../AppContext';
import { View, Text, TextInput, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity, Image } from 'react-native';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';

export default function ChatScreen() {
  const { language } = useContext(AppContext);
  const [messages, setMessages] = useState([
    { role: 'ai', content: `Hi! I'm your ${language} AI tutor. How can I help you practice today?` }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sound, setSound] = useState();

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input, language, level: 'Beginner' })
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'ai', content: data.response }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'ai', content: "Error connecting to AI." }]);
    } finally {
      setLoading(false);
    }
  };

  const playVoice = async (text) => {
    try {
      let uri;

      if (Platform.OS === 'web') {
        const res = await fetch(`${API_URL}/api/speak`, {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({ message: text, language, level: 'Beginner' })
        });
        if (!res.ok) throw new Error("Voice synthesis failed");
        const blob = await res.blob();
        uri = URL.createObjectURL(blob);
      } else {
        const fileUri = FileSystem.documentDirectory + 'temp_audio.mp3';
        const response = await FileSystem.downloadAsync(
           `${API_URL}/api/speak?text=${encodeURIComponent(text)}&language=${language}`,
           fileUri,
           {
              httpMethod: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ message: text, language, level: 'Beginner' })
           }
        );
        uri = response.uri;
      }

      const { sound } = await Audio.Sound.createAsync(
         { uri },
         { shouldPlay: true }
      );
      setSound(sound);
    } catch (err) {
      console.error(err);
    }
  };

  React.useEffect(() => {
    return sound ? () => { sound.unloadAsync(); } : undefined;
  }, [sound]);

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <View style={styles.header}>
        <FontAwesome5 name="robot" size={24} color="#4F46E5" />
        <Text style={styles.headerTitle}>{language} Tutor</Text>
      </View>

      <ScrollView style={styles.chatArea} contentContainerStyle={{ paddingBottom: 20 }}>
        {messages.map((m, i) => {
          const isUser = m.role === 'user';
          return (
            <View key={i} style={[styles.messageWrapper, isUser ? styles.wrapperUser : styles.wrapperAi]}>
              {!isUser && <View style={styles.avatar}><FontAwesome5 name="robot" size={20} color="#FFF" /></View>}
              <View style={[styles.messageBubble, isUser ? styles.bubbleUser : styles.bubbleAi]}>
                <Text style={[styles.messageText, isUser ? styles.textUser : styles.textAi]}>{m.content}</Text>
                {!isUser && (
                   <TouchableOpacity onPress={() => playVoice(m.content)} style={styles.playButton}>
                      <Ionicons name="volume-medium" size={20} color="#4F46E5" />
                   </TouchableOpacity>
                )}
              </View>
            </View>
          );
        })}
        {loading && (
          <View style={[styles.messageWrapper, styles.wrapperAi]}>
            <View style={styles.avatar}><FontAwesome5 name="robot" size={20} color="#FFF" /></View>
            <View style={[styles.messageBubble, styles.bubbleAi]}><Text style={styles.textAi}>Typing...</Text></View>
          </View>
        )}
      </ScrollView>

      <View style={styles.inputArea}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Ask a question..."
          placeholderTextColor="#8A8F98"
        />
        <TouchableOpacity style={styles.sendBtn} onPress={sendMessage}>
          <Ionicons name="send" size={20} color="#FFF" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF9F5' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    paddingTop: 50,
    backgroundColor: '#FFF',
    borderBottomWidth: 2,
    borderColor: '#E6E3DA'
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#1F2430', marginLeft: 10 },
  chatArea: { flex: 1, padding: 15 },
  messageWrapper: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 15 },
  wrapperUser: { justifyContent: 'flex-end' },
  wrapperAi: { justifyContent: 'flex-start' },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#4F46E5', justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  messageBubble: { maxWidth: '75%', padding: 15, borderRadius: 20 },
  bubbleUser: { backgroundColor: '#4F46E5', borderBottomRightRadius: 5 },
  bubbleAi: { backgroundColor: '#FFF', borderWidth: 2, borderColor: '#E6E3DA', borderBottomLeftRadius: 5 },
  messageText: { fontSize: 16 },
  textUser: { color: '#FFF' },
  textAi: { color: '#1F2430' },
  playButton: { marginTop: 10, alignSelf: 'flex-end' },
  inputArea: { flexDirection: 'row', padding: 15, backgroundColor: '#FFF', borderTopWidth: 2, borderColor: '#E6E3DA', alignItems: 'center' },
  input: { flex: 1, backgroundColor: '#FAF9F5', borderWidth: 2, borderColor: '#E6E3DA', borderRadius: 24, paddingHorizontal: 20, paddingVertical: 10, fontSize: 16, marginRight: 10 },
  sendBtn: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#2FB67A', justifyContent: 'center', alignItems: 'center', borderBottomWidth: 4, borderBottomColor: '#1E8A5B' }
});

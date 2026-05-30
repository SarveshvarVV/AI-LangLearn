import React, { useState } from 'react';
import { API_URL } from '../config';
import { View, Text, TextInput, Button, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';

export default function ChatScreen() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sound, setSound] = useState();

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = { role: 'user', content: input };
    setMessages([...messages, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input, language: 'Japanese', level: 'Beginner' })
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
      console.log("Requesting voice for:", text);

      let uri;

      if (Platform.OS === 'web') {
        const res = await fetch(`${API_URL}/api/speak`, {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({ message: text, language: 'Japanese', level: 'Beginner' })
        });
        if (!res.ok) throw new Error("Voice synthesis failed");
        const blob = await res.blob();
        uri = URL.createObjectURL(blob);
      } else {
        // Native mobile relies on expo-file-system to download and play the post request result.
        // A standard approach for audio is changing the backend to allow GET requests or saving the file.
        // Here we use expo-file-system to download the audio result directly.

        const fileUri = FileSystem.documentDirectory + 'temp_audio.mp3';

        const response = await FileSystem.downloadAsync(
           `${API_URL}/api/speak?text=${encodeURIComponent(text)}&language=Japanese`,
           fileUri,
           {
              httpMethod: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ message: text, language: 'Japanese', level: 'Beginner' })
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

  // Cleanup sound
  React.useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <Text style={styles.header}>AI Tutor (Japanese)</Text>
      <ScrollView style={styles.chatArea}>
        {messages.map((m, i) => (
          <View key={i} style={[styles.message, m.role === 'user' ? styles.userMessage : styles.aiMessage]}>
            <Text>{m.content}</Text>
            {m.role === 'ai' && (
               <TouchableOpacity onPress={() => playVoice(m.content)} style={styles.playButton}>
                  <Text style={styles.playText}>🔊 Play Voice</Text>
               </TouchableOpacity>
            )}
          </View>
        ))}
        {loading && <Text style={styles.loading}>AI is typing...</Text>}
      </ScrollView>
      <View style={styles.inputArea}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Type or speak..."
        />
        <Button title="Send" onPress={sendMessage} />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingTop: 50 },
  header: { fontSize: 20, fontWeight: 'bold', textAlign: 'center', padding: 15, borderBottomWidth: 1, borderColor: '#eee' },
  chatArea: { flex: 1, padding: 10 },
  message: { padding: 15, borderRadius: 10, marginVertical: 5, maxWidth: '80%' },
  userMessage: { backgroundColor: '#dcf8c6', alignSelf: 'flex-end' },
  aiMessage: { backgroundColor: '#f1f0f0', alignSelf: 'flex-start' },
  loading: { alignSelf: 'center', color: '#888', marginTop: 10 },
  inputArea: { flexDirection: 'row', padding: 10, borderTopWidth: 1, borderColor: '#eee' },
  input: { flex: 1, borderWidth: 1, borderColor: '#ccc', borderRadius: 20, paddingHorizontal: 15, marginRight: 10 },
  playButton: { marginTop: 10, padding: 5, backgroundColor: '#ddd', borderRadius: 5, alignSelf: 'flex-start' },
  playText: { fontSize: 12 }
});

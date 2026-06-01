import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, ActivityIndicator, ScrollView } from 'react-native';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { AppContext } from '../AppContext';
import { API_URL } from '../config';

export default function CallScreen({ navigation, route }) {
  const { language, setProgress } = useContext(AppContext);
  const scenario = route.params?.scenario;

  const [recording, setRecording] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [loading, setLoading] = useState(false);

  // Real-time transcript tracking
  const [history, setHistory] = useState([
     { role: 'ai', text: `(Call started. Say hello to your ${scenario.persona}!)` }
  ]);
  const [apiHistory, setApiHistory] = useState([]); // Raw LLM messages format
  const [sound, setSound] = useState(null);

  // Request mic permissions on load
  useEffect(() => {
    (async () => {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        alert('Microphone permissions are required for Voice Calls.');
      }
    })();
    return () => {
      if (sound) sound.unloadAsync();
    };
  }, []);

  const startRecording = async () => {
    try {
      if (sound) await sound.stopAsync();

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      setRecording(recording);
      setIsRecording(true);
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  };

  const stopRecording = async () => {
    if (!recording) return;
    setIsRecording(false);
    setLoading(true);

    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(null);

      await sendAudioToBackend(uri);
    } catch (err) {
      console.error('Failed to stop recording', err);
      setLoading(false);
    }
  };

  const sendAudioToBackend = async (uri) => {
    let formData = new FormData();
    formData.append('language', language);
    formData.append('scenario', scenario.persona);
    formData.append('chat_history', JSON.stringify(apiHistory));

    // Create file payload depending on OS
    const filename = uri.split('/').pop();
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `audio/${match[1]}` : `audio`;

    // Note: React Native's fetch FormData requires this specific object structure for files

    if (Platform.OS === 'web') {
      const res = await fetch(uri);
      const blob = await res.blob();
      formData.append('audio', blob, filename);
    } else {
      formData.append('audio', {
         uri: Platform.OS === 'android' ? uri : uri.replace('file://', ''),
         name: filename,
         type
      });
    }


    try {
      const response = await fetch(`${API_URL}/api/voice-call`, {
        method: 'POST',
        headers: {

        },
        body: formData,
      });

      if (!response.ok) throw new Error("Backend processing failed");

      // Extract headers containing transcripts
      const userText = decodeURIComponent(response.headers.get('X-User-Text') || "...");
      const aiText = decodeURIComponent(response.headers.get('X-AI-Text') || "...");

      // Update UI transcript
      setHistory(prev => [...prev, { role: 'user', text: userText }, { role: 'ai', text: aiText }]);

      // Update API History for context memory
      setApiHistory(prev => [...prev, { role: 'user', content: userText }, { role: 'assistant', content: aiText }]);

      // Reward XP for active conversation
      fetch(`${API_URL}/api/xp`, {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ amount: 15 })
      });
      setProgress(prev => ({...prev, xp: prev.xp + 15}));

      // Play audio response
      const blob = await response.blob();
      let playUri;
      if (Platform.OS === 'web') {
          playUri = URL.createObjectURL(blob);
      } else {
          const fileUri = FileSystem.documentDirectory + 'temp_call_audio.mp3';
          await FileSystem.writeAsStringAsync(fileUri, "", { encoding: FileSystem.EncodingType.Base64 });
          const reader = new FileReader();
          reader.readAsDataURL(blob);
          await new Promise(resolve => {
              reader.onloadend = async () => {
                  const base64data = reader.result.split(',')[1];
                  await FileSystem.writeAsStringAsync(fileUri, base64data, { encoding: FileSystem.EncodingType.Base64 });
                  resolve();
              };
          });
          playUri = fileUri;
      }

      const { sound: newSound } = await Audio.Sound.createAsync(
          { uri: playUri },
          { shouldPlay: true }
      );
      setSound(newSound);

    } catch (err) {
      console.error(err);
      setHistory(prev => [...prev, { role: 'system', text: "Error connecting to AI." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <FontAwesome5 name="chevron-left" size={24} color="#AFAFAF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{scenario.title}</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.callVisualizer}>
        <View style={styles.avatar}>
           <FontAwesome5 name={scenario.icon} size={50} color="#FFF" />
        </View>
        <Text style={styles.personaName}>{scenario.persona}</Text>
        <Text style={styles.callStatus}>{loading ? "Thinking..." : "Connected"}</Text>
      </View>

      <ScrollView style={styles.transcript} contentContainerStyle={{ paddingBottom: 20 }}>
         {history.map((h, i) => (
            <View key={i} style={[styles.bubble, h.role === 'user' ? styles.bubbleUser : styles.bubbleAi]}>
               <Text style={[styles.bubbleText, h.role === 'user' ? styles.textUser : styles.textAi]}>{h.text}</Text>
            </View>
         ))}
      </ScrollView>

      <View style={styles.controls}>
         <TouchableOpacity
           style={[styles.micButton, isRecording && styles.micButtonActive]}
           onPressIn={startRecording}
           onPressOut={stopRecording}
           disabled={loading}
         >
           <Ionicons name="mic" size={40} color="#FFF" />
         </TouchableOpacity>
         <Text style={styles.helperText}>
           {isRecording ? "Release to Send" : "Hold to Speak"}
         </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1A1A1A' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, paddingTop: 50 },
  headerTitle: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  callVisualizer: { alignItems: 'center', paddingVertical: 30 },
  avatar: { width: 120, height: 120, borderRadius: 60, backgroundColor: '#1CB0F6', justifyContent: 'center', alignItems: 'center', borderWidth: 4, borderColor: '#FFF', marginBottom: 15 },
  personaName: { color: '#FFF', fontSize: 24, fontWeight: 'bold' },
  callStatus: { color: '#58CC02', fontSize: 16, marginTop: 5 },
  transcript: { flex: 1, padding: 20 },
  bubble: { maxWidth: '80%', padding: 15, borderRadius: 20, marginBottom: 15 },
  bubbleUser: { backgroundColor: '#1CB0F6', alignSelf: 'flex-end', borderBottomRightRadius: 5 },
  bubbleAi: { backgroundColor: '#333', alignSelf: 'flex-start', borderBottomLeftRadius: 5 },
  bubbleText: { fontSize: 16 },
  textUser: { color: '#FFF' },
  textAi: { color: '#FFF' },
  controls: { padding: 30, alignItems: 'center', borderTopWidth: 1, borderColor: '#333' },
  micButton: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#1CB0F6', justifyContent: 'center', alignItems: 'center', shadowColor: '#1CB0F6', shadowOpacity: 0.5, shadowRadius: 10, shadowOffset: { width: 0, height: 0 } },
  micButtonActive: { backgroundColor: '#FF4B4B', shadowColor: '#FF4B4B', transform: [{ scale: 1.1 }] },
  helperText: { color: '#AFAFAF', marginTop: 15, fontSize: 16 }
});

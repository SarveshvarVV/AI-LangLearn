import React, { useEffect, useState } from 'react';
import { API_URL } from '../config';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';

export default function HomeScreen() {
  const [progress, setProgress] = useState({ xp: 0, streak: 0, hearts: 0 });

  useEffect(() => {
    fetch(`${API_URL}/api/progress`)
      .then(res => res.json())
      .then(data => setProgress(data))
      .catch(err => console.log('Fetch error (API might be offline or using different IP on mobile):', err));
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <Text style={styles.stat}>🔥 {progress.streak}</Text>
        <Text style={styles.stat}>💎 {progress.xp}</Text>
        <Text style={styles.stat}>❤️ {progress.hearts}</Text>
      </View>
      <ScrollView contentContainerStyle={styles.path}>
        <TouchableOpacity style={styles.node}><Text>1. Greetings</Text></TouchableOpacity>
        <TouchableOpacity style={styles.nodeLocked}><Text>2. Katakana</Text></TouchableOpacity>
        <TouchableOpacity style={styles.nodeLocked}><Text>3. Numbers</Text></TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f0f0', paddingTop: 50 },
  topBar: { flexDirection: 'row', justifyContent: 'space-around', padding: 15, backgroundColor: '#fff', elevation: 2 },
  stat: { fontSize: 18, fontWeight: 'bold' },
  path: { alignItems: 'center', paddingVertical: 40 },
  node: { backgroundColor: '#4ade80', width: 100, height: 100, borderRadius: 50, justifyContent: 'center', alignItems: 'center', marginVertical: 20, elevation: 5 },
  nodeLocked: { backgroundColor: '#d1d5db', width: 100, height: 100, borderRadius: 50, justifyContent: 'center', alignItems: 'center', marginVertical: 20 }
});

import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { AppContext } from '../AppContext';
import { FontAwesome5 } from '@expo/vector-icons';

export default function ProfileScreen() {
  const { language, progress, setLanguage } = useContext(AppContext);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>👤</Text>
        </View>
        <Text style={styles.name}>Language Learner</Text>
        <Text style={styles.handle}>@student_123</Text>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <FontAwesome5 name="fire" size={24} color="#FF9600" />
          <Text style={styles.statNumber}>{progress.streak}</Text>
          <Text style={styles.statLabel}>Day Streak</Text>
        </View>
        <View style={styles.statBox}>
          <FontAwesome5 name="gem" size={24} color="#1CB0F6" />
          <Text style={styles.statNumber}>{progress.xp}</Text>
          <Text style={styles.statLabel}>Total XP</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Current Course</Text>
        <View style={styles.courseCard}>
          <Text style={styles.flag}>{language === 'Japanese' ? '🇯🇵' : '🇰🇷'}</Text>
          <Text style={styles.courseName}>{language}</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.switchBtn} onPress={() => setLanguage(null)}>
        <Text style={styles.switchBtnText}>SWITCH COURSE</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  header: { alignItems: 'center', paddingVertical: 40, borderBottomWidth: 2, borderColor: '#E5E5E5' },
  avatar: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#E5E5E5', justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  avatarText: { fontSize: 50 },
  name: { fontSize: 24, fontWeight: 'bold', color: '#4B4B4B' },
  handle: { fontSize: 16, color: '#AFAFAF', marginTop: 5 },
  statsRow: { flexDirection: 'row', padding: 20, justifyContent: 'space-between' },
  statBox: { flex: 1, borderWidth: 2, borderColor: '#E5E5E5', borderRadius: 16, padding: 20, alignItems: 'center', marginHorizontal: 5 },
  statNumber: { fontSize: 24, fontWeight: 'bold', color: '#4B4B4B', marginVertical: 10 },
  statLabel: { fontSize: 14, color: '#AFAFAF', fontWeight: 'bold' },
  section: { padding: 20 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#4B4B4B', marginBottom: 15 },
  courseCard: { flexDirection: 'row', alignItems: 'center', borderWidth: 2, borderColor: '#E5E5E5', borderRadius: 16, padding: 20 },
  flag: { fontSize: 32, marginRight: 20 },
  courseName: { fontSize: 20, fontWeight: 'bold', color: '#4B4B4B' },
  switchBtn: { margin: 20, backgroundColor: '#FFF', borderWidth: 2, borderColor: '#1CB0F6', borderRadius: 16, padding: 18, alignItems: 'center' },
  switchBtnText: { color: '#1CB0F6', fontSize: 16, fontWeight: 'bold' }
});

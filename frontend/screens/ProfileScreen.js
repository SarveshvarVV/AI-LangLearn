import React, { useContext, useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { AppContext } from '../AppContext';
import { FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { API_URL } from '../config';

export default function ProfileScreen() {
  const { language, progress, setProgress, setLanguage } = useContext(AppContext);
  const [profileData, setProfileData] = useState(null);

  const fetchProfile = async () => {
    try {
      const res = await fetch(`${API_URL}/api/progress`);
      const data = await res.json();
      setProfileData(data);
      setProgress(prev => ({...prev, xp: data.xp, streak: data.streak, hearts: data.hearts, gems: data.gems}));
    } catch (err) {
      console.log('Error fetching profile:', err);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const buyFreeze = async () => {
    try {
      const res = await fetch(`${API_URL}/api/shop/freeze`, { method: 'POST' });
      if (res.ok) {
        Alert.alert("Success!", "You bought a Streak Freeze!");
        fetchProfile();
      } else {
        Alert.alert("Oops!", "Not enough gems.");
      }
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>👤</Text>
        </View>
        <Text style={styles.name}>Language Learner</Text>
        <Text style={styles.handle}>@student_123</Text>
      </View>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <FontAwesome5 name="fire" size={24} color="#FF9600" />
          <Text style={styles.statNumber}>{profileData?.streak || 0}</Text>
          <Text style={styles.statLabel}>Day Streak</Text>
        </View>
        <View style={styles.statBox}>
          <FontAwesome5 name="bolt" size={24} color="#FFD900" />
          <Text style={styles.statNumber}>{profileData?.xp || 0}</Text>
          <Text style={styles.statLabel}>Total XP</Text>
        </View>
        <View style={styles.statBox}>
          <FontAwesome5 name="gem" size={24} color="#1CB0F6" />
          <Text style={styles.statNumber}>{profileData?.gems || 0}</Text>
          <Text style={styles.statLabel}>Gems</Text>
        </View>
      </View>

      {/* Shop / Loss Aversion section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Item Shop</Text>
        <View style={styles.shopCard}>
           <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <MaterialCommunityIcons name="snowflake" size={32} color="#1CB0F6" style={{marginRight: 15}} />
              <View>
                 <Text style={styles.itemName}>Streak Freeze</Text>
                 <Text style={styles.itemDesc}>Protects your streak if you miss a day.</Text>
                 <Text style={styles.itemOwned}>Owned: {profileData?.streak_freezes || 0}</Text>
              </View>
           </View>
           <TouchableOpacity style={styles.buyBtn} onPress={buyFreeze}>
              <Text style={styles.buyBtnText}>50 💎</Text>
           </TouchableOpacity>
        </View>
      </View>

      {/* Leagues / Variable Reward UI Mock */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Current League</Text>
        <View style={styles.leagueCard}>
          <FontAwesome5 name="shield-alt" size={40} color="#FFD900" style={{marginRight: 15}} />
          <View>
            <Text style={styles.itemName}>Gold League</Text>
            <Text style={styles.itemDesc}>Top 10 advance to Sapphire!</Text>
          </View>
        </View>
      </View>

      {/* Course Management */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Course Settings</Text>
        <View style={styles.courseCard}>
          <Text style={styles.flag}>{language === 'Japanese' ? '🇯🇵' : '🇰🇷'}</Text>
          <Text style={styles.courseName}>{language}</Text>
        </View>
        <TouchableOpacity style={styles.switchBtn} onPress={() => setLanguage(null)}>
          <Text style={styles.switchBtnText}>SWITCH COURSE</Text>
        </TouchableOpacity>
      </View>

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
  statBox: { flex: 1, borderWidth: 2, borderColor: '#E5E5E5', borderRadius: 16, padding: 15, alignItems: 'center', marginHorizontal: 5 },
  statNumber: { fontSize: 20, fontWeight: 'bold', color: '#4B4B4B', marginVertical: 8 },
  statLabel: { fontSize: 12, color: '#AFAFAF', fontWeight: 'bold' },

  section: { paddingHorizontal: 20, paddingTop: 20 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#4B4B4B', marginBottom: 15 },

  shopCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 2, borderColor: '#E5E5E5', borderRadius: 16, padding: 15 },
  itemName: { fontSize: 18, fontWeight: 'bold', color: '#4B4B4B' },
  itemDesc: { fontSize: 12, color: '#AFAFAF', width: 180, marginTop: 5 },
  itemOwned: { fontSize: 12, color: '#1CB0F6', fontWeight: 'bold', marginTop: 5 },
  buyBtn: { backgroundColor: '#FFF', borderWidth: 2, borderColor: '#E5E5E5', padding: 10, borderRadius: 12 },
  buyBtnText: { color: '#1CB0F6', fontWeight: 'bold' },

  leagueCard: { flexDirection: 'row', alignItems: 'center', borderWidth: 2, borderColor: '#FFD900', backgroundColor: '#FFFDF0', borderRadius: 16, padding: 15 },

  courseCard: { flexDirection: 'row', alignItems: 'center', borderWidth: 2, borderColor: '#E5E5E5', borderRadius: 16, padding: 20 },
  flag: { fontSize: 32, marginRight: 20 },
  courseName: { fontSize: 20, fontWeight: 'bold', color: '#4B4B4B' },
  switchBtn: { marginTop: 15, backgroundColor: '#FFF', borderWidth: 2, borderColor: '#1CB0F6', borderRadius: 16, padding: 15, alignItems: 'center' },
  switchBtnText: { color: '#1CB0F6', fontSize: 16, fontWeight: 'bold' }
});

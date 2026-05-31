import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { AppContext } from '../AppContext';
import { FontAwesome5 } from '@expo/vector-icons';

export default function OnboardingScreen() {
  const { setLanguage } = useContext(AppContext);

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <FontAwesome5 name="globe-americas" size={64} color="#1CB0F6" />
        <Text style={styles.title}>What do you want to learn?</Text>
      </View>

      <View style={styles.optionsContainer}>
        <TouchableOpacity style={styles.langButton} onPress={() => setLanguage('Japanese')}>
          <Text style={styles.flag}>🇯🇵</Text>
          <Text style={styles.langText}>Japanese</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.langButton} onPress={() => setLanguage('Korean')}>
          <Text style={styles.flag}>🇰🇷</Text>
          <Text style={styles.langText}>Korean</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', padding: 20 },
  headerContainer: { alignItems: 'center', marginBottom: 50 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#4B4B4B', textAlign: 'center', marginTop: 20 },
  optionsContainer: { width: '100%' },
  langButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#E5E5E5',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  flag: { fontSize: 32, marginRight: 20 },
  langText: { fontSize: 20, fontWeight: 'bold', color: '#4B4B4B' }
});

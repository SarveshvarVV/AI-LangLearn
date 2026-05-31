import React, { useEffect, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { AppContext } from '../AppContext';
import { API_URL } from '../config';

const { width } = Dimensions.get('window');

// A curved calculation to stagger nodes like Duolingo
const getStaggeredMargin = (index) => {
  const positions = [0, 40, 80, 40, 0, -40, -80, -40];
  return positions[index % positions.length];
};

export default function HomeScreen({ navigation }) {
  const { language, progress, setProgress } = useContext(AppContext);

  useEffect(() => {
    fetch(`${API_URL}/api/progress`)
      .then(res => res.json())
      .then(data => {
        setProgress(prev => ({...prev, xp: data.xp, streak: data.streak, hearts: data.hearts}));
      })
      .catch(err => console.log('Fetch error:', err));
  }, []);

  const lessons = [
    { id: 1, title: 'Basics 1', icon: 'star', active: true, color: '#58CC02' },
    { id: 2, title: 'Greetings', icon: 'hand-paper', active: true, color: '#CE82FF' },
    { id: 3, title: 'Numbers', icon: 'sort-numeric-up', active: false, color: '#E5E5E5' },
    { id: 4, title: 'Food', icon: 'hamburger', active: false, color: '#E5E5E5' },
    { id: 5, title: 'Travel', icon: 'plane', active: false, color: '#E5E5E5' },
  ];

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.topBar}>
        <View style={styles.flagContainer}>
          <Text style={styles.flag}>{language === 'Japanese' ? '🇯🇵' : '🇰🇷'}</Text>
        </View>
        <View style={styles.statContainer}>
          <FontAwesome5 name="fire" size={20} color="#FF9600" />
          <Text style={[styles.stat, { color: '#FF9600' }]}>{progress.streak}</Text>
        </View>
        <View style={styles.statContainer}>
          <FontAwesome5 name="gem" size={20} color="#1CB0F6" />
          <Text style={[styles.stat, { color: '#1CB0F6' }]}>{progress.xp}</Text>
        </View>
        <View style={styles.statContainer}>
          <FontAwesome5 name="heart" size={20} color="#FF4B4B" solid />
          <Text style={[styles.stat, { color: '#FF4B4B' }]}>{progress.hearts}</Text>
        </View>
      </View>

      {/* Path Scroll */}
      <ScrollView contentContainerStyle={styles.path}>
        {lessons.map((lesson, index) => {
          const marginLeft = getStaggeredMargin(index);
          const isLocked = !lesson.active;

          return (
            <View key={lesson.id} style={[styles.nodeWrapper, { marginLeft }]}>
              <TouchableOpacity
                style={[
                  styles.node,
                  { backgroundColor: lesson.color, borderColor: isLocked ? '#C4C4C4' : (lesson.color === '#58CC02' ? '#58A700' : '#A568CC') }
                ]}
                activeOpacity={0.8}
                onPress={() => !isLocked && navigation.navigate('Lesson', { title: lesson.title })}
              >
                <FontAwesome5 name={lesson.icon} size={32} color={isLocked ? '#AFAFAF' : '#FFF'} solid />
              </TouchableOpacity>
              <Text style={styles.nodeTitle}>{lesson.title}</Text>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 15,
    backgroundColor: '#FFF',
    borderBottomWidth: 2,
    borderColor: '#E5E5E5',
    zIndex: 10
  },
  flagContainer: {
    padding: 5,
    borderWidth: 2,
    borderColor: '#E5E5E5',
    borderRadius: 8,
  },
  flag: { fontSize: 24 },
  statContainer: { flexDirection: 'row', alignItems: 'center' },
  stat: { fontSize: 16, fontWeight: 'bold', marginLeft: 8 },
  path: {
    alignItems: 'center',
    paddingVertical: 50,
    paddingBottom: 100
  },
  nodeWrapper: {
    alignItems: 'center',
    marginVertical: 20,
  },
  node: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0,
    borderBottomWidth: 6, // 3D effect
  },
  nodeTitle: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4B4B4B'
  }
});

import React, { useEffect, useState, useContext } from 'react';
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
  const [curriculum, setCurriculum] = useState([]);

  useEffect(() => {
    // Fetch user progress
    fetch(`${API_URL}/api/progress`)
      .then(res => res.json())
      .then(data => {
        setProgress(prev => ({...prev, xp: data.xp, streak: data.streak, hearts: data.hearts}));
      })
      .catch(err => console.log('Fetch error:', err));

    // Fetch fixed curriculum
    fetch(`${API_URL}/api/curriculum?language=${language}`)
      .then(res => res.json())
      .then(data => setCurriculum(data))
      .catch(err => console.log('Fetch curriculum error:', err));
  }, [language]);

  let nodeCounter = 0;

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
        <View style={styles.statContainer}>
          <FontAwesome5 name="gem" size={20} color="#1CB0F6" />
          <Text style={[styles.stat, { color: '#1CB0F6' }]}>{progress.gems}</Text>
        </View>
          <FontAwesome5 name="heart" size={20} color="#FF4B4B" solid />
          <Text style={[styles.stat, { color: '#FF4B4B' }]}>{progress.hearts}</Text>
        </View>
      </View>

      {/* Path Scroll */}
      <ScrollView contentContainerStyle={styles.path}>
        {curriculum.map((moduleData, modIndex) => (
          <View key={`mod-${modIndex}`} style={styles.moduleContainer}>
            {/* Section Header */}
            <View style={styles.moduleHeader}>
               <Text style={styles.moduleTitle}>{moduleData.module}</Text>
            </View>

            {moduleData.lessons.map((lesson, lessIndex) => {
              const marginLeft = getStaggeredMargin(nodeCounter);
              nodeCounter++;

              // For MVP, we make everything active. In a full app, we'd check progress.
              const isActive = true;
              const isBoss = lesson.lesson_name === "Conversation";

              // Icon mapping based on lesson title
              let icon = "star";
              let color = "#58CC02"; // Green

              if (isBoss) {
                 icon = "crown";
                 color = "#FF9600"; // Orange/Gold
              } else if (lesson.lesson_name.includes("Greetings")) {
                 icon = "hand-paper";
                 color = "#CE82FF"; // Purple
              } else if (lesson.lesson_name.includes("Yes/No") || lesson.lesson_name.includes("Introductions")) {
                 icon = "user-friends";
                 color = "#1CB0F6"; // Blue
              } else if (lesson.lesson_name.includes("Numbers")) {
                 icon = "sort-numeric-up";
                 color = "#FF4B4B"; // Red
              } else if (lesson.lesson_name.includes("Basics") || lesson.lesson_name.includes("Ordering")) {
                 icon = "coffee";
                 color = "#CE82FF";
              }

              return (
                <View key={lesson.id} style={[styles.nodeWrapper, { marginLeft }]}>
                  <TouchableOpacity
                    style={[
                      styles.node,
                      { backgroundColor: color, borderBottomColor: getDarker(color) }
                    ]}
                    activeOpacity={0.8}
                    onPress={() => isActive && navigation.navigate('Lesson', { lessonData: lesson })}
                  >
                    <FontAwesome5 name={icon} size={32} color={'#FFF'} solid />
                  </TouchableOpacity>
                  <Text style={styles.nodeTitle}>{lesson.lesson_name}</Text>
                </View>
              );
            })}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

// Helper to darken hex colors for 3D effect
const getDarker = (hex) => {
  if (hex === '#58CC02') return '#58A700';
  if (hex === '#CE82FF') return '#A568CC';
  if (hex === '#1CB0F6') return '#1899D6';
  if (hex === '#FF9600') return '#CC7800';
  if (hex === '#FF4B4B') return '#EA2B2B';
  return '#C4C4C4';
};

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
    paddingVertical: 20,
    paddingBottom: 100
  },
  moduleContainer: {
    width: '100%',
    alignItems: 'center'
  },
  moduleHeader: {
    backgroundColor: '#1CB0F6',
    width: '90%',
    padding: 15,
    borderRadius: 16,
    marginVertical: 20,
    borderBottomWidth: 4,
    borderBottomColor: '#1899D6',
    alignItems: 'center'
  },
  moduleTitle: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold'
  },
  nodeWrapper: {
    alignItems: 'center',
    marginVertical: 15,
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

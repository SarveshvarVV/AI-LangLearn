import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, ActivityIndicator } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { AppContext } from '../AppContext';
import { API_URL } from '../config';

const { width } = Dimensions.get('window');

const getStaggeredMargin = (index) => {
  const positions = [0, 40, 80, 40, 0, -40, -80, -40];
  return positions[index % positions.length];
};

const getDarker = (hex) => {
  if (hex === '#58CC02') return '#58A700';
  if (hex === '#CE82FF') return '#A568CC';
  if (hex === '#1CB0F6') return '#1899D6';
  if (hex === '#FF9600') return '#CC7800';
  if (hex === '#FF4B4B') return '#EA2B2B';
  return '#C4C4C4';
};

export default function CustomPathScreen({ navigation }) {
  const { language, customPath, setCustomPath, progress } = useContext(AppContext);
  const [loading, setLoading] = useState(false);

  // Questionnaire state
  const [reason, setReason] = useState('Travel');
  const [style, setStyle] = useState('Conversational');
  const [duration, setDuration] = useState('2 Weeks');

  const generatePath = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/generate-path`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language, reason, style, duration })
      });
      const data = await res.json();
      setCustomPath(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1CB0F6" />
        <Text style={styles.loadingText}>Crafting your custom {language} journey...</Text>
      </View>
    );
  }

  // If no path is set, show the Setup Wizard
  if (!customPath || customPath.length === 0) {
    return (
      <ScrollView style={styles.wizardContainer} contentContainerStyle={{ paddingBottom: 100 }}>
        <View style={styles.wizardHeader}>
           <FontAwesome5 name="magic" size={40} color="#CE82FF" />
           <Text style={styles.wizardTitle}>Custom Track</Text>
           <Text style={styles.wizardSub}>Personalize your learning experience.</Text>
        </View>

        <View style={styles.questionSection}>
           <Text style={styles.questionTitle}>Why are you learning {language}?</Text>
           <View style={styles.optionsRow}>
             {['Travel', 'Business', 'Culture', 'Family'].map(opt => (
               <TouchableOpacity key={opt} onPress={() => setReason(opt)} style={[styles.optionBtn, reason === opt && styles.optionBtnSelected]}>
                  <Text style={[styles.optionText, reason === opt && styles.optionTextSelected]}>{opt}</Text>
               </TouchableOpacity>
             ))}
           </View>
        </View>

        <View style={styles.questionSection}>
           <Text style={styles.questionTitle}>Learning Style?</Text>
           <View style={styles.optionsRow}>
             {['Conversational', 'Grammar', 'Reading', 'Fast-paced'].map(opt => (
               <TouchableOpacity key={opt} onPress={() => setStyle(opt)} style={[styles.optionBtn, style === opt && styles.optionBtnSelected]}>
                  <Text style={[styles.optionText, style === opt && styles.optionTextSelected]}>{opt}</Text>
               </TouchableOpacity>
             ))}
           </View>
        </View>

        <View style={styles.questionSection}>
           <Text style={styles.questionTitle}>Goal Duration?</Text>
           <View style={styles.optionsRow}>
             {['2 Weeks', '1 Month', '3 Months', 'Casual'].map(opt => (
               <TouchableOpacity key={opt} onPress={() => setDuration(opt)} style={[styles.optionBtn, duration === opt && styles.optionBtnSelected]}>
                  <Text style={[styles.optionText, duration === opt && styles.optionTextSelected]}>{opt}</Text>
               </TouchableOpacity>
             ))}
           </View>
        </View>

        <TouchableOpacity style={styles.generateBtn} onPress={generatePath}>
           <Text style={styles.generateBtnText}>CREATE MY PATH</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  // If path is set, render the Gamified Custom Path
  let nodeCounter = 0;
  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.recreateBtn} onPress={() => setCustomPath(null)}>
           <FontAwesome5 name="sync-alt" size={16} color="#FFF" />
           <Text style={styles.recreateBtnText}>New Path</Text>
        </TouchableOpacity>
        <View style={styles.statContainer}>
          <FontAwesome5 name="gem" size={20} color="#1CB0F6" />
          <Text style={[styles.stat, { color: '#1CB0F6' }]}>{progress.xp}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.path}>
        {customPath.map((moduleData, modIndex) => (
          <View key={`cmod-${modIndex}`} style={styles.moduleContainer}>
            <View style={[styles.moduleHeader, { backgroundColor: '#CE82FF', borderBottomColor: '#A568CC' }]}>
               <Text style={styles.moduleTitle}>{moduleData.module}</Text>
            </View>

            {moduleData.lessons && moduleData.lessons.map((lesson, lessIndex) => {
              const marginLeft = getStaggeredMargin(nodeCounter);
              nodeCounter++;

              const color = "#FF9600";
              const icon = "star";

              return (
                <View key={`clesson-${lesson.id || lessIndex}`} style={[styles.nodeWrapper, { marginLeft }]}>
                  <TouchableOpacity
                    style={[
                      styles.node,
                      { backgroundColor: color, borderBottomColor: getDarker(color) }
                    ]}
                    activeOpacity={0.8}
                    onPress={() => navigation.navigate('Lesson', { lessonData: lesson })}
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFF' },
  loadingText: { marginTop: 20, fontSize: 18, color: '#4B4B4B', fontWeight: 'bold' },

  // Wizard Styles
  wizardContainer: { flex: 1, backgroundColor: '#FFFFFF', paddingTop: 50 },
  wizardHeader: { alignItems: 'center', padding: 20, marginBottom: 10 },
  wizardTitle: { fontSize: 28, fontWeight: 'bold', color: '#4B4B4B', marginTop: 10 },
  wizardSub: { fontSize: 16, color: '#AFAFAF', marginTop: 5 },
  questionSection: { paddingHorizontal: 20, marginBottom: 25 },
  questionTitle: { fontSize: 18, fontWeight: 'bold', color: '#4B4B4B', marginBottom: 15 },
  optionsRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  optionBtn: { width: '48%', borderWidth: 2, borderColor: '#E5E5E5', borderRadius: 16, padding: 15, marginBottom: 10, alignItems: 'center', borderBottomWidth: 4 },
  optionBtnSelected: { borderColor: '#84D8FF', backgroundColor: '#DDF4FF' },
  optionText: { fontSize: 16, color: '#4B4B4B', fontWeight: 'bold' },
  optionTextSelected: { color: '#1CB0F6' },
  generateBtn: { marginHorizontal: 20, backgroundColor: '#CE82FF', padding: 18, borderRadius: 16, borderBottomWidth: 4, borderBottomColor: '#A568CC', alignItems: 'center', marginTop: 10 },
  generateBtnText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },

  // Path Styles
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 50, paddingBottom: 15, backgroundColor: '#FFF', borderBottomWidth: 2, borderColor: '#E5E5E5', zIndex: 10 },
  recreateBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FF4B4B', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12 },
  recreateBtnText: { color: '#FFF', fontWeight: 'bold', marginLeft: 5 },
  statContainer: { flexDirection: 'row', alignItems: 'center' },
  stat: { fontSize: 16, fontWeight: 'bold', marginLeft: 8 },
  path: { alignItems: 'center', paddingVertical: 20, paddingBottom: 100 },
  moduleContainer: { width: '100%', alignItems: 'center' },
  moduleHeader: { width: '90%', padding: 15, borderRadius: 16, marginVertical: 20, borderBottomWidth: 4, alignItems: 'center' },
  moduleTitle: { color: '#FFF', fontSize: 20, fontWeight: 'bold' },
  nodeWrapper: { alignItems: 'center', marginVertical: 15 },
  node: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', borderWidth: 0, borderBottomWidth: 6 },
  nodeTitle: { marginTop: 10, fontSize: 16, fontWeight: 'bold', color: '#4B4B4B' }
});

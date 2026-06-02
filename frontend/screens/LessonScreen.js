import React, { useState, useContext, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ActivityIndicator, Platform, ScrollView } from 'react-native';
import { AppContext } from '../AppContext';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { API_URL } from '../config';

const { width } = Dimensions.get('window');

export default function LessonScreen({ navigation, route }) {
  const { language, setProgress } = useContext(AppContext);
  const lessonData = route?.params?.lessonData;

  const [selectedOption, setSelectedOption] = useState(null);
  const [result, setResult] = useState(null); // 'correct' or 'incorrect'
  const [sound, setSound] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  if (!lessonData) {
     return <View style={styles.container}><Text>Error: No lesson data</Text></View>;
  }

  const checkAnswer = () => {
    if (selectedOption === lessonData.correct_answer) {
      setResult('correct');
      // Award XP on success
      fetch(`${API_URL}/api/xp`, { // Hack to trigger XP bump on backend MVP
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ amount: lessonData.xp })
      }).then(() => {
         setProgress(prev => ({ ...prev, xp: prev.xp + lessonData.xp }));
      }).catch(err => console.log(err));

      playVoice(lessonData.success_dialogue);
    } else {
      setResult('incorrect');
      playVoice(lessonData.fail_dialogue);
    }
  };

  const playVoice = async (text) => {
    if (!text) return;
    setIsSpeaking(true);
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
        const fileUri = FileSystem.documentDirectory + 'temp_lesson_audio.mp3';
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

      const { sound: newSound } = await Audio.Sound.createAsync(
         { uri },
         { shouldPlay: true }
      );
      setSound(newSound);
      newSound.setOnPlaybackStatusUpdate((status) => {
         if (status.didJustFinish) setIsSpeaking(false);
      });
    } catch (err) {
      console.error(err);
      setIsSpeaking(false);
    }
  };

  useEffect(() => {
    return sound ? () => { sound.unloadAsync(); } : undefined;
  }, [sound]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <FontAwesome5 name="times" size={24} color="#8A8F98" />
        </TouchableOpacity>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: '50%' }]} />
        </View>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
          <Text style={styles.title}>{lessonData.lesson_name}</Text>

          {/* Persona UI */}
          <View style={styles.personaCard}>
             <View style={styles.personaAvatar}>
                <FontAwesome5 name="user-astronaut" size={40} color="#FFF" />
             </View>
             <View style={styles.personaTextBubble}>
                <Text style={styles.personaName}>{lessonData.persona}</Text>
                <Text style={styles.questionText}>{lessonData.question}</Text>
             </View>
          </View>

          <View style={styles.optionsContainer}>
            {lessonData.options.map((opt, i) => {
              const isSelected = selectedOption === opt;

              // Only color code after checking
              let optionStyle = [styles.optionBtn, isSelected && styles.optionBtnSelected];
              let optionTextStyle = [styles.optionText, isSelected && styles.optionTextSelected];

              if (result && isSelected) {
                  if (result === 'correct') {
                      optionStyle.push({ backgroundColor: '#DDF3E8', borderColor: '#1E8A5B' });
                      optionTextStyle.push({ color: '#1E8A5B' });
                  } else {
                      optionStyle.push({ backgroundColor: '#FBE3E4', borderColor: '#C62A2F' });
                      optionTextStyle.push({ color: '#C62A2F' });
                  }
              }

              return (
                <TouchableOpacity
                  key={i}
                  style={optionStyle}
                  onPress={() => !result && setSelectedOption(opt)}
                  disabled={result !== null}
                >
                  <Text style={optionTextStyle}>{opt}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
      </ScrollView>

      <View style={styles.footer}>
        {result === 'correct' && (
          <View style={[styles.resultBanner, { backgroundColor: '#DDF3E8' }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
               <FontAwesome5 name="check-circle" size={24} color="#1E8A5B" solid style={{ marginRight: 10 }} />
               <Text style={[styles.resultText, { color: '#1E8A5B' }]}>Correct! (+{lessonData.xp} XP)</Text>
            </View>
            <View style={styles.dialogueRow}>
               <Ionicons name="volume-medium" size={20} color="#1E8A5B" style={{marginRight: 5}} />
               <Text style={[styles.dialogueText, { color: '#1E8A5B' }]}>{lessonData.success_dialogue}</Text>
            </View>
          </View>
        )}
        {result === 'incorrect' && (
          <View style={[styles.resultBanner, { backgroundColor: '#FBE3E4' }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
               <FontAwesome5 name="times-circle" size={24} color="#C62A2F" solid style={{ marginRight: 10 }} />
               <Text style={[styles.resultText, { color: '#C62A2F' }]}>Incorrect.</Text>
            </View>
            <View style={styles.dialogueRow}>
               <Ionicons name="volume-medium" size={20} color="#C62A2F" style={{marginRight: 5}} />
               <Text style={[styles.dialogueText, { color: '#C62A2F' }]}>{lessonData.fail_dialogue}</Text>
            </View>
          </View>
        )}

        <TouchableOpacity
          style={[
            styles.checkBtn,
            !selectedOption && { backgroundColor: '#E6E3DA', borderBottomColor: '#E6E3DA' },
            result === 'correct' && { backgroundColor: '#2FB67A', borderBottomColor: '#1E8A5B' },
            result === 'incorrect' && { backgroundColor: '#E5484D', borderBottomColor: '#C62A2F' }
          ]}
          disabled={!selectedOption || isSpeaking}
          onPress={result ? () => navigation.goBack() : checkAnswer}
        >
          <Text style={[styles.checkBtnText, !selectedOption && { color: '#8A8F98' }]}>
            {result ? "CONTINUE" : "CHECK"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20, paddingTop: 50 },
  progressBar: { flex: 1, height: 16, backgroundColor: '#E6E3DA', borderRadius: 8, marginLeft: 20 },
  progressFill: { height: '100%', backgroundColor: '#2FB67A', borderRadius: 8 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1F2430', paddingHorizontal: 20, marginBottom: 10 },
  personaCard: { flexDirection: 'row', padding: 20, alignItems: 'flex-start' },
  personaAvatar: { width: 70, height: 70, borderRadius: 35, backgroundColor: '#8B5CF6', justifyContent: 'center', alignItems: 'center', marginRight: 15, borderWidth: 3, borderColor: '#6D28D9' },
  personaTextBubble: { flex: 1, backgroundColor: '#FAF9F5', padding: 15, borderRadius: 16, borderWidth: 2, borderColor: '#E6E3DA' },
  personaName: { fontSize: 14, fontWeight: 'bold', color: '#8A8F98', marginBottom: 5 },
  questionText: { fontSize: 18, color: '#1F2430', fontWeight: '500' },
  optionsContainer: { paddingHorizontal: 20, marginTop: 10 },
  optionBtn: {
    borderWidth: 2,
    borderColor: '#E6E3DA',
    borderRadius: 16,
    padding: 18,
    marginBottom: 15,
    borderBottomWidth: 4,
  },
  optionBtnSelected: {
    borderColor: '#A5A3F0',
    backgroundColor: '#ECEBFB',
  },
  optionText: { fontSize: 18, color: '#1F2430', textAlign: 'center', fontWeight: 'bold' },
  optionTextSelected: { color: '#4F46E5' },
  footer: { position: 'absolute', bottom: 0, width: '100%', borderTopWidth: 2, borderColor: '#E6E3DA', padding: 20, backgroundColor: '#FFF' },
  resultBanner: { padding: 15, borderRadius: 16, marginBottom: 15 },
  resultText: { fontSize: 20, fontWeight: 'bold' },
  dialogueRow: { flexDirection: 'row', marginTop: 10, alignItems: 'center' },
  dialogueText: { fontSize: 16, fontWeight: '500', flexShrink: 1 },
  checkBtn: {
    backgroundColor: '#2FB67A',
    padding: 18,
    borderRadius: 16,
    borderBottomWidth: 4,
    borderBottomColor: '#1E8A5B',
    alignItems: 'center'
  },
  checkBtnText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' }
});

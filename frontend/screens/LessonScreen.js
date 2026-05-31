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
          <FontAwesome5 name="times" size={24} color="#AFAFAF" />
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
                      optionStyle.push({ backgroundColor: '#D7FFB8', borderColor: '#58A700' });
                      optionTextStyle.push({ color: '#58A700' });
                  } else {
                      optionStyle.push({ backgroundColor: '#FFDFE0', borderColor: '#EA2B2B' });
                      optionTextStyle.push({ color: '#EA2B2B' });
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
          <View style={[styles.resultBanner, { backgroundColor: '#D7FFB8' }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
               <FontAwesome5 name="check-circle" size={24} color="#58A700" solid style={{ marginRight: 10 }} />
               <Text style={[styles.resultText, { color: '#58A700' }]}>Correct! (+{lessonData.xp} XP)</Text>
            </View>
            <View style={styles.dialogueRow}>
               <Ionicons name="volume-medium" size={20} color="#58A700" style={{marginRight: 5}} />
               <Text style={[styles.dialogueText, { color: '#58A700' }]}>{lessonData.success_dialogue}</Text>
            </View>
          </View>
        )}
        {result === 'incorrect' && (
          <View style={[styles.resultBanner, { backgroundColor: '#FFDFE0' }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
               <FontAwesome5 name="times-circle" size={24} color="#EA2B2B" solid style={{ marginRight: 10 }} />
               <Text style={[styles.resultText, { color: '#EA2B2B' }]}>Incorrect.</Text>
            </View>
            <View style={styles.dialogueRow}>
               <Ionicons name="volume-medium" size={20} color="#EA2B2B" style={{marginRight: 5}} />
               <Text style={[styles.dialogueText, { color: '#EA2B2B' }]}>{lessonData.fail_dialogue}</Text>
            </View>
          </View>
        )}

        <TouchableOpacity
          style={[
            styles.checkBtn,
            !selectedOption && { backgroundColor: '#E5E5E5', borderBottomColor: '#E5E5E5' },
            result === 'correct' && { backgroundColor: '#58CC02', borderBottomColor: '#58A700' },
            result === 'incorrect' && { backgroundColor: '#FF4B4B', borderBottomColor: '#EA2B2B' }
          ]}
          disabled={!selectedOption || isSpeaking}
          onPress={result ? () => navigation.goBack() : checkAnswer}
        >
          <Text style={[styles.checkBtnText, !selectedOption && { color: '#AFAFAF' }]}>
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
  progressBar: { flex: 1, height: 16, backgroundColor: '#E5E5E5', borderRadius: 8, marginLeft: 20 },
  progressFill: { height: '100%', backgroundColor: '#58CC02', borderRadius: 8 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#4B4B4B', paddingHorizontal: 20, marginBottom: 10 },
  personaCard: { flexDirection: 'row', padding: 20, alignItems: 'flex-start' },
  personaAvatar: { width: 70, height: 70, borderRadius: 35, backgroundColor: '#CE82FF', justifyContent: 'center', alignItems: 'center', marginRight: 15, borderWidth: 3, borderColor: '#A568CC' },
  personaTextBubble: { flex: 1, backgroundColor: '#F7F7F7', padding: 15, borderRadius: 16, borderWidth: 2, borderColor: '#E5E5E5' },
  personaName: { fontSize: 14, fontWeight: 'bold', color: '#AFAFAF', marginBottom: 5 },
  questionText: { fontSize: 18, color: '#4B4B4B', fontWeight: '500' },
  optionsContainer: { paddingHorizontal: 20, marginTop: 10 },
  optionBtn: {
    borderWidth: 2,
    borderColor: '#E5E5E5',
    borderRadius: 16,
    padding: 18,
    marginBottom: 15,
    borderBottomWidth: 4,
  },
  optionBtnSelected: {
    borderColor: '#84D8FF',
    backgroundColor: '#DDF4FF',
  },
  optionText: { fontSize: 18, color: '#4B4B4B', textAlign: 'center', fontWeight: 'bold' },
  optionTextSelected: { color: '#1CB0F6' },
  footer: { position: 'absolute', bottom: 0, width: '100%', borderTopWidth: 2, borderColor: '#E5E5E5', padding: 20, backgroundColor: '#FFF' },
  resultBanner: { padding: 15, borderRadius: 16, marginBottom: 15 },
  resultText: { fontSize: 20, fontWeight: 'bold' },
  dialogueRow: { flexDirection: 'row', marginTop: 10, alignItems: 'center' },
  dialogueText: { fontSize: 16, fontWeight: '500', flexShrink: 1 },
  checkBtn: {
    backgroundColor: '#58CC02',
    padding: 18,
    borderRadius: 16,
    borderBottomWidth: 4,
    borderBottomColor: '#58A700',
    alignItems: 'center'
  },
  checkBtnText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' }
});

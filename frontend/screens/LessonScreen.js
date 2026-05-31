import React, { useState, useContext, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ActivityIndicator } from 'react-native';
import { AppContext } from '../AppContext';
import { FontAwesome5 } from '@expo/vector-icons';
import { API_URL } from '../config';

const { width } = Dimensions.get('window');

export default function LessonScreen({ navigation, route }) {
  const { language } = useContext(AppContext);
  const lessonTitle = route?.params?.title || "Basics 1";

  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedOption, setSelectedOption] = useState(null);
  const [result, setResult] = useState(null); // 'correct' or 'incorrect'

  // Fetch a dynamically generated question from the AI
  const loadQuestion = async () => {
    setLoading(true);
    setResult(null);
    setSelectedOption(null);
    try {
      const prompt = `Generate a multiple choice question to teach ${language} for the topic "${lessonTitle}".
      Respond ONLY with a raw JSON object in this exact format:
      {"question": "Translate 'Hello' to ${language}", "options": ["Option1", "Option2", "Option3", "Option4"], "answer": "Option2"}`;

      const res = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: prompt, language, level: 'Beginner' })
      });
      const data = await res.json();

      // Attempt to parse JSON from AI response
      let aiText = data.response.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(aiText);
      setQuestion(parsed);
    } catch (err) {
      console.log('Error generating lesson:', err);
      // Fallback question
      setQuestion({
        question: `Translate 'Hello' to ${language}`,
        options: language === 'Japanese' ? ["Konnichiwa", "Arigato", "Sayonara", "Hai"] : ["Annyeong", "Gamsa", "Ne", "Ani"],
        answer: language === 'Japanese' ? "Konnichiwa" : "Annyeong"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuestion();
  }, []);

  const checkAnswer = () => {
    if (selectedOption === question.answer) {
      setResult('correct');
    } else {
      setResult('incorrect');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1CB0F6" />
        <Text style={styles.loadingText}>Generating your personalized lesson...</Text>
      </View>
    );
  }

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

      <Text style={styles.title}>Translate this phrase</Text>

      <View style={styles.questionCard}>
        <Text style={styles.questionText}>{question?.question}</Text>
      </View>

      <View style={styles.optionsContainer}>
        {question?.options.map((opt, i) => {
          const isSelected = selectedOption === opt;
          return (
            <TouchableOpacity
              key={i}
              style={[styles.optionBtn, isSelected && styles.optionBtnSelected]}
              onPress={() => setSelectedOption(opt)}
            >
              <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>{opt}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.footer}>
        {result === 'correct' && (
          <View style={[styles.resultBanner, { backgroundColor: '#D7FFB8' }]}>
            <Text style={[styles.resultText, { color: '#58A700' }]}>Great job!</Text>
          </View>
        )}
        {result === 'incorrect' && (
          <View style={[styles.resultBanner, { backgroundColor: '#FFDFE0' }]}>
            <Text style={[styles.resultText, { color: '#EA2B2B' }]}>Correct solution: {question?.answer}</Text>
          </View>
        )}

        <TouchableOpacity
          style={[
            styles.checkBtn,
            !selectedOption && { backgroundColor: '#E5E5E5', borderBottomColor: '#E5E5E5' },
            result === 'correct' && { backgroundColor: '#58CC02', borderBottomColor: '#58A700' },
            result === 'incorrect' && { backgroundColor: '#FF4B4B', borderBottomColor: '#EA2B2B' }
          ]}
          disabled={!selectedOption}
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
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 20, fontSize: 18, color: '#4B4B4B', fontWeight: 'bold' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20, paddingTop: 50 },
  progressBar: { flex: 1, height: 16, backgroundColor: '#E5E5E5', borderRadius: 8, marginLeft: 20 },
  progressFill: { height: '100%', backgroundColor: '#58CC02', borderRadius: 8 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#4B4B4B', paddingHorizontal: 20, marginBottom: 20 },
  questionCard: { padding: 20, alignItems: 'center' },
  questionText: { fontSize: 20, color: '#4B4B4B' },
  optionsContainer: { paddingHorizontal: 20, marginTop: 20 },
  optionBtn: {
    borderWidth: 2,
    borderColor: '#E5E5E5',
    borderRadius: 16,
    padding: 15,
    marginBottom: 15,
    borderBottomWidth: 4,
  },
  optionBtnSelected: {
    borderColor: '#84D8FF',
    backgroundColor: '#DDF4FF',
  },
  optionText: { fontSize: 18, color: '#4B4B4B', textAlign: 'center' },
  optionTextSelected: { color: '#1CB0F6', fontWeight: 'bold' },
  footer: { position: 'absolute', bottom: 0, width: '100%', borderTopWidth: 2, borderColor: '#E5E5E5', padding: 20, backgroundColor: '#FFF' },
  resultBanner: { padding: 15, borderRadius: 16, marginBottom: 15 },
  resultText: { fontSize: 18, fontWeight: 'bold' },
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

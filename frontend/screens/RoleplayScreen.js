import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { AppContext } from '../AppContext';
import { FontAwesome5 } from '@expo/vector-icons';

export default function RoleplayScreen({ navigation }) {
  const { language } = useContext(AppContext);

  const scenarios = [
    { id: 1, title: 'Chat with a Friend', description: 'Casual, everyday conversation.', icon: 'user-friends', color: '#1CB0F6', persona: 'Close Friend' },
    { id: 2, title: 'Restaurant Order', description: 'Practice ordering food and drinks.', icon: 'utensils', color: '#FF9600', persona: 'Waiter' },
    { id: 3, title: 'Teacher Review', description: 'Formal check of your grammar.', icon: 'chalkboard-teacher', color: '#CE82FF', persona: 'Strict Language Teacher' },
    { id: 4, title: 'Customs Officer', description: 'Arriving at the airport.', icon: 'passport', color: '#FF4B4B', persona: 'Airport Customs Officer' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <FontAwesome5 name="headset" size={28} color="#1CB0F6" />
        <Text style={styles.headerTitle}>1-on-1 Voice Call</Text>
      </View>

      <ScrollView contentContainerStyle={styles.list}>
        <Text style={styles.subTitle}>Select a scenario to practice {language}:</Text>

        {scenarios.map(scenario => (
          <TouchableOpacity
            key={scenario.id}
            style={[styles.card, { borderLeftColor: scenario.color }]}
            onPress={() => navigation.navigate('Call', { scenario })}
          >
            <View style={[styles.iconBox, { backgroundColor: scenario.color }]}>
              <FontAwesome5 name={scenario.icon} size={24} color="#FFF" />
            </View>
            <View style={styles.cardText}>
              <Text style={styles.cardTitle}>{scenario.title}</Text>
              <Text style={styles.cardDesc}>{scenario.description}</Text>
            </View>
            <FontAwesome5 name="chevron-right" size={20} color="#AFAFAF" />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F7F7' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    paddingTop: 50,
    backgroundColor: '#FFF',
    borderBottomWidth: 2,
    borderColor: '#E5E5E5'
  },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#4B4B4B', marginLeft: 15 },
  list: { padding: 20 },
  subTitle: { fontSize: 16, color: '#4B4B4B', fontWeight: 'bold', marginBottom: 20 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderWidth: 2,
    borderColor: '#E5E5E5',
    borderLeftWidth: 8,
    borderRadius: 16,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  iconBox: { width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  cardText: { flex: 1 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#4B4B4B' },
  cardDesc: { fontSize: 14, color: '#AFAFAF', marginTop: 4 }
});

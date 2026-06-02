import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { AppContext } from '../AppContext';
import { FontAwesome5 } from '@expo/vector-icons';

export default function RoleplayScreen({ navigation }) {
  const { language } = useContext(AppContext);

  const scenarios = [
    { id: 1, title: 'Chat with a Friend', description: 'Casual, everyday conversation.', icon: 'user-friends', color: '#4F46E5', persona: 'Close Friend' },
    { id: 2, title: 'Restaurant Order', description: 'Practice ordering food and drinks.', icon: 'utensils', color: '#F59E0B', persona: 'Waiter' },
    { id: 3, title: 'Teacher Review', description: 'Formal check of your grammar.', icon: 'chalkboard-teacher', color: '#8B5CF6', persona: 'Strict Language Teacher' },
    { id: 4, title: 'Customs Officer', description: 'Arriving at the airport.', icon: 'passport', color: '#E5484D', persona: 'Airport Customs Officer' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <FontAwesome5 name="headset" size={28} color="#4F46E5" />
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
            <FontAwesome5 name="chevron-right" size={20} color="#8A8F98" />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF9F5' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    paddingTop: 50,
    backgroundColor: '#FFF',
    borderBottomWidth: 2,
    borderColor: '#E6E3DA'
  },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#1F2430', marginLeft: 15 },
  list: { padding: 20 },
  subTitle: { fontSize: 16, color: '#1F2430', fontWeight: 'bold', marginBottom: 20 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderWidth: 2,
    borderColor: '#E6E3DA',
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
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#1F2430' },
  cardDesc: { fontSize: 14, color: '#8A8F98', marginTop: 4 }
});

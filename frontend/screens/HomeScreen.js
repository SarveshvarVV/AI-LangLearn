import React, { useEffect, useState, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { AppContext } from '../AppContext';
import { API_URL } from '../config';
import { COLORS, SPACING, RADIUS, TYPE, SHADOW } from '../theme';

// Gentle horizontal stagger so the path meanders without the cartoonish swing.
const getStaggeredMargin = (index) => {
  const positions = [0, 28, 52, 28, 0, -28, -52, -28];
  return positions[index % positions.length];
};

// Calm accent rotation for lesson nodes (kept within the premium palette).
const NODE_ACCENTS = [COLORS.primary, COLORS.violet, COLORS.success, COLORS.warning];

export default function HomeScreen({ navigation }) {
  const { language, progress, setProgress } = useContext(AppContext);
  const [curriculum, setCurriculum] = useState([]);

  useEffect(() => {
    fetch(`${API_URL}/api/progress`)
      .then((res) => res.json())
      .then((data) =>
        setProgress((prev) => ({
          ...prev,
          xp: data.xp,
          streak: data.streak,
          hearts: data.hearts,
          gems: data.gems,
        }))
      )
      .catch((err) => console.log('Fetch error:', err));

    fetch(`${API_URL}/api/curriculum?language=${language}`)
      .then((res) => res.json())
      .then((data) => setCurriculum(data))
      .catch((err) => console.log('Fetch curriculum error:', err));
  }, [language]);

  // Simple level model: every 100 XP is a level; progress bar shows the remainder.
  const level = Math.floor((progress.xp || 0) / 100) + 1;
  const levelProgress = ((progress.xp || 0) % 100) / 100;

  let nodeCounter = 0;

  const Stat = ({ icon, value, color }) => (
    <View style={styles.statContainer}>
      <FontAwesome5 name={icon} size={16} color={color} solid />
      <Text style={[styles.stat, { color }]}>{value}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.topBar}>
        <View style={styles.flagContainer}>
          <Text style={styles.flag}>{language === 'Japanese' ? '🇯🇵' : '🇰🇷'}</Text>
        </View>
        <View style={styles.statsRow}>
          <Stat icon="fire" value={progress.streak ?? 0} color={COLORS.warning} />
          <Stat icon="bolt" value={progress.xp ?? 0} color={COLORS.primary} />
          <Stat icon="gem" value={progress.gems ?? 0} color={COLORS.gold} />
          <Stat icon="heart" value={progress.hearts ?? 0} color={COLORS.danger} />
        </View>
      </View>

      {/* Level progress */}
      <View style={styles.levelBar}>
        <Text style={styles.levelLabel}>Level {level}</Text>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${levelProgress * 100}%` }]} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.path}>
        {curriculum.map((moduleData, modIndex) => (
          <View key={`mod-${modIndex}`} style={styles.moduleContainer}>
            <View style={styles.moduleHeader}>
              <Text style={styles.moduleTitle}>{moduleData.module}</Text>
            </View>

            {moduleData.lessons.map((lesson) => {
              const marginLeft = getStaggeredMargin(nodeCounter);
              const accent = NODE_ACCENTS[nodeCounter % NODE_ACCENTS.length];
              nodeCounter++;

              const isBoss = lesson.lesson_name === 'Conversation';
              const isScript = lesson.lesson_name === 'Script';
              let icon = 'star';
              if (isBoss) icon = 'crown';
              else if (isScript) icon = 'font';
              else if (lesson.lesson_name.includes('Greetings')) icon = 'comment';
              else if (lesson.lesson_name.includes('Numbers')) icon = 'hashtag';
              else if (lesson.lesson_name.includes('Ordering') || lesson.lesson_name.includes('Basics'))
                icon = 'mug-hot';

              const nodeColor = isBoss ? COLORS.warning : accent;

              return (
                <View key={lesson.id} style={[styles.nodeWrapper, { marginLeft }]}>
                  <TouchableOpacity
                    style={[styles.node, { backgroundColor: nodeColor }]}
                    activeOpacity={0.85}
                    onPress={() => navigation.navigate('Lesson', { lessonData: lesson })}
                  >
                    <FontAwesome5 name={icon} size={26} color={COLORS.white} solid />
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
  container: { flex: 1, backgroundColor: COLORS.bg },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingTop: 50,
    paddingBottom: SPACING.md,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
    zIndex: 10,
  },
  flagContainer: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.sm,
  },
  flag: { fontSize: 22 },
  statsRow: { flexDirection: 'row', alignItems: 'center' },
  statContainer: { flexDirection: 'row', alignItems: 'center', marginLeft: SPACING.md },
  stat: { fontSize: 15, fontWeight: '700', marginLeft: 6 },
  levelBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.surface,
  },
  levelLabel: { ...TYPE.label, color: COLORS.primary, marginRight: SPACING.sm },
  progressTrack: {
    flex: 1,
    height: 8,
    backgroundColor: COLORS.surfaceAlt,
    borderRadius: RADIUS.pill,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: COLORS.primary, borderRadius: RADIUS.pill },
  path: { alignItems: 'center', paddingVertical: SPACING.lg, paddingBottom: 100 },
  moduleContainer: { width: '100%', alignItems: 'center' },
  moduleHeader: {
    backgroundColor: COLORS.surface,
    width: '90%',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: RADIUS.md,
    marginVertical: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    ...SHADOW.card,
  },
  moduleTitle: { ...TYPE.heading, color: COLORS.ink },
  nodeWrapper: { alignItems: 'center', marginVertical: SPACING.md },
  node: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOW.floating,
  },
  nodeTitle: { marginTop: SPACING.sm, ...TYPE.label, color: COLORS.inkSoft },
});

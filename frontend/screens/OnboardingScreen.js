import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { AppContext } from '../AppContext';
import { COLORS, SPACING, RADIUS, TYPE, SHADOW } from '../theme';

export default function OnboardingScreen() {
  const { setLanguage } = useContext(AppContext);

  const languages = [
    { key: 'Japanese', flag: '🇯🇵', glyph: 'あ', sub: 'Hiragana → JLPT N5' },
    { key: 'Korean', flag: '🇰🇷', glyph: '한', sub: 'Hangul → TOPIK I' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.brand}>AI-LangLearn</Text>
        <Text style={styles.title}>Speak Japanese & Korean, for real.</Text>
        <Text style={styles.subtitle}>
          A calm, gamified path with a patient AI tutor that helps you actually talk —
          not just tap tiles.
        </Text>
      </View>

      <View style={styles.optionsContainer}>
        {languages.map((lang) => (
          <TouchableOpacity
            key={lang.key}
            style={styles.langButton}
            activeOpacity={0.85}
            onPress={() => setLanguage(lang.key)}
          >
            <View style={styles.glyphCircle}>
              <Text style={styles.glyph}>{lang.glyph}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.langText}>
                {lang.flag}  {lang.key}
              </Text>
              <Text style={styles.langSub}>{lang.sub}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.footnote}>Pick a language to start your first lesson</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  header: { marginBottom: SPACING.xl },
  brand: {
    ...TYPE.label,
    color: COLORS.primary,
    letterSpacing: 1,
    marginBottom: SPACING.md,
  },
  title: { ...TYPE.display, marginBottom: SPACING.sm },
  subtitle: { ...TYPE.body, lineHeight: 24 },
  optionsContainer: { width: '100%' },
  langButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    ...SHADOW.card,
  },
  glyphCircle: {
    width: 56,
    height: 56,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primarySoft,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  glyph: { fontSize: 28, color: COLORS.primaryDark, fontWeight: '600' },
  langText: { ...TYPE.heading },
  langSub: { ...TYPE.label, fontWeight: '400', marginTop: 2 },
  footnote: {
    ...TYPE.label,
    fontWeight: '400',
    textAlign: 'center',
    marginTop: SPACING.xl,
  },
});

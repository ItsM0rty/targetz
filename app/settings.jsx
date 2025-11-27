import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../src/theme/useTheme';
import { useSettingsStore } from '../src/stores/settingsStore';

export default function SettingsScreen() {
  const { colors, isDark } = useTheme();
  const router = useRouter();
  const {
    mode,
    theme,
    setMode,
    setTheme,
  } = useSettingsStore();
  
  const insets = useSafeAreaInsets();
  
  return (
    <LinearGradient colors={colors.gradient} style={styles.gradient}>
      <SafeAreaView style={[styles.container, { paddingTop: insets.top + 12 }]} edges={['top', 'left', 'right']}>
        <BlurView tint={isDark ? 'dark' : 'light'} intensity={45} style={[styles.header, { backgroundColor: colors.surface }]}> 
          <TouchableOpacity onPress={() => router.back()} style={[styles.headerButton, { borderColor: colors.border }]}> 
            <Text style={[styles.backButton, { color: colors.accent }]}>← Back</Text>
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.text }]}>Settings</Text>
        </BlurView>
        
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* Mode Toggle */}
          <View style={styles.sectionWrapper}>
            <LinearGradient colors={[`${colors.accent}22`, `${colors.border}`]} style={styles.sectionGradient}> 
              <BlurView
                intensity={isDark ? 24 : 18}
                tint={isDark ? 'dark' : 'light'}
                style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}
              >
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Mode</Text>
                <View style={styles.row}>
                  {['free', 'paid'].map((value, index) => {
                    const isActive = mode === value;
                    return (
                      <TouchableOpacity
                        key={value}
                        style={[
                          styles.modeButton,
                          index === 0 && styles.modeButtonSpacing,
                          { borderColor: colors.border },
                          isActive && [styles.modeButtonActive, { backgroundColor: colors.accent }]
                        ]}
                        onPress={() => setMode(value)}
                      >
                        <Text style={[styles.modeText, { color: isActive ? '#041016' : colors.text }]}>
                          {value.charAt(0).toUpperCase() + value.slice(1)}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </BlurView>
            </LinearGradient>
          </View>
         
          {/* Theme Selector */}
          <View style={styles.sectionWrapper}>
            <LinearGradient colors={[`${colors.accentSecondary}18`, `${colors.border}`]} style={styles.sectionGradient}>
              <BlurView
                intensity={isDark ? 24 : 18}
                tint={isDark ? 'dark' : 'light'}
                style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}
              >
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Theme</Text>
                <View style={styles.row}>
                  {['light', 'dark', 'system'].map((t, index) => {
                    const isActive = theme === t;
                    return (
                      <TouchableOpacity
                        key={t}
                        style={[
                          styles.themeButton,
                          index !== 2 && styles.themeButtonSpacing,
                          { borderColor: colors.border },
                          isActive && [styles.themeButtonActive, { backgroundColor: colors.accentSecondary }]
                        ]}
                        onPress={() => setTheme(t)}
                      >
                        <Text
                          style={[
                            styles.themeText,
                            { color: isActive ? '#041016' : colors.text }
                          ]}
                        >
                          {t.charAt(0).toUpperCase() + t.slice(1)}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </BlurView>
            </LinearGradient>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 24,
  },
  headerButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
  },
  backButton: {
    fontSize: 14,
    fontWeight: '600',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  content: {
    paddingBottom: 120,
    gap: 18,
  },
  sectionWrapper: {
    borderRadius: 24,
  },
  sectionGradient: {
    borderRadius: 24,
    padding: 1,
  },
  section: {
    padding: 20,
    borderRadius: 23,
    borderWidth: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 12,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  flex1: {
    flex: 1,
  },
  modeButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  modeButtonSpacing: {
    marginRight: 12,
  },
  modeButtonActive: {
    shadowColor: '#5EEAD4',
    shadowOpacity: 0.25,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 12 },
  },
  modeText: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.6,
  },
  themeButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  themeButtonSpacing: {
    marginRight: 12,
  },
  themeButtonActive: {
    shadowColor: '#38BDF8',
    shadowOpacity: 0.25,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 12 },
  },
  themeText: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.6,
  },
  permissionSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  quickLink: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
  },
  quickLinkLabel: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.6,
  },
  appGridWrapper: {
    marginTop: 16,
  },
  appGridTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 12,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  appGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  appTile: {
    width: 96,
    height: 96,
    borderRadius: 24,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 6,
    marginBottom: 12,
    backgroundColor: 'rgba(148, 163, 184, 0.08)',
  },
  appTileAll: {
    backgroundColor: 'rgba(94, 234, 212, 0.16)',
  },
  appTileAdd: {
    borderStyle: 'dashed',
  },
  appTileIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  appTileLabel: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  appTileRemove: {
    fontSize: 11,
    marginTop: 6,
  },
  appLimitHint: {
    marginTop: 4,
    fontSize: 12,
  },
  permissionButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  permissionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  permissionStatus: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 12,
  },
  intervalButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  intervalButtonSpacing: {
    marginRight: 12,
  },
  intervalText: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.6,
  },
});


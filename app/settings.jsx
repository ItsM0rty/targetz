import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../src/theme/useTheme';
import { useSettingsStore } from '../src/stores/settingsStore';
import { shallow } from 'zustand/shallow';

export default function SettingsScreen() {
  const { colors, isDark } = useTheme();
  const router = useRouter();
  // Use shallow comparison for multiple values to prevent unnecessary re-renders
  // Only re-renders when mode or theme actually changes
  const { mode, theme, setMode, setTheme } = useSettingsStore(
    (state) => ({
      mode: state.mode,
      theme: state.theme,
      setMode: state.setMode,
      setTheme: state.setTheme,
    }),
    shallow
  );
  
  const insets = useSafeAreaInsets();

  const handleThemeChange = useCallback((t) => {
    setTheme(t);
  }, [setTheme]);

  const handleModeChange = useCallback((m) => {
    setMode(m);
  }, [setMode]);

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);
  
  return (
    <LinearGradient colors={colors.gradient} style={styles.gradient}>
      <SafeAreaView style={[styles.container, { paddingTop: insets.top + 12 }]} edges={['top', 'left', 'right']}>
          <BlurView tint={isDark ? 'dark' : 'light'} intensity={45} style={[styles.header, { backgroundColor: colors.surface }]}> 
            <Pressable 
              delayPressIn={0}
              delayPressOut={0}
              onPress={handleBack} 
              style={({ pressed }) => [
                styles.headerButton, 
                { borderColor: colors.border, opacity: pressed ? 0.6 : 1 }
              ]}
            > 
              <Ionicons name="chevron-back" size={20} color={colors.accent} />
            </Pressable>
            <Text style={[styles.title, { color: colors.text }]}>Settings</Text>
          </BlurView>
        
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* Appearance Section */}
          <View style={styles.sectionWrapper}>
            <LinearGradient colors={[`${colors.accentSecondary}18`, `${colors.border}`]} style={styles.sectionGradient}>
              <BlurView
                intensity={isDark ? 24 : 18}
                tint={isDark ? 'dark' : 'light'}
                style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}
              >
                <View style={styles.sectionHeader}>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>Appearance</Text>
                  <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
                    Customize how Targetz looks and feels
                  </Text>
                </View>
                
                {/* Theme Selector */}
                <View style={styles.settingGroup}>
                  <Text style={[styles.settingLabel, { color: colors.text }]}>Theme</Text>
                  <View style={styles.row}>
                    {['light', 'dark', 'system'].map((t, index) => {
                      const isActive = theme === t;
                      return (
                        <Pressable
                          key={t}
                          delayPressIn={0}
                          delayPressOut={0}
                          style={({ pressed }) => [
                            styles.themeButton,
                            index !== 2 && styles.themeButtonSpacing,
                            { borderColor: colors.border, opacity: pressed ? 0.6 : 1 },
                            isActive && [styles.themeButtonActive, { backgroundColor: colors.accentSecondary }]
                          ]}
                          onPress={() => handleThemeChange(t)}
                        >
                          <Text
                            style={[
                              styles.themeText,
                              { color: isActive ? '#041016' : colors.text }
                            ]}
                          >
                            {t.charAt(0).toUpperCase() + t.slice(1)}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              </BlurView>
            </LinearGradient>
          </View>

          {/* Subscription Section */}
          <View style={styles.sectionWrapper}>
            <LinearGradient colors={[`${colors.accent}22`, `${colors.border}`]} style={styles.sectionGradient}> 
              <BlurView
                intensity={isDark ? 24 : 18}
                tint={isDark ? 'dark' : 'light'}
                style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}
              >
                <View style={styles.sectionHeader}>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>Subscription</Text>
                  <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
                    Choose your plan and unlock premium features
                  </Text>
                </View>
                <View style={styles.settingGroup}>
                  <Text style={[styles.settingLabel, { color: colors.text }]}>Current Mode</Text>
                  <View style={styles.row}>
                    {['free', 'paid'].map((value, index) => {
                      const isActive = mode === value;
                      return (
                        <Pressable
                          key={value}
                          delayPressIn={0}
                          delayPressOut={0}
                          style={({ pressed }) => [
                            styles.modeButton,
                            index === 0 && styles.modeButtonSpacing,
                            { borderColor: colors.border, opacity: pressed ? 0.6 : 1 },
                            isActive && [styles.modeButtonActive, { backgroundColor: colors.accent }]
                          ]}
                          onPress={() => handleModeChange(value)}
                        >
                          <Text style={[styles.modeText, { color: isActive ? '#041016' : colors.text }]}>
                            {value.charAt(0).toUpperCase() + value.slice(1)}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                  {mode === 'free' && (
                    <Text style={[styles.hintText, { color: colors.textSecondary }]}>
                      Upgrade to paid mode for unlimited targets and advanced features
                    </Text>
                  )}
                </View>
              </BlurView>
            </LinearGradient>
          </View>

          {/* About Section */}
          <View style={styles.sectionWrapper}>
            <LinearGradient colors={[`${colors.border}15`, `${colors.border}`]} style={styles.sectionGradient}>
              <BlurView
                intensity={isDark ? 24 : 18}
                tint={isDark ? 'dark' : 'light'}
                style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}
              >
                <View style={styles.sectionHeader}>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>About</Text>
                  <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
                    App information and version details
                  </Text>
                </View>
                
                <View style={styles.infoRow}>
                  <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Version</Text>
                  <Text style={[styles.infoValue, { color: colors.text }]}>1.0.0</Text>
                </View>
                
                <View style={[styles.infoRow, styles.infoRowLast]}>
                  <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Build</Text>
                  <Text style={[styles.infoValue, { color: colors.text }]}>2024.1</Text>
                </View>
              </BlurView>
            </LinearGradient>
          </View>

          {/* Support Section */}
          <View style={styles.sectionWrapper}>
            <LinearGradient colors={[`${colors.accentSecondary}12`, `${colors.border}`]} style={styles.sectionGradient}>
              <BlurView
                intensity={isDark ? 24 : 18}
                tint={isDark ? 'dark' : 'light'}
                style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}
              >
                <View style={styles.sectionHeader}>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>Support</Text>
                  <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
                    Get help and share feedback
                  </Text>
                </View>
                
                <Pressable 
                  delayPressIn={0}
                  delayPressOut={0}
                  style={({ pressed }) => [
                    styles.supportButton, 
                    { borderColor: colors.border, opacity: pressed ? 0.6 : 1 }
                  ]}
                  onPress={() => {}}
                >
                  <Text style={[styles.supportButtonText, { color: colors.text }]}>
                    Send Feedback
                  </Text>
                </Pressable>
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
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 24,
    position: 'relative',
  },
  headerButton: {
    position: 'absolute',
    left: 20,
    width: 36,
    height: 36,
    borderRadius: 12,
    borderWidth: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButton: {
    fontSize: 14,
    fontWeight: '600',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: 0.6,
    textAlign: 'center',
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
  sectionHeader: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  sectionSubtitle: {
    fontSize: 13,
    lineHeight: 18,
    opacity: 0.8,
  },
  settingGroup: {
    marginTop: 4,
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
    letterSpacing: 0.2,
  },
  hintText: {
    fontSize: 12,
    marginTop: 10,
    lineHeight: 16,
    fontStyle: 'italic',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(148, 163, 184, 0.15)',
  },
  infoRowLast: {
    borderBottomWidth: 0,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  supportButton: {
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    marginTop: 8,
  },
  supportButtonText: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.3,
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


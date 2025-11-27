import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useTheme } from '../theme/useTheme';
import { useSettingsStore } from '../stores/settingsStore';

const AVAILABLE_APPS = [
  { id: 'instagram', name: 'Instagram', package: 'com.instagram.android', icon: '📸' },
  { id: 'youtube', name: 'YouTube', package: 'com.google.android.youtube', icon: '▶️' },
  { id: 'tiktok', name: 'TikTok', package: 'com.zhiliaoapp.musically', icon: '🎵' },
  { id: 'reddit', name: 'Reddit', package: 'com.reddit.frontpage', icon: '👽' },
  { id: 'twitter', name: 'X / Twitter', package: 'com.twitter.android', icon: '🐦' },
  { id: 'netflix', name: 'Netflix', package: 'com.netflix.mediaclient', icon: '🍿' },
];

const AppSelectionModal = ({ visible, onClose, onSelect, selectedApps, isPaid }) => {
  const { colors } = useTheme();
  const available = useMemo(
    () => AVAILABLE_APPS.filter((app) => !selectedApps.includes(app.package)),
    [selectedApps]
  );

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.surface, borderColor: colors.border }]}> 
          <Text style={[styles.modalTitle, { color: colors.text }]}>Choose focus apps</Text>
          <Text style={[styles.modalSubtitle, { color: colors.textSecondary }]}>We'll remind you when these launch.</Text>
          <ScrollView style={styles.modalList}>
            {isPaid && !selectedApps.includes('__ALL__') && (
              <TouchableOpacity
                style={[styles.modalListItem, { borderColor: colors.border }]}
                onPress={() => onSelect('__ALL__')}
              >
                <Text style={[styles.modalItemIcon, { backgroundColor: colors.surfaceElevated }]}>✨</Text>
                <View style={styles.modalItemTextGroup}>
                  <Text style={[styles.modalItemLabel, { color: colors.text }]}>Select all apps</Text>
                  <Text style={[styles.modalItemHint, { color: colors.textSecondary }]}>Cover every installed app</Text>
                </View>
              </TouchableOpacity>
            )}
            {available.map((app) => (
              <TouchableOpacity
                key={app.id}
                style={[styles.modalListItem, { borderColor: colors.border }]}
                onPress={() => onSelect(app.package)}
              >
                <Text style={[styles.modalItemIcon, { backgroundColor: colors.surfaceElevated }]}>{app.icon}</Text>
                <View style={styles.modalItemTextGroup}>
                  <Text style={[styles.modalItemLabel, { color: colors.text }]}>{app.name}</Text>
                  <Text style={[styles.modalItemHint, { color: colors.textSecondary }]}>{app.package}</Text>
                </View>
              </TouchableOpacity>
            ))}
            {!available.length && !isPaid && (
              <View style={styles.modalEmptyState}>
                <Text style={[styles.modalItemHint, { color: colors.textSecondary }]}>Upgrade to add more apps.</Text>
              </View>
            )}
          </ScrollView>
          <TouchableOpacity style={[styles.modalCloseButton, { borderColor: colors.border }]} onPress={onClose}>
            <Text style={[styles.modalCloseLabel, { color: colors.textSecondary }]}>Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export const FocusAppsCard = () => {
  const { colors } = useTheme();
  const {
    mode,
    monitoredApps,
    addMonitoredApp,
    removeMonitoredApp,
  } = useSettingsStore();

  const [pickerVisible, setPickerVisible] = useState(false);

  const selectedIsAll = monitoredApps.includes('__ALL__');
  const canAddMore = mode === 'paid' || (!selectedIsAll && monitoredApps.length < 2);

  return (
    <>
      <BlurView tint="dark" intensity={20} style={[styles.card, { borderColor: colors.border, backgroundColor: colors.surface }]}> 
        <View style={styles.headerRow}>
          <View style={styles.headerTextGroup}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Focus Apps</Text>
            <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>We'll nudge you when these open.</Text>
          </View>
        </View>

        <View style={styles.grid}> 
          {selectedIsAll ? (
            <View style={[styles.appTile, styles.appTileAll, { borderColor: colors.border }]}> 
              <TouchableOpacity style={styles.appTileClose} onPress={() => removeMonitoredApp('__ALL__')}>
                <Text style={styles.appTileCloseLabel}>×</Text>
              </TouchableOpacity>
              <Text style={styles.appTileIcon}>✨</Text>
              <Text style={[styles.appTileLabel, { color: colors.text }]}>All apps</Text>
            </View>
          ) : (
            monitoredApps.map((pkg) => {
              const app = AVAILABLE_APPS.find((item) => item.package === pkg);
              return (
                <View key={pkg} style={[styles.appTile, { borderColor: colors.border }]}> 
                  <TouchableOpacity style={styles.appTileClose} onPress={() => removeMonitoredApp(pkg)}>
                    <Text style={styles.appTileCloseLabel}>×</Text>
                  </TouchableOpacity>
                  <Text style={styles.appTileIcon}>{app?.icon || '📱'}</Text>
                  <Text style={[styles.appTileLabel, { color: colors.text }]}>{app?.name || pkg}</Text>
                </View>
              );
            })
          )}
          {canAddMore && !selectedIsAll && (
            <TouchableOpacity
              style={[styles.appTile, styles.appTileAdd, { borderColor: colors.border }]}
              onPress={() => setPickerVisible(true)}
            >
              <Text style={[styles.appTileIcon, { color: colors.accent }]}>＋</Text>
              <Text style={[styles.appTileLabel, { color: colors.textSecondary }]}>Add app</Text>
            </TouchableOpacity>
          )}
        </View>

        {mode === 'free' && !selectedIsAll && (
          <Text style={[styles.limitHint, { color: colors.textSecondary }]}>Free plan supports 2 focus apps.</Text>
        )}
      </BlurView>

      <AppSelectionModal
        visible={pickerVisible}
        onClose={() => setPickerVisible(false)}
        onSelect={(pkg) => {
          addMonitoredApp(pkg);
          setPickerVisible(false);
        }}
        selectedApps={monitoredApps}
        isPaid={mode === 'paid'}
      />
    </>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  headerTextGroup: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 12,
  },
  grid: {
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
    position: 'relative',
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
  appTileClose: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#F87171',
    alignItems: 'center',
    justifyContent: 'center',
  },
  appTileCloseLabel: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 16,
    marginTop: -1,
  },
  limitHint: {
    marginTop: 6,
    fontSize: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(3,8,23,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  modalContent: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 24,
    borderWidth: 1,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
  },
  modalSubtitle: {
    fontSize: 13,
    marginBottom: 20,
  },
  modalList: {
    maxHeight: 320,
  },
  modalListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 12,
  },
  modalItemIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    textAlign: 'center',
    textAlignVertical: 'center',
    marginRight: 12,
    fontSize: 22,
    lineHeight: 42,
  },
  modalItemTextGroup: {
    flex: 1,
  },
  modalItemLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  modalItemHint: {
    fontSize: 12,
    marginTop: 4,
  },
  modalCloseButton: {
    marginTop: 12,
    alignSelf: 'center',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
  },
  modalCloseLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  modalEmptyState: {
    alignItems: 'center',
    paddingVertical: 16,
  },
});

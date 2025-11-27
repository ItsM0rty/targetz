import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../theme/useTheme';

export const DateTabs = ({ selected, onSelect }) => {
  const { colors } = useTheme();
  
  const tabs = [
    { key: 'today', label: 'Today' },
    { key: 'tomorrow', label: 'Tomorrow' },
    { key: 'future', label: 'Future' },
    { key: 'all', label: 'All' },
  ];
  
  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border }]}> 
      {tabs.map((tab) => {
        const isActive = selected === tab.key;
        return (
          <TouchableOpacity
            key={tab.key}
            onPress={() => onSelect(tab.key)}
            activeOpacity={0.85}
            style={styles.tabWrapper}
          >
            {isActive ? (
              <LinearGradient
                colors={[colors.accent, colors.accentSecondary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.activeTab}
              >
                <Text style={[styles.tabText, styles.activeText]}> {tab.label} </Text>
              </LinearGradient>
            ) : (
              <View style={[styles.tab, { backgroundColor: 'transparent' }]}> 
                <Text style={[styles.tabText, { color: colors.textSecondary }]}>{tab.label}</Text>
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: 18,
    padding: 4,
    gap: 8,
  },
  tabWrapper: {
    flex: 1,
    borderRadius: 14,
  },
  tab: {
    flex: 1,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  activeTab: {
    flex: 1,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    shadowColor: '#5EEAD4',
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 10 },
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.6,
  },
  activeText: {
    color: '#0B1120',
  },
});


import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../theme/useTheme';

const DAY_IN_MS = 24 * 60 * 60 * 1000;

const getScreenWidth = () => Dimensions.get('window').width;
const CARD_GAP = 10; // Gap between cards
const ADD_BUTTON_WIDTH = 80; // More compact add button
const DAYS_COUNT = 6;
const MIN_PADDING = 20; // Minimum horizontal padding

const startOfDay = (timestamp = Date.now()) => {
  const date = new Date(timestamp);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
};

const buildDays = (count = 5) => {
  const today = startOfDay();
  return Array.from({ length: count }, (_, index) => {
    const date = new Date(today + index * DAY_IN_MS);
    // Labels with proper text fitting to prevent wrapping
    let label;
    if (index === 0) {
      label = 'Today';
    } else {
      label = date.toLocaleDateString(undefined, { weekday: 'short' });
    }
    return {
      key: `day-${index}`,
      label,
      dateValue: startOfDay(date.getTime()),
      subLabel: date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    };
  });
};

export const CalendarCarousel = React.memo(({ selectedDate, onSelectDate, onAddPress }) => {
  const { colors } = useTheme();
  const days = useMemo(() => buildDays(6), []);
  const selectedDay = startOfDay(selectedDate);
  
  // Use fixed padding (matches container padding of 20px)
  const horizontalPadding = MIN_PADDING;
  
  // Calculate card width to use full available width (screen width, not parent width)
  const { cardWidth } = useMemo(() => {
    const SCREEN_WIDTH = getScreenWidth();
    // Total gaps: 5 gaps between 6 cards + 1 gap before add button = 6 gaps
    const TOTAL_GAPS = (DAYS_COUNT - 1) * CARD_GAP + CARD_GAP;
    const AVAILABLE_WIDTH = SCREEN_WIDTH - (horizontalPadding * 2) - TOTAL_GAPS - ADD_BUTTON_WIDTH;
    const CARD_WIDTH = Math.floor(AVAILABLE_WIDTH / DAYS_COUNT);
    return { cardWidth: Math.max(CARD_WIDTH, 70) }; // Minimum 70px width
  }, [horizontalPadding]);

  return (
    <ScrollView
      horizontal
      contentContainerStyle={[styles.container, { paddingHorizontal: horizontalPadding }]}
      showsHorizontalScrollIndicator={false}
      style={styles.scrollView}
    >
      {days.map((day, index) => {
        const isActive = selectedDay === day.dateValue;
        return (
          <TouchableOpacity
            key={day.key}
            activeOpacity={0.85}
            style={styles.cardWrapper}
            onPress={() => onSelectDate(day.dateValue)}
          >
            <LinearGradient
              colors={isActive ? [colors.accent, colors.accentSecondary] : ['rgba(148, 163, 184, 0.08)', 'rgba(15,23,42,0.12)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.card, isActive && styles.cardActive, { borderColor: colors.border, width: cardWidth }]}
            >
              <Text 
                style={[styles.cardLabel, isActive ? styles.cardLabelActive : { color: colors.text }]}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.8}
              >
                {day.label}
              </Text>
              <Text 
                style={[styles.cardSubLabel, isActive ? styles.cardSubLabelActive : { color: colors.textSecondary }]}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.85}
              >
                {day.subLabel}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        );
      })}

      <TouchableOpacity
        activeOpacity={0.9}
        style={styles.cardWrapper}
        onPress={onAddPress}
      >
        <LinearGradient
          colors={[`${colors.accentSecondary}30`, `${colors.accent}20`]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.card, styles.addCard, { borderColor: colors.border, width: ADD_BUTTON_WIDTH }]}
        >
          <Text style={[styles.addIcon, { color: colors.accent }]}>＋</Text>
          <Text style={[styles.cardSubLabel, { color: colors.textSecondary }]}>Add</Text>
        </LinearGradient>
      </TouchableOpacity>
    </ScrollView>
  );
});

const styles = StyleSheet.create({
  scrollView: {
    width: Dimensions.get('window').width, // Use actual screen width
  },
  container: {
    paddingVertical: 8,
    // paddingHorizontal is now set dynamically in component
    alignItems: 'center',
  },
  cardWrapper: {
    marginRight: CARD_GAP,
  },
  firstCardWrapper: {
    // No special styling needed
  },
  lastCardWrapper: {
    marginRight: CARD_GAP, // Keep gap before add button
  },
  card: {
    // width is set dynamically in component
    height: 76, // More compact height
    borderRadius: 18, // Slightly less rounded for modern look
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 6,
    shadowColor: 'rgba(15, 23, 42, 0.25)',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  cardActive: {
    shadowColor: '#5EEAD4',
    shadowOpacity: 0.4,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  cardLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 3,
    textAlign: 'center',
  },
  cardLabelActive: {
    color: '#041016',
    fontWeight: '700',
  },
  cardSubLabel: {
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'center',
  },
  cardSubLabelActive: {
    color: '#041016',
  },
  addCard: {
    backgroundColor: 'rgba(94, 234, 212, 0.12)',
  },
  addIcon: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 4,
  },
});

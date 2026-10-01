// Selector de días de la semana (Lunes a Sábado) para la agenda y planificación
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { COLORS } from '../constants/colors';

export default function DaySelector({ days = [], selectedDateStr, onSelectDay, activityCountsByDate = {} }) {
  return (
    <View style={styles.wrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {days.map((d) => {
          const isSelected = d.dateStr === selectedDateStr;
          const count = activityCountsByDate[d.dateStr] || 0;

          return (
            <TouchableOpacity
              key={d.dateStr}
              onPress={() => onSelectDay(d.dateStr)}
              style={[
                styles.dayChip,
                isSelected ? styles.dayChipActive : styles.dayChipInactive,
              ]}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.dayName,
                  isSelected ? styles.dayNameActive : styles.dayNameInactive,
                ]}
              >
                {d.dayName.substring(0, 3)}
              </Text>
              <Text
                style={[
                  styles.dayNumber,
                  isSelected ? styles.dayNumberActive : styles.dayNumberInactive,
                ]}
              >
                {d.dayNumber}
              </Text>

              {count > 0 && (
                <View
                  style={[
                    styles.countBadge,
                    isSelected ? styles.countBadgeActive : styles.countBadgeInactive,
                  ]}
                >
                  <Text
                    style={[
                      styles.countText,
                      isSelected ? styles.countTextActive : styles.countTextInactive,
                    ]}
                  >
                    {count}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginVertical: 4,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 4,
    gap: 8,
  },
  dayChip: {
    width: 64,
    height: 64,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    position: 'relative',
    marginRight: 6,
  },
  dayChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primaryDark,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 2.5,
  },
  dayChipInactive: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
  },
  dayName: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  dayNameActive: {
    color: COLORS.primarySoft,
  },
  dayNameInactive: {
    color: COLORS.textSecondary,
  },
  dayNumber: {
    fontSize: 18,
    fontWeight: '800',
    marginTop: 2,
  },
  dayNumberActive: {
    color: COLORS.surface,
  },
  dayNumberInactive: {
    color: COLORS.textPrimary,
  },
  countBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  countBadgeActive: {
    backgroundColor: COLORS.success,
  },
  countBadgeInactive: {
    backgroundColor: COLORS.primary,
  },
  countText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  countTextActive: {
    color: COLORS.surface,
  },
  countTextInactive: {
    color: COLORS.surface,
  },
});

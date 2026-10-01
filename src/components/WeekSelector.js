// Selector de semanas con navegación por flechas (<- Semana 39 - Sep 2026 ->)
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { useApp } from '../context/AppContext';

export default function WeekSelector({ style }) {
  const {
    currentWeekLabel,
    goToPreviousWeek,
    goToNextWeek,
    goToCurrentWeek,
  } = useApp();

  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity
        onPress={goToPreviousWeek}
        style={styles.arrowButton}
        activeOpacity={0.7}
        accessibilityLabel="Semana anterior"
      >
        <Ionicons name="chevron-back" size={22} color={COLORS.primary} />
      </TouchableOpacity>

      <TouchableOpacity
        onPress={goToCurrentWeek}
        style={styles.labelContainer}
        activeOpacity={0.7}
        accessibilityLabel="Semana actual"
      >
        <Ionicons name="calendar-outline" size={16} color={COLORS.primary} style={styles.calendarIcon} />
        <Text style={styles.weekLabel}>{currentWeekLabel}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={goToNextWeek}
        style={styles.arrowButton}
        activeOpacity={0.7}
        accessibilityLabel="Semana siguiente"
      >
        <Ionicons name="chevron-forward" size={22} color={COLORS.primary} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  arrowButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: COLORS.primarySoft,
    justifyContent: 'center',
    alignItems: 'center',
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  calendarIcon: {
    marginRight: 6,
  },
  weekLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.primary,
    letterSpacing: 0.2,
  },
});

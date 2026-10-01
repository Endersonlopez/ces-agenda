// Dashboard superior con 4 tarjetas de resumen de la semana actual
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { useApp } from '../context/AppContext';

export default function DashboardCards({ style }) {
  const { dashboardMetrics } = useApp();

  const cards = [
    {
      id: 'planificadas',
      label: 'Planificadas',
      count: dashboardMetrics.planificadas,
      color: COLORS.primary,
      bgColor: COLORS.primarySoft,
      icon: 'calendar-outline',
    },
    {
      id: 'noAgendadas',
      label: 'No Agendadas',
      count: dashboardMetrics.noAgendadas,
      color: COLORS.warning,
      bgColor: COLORS.warningSoft,
      icon: 'flash-outline',
    },
    {
      id: 'cumplidas',
      label: 'Cumplidas',
      count: dashboardMetrics.cumplidas,
      color: COLORS.success,
      bgColor: COLORS.successSoft,
      icon: 'checkmark-circle-outline',
    },
    {
      id: 'noCumplidas',
      label: 'No cumplidas',
      count: dashboardMetrics.noCumplidas,
      color: COLORS.danger,
      bgColor: COLORS.dangerSoft,
      icon: 'close-circle-outline',
    },
  ];

  return (
    <View style={[styles.gridContainer, style]}>
      {cards.map((card) => (
        <View key={card.id} style={styles.cardWrapper}>
          <View style={[styles.card, { borderLeftColor: card.color }]}>
            <View style={styles.cardHeaderRow}>
              <View style={[styles.iconBadge, { backgroundColor: card.bgColor }]}>
                <Ionicons name={card.icon} size={18} color={card.color} />
              </View>
              <Text style={[styles.cardCount, { color: card.color }]}>
                {card.count}
              </Text>
            </View>
            <Text style={styles.cardLabel} numberOfLines={1}>
              {card.label}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: 12,
    marginVertical: 6,
  },
  cardWrapper: {
    width: '50%',
    padding: 4,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderLeftWidth: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  iconBadge: {
    width: 30,
    height: 30,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardCount: {
    fontSize: 22,
    fontWeight: '800',
  },
  cardLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginTop: 2,
  },
});

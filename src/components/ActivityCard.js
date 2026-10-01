// Tarjeta de actividad con diseño vectorial limpio, estado visual y botón de edición
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { formatTo12Hour } from '../utils/timeValidation';

export default function ActivityCard({ activity, onEdit, onDelete }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const isCompleted = activity.estado === 'Cumplida';
  const isIncompleted = activity.estado === 'No cumplida';
  const isPending = !isCompleted && !isIncompleted;

  // Color de acento según el estado
  let statusColor = COLORS.textSecondary;
  let statusBg = COLORS.background;
  let statusIcon = 'time-outline';

  if (isCompleted) {
    statusColor = COLORS.success;
    statusBg = COLORS.successSoft;
    statusIcon = 'checkmark-circle-outline';
  } else if (isIncompleted) {
    statusColor = COLORS.danger;
    statusBg = COLORS.dangerSoft;
    statusIcon = 'close-circle-outline';
  }

  const timeRange12 = `${formatTo12Hour(activity.horaInicio)} - ${formatTo12Hour(activity.horaFin)}`;

  return (
    <View style={[styles.card, { borderLeftColor: statusColor }]}>
      {/* Fila superior: Horario y Tags */}
      <View style={styles.topRow}>
        <View style={styles.timeTag}>
          <Ionicons name="time-outline" size={13} color={COLORS.primary} style={styles.timeIcon} />
          <Text style={styles.timeText}>
            {activity.horaInicio} - {activity.horaFin} ({timeRange12})
          </Text>
        </View>

        <View style={styles.tagsContainer}>
          {/* Badge Planificada / No agendada */}
          <View
            style={[
              styles.typeBadge,
              activity.esPlanificada ? styles.plannedBadge : styles.unplannedBadge,
            ]}
          >
            <Text
              style={[
                styles.typeBadgeText,
                activity.esPlanificada ? styles.plannedBadgeText : styles.unplannedBadgeText,
              ]}
            >
              {activity.esPlanificada ? 'Planificada' : 'No agendada'}
            </Text>
          </View>

          {/* Badge de Estado */}
          <View style={[styles.statusBadge, { backgroundColor: statusBg }]}>
            <Ionicons name={statusIcon} size={12} color={statusColor} style={styles.statusIconStyle} />
            <Text style={[styles.statusBadgeText, { color: statusColor }]}>
              {activity.estado || 'Pendiente'}
            </Text>
          </View>
        </View>
      </View>

      {/* Título de la actividad */}
      <Text style={styles.titleText}>{activity.titulo}</Text>

      {/* Cliente y Tipo */}
      <View style={styles.metaRow}>
        {activity.clienteOT ? (
          <View style={styles.metaItem}>
            <Ionicons name="business-outline" size={13} color={COLORS.textSecondary} style={styles.metaIcon} />
            <Text style={styles.metaText} numberOfLines={1}>
              {activity.clienteOT}
            </Text>
          </View>
        ) : null}

        {activity.tipo ? (
          <View style={styles.metaItem}>
            <Ionicons name="construct-outline" size={13} color={COLORS.textSecondary} style={styles.metaIcon} />
            <Text style={styles.metaText} numberOfLines={1}>
              {activity.tipo}
            </Text>
          </View>
        ) : null}
      </View>

      {/* Justificación obligatoria destacada si es No cumplida */}
      {isIncompleted && activity.justificacion ? (
        <View style={styles.justificationBox}>
          <View style={styles.justificationHeader}>
            <Ionicons name="alert-circle-outline" size={14} color={COLORS.danger} style={styles.alertIcon} />
            <Text style={styles.justificationTitle}>Justificación Obligatoria:</Text>
          </View>
          <Text style={styles.justificationBody}>{activity.justificacion}</Text>
        </View>
      ) : null}

      {/* Sección expandible para detalles adicionales */}
      {isExpanded && (
        <View style={styles.expandedContent}>
          {activity.resultadoReal ? (
            <View style={styles.detailBlock}>
              <Text style={styles.detailLabel}>Resultado Real:</Text>
              <Text style={styles.detailText}>{activity.resultadoReal}</Text>
            </View>
          ) : null}

          {activity.reprogramacion && activity.reprogramacion !== 'No' ? (
            <View style={styles.detailBlock}>
              <Text style={styles.detailLabel}>Reprogramación:</Text>
              <Text style={styles.detailText}>{activity.reprogramacion}</Text>
            </View>
          ) : null}

          {activity.observacion ? (
            <View style={styles.detailBlock}>
              <Text style={styles.detailLabel}>Observación / Evidencia:</Text>
              <Text style={styles.detailText}>{activity.observacion}</Text>
            </View>
          ) : null}
        </View>
      )}

      {/* Barra de acciones: Toggle detalles, Botón Editar y Botón Eliminar */}
      <View style={styles.actionsBar}>
        <TouchableOpacity
          onPress={() => setIsExpanded(!isExpanded)}
          style={styles.toggleDetailsBtn}
          activeOpacity={0.6}
        >
          <Text style={styles.toggleDetailsText}>
            {isExpanded ? 'Ocultar detalles' : 'Ver detalles'}
          </Text>
          <Ionicons
            name={isExpanded ? 'chevron-up' : 'chevron-down'}
            size={14}
            color={COLORS.primary}
          />
        </TouchableOpacity>

        <View style={styles.actionButtonsGroup}>
          {/* Botón de Edición obligatorio */}
          <TouchableOpacity
            onPress={() => onEdit(activity)}
            style={styles.editButton}
            activeOpacity={0.7}
            accessibilityLabel="Editar actividad"
          >
            <Ionicons name="create-outline" size={15} color={COLORS.primary} style={styles.btnIcon} />
            <Text style={styles.editButtonText}>Editar</Text>
          </TouchableOpacity>

          {/* Botón Eliminar */}
          <TouchableOpacity
            onPress={() => onDelete(activity)}
            style={styles.deleteButton}
            activeOpacity={0.7}
            accessibilityLabel="Eliminar actividad"
          >
            <Ionicons name="trash-outline" size={15} color={COLORS.danger} style={styles.btnIcon} />
            <Text style={styles.deleteButtonText}>Eliminar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    padding: 14,
    marginHorizontal: 16,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderLeftWidth: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    flexWrap: 'wrap',
    gap: 6,
  },
  timeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primarySoft,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  timeIcon: {
    marginRight: 4,
  },
  timeText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
  },
  tagsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  typeBadge: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  plannedBadge: {
    backgroundColor: COLORS.primarySoft,
    borderColor: COLORS.border,
  },
  plannedBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.primary,
  },
  unplannedBadge: {
    backgroundColor: COLORS.warningSoft,
    borderColor: '#FDE68A',
  },
  unplannedBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#B45309',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusIconStyle: {
    marginRight: 3,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  titleText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaIcon: {
    marginRight: 4,
  },
  metaText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  justificationBox: {
    backgroundColor: COLORS.dangerSoft,
    borderRadius: 6,
    padding: 8,
    marginVertical: 6,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.danger,
  },
  justificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  alertIcon: {
    marginRight: 4,
  },
  justificationTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.dangerDark,
  },
  justificationBody: {
    fontSize: 12,
    color: COLORS.dangerDark,
  },
  expandedContent: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 8,
    marginTop: 6,
  },
  detailBlock: {
    marginBottom: 6,
  },
  detailLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  detailText: {
    fontSize: 12,
    color: COLORS.textPrimary,
  },
  actionsBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 8,
    marginTop: 4,
  },
  toggleDetailsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  toggleDetailsText: {
    fontSize: 11,
    color: COLORS.primary,
    fontWeight: '600',
    marginRight: 2,
  },
  actionButtonsGroup: {
    flexDirection: 'row',
    gap: 8,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 6,
    backgroundColor: COLORS.primarySoft,
  },
  btnIcon: {
    marginRight: 3,
  },
  editButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 6,
    backgroundColor: COLORS.dangerSoft,
  },
  deleteButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.danger,
  },
});

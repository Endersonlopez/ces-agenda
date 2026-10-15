// Pantalla Papelera de Reciclaje — actividades eliminadas organizadas por semana
import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { useApp } from '../context/AppContext';
import { formatTo12Hour } from '../utils/timeValidation';
import { formatDateToDMY } from '../utils/dateUtils';
import GlobalHeader from '../components/GlobalHeader';
import WeekSelector from '../components/WeekSelector';

export default function PapeleraScreen({ navigation }) {
  const {
    trashActivities,
    refreshTrash,
    restoreFromTrash,
    permanentlyDelete,
    emptyTrash,
    currentWeekKey,
  } = useApp();

  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshTrash();
    } finally {
      setRefreshing(false);
    }
  };

  const handleRestore = (item) => {
    Alert.alert(
      'Restaurar actividad',
      `¿Desea restaurar "${item.titulo}" a la agenda de la semana?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Restaurar',
          onPress: async () => {
            try {
              await restoreFromTrash(item.id);
              Alert.alert('Restaurada', 'La actividad fue restaurada correctamente.');
            } catch (e) {
              Alert.alert('Error', 'No se pudo restaurar la actividad.');
            }
          },
        },
      ]
    );
  };

  const handlePermanentDelete = (item) => {
    Alert.alert(
      'Eliminar definitivamente',
      `¿Desea eliminar permanentemente "${item.titulo}"? Esta acción no se puede deshacer.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await permanentlyDelete(item.id);
            } catch (e) {
              Alert.alert('Error', 'No se pudo eliminar la actividad.');
            }
          },
        },
      ]
    );
  };

  const handleEmptyTrash = () => {
    if (trashActivities.length === 0) return;
    Alert.alert(
      'Vaciar papelera',
      `¿Desea eliminar definitivamente las ${trashActivities.length} actividad(es) en la papelera de esta semana? Esta acción no se puede deshacer.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Vaciar',
          style: 'destructive',
          onPress: async () => {
            try {
              await emptyTrash();
            } catch (e) {
              Alert.alert('Error', 'No se pudo vaciar la papelera.');
            }
          },
        },
      ]
    );
  };

  const renderTrashItem = ({ item }) => {
    const timeRange = item.horaInicio && item.horaFin
      ? `${formatTo12Hour(item.horaInicio)} - ${formatTo12Hour(item.horaFin)}`
      : item.hora || '';

    const deletedAt = item.deletedAt
      ? new Date(item.deletedAt).toLocaleDateString('es', {
          day: '2-digit', month: 'short', year: 'numeric',
          hour: '2-digit', minute: '2-digit',
        })
      : null;

    return (
      <View style={styles.trashCard}>
        {/* Franja lateral roja */}
        <View style={styles.cardLeftAccent} />

        <View style={styles.cardBody}>
          {/* Cabecera: fecha original y horario */}
          <View style={styles.cardTopRow}>
            <View style={styles.dateTag}>
              <Ionicons name="calendar-outline" size={12} color={COLORS.textSecondary} style={styles.tagIcon} />
              <Text style={styles.dateTagText}>
                {item.diaSemana} {formatDateToDMY(item.fecha)}
              </Text>
            </View>
            {timeRange ? (
              <View style={styles.timeTag}>
                <Ionicons name="time-outline" size={12} color={COLORS.primary} style={styles.tagIcon} />
                <Text style={styles.timeTagText}>{timeRange}</Text>
              </View>
            ) : null}
          </View>

          {/* Título */}
          <Text style={styles.itemTitle} numberOfLines={2}>{item.titulo}</Text>

          {/* Meta */}
          <View style={styles.metaRow}>
            {item.clienteOT ? (
              <View style={styles.metaItem}>
                <Ionicons name="business-outline" size={12} color={COLORS.textSecondary} style={styles.tagIcon} />
                <Text style={styles.metaText} numberOfLines={1}>{item.clienteOT}</Text>
              </View>
            ) : null}
            {item.tipo ? (
              <View style={styles.metaItem}>
                <Ionicons name="construct-outline" size={12} color={COLORS.textSecondary} style={styles.tagIcon} />
                <Text style={styles.metaText} numberOfLines={1}>{item.tipo}</Text>
              </View>
            ) : null}
          </View>

          {/* Estado original */}
          <View style={styles.statusRow}>
            <View style={[
              styles.statusBadge,
              item.estado === 'Cumplida' ? styles.statusCompleted :
              item.estado === 'No cumplida' ? styles.statusIncompleted :
              styles.statusPending,
            ]}>
              <Text style={[
                styles.statusText,
                item.estado === 'Cumplida' ? styles.statusTextCompleted :
                item.estado === 'No cumplida' ? styles.statusTextIncompleted :
                styles.statusTextPending,
              ]}>
                {item.estado || 'Pendiente'}
              </Text>
            </View>
            <View style={[styles.statusBadge, item.esPlanificada ? styles.plannedBadge : styles.unplannedBadge]}>
              <Text style={[styles.statusText, item.esPlanificada ? styles.plannedText : styles.unplannedText]}>
                {item.esPlanificada ? 'Planificada' : 'No agendada'}
              </Text>
            </View>
          </View>

          {/* Eliminada el */}
          {deletedAt && (
            <Text style={styles.deletedAtText}>
              <Ionicons name="trash-outline" size={11} color={COLORS.textMuted} /> Eliminada: {deletedAt}
            </Text>
          )}

          {/* Botones de acción */}
          <View style={styles.actionsRow}>
            <TouchableOpacity
              onPress={() => handleRestore(item)}
              style={styles.restoreBtn}
              activeOpacity={0.75}
            >
              <Ionicons name="refresh-outline" size={15} color={COLORS.primary} style={styles.btnIcon} />
              <Text style={styles.restoreBtnText}>Restaurar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handlePermanentDelete(item)}
              style={styles.deleteBtn}
              activeOpacity={0.75}
            >
              <Ionicons name="trash" size={15} color={COLORS.danger} style={styles.btnIcon} />
              <Text style={styles.deleteBtnText}>Eliminar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <GlobalHeader title="Papelera de reciclaje" navigation={navigation} />

      <FlatList
        data={trashActivities}
        keyExtractor={(item, index) => item.id ? item.id + '_trash' : String(index)}
        showsVerticalScrollIndicator={false}
        onRefresh={handleRefresh}
        refreshing={refreshing}
        ListHeaderComponent={
          <View>
            <WeekSelector />

            {/* Banner informativo */}
            <View style={styles.infoBanner}>
              <Ionicons name="information-circle-outline" size={18} color={COLORS.primary} />
              <Text style={styles.infoBannerText}>
                Aquí se guardan las actividades eliminadas de la semana seleccionada. Puede restaurarlas o eliminarlas definitivamente.
              </Text>
            </View>

            {/* Botón vaciar papelera */}
            {trashActivities.length > 0 && (
              <TouchableOpacity
                onPress={handleEmptyTrash}
                style={styles.emptyTrashBtn}
                activeOpacity={0.8}
              >
                <Ionicons name="trash-bin-outline" size={16} color={COLORS.danger} style={styles.btnIcon} />
                <Text style={styles.emptyTrashBtnText}>
                  Vaciar papelera ({trashActivities.length})
                </Text>
              </TouchableOpacity>
            )}

            <Text style={styles.sectionLabel}>
              {trashActivities.length > 0
                ? `${trashActivities.length} actividad(es) eliminada(s) esta semana`
                : ''}
            </Text>
          </View>
        }
        renderItem={renderTrashItem}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconBadge}>
              <Ionicons name="trash-bin-outline" size={32} color={COLORS.textSecondary} />
            </View>
            <Text style={styles.emptyTitle}>Papelera vacía</Text>
            <Text style={styles.emptySubtitle}>
              No hay actividades eliminadas en esta semana. Al eliminar una actividad, aparecerá aquí para que pueda recuperarla si fue por error.
            </Text>
          </View>
        }
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  listContent: {
    paddingBottom: 40,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.primarySoft,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 8,
  },
  infoBannerText: {
    flex: 1,
    fontSize: 12,
    color: COLORS.primaryDark,
    lineHeight: 17,
  },
  emptyTrashBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.dangerSoft,
    borderWidth: 1,
    borderColor: COLORS.danger,
    borderRadius: 8,
    paddingVertical: 10,
    marginHorizontal: 16,
    marginTop: 12,
  },
  emptyTrashBtnText: {
    color: COLORS.danger,
    fontSize: 13,
    fontWeight: '700',
  },
  sectionLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '600',
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 4,
  },
  trashCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    marginHorizontal: 16,
    marginVertical: 5,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 2,
  },
  cardLeftAccent: {
    width: 4,
    backgroundColor: COLORS.danger,
  },
  cardBody: {
    flex: 1,
    padding: 12,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 6,
  },
  dateTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 5,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  dateTagText: {
    fontSize: 10,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  timeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primarySoft,
    borderRadius: 5,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  timeTagText: {
    fontSize: 10,
    color: COLORS.primary,
    fontWeight: '700',
  },
  tagIcon: {
    marginRight: 3,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 4,
    opacity: 0.75,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 6,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  statusRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 6,
  },
  statusBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 5,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
  },
  statusCompleted: { backgroundColor: COLORS.successSoft },
  statusTextCompleted: { color: COLORS.success },
  statusIncompleted: { backgroundColor: COLORS.dangerSoft },
  statusTextIncompleted: { color: COLORS.danger },
  statusPending: { backgroundColor: COLORS.background, borderWidth: 1, borderColor: COLORS.border },
  statusTextPending: { color: COLORS.textSecondary },
  plannedBadge: { backgroundColor: COLORS.primarySoft },
  plannedText: { color: COLORS.primary },
  unplannedBadge: { backgroundColor: COLORS.warningSoft },
  unplannedText: { color: '#B45309' },
  deletedAtText: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginBottom: 8,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 8,
    marginTop: 2,
  },
  restoreBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primarySoft,
    borderRadius: 6,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  restoreBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  deleteBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.dangerSoft,
    borderRadius: 6,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: COLORS.danger,
  },
  deleteBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.danger,
  },
  btnIcon: {
    marginRight: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 50,
  },
  emptyIconBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
});

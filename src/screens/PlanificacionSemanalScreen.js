// Pantalla Planificación Semanal con ordenamiento cronológico normal (primero a último)
import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { useApp } from '../context/AppContext';
import { getWeekDays } from '../utils/dateUtils';
import { sortActivitiesNormal } from '../storage/activityStorage';
import GlobalHeader from '../components/GlobalHeader';
import WeekSelector from '../components/WeekSelector';
import DaySelector from '../components/DaySelector';
import ActivityCard from '../components/ActivityCard';
import ActivityModal from '../components/ActivityModal';

export default function PlanificacionSemanalScreen({ navigation }) {
  const {
    weekInfo,
    activities,
    addActivity,
    updateActivity,
    deleteActivity,
  } = useApp();

  const weekDays = useMemo(() => {
    return getWeekDays(weekInfo.weekNumber, weekInfo.weekYear);
  }, [weekInfo.weekNumber, weekInfo.weekYear]);

  const [selectedDateStr, setSelectedDateStr] = useState(() => {
    const today = new Date().toISOString().split('T')[0];
    const found = weekDays.find((d) => d.dateStr === today);
    return found ? found.dateStr : weekDays[0]?.dateStr;
  });

  const activeDay = useMemo(() => {
    const found = weekDays.find((d) => d.dateStr === selectedDateStr);
    return found || weekDays[0];
  }, [weekDays, selectedDateStr]);

  // Contadores por fecha
  const activityCountsByDate = useMemo(() => {
    const map = {};
    for (const act of activities) {
      map[act.fecha] = (map[act.fecha] || 0) + 1;
    }
    return map;
  }, [activities]);

  // Filtrar actividades del día y ordenar de manera CRONOLÓGICA NORMAL (08:00 arriba, 17:30 abajo)
  const plannedDayActivities = useMemo(() => {
    if (!activeDay) return [];
    const filtered = activities.filter((act) => act.fecha === activeDay.dateStr);
    return sortActivitiesNormal(filtered);
  }, [activities, activeDay]);

  const [modalVisible, setModalVisible] = useState(false);
  const [activityToEdit, setActivityToEdit] = useState(null);

  const handleOpenAddModal = () => {
    setActivityToEdit(null);
    setModalVisible(true);
  };

  const handleOpenEditModal = (activity) => {
    setActivityToEdit(activity);
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setActivityToEdit(null);
  };

  const handleSaveActivity = async (activityData) => {
    try {
      if (activityToEdit) {
        await updateActivity(activityToEdit.id, activityData);
      } else {
        // En Planificación Semanal se marcan estrictamente como 'esPlanificada: true'
        const newAct = {
          ...activityData,
          fecha: activeDay.dateStr,
          diaSemana: activeDay.dayName,
          esPlanificada: true, // Carga automática como Planificada
        };
        await addActivity(newAct);
      }
      handleCloseModal();
    } catch (e) {
      Alert.alert('Error', 'No se pudo guardar la planificación.');
    }
  };

  const handleDeleteActivity = (activity) => {
    Alert.alert(
      'Confirmar eliminación',
      `¿Desea eliminar la actividad "${activity.titulo}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteActivity(activity.id);
            } catch (err) {
              Alert.alert('Error', 'No se pudo eliminar la actividad.');
            }
          },
        },
      ]
    );
  };

  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshActivities();
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <View style={styles.container}>
      <GlobalHeader title="Planificación semanal" navigation={navigation} />

      <FlatList
        data={plannedDayActivities}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        ListHeaderComponent={
          <View>
            {/* Selector de semanas con flechas */}
            <WeekSelector />

            <View style={styles.bannerInfo}>
              <Ionicons name="information-circle-outline" size={18} color={COLORS.primary} />
              <Text style={styles.bannerText}>
                Las actividades planificadas aquí se cargan automáticamente en la Agenda diaria como "Planificadas".
              </Text>
            </View>

            {/* Selector de días Lunes a Sábado */}
            <DaySelector
              days={weekDays}
              selectedDateStr={activeDay?.dateStr}
              onSelectDay={(dateStr) => setSelectedDateStr(dateStr)}
              activityCountsByDate={activityCountsByDate}
            />

            <View style={styles.sectionHeader}>
              <View style={styles.dayInfoLeft}>
                <Text style={styles.dayTitle}>
                  {activeDay ? activeDay.formattedDisplay : 'Día seleccionado'}
                </Text>
                <Text style={styles.sortNoticeText}>
                  Orden cronológico normal (primera a última)
                </Text>
              </View>

              {/* Botón limpio sin '+' */}
              <TouchableOpacity
                onPress={handleOpenAddModal}
                style={styles.addButton}
                activeOpacity={0.8}
                accessibilityLabel="Planificar actividad"
              >
                <Ionicons name="calendar-outline" size={16} color={COLORS.surface} style={styles.addBtnIcon} />
                <Text style={styles.addButtonText}>Planificar actividad</Text>
              </TouchableOpacity>
            </View>
          </View>
        }
        renderItem={({ item }) => (
          <ActivityCard
            activity={item}
            onEdit={handleOpenEditModal}
            onDelete={handleDeleteActivity}
            // Sin onToggleStatus: en planificación semanal no se cambia estado
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconBadge}>
              <Ionicons name="calendar-outline" size={32} color={COLORS.primary} />
            </View>
            <Text style={styles.emptyTitle}>Sin planificación para este día</Text>
            <Text style={styles.emptySubtitle}>
              Presione el botón "Planificar actividad" para anticipar las tareas técnicas y coordinaciones de la jornada.
            </Text>
          </View>
        }
        contentContainerStyle={styles.listContent}
      />

      <ActivityModal
        visible={modalVisible}
        activityToEdit={activityToEdit}
        defaultDateStr={activeDay?.dateStr}
        defaultDayName={activeDay?.dayName}
        defaultIsPlanificada={true}
        activitiesForValidation={plannedDayActivities}
        onSave={handleSaveActivity}
        onClose={handleCloseModal}
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
    paddingBottom: 30,
  },
  bannerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primarySoft,
    paddingVertical: 8,
    paddingHorizontal: 14,
    marginHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 8,
  },
  bannerText: {
    fontSize: 12,
    color: COLORS.primaryDark,
    marginLeft: 8,
    flex: 1,
    lineHeight: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  dayInfoLeft: {
    flex: 1,
  },
  dayTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.primary,
  },
  sortNoticeText: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    elevation: 2,
  },
  addBtnIcon: {
    marginRight: 4,
  },
  addButtonText: {
    color: COLORS.surface,
    fontSize: 12,
    fontWeight: '700',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 40,
  },
  emptyIconBadge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primarySoft,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
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

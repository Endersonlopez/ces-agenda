// Pantalla Agenda Diaria con Dashboard, ordenamiento inverso y carga automática
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
import { sortActivitiesInverse } from '../storage/activityStorage';
import GlobalHeader from '../components/GlobalHeader';
import WeekSelector from '../components/WeekSelector';
import DashboardCards from '../components/DashboardCards';
import DaySelector from '../components/DaySelector';
import ActivityCard from '../components/ActivityCard';
import ActivityModal from '../components/ActivityModal';

export default function AgendaDiariaScreen({ navigation }) {
  const {
    weekInfo,
    activities,
    addActivity,
    updateActivity,
    deleteActivity,
    currentWeekKey,
  } = useApp();

  // Obtener los días laborales de la semana activa
  const weekDays = useMemo(() => {
    return getWeekDays(weekInfo.weekNumber, weekInfo.weekYear);
  }, [weekInfo.weekNumber, weekInfo.weekYear]);

  // Día seleccionado por defecto
  const [selectedDateStr, setSelectedDateStr] = useState(() => {
    const today = new Date().toISOString().split('T')[0];
    const found = weekDays.find((d) => d.dateStr === today);
    return found ? found.dateStr : weekDays[0]?.dateStr;
  });

  const activeDay = useMemo(() => {
    const found = weekDays.find((d) => d.dateStr === selectedDateStr);
    return found || weekDays[0];
  }, [weekDays, selectedDateStr]);

  // Conteo de actividades por fecha para los badges
  const activityCountsByDate = useMemo(() => {
    const map = {};
    for (const act of activities) {
      map[act.fecha] = (map[act.fecha] || 0) + 1;
    }
    return map;
  }, [activities]);

  // Filtrar actividades del día seleccionado (orden inverso)
  const dailyActivities = useMemo(() => {
    if (!activeDay) return [];
    const filtered = activities.filter((act) => act.fecha === activeDay.dateStr);
    return sortActivitiesInverse(filtered);
  }, [activities, activeDay]);

  // Estado del modal
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
        const newAct = {
          ...activityData,
          fecha: activeDay.dateStr,
          diaSemana: activeDay.dayName,
          esPlanificada: false,
        };
        await addActivity(newAct);
      }
      handleCloseModal();
    } catch (e) {
      Alert.alert('Error', 'No se pudo guardar la actividad.');
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

  // Toggle de estado con actualización optimista para evitar que "se trabe"
  const [pendingToggleIds, setPendingToggleIds] = useState(new Set());

  const handleToggleStatus = async (activity) => {
    if (pendingToggleIds.has(activity.id)) return; // Evitar doble toque

    const isCompleted = activity.estado === 'Cumplida';
    const newStatus = isCompleted ? 'Pendiente' : 'Cumplida';

    setPendingToggleIds((prev) => new Set(prev).add(activity.id));
    try {
      await updateActivity(activity.id, { ...activity, estado: newStatus });
    } catch (e) {
      Alert.alert('Error', 'No se pudo actualizar el estado.');
    } finally {
      setPendingToggleIds((prev) => {
        const next = new Set(prev);
        next.delete(activity.id);
        return next;
      });
    }
  };

  // Deslizar hacia abajo para actualizar y ordenar actividades
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
      <GlobalHeader title="Agenda diaria" navigation={navigation} />

      <FlatList
        data={dailyActivities}
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
            <WeekSelector />
            <DashboardCards />
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
                  Orden cronológico inverso (última a primera)
                </Text>
              </View>

              <TouchableOpacity
                onPress={handleOpenAddModal}
                style={styles.addButton}
                activeOpacity={0.8}
                accessibilityLabel="Nueva actividad"
              >
                <Ionicons name="add-circle-outline" size={17} color={COLORS.surface} style={styles.addBtnIcon} />
                <Text style={styles.addButtonText}>Nueva actividad</Text>
              </TouchableOpacity>
            </View>
          </View>
        }
        renderItem={({ item }) => (
          <ActivityCard
            activity={item}
            onEdit={handleOpenEditModal}
            onDelete={handleDeleteActivity}
            onToggleStatus={handleToggleStatus}
            isTogglePending={pendingToggleIds.has(item.id)}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconBadge}>
              <Ionicons name="calendar-outline" size={32} color={COLORS.primary} />
            </View>
            <Text style={styles.emptyTitle}>Sin actividades en este día</Text>
            <Text style={styles.emptySubtitle}>
              Las actividades planificadas previamente se cargan automáticamente aquí.
              También puede registrar una actividad no agendada presionando el botón "Nueva actividad".
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
        defaultIsPlanificada={false}
        activitiesForValidation={dailyActivities}
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

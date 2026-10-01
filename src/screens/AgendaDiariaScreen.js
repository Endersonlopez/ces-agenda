// Pantalla Agenda Diaria con Dashboard, ordenamiento inverso y carga automática
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

  // Día seleccionado por defecto (primer día o coincidente con hoy si está dentro de la semana)
  const [selectedDateStr, setSelectedDateStr] = useState(() => {
    const today = new Date().toISOString().split('T')[0];
    const found = weekDays.find((d) => d.dateStr === today);
    return found ? found.dateStr : weekDays[0]?.dateStr;
  });

  // Asegurar que selectedDateStr pertenezca a la semana seleccionada
  const activeDay = useMemo(() => {
    const found = weekDays.find((d) => d.dateStr === selectedDateStr);
    return found || weekDays[0];
  }, [weekDays, selectedDateStr]);

  // Conteo de actividades por fecha para los badges de los días
  const activityCountsByDate = useMemo(() => {
    const map = {};
    for (const act of activities) {
      map[act.fecha] = (map[act.fecha] || 0) + 1;
    }
    return map;
  }, [activities]);

  // Filtrar actividades del día seleccionado y aplicar ordenamiento CRONOLÓGICO INVERSO (17:30 arriba, 08:00 abajo)
  const dailyActivities = useMemo(() => {
    if (!activeDay) return [];
    const filtered = activities.filter((act) => act.fecha === activeDay.dateStr);
    return sortActivitiesInverse(filtered);
  }, [activities, activeDay]);

  // Estado del modal de creación/edición
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
        // Modo Edición
        await updateActivity(activityToEdit.id, activityData);
      } else {
        // Modo Creación en Agenda Diaria:
        // Requerimiento: "Si se agrega una nueva en el mismo día, marcar como 'No planificada'".
        const newAct = {
          ...activityData,
          fecha: activeDay.dateStr,
          diaSemana: activeDay.dayName,
          esPlanificada: false, // Marcada estrictamente como no planificada / no agendada
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
      'Confirmar Eliminación',
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

  return (
    <View style={styles.container}>
      {/* Cabecera global con logo posicionado estrictamente sobre el avatar */}
      <GlobalHeader title="Agenda Diaria" navigation={navigation} />

      <FlatList
        data={dailyActivities}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View>
            {/* Selector de semanas con flechas */}
            <WeekSelector />

            {/* Dashboard superior con 4 tarjetas de resumen */}
            <DashboardCards />

            {/* Selector de días Lunes a Sábado */}
            <DaySelector
              days={weekDays}
              selectedDateStr={activeDay?.dateStr}
              onSelectDay={(dateStr) => setSelectedDateStr(dateStr)}
              activityCountsByDate={activityCountsByDate}
            />

            {/* Título de la sección del día actual con botón de acción */}
            <View style={styles.sectionHeader}>
              <View style={styles.dayInfoLeft}>
                <Text style={styles.dayTitle}>
                  {activeDay ? activeDay.formattedDisplay : 'Día Seleccionado'}
                </Text>
                <Text style={styles.sortNoticeText}>
                  Orden cronológico inverso (última a primera)
                </Text>
              </View>

              {/* Botón limpio sin '+' */}
              <TouchableOpacity
                onPress={handleOpenAddModal}
                style={styles.addButton}
                activeOpacity={0.8}
                accessibilityLabel="Nueva Actividad"
              >
                <Ionicons name="add-circle-outline" size={17} color={COLORS.surface} style={styles.addBtnIcon} />
                <Text style={styles.addButtonText}>Nueva Actividad</Text>
              </TouchableOpacity>
            </View>
          </View>
        }
        renderItem={({ item }) => (
          <ActivityCard
            activity={item}
            onEdit={handleOpenEditModal}
            onDelete={handleDeleteActivity}
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
              También puede registrar una actividad no agendada presionando el botón "Nueva Actividad".
            </Text>
          </View>
        }
        contentContainerStyle={styles.listContent}
      />

      {/* Modal para Crear y Editar Actividades */}
      <ActivityModal
        visible={modalVisible}
        activityToEdit={activityToEdit}
        defaultDateStr={activeDay?.dateStr}
        defaultDayName={activeDay?.dayName}
        defaultIsPlanificada={false}
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

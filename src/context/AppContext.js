// Contexto global del estado de la aplicación Agenda CES
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getProfile, saveProfile } from '../storage/profileStorage';
import {
  getActivitiesByWeek,
  addActivity,
  updateActivity,
  deleteActivity,
  calculateDashboardMetrics,
  getTrashActivitiesByWeek,
  restoreActivityFromTrash,
  permanentlyDeleteFromTrash,
  emptyTrashForWeek,
  markPendingAsIncompletedInWeek,
} from '../storage/activityStorage';
import {
  getNotificationSettings,
  saveNotificationSettings,
} from '../storage/notificationStorage';
import { setupScheduledNotifications, rescheduleAllActivityReminders } from '../services/notificationService';
import {
  getISOWeekAndYear,
  getWeekKey,
  formatWeekLabel,
  getPreviousWeekInfo,
  getNextWeekInfo,
  getMondayOfISOWeek,
} from '../utils/dateUtils';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfileState] = useState({
    nombre: '',
    apellido: '',
    perfil: 'Cómputo',
    isOnboarded: false,
  });

  // Semana seleccionada actualmente
  const initialWeekInfo = getISOWeekAndYear(new Date());
  const [weekInfo, setWeekInfo] = useState({
    weekNumber: initialWeekInfo.weekNumber,
    weekYear: initialWeekInfo.weekYear,
  });

  const [activities, setActivities] = useState([]);
  const [nextWeekActivities, setNextWeekActivities] = useState([]);
  const [trashActivities, setTrashActivities] = useState([]);
  const [notificationConfig, setNotificationConfig] = useState(null);

  const currentWeekKey = getWeekKey(weekInfo.weekYear, weekInfo.weekNumber);
  const currentWeekLabel = formatWeekLabel(weekInfo.weekNumber, weekInfo.weekYear);

  const nextWeekCalculated = getNextWeekInfo(weekInfo.weekNumber, weekInfo.weekYear);
  const nextWeekKey = getWeekKey(nextWeekCalculated.weekYear, nextWeekCalculated.weekNumber);
  const nextWeekLabel = formatWeekLabel(nextWeekCalculated.weekNumber, nextWeekCalculated.weekYear);

  // Cargar actividades de la papelera para la semana activa
  const refreshTrash = useCallback(async () => {
    try {
      const trashList = await getTrashActivitiesByWeek(currentWeekKey);
      setTrashActivities(trashList);
    } catch (e) {
      console.error('Error al refrescar papelera:', e);
    }
  }, [currentWeekKey]);

  // Cargar actividades de la semana activa y de la semana siguiente
  const refreshActivities = useCallback(async () => {
    try {
      const currentList = await getActivitiesByWeek(currentWeekKey);
      setActivities(currentList);

      const nextList = await getActivitiesByWeek(nextWeekKey);
      setNextWeekActivities(nextList);
    } catch (e) {
      console.error('Error al refrescar actividades:', e);
    }
  }, [currentWeekKey, nextWeekKey]);

  // Carga inicial al arrancar la app
  useEffect(() => {
    async function initApp() {
      try {
        const loadedProfile = await getProfile();
        setProfileState(loadedProfile);

        const notifSettings = await getNotificationSettings();
        setNotificationConfig(notifSettings);
        if (notifSettings.enabled) {
          setupScheduledNotifications().catch(console.warn);
        }
      } catch (err) {
        console.error('Error durante la inicialización:', err);
      } finally {
        setIsLoading(false);
      }
    }
    initApp();
  }, []);

  // Recargar actividades y papelera cuando cambie la semana
  useEffect(() => {
    refreshActivities();
    refreshTrash();
  }, [refreshActivities, refreshTrash]);

  // Métricas de la semana actual
  const dashboardMetrics = calculateDashboardMetrics(activities);

  // Navegación entre semanas (sin borrar historial nunca)
  const goToPreviousWeek = () => {
    const prev = getPreviousWeekInfo(weekInfo.weekNumber, weekInfo.weekYear);
    setWeekInfo(prev);
  };

  const goToNextWeek = () => {
    const next = getNextWeekInfo(weekInfo.weekNumber, weekInfo.weekYear);
    setWeekInfo(next);
  };

  const goToCurrentWeek = () => {
    const curr = getISOWeekAndYear(new Date());
    setWeekInfo(curr);
  };

  // Gestión de perfil
  const handleSaveProfile = async (newProfileData) => {
    const saved = await saveProfile(newProfileData);
    setProfileState(saved);
    return saved;
  };

  // Gestión de actividades
  const handleAddActivity = async (activityData, targetWeekKey = currentWeekKey) => {
    const created = await addActivity(targetWeekKey, activityData);
    await refreshActivities();
    // Reprogramar recordatorios con la lista actualizada
    const updated = await getActivitiesByWeek(currentWeekKey);
    rescheduleAllActivityReminders(updated).catch(console.warn);
    return created;
  };

  const handleUpdateActivity = async (activityId, updatedFields, targetWeekKey = currentWeekKey) => {
    const updated = await updateActivity(targetWeekKey, activityId, updatedFields);
    await refreshActivities();
    const updatedList = await getActivitiesByWeek(currentWeekKey);
    rescheduleAllActivityReminders(updatedList).catch(console.warn);
    return updated;
  };

  const handleDeleteActivity = async (activityId, targetWeekKey = currentWeekKey) => {
    await deleteActivity(targetWeekKey, activityId);
    await refreshActivities();
    await refreshTrash();
    const updatedList = await getActivitiesByWeek(currentWeekKey);
    rescheduleAllActivityReminders(updatedList).catch(console.warn);
  };

  // Gestión de papelera
  const handleRestoreFromTrash = async (activityId, targetWeekKey = currentWeekKey) => {
    const restored = await restoreActivityFromTrash(targetWeekKey, activityId);
    await refreshActivities();
    await refreshTrash();
    return restored;
  };

  const handlePermanentlyDelete = async (activityId, targetWeekKey = currentWeekKey) => {
    await permanentlyDeleteFromTrash(targetWeekKey, activityId);
    await refreshTrash();
  };

  const handleEmptyTrash = async (targetWeekKey = currentWeekKey) => {
    await emptyTrashForWeek(targetWeekKey);
    await refreshTrash();
  };

  // Marcar como No cumplida actividades Pendientes al enviar de todos modos
  const handleMarkPendingAsIncompleted = async (dateStrings, targetWeekKey = currentWeekKey) => {
    const updated = await markPendingAsIncompletedInWeek(targetWeekKey, dateStrings);
    await refreshActivities();
    return updated;
  };

  // Gestión de notificaciones
  const handleSaveNotifications = async (newSettings) => {
    const saved = await saveNotificationSettings(newSettings);
    setNotificationConfig(saved);
    await setupScheduledNotifications();
    return saved;
  };

  return (
    <AppContext.Provider
      value={{
        isLoading,
        profile,
        saveProfile: handleSaveProfile,
        weekInfo,
        currentWeekKey,
        currentWeekLabel,
        nextWeekKey,
        nextWeekLabel,
        goToPreviousWeek,
        goToNextWeek,
        goToCurrentWeek,
        activities,
        nextWeekActivities,
        refreshActivities,
        dashboardMetrics,
        addActivity: handleAddActivity,
        updateActivity: handleUpdateActivity,
        deleteActivity: handleDeleteActivity,
        // Papelera de reciclaje
        trashActivities,
        refreshTrash,
        restoreFromTrash: handleRestoreFromTrash,
        permanentlyDelete: handlePermanentlyDelete,
        emptyTrash: handleEmptyTrash,
        markPendingAsIncompleted: handleMarkPendingAsIncompleted,
        notificationConfig,
        saveNotifications: handleSaveNotifications,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp debe ser usado dentro de un AppProvider');
  }
  return context;
}

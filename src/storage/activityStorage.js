// Almacenamiento local de actividades por semanas con AsyncStorage
import AsyncStorage from '@react-native-async-storage/async-storage';
import { timeStringToMinutes } from '../utils/timeValidation';

const WEEK_STORAGE_PREFIX = '@agenda_ces_week_';
const ALL_WEEKS_INDEX_KEY = '@agenda_ces_all_weeks_index';

/**
 * Obtiene la lista de todas las claves de semanas registradas
 */
export async function getAllRecordedWeeks() {
  try {
    const raw = await AsyncStorage.getItem(ALL_WEEKS_INDEX_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (error) {
    console.error('Error al obtener lista de semanas:', error);
    return [];
  }
}

/**
 * Registra una clave de semana en el índice si no existe
 */
async function registerWeekIndex(weekKey) {
  try {
    const currentList = await getAllRecordedWeeks();
    if (!currentList.includes(weekKey)) {
      currentList.push(weekKey);
      await AsyncStorage.setItem(ALL_WEEKS_INDEX_KEY, JSON.stringify(currentList));
    }
  } catch (error) {
    console.error('Error registrando clave de semana:', error);
  }
}

/**
 * Obtiene todas las actividades de una semana específica
 * @param {string} weekKey - Ej: '2026-W39'
 * @returns {Promise<Array>} Lista de actividades
 */
export async function getActivitiesByWeek(weekKey) {
  try {
    const key = `${WEEK_STORAGE_PREFIX}${weekKey}`;
    const raw = await AsyncStorage.getItem(key);
    if (!raw) {
      return [];
    }
    const activities = JSON.parse(raw);
    return Array.isArray(activities) ? activities : [];
  } catch (error) {
    console.error(`Error al cargar actividades de la semana ${weekKey}:`, error);
    return [];
  }
}

/**
 * Guarda todas las actividades de una semana
 */
export async function saveActivitiesForWeek(weekKey, activities) {
  try {
    const key = `${WEEK_STORAGE_PREFIX}${weekKey}`;
    await AsyncStorage.setItem(key, JSON.stringify(activities));
    await registerWeekIndex(weekKey);
  } catch (error) {
    console.error(`Error al guardar actividades de la semana ${weekKey}:`, error);
    throw error;
  }
}

/**
 * Agrega una nueva actividad a la semana correspondiente
 */
export async function addActivity(weekKey, activityData) {
  try {
    const activities = await getActivitiesByWeek(weekKey);
    const newActivity = {
      id: activityData.id || `act_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      weekKey,
      fecha: activityData.fecha, // YYYY-MM-DD
      diaSemana: activityData.diaSemana || '',
      horaInicio: activityData.horaInicio, // HH:mm
      horaFin: activityData.horaFin, // HH:mm
      hora: `${activityData.horaInicio} - ${activityData.horaFin}`,
      titulo: activityData.titulo || '',
      clienteOT: activityData.clienteOT || '',
      tipo: activityData.tipo || 'Mantenimiento Preventivo',
      resultadoReal: activityData.resultadoReal || '',
      estado: activityData.estado || 'Pendiente', // 'Cumplida', 'No cumplida', 'Pendiente'
      esPlanificada: activityData.esPlanificada !== undefined ? Boolean(activityData.esPlanificada) : false,
      reprogramacion: activityData.reprogramacion || 'No',
      observacion: activityData.observacion || '',
      justificacion: activityData.justificacion || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    activities.push(newActivity);
    await saveActivitiesForWeek(weekKey, activities);
    return newActivity;
  } catch (error) {
    console.error('Error agregando actividad:', error);
    throw error;
  }
}

/**
 * Actualiza una actividad existente en cualquiera de sus campos
 */
export async function updateActivity(weekKey, activityId, updatedFields) {
  try {
    const activities = await getActivitiesByWeek(weekKey);
    const index = activities.findIndex((a) => a.id === activityId);
    if (index === -1) {
      throw new Error(`Actividad con id ${activityId} no encontrada`);
    }

    const current = activities[index];
    const updated = {
      ...current,
      ...updatedFields,
      hora: (updatedFields.horaInicio && updatedFields.horaFin)
        ? `${updatedFields.horaInicio} - ${updatedFields.horaFin}`
        : current.hora,
      updatedAt: new Date().toISOString(),
    };

    // Si se actualizó la fecha y corresponde a otra semana (por edición manual), mantener consistencia
    activities[index] = updated;
    await saveActivitiesForWeek(weekKey, activities);
    return updated;
  } catch (error) {
    console.error('Error actualizando actividad:', error);
    throw error;
  }
}

/**
 * Elimina una actividad
 */
export async function deleteActivity(weekKey, activityId) {
  try {
    const activities = await getActivitiesByWeek(weekKey);
    const filtered = activities.filter((a) => a.id !== activityId);
    await saveActivitiesForWeek(weekKey, filtered);
    return true;
  } catch (error) {
    console.error('Error eliminando actividad:', error);
    throw error;
  }
}

/**
 * Ordena actividades cronológicamente INVERSO (para Agenda Diaria)
 * Ejemplo: 17:30 arriba, 08:00 abajo
 */
export function sortActivitiesInverse(activities) {
  return [...activities].sort((a, b) => {
    const timeA = timeStringToMinutes(a.horaInicio);
    const timeB = timeStringToMinutes(b.horaInicio);
    return timeB - timeA;
  });
}

/**
 * Ordena actividades cronológicamente NORMAL (para Planificación Semanal)
 * Ejemplo: 08:00 arriba, 17:30 abajo
 */
export function sortActivitiesNormal(activities) {
  return [...activities].sort((a, b) => {
    const timeA = timeStringToMinutes(a.horaInicio);
    const timeB = timeStringToMinutes(b.horaInicio);
    return timeA - timeB;
  });
}

/**
 * Calcula las métricas del dashboard para una semana
 */
export function calculateDashboardMetrics(activities) {
  let planificadas = 0;
  let noAgendadas = 0;
  let cumplidas = 0;
  let noCumplidas = 0;

  for (const act of activities) {
    if (act.esPlanificada) {
      planificadas += 1;
    } else {
      noAgendadas += 1;
    }

    if (act.estado === 'Cumplida') {
      cumplidas += 1;
    } else if (act.estado === 'No cumplida') {
      noCumplidas += 1;
    }
  }

  return {
    planificadas,
    noAgendadas,
    cumplidas,
    noCumplidas,
  };
}

// Almacenamiento y configuración de notificaciones locales para Agenda CES
import AsyncStorage from '@react-native-async-storage/async-storage';

const NOTIFICATIONS_STORAGE_KEY = '@agenda_ces_notifications_config';

export const DEFAULT_NOTIFICATION_SETTINGS = {
  enabled: true,
  activityAlertsEnabled: true, // Recordatorio de actividades (30 min antes)
  lvTime: '17:00',   // L-V 5:00 PM (Recordatorio enviar agenda)
  vieTime: '16:30',  // Viernes 4:30 PM (Recordatorio planificar semana)
  sabTime: '12:30',  // Sábado 12:30 PM (Cierre y envío)
  lastUpdated: null,
};

/**
 * Obtiene la configuración de notificaciones guardada
 */
export async function getNotificationSettings() {
  try {
    const raw = await AsyncStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
    if (!raw) return DEFAULT_NOTIFICATION_SETTINGS;
    const parsed = JSON.parse(raw);
    return {
      enabled: parsed.enabled !== undefined ? parsed.enabled : true,
      activityAlertsEnabled: parsed.activityAlertsEnabled !== undefined ? parsed.activityAlertsEnabled : true,
      lvTime: parsed.lvTime || '17:00',
      vieTime: parsed.vieTime || '16:30',
      sabTime: parsed.sabTime || '12:30',
      lastUpdated: parsed.lastUpdated || null,
    };
  } catch (error) {
    console.error('Error al leer configuración de notificaciones:', error);
    return DEFAULT_NOTIFICATION_SETTINGS;
  }
}

/**
 * Guarda la configuración de notificaciones
 */
export async function saveNotificationSettings(settings) {
  try {
    const toSave = {
      ...DEFAULT_NOTIFICATION_SETTINGS,
      ...settings,
      lastUpdated: new Date().toISOString(),
    };
    await AsyncStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(toSave));
    return toSave;
  } catch (error) {
    console.error('Error al guardar configuración de notificaciones:', error);
    throw error;
  }
}

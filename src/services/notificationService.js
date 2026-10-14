// Servicio de gestión y programación de notificaciones locales con expo-notifications
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { getNotificationSettings } from '../storage/notificationStorage';
import { formatTo12Hour } from '../utils/timeValidation';

// Configurar cómo se manejan las notificaciones cuando la app está en primer plano
try {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
} catch (e) {
  console.warn('Advertencia al configurar notification handler:', e);
}

/**
 * Solicita permisos de notificación al sistema y configura el canal de Android
 */
export async function requestNotificationPermissions() {
  if (Platform.OS === 'web') return false;

  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Permisos de notificaciones no concedidos.');
      return false;
    }

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('agenda-ces-alerts', {
        name: 'Recordatorios Agenda CES',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#002C6C',
        sound: 'default',
        enableVibrate: true,
        showBadge: true,
      });
    }

    return true;
  } catch (error) {
    console.warn('Error solicitando permisos de notificación:', error);
    return false;
  }
}

/**
 * Programa los 3 recordatorios generales (envío de agenda, planificación, cierre).
 */
export async function setupScheduledNotifications() {
  if (Platform.OS === 'web') return;

  try {
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) return;

    const settings = await getNotificationSettings();

    // Cancelar solo las notificaciones generales para no afectar las de actividades
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    for (const notif of scheduled) {
      if (notif.content?.data?.type === 'general_reminder') {
        await Notifications.cancelScheduledNotificationAsync(notif.identifier);
      }
    }

    if (!settings.enabled) {
      console.log('Notificaciones desactivadas por el usuario.');
      return;
    }

    const [lvH, lvM] = settings.lvTime.split(':').map(Number);
    const [vieH, vieM] = settings.vieTime.split(':').map(Number);
    const [sabH, sabM] = settings.sabTime.split(':').map(Number);

    // 1. Lunes a Viernes: Recordatorio enviar agenda
    const weekdays = [2, 3, 4, 5, 6];
    for (const wd of weekdays) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Recordatorio Agenda CES',
          body: 'Hora de enviar tu agenda diaria ejecutada del día.',
          sound: 'default',
          channelId: 'agenda-ces-alerts',
          data: { type: 'general_reminder' },
        },
        trigger: {
          type: 'calendar',
          weekday: wd,
          hour: lvH,
          minute: lvM,
          repeats: true,
        },
      });
    }

    // 2. Viernes: Recordatorio planificar semana
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Planificación semanal CES',
        body: 'Viernes: Recuerda planificar la agenda técnica para la próxima semana.',
        sound: 'default',
        channelId: 'agenda-ces-alerts',
        data: { type: 'general_reminder' },
      },
      trigger: {
        type: 'calendar',
        weekday: 6,
        hour: vieH,
        minute: vieM,
        repeats: true,
      },
    });

    // 3. Sábado: Cierre y envío
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Cierre y envío CES',
        body: 'Sábado: Realiza el cierre semanal de actividades y exporta tu reporte.',
        sound: 'default',
        channelId: 'agenda-ces-alerts',
        data: { type: 'general_reminder' },
      },
      trigger: {
        type: 'calendar',
        weekday: 7,
        hour: sabH,
        minute: sabM,
        repeats: true,
      },
    });

    console.log('Notificaciones generales programadas exitosamente.');
  } catch (error) {
    console.warn('Error programando notificaciones:', error);
  }
}

/**
 * Programa una notificación 30 minutos antes de una actividad específica.
 * Solo la programa si la fecha/hora es en el futuro y si el ajuste de alertas está activado.
 * @param {Object} activity - Objeto de actividad con fecha, horaInicio, titulo, clienteOT
 * @returns {string|null} Identificador de la notificación programada, o null si no aplica
 */
export async function scheduleActivityReminder(activity) {
  if (Platform.OS === 'web') return null;

  try {
    const settings = await getNotificationSettings();
    if (!settings.enabled || !settings.activityAlertsEnabled) {
      return null;
    }

    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) return null;

    const { fecha, horaInicio, titulo, clienteOT } = activity;
    if (!fecha || !horaInicio) return null;

    // Construir la fecha/hora de la actividad
    const [year, month, day] = fecha.split('-').map(Number);
    const [hour, minute] = horaInicio.split(':').map(Number);

    const activityDate = new Date(year, month - 1, day, hour, minute, 0);
    // Restar 30 minutos para el recordatorio
    const reminderDate = new Date(activityDate.getTime() - 30 * 60 * 1000);

    const now = new Date();
    // No programar si el recordatorio ya pasó
    if (reminderDate <= now) return null;

    const secondsUntilReminder = Math.max(1, Math.round((reminderDate.getTime() - now.getTime()) / 1000));
    const horaFormateada = formatTo12Hour(horaInicio);
    const clienteStr = clienteOT ? ` — ${clienteOT}` : '';
    const body = `En 30 minutos: ${titulo}${clienteStr} a las ${horaFormateada}`;

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Recordatorio de actividad CES',
        body,
        sound: 'default',
        channelId: 'agenda-ces-alerts',
        data: { type: 'activity_reminder', activityId: activity.id },
      },
      trigger: {
        type: 'timeInterval',
        seconds: secondsUntilReminder,
        repeats: false,
      },
    });

    return id;
  } catch (error) {
    console.warn('Error programando recordatorio de actividad:', error);
    return null;
  }
}

/**
 * Reprograma todos los recordatorios de una lista de actividades.
 * Cancela las notificaciones previas de actividades y las reprograma.
 * @param {Array} activities - Lista de actividades
 */
export async function rescheduleAllActivityReminders(activities = []) {
  if (Platform.OS === 'web') return;

  try {
    // Cancelar solo notificaciones de tipo activity_reminder
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    for (const notif of scheduled) {
      if (notif.content?.data?.type === 'activity_reminder') {
        await Notifications.cancelScheduledNotificationAsync(notif.identifier);
      }
    }

    const settings = await getNotificationSettings();
    if (!settings.enabled || !settings.activityAlertsEnabled) {
      return;
    }

    // Reprogramar las actividades futuras
    for (const act of activities) {
      await scheduleActivityReminder(act);
    }
  } catch (error) {
    console.warn('Error reprogramando recordatorios de actividades:', error);
  }
}

/**
 * Envía una notificación de prueba inmediata
 */
export async function sendTestNotification() {
  try {
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) return false;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Prueba de notificación CES',
        body: 'El sistema de recordatorios de Agenda CES funciona correctamente.',
        sound: 'default',
        channelId: 'agenda-ces-alerts',
        data: { type: 'test' },
      },
      trigger: null, // Inmediata
    });
    return true;
  } catch (error) {
    console.error('Error enviando notificación de prueba:', error);
    return false;
  }
}

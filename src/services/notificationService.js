// Servicio de gestión y programación de notificaciones locales con expo-notifications
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { getNotificationSettings } from '../storage/notificationStorage';
import { timeStringToMinutes } from '../utils/timeValidation';

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
 * Solicita permisos de notificación al sistema
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
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#002C6C',
      });
    }

    return true;
  } catch (error) {
    console.warn('Error solicitando permisos de notificación:', error);
    return false;
  }
}

/**
 * Programa los 3 recordatorios locales obligatorios de la aplicación:
 * 1. L-V 5:00 PM (o configurada): Recordatorio enviar agenda diaria
 * 2. Viernes 4:30 PM (o configurada): Recordatorio planificar semana siguiente
 * 3. Sábado 12:30 PM (o configurada): Cierre y envío consolidado
 */
export async function setupScheduledNotifications() {
  if (Platform.OS === 'web') return;

  try {
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) return;

    const settings = await getNotificationSettings();

    // Si las notificaciones están desactivadas por el usuario, cancelar todas y salir
    await Notifications.cancelAllScheduledNotificationsAsync();
    if (!settings.enabled) {
      console.log('Notificaciones desactivadas por el usuario.');
      return;
    }

    const [lvH, lvM] = settings.lvTime.split(':').map(Number);
    const [vieH, vieM] = settings.vieTime.split(':').map(Number);
    const [sabH, sabM] = settings.sabTime.split(':').map(Number);

    // 1. Lunes a Viernes: Recordatorio enviar agenda (Días 2 al 6 en Expo Notifications: Lunes=2 ... Viernes=6)
    const weekdays = [2, 3, 4, 5, 6];
    for (const wd of weekdays) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Recordatorio Agenda CES',
          body: 'Hora de enviar tu agenda diaria ejecutada del día.',
          sound: true,
          channelId: 'agenda-ces-alerts',
        },
        trigger: {
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
        title: 'Planificación Semanal CES',
        body: 'Viernes: Recuerda planificar la agenda técnica para la próxima semana.',
        sound: true,
        channelId: 'agenda-ces-alerts',
      },
      trigger: {
        weekday: 6, // Viernes
        hour: vieH,
        minute: vieM,
        repeats: true,
      },
    });

    // 3. Sábado: Cierre y envío
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Cierre y Envío CES',
        body: 'Sábado: Realiza el cierre semanal de actividades y exporta tu reporte.',
        sound: true,
        channelId: 'agenda-ces-alerts',
      },
      trigger: {
        weekday: 7, // Sábado
        hour: sabH,
        minute: sabM,
        repeats: true,
      },
    });

    console.log('Notificaciones programadas exitosamente.');
  } catch (error) {
    console.warn('Error programando notificaciones:', error);
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
        title: 'Prueba de Notificación CES',
        body: 'El sistema de recordatorios de Agenda CES funciona correctamente.',
        sound: true,
        channelId: 'agenda-ces-alerts',
      },
      trigger: null, // Inmediata
    });
    return true;
  } catch (error) {
    console.error('Error enviando notificación de prueba:', error);
    return false;
  }
}

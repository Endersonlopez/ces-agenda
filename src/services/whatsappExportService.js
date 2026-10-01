// Servicio de exportación de reporte estructurado para WhatsApp (Sin emojis)
import { Linking, Alert, Platform } from 'react-native';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { formatDateToDMY } from '../utils/dateUtils';

/**
 * Genera el texto plano estructurado del reporte para WhatsApp
 * @param {Object} params
 * @param {Array} params.activities - Actividades seleccionadas
 * @param {Array} params.selectedDateStrings - Fechas seleccionadas para exportar
 * @param {Object} params.profile - Perfil del técnico
 * @param {string} params.weekLabel - Ej: 'Semana 39 - Sep 2026'
 * @returns {string} Texto formateado
 */
export function buildWhatsAppReportText({
  activities,
  selectedDateStrings,
  profile,
  weekLabel,
}) {
  const lines = [];

  lines.push('========================================');
  lines.push('AGENDA CES - REPORTE DE ACTIVIDADES');
  lines.push('========================================');
  lines.push(`Tecnico: ${(profile.nombre || '')} ${(profile.apellido || '')}`.trim());
  lines.push(`Perfil: ${profile.perfil || 'General'}`);
  lines.push(`Periodo: ${weekLabel}`);
  lines.push('========================================\n');

  // Filtrar actividades por las fechas seleccionadas
  const filtered = activities.filter((act) =>
    selectedDateStrings.includes(act.fecha)
  );

  if (filtered.length === 0) {
    lines.push('No hay actividades registradas en los dias seleccionados.');
    return lines.join('\n');
  }

  // Agrupar por fecha
  const grouped = {};
  for (const dateStr of selectedDateStrings) {
    grouped[dateStr] = [];
  }
  for (const act of filtered) {
    if (!grouped[act.fecha]) grouped[act.fecha] = [];
    grouped[act.fecha].push(act);
  }

  for (const dateStr of selectedDateStrings) {
    const dayActivities = grouped[dateStr] || [];
    if (dayActivities.length === 0) continue;

    const first = dayActivities[0];
    const dayHeader = `--- ${first.diaSemana ? first.diaSemana.toUpperCase() : 'DIA'} (${formatDateToDMY(dateStr)}) ---`;
    lines.push(dayHeader);

    // Ordenar actividades por hora
    const sorted = [...dayActivities].sort((a, b) => a.horaInicio.localeCompare(b.horaInicio));

    sorted.forEach((act, idx) => {
      const planStatus = act.esPlanificada ? 'PLANIFICADA' : 'NO AGENDADA';
      const statusTag = act.estado ? `[${act.estado.toUpperCase()}]` : '[PENDIENTE]';

      lines.push(`${idx + 1}. Horario: ${act.horaInicio} - ${act.horaFin}`);
      lines.push(`   Actividad: ${act.titulo}`);
      if (act.clienteOT) lines.push(`   Cliente / OT: ${act.clienteOT}`);
      if (act.tipo) lines.push(`   Tipo: ${act.tipo}`);
      lines.push(`   Origen: ${planStatus}`);
      lines.push(`   Estado: ${statusTag}`);

      if (act.resultadoReal) {
        lines.push(`   Resultado: ${act.resultadoReal}`);
      }

      if (act.estado === 'No cumplida' && act.justificacion) {
        lines.push(`   Justificacion Obligatoria: ${act.justificacion}`);
      }

      if (act.reprogramacion && act.reprogramacion !== 'No') {
        lines.push(`   Reprogramacion: ${act.reprogramacion}`);
      }

      if (act.observacion) {
        lines.push(`   Observacion / Evidencia: ${act.observacion}`);
      }

      lines.push('');
    });
  }

  lines.push('========================================');
  lines.push('Fin del reporte Agenda CES.');

  return lines.join('\n');
}

/**
 * Comparte el texto vía WhatsApp o menú nativo de compartir
 */
export async function shareViaWhatsApp(reportText) {
  try {
    const encoded = encodeURIComponent(reportText);
    const whatsappUrl = `whatsapp://send?text=${encoded}`;

    const canOpen = await Linking.canOpenURL(whatsappUrl);
    if (canOpen) {
      await Linking.openURL(whatsappUrl);
      return { success: true, method: 'whatsapp' };
    }

    // Alternativa web o share nativo
    const webWhatsAppUrl = `https://api.whatsapp.com/send?text=${encoded}`;
    const canOpenWeb = await Linking.canOpenURL(webWhatsAppUrl);
    if (canOpenWeb && Platform.OS !== 'web') {
      await Linking.openURL(webWhatsAppUrl);
      return { success: true, method: 'whatsapp_web' };
    }

    // Si WhatsApp no está instalado en el dispositivo, guardar archivo de texto y compartir
    const tempFileUri = `${FileSystem.cacheDirectory}Reporte_Agenda_CES.txt`;
    await FileSystem.writeAsStringAsync(tempFileUri, reportText, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(tempFileUri, {
        mimeType: 'text/plain',
        dialogTitle: 'Compartir Reporte Agenda CES',
      });
      return { success: true, method: 'sharing' };
    }

    Alert.alert('Información', 'No se detectó WhatsApp. El texto ha sido copiado o preparado.');
    return { success: false, method: 'none' };
  } catch (error) {
    console.error('Error al exportar a WhatsApp:', error);
    Alert.alert('Error', 'No fue posible abrir WhatsApp directamente.');
    return { success: false, error };
  }
}

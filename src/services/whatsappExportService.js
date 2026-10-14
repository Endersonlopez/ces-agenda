// Servicio de exportación de reporte estructurado para WhatsApp (Sin emojis)
import { Linking, Platform } from 'react-native';
import * as Sharing from 'expo-sharing';
import * as FileSystemLegacy from 'expo-file-system/legacy';
import { formatTo12Hour } from '../utils/timeValidation';

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

  lines.push('Agenda CES - Reporte de actividades');
  lines.push(`Técnico: ${(profile?.nombre || '')} ${(profile?.apellido || '')}`.trim());
  lines.push(`Perfil: ${profile?.perfil || 'General'}`);
  lines.push(`Período: ${weekLabel}`);
  lines.push('');

  // Filtrar actividades por las fechas seleccionadas
  const filtered = activities.filter((act) =>
    selectedDateStrings.includes(act.fecha)
  );

  if (filtered.length === 0) {
    lines.push('No hay actividades registradas en los días seleccionados.');
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
    lines.push(first.diaSemana ? first.diaSemana : 'Día');

    // Ordenar actividades cronológicamente de temprano a tarde
    const sorted = [...dayActivities].sort((a, b) => a.horaInicio.localeCompare(b.horaInicio));

    sorted.forEach((act, idx) => {
      const horaStr = `${formatTo12Hour(act.horaInicio)} a ${formatTo12Hour(act.horaFin)}`;
      lines.push(`${idx + 1}. Horario: ${horaStr}`);
      lines.push(`   Actividad: ${act.titulo}`);
      if (act.clienteOT) lines.push(`   Cliente / OT / LLS: ${act.clienteOT}`);
      if (act.tipo) lines.push(`   Tipo: ${act.tipo}`);
      lines.push(`   Origen: ${act.esPlanificada ? 'Planificada' : 'No agendada'}`);
      lines.push(`   Estado: ${act.estado || 'Pendiente'}`);

      if (act.comentario && act.comentario.trim()) {
        lines.push(`   Comentarios: ${act.comentario.trim()}`);
      }

      if (act.estado === 'No cumplida' && act.observacion && act.observacion.trim()) {
        lines.push(`   Observaciones: ${act.observacion.trim()}`);
      }

      if (act.reprogramacion && act.reprogramacion !== 'No') {
        lines.push(`   Reprogramación: ${act.reprogramacion}`);
      }

      lines.push('');
    });
  }

  return lines.join('\n').trim();
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
    const dir = FileSystemLegacy.cacheDirectory || FileSystemLegacy.documentDirectory;
    const tempFileUri = `${dir}Reporte_Agenda_CES.txt`;
    await FileSystemLegacy.writeAsStringAsync(tempFileUri, reportText, {
      encoding: FileSystemLegacy.EncodingType.UTF8,
    });

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(tempFileUri, {
        mimeType: 'text/plain',
        dialogTitle: 'Compartir reporte Agenda CES',
      });
      return { success: true, method: 'sharing' };
    }

    return { success: false, error: 'No se pudo abrir WhatsApp ni compartir el archivo.' };
  } catch (error) {
    console.error('Error al compartir por WhatsApp:', error);
    throw error;
  }
}

// Servicio de exportación de reporte Excel (.xlsx) con 11 columnas exactas y doble sección
import * as XLSX from 'xlsx';
import * as FileSystemLegacy from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { formatDateToDMY } from '../utils/dateUtils';
import { formatTo12Hour } from '../utils/timeValidation';

export const EXCEL_COLUMNS = [
  'Día',
  'Fecha',
  'Hora',
  'Actividad planificada',
  'Cliente / OT / LLS',
  'Tipo',
  'Resultado real',
  'Estado',
  'Reprogramación',
  'Observación / evidencia',
  'Actividad NO Agendada',
];

/**
 * Codificador Base64 en puro JS seguro para React Native / Hermes (sin depender de btoa global)
 */
function uint8ArrayToBase64(u8) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  let res = '';
  const len = u8.length;
  for (let i = 0; i < len; i += 3) {
    const b0 = u8[i];
    const b1 = i + 1 < len ? u8[i + 1] : 0;
    const b2 = i + 2 < len ? u8[i + 2] : 0;
    res += chars[b0 >> 2];
    res += chars[((b0 & 3) << 4) | (b1 >> 4)];
    res += i + 1 < len ? chars[((b1 & 15) << 2) | (b2 >> 6)] : '=';
    res += i + 2 < len ? chars[b2 & 63] : '=';
  }
  return res;
}

/**
 * Convierte un objeto de actividad a una fila de 11 columnas según la lógica estipulada:
 * - Parte superior (Agenda diaria ejecutada):
 *     Resultado real: "Completado" o "No completado"
 *     Estado: "Cumplió" o "No cumplió"
 *     Reprogramación: Si no cumplió -> "Sí" (o causa), si cumplió -> "No"
 *     Observación / evidencia: Incluye comentarios y observaciones
 *     Actividad planificada / Actividad NO Agendada según corresponda
 * - Parte inferior (Planificación semanal futura):
 *     Solo datos de programación, sin marcar completado/no completado
 */
function mapActivityToExcelRow(act, isFuturePlan = false) {
  const dia = act.diaSemana || '';
  const fecha = formatDateToDMY(act.fecha);
  const hora = act.horaInicio && act.horaFin 
    ? `${formatTo12Hour(act.horaInicio)} - ${formatTo12Hour(act.horaFin)}` 
    : (act.hora || '');
  const clienteOT = act.clienteOT || '';
  const tipo = act.tipo || '';

  // Combinar observaciones, comentarios y justificaciones claramente
  const obsParts = [];
  if (act.comentario && act.comentario.trim()) {
    obsParts.push(`Comentario: ${act.comentario.trim()}`);
  }
  if (act.observacion && act.observacion.trim()) {
    obsParts.push(`Observación: ${act.observacion.trim()}`);
  }
  if (act.justificacion && act.justificacion.trim()) {
    obsParts.push(`Justificación: ${act.justificacion.trim()}`);
  }
  const observacionEvidencia = obsParts.join(' | ');

  if (isFuturePlan) {
    // En planificación semanal futura no se marca ejecución (es a futuro)
    return [
      dia,
      fecha,
      hora,
      act.titulo || '', // Actividad planificada
      clienteOT,
      tipo,
      '', // Resultado real (vacío porque es a futuro)
      '', // Estado
      '', // Reprogramación
      observacionEvidencia,
      '', // Actividad NO Agendada
    ];
  }

  // Agenda diaria (semana ejecutada)
  const isCompleted = act.estado === 'Cumplida' || act.estado === 'Completada';
  const resultadoReal = isCompleted ? 'Completado' : 'No completado';
  const estado = isCompleted ? 'Cumplió' : 'No cumplió';
  const reprogramacion = isCompleted
    ? 'No'
    : (act.reprogramacion && act.reprogramacion !== 'No' ? act.reprogramacion : 'Sí');

  const actividadPlanificada = act.esPlanificada ? (act.titulo || '') : '';
  const actividadNoAgendada = !act.esPlanificada ? (act.titulo || '') : '';

  return [
    dia,
    fecha,
    hora,
    actividadPlanificada,
    clienteOT,
    tipo,
    resultadoReal,
    estado,
    reprogramacion,
    observacionEvidencia,
    actividadNoAgendada,
  ];
}

/**
 * Genera el libro Excel con la parte SUPERIOR (ejecutado) y la parte INFERIOR (planificación siguiente)
 */
export async function generateAndShareExcelReport({
  currentWeekActivities = [],
  nextWeekActivities = [],
  currentWeekLabel = '',
  nextWeekLabel = '',
  profile = {},
  weekNumber = 1,
  weekYear = 2026,
}) {
  try {
    const technicianName = `${profile?.nombre || ''} ${profile?.apellido || ''}`.trim() || 'Técnico';
    const technicianProfile = profile?.perfil || 'Especialista CES';
    const today = new Date();
    const fechaHoy = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;

    const sheetData = [];

    // ==========================================
    // PARTE SUPERIOR: SEMANA SELECCIONADA (EJECUTADO)
    // ==========================================
    sheetData.push([`Agenda operativa CES — ${currentWeekLabel || ''}`]);
    sheetData.push([`Técnico: ${technicianName} | Perfil: ${technicianProfile} | Generado el: ${fechaHoy}`]);
    sheetData.push([]);
    sheetData.push(EXCEL_COLUMNS);

    // Ordenar actividades de la semana actual por fecha y hora
    const sortedCurrent = [...(currentWeekActivities || [])].sort((a, b) => {
      const dateCmp = (a.fecha || '').localeCompare(b.fecha || '');
      if (dateCmp !== 0) return dateCmp;
      return (a.horaInicio || '').localeCompare(b.horaInicio || '');
    });

    if (sortedCurrent.length > 0) {
      for (const act of sortedCurrent) {
        sheetData.push(mapActivityToExcelRow(act, false));
      }
    } else {
      sheetData.push(['(Sin actividades registradas en la semana actual)', '', '', '', '', '', '', '', '', '', '']);
    }

    // ==========================================
    // SEPARACIÓN ENTRE TABLAS
    // ==========================================
    sheetData.push([]);
    sheetData.push([]);
    sheetData.push(['------------------------------------------------------------------------------------------------------------------------']);
    sheetData.push([]);

    // ==========================================
    // PARTE INFERIOR: PLANIFICACIÓN DE LA SEMANA SIGUIENTE
    // ==========================================
    sheetData.push([`Planificación — Semana siguiente: ${nextWeekLabel || ''}`]);
    sheetData.push(['Proyección de actividades para la semana consecutiva (Creación y planificación)']);
    sheetData.push([]);
    sheetData.push(EXCEL_COLUMNS);

    const sortedNext = [...(nextWeekActivities || [])].sort((a, b) => {
      const dateCmp = (a.fecha || '').localeCompare(b.fecha || '');
      if (dateCmp !== 0) return dateCmp;
      return (a.horaInicio || '').localeCompare(b.horaInicio || '');
    });

    if (sortedNext.length > 0) {
      for (const act of sortedNext) {
        sheetData.push(mapActivityToExcelRow(act, true));
      }
    } else {
      sheetData.push(['(Sin actividades planificadas para la semana siguiente)', '', '', '', '', '', '', '', '', '', '']);
    }

    // Crear hoja y libro
    const worksheet = XLSX.utils.aoa_to_sheet(sheetData);

    // Ancho de columnas
    worksheet['!cols'] = [
      { wch: 12 }, // Día
      { wch: 14 }, // Fecha
      { wch: 22 }, // Hora (formato AM/PM)
      { wch: 36 }, // Actividad planificada
      { wch: 28 }, // Cliente / OT / LLS
      { wch: 24 }, // Tipo
      { wch: 20 }, // Resultado real
      { wch: 16 }, // Estado
      { wch: 22 }, // Reprogramación
      { wch: 40 }, // Observación / evidencia
      { wch: 36 }, // Actividad NO Agendada
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Agenda Semanal CES');

    // Generar archivo en base64 de manera segura
    let base64Data;
    try {
      base64Data = XLSX.write(workbook, { type: 'base64', bookType: 'xlsx' });
    } catch (writeErr) {
      const u8 = XLSX.write(workbook, { type: 'array', bookType: 'xlsx' });
      base64Data = uint8ArrayToBase64(u8);
    }

    const fileName = `Agenda_CES_Semana_${weekNumber}_${weekYear}.xlsx`;
    const dir = FileSystemLegacy.cacheDirectory || FileSystemLegacy.documentDirectory;
    const fileUri = `${dir}${fileName}`;

    await FileSystemLegacy.writeAsStringAsync(fileUri, base64Data, {
      encoding: FileSystemLegacy.EncodingType.Base64,
    });

    // Compartir mediante expo-sharing
    const isAvailable = await Sharing.isAvailableAsync();
    if (isAvailable) {
      await Sharing.shareAsync(fileUri, {
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        dialogTitle: `Exportar ${fileName}`,
        UTI: 'com.microsoft.excel.xlsx',
      });
    }

    return fileUri;
  } catch (error) {
    console.error('Error generando archivo Excel:', error);
    throw error;
  }
}

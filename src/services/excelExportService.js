// Servicio de exportación de reporte Excel (.xlsx) con 11 columnas exactas y doble sección
import * as XLSX from 'xlsx';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { formatDateToDMY } from '../utils/dateUtils';

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
 * Convierte un objeto de actividad a una fila de 11 columnas según la lógica estipulada:
 * Si es planificada -> llena 'Actividad planificada' (col 4).
 * Si NO es planificada -> llena 'Actividad NO Agendada' (col 11).
 */
function mapActivityToExcelRow(act) {
  const dia = act.diaSemana || '';
  const fecha = formatDateToDMY(act.fecha);
  const hora = act.hora || (act.horaInicio && act.horaFin ? `${act.horaInicio} - ${act.horaFin}` : '');
  const clienteOT = act.clienteOT || '';
  const tipo = act.tipo || '';
  const resultadoReal = act.resultadoReal || '';
  const estado = act.estado || '';
  const reprogramacion = act.reprogramacion || 'No';

  // Combinar observación con justificación si aplica salto de línea
  let observacionEvidencia = act.observacion || '';
  if (act.estado === 'No cumplida' && act.justificacion) {
    observacionEvidencia = observacionEvidencia
      ? `JUSTIFICACIÓN:\n${act.justificacion}\n\nOBSERVACIÓN:\n${observacionEvidencia}`
      : `JUSTIFICACIÓN:\n${act.justificacion}`;
  }

  // Lógica: Si es planificada llena su columna respectiva, si no, llena la de NO Agendada
  const actividadPlanificada = act.esPlanificada ? act.titulo : '';
  const actividadNoAgendada = !act.esPlanificada ? act.titulo : '';

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
 * @param {Object} params
 * @param {Array} params.currentWeekActivities - Actividades de la semana actual
 * @param {Array} params.nextWeekActivities - Actividades planificadas para la semana siguiente
 * @param {string} params.currentWeekLabel - Etiqueta de la semana actual
 * @param {string} params.nextWeekLabel - Etiqueta de la semana siguiente
 * @param {Object} params.profile - Perfil del técnico
 * @param {number} params.weekNumber - Número de semana actual
 * @param {number} params.weekYear - Año de la semana actual
 * @returns {Promise<string>} URI del archivo generado
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
    const technicianName = `${profile.nombre || ''} ${profile.apellido || ''}`.trim() || 'Técnico';
    const technicianProfile = profile.perfil || 'Especialista CES';

    const sheetData = [];

    // ==========================================
    // PARTE SUPERIOR: SEMANA SELECCIONADA (EJECUTADO)
    // ==========================================
    sheetData.push([`AGENDA CES - EJECUTADO: ${currentWeekLabel.toUpperCase()}`]);
    sheetData.push([`Técnico: ${technicianName} | Perfil: ${technicianProfile} | Generado el: ${new Date().toLocaleDateString('es-ES')}`]);
    sheetData.push([]); // Fila vacía
    sheetData.push(EXCEL_COLUMNS); // Encabezados de 11 columnas exactas

    // Ordenar actividades de la semana actual por fecha y hora
    const sortedCurrent = [...currentWeekActivities].sort((a, b) => {
      const dateCmp = (a.fecha || '').localeCompare(b.fecha || '');
      if (dateCmp !== 0) return dateCmp;
      return (a.horaInicio || '').localeCompare(b.horaInicio || '');
    });

    if (sortedCurrent.length > 0) {
      for (const act of sortedCurrent) {
        sheetData.push(mapActivityToExcelRow(act));
      }
    } else {
      sheetData.push(['(Sin actividades registradas en la semana actual)', '', '', '', '', '', '', '', '', '', '']);
    }

    // ==========================================
    // SEPARACIÓN ENTRE TABLAS
    // ==========================================
    sheetData.push([]);
    sheetData.push([]);
    sheetData.push(['------------------------------------------------------------------------------------------------------------------------------------------------']);
    sheetData.push([]);

    // ==========================================
    // PARTE INFERIOR: PLANIFICACIÓN DE LA SEMANA SIGUIENTE
    // ==========================================
    sheetData.push([`PLANIFICACIÓN - SEMANA SIGUIENTE: ${nextWeekLabel.toUpperCase()}`]);
    sheetData.push([`Proyección de actividades para la semana consecutiva`]);
    sheetData.push([]); // Fila vacía
    sheetData.push(EXCEL_COLUMNS); // Encabezados de 11 columnas exactas

    const sortedNext = [...nextWeekActivities].sort((a, b) => {
      const dateCmp = (a.fecha || '').localeCompare(b.fecha || '');
      if (dateCmp !== 0) return dateCmp;
      return (a.horaInicio || '').localeCompare(b.horaInicio || '');
    });

    if (sortedNext.length > 0) {
      for (const act of sortedNext) {
        // En la planificación siguiente se marcan por defecto como planificadas
        const plannedAct = { ...act, esPlanificada: true };
        sheetData.push(mapActivityToExcelRow(plannedAct));
      }
    } else {
      sheetData.push(['(Sin actividades planificadas para la semana siguiente)', '', '', '', '', '', '', '', '', '', '']);
    }

    // Crear hoja y libro
    const worksheet = XLSX.utils.aoa_to_sheet(sheetData);

    // Ajustar anchos de columnas para legibilidad profesional
    worksheet['!cols'] = [
      { wch: 12 }, // Día
      { wch: 14 }, // Fecha
      { wch: 16 }, // Hora
      { wch: 36 }, // Actividad planificada
      { wch: 28 }, // Cliente / OT / LLS
      { wch: 24 }, // Tipo
      { wch: 30 }, // Resultado real
      { wch: 16 }, // Estado
      { wch: 22 }, // Reprogramación
      { wch: 35 }, // Observación / evidencia
      { wch: 36 }, // Actividad NO Agendada
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Agenda Semanal CES');

    // Generar archivo en base64
    const base64Data = XLSX.write(workbook, {
      type: 'base64',
      bookType: 'xlsx',
    });

    // Guardar en almacenamiento de la app
    const fileName = `Agenda_CES_Semana_${weekNumber}_${weekYear}.xlsx`;
    const fileUri = `${FileSystem.documentDirectory}${fileName}`;

    await FileSystem.writeAsStringAsync(fileUri, base64Data, {
      encoding: FileSystem.EncodingType.Base64,
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

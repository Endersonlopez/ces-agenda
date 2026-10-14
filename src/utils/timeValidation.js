// Validación y formateo de tiempos para Agenda CES
// Sin restricción de jornada mínima/máxima. Solo se valida que inicio < fin y no hay solapamiento.

/**
 * Convierte una cadena HH:mm o Date a minutos desde la medianoche
 */
export function timeStringToMinutes(timeStr) {
  if (!timeStr) return 0;
  if (typeof timeStr === 'object' && timeStr instanceof Date) {
    return timeStr.getHours() * 60 + timeStr.getMinutes();
  }
  const [h, m] = timeStr.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

/**
 * Convierte minutos desde la medianoche a cadena HH:mm (24 horas)
 */
export function minutesToTimeString(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/**
 * Convierte cadena HH:mm a formato 12 horas con AM/PM
 */
export function formatTo12Hour(timeStr) {
  if (!timeStr) return '';
  const [hStr, mStr] = timeStr.split(':');
  let h = parseInt(hStr, 10);
  const m = mStr || '00';
  const period = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  h = h ? h : 12; // la hora '0' debe ser '12'
  return `${String(h).padStart(2, '0')}:${m} ${period}`;
}

/**
 * Valida las horas de inicio y fin de una actividad.
 * Solo se verifica que inicio < fin. No hay límite de jornada.
 * @param {string} startTime - 'HH:mm'
 * @param {string} endTime - 'HH:mm'
 * @returns {{ isValid: boolean, error: string | null }}
 */
export function validateActivityTimes(startTime, endTime) {
  if (!startTime || !endTime) {
    return {
      isValid: false,
      error: 'Debe seleccionar tanto la hora de inicio como la hora de fin.',
    };
  }

  const startMin = timeStringToMinutes(startTime);
  const endMin = timeStringToMinutes(endTime);

  if (startMin >= endMin) {
    return {
      isValid: false,
      error: 'La hora de inicio debe ser anterior a la hora de fin.',
    };
  }

  return { isValid: true, error: null };
}

/**
 * Verifica si una actividad se solapa con alguna de las actividades existentes.
 * @param {string} startTime - 'HH:mm' de la actividad nueva/editada
 * @param {string} endTime - 'HH:mm' de la actividad nueva/editada
 * @param {Array} existingActivities - Lista de actividades del mismo día
 * @param {string|null} excludeId - ID de la actividad a ignorar (para edición)
 * @returns {{ hasOverlap: boolean, conflictTitle: string | null }}
 */
export function checkTimeOverlap(startTime, endTime, existingActivities = [], excludeId = null) {
  const newStart = timeStringToMinutes(startTime);
  const newEnd = timeStringToMinutes(endTime);

  for (const act of existingActivities) {
    if (excludeId && act.id === excludeId) continue;

    const actStart = timeStringToMinutes(act.horaInicio);
    const actEnd = timeStringToMinutes(act.horaFin);

    // Hay solapamiento si los rangos se intersectan
    if (newStart < actEnd && newEnd > actStart) {
      return { hasOverlap: true, conflictTitle: act.titulo || 'otra actividad' };
    }
  }

  return { hasOverlap: false, conflictTitle: null };
}

/**
 * Genera la lista de horas rápidas (00 a 23) para el selector de chips
 */
export function generateHourChips() {
  const hours = [];
  for (let h = 0; h <= 23; h++) {
    hours.push(h);
  }
  return hours;
}

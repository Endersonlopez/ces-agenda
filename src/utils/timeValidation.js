// Validación y formateo estricto de tiempos para Agenda CES

export const MAX_WORKDAY_HOUR = 17;
export const MAX_WORKDAY_MINUTE = 30;
export const MAX_WORKDAY_MINUTES_TOTAL = MAX_WORKDAY_HOUR * 60 + MAX_WORKDAY_MINUTE; // 1050 minutos (17:30)

export const MIN_WORKDAY_HOUR = 7;
export const MIN_WORKDAY_MINUTE = 0;
export const MIN_WORKDAY_MINUTES_TOTAL = MIN_WORKDAY_HOUR * 60 + MIN_WORKDAY_MINUTE; // 420 minutos (07:00)

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
 * Valida estrictamente las horas de inicio y fin de una actividad
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

  // Validación: Hora de inicio debe ser estrictamente anterior a Hora de fin
  if (startMin >= endMin) {
    return {
      isValid: false,
      error: 'La hora de inicio debe ser estrictamente anterior a la hora de fin.',
    };
  }

  // Validación: Jornada máxima hasta las 17:30
  if (endMin > MAX_WORKDAY_MINUTES_TOTAL) {
    return {
      isValid: false,
      error: 'La actividad excede la jornada máxima permitida (hasta las 17:30).',
    };
  }

  // Validación de inicio mínimo de jornada
  if (startMin < MIN_WORKDAY_MINUTES_TOTAL) {
    return {
      isValid: false,
      error: 'La hora de inicio no puede ser anterior a las 07:00.',
    };
  }

  return {
    isValid: true,
    error: null,
  };
}

/**
 * Genera la lista de opciones válidas para el selector de horas (en intervalos de 15 minutos)
 */
export function generateTimeSlots(stepMinutes = 15) {
  const slots = [];
  for (let m = MIN_WORKDAY_MINUTES_TOTAL; m <= MAX_WORKDAY_MINUTES_TOTAL; m += stepMinutes) {
    const time24 = minutesToTimeString(m);
    const time12 = formatTo12Hour(time24);
    slots.push({
      value: time24,
      label24: time24,
      label12: time12,
      display: `${time24} (${time12})`,
      minutes: m,
    });
  }
  return slots;
}

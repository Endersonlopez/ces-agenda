// Utilidades de fechas y semanas para Agenda CES

const MONTH_NAMES_SHORT = [
  'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
  'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
];

const MONTH_NAMES_FULL = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const DAY_NAMES = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

/**
 * Obtiene el número de semana ISO y el año correspondiente
 */
export function getISOWeekAndYear(date = new Date()) {
  const target = new Date(date.valueOf());
  const dayNr = (date.getDay() + 6) % 7; // Lunes = 0, Domingo = 6
  target.setDate(target.getDate() - dayNr + 3); // Jueves de la semana
  const firstThursday = target.valueOf();
  target.setMonth(0, 1);
  if (target.getDay() !== 4) {
    target.setMonth(0, 1 + ((4 - target.getDay()) + 7) % 7);
  }
  const weekNumber = 1 + Math.ceil((firstThursday - target) / 604800000);
  const weekYear = new Date(firstThursday).getFullYear();
  return { weekNumber, weekYear };
}

/**
 * Retorna la clave única de semana: 'YYYY-Wxx'
 */
export function getWeekKey(weekYear, weekNumber) {
  const paddedWeek = String(weekNumber).padStart(2, '0');
  return `${weekYear}-W${paddedWeek}`;
}

/**
 * Obtiene el objeto Date del Lunes de una semana ISO dada
 */
export function getMondayOfISOWeek(weekNumber, weekYear) {
  // 4 de enero siempre está en la semana 1
  const simple = new Date(weekYear, 0, 4);
  const dayOfWeek = (simple.getDay() + 6) % 7;
  const mondayWeek1 = new Date(simple.valueOf());
  mondayWeek1.setDate(simple.getDate() - dayOfWeek);

  const resultMonday = new Date(mondayWeek1.valueOf());
  resultMonday.setDate(mondayWeek1.getDate() + (weekNumber - 1) * 7);
  resultMonday.setHours(0, 0, 0, 0);
  return resultMonday;
}

/**
 * Retorna el texto representativo de la semana: '<- Semana 39 - Sep 2026 ->'
 */
export function formatWeekLabel(weekNumber, weekYear) {
  const monday = getMondayOfISOWeek(weekNumber, weekYear);
  const monthShort = MONTH_NAMES_SHORT[monday.getMonth()];
  return `Semana ${weekNumber} - ${monthShort} ${weekYear}`;
}

/**
 * Obtiene los días laborales (Lunes a Sábado) para una semana dada
 */
export function getWeekDays(weekNumber, weekYear) {
  const monday = getMondayOfISOWeek(weekNumber, weekYear);
  const days = [];

  for (let i = 0; i < 6; i++) {
    const d = new Date(monday.valueOf());
    d.setDate(monday.getDate() + i);

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;

    days.push({
      dateStr,
      dateObj: d,
      dayName: DAY_NAMES[d.getDay()],
      dayNumber: d.getDate(),
      monthShort: MONTH_NAMES_SHORT[d.getMonth()],
      formattedDisplay: `${DAY_NAMES[d.getDay()]} ${d.getDate()} ${MONTH_NAMES_SHORT[d.getMonth()]}`,
      shortFormattedDate: `${day}/${month}/${year}`,
    });
  }

  return days;
}

/**
 * Calcula la semana anterior
 */
export function getPreviousWeekInfo(weekNumber, weekYear) {
  if (weekNumber <= 1) {
    const prevYear = weekYear - 1;
    // La última semana del año anterior suele ser 52 o 53
    const dec28 = new Date(prevYear, 11, 28);
    const { weekNumber: lastWeek } = getISOWeekAndYear(dec28);
    return { weekNumber: lastWeek, weekYear: prevYear };
  }
  return { weekNumber: weekNumber - 1, weekYear };
}

/**
 * Calcula la semana siguiente
 */
export function getNextWeekInfo(weekNumber, weekYear) {
  const dec28 = new Date(weekYear, 11, 28);
  const { weekNumber: maxWeeks } = getISOWeekAndYear(dec28);

  if (weekNumber >= maxWeeks) {
    return { weekNumber: 1, weekYear: weekYear + 1 };
  }
  return { weekNumber: weekNumber + 1, weekYear };
}

/**
 * Formatea una fecha YYYY-MM-DD a DD/MM/YYYY
 */
export function formatDateToDMY(dateStr) {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateStr;
}

/**
 * Obtiene el nombre del día en español según YYYY-MM-DD
 */
export function getDayNameFromDateStr(dateStr) {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-').map(Number);
  const dateObj = new Date(y, m - 1, d);
  return DAY_NAMES[dateObj.getDay()];
}

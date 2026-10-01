// Tipos y estados estandarizados de actividades
export const ACTIVITY_TYPES = [
  'Mantenimiento Preventivo',
  'Mantenimiento Correctivo',
  'Instalación y Configuración',
  'Soporte Técnico',
  'Capacitación y Asesoría',
  'Diagnóstico y Evaluación',
  'Entrega de Equipos',
  'Atención de Garantía',
  'Otro',
];

export const ACTIVITY_STATUS = {
  PENDING: 'Pendiente',
  COMPLETED: 'Cumplida',
  INCOMPLETED: 'No cumplida',
};

export const REPROGRAMMING_OPTIONS = [
  'No',
  'Sí - Por solicitud de cliente',
  'Sí - Por falta de repuestos',
  'Sí - Por factor climático / acceso',
  'Sí - Otra causa',
];

export const DAYS_OF_WEEK = [
  { key: 'monday', name: 'Lunes', index: 1 },
  { key: 'tuesday', name: 'Martes', index: 2 },
  { key: 'wednesday', name: 'Miércoles', index: 3 },
  { key: 'thursday', name: 'Jueves', index: 4 },
  { key: 'friday', name: 'Viernes', index: 5 },
  { key: 'saturday', name: 'Sábado', index: 6 },
];

// Tipos y estados estandarizados de actividades
export const ACTIVITY_TYPES = [
  'Administrativo',
  'Almuerzo',
  'Atención al cliente',
  'Atención de garantía',
  'Capacitación y asesoría',
  'Cotización',
  'Diagnóstico y evaluación',
  'Ensamble',
  'Entrega de equipos',
  'Instalación y configuración',
  'Mantenimiento correctivo',
  'Mantenimiento preventivo',
  'Otro',
  'Reparación',
  'Seguimiento',
  'Servicio',
  'Soporte técnico',
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

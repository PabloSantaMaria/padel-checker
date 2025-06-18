import dotenv from 'dotenv';
dotenv.config();

export const config = {
  checkIntervalMinutes: parseInt(process.env.CHECK_INTERVAL_MINUTES || '30'),
  daysToCheck: (process.env.DAYS_TO_CHECK || 'MO,TU,WE,TH,FR').split(','),
  earliestHour: parseInt(process.env.EARLIEST_HOUR || '18'),
  earliestMinute: parseInt(process.env.EARLIEST_MINUTE || '30'),
  // Nuevas configuraciones para horarios de ejecución
  runStartHour: parseInt(process.env.RUN_START_HOUR || '7'), // Hora de inicio (7 AM por defecto)
  runEndHour: parseInt(process.env.RUN_END_HOUR || '23'), // Hora de fin (11 PM por defecto)
  // Configuración para evitar notificaciones duplicadas
  notificationTtlHours: parseInt(process.env.NOTIFICATION_TTL_HOURS || '24'), // TTL para turnos notificados
  clubId: 1294,
  baseUrl: 'https://alquilatucancha.com/api/v3/availability/sportclubs',
};

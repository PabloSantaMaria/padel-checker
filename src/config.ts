import dotenv from 'dotenv';
dotenv.config();

export const config = {
  checkIntervalMinutes: parseInt(process.env.CHECK_INTERVAL_MINUTES || '30'),
  daysToCheck: (process.env.DAYS_TO_CHECK || 'MO,TU,WE,TH,FR').split(','),
  earliestHour: parseInt(process.env.EARLIEST_HOUR || '18'),
  earliestMinute: parseInt(process.env.EARLIEST_MINUTE || '30'),
  clubId: 1294,
  baseUrl: 'https://alquilatucancha.com/api/v3/availability/sportclubs',
};

import { config } from './config';

// Crear un formateador de fecha reutilizable para mejor rendimiento
export const dateFormatter = new Intl.DateTimeFormat('es-AR', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  hour: '2-digit',
  minute: '2-digit',
});

// Función para capitalizar solo ciertas palabras (días y meses)
export function capitalizeWords(str: string): string {
  return str.replace(/\b(\w+)/g, (match) => {
    // Mantener "de" en minúscula, capitalizar todo lo demás
    if (match.toLowerCase() === 'de') {
      return 'de';
    }
    return match.charAt(0).toUpperCase() + match.slice(1).toLowerCase();
  });
}

export function isValidSlot(dateStr: string): boolean {
  const date = new Date(dateStr);
  const day = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'][date.getDay()];
  const hour = date.getHours();
  const minute = date.getMinutes();

  return (
    config.daysToCheck.includes(day) &&
    (hour > config.earliestHour ||
      (hour === config.earliestHour && minute >= config.earliestMinute))
  );
}

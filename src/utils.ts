import { config } from './config';

// Crear un formateador de fecha reutilizable para mejor rendimiento
export const dateFormatter = new Intl.DateTimeFormat('es-AR', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false, // Formato 24 horas
  timeZone: 'America/Argentina/Buenos_Aires', // Zona horaria específica
});

// Función para capitalizar solo ciertas palabras (días y meses)
export function capitalizeWords(str: string): string {
  return str.replace(/\b[\wáéíóúñü]+/gi, (match) => {
    // Mantener "de" en minúscula, capitalizar todo lo demás
    if (match.toLowerCase() === 'de') {
      return 'de';
    }
    return match.charAt(0).toUpperCase() + match.slice(1).toLowerCase();
  });
}

export function isValidSlot(dateStr: string): boolean {
  const date = new Date(dateStr);

  // Convertir a zona horaria argentina para validación correcta
  const argentinaDate = new Date(
    date.toLocaleString('en-US', {
      timeZone: 'America/Argentina/Buenos_Aires',
    }),
  );

  const day = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'][argentinaDate.getDay()];
  const hour = argentinaDate.getHours();
  const minute = argentinaDate.getMinutes();

  console.log(`Evaluando slot: ${dateStr} -> Día: ${day}, Hora: ${hour}:${minute.toString().padStart(2, '0')}`);

  return (
    config.scheduling.daysToCheck.includes(day) &&
    (hour > config.availability.earliestHour ||
      (hour === config.availability.earliestHour && minute >= config.availability.earliestMinute))
  );
}

export function isWithinRunningHours(): boolean {
  // Get current time in the configured timezone
  const timezone = config.scheduling.timezone || 'UTC';
  const now = new Date();
  
  // Convert to configured timezone
  const localTime = new Date(now.toLocaleString("en-US", { timeZone: timezone }));
  const currentHour = localTime.getHours();
  
  console.log(`Checking running hours in timezone ${timezone}: current hour is ${currentHour}`);

  // Manejar el caso donde el horario cruza medianoche (ej: 22:00 - 06:00)
  if (config.scheduling.runEndHour <= config.scheduling.runStartHour) {
    // El horario cruza medianoche
    const isInRange =
      currentHour >= config.scheduling.runStartHour || currentHour < config.scheduling.runEndHour;
    if (!isInRange) {
      console.log(
        `Fuera del horario de ejecución (${config.scheduling.runStartHour}:00 - ${
          config.scheduling.runEndHour
        }:00 ${timezone}). Hora actual: ${currentHour}:${localTime
          .getMinutes()
          .toString()
          .padStart(2, '0')}`,
      );
    }
    return isInRange;
  } else {
    // Horario normal (no cruza medianoche)
    const isInRange =
      currentHour >= config.scheduling.runStartHour && currentHour < config.scheduling.runEndHour;
    if (!isInRange) {
      console.log(
        `Fuera del horario de ejecución (${config.scheduling.runStartHour}:00 - ${
          config.scheduling.runEndHour
        }:00 ${timezone}). Hora actual: ${currentHour}:${localTime
          .getMinutes()
          .toString()
          .padStart(2, '0')}`,
      );
    }
    return isInRange;
  }
}

// Función para obtener la fecha en formato YYYY-MM-DD en zona horaria argentina
export function getArgentinaDateString(date: Date): string {
  // Crear una nueva fecha ajustada a la zona horaria argentina
  const argentinaDate = new Date(
    date.toLocaleString('en-US', {
      timeZone: 'America/Argentina/Buenos_Aires',
    }),
  );
  
  // Extraer año, mes y día
  const year = argentinaDate.getFullYear();
  const month = (argentinaDate.getMonth() + 1).toString().padStart(2, '0');
  const day = argentinaDate.getDate().toString().padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}

export function getConfigurationInfo(): string {
  const lines = [];
  lines.push('==== CONFIGURACIÓN ACTUAL ====');
  lines.push(`⏰ Intervalo de chequeo: ${config.scheduling.checkIntervalMinutes} minutos`);
  lines.push(`📅 Días a revisar: ${config.scheduling.daysToCheck.join(', ')}`);
  lines.push(`🕒 Horario de ejecución (hs): ${config.scheduling.runStartHour}:00 a ${config.scheduling.runEndHour}:00`);
  lines.push(`🔎 Turnos a partir de (hs): ${config.availability.earliestHour}:${config.availability.earliestMinute.toString().padStart(2, '0')}`);
  lines.push(`🏟️ Clubs habilitados:`);
  config.clubs.forEach(club => {
    lines.push(`   - ${club.displayName} (ID: ${club.id})`);
  });
  lines.push(`🕑 TTL de notificaciones: ${config.notifications.ttlHours} horas`);
  if (config.email.to) {
    lines.push(`✉️ Destinatarios: ${config.email.to}`);
  }
  if (process.env.GITHUB_ACTIONS) {
    lines.push('🏃 Modo: GitHub Actions (repetición por cron job)');
  } else {
    lines.push('🏃 Modo: Ejecución local (repetición automática interna)');
  }
  lines.push('==============================');
  return lines.join('\n');
}

export function printCurrentConfig() {
  const configInfo = getConfigurationInfo();
  console.log(configInfo);
}

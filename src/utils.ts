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

function isTimeInRange(hour: number, minute: number, startHour: number, startMinute: number, endHour: number, endMinute: number): boolean {
  // Convertir todo a minutos desde medianoche para comparación fácil
  const currentMinutes = hour * 60 + minute;
  const startMinutes = startHour * 60 + startMinute;
  const endMinutes = endHour * 60 + endMinute;
  
  // Manejar el caso donde el rango cruza medianoche (ej: 22:30 - 02:00)
  if (endMinutes <= startMinutes) {
    // El rango cruza medianoche
    return currentMinutes >= startMinutes || currentMinutes < endMinutes;
  } else {
    // Rango normal (no cruza medianoche)
    return currentMinutes >= startMinutes && currentMinutes < endMinutes;
  }
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
    isTimeInRange(hour, minute, config.availability.startHour, config.availability.startMinute, config.availability.endHour, config.availability.endMinute)
  );
}

export function isWithinRunningHours(): boolean {
  // Get current time in the configured timezone
  const timezone = config.scheduling.timezone || 'UTC';
  const now = new Date();
  
  // Convert to configured timezone
  const localTime = new Date(now.toLocaleString("en-US", { timeZone: timezone }));
  const currentHour = localTime.getHours();
  const currentDay = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'][localTime.getDay()];
  
  console.log(`Checking running hours in timezone ${timezone}: current hour is ${currentHour}, day is ${currentDay}`);

  // First check if today is a valid day to run
  if (!config.scheduling.daysToCheck.includes(currentDay)) {
    console.log(`No se ejecuta hoy (${currentDay}). Días configurados: ${config.scheduling.daysToCheck.join(', ')}`);
    return false;
  }

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
  lines.push(`🔎 Turnos en rango (hs): ${config.availability.startHour}:${config.availability.startMinute.toString().padStart(2, '0')} a ${config.availability.endHour}:${config.availability.endMinute.toString().padStart(2, '0')}`);
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

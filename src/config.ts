import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

// Definir tipos
export interface Club {
  id: number;
  name: string;
  displayName: string;
  enabled: boolean;
  reservationUrlTemplate: string; // Template con {date} que se reemplazará
}

// Cargar configuración de clubes desde archivo JSON
function loadClubsConfig(): Club[] {
  const configPath = path.join(process.cwd(), 'clubs.json');
  
  try {
    if (!fs.existsSync(configPath)) {
      throw new Error(`Archivo de configuración de clubes no encontrado: ${configPath}`);
    }
    
    const configContent = fs.readFileSync(configPath, 'utf8');
    const clubs: Club[] = JSON.parse(configContent);
    
    // Validar que cada club tenga las propiedades requeridas
    clubs.forEach((club, index) => {
      if (!club.id || !club.name || !club.displayName || !club.reservationUrlTemplate) {
        throw new Error(`Club en posición ${index} tiene propiedades faltantes`);
      }
    });
    
    const enabledClubs = clubs.filter(club => club.enabled);
    console.log(`Configuración cargada: ${clubs.length} clubes totales, ${enabledClubs.length} habilitados`);
    
    return enabledClubs;
  } catch (error) {
    console.error('Error cargando configuración de clubes:', error);
    throw error;
  }
}

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
  // Configuración de clubes desde archivo JSON
  clubs: loadClubsConfig(),
  baseUrl: 'https://alquilatucancha.com/api/v3/availability/sportclubs',
  // Sport IDs para filtrar por deporte
  sports: {
    padel: "7", // ID del deporte Pádel en la API
  },
};

// Función helper para obtener club por ID
export function getClubById(id: number): Club | undefined {
  return config.clubs.find(club => club.id === id);
}

import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { AppConfig, Club } from './types';

dotenv.config();

// Cargar configuración desde archivo JSON
function loadConfig(): AppConfig {
  const configPath = path.join(process.cwd(), 'app-config.json');
  
  try {
    if (!fs.existsSync(configPath)) {
      throw new Error(`Archivo de configuración no encontrado: ${configPath}`);
    }
    
    const configContent = fs.readFileSync(configPath, 'utf8');
    const config: AppConfig = JSON.parse(configContent);
    
    // Validar que cada club tenga las propiedades requeridas
    config.clubs.forEach((club, index) => {
      if (!club.id || !club.name || !club.displayName || !club.reservationUrlTemplate) {
        throw new Error(`Club en posición ${index} tiene propiedades faltantes`);
      }
    });
    
    const enabledClubs = config.clubs.filter(club => club.enabled);
    console.log(`Configuración cargada: ${config.clubs.length} clubes totales, ${enabledClubs.length} habilitados`);
    
    // Filtrar solo clubes habilitados
    config.clubs = enabledClubs;
    
    return config;
  } catch (error) {
    console.error('Error cargando configuración:', error);
    throw error;
  }
}

const appConfig = loadConfig();

// Add email configuration from environment variables (sensitive information)
export const config = {
  ...appConfig,
  email: {
    user: process.env.EMAIL_SENDER || '',
    password: process.env.EMAIL_PASSWORD || '',
    from: process.env.EMAIL_SENDER || '',
    to: process.env.EMAIL_RECIPIENTS || '',
  },
};

// Función helper para obtener club por ID
export function getClubById(id: number): Club | undefined {
  return config.clubs.find((club: Club) => club.id === id);
}

import axios from 'axios';
import { config, Club, getClubById } from './config';
import { sendEmail } from './mailer';
import {
  capitalizeWords,
  dateFormatter,
  isValidSlot,
  isWithinRunningHours,
  getArgentinaDateString,
} from './utils';
import { SlotStorage } from './storage';

// Tipos para mejor organización
interface Slot {
  club: Club;
  court: string;
  time: string;
}

interface ClubAvailabilityResult {
  club: Club;
  slots: Slot[];
}

async function checkClubAvailability(club: Club, dateStr: string, storage: SlotStorage): Promise<Slot[]> {
  const url = `${config.baseUrl}/${club.id}?date=${dateStr}`;
  
  try {
    const response = await axios.get(url);
    
    // La API devuelve un objeto con available_courts, cada uno con available_slots
    // Filtrar solo canchas de Pádel usando el sport_id configurado
    const padelCourts = response.data.available_courts.filter((court: any) => 
      court.sport_ids && court.sport_ids.includes(config.sports.padel)
    );
    
    const slots = padelCourts.flatMap((court: any) =>
      court.available_slots.map((slot: any) => ({
        club,
        court: court.name,
        time: slot.start,
      })),
    );

    // Filtrar por horarios válidos
    const validSlots = slots.filter((slot: Slot) => isValidSlot(slot.time));
    
    // Filtrar turnos que ya fueron notificados
    const newSlots = validSlots.filter((slot: Slot) => 
      !storage.hasBeenNotified(club.id, slot.court, slot.time)
    );

    console.log(`${club.displayName} - ${dateStr}: ${slots.length} totales, ${validSlots.length} válidos, ${newSlots.length} nuevos`);
    
    return newSlots;
  } catch (error) {
    console.error(`Error consultando ${club.displayName}:`, error);
    return [];
  }
}

async function checkAvailability(): Promise<{ messages: string[], storage: SlotStorage }> {
  const today = new Date();
  const storage = new SlotStorage();
  const allSlots: Slot[] = [];

  console.log('=== Iniciando verificación de disponibilidad ===');
  const stats = storage.getStats();
  console.log(`Historial: ${stats.total} turnos notificados, el más antiguo hace ${stats.oldestHours || 0} horas`);
  console.log(`Clubes habilitados: ${config.clubs.map(c => c.displayName).join(', ')}`);

  // Verificar cada club y cada día
  for (let i = 0; i < 6; i++) {
    const checkDate = new Date(today);
    checkDate.setDate(today.getDate() + i);
    const dateStr = checkDate.toISOString().split('T')[0];

    // Verificar todos los clubes en paralelo para cada fecha
    const clubPromises = config.clubs.map(club => 
      checkClubAvailability(club, dateStr, storage)
    );
    
    const clubResults = await Promise.all(clubPromises);
    
    // Combinar todos los slots de todos los clubes
    clubResults.forEach(slots => allSlots.push(...slots));
  }

  // Generar mensajes agrupados por club
  const messages = generateClubGroupedMessages(allSlots);
  
  // Marcar todos los turnos encontrados como notificados
  allSlots.forEach(slot => {
    storage.markAsNotified(slot.club.id, slot.court, slot.time);
  });

  return { messages, storage };
}

function generateClubGroupedMessages(slots: Slot[]): string[] {
  if (slots.length === 0) return [];

  // Agrupar slots por club
  const slotsByClub = new Map<number, Slot[]>();
  
  slots.forEach(slot => {
    if (!slotsByClub.has(slot.club.id)) {
      slotsByClub.set(slot.club.id, []);
    }
    slotsByClub.get(slot.club.id)!.push(slot);
  });

  const messages: string[] = [];

  // Generar mensaje para cada club
  slotsByClub.forEach((clubSlots, clubId) => {
    const club = getClubById(clubId);
    if (!club) return;

    messages.push(`\n🏢 **${club.displayName}**`);
    
    clubSlots.forEach(slot => {
      const date = new Date(slot.time);
      let turno = dateFormatter.format(date);
      turno = capitalizeWords(turno);
      
      const urlDate = getArgentinaDateString(date);
      const reservationUrl = club.reservationUrlTemplate.replace('{date}', urlDate);
      
      messages.push(`📅 ${turno} - 🏟️ ${slot.court}\n🔗 Reservar: ${reservationUrl}`);
    });
  });

  return messages;
}

(async () => {
  const run = async () => {
    try {
      // Verificar si estamos dentro del horario permitido
      if (!isWithinRunningHours()) {
        return; // Salir sin hacer nada si está fuera del horario
      }

      const result = await checkAvailability();
      const { messages: available, storage } = result;
      
      if (available.length) {
        // Mostrar turnos disponibles en consola
        console.log('Turnos disponibles encontrados:', available);
        
        // Crear mensaje con formato multi-club
        const clubNames = config.clubs.map(c => c.displayName).join(' y ');
        const message = `🎾 ¡Hay turnos disponibles!\n${available.join('\n')}`;
        
        await sendEmail(`🎾 Turnos disponibles en ${clubNames}!`, message);
        console.log(`📧 Email enviado con ${available.length} turnos nuevos`);
      } else {
        console.log('Sin turnos nuevos para notificar (ya fueron enviados anteriormente o no hay disponibles).');
      }
    } catch (err) {
      console.error('Error al consultar disponibilidad:', err);
    }
  };

  await run();

  // Solo usar setInterval si NO estamos en GitHub Actions
  // GitHub Actions maneja la repetición con cron jobs
  if (!process.env.GITHUB_ACTIONS) {
    console.log(
      `Configurando ejecución automática cada ${config.checkIntervalMinutes} minutos...`,
    );
    setInterval(run, config.checkIntervalMinutes * 60 * 1000);
  } else {
    console.log(
      'Ejecutando en GitHub Actions - el cron job maneja la repetición',
    );
  }
})();

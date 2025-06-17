import axios from 'axios';
import { config } from './config';
import { sendEmail } from './mailer';
import {
  capitalizeWords,
  dateFormatter,
  isValidSlot,
  isWithinRunningHours,
  getArgentinaDateString,
} from './utils';

async function checkAvailability() {
  const today = new Date();
  const messages: string[] = [];

  for (let i = 0; i < 6; i++) {
    const checkDate = new Date(today);
    checkDate.setDate(today.getDate() + i);
    const dateStr = checkDate.toISOString().split('T')[0];

    const url = `${config.baseUrl}/${config.clubId}?date=${dateStr}`;
    const response = await axios.get(url);

    const slots = response.data.available_courts.flatMap((court: any) =>
      court.available_slots.map((slot: any) => ({
        court: court.name,
        time: slot.start,
      })),
    );

    const filtered = slots.filter((slot: any) => isValidSlot(slot.time));

    filtered.forEach((slot: any) => {
      // Formatear fecha y hora usando el formateador reutilizable
      const date = new Date(slot.time);
      let turno = dateFormatter.format(date);

      // Capitalizar palabras (ya no necesitamos convertir am/pm porque usamos formato 24h)
      turno = capitalizeWords(turno);

      // Formatear fecha para la URL usando la zona horaria argentina
      const urlDate = getArgentinaDateString(date);
      const reservationUrl = `https://atcsports.io/venues/head-club-tandil-tandil?dia=${urlDate}`;

      // Agregar mensaje formateado con link de reserva
      messages.push(
        `📅 ${turno} - 🏟️  ${slot.court}\n🔗 Reservar: ${reservationUrl}`,
      );
    });
  }

  return messages;
}

(async () => {
  const run = async () => {
    try {
      // Verificar si estamos dentro del horario permitido
      if (!isWithinRunningHours()) {
        return; // Salir sin hacer nada si está fuera del horario
      }

      const available = await checkAvailability();
      if (available.length) {
        // Mostrar turnos disponibles en consola
        console.log('Turnos disponibles encontrados:', available);
        // Enviar correo con los turnos disponibles
        const message = `🎾 ¡Hay turnos disponibles!\n\n${available.join(
          '\n',
        )}`;
        await sendEmail('🎾 Turnos disponibles en Head Tandil!', message);
      } else {
        console.log('Sin turnos disponibles en los horarios configurados.');
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

import axios from 'axios';
import { config } from './config';
import { sendEmail } from './mailer';
import { capitalizeWords, dateFormatter, isValidSlot } from './utils';

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

      // Capitalizar palabras y convertir am/pm a mayúsculas
      turno = capitalizeWords(turno)
        .replace(/a\.\s*m\./gi, 'A. M.')
        .replace(/p\.\s*m\./gi, 'P. M.');

      // Agregar mensaje formateado
      messages.push(`📅 ${turno} - 🏟️  ${slot.court}`);
    });
  }

  return messages;
}

(async () => {
  const run = async () => {
    try {
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
    console.log(`Configurando ejecución automática cada ${config.checkIntervalMinutes} minutos...`);
    setInterval(run, config.checkIntervalMinutes * 60 * 1000);
  } else {
    console.log('Ejecutando en GitHub Actions - el cron job maneja la repetición');
  }
})();

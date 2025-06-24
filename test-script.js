const { config, getClubById } = require('./dist/config.js');
const { sendEmail } = require('./dist/mailer.js');
const { SlotStorage } = require('./dist/storage.js');
const {
  capitalizeWords,
  dateFormatter,
  isValidSlot,
  isWithinRunningHours,
  getArgentinaDateString,
} = require('./dist/utils.js');

// Función para crear datos de prueba
function createMockSlots() {
  const monday = new Date();
  // Encontrar el próximo lunes
  const daysUntilMonday = (1 - monday.getDay() + 7) % 7 || 7;
  monday.setDate(monday.getDate() + daysUntilMonday);
  monday.setHours(19, 0, 0, 0); // 7:00 PM
  
  const slots = [
    {
      club: config.clubs.find(c => c.id === 1294), // Head
      court: 'Cancha 1',
      time: monday.toISOString(),
    },
    {
      club: config.clubs.find(c => c.id === 1294), // Head
      court: 'Cancha 2', 
      time: new Date(monday.getTime() + 90 * 60 * 1000).toISOString(), // +1.5h
    },
    {
      club: config.clubs.find(c => c.id === 796), // Pico
      court: 'Cancha 1',
      time: new Date(monday.getTime() + 60 * 60 * 1000).toISOString(), // +1h
    }
  ];
  
  return slots;
}

// Función para generar mensajes como en el código real
function generateClubGroupedMessages(slots) {
  if (slots.length === 0) return { messages: [], clubsWithSlots: [] };

  // Agrupar slots por club
  const slotsByClub = new Map();
  
  slots.forEach(slot => {
    if (!slotsByClub.has(slot.club.id)) {
      slotsByClub.set(slot.club.id, []);
    }
    slotsByClub.get(slot.club.id).push(slot);
  });

  const messages = [];
  const clubsWithSlots = [];

  // Generar mensaje para cada club
  slotsByClub.forEach((clubSlots, clubId) => {
    const club = getClubById(clubId);
    if (!club) return;

    clubsWithSlots.push(club);
    messages.push(`\n🏢 **${club.displayName}**`);
    
    clubSlots.forEach(slot => {
      const date = new Date(slot.time);
      let turno = dateFormatter.format(date);
      turno = capitalizeWords(turno);
      
      const urlDate = getArgentinaDateString(date);
      const reservationUrl = club.reservationUrlTemplate.replace('{date}', urlDate) + `&sportIds=${config.sports.padel}`;
      
      messages.push(`📅 ${turno} - 🏟️ ${slot.court}\n🔗 Reservar: ${reservationUrl}`);
    });
  });

  return { messages, clubsWithSlots };
}

async function testCompleteSystem() {
  console.log('🧪 === PRUEBA COMPLETA DEL SISTEMA ===');
  
  const storage = new SlotStorage();
  
  console.log('\n1. 📊 Estado inicial del storage:');
  const stats = storage.getStats();
  console.log(`   Turnos en historial: ${stats.total}`);
  console.log(`   Turno más antiguo: ${stats.oldestHours || 0} horas`);
  
  console.log('\n2. 🏢 Clubes configurados:');
  config.clubs.forEach(club => {
    console.log(`   - ${club.displayName} (ID: ${club.id}) [${club.enabled ? 'HABILITADO' : 'DESHABILITADO'}]`);
  });
  
  console.log('\n3. ⏰ Verificando horarios y filtros:');
  console.log(`   Horario de ejecución: ${config.runStartHour}:00 - ${config.runEndHour}:00`);
  console.log(`   ¿Estamos en horario?: ${isWithinRunningHours()}`);
  console.log(`   Días a verificar: ${config.daysToCheck.join(', ')}`);
  console.log(`   Horario mínimo: ${config.earliestHour}:${config.earliestMinute.toString().padStart(2, '0')}`);
  
  console.log('\n4. 🎾 Generando datos de prueba:');
  const mockSlots = createMockSlots();
  mockSlots.forEach((slot, i) => {
    const isValid = isValidSlot(slot.time);
    const wasNotified = storage.hasBeenNotified(slot.club.id, slot.court, slot.time);
    console.log(`   Slot ${i + 1}: ${slot.club.displayName} - ${slot.court}`);
    console.log(`     Horario: ${new Date(slot.time).toLocaleString('es-AR')}`);
    console.log(`     ¿Es válido?: ${isValid ? '✅' : '❌'}`);
    console.log(`     ¿Ya notificado?: ${wasNotified ? '✅' : '❌'}`);
  });
  
  // Filtrar slots válidos y no notificados
  const validSlots = mockSlots.filter(slot => isValidSlot(slot.time));
  const newSlots = validSlots.filter(slot => 
    !storage.hasBeenNotified(slot.club.id, slot.court, slot.time)
  );
  
  console.log(`\n5. 📝 Resultado del filtrado:`);
  console.log(`   Slots totales: ${mockSlots.length}`);
  console.log(`   Slots válidos: ${validSlots.length}`);
  console.log(`   Slots nuevos: ${newSlots.length}`);
  
  if (newSlots.length > 0) {
    console.log('\n6. 📧 Generando y enviando email:');
    
    // Generar mensajes agrupados por club
    const result = generateClubGroupedMessages(newSlots);
    const messages = result.messages;
    const clubsWithSlots = result.clubsWithSlots;
    console.log('   Mensajes generados:');
    messages.forEach(msg => console.log(`     ${msg}`));
    
    // Crear mensaje final con asunto dinámico
    const clubNamesWithSlots = clubsWithSlots.map(c => c.displayName).join(' y ');
    const finalMessage = `🎾 ¡Hay turnos disponibles!\n${messages.join('\n')}`;
    
    console.log(`\n   📧 Enviando email con asunto dinámico: "🎾 Turnos disponibles en ${clubNamesWithSlots}!"`);
    console.log('   📧 Enviando email...');
    try {
      await sendEmail(`🎾 Turnos disponibles en ${clubNamesWithSlots}!`, finalMessage);
      console.log('   ✅ Email enviado exitosamente');
      
      // Marcar como notificados
      console.log('\n7. 💾 Marcando turnos como notificados:');
      newSlots.forEach(slot => {
        storage.markAsNotified(slot.club.id, slot.court, slot.time);
        console.log(`     ✅ ${slot.club.displayName} - ${slot.court} - ${new Date(slot.time).toLocaleString('es-AR')}`);
      });
      
    } catch (error) {
      console.log(`   ❌ Error enviando email: ${error.message}`);
    }
  } else {
    console.log('\n6. ℹ️  Sin turnos nuevos para notificar');
  }
  
  console.log('\n🎉 === PRUEBA COMPLETA FINALIZADA ===');
}

// Ejecutar la prueba
testCompleteSystem().catch(console.error);

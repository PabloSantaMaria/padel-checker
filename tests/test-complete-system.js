const { config, getClubById } = require('../dist/config.js');
const { sendEmail } = require('../dist/mailer.js');
const { SlotStorage } = require('../dist/storage.js');
const {
  capitalizeWords,
  dateFormatter,
  isValidSlot,
  isWithinRunningHours,
  getArgentinaDateString,
  getConfigurationInfo,
} = require('../dist/utils.js');

// Function to create test slots
function createMockSlots() {
  const monday = new Date();
  // Find next Monday
  const daysUntilMonday = (1 - monday.getDay() + 7) % 7 || 7;
  monday.setDate(monday.getDate() + daysUntilMonday);
  monday.setHours(19, 0, 0, 0); // 7:00 PM
  
  const availableClubs = config.clubs;
  if (availableClubs.length === 0) {
    console.log('⚠️ No hay clubes habilitados para generar datos de prueba');
    return [];
  }
  
  const slots = [];
  
  // Generate slots for each available club
  availableClubs.forEach((club, index) => {
    slots.push({
      club: club,
      court: `Cancha ${index + 1}`,
      time: new Date(monday.getTime() + (index * 60 * 60 * 1000)).toISOString(), // Stagger by 1 hour
    });
  });
  
  // Add some additional slots
  if (availableClubs.length > 0) {
    slots.push({
      club: availableClubs[0],
      court: 'Cancha 2', 
      time: new Date(monday.getTime() + 90 * 60 * 1000).toISOString(), // +1.5h
    });
  }
  
  return slots;
}

// Function to generate messages like in the real code
function generateClubGroupedMessages(slots) {
  if (slots.length === 0) return { messages: [], clubsWithSlots: [] };

  // Group slots by club
  const slotsByClub = new Map();
  
  slots.forEach(slot => {
    if (!slotsByClub.has(slot.club.id)) {
      slotsByClub.set(slot.club.id, []);
    }
    slotsByClub.get(slot.club.id).push(slot);
  });

  const messages = [];
  const clubsWithSlots = [];

  // Generate message for each club
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
      const reservationUrl = club.reservationUrlTemplate.replace('{date}', urlDate) + `&sportIds=${config.api.sports.padel}`;
      
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
    console.log(`   - ${club.displayName} (ID: ${club.id}) [HABILITADO]`);
  });
  
  console.log('\n3. ⏰ Verificando horarios y filtros:');
  console.log(`   Horario de ejecución: ${config.scheduling.runStartHour}:00 - ${config.scheduling.runEndHour}:00 ${config.scheduling.timezone}`);
  console.log(`   ¿Estamos en horario?: ${isWithinRunningHours()}`);
  console.log(`   Días a verificar: ${config.scheduling.daysToCheck.join(', ')}`);
  console.log(`   Horario mínimo: ${config.availability.earliestHour}:${config.availability.earliestMinute.toString().padStart(2, '0')}`);
  console.log(`   TTL notificaciones: ${config.notifications.ttlHours} horas`);
  
  console.log('\n4. 🎾 Generando datos de prueba:');
  const mockSlots = createMockSlots();
  
  if (mockSlots.length === 0) {
    console.log('   ⚠️ No se pudieron generar datos de prueba (sin clubes habilitados)');
    return;
  }
  
  mockSlots.forEach((slot, i) => {
    const isValid = isValidSlot(slot.time);
    const wasNotified = storage.hasBeenNotified(slot.club.id, slot.court, slot.time);
    console.log(`   Slot ${i + 1}: ${slot.club.displayName} - ${slot.court}`);
    console.log(`     Horario: ${new Date(slot.time).toLocaleString('es-AR')}`);
    console.log(`     ¿Es válido?: ${isValid ? '✅' : '❌'}`);
    console.log(`     ¿Ya notificado?: ${wasNotified ? '✅' : '❌'}`);
  });
  
  // Filter valid and not notified slots
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
    
    // Generate messages grouped by club
    const result = generateClubGroupedMessages(newSlots);
    const messages = result.messages;
    const clubsWithSlots = result.clubsWithSlots;
    console.log('   Mensajes generados:');
    messages.forEach(msg => console.log(`     ${msg}`));
    
    // Create final message with dynamic subject
    const clubNamesWithSlots = clubsWithSlots.map(c => c.displayName).join(' y ');
    const configInfo = getConfigurationInfo();
    const finalMessage = `🎾 ¡Hay turnos disponibles!\n\n${messages.join('\n')}\n\n\n${configInfo}`;
    
    console.log(`\n   📧 Asunto: "🎾 Turnos disponibles en ${clubNamesWithSlots}!"`);
    console.log('   📧 Enviando email de prueba...');
    
    try {
      await sendEmail(`🎾 [TEST] Turnos disponibles en ${clubNamesWithSlots}!`, finalMessage);
      console.log('   ✅ Email enviado exitosamente');
      
      // Mark as notified
      console.log('\n7. 💾 Marcando turnos como notificados:');
      newSlots.forEach(slot => {
        storage.markAsNotified(slot.club.id, slot.court, slot.time);
        console.log(`     ✅ ${slot.club.displayName} - ${slot.court} - ${new Date(slot.time).toLocaleString('es-AR')}`);
      });
      
    } catch (error) {
      console.log(`   ❌ Error enviando email: ${error.message}`);
      console.log('   💡 Tip: Verifica las variables de entorno EMAIL_* en tu .env');
    }
  } else {
    console.log('\n6. ℹ️  Sin turnos nuevos para notificar');
  }
  
  console.log('\n🎉 === PRUEBA COMPLETA FINALIZADA ===');
}

// Execute the test
testCompleteSystem().catch(console.error);

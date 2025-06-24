const { SlotStorage } = require('../dist/storage.js');

console.log('🧪 === PRUEBA DE STORAGE ===\n');

const storage = new SlotStorage();

console.log('1. 📊 Estado inicial:');
const initialStats = storage.getStats();
console.log(`   Turnos en historial: ${initialStats.total}`);
console.log(`   Turno más antiguo: ${initialStats.oldestHours || 0} horas`);

console.log('\n2. 💾 Probando notificaciones:');

// Test data
const testClubId = 1294;
const testCourt = 'Cancha Test';
const testTime = new Date().toISOString();

console.log(`   Probando con: Club ${testClubId}, ${testCourt}, ${testTime}`);

// Check if already notified (should be false)
const wasNotified = storage.hasBeenNotified(testClubId, testCourt, testTime);
console.log(`   ¿Ya notificado? ${wasNotified ? '✅' : '❌'}`);

// Mark as notified
storage.markAsNotified(testClubId, testCourt, testTime);
console.log('   ✅ Marcado como notificado');

// Check again (should be true now)
const nowNotified = storage.hasBeenNotified(testClubId, testCourt, testTime);
console.log(`   ¿Ya notificado ahora? ${nowNotified ? '✅' : '❌'}`);

// Try to mark again (should not create duplicates)
storage.markAsNotified(testClubId, testCourt, testTime);

console.log('\n3. 📊 Estado después de las pruebas:');
const finalStats = storage.getStats();
console.log(`   Turnos en historial: ${finalStats.total}`);
console.log(`   Turno más antiguo: ${finalStats.oldestHours || 0} horas`);

console.log('\n4. 🧪 Probando con múltiples turnos:');
const testSlots = [
  { clubId: 1294, court: 'Cancha 1', time: new Date(Date.now() + 60*60*1000).toISOString() },
  { clubId: 796, court: 'Cancha 2', time: new Date(Date.now() + 2*60*60*1000).toISOString() },
  { clubId: 1294, court: 'Cancha 3', time: new Date(Date.now() + 3*60*60*1000).toISOString() },
];

testSlots.forEach((slot, index) => {
  const wasNotified = storage.hasBeenNotified(slot.clubId, slot.court, slot.time);
  console.log(`   Slot ${index + 1} - Club ${slot.clubId}, ${slot.court}: ${wasNotified ? 'Ya notificado' : 'Nuevo'}`);
  
  if (!wasNotified) {
    storage.markAsNotified(slot.clubId, slot.court, slot.time);
    console.log(`     ✅ Marcado como notificado`);
  }
});

console.log('\n5. 📊 Estado final:');
const endStats = storage.getStats();
console.log(`   Turnos en historial: ${endStats.total}`);
console.log(`   Turno más antiguo: ${endStats.oldestHours || 0} horas`);

console.log('\n✅ Test de storage completado!');

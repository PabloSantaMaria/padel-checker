// Test temporal para verificar el rango de horarios
const { isValidSlot } = require('./dist/utils.js');

console.log('🧪 Probando límites del rango 17:30 - 20:00:');

const testSlots = [
  '2025-07-07T17:29:00-03:00', // Antes del inicio (debería ser ❌)
  '2025-07-07T17:30:00-03:00', // Exactamente al inicio (debería ser ✅)
  '2025-07-07T19:59:00-03:00', // Antes del final (debería ser ✅)
  '2025-07-07T20:00:00-03:00', // Exactamente al final (debería ser ❌)
  '2025-07-07T20:01:00-03:00', // Después del final (debería ser ❌)
  '2025-07-07T21:00:00-03:00', // Mucho después del final (debería ser ❌)
];

testSlots.forEach(slot => {
  const isValid = isValidSlot(slot);
  const date = new Date(slot);
  const day = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'][date.getDay()];
  console.log(`   ${slot} (${day}): ${isValid ? '✅' : '❌'}`);
});

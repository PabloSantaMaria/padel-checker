const {
  isValidSlot,
  isWithinRunningHours,
  getArgentinaDateString,
  capitalizeWords,
  dateFormatter,
} = require('../dist/utils.js');
const { config } = require('../dist/config.js');

console.log('🧪 === PRUEBA DE UTILIDADES ===\n');

console.log('1. 📅 Prueba de formateo de fechas:');
const testDate = new Date('2025-06-25T19:30:00-03:00');
console.log(`   Fecha original: ${testDate.toISOString()}`);
console.log(`   Formato Argentina: ${dateFormatter.format(testDate)}`);
console.log(`   Capitalizado: ${capitalizeWords(dateFormatter.format(testDate))}`);
console.log(`   Fecha para URL: ${getArgentinaDateString(testDate)}`);

console.log('\n2. ⏰ Prueba de validación de horarios:');
const testSlots = [
  '2025-06-25T17:30:00-03:00', // Before earliest time
  '2025-06-25T18:00:00-03:00', // After earliest time  
  '2025-06-25T19:30:00-03:00', // Valid time
  '2025-06-28T19:30:00-03:00', // Saturday - might not be configured
  '2025-06-29T19:30:00-03:00', // Sunday - might not be configured
];

testSlots.forEach(slot => {
  const isValid = isValidSlot(slot);
  const date = new Date(slot);
  const day = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'][date.getDay()];
  console.log(`   ${slot} (${day}): ${isValid ? '✅' : '❌'}`);
});

console.log('\n3. 🕒 Prueba de horario de ejecución:');
console.log(`   Configuración: ${config.scheduling.runStartHour}:00 - ${config.scheduling.runEndHour}:00 ${config.scheduling.timezone}`);
console.log(`   ¿Estamos en horario?: ${isWithinRunningHours() ? '✅' : '❌'}`);

console.log('\n4. 📋 Configuración de días válidos:');
console.log(`   Días configurados: ${config.scheduling.daysToCheck.join(', ')}`);

const dayMap = {
  'SU': 'Domingo',
  'MO': 'Lunes', 
  'TU': 'Martes',
  'WE': 'Miércoles',
  'TH': 'Jueves',
  'FR': 'Viernes',
  'SA': 'Sábado'
};

config.scheduling.daysToCheck.forEach(day => {
  console.log(`   - ${day}: ${dayMap[day]}`);
});

console.log('\n5. ⚙️ Configuración de horarios mínimos:');
console.log(`   Horario más temprano: ${config.availability.earliestHour}:${config.availability.earliestMinute.toString().padStart(2, '0')}`);

console.log('\n✅ Test de utilidades completado!');

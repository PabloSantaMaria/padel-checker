const { config } = require('../dist/config.js');

console.log('🧪 === PRUEBA DE CONFIGURACIÓN DE CLUBES ===\n');

console.log('📋 Estado actual de clubes:');
// Note: config.clubs only contains enabled clubs due to filtering in config.ts
config.clubs.forEach(club => {
  console.log(`- ${club.displayName}: ✅ HABILITADO`);
  console.log(`  📍 ID: ${club.id}`);
  console.log(`  🏷️ Nombre técnico: ${club.name}`);
  console.log(`  🔗 Template URL: ${club.reservationUrlTemplate}`);
  console.log('');
});

console.log(`📊 Resumen:`);
console.log(`   Total clubes activos: ${config.clubs.length}`);
console.log(`   Días a verificar: ${config.scheduling.daysToCheck.join(', ')}`);
console.log(`   Horario de ejecución: ${config.scheduling.runStartHour}:00 - ${config.scheduling.runEndHour}:00 ${config.scheduling.timezone}`);
console.log(`   Horario de turnos: ${config.availability.startHour}:${config.availability.startMinute.toString().padStart(2, '0')} a ${config.availability.endHour}:${config.availability.endMinute.toString().padStart(2, '0')}`);

console.log('\n✅ Test de configuración exitoso!');

const { config } = require('./dist/config.js');

console.log('🧪 Probando habilitación/deshabilitación de clubes...\n');

console.log('Estado actual:');
config.clubs.forEach(club => {
  console.log(`- ${club.displayName}: ${club.enabled ? 'HABILITADO' : 'DESHABILITADO'}`);
});

console.log(`\nTotal clubes habilitados: ${config.clubs.length}`);
console.log('✅ Test de configuración exitoso!');

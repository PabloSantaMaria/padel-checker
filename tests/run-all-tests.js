#!/usr/bin/env node

/**
 * Test Runner - Runs all tests in the tests/ folder
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🧪 === EJECUTOR DE PRUEBAS DEL SISTEMA PADEL CHECKER ===\n');

// First, build the project
console.log('🔨 Compilando TypeScript...');
try {
  execSync('npm run build', { stdio: 'inherit', cwd: path.join(__dirname, '..') });
  console.log('✅ Compilación exitosa\n');
} catch (error) {
  console.error('❌ Error en la compilación:', error.message);
  process.exit(1);
}

// Test files to run in order
const testFiles = [
  'test-config.js',
  'test-utils.js', 
  'test-storage.js',
  'test-api.js',
  'test-complete-system.js'
];

console.log('📋 Ejecutando pruebas en orden:\n');

for (const testFile of testFiles) {
  const testPath = path.join(__dirname, testFile);
  
  if (!fs.existsSync(testPath)) {
    console.log(`⚠️  Archivo de prueba no encontrado: ${testFile}`);
    continue;
  }
  
  console.log(`\n${'='.repeat(60)}`);
  console.log(`🚀 Ejecutando: ${testFile}`);
  console.log(`${'='.repeat(60)}\n`);
  
  try {
    execSync(`node ${testPath}`, { stdio: 'inherit' });
    console.log(`\n✅ ${testFile} completado exitosamente`);
  } catch (error) {
    console.error(`\n❌ Error en ${testFile}:`, error.message);
    console.log('🔄 Continuando con las siguientes pruebas...\n');
  }
}

console.log(`\n${'='.repeat(60)}`);
console.log('🎉 TODAS LAS PRUEBAS COMPLETADAS');
console.log(`${'='.repeat(60)}\n`);

console.log('📝 Notas:');
console.log('• Si alguna prueba falló, revisa la configuración en app-config.json');
console.log('• Para pruebas de email, verifica las variables de entorno en .env');
console.log('• El test completo puede enviar un email de prueba si está configurado');
console.log('');

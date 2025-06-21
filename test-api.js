const axios = require('axios');
const { config } = require('./dist/config.js');

async function testAPI() {
  console.log('🧪 === PRUEBA DE APIs ===\n');
  
  const testDate = '2025-06-23'; // Lunes
  
  for (const club of config.clubs) {
    const url = `${config.baseUrl}/${club.id}?date=${testDate}`;
    console.log(`📡 Probando: ${club.displayName}`);
    console.log(`   URL: ${url}`);
    
    try {
      const response = await axios.get(url);
      const data = response.data;
      
      console.log(`   ✅ Status: ${response.status}`);
      console.log(`   📊 Canchas disponibles: ${data.available_courts?.length || 0}`);
      
      if (data.available_courts && data.available_courts.length > 0) {
        let totalSlots = 0;
        data.available_courts.forEach(court => {
          totalSlots += court.available_slots?.length || 0;
        });
        console.log(`   🎾 Total slots: ${totalSlots}`);
        
        // Mostrar algunos ejemplos
        const firstCourt = data.available_courts[0];
        if (firstCourt && firstCourt.available_slots && firstCourt.available_slots.length > 0) {
          console.log(`   🏟️ Ejemplo - ${firstCourt.name}:`);
          firstCourt.available_slots.slice(0, 3).forEach(slot => {
            console.log(`      ${slot.start} (${slot.duration}min)`);
          });
        }
      }
      
    } catch (error) {
      console.log(`   ❌ Error: ${error.response?.status || error.message}`);
      if (error.response?.data) {
        console.log(`   📄 Respuesta: ${JSON.stringify(error.response.data)}`);
      }
    }
    
    console.log(''); // Línea en blanco
  }
}

testAPI().catch(console.error);

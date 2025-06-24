const axios = require('axios');
const { config } = require('../dist/config.js');

async function testAPI() {
  console.log('🧪 === PRUEBA DE APIs ===\n');
  
  const testDate = '2025-06-25'; // Test date
  
  for (const club of config.clubs) {
    const url = `${config.api.baseUrl}/${club.id}?date=${testDate}`;
    console.log(`📡 Probando: ${club.displayName}`);
    console.log(`   URL: ${url}`);
    
    try {
      const response = await axios.get(url);
      const data = response.data;
      
      console.log(`   ✅ Status: ${response.status}`);
      console.log(`   📊 Canchas disponibles: ${data.available_courts?.length || 0}`);
      
      if (data.available_courts && data.available_courts.length > 0) {
        // Filter only padel courts using current system logic
        const padelCourts = data.available_courts.filter((court) => 
          court.sport_ids && court.sport_ids.includes(config.api.sports.padel)
        );
        
        console.log(`   🎾 Canchas de pádel: ${padelCourts.length}`);
        
        let totalSlots = 0;
        padelCourts.forEach(court => {
          totalSlots += court.available_slots?.length || 0;
        });
        console.log(`   🎾 Total slots de pádel: ${totalSlots}`);
        
        // Show some examples
        if (padelCourts.length > 0) {
          const firstCourt = padelCourts[0];
          if (firstCourt && firstCourt.available_slots && firstCourt.available_slots.length > 0) {
            console.log(`   🏟️ Ejemplo - ${firstCourt.name}:`);
            console.log(`   🏷️ Sport IDs: ${firstCourt.sport_ids.join(', ')}`);
            firstCourt.available_slots.slice(0, 3).forEach(slot => {
              console.log(`      ${slot.start} (${slot.duration}min)`);
            });
          }
        }
      }
      
    } catch (error) {
      console.log(`   ❌ Error: ${error.response?.status || error.message}`);
      if (error.response?.data) {
        console.log(`   📄 Respuesta: ${JSON.stringify(error.response.data)}`);
      }
    }
    
    console.log(''); // Blank line
  }
  
  console.log('🔧 Configuración actual:');
  console.log(`   Base URL: ${config.api.baseUrl}`);
  console.log(`   Sport ID Pádel: ${config.api.sports.padel}`);
  console.log(`   Timezone: ${config.scheduling.timezone}`);
  console.log(`   TTL Notificaciones: ${config.notifications.ttlHours}h`);
}

testAPI().catch(console.error);

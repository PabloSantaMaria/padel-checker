import fs from 'fs';
import path from 'path';

interface NotifiedSlot {
  id: string; // Identificador único del turno
  court: string;
  time: string;
  notifiedAt: number; // Timestamp cuando se notificó
}

interface StorageData {
  notifiedSlots: NotifiedSlot[];
  lastCleanup: number;
}

const STORAGE_FILE = path.join(process.cwd(), 'notified-slots.json');
const TTL_HOURS = parseInt(process.env.NOTIFICATION_TTL_HOURS || '24'); // TTL configurable, 24h por defecto

export class SlotStorage {
  private data: StorageData;

  constructor() {
    this.data = this.loadData();
    this.cleanup();
  }

  private loadData(): StorageData {
    try {
      if (fs.existsSync(STORAGE_FILE)) {
        const content = fs.readFileSync(STORAGE_FILE, 'utf8');
        return JSON.parse(content);
      }
    } catch (error) {
      console.log('No se pudo cargar el archivo de historial, creando uno nuevo');
    }
    
    return {
      notifiedSlots: [],
      lastCleanup: Date.now()
    };
  }

  private saveData(): void {
    try {
      fs.writeFileSync(STORAGE_FILE, JSON.stringify(this.data, null, 2));
    } catch (error) {
      console.error('Error al guardar el archivo de historial:', error);
    }
  }

  private cleanup(): void {
    const now = Date.now();
    const ttlMs = TTL_HOURS * 60 * 60 * 1000;
    
    // Limpiar turnos expirados
    const before = this.data.notifiedSlots.length;
    this.data.notifiedSlots = this.data.notifiedSlots.filter(
      slot => (now - slot.notifiedAt) < ttlMs
    );
    const after = this.data.notifiedSlots.length;
    
    if (before !== after) {
      console.log(`Limpieza: eliminados ${before - after} turnos expirados del historial`);
    }
    
    this.data.lastCleanup = now;
    this.saveData();
  }

  private generateSlotId(clubId: number, court: string, time: string): string {
    // Crear un ID único basado en club, cancha y tiempo
    const date = new Date(time);
    return `${clubId}_${court}_${date.getTime()}`;
  }

  public hasBeenNotified(clubId: number, court: string, time: string): boolean {
    const id = this.generateSlotId(clubId, court, time);
    return this.data.notifiedSlots.some(slot => slot.id === id);
  }

  public markAsNotified(clubId: number, court: string, time: string): void {
    const id = this.generateSlotId(clubId, court, time);
    
    // Evitar duplicados
    if (!this.hasBeenNotified(clubId, court, time)) {
      this.data.notifiedSlots.push({
        id,
        court,
        time,
        notifiedAt: Date.now()
      });
      
      console.log(`Turno marcado como notificado: Club ${clubId} - ${court} - ${time}`);
      this.saveData();
    }
  }

  public getStats(): { total: number, oldestHours: number | null } {
    const now = Date.now();
    const oldest = this.data.notifiedSlots.reduce((min, slot) => 
      Math.min(min, slot.notifiedAt), now
    );
    
    return {
      total: this.data.notifiedSlots.length,
      oldestHours: this.data.notifiedSlots.length > 0 ? 
        Math.round((now - oldest) / (1000 * 60 * 60)) : null
    };
  }
}

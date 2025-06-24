// Core domain types
export interface Club {
  id: number;
  name: string;
  displayName: string;
  enabled: boolean;
  reservationUrlTemplate: string; // Template con {date} que se reemplazará
}

export interface Slot {
  club: Club;
  court: string;
  time: string;
}

// Configuration types
export interface AppConfig {
  scheduling: {
    checkIntervalMinutes: number;
    daysToCheck: string[];
    runStartHour: number;
    runEndHour: number;
    timezone?: string;
  };
  availability: {
    earliestHour: number;
    earliestMinute: number;
  };
  notifications: {
    ttlHours: number;
  };
  api: {
    baseUrl: string;
    sports: {
      padel: string;
    };
  };
  clubs: Club[];
}

// Storage types
export interface NotifiedSlot {
  id: string; // Identificador único del turno
  court: string;
  time: string;
  notifiedAt: number; // Timestamp cuando se notificó
}

export interface StorageData {
  notifiedSlots: NotifiedSlot[];
  lastCleanup: number;
}

// API Response types
export interface Court {
  name: string;
  sport_ids: string[];
  available_slots: TimeSlot[];
}

export interface TimeSlot {
  start: string;
}

export interface ApiResponse {
  available_courts: Court[];
}

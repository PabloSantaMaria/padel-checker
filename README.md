# 🎾 Padel Checker

Un script automatizado que verifica la disponibilidad de canchas de pádel en Head Tandil y Pico Deportes y envía notificaciones por correo electrónico cuando encuentra turnos disponibles en los horarios configurados.

## ¿Qué hace?

Este proyecto monitorea automáticamente la disponibilidad de canchas de pádel en el club Head Tandil usando su API pública. Cuando encuentra turnos disponibles en los horarios que te interesan, te envía un correo electrónico con todos los detalles.

## Características

- ✅ Verificación automática cada 30 minutos (configurable)
- ✅ Filtrado por días de la semana (lunes a viernes por defecto)
- ✅ Filtrado por horarios (desde las 18:30 por defecto)
- ✅ Notificaciones por email con formato amigable
- ✅ Links directos de reserva para cada turno encontrado
- ✅ Soporte para múltiples destinatarios
- ✅ Ejecución local y en GitHub Actions

## Configuración

### 1. Configuración principal (app-config.json)

El proyecto utiliza un archivo `app-config.json` para centralizar toda la configuración no sensible:

```json
{
  "scheduling": {
    "checkIntervalMinutes": 30,
    "daysToCheck": ["MO", "TU", "WE", "TH", "FR"],
    "runStartHour": 7,
    "runEndHour": 23,
    "timezone": "America/Argentina/Buenos_Aires"
  },
  "availability": {
    "earliestHour": 18,
    "earliestMinute": 30
  },
  "notifications": {
    "ttlHours": 24
  },
  "api": {
    "baseUrl": "https://alquilatucancha.com/api/v3/availability/sportclubs",
    "sports": {
      "padel": "7"
    }
  },
  "clubs": [
    {
      "id": 1294,
      "name": "head-club-tandil-tandil",
      "displayName": "Head Tandil",
      "enabled": true,
      "reservationUrlTemplate": "https://atcsports.io/venues/head-club-tandil-tandil?dia={date}"
    }
  ]
}
```

### 2. Variables de entorno (.env)

Solo para información sensible como credenciales de email:

```env
# Configuración de email (sensible)
EMAIL_SENDER=tu-email@gmail.com
EMAIL_PASSWORD=tu-contraseña-de-aplicacion
EMAIL_RECIPIENTS=destinatario1@gmail.com,destinatario2@gmail.com
```

### 3. Parámetros configurables

#### Configuración en app-config.json

**Sección `scheduling`:**

- **`checkIntervalMinutes`**: Intervalo en minutos entre verificaciones (por defecto: 30)
- **`daysToCheck`**: Array de días de la semana a verificar usando códigos de 2 letras:
  - `MO` = Lunes, `TU` = Martes, `WE` = Miércoles, `TH` = Jueves, `FR` = Viernes, `SA` = Sábado, `SU` = Domingo
  - Ejemplo: `["MO","TU","WE","TH","FR"]` para días laborables
- **`runStartHour`**: Hora de inicio para ejecutar el checker (formato 24h, por defecto: 7)
- **`runEndHour`**: Hora de fin para ejecutar el checker (formato 24h, por defecto: 23)
- **`timezone`**: Zona horaria para los horarios de ejecución (por defecto: "America/Argentina/Buenos_Aires")

**Sección `availability`:**

- **`earliestHour`**: Hora mínima para buscar turnos (formato 24h, por defecto: 18)
- **`earliestMinute`**: Minuto mínimo para buscar turnos (por defecto: 30)

**Sección `notifications`:**

- **`ttlHours`**: Tiempo en horas para recordar turnos ya notificados (por defecto: 24)

**Sección `clubs`:**

- Array de clubes con sus configuraciones individuales (ID, nombre, URL de reserva, etc.)
- Cada club debe tener las propiedades: `id`, `name`, `displayName`, `enabled`, `reservationUrlTemplate`
- Solo los clubes con `enabled: true` serán monitoreados
- El sistema puede monitorear múltiples clubes simultáneamente

**Para agregar/modificar clubes**:

1. Edita la sección `clubs` en `app-config.json`
2. Puedes deshabilitar temporalmente un club cambiando `enabled: false`
3. Para agregar un nuevo club, agrega un objeto JSON con las propiedades requeridas

**Nota importante**: El script solo se ejecutará entre `runStartHour` y `runEndHour` según la zona horaria configurada (`timezone`). Esto previene ejecuciones innecesarias durante la noche cuando es poco probable encontrar nuevos turnos.

**Zona horaria**: Los horarios siempre se interpretan en la zona horaria especificada en `timezone`, independientemente de dónde se ejecute el código (local, GitHub Actions, etc.). Para Argentina usa `"America/Argentina/Buenos_Aires"`, para otras zonas consulta la [lista de zonas horarias IANA](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones).

**Funcionalidad**: El sistema mantiene un historial de turnos ya notificados para evitar enviar emails duplicados sobre el mismo turno. Cada turno se identifica únicamente por club + cancha + fecha/hora. Después del TTL configurado, el turno se olvida y podrá ser notificado nuevamente si sigue disponible.

#### Variables de entorno (.env)

Las siguientes variables deben configurarse en el archivo `.env` para información sensible:

- **`EMAIL_SENDER`**: Tu dirección de Gmail desde la cual se enviarán las notificaciones
- **`EMAIL_PASSWORD`**: Contraseña de aplicación de Gmail (ver sección de seguridad)
- **`EMAIL_RECIPIENTS`**: Lista de emails separados por comas que recibirán las notificaciones

### 3. Configuración de Gmail

Para usar Gmail como servicio de envío, necesitas:

1. Tener activada la **verificación en 2 pasos** en tu cuenta de Google
2. Generar una **contraseña de aplicación**:
   - Ve a [myaccount.google.com/security](https://myaccount.google.com/security)
   - Busca "Contraseñas de aplicaciones"
   - Genera una nueva para "Correo"
   - Usa esa contraseña de 16 caracteres en `EMAIL_PASSWORD`

## Instalación y uso

### Pruebas del sistema

El proyecto incluye un conjunto completo de pruebas ubicadas en la carpeta `tests/`:

```bash
# Ejecutar todas las pruebas
npm test

# Ejecutar pruebas individuales
npm run test:config    # Configuración del sistema
npm run test:api       # Conectividad con APIs
npm run test:utils     # Funciones utilitarias
npm run test:storage   # Sistema de almacenamiento
npm run test:system    # Prueba completa del sistema (puede enviar email)
```

Las pruebas verifican:

- ✅ Carga correcta de configuración desde `app-config.json`
- ✅ Conectividad con las APIs de los clubes
- ✅ Filtrado correcto de canchas de pádel
- ✅ Validación de horarios y días
- ✅ Sistema de notificaciones anti-duplicados
- ✅ Formateo de mensajes y URLs de reserva
- ✅ Integración completa del sistema

**Nota**: La prueba completa del sistema (`test:system`) puede enviar un email real si tienes configuradas las variables de entorno de email.

### Ejecución local

```bash
# Instalar dependencias
npm install

# Compilar TypeScript
npm run build

# Ejecutar el script
npm start
```

### Ejecución con GitHub Actions

1. Haz fork de este repositorio
2. Configura los siguientes **secrets** en tu repositorio:
   - `EMAIL_SENDER`: Tu email de Gmail
   - `EMAIL_PASSWORD`: Tu contraseña de aplicación
   - `EMAIL_RECIPIENTS`: Lista de destinatarios separados por comas

3. El workflow se ejecutará automáticamente cada 30 minutos

**Configuración de horarios en GitHub Actions**: El sistema maneja automáticamente las diferencias de zona horaria usando la configuración `timezone` en `app-config.json`. Los horarios (`runStartHour` y `runEndHour`) se interpretan siempre en la zona horaria configurada, sin importar dónde se ejecute el código:

- **Ejecución local**: Convierte la hora del sistema a la zona horaria configurada
- **GitHub Actions**: Convierte la hora UTC del servidor a la zona horaria configurada
- **Resultado**: Mismo comportamiento en ambos entornos (ej: 7 AM - 11 PM Argentina)

Esto significa que no necesitas configuraciones diferentes para local vs GitHub Actions.

**Manejo de historial en GitHub Actions**: El sistema usa GitHub Cache para persistir el historial de turnos notificados entre ejecuciones. Esto asegura que no recibas emails duplicados sobre el mismo turno disponible.

#### Flujo completo de una ejecución en GitHub Actions

```text
1. ⏰ Cron ejecuta el workflow (cada 30 min)
   ↓
2. 📁 Checkout del código
   ↓  
3. 🔧 Setup Node.js
   ↓
4. 📥 RESTORE: "¿Hay historial guardado?"
   ├── ✅ SÍ → Descarga notified-slots.json
   └── ❌ NO → Continúa sin archivo (primera vez)
   ↓
5. 📦 Install dependencies
   ↓
6. 🔨 Compile TypeScript  
   ↓
7. ▶️ Run script → El script:
   │   ├── Lee notified-slots.json (si existe)
   │   ├── Filtra turnos ya notificados  
   │   ├── Envía emails solo de turnos nuevos
   │   └── Actualiza notified-slots.json
   ↓
8. 💾 SAVE: Guarda notified-slots.json actualizado
```

Este flujo se repite automáticamente cada 30 minutos, manteniendo la "memoria" de turnos ya notificados entre ejecuciones gracias al sistema de cache de GitHub Actions.

#### Ejemplo práctico del sistema anti-duplicados

**Ejecución 1 (12:00 PM)**

- No hay cache previo
- Encuentra turno: "Cancha 1, hoy 21:00"
- ✉️ Envía email
- 💾 Guarda en cache: `{"Cancha 1_21:00": "notificado"}`

**Ejecución 2 (12:30 PM)**

- 📥 Restaura cache de ejecución anterior
- Encuentra el mismo turno: "Cancha 1, hoy 21:00"
- ✅ Verifica cache: "Ya fue notificado"
- ❌ NO envía email
- Cache permanece igual

**Ejecución 3 (13:00 PM)**

- 📥 Restaura cache
- El turno desapareció (alguien lo reservó) ✅
- Encuentra turno nuevo: "Cancha 2, hoy 22:00"
- ✉️ Envía email del nuevo turno
- 💾 Actualiza cache: `{"Cancha 1_21:00": "notificado", "Cancha 2_22:00": "notificado"}`

Para ejecutar manualmente desde GitHub:

- Ve a la pestaña "Actions"
- Selecciona "Check Court Availability"
- Haz clic en "Run workflow"

## Personalización avanzada

### Ajustar formato de notificaciones

El formato de las notificaciones se puede modificar en `src/index.ts` en la función que genera los mensajes.

## Formato de notificaciones

Cuando encuentra turnos disponibles, recibirás un email con el siguiente formato:

```text
🎾 ¡Hay turnos disponibles!

📅 Lunes, 16 de Junio, 18:30 - 🏟️ Cancha 3
🔗 Reservar: https://atcsports.io/venues/head-club-tandil-tandil?dia=2025-06-16&sportIds=7

📅 Jueves, 19 de Junio, 19:00 - 🏟️ Cancha 1
🔗 Reservar: https://atcsports.io/venues/head-club-tandil-tandil?dia=2025-06-19&sportIds=7
```

Cada turno incluye:

- 📅 **Fecha y hora**: En formato argentino (24 horas)
- 🏟️ **Cancha**: Nombre de la cancha disponible
- 🔗 **Link directo**: Para ir directamente a reservar en la web, **con filtro automático de Pádel** (`sportIds=7`)

## Estructura del proyecto

```text
├── app-config.json     # Configuración principal de la aplicación
├── .env               # Variables de entorno para información sensible
├── .env.example       # Ejemplo de variables de entorno
├── src/               # Código fuente TypeScript
│   ├── config.ts       # Carga y procesamiento de configuración
│   ├── index.ts       # Lógica principal del checker
│   ├── mailer.ts      # Configuración y envío de emails
│   ├── storage.ts     # Sistema de almacenamiento para evitar duplicados
│   ├── types.ts       # Modelos
│   └── utils.ts       # Utilidades para formateo y validación
└── tests/             # Suite de pruebas del sistema
    ├── test-config.js          # Prueba de configuración
    ├── test-api.js             # Prueba de conectividad API
    ├── test-utils.js           # Prueba de utilidades
    ├── test-storage.js         # Prueba del sistema de storage
    ├── test-complete-system.js # Prueba de integración completa
    ├── run-all-tests.js        # Ejecutor de todas las pruebas
    └── README.md               # Documentación de pruebas
```

## Consideraciones

- El script verifica disponibilidad para los próximos 6 días
- Solo envía emails cuando encuentra turnos disponibles
- Las verificaciones se detienen automáticamente en GitHub Actions (el cron job maneja la repetición)
- Para uso local, el script corre continuamente con el intervalo configurado

## Troubleshooting

### Error de autenticación de Gmail

- Verifica que tengas la verificación en 2 pasos activada
- Asegúrate de usar una contraseña de aplicación, no tu contraseña normal
- Revisa que el email sender sea correcto

### No recibo notificaciones

- Verifica que haya turnos disponibles en los horarios configurados
- Revisa los logs en la consola para ver si hay errores
- Confirma que los destinatarios estén bien escritos

### El script no encuentra turnos

- Ajusta los parámetros `earliestHour` y `earliestMinute` en `app-config.json`
- Verifica que los días configurados en `daysToCheck` sean correctos
- El club puede no tener disponibilidad en los horarios buscados

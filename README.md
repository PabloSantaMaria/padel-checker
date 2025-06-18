# 🎾 Padel Checker

Un script automatizado que verifica la disponibilidad de canchas de pádel en Head Tandil y envía notificaciones por correo electrónico cuando encuentra turnos disponibles en los horarios configurados.

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

### 1. Variables de entorno

Crea un archivo `.env` en la raíz del proyecto con la siguiente configuración:

```env
# Configuración del checker
CHECK_INTERVAL_MINUTES=30
DAYS_TO_CHECK=MO,TU,WE,TH,FR
EARLIEST_HOUR=18
EARLIEST_MINUTE=30

# Configuración de horarios de ejecución
RUN_START_HOUR=7   # Hora de inicio (7 AM)
RUN_END_HOUR=23    # Hora de fin (11 PM)

# Configuración de email
EMAIL_SENDER=tu-email@gmail.com
EMAIL_PASSWORD=tu-contraseña-de-aplicacion
EMAIL_RECIPIENTS=destinatario1@gmail.com,destinatario2@gmail.com
```

### 2. Parámetros configurables

#### Horarios y días

- **`CHECK_INTERVAL_MINUTES`**: Intervalo en minutos entre verificaciones (por defecto: 30)
- **`DAYS_TO_CHECK`**: Días de la semana a verificar usando códigos de 2 letras:
  - `MO` = Lunes, `TU` = Martes, `WE` = Miércoles, `TH` = Jueves, `FR` = Viernes, `SA` = Sábado, `SU` = Domingo
  - Ejemplo: `MO,TU,WE,TH,FR` para días laborables
- **`EARLIEST_HOUR`**: Hora mínima para buscar turnos (formato 24h, por defecto: 18)
- **`EARLIEST_MINUTE`**: Minuto mínimo para buscar turnos (por defecto: 30)

#### Control de horarios de ejecución

- **`RUN_START_HOUR`**: Hora de inicio para ejecutar el checker (formato 24h, por defecto: 7)
- **`RUN_END_HOUR`**: Hora de fin para ejecutar el checker (formato 24h, por defecto: 23)

**Nota importante**: El script solo se ejecutará entre `RUN_START_HOUR` y `RUN_END_HOUR`. Esto previene ejecuciones innecesarias durante la noche cuando es poco probable encontrar nuevos turnos.

#### Control de notificaciones duplicadas

- **`NOTIFICATION_TTL_HOURS`**: Tiempo en horas para recordar turnos ya notificados (por defecto: 24)

**Funcionalidad**: El sistema mantiene un historial de turnos ya notificados para evitar enviar emails duplicados sobre el mismo turno. Cada turno se identifica únicamente por cancha + fecha/hora. Después del TTL configurado, el turno se olvida y podrá ser notificado nuevamente si sigue disponible.

#### Email

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

**Configuración de horarios en GitHub Actions**: El workflow está configurado para respetar los horarios de ejecución. Por defecto, en Argentina (UTC-3), se ejecuta de 7 AM a 11 PM hora local. GitHub Actions corre en UTC, por lo que los horarios están ajustados automáticamente.

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

### Cambiar el club

Actualmente está configurado para Head Tandil. Para cambiar el club, modifica el archivo `src/config.ts`:

```typescript
export const config = {
  // ...
  clubId: 1294, // ID del club (cambiar por el que necesites)
  baseUrl: 'https://alquilatucancha.com/api/v3/availability/sportclubs',
};
```

### Ajustar formato de notificaciones

El formato de las notificaciones se puede modificar en `src/index.ts` en la función que genera los mensajes.

## Formato de notificaciones

Cuando encuentra turnos disponibles, recibirás un email con el siguiente formato:

```text
🎾 ¡Hay turnos disponibles!

📅 Lunes, 16 de Junio, 18:30 - 🏟️ Cancha 3
🔗 Reservar: https://atcsports.io/venues/head-club-tandil-tandil?dia=2025-06-16

📅 Jueves, 19 de Junio, 19:00 - 🏟️ Cancha 1
🔗 Reservar: https://atcsports.io/venues/head-club-tandil-tandil?dia=2025-06-19
```

Cada turno incluye:

- 📅 **Fecha y hora**: En formato argentino (24 horas)
- 🏟️ **Cancha**: Nombre de la cancha disponible
- 🔗 **Link directo**: Para ir directamente a reservar en la web

## Estructura del proyecto

```text
src/
├── config.ts      # Configuración y variables de entorno
├── index.ts       # Lógica principal del checker
├── mailer.ts      # Configuración y envío de emails
└── utils.ts       # Utilidades para formateo y validación
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

- Ajusta los parámetros `EARLIEST_HOUR` y `EARLIEST_MINUTE`
- Verifica que los días configurados en `DAYS_TO_CHECK` sean correctos
- El club puede no tener disponibilidad en los horarios buscados

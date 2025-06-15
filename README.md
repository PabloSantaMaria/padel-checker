# 🎾 Padel Checker

Un script automatizado que verifica la disponibilidad de canchas de pádel en Head Tandil y envía notificaciones por correo electrónico cuando encuentra turnos disponibles en los horarios configurados.

## ¿Qué hace?

Este proyecto monitorea automáticamente la disponibilidad de canchas de pádel en el club Head Tandil usando su API pública. Cuando encuentra turnos disponibles en los horarios que te interesan, te envía un correo electrónico con todos los detalles.

## Características

- ✅ Verificación automática cada 30 minutos (configurable)
- ✅ Filtrado por días de la semana (lunes a viernes por defecto)
- ✅ Filtrado por horarios (desde las 18:30 por defecto)
- ✅ Notificaciones por email con formato amigable
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

# NaviBook Day-Charter - Guía de Inicio Rápido

**¡Comienza en 15 minutos!**

---

## ¿Qué es NaviBook?

Un sistema completo para gestionar reservas de alquileres de barcos, tripulación, pagos y clientes.

---

## Paso 1: Inicia Sesión (2 minutos)

1. Ve a: `https://navibook.com`
2. Haz clic en **"Login"** (esquina superior derecha)
3. Ingresa tu correo electrónico y contraseña
4. ¡Estás dentro! 🎉

**Cuenta de Demostración (para pruebas):**
- Correo: `admin@navibook.com`
- Contraseña: `Admin123!`

---

## Paso 2: Comprende Tu Rol (1 minuto)

**¿Qué puedes hacer?**

| Tu Rol | Tareas Principales |
|-----------|-----------|
| **Admin** | Todo: reservas, precios, personal, pagos, configuración |
| **Gestor de Operaciones** | Reservas, personal, pagos, reportes (sin configuración) |
| **Agente de Ventas** | Crear tus propias reservas, ver clientes |
| **Capitán/Marinero** | Ver tus tours asignados y ganancias |
| **Personal de Oficina** | Crear reservas, registrar pagos, gestionar clientes |

✅ Puedes hacer **todo en esta guía** según los permisos de tu rol.

---

## Paso 3: Crea Tu Primera Reserva (5 minutos)

¡Esta es la característica central - pongamos una reserva en el sistema!

### Reserva Rápida (Método Más Fácil)

1. Haz clic en **"Quick Book"** en la navegación superior
2. **Selecciona un Barco**
   - Elige barco del menú desplegable
3. **Elige Fecha y Hora**
   - Selecciona fecha (solo fechas futuras)
   - Selecciona hora (ej: 10:00 AM)
   - Selecciona duración (2h, 4h, 6h, 8h)
4. **Ingresa Nombre del Cliente**
   - Nombre
   - Apellido
   - Correo electrónico
   - Teléfono (opcional)
5. **Selecciona Paquete**
   - Solo charter
   - Con bebidas (€X por persona)
   - Con comida (€Y por persona)
   - Premium (bebidas + comida)
6. **Establece Cantidad de Pasajeros**
   - Número de personas
7. **Asigna Capitán** (opcional)
   - Selecciona capitán del menú desplegable
8. **Revisa Precio**
   - El total muestra todos los costos
9. **Confirma**
   - ¡Reserva creada!
   - Se inicia retención de 15 minutos
   - Correo enviado al cliente

**✅ ¡Reserva creada! Siguiente: Obtener pago**

---

## Paso 4: Obtén Pago (3 minutos)

Tu cliente necesita pagar. Dos opciones:

### Opción A: Enviar Enlace de Pago (Más Rápido)

1. Ve a la página **Bookings**
2. Encuentra tu reserva
3. Haz clic para abrir el detalle
4. Haz clic en **"Send Payment Link"** (Enviar enlace de pago)
5. Correo enviado al cliente con enlace de Stripe
6. Cliente hace clic en enlace → ingresa tarjeta → paga
7. Recibirás notificación instantánea cuando pague ✓

### Opción B: Registra Pago Manual

1. Cliente te paga (efectivo, transferencia, etc.)
2. Ve a la página de detalle de **Bookings**
3. Haz clic en **"Record Payment"** (Registrar pago)
4. Ingresa:
   - Método de pago (Efectivo, Tarjeta, Transferencia, etc.)
   - Monto pagado
   - Referencia de transacción (opcional)
5. Guarda
6. Reserva marcada como pagada ✓

**Reembolso si se Cancela:**
- ¿Cliente cancela? Sistema calcula automáticamente reembolso según política
- Haz clic en "Cancel Booking", sistema muestra monto del reembolso
- Confirma cancelación
- Reembolso procesado automáticamente

---

## Paso 5: Gestiona Tu Flota (3 minutos)

### Agregar un Barco

1. Haz clic en **"Fleet"** en la navegación
2. Haz clic en **"+ Add New Boat"** (Agregar nuevo barco)
3. Ingresa:
   - Nombre del barco (requerido)
   - Tipo: Velero, Lancha motora, o Jet Ski
   - Capacidad: Máximo de pasajeros
   - Opcional: Descripción, foto
4. Haz clic en **"Create Boat"** (Crear barco)

✅ ¡Barco agregado! Ahora los clientes pueden reservarlo.

### Agregar Precios para el Barco

1. Haz clic en **"Pricing"** en la navegación
2. Selecciona tu barco
3. Para cada duración (2h, 4h, 6h, 8h, día completo):
   - Ingresa precio (ej: €200 para 2h)
4. Guarda precios

✅ ¡Precios configurados! Las reservas usarán estos precios automáticamente.

---

## Paso 6: Gestiona Tu Equipo (2 minutos)

### Agregar un Capitán/Marinero

1. Haz clic en **"Agents"** en la navegación
2. Haz clic en **"+ Add New Agent"** (Agregar nuevo agente)
3. Ingresa:
   - Nombre
   - Apellido
   - Correo electrónico (único)
   - Teléfono (opcional)
4. Selecciona rol:
   - **Captain**: Comanda el barco, gana tarifa por hora
   - **Sailor**: Miembro de tripulación, gana tarifa por hora
   - **Sales Agent**: Crea reservas, gana comisión
   - **Office Staff**: Apoyo administrativo
5. Establece compensación:
   - **Tarifa por hora**: Para capitanes/marineros (€/hora)
   - **Comisión**: Para agentes (% del precio de reserva)
6. Haz clic en **"Create Agent"** (Crear agente)
7. Correo enviado a la nueva persona con enlace de configuración

✅ ¡Miembro del equipo agregado! Pueden iniciar sesión ahora.

### Asigna Capitán a una Reserva

1. Al crear reserva: Selecciona capitán del menú desplegable durante la creación
2. Al editar reserva: Haz clic en "Edit" → Selecciona capitán → Guarda

✅ ¡Capitán asignado! Lo verá en "My Bookings" en móvil.

---

## Paso 7: Rastrea Pagos (1 minuto)

### Ve Lo Que se Debe

1. Haz clic en **"Payments"** en la navegación
2. Ve lista de pagos pendientes
3. Muestra:
   - Nombre del cliente
   - Monto de reserva
   - Método de pago
   - Estado (Pendiente, Pagado, Vencido)

**Para registrar pago:**
- Haz clic en "Record Payment"
- Ingresa método y monto
- Guarda
- Reserva marcada como pagada

---

## Paso 8: Ve Tu Dashboard (1 minuto)

Haz clic en **"Dashboard"** para ver:
- Contador de barcos activos
- Tours de hoy
- Ingresos este mes
- Pagos pendientes
- Ingresos por agente (gráfico de barras)
- Tours próximos (próximos 7 días)

Vista rápida de lo que está pasando en tu negocio.

---

## Paso 9: Comparte con Cliente (1 minuto)

¿Quieres que el cliente vea su reserva?

1. Abre página de detalle de reserva
2. Haz clic en **"Share with Customer"** (Compartir con cliente)
3. Copia enlace seguro único
4. Envía por correo, WhatsApp, SMS, etc.

El cliente puede:
- Ver detalles de la reserva
- Solicitar cambio de fecha/hora
- Realizar pago
- Ver pronóstico del tiempo

---

## Paso 10: Maneja Cancelación (1 minuto)

¿Cliente quiere cancelar?

1. Abre detalle de reserva
2. Haz clic en **"Cancel Booking"** (Cancelar reserva)
3. Sistema muestra monto del reembolso (según política)
4. Confirma cancelación
5. Reembolso procesado automáticamente
6. Cliente notificado

¡Hecho! ✓

---

## Referencia de Páginas Esenciales

| Página | Qué Hace | Cuándo la Usas |
|------|-------------|-----------------|
| **Dashboard** | Resumen del negocio | Cada mañana |
| **Bookings** | Lista todos los tours | Encontrar/editar reservas |
| **Quick Book** | Crear nueva reserva | Cuando llega una reserva |
| **Payments** | Gestión de pagos | Obtener pago |
| **Fleet** | Gestionar barcos | Agregar/editar barcos |
| **Agents** | Gestionar personal | Contratar/gestionar equipo |
| **Pricing** | Establecer tarifas | Configurar precios |
| **Calendar** | Línea de tiempo visual | Ver vista de semana/mes |
| **Reports** | Analytics | Revisar desempeño |
| **Customers** | Base de datos de clientes | Buscar info de cliente |
| **Settings** | Configuración del sistema | Información de empresa, políticas |

---

## Aplicación Móvil (2 minutos)

### Instala en Teléfono

**iPhone:**
1. Abre Safari
2. Ve a `navibook.com`
3. Toca Compartir → Agregar a Pantalla de Inicio
4. Toca Agregar

**Android:**
1. Abre Chrome
2. Ve a `navibook.com`
3. Toca Menú (⋮) → Instalar App
4. Toca Instalar

### Usa en Teléfono

**Si eres Capitán/Marinero:**
- Toca "My Bookings"
- Ve tus tours asignados
- Ve tu tarifa para cada tour
- Toca tour para ver todos los detalles

**Si eres Agente/Admin:**
- Todas las características de escritorio funcionan en móvil
- Optimizado para pantallas pequeñas
- Navegación inferior para páginas clave

---

## Flujos de Trabajo Comunes

### Flujo 1: Nueva Reserva (5 min)
```
Quick Book → Selecciona barco → Elige fecha/hora → Ingresa cliente → Asigna capitán → Confirma
```

### Flujo 2: Obtener Pago (3 min)
```
Ve a Reserva → Envía Enlace de Pago (o registra pago)
```

### Flujo 3: Manejar Cancelación (2 min)
```
Abre Reserva → Haz clic Cancelar → Confirma → Reembolso procesado
```

### Flujo 4: Nuevo Miembro del Equipo (3 min)
```
Agents → Agregar Nuevo Agente → Ingresa info → Selecciona rol → Crear
```

### Flujo 5: Ver Reportes (2 min)
```
Reports → Selecciona rango de fechas → Ve ingresos/agentes/barcos → Exporta si es necesario
```

---

## Consejos Pro ⭐

1. **Usa Quick Book para Rapidez**
   - Forma más rápida de crear reservas
   - Mejor para tours simples
   - Advanced Book para tripulaciones complejas

2. **Copia Precios en Lote**
   - Establece precio en un barco
   - Copia a todos los barcos a la vez
   - Ahorra tiempo en actualizaciones de precios

3. **Retención de 15 Minutos**
   - Reservas se reservan automáticamente por 15 minutos
   - Previene doble reserva
   - La retención expira automáticamente
   - Cliente tiene 15 min para pagar

4. **Comparte Enlace del Portal**
   - Cliente puede pagarse a sí mismo
   - Sin procesamiento de pago por ti
   - Cliente puede solicitar cambios
   - Acceso seguro basado en token

5. **Archiva en Lugar de Eliminar**
   - Nunca elimines realmente personal/clientes
   - El archivado mantiene datos históricos
   - Puede reactivarse más tarde
   - Mejor para cumplimiento

6. **Rastreo de Comisiones**
   - Establece comisión % por agente
   - Se calcula automáticamente por reserva
   - Ve en Reports
   - Rastrea comisión adeudada

7. **Vista de Calendario**
   - Ve todos los barcos en un calendario
   - Codificado por colores según estado
   - Arrastra para reprogramar
   - Vista de mes o semana

8. **Asignaciones de Tripulación**
   - Múltiples marineros por reserva
   - Un capitán por reserva
   - No se puede doble reserva de tripulación
   - Tripulación ve en "My Bookings"

---

## Atajos de Teclado

| Atajo | Acción |
|----------|--------|
| `Ctrl/Cmd + B` | Ir a Reservas |
| `Ctrl/Cmd + Q` | Quick Book |
| `Esc` | Cerrar diálogos |
| `Enter` | Enviar formularios |

---

## Correcciones Rápidas de Solución de Problemas

**¿No puedes iniciar sesión?**
- Haz clic en "Forgot Password" en la página de inicio de sesión
- Restablece contraseña por correo

**¿Barco mostrando no disponible?**
- Verifica slots bloqueados (mantenimiento)
- Verifica que el capitán no esté ya reservado
- Intenta diferente hora

**¿Retención expirada?**
- La retención de 15 min expira automáticamente
- Crea nueva reserva nuevamente
- Asegúrate de pagar antes de que expire la retención

**¿Reembolso no apareciendo?**
- Los reembolsos de Stripe tardan 3-5 días hábiles
- Verifica panel de Stripe
- O registra reembolso manual

**¿No puedes encontrar miembro de tripulación?**
- Verifica que esté activo (no archivado)
- Verifica que tenga rol correcto
- Agréguelo en la página Agents primero

**¿Pago no actualizándose?**
- Espera 1-2 minutos para sincronización
- Actualiza página
- Verifica panel de Stripe

---

## Cuando Estés Listo para Más

Esta guía cubre lo esencial. Cuando necesites características avanzadas:

📖 **Lee el Manual Completo del Usuario** (`USER_MANUAL_ES.md`)
- Documentación completa de características
- Guías paso a paso para todo
- Sección de solución de problemas
- Permisos detallados por rol

💬 **Contacta al Admin**
- Para configuración del sistema
- Para soporte técnico
- Para solicitudes de características

---

## Números Clave (¡Recuerda Estos!)

- **15 minutos**: Duración de retención de reserva
- **30 días**: Expiración de enlace de pago
- **5 días**: Recordatorio de pago pendiente
- **2.9% + €0.30**: Tarifa de pago de Stripe

---

## ¡Estás Listo! 🚀

Ahora sabes:
- ✅ Cómo iniciar sesión
- ✅ Cómo crear una reserva
- ✅ Cómo obtener pago
- ✅ Cómo gestionar flota
- ✅ Cómo gestionar equipo
- ✅ Cómo compartir con clientes
- ✅ Cómo manejar cancelaciones

¡Comienza a crear reservas y gestionar tu negocio!

¿Necesitas ayuda? Verifica la sección de solución de problemas o contacta a tu administrador.

---

**Guía de Inicio Rápido - v1.0**
**Diciembre 2025**

Para documentación completa, ver `USER_MANUAL_ES.md`

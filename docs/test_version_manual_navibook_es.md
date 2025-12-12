# NaviBook Versión de Pruebas – Manual de Usuario

Utiliza este manual como guía mientras exploras NaviBook en modo pruebas.

- Usuarios objetivo: personal de oficina, agentes, managers, administradores, capitanes y testers.
- Entorno: instancia de pruebas/demos de NaviBook (local o desplegada).
- Alcance: solo flujos de interfaz (sin configuración de desarrollo ni cambios de código).

---

## 1. Acceso al entorno de pruebas

1. Asegúrate de que la aplicación está en ejecución.
2. Abre la URL base en tu navegador.
3. Deberías ver la **pantalla de inicio de NaviBook**:
   - Nombre del sistema y de la empresa.
   - Tarjetas con el estado de la flota (si hay barcos en la base de datos).
   - Una franja de estado mostrando conexión a base de datos y “realtime”.
   - Botones **Login** y **Register** en la parte inferior.
4. Usa las **credenciales de demo** de abajo para la mayoría de las pruebas. El registro está soportado, pero no es obligatorio para los flujos básicos.

---

## 2. Cuentas de demo (sesiones de prueba)

Úsalas para pruebas realistas según cada rol. Todas las contraseñas están en `day-charter/DEMO_CREDENTIALS.md`.

| Persona | Rol            | Email                       | Password    | Notas                                   |
|--------|----------------|-----------------------------|-------------|-----------------------------------------|
| Admin  | Admin          | `admin@navibook.com`        | `Admin123!` | Acceso completo, ideal para probar todo |
| Maria  | Office Manager | `maria@sunsetcharters.com`  | `Demo2025!` | Mostrador / recepción, sin comisión     |
| Carlos | Power Agent    | `carlos@sunsetcharters.com` | `Demo2025!` | Agente de alto volumen                  |
| Sofia  | Regular Agent  | `sofia@sunsetcharters.com`  | `Demo2025!` | Flujo típico de agente                  |
| Pablo  | Regular Agent  | `pablo@sunsetcharters.com`  | `Demo2025!` | Especializado en motoras                |
| Elena  | Regular Agent  | `elena@sunsetcharters.com`  | `Demo2025!` | Agente nueva (menor comisión)           |
| Juan   | Captain/Owner  | `juan@sunsetcharters.com`   | `Demo2025!` | Capitán propietario, 0 €/h              |
| Marco  | Captain        | `marco@sunsetcharters.com`  | `Demo2025!` | Capitán senior, 35 €/h                  |
| Luis   | Captain        | `luis@sunsetcharters.com`   | `Demo2025!` | Capitán junior, 25 €/h                  |

Para **cobertura completa**, céntrate en:

- **Admin** – puede acceder a casi todas las páginas (flota, precios, informes, etc.).
- **Maria (Office Manager)** – flujo realista de recepción/oficina.
- **Carlos (Power Agent)** – uso intensivo de “Quick Booking” en móvil.
- **Sofia o Elena (Regular Agent)** – flujo estándar de agente con comisión.
- **Juan / Marco / Luis (Capitanes)** – comportamiento específico del panel para capitanes.

---

## 3. Roles y permisos

El sistema usa un enum `user_role`. En los datos de demo encontrarás estos roles:

- `admin` – control total a nivel empresa.
- `manager` – operaciones de alto nivel y control de precios.
- `office_staff` – operaciones diarias, informes y pagos.
- `accountant` – vistas y gestión financiera.
- `power_agent` – agente senior con herramientas extra como “Advanced Booking”.
- `regular_agent` – agente de ventas estándar.
- `captain` – ve los chárteres asignados y datos orientados al capitán.

Desde la UI y el código:

- **Cualquier usuario autenticado** puede:
  - Ver **Dashboard**, **Calendar**, **Bookings**, **Customers (Guests)** y la vista básica de **Weather**.
  - Usar la barra de navegación inferior en móvil (pantallas pequeñas).
- **Admin / Manager**:
  - Acceden a **Pricing**, **Advanced Booking**, **Blocked Slots**, **Reports**, **Payments**.
- **Power Agent**:
  - Acceso a **Advanced Booking** y **Blocked Slots**.
- **Office Staff**:
  - Acceden a **Reports**, **Payments** y a herramientas de limpieza del dashboard.
- **Accountant**:
  - Accede a **Payments**.
- **Captains**:
  - Ven widgets específicos en **Dashboard** y una página móvil de **My Bookings** (por ahora placeholder).

Si un rol intenta abrir una página restringida, normalmente será redirigido de vuelta a `/dashboard`.

---

## 4. Conceptos básicos de la interfaz

### 4.1 Navegación

- **Escritorio**
  - La mayoría de páginas incluyen un botón **Back to Dashboard**.
  - Los enlaces entre secciones (Dashboard → Calendar, Bookings, etc.) se hacen mediante tarjetas y botones.
- **Móvil (pantallas pequeñas)**
  - Una **barra de navegación inferior fija** aparece en la mayoría de páginas (no en la portada ni en el portal de cliente):
    - `Home` → `/dashboard`
    - `Calendar` → `/calendar`
    - `Bookings` → `/bookings`
    - `Guests` → `/customers`
    - `Payments` → `/payments`

### 4.2 Tema y diseño

- Hay un **Theme Toggle** en la parte superior derecha de muchas páginas.
- La app es responsive (Tailwind); en móvil la información importante se apila en columnas sencillas.

### 4.3 Estados y “badges”

- **Estados de reserva** (se muestran como chips/badges de color):
  - `pending_hold` – reserva en espera temporal.
  - `confirmed` – reserva confirmada.
  - `completed` – chárter completado.
  - `cancelled` – cancelada.
  - `no_show` – el cliente no se presentó.
- **Estado de pago** (portal e informes):
  - `paid`, `partial`, `unpaid`.

Puedes probar los cambios de estado usando las acciones de reserva (confirmar, completar, cancelar, marcar “no show”, etc.) según el rol.

### 4.4 Fechas, horas y moneda

- Las fechas suelen mostrarse como **YYYY‑MM‑DD** en formularios; en vistas resumen aparecen formatos más amigables.
- Las horas usan formato 24h (por ejemplo `10:00`).
- La moneda es **Euro (€)**.

---

## 5. Flujos de autenticación

### 5.1 Inicio de sesión (Login)

1. Desde la portada, pulsa **Login** (o ve directamente a `/login`).
2. Introduce un email y contraseña de la **lista de demo**.
3. Pulsa **Login**.
4. Si es correcto, deberías ser redirigido a `/dashboard`.
5. Si falla, verás un mensaje de error en la misma página y seguirás en `/login`.

**Pruebas recomendadas**

- Login válido (por ejemplo `admin@navibook.com` / `Admin123!`).
- Email o contraseña inválidos.
- Logout y login de nuevo (ver sección de Dashboard para el cierre de sesión).

### 5.2 Registro (opcional)

1. Desde la portada, pulsa **Register** (o ve a `/register`).
2. Rellena los datos de la empresa y del usuario que te solicite el formulario.
3. Envía el formulario.
4. Verifica que:
   - Se ha creado una nueva empresa y un nuevo usuario.
   - Puedes iniciar sesión con esa nueva cuenta.

> Para probar la funcionalidad principal de forma manual puedes saltarte el registro y usar solo las cuentas de demo.

---

## 6. Dashboard (`/dashboard`)

El Dashboard es el punto de entrada principal tras iniciar sesión.

### 6.1 Cabecera

- Muestra **“Dashboard”** y una línea de bienvenida con tu nombre.
- Controles en la parte superior derecha:
  - **Theme toggle**.
  - (En algunos roles) un botón de **Manual Cleanup** que elimina reservas en espera expiradas.
  - Botón **Logout**:
    - Envía un formulario que cierra la sesión y te devuelve a la página de login.

### 6.2 Tarjeta “Your Account”

Muestra:

- Nombre y email.
- Rol (por ejemplo `power agent`, `office staff`).
- Nombre de la empresa.
- Porcentaje de comisión (para roles de agente).
- Badge de estado: activo/inactivo.

**Prueba**: Inicia sesión con distintos roles y comprueba que la tarjeta se actualiza correctamente.

### 6.3 Sección específica para capitanes

Si entras como **captain** (por ejemplo Juan, Marco o Luis), verás:

- Tarjeta **“Your Upcoming Charters”**.
- Lista de reservas futuras asignadas a ese capitán:
  - Fecha y hora.
  - Nombre y tipo de barco.
  - Número de pasajeros.
  - Agente que creó la reserva.
  - Badge `TODAY` para los chárteres del día actual.

**Prueba**

- Entra con `juan@sunsetcharters.com` y comprueba:
  - Que aparecen chárteres próximos.
  - Que los del día actual están resaltados como “TODAY”.

### 6.4 Zona de resumen de flota y reservas

La parte inferior del Dashboard utiliza tarjetas y pestañas adicionales (ver `dashboard-bookings-tabs.tsx`) para mostrar:

- Reservas próximas.
- Atajos hacia **Calendar**, **Bookings**, **Quick Book**, etc.

Usa estos enlaces para moverte rápido entre páginas durante las pruebas.

---

## 7. Quick Booking (`/quick-book`) – Flujo de agente

Este es el **flujo principal de creación de reservas**, optimizado para agentes en móvil.

### 7.1 Acceso

- Desde la página **Bookings** usando el botón **“New Booking”**.
- Directamente en `/quick-book`.

### 7.2 Secciones del formulario

La página es un formulario largo basado en tarjetas:

1. **Booking Basics**
   - Fecha (selector tipo calendario).
   - Hora de inicio (desplegable / campo de hora).
   - Duración (`2h`, `3h`, `4h`, `8h`).
   - Número de pasajeros.
2. **Package & Boat**
   - Tipo de paquete:
     - `Charter Only`
     - `Charter + Drinks`
     - `Charter + Food`
     - `Full Package`
   - Barcos disponibles:
     - Filtrados por empresa, fecha, hora y solapamiento con otras reservas.
     - Se muestra la capacidad y el tipo de barco.
3. **Customer Details**
   - Nombre (obligatorio).
   - Teléfono (obligatorio).
   - Email (opcional, pero recomendado para el portal de cliente).
   - Notas / peticiones especiales.
4. **Captain & Pricing**
   - Selección de capitán (opcional):
     - La lista de capitanes se filtra por empresa y rol `captain`.
     - La tarifa por hora se usa para calcular el coste del capitán.
   - Totales calculados automáticamente:
     - Precio base desde la tabla `pricing` (según barco, duración y paquete).
     - Comisión según el porcentaje de comisión del agente.
     - Coste del capitán (si se ha asignado).
   - Importe de depósito (campo numérico opcional).
5. **Opciones de confirmación**
   - Interruptor “Confirm Immediately”:
     - Off → la reserva se crea como **hold** con un temporizador de caducidad.
     - On → la reserva se crea como **confirmed** inmediatamente.

### 7.3 Disponibilidad y holds

- Cuando cambias fecha/hora/duración, la página **comprueba la disponibilidad**:
  - Llama a `get_available_boats` con los parámetros seleccionados.
  - Muestra un mensaje de error si la comprobación falla.
  - Limpia la selección de barco si ese barco deja de estar disponible.
- Tras enviar el formulario, si **no** confirmas inmediatamente:
  - Se inicia un **temporizador de hold** (verás la cuenta atrás).
  - Debes confirmar la reserva antes de que caduque el hold.
  - Un proceso programado limpia los holds expirados.

### 7.4 Crear una reserva – Pasos de prueba

1. Inicia sesión como **Carlos (Power Agent)**.
2. Ve a `/quick-book`.
3. Configura:
   - Fecha: mañana.
   - Hora de inicio: `10:00`.
   - Duración: `4h`.
   - Pasajeros: `6`.
   - Paquete: `Full Package`.
4. Espera a que carguen los **Available Boats** y elige uno.
5. Opcional: elige un capitán (por ejemplo Marco) y comprueba que se incluye el coste del capitán.
6. Rellena nombre, teléfono y email del cliente.
7. Añade un depósito (por ejemplo `200`).
8. Deja “Confirm Immediately”:
   - **On** para crear una reserva confirmada.
   - **Off** para crear un hold (y observa el temporizador).
9. Envía el formulario.
10. Comprueba que aparece un mensaje de éxito y/o un diálogo de confirmación.
11. Abre **Bookings** (`/bookings`) y confirma que la reserva aparece con el estado y los importes correctos.

Repite con distintos roles y parámetros (duraciones, paquetes, barcos).

---

## 8. Listado y detalle de reservas (`/bookings` y `/bookings/[id]`)

### 8.1 Listado de reservas (`/bookings`)

Acceso:

- Desde la navegación inferior en móvil → **Bookings**.
- Directamente en `/bookings`.

Comportamiento:

- **Admin, Manager, Office Staff**:
  - Ven **todas** las reservas de la empresa.
- **Agentes (regular/power)**:
  - Solo ven **sus propias** reservas.
- La página muestra:
  - Cabecera con **“Bookings”** y un icono de ancla.
  - Botón **New Booking** que enlaza a `/quick-book`.
  - Theme toggle y botón Back to Dashboard.
  - O bien:
    - Una tabla/lista de reservas con filtros (barco, fecha, estado), o
    - Un estado vacío con botón “Create First Booking”.

**Prueba**

- Entra como **Admin** y verifica que ves muchas reservas.
- Entra como **Carlos** y confirma que solo ves las reservas cuyo `agent` es Carlos.

### 8.2 Detalle de reserva (`/bookings/[id]`)

Abre una reserva haciendo clic en ella desde el listado.

La vista de detalle muestra:

- Cabecera:
  - Botón Back to **Bookings**.
  - ID de la reserva.
  - Un badge grande con el estado (Pending Hold, Confirmed, Completed, etc.).
- **Botones de acción** (a través de `BookingActions`):
  - Confirmar reserva.
  - Marcar como completada.
  - Cancelar.
  - Marcar como no presentada (no‑show).
  - Editar datos de la reserva (abre un diálogo).
  - Posiblemente añadir pagos / abrir factura (según rol e implementación).
- **Secciones** (tarjetas):
  - Información del cliente (nombre, email, teléfono).
  - Detalles del chárter (fecha, hora, duración, barco, paquete, pasajeros).
  - Asignación de agente y capitán.
  - Resumen económico (precio total, comisión, coste de capitán).
  - Transacciones de pago (si las hay).
  - Historial de cambios:
    - Cada cambio con fecha/hora, usuario y datos antiguos/nuevos.

Comportamiento por rol:

- Los agentes no pueden ver reservas que no les pertenezcan (son redirigidos).
- Admin/manager/office staff ven todas las reservas.

**Escenarios de prueba**

1. **Confirmar un hold**
   - Crea una reserva en modo hold desde Quick Book.
   - Abre el detalle de la reserva como Admin u Office Staff.
   - Usa la acción **Confirm**.
   - Comprueba que el estado pasa a `CONFIRMED` y que el historial se actualiza.
2. **Completar un chárter**
   - Localiza una reserva confirmada en una fecha pasada.
   - Usa la acción **Complete**.
   - Comprueba el estado y el historial.
3. **Cancelar / No‑Show**
   - Usa las acciones **Cancel** o **Mark No‑Show** y confirma el estado resultante.

---

## 9. Calendar (`/calendar`)

El calendario ofrece una vista visual de las reservas y permite reprogramarlas arrastrando y soltando.

### 9.1 Acceso y permisos

- Cualquier usuario autenticado puede abrir `/calendar`.
- Los agentes solo ven sus propias reservas; otros roles ven todas las reservas.

### 9.2 Diseño

- Cabecera:
  - Título **“Calendar”**.
  - Descripción: calendario interactivo con drag‑and‑drop.
  - Theme toggle y botón **Back to Dashboard**.
- Componente de calendario:
  - Vistas mensual/semanal/diaria (`react-big-calendar`).
  - Eventos coloreados:
    - Por barco, o
    - Por estado de la reserva.
  - Controles de filtro:
    - Filtro por barco.
    - Filtro por estado.
    - Selector de criterio de color (boat/status).

### 9.3 Interacciones

- Haz clic en un evento para abrir un diálogo:
  - Muestra datos básicos de la reserva y acciones rápidas.
  - Enlace a la página de detalle **View Booking**.
- Arrastra un evento a otra franja:
  - Muévelo a otra hora o a otro día.
  - Deberías ver un diálogo de confirmación o un toast.
  - La fecha/hora de la reserva se actualiza (si no hay conflictos y tienes permiso).

**Prueba**

1. Reprograma una reserva arrastrándola en el calendario.
2. Comprueba en el detalle de la reserva que la fecha/hora han cambiado.
3. Prueba los filtros:
   - Filtra por barco.
   - Filtra por estado (confirmed, pending, etc.).

---

## 10. Waitlist (`/waitlist`)

La página de Waitlist gestiona clientes que quieren un chárter cuando no hay disponibilidad.

### 10.1 Acceso

- Cualquier usuario autenticado puede abrir `/waitlist` (limitado a su empresa).

### 10.2 Diseño y comportamiento

- Cabecera: **“Waitlist”** con un icono de reloj y descripción.
- Theme toggle y Back to Dashboard.
- Tabla/lista principal:
  - Entradas de lista de espera con:
    - Nombre y contacto del cliente.
    - Fecha/hora deseada.
    - Barco o tipo de barco preferido.
    - Notas.
  - Acciones:
    - Editar la entrada.
    - Convertir en reserva (abre un diálogo de conversión).
- Al convertir en reserva:
  - Seleccionas barco, fecha, hora y paquete.
  - El sistema crea una reserva (similar a Quick Book) y elimina o actualiza la entrada de la waitlist.

**Prueba**

1. Crea una entrada en la waitlist (desde la propia página o desde un flujo de reserva si está expuesto).
2. Verifica que aparece en la lista.
3. Usa **Convert** para convertirla en reserva.
4. Confirma que la reserva aparece en `/bookings` y que la waitlist se ha actualizado.

---

## 11. Advanced Booking (`/advanced-booking`)

Advanced Booking se usa para reservas recurrentes, plantillas y políticas de cancelación.

### 11.1 Acceso

- Solo `admin`, `manager` y `power_agent` pueden acceder; el resto se redirige a `/dashboard`.

### 11.2 Funcionalidad

Según la página y `AdvancedBookingClient`:

- **Plantillas de reservas recurrentes**
  - Patrones del tipo “todos los sábados de 10:00 a 14:00 en el Barco X”.
  - Generación rápida de múltiples reservas futuras a partir de una plantilla.
- **Integración con Waitlist**
  - Mostrar entradas recientes de la waitlist.
  - Convertirlas en reservas con más control que en la página básica de Waitlist.
- **Políticas de cancelación**
  - Gestionar políticas de cancelación a nivel empresa (p.ej. cancelación gratuita hasta X días, ventanas de reembolso parcial).
  - Escoger políticas por defecto y aplicarlas a las reservas.

**Prueba**

1. Inicia sesión como **Admin**.
2. Ve a `/advanced-booking`.
3. Crea o modifica una política de cancelación.
4. Usa una plantilla o una entrada de waitlist para generar reservas.
5. Verifica que las reservas creadas son correctas en `/bookings` y `/calendar`.

---

## 12. Fleet Management (`/fleet`)

La página Fleet gestiona los barcos y embarcaciones.

### 12.1 Acceso

- Cualquier usuario autenticado puede entrar en `/fleet`, pero en la práctica suele usarla Admin/Manager.

### 12.2 Funcionalidad

- Listado de barcos:
  - Nombre, tipo (sailboat/motorboat/jetski), capacidad, estado (activo).
- Acciones (a través de `FleetManagementClient`):
  - Añadir un barco nuevo.
  - Editar datos del barco.
  - Activar/desactivar barcos (mejor que borrarlos).

**Prueba**

1. Como Admin, añade un nuevo barco (nombre único).
2. Verifica que aparece:
   - En el estado de la flota de la portada.
   - En los barcos disponibles de Quick Book (para fechas/horas adecuadas).
3. Desactiva un barco y comprueba que:
   - Deja de aparecer en las listas de disponibilidad.
   - Sigue presente en las reservas históricas.

---

## 13. Customers / Guests (`/customers`)

La página Customers agrupa reservas por cliente para ofrecer una vista tipo CRM.

### 13.1 Acceso y comportamiento

- Cualquier usuario autenticado puede abrir `/customers`.
- Los datos se limitan a la empresa del usuario.
- Los clientes se agrupan principalmente por **email**, usando el teléfono como alternativa.

### 13.2 Contenido

- Para cada cliente:
  - Nombre.
  - Email y teléfono.
  - Importe total gastado (suma de reservas confirmed/completed).
  - Fecha de la última reserva.
  - Lista de reservas con:
    - Fecha y hora.
    - Estado.
    - Nombre del barco.
    - Tipo de paquete.
- Ordenación:
  - Los clientes se ordenan por **total gastado**, de mayor a menor.

**Prueba**

1. Crea varias reservas con el mismo email de cliente.
2. Abre `/customers` y comprueba:
   - Que esas reservas se agrupan bajo un único cliente.
   - Que el total gastado coincide con lo esperado.

---

## 14. Blocked Slots (`/blocked-slots`)

Los Blocked Slots se usan para mantenimiento, uso privado u otros motivos por los que un barco no se puede reservar.

### 14.1 Acceso

- Solo `admin`, `manager` y `power_agent` pueden usar esta página.

### 14.2 Funcionalidad

- Cabecera: **“Blocked Slots”** con icono de prohibido.
- Selector de barco filtrado por empresa y barcos activos.
- UI principal (via `BlockedSlotsClient`):
  - Añadir un bloqueo:
    - Elegir barco.
    - Seleccionar fecha y rango horario.
    - Especificar motivo (mantenimiento, chárter privado, etc.).
  - Ver bloqueos existentes.
  - Eliminar o editar bloqueos.

Los bloqueos se tienen en cuenta al comprobar la disponibilidad (Quick Book, Calendar, etc.).

**Prueba**

1. Crea un bloqueo para un barco en una fecha/hora concretas.
2. Ve a `/quick-book` e intenta reservar ese barco en ese intervalo.
3. Confirma que ese barco no aparece como disponible.
4. Elimina el bloqueo y comprueba que el barco vuelve a estar disponible.

---

## 15. Pricing Management (`/pricing`)

La página Pricing configura las tarifas de cada barco según duración y paquete.

### 15.1 Acceso

- Solo `admin` y `manager` pueden entrar en `/pricing`.

### 15.2 Funcionalidad

- Cabecera: **“Pricing Management”**.
- Tabla/cuadrícula de precios:
  - Nombre y tipo de barco.
  - Duración (`2h`, `3h`, `4h`, `8h`).
  - Paquete (`charter_only`, `charter_drinks`, `charter_food`, `charter_full`).
  - Precio (€).
- Acciones (a través de `PricingClient`):
  - Crear una nueva tarifa.
  - Editar tarifas existentes.
  - Copiar tarifas entre barcos o duraciones para configurar más rápido.

Las tarifas se usan en:

- Cálculo del total en Quick Book.
- Informes y vistas financieras.

**Prueba**

1. Cambia el precio de una combinación barco/paquete/duración.
2. Crea una nueva reserva con esa combinación.
3. Confirma que el total de la reserva coincide con la configuración de precios.

---

## 16. Payments (`/payments`)

La página Payments ofrece una vista financiera de reservas y transacciones de pago.

### 16.1 Acceso

- Roles permitidos: `admin`, `manager`, `office_staff`, `accountant`.

### 16.2 Modelo de datos

- Los pagos se guardan en `payment_transactions`, con:
  - `payment_type`:
    - `deposit`, `final_payment`, `full_payment`, `refund`, `partial_refund`.
  - `payment_method`:
    - `cash`, `card`, `bank_transfer`, `paypal`, `stripe`, `other`.
  - Las restricciones garantizan importes positivos para pagos y negativos para reembolsos.
- La vista `booking_payment_status` resume:
  - Precio total.
  - Total pagado.
  - Saldo pendiente.
  - Estado de pago: `paid` / `partial` / `unpaid`.

### 16.3 Comportamiento de la página

- Para cada reserva puedes:
  - Ver el estado de pago (badge).
  - Consultar todas las transacciones registradas.
  - Añadir nuevos pagos o reembolsos mediante diálogos (etiquetados por tipo y método).

**Prueba**

1. Elige una reserva sin pagar.
2. Añade un pago de tipo **deposit**.
3. Comprueba:
   - Que la transacción aparece en el historial.
   - Que el saldo pendiente disminuye.
   - Que el estado pasa a `partial`.
4. Añade un **final payment** hasta igualar el total.
5. Verifica que el estado pasa a `paid`.
6. Añade un **refund** y comprueba que el estado y los importes siguen siendo consistentes.

---

## 17. Reports & Analytics (`/reports`)

La página Reports ofrece una visión general del negocio.

### 17.1 Acceso

- Roles permitidos: `admin`, `manager`, `office_staff`.

### 17.2 Métricas principales

Según `CONTROL_TOWER_REPORTS.md` y la implementación, la página muestra:

- Selector de rango de fechas y botones para exportar (CSV).
- Tarjetas resumen:
  - Ingresos (revenue).
  - Valor medio por reserva.
  - Número de reservas.
  - Comisiones de agentes.
  - Costes de capitanes.
  - Costes totales.
  - Beneficio neto.
  - Margen de beneficio (%).
- Visualizaciones:
  - Ingresos vs costes y beneficio (gráfico de barras a lo largo del tiempo).
  - Distribución de ingresos (gráfico de sectores).
  - Distribución de estados de reserva (gráfico de sectores).
  - Rendimiento por paquete (tabla).
  - Barcos top por ingresos.
  - Rendimiento de agentes con detalle de comisiones.
  - Porcentajes de ocupación por barco.

### 17.3 Pruebas de Reports

1. Inicia sesión como **Admin**.
2. Abre `/reports`.
3. Selecciona un rango amplio (por ejemplo todo el año actual).
4. Confirma:
   - Que las tarjetas muestran valores no nulos.
   - Que los gráficos se renderizan correctamente.
   - Que las tablas desglosan reservas por barco, paquete y agente.
5. Usa la exportación **CSV** (si está visible) y verifica que el contenido coincide con los datos en pantalla.

---

## 18. Notifications (`/notifications`)

La página Notifications muestra el historial de notificaciones.

### 18.1 Acceso y comportamiento

- Cualquier usuario autenticado puede abrir `/notifications`.
- La página carga hasta 50 notificaciones de la empresa del usuario.
- Cada entrada muestra:
  - Tipo (por ejemplo email / SMS).
  - Asunto o título.
  - Destinatario (email/teléfono).
  - Marca de tiempo.
  - Estado (enviada, fallida, etc.).

Algunas **preferencias de notificación** también se gestionan mediante UI dedicada (dependiendo de la implementación) junto con los endpoints `/api/notifications`.

**Prueba**

1. Realiza una acción que deba generar una notificación (por ejemplo confirmar una reserva).
2. Abre `/notifications`.
3. Comprueba que aparece un nuevo registro con información razonable.

---

## 19. Weather (`/weather`)

La página Weather integra predicciones marinas mediante la API de Open‑Meteo.

### 19.1 Acceso

- Cualquier usuario autenticado puede abrir `/weather`.

### 19.2 Comportamiento

- Cabecera: **“Weather Forecast”**.
- `WeatherClient` carga datos de previsión para una ubicación relevante (configurada en el backend).
- La página se centra en:
  - Condiciones de seguridad en el mar.
  - Viento, oleaje o puntuaciones de “suitability” (los detalles exactos pueden variar).

**Prueba**

1. Abre `/weather`.
2. Comprueba que:
   - Los datos se cargan sin errores.
   - La información de tiempo es comprensible para los próximos días.
3. Opcional: compárala con la pestaña de **Weather** del **customer portal** para una reserva concreta.

---

## 20. Vista de capitán – My Bookings (`/my-bookings`)

La vista de capitán es actualmente una página **placeholder**.

### 20.1 Acceso

- Abre `/my-bookings` mientras estás conectado como capitán (por ejemplo Juan).

### 20.2 Comportamiento

- Muestra:
  - Cabecera **“My Bookings”**.
  - Una línea identificando al capitán (por ejemplo “Captain Juan”).
  - Mensaje indicando “Coming soon!”.
  - Botón para volver al **Dashboard**.
- Incluye un botón **Logout**.

**Prueba**

- Comprueba que ves el contenido placeholder y que puedes volver al Dashboard o cerrar sesión.

---

## 21. Customer Portal (`/portal/[token]`)

El Customer Portal permite a los clientes ver detalles de su reserva, estado de pagos, tiempo y enviar solicitudes de cambio.

### 21.1 Acceso

- Las URLs del portal tienen la forma `/portal/<token>`.
- Los tokens se generan por reserva mediante lógica de backend y, en la UI, suelen aparecer como un botón/enlace de **“Copy customer link”** o similar en la página de detalle de la reserva.
- Los clientes no son usuarios autenticados: el token es el mecanismo de acceso.

### 21.2 Carga del portal

1. Desde la página de detalle de una reserva (como Admin/Agent), localiza el botón/enlace de **Customer Portal** si está disponible, o usa una URL de prueba conocida.
2. Abre esa URL en una ventana de navegador normal (puedes estar desconectado de la app principal para simular al cliente).

Resultados posibles:

- **Token válido** → el portal se abre correctamente.
- **Token inválido/expirado** → tarjeta de **Access Error** indicando que el cliente debe contactar con la empresa.

### 21.3 Diseño y pestañas

- Cabecera del portal:
  - Título: **“Your Booking”**.
  - Mensaje de bienvenida con el nombre del cliente.
  - ID de reserva abreviado.
- Pestañas:
  - **Overview** – resumen de reserva y pagos.
  - **Payments** – historial detallado de pagos.
  - **Weather** – predicción para el día del chárter (si está disponible).
  - **Requests** – historial de solicitudes de cambio y formulario para enviar nuevas.

### 21.4 Pestaña Overview

Muestra:

- Detalles del barco:
  - Nombre, tipo, capacidad, número de invitados.
- Fecha y hora:
  - Fecha de la reserva.
  - Hora de inicio y fin.
- Nombre del paquete (si existe).
- Duración en horas.
- Peticiones especiales.
- Resumen de pagos:
  - Precio total.
  - Total pagado.
  - Importe pendiente.
  - Badge de estado de pago (Fully Paid / Partially Paid / Unpaid).
- Información de contacto de la empresa.

### 21.5 Pestaña Payments

- Lista de transacciones de pago:
  - Tipo de pago (deposit, final payment, refund, etc.).
  - Fecha.
  - Método de pago.
  - Notas.
  - Importe (verde para pagos, rojo para reembolsos).
- Estado vacío si no hay pagos todavía.

### 21.6 Pestaña Weather

- Predicción meteorológica para el día del chárter.
- Aviso recordando al cliente que confirme las condiciones reales.
- Texto indicando que los datos de tiempo provienen de Open‑Meteo.

### 21.7 Pestaña Requests (solicitudes de cambio)

- Muestra las solicitudes anteriores, cada una con:
  - Tipo (date change, time change, package change, participant count, etc.).
  - Valor actual vs valor solicitado.
  - Badge de estado (pending, approved, rejected, completed).
  - Notas/respuestas.
- Botón **“Request a Change”** que abre un diálogo:
  - Selector de tipo de solicitud.
  - Campo para el nuevo valor.
  - Mensaje opcional.
  - Botones de enviar y cancelar.
- Al enviar:
  - Se hace POST a `/api/portal/change-request`.
  - Aparece un toast de éxito si todo va bien; los errores muestran un toast de error.
  - Se recarga la lista de solicitudes.

**Prueba**

1. Abre un enlace de portal existente para alguna reserva.
2. Envía una solicitud de cambio de fecha (**date change**).
3. Comprueba:
   - Que la solicitud aparece como `pending` en la pestaña **Requests**.
   - Que el personal interno pueda verla y gestionarla (la forma exacta depende de la implementación interna).

---

## 22. Escenarios de prueba end‑to‑end recomendados

Usa estos escenarios para validar la app como un usuario real.

### Escenario A – Quick Booking de agente y confirmación

1. Inicia sesión como **Carlos (Power Agent)**.
2. Crea una reserva de 4 horas para mañana a las 10:00 usando **Quick Book**.
3. Elige una motora y el paquete **Full Package**.
4. Asigna un capitán y fija un depósito.
5. Guarda como **hold** (no confirmes todavía).
6. Confirma la reserva desde la vista de detalle en **Bookings**.
7. Verifica que la reserva:
   - Aparece en **Calendar**.
   - Se ve correctamente en **Customers** bajo ese cliente.
   - Muestra el estado de pago correcto.

### Escenario B – Waitlist → Advanced Booking

1. Inicia sesión como **Admin**.
2. Añade una entrada de waitlist para un día ya completo.
3. Convierte esa entrada en reserva desde **Advanced Booking**.
4. Comprueba:
   - Que la entrada de waitlist se ha actualizado o eliminado.
   - Que la nueva reserva aparece en **Bookings** y **Calendar**.

### Escenario C – Pagos e informes

1. Inicia sesión como **Maria (Office Manager)**.
2. Escoge una reserva con saldo pendiente.
3. Registra un **deposit** en la página **Payments**.
4. Más tarde, registra un **final payment**.
5. Verifica en:
   - Detalle de la reserva → sección de pagos.
   - Lista de **Payments**.
   - Métricas de **Reports** (ingresos, estado de pago).

### Escenario D – Customer Portal y solicitud de cambio

1. Como Admin, abre el detalle de una reserva y copia el enlace de **Customer Portal** (si está disponible).
2. Abre el enlace en una ventana nueva o en modo incógnito.
3. Verifica las pestañas **Overview**, **Payments** y **Weather**.
4. Envía una solicitud de cambio de hora.
5. Comprueba que aparece como `pending` en **Requests** y que es visible internamente.

### Escenario E – Bloqueo de mantenimiento y disponibilidad

1. Como Admin, ve a **Blocked Slots** y bloquea un barco en un periodo concreto.
2. Intenta crear una reserva en ese intervalo desde **Quick Book**.
3. Comprueba que el barco no aparece como disponible.
4. Elimina el bloqueo y verifica que vuelve a estar disponible.

---

## 23. Notas y limitaciones de la versión de pruebas

- Algunas páginas específicas para capitanes (por ejemplo **My Bookings**) están claramente marcadas como **“Coming soon”**.
- Ciertas funciones de admin pueden seguir en fase alfa y cambiar sin previo aviso.
- Este manual se basa en el código actual. Si actualizas el código o añades nuevas funciones, recuerda actualizar también este manual.

Usa este manual como referencia mientras exploras NaviBook. Si necesitas un checklist más corto por rol (solo capitanes, solo personal de oficina, etc.), puedes derivarlo fácilmente a partir de las secciones anteriores.


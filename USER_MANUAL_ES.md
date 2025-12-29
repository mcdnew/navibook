# NaviBook Day-Charter - Manual Completo del Usuario

**Versión:** 1.0
**Última Actualización:** Diciembre 2025
**Aplicación:** Sistema de Gestión de Alquileres de Barcos

---

## Tabla de Contenidos

1. [Introducción](#introducción)
2. [Primeros Pasos](#primeros-pasos)
3. [Roles de Usuario y Permisos](#roles-de-usuario-y-permisos)
4. [Características Principales por Rol](#características-principales-por-rol)
5. [Gestión de Reservas](#gestión-de-reservas)
6. [Gestión de Tripulación y Personal](#gestión-de-tripulación-y-personal)
7. [Precios y Tarifas](#precios-y-tarifas)
8. [Procesamiento de Pagos](#procesamiento-de-pagos)
9. [Portal del Cliente](#portal-del-cliente)
10. [Reportes y Análisis](#reportes-y-análisis)
11. [Gestión de Flota de Barcos](#gestión-de-flota-de-barcos)
12. [Configuración del Sistema](#configuración-del-sistema)
13. [Guía de Aplicación Móvil](#guía-de-aplicación-móvil)
14. [Solución de Problemas](#solución-de-problemas)

---

## Introducción

### ¿Qué es NaviBook?

NaviBook es una **plataforma completa de gestión de alquileres de barcos** diseñada para negocios de alquileres de día de barcos en el Mediterráneo. Proporciona:

- **Gestión de Reservas**: Crear, confirmar y gestionar reservaciones de charters
- **Programación de Tripulación**: Asignar capitanes y marineros a los charters
- **Disponibilidad en Tiempo Real**: Prevenir reservas dobles con detección automática de conflictos
- **Pagos Integrados**: Aceptar pagos en línea a través de Stripe y registro de pagos manuales
- **Portal del Cliente**: Enlaces compartibles para que los clientes vean y modifiquen reservas
- **Reportes y Análisis**: Información comercial completa
- **Diseño Mobile-First**: Funcionalidad completa en teléfonos inteligentes y tablets
- **Multi-Tenencia**: Datos separados para múltiples compañías de charters

### Requisitos del Sistema

- **Navegador web moderno** (Chrome, Firefox, Safari, Edge)
- **Conexión a Internet** (siempre requerida)
- **Dispositivo móvil** (iOS 12+ o Android 8+) para aplicación móvil
- **Correo electrónico** para creación de cuenta y notificaciones

---

## Primeros Pasos

### Tu Primer Inicio de Sesión

1. Abre NaviBook en tu navegador: `https://navibook.com`
2. Haz clic en **"Login"** en la esquina superior derecha
3. Ingresa tu correo electrónico y contraseña
4. ¡Serás dirigido al dashboard específico de tu rol!

**Cuenta de Demostración (Para Pruebas):**
- Correo: `admin@navibook.com`
- Contraseña: `Admin123!`

### Configuración Inicial (Solo Administradores)

Antes de usar el sistema, los administradores deben completar:

1. **Agregar Tu Flota**
   - Ve a: **Fleet** → **Agregar Nuevo Barco**
   - Ingresa: Nombre del barco, tipo (velero/lancha/jet ski), capacidad
   - Configura: Capitán predeterminado, tasas de consumo de combustible

2. **Configurar Precios**
   - Ve a: **Pricing** → **Agregar Precio**
   - Configura: Precio por barco, por duración (2h, 4h, 6h, 8h, día completo)
   - Por tipo de paquete (solo charter, con bebidas, con comida, premium)

3. **Agregar Tu Equipo**
   - Ve a: **Agents** → **Agregar Agente**
   - Crea cuentas para: Agentes de ventas, capitanes, marineros, personal de oficina
   - Configura: Roles, porcentajes de comisión, tarifas por hora

4. **Configurar Configuración de Empresa**
   - Ve a: **Settings** → **Configuración de Empresa**
   - Configura: Nombre de empresa, ubicación, política de cancelación, tasas de reembolso

---

## Roles de Usuario y Permisos

NaviBook tiene **9 roles de usuario distintos** con diferentes capacidades:

### 1. ADMIN
**Acceso completo del sistema - Nivel propietario/gerente comercial**

Permisos:
- ✅ Crear, editar, cancelar todas las reservas
- ✅ Gestionar todos los agentes, capitanes, marineros
- ✅ Configurar precios y tarifas
- ✅ Acceder a todos los pagos e informes financieros
- ✅ Modificar configuración de empresa y políticas
- ✅ Archivar/eliminar agentes
- ✅ Ver todos los datos de clientes
- ✅ Generar reportes completos

### 2. GESTOR DE OPERACIONES
**Supervisión de operaciones - Nivel gerente**

Permisos:
- ✅ Crear y editar todas las reservas
- ✅ Gestionar agentes y asignaciones de tripulación
- ✅ Ver pagos y registrar transacciones
- ✅ Acceder a reportes y análisis
- ✅ Crear precios y gestionar slots bloqueados
- ✅ No puede modificar configuración core de empresa
- ✅ No puede cambiar políticas de cancelación

### 3. PERSONAL DE OFICINA
**Apoyo administrativo - Nivel administrativo**

Permisos:
- ✅ Crear y editar reservas
- ✅ Ver información de cliente
- ✅ Registrar transacciones de pago
- ✅ Gestionar notificaciones
- ✅ No puede modificar precios o gestión de agentes
- ✅ No puede acceder a reportes financieros
- ✅ Limitado a apoyo operacional

### 4. GERENTE DE CONTABILIDAD
**Operaciones financieras - Especialista en finanzas**

Permisos:
- ✅ Ver y registrar transacciones de pago
- ✅ Generar reportes de pago
- ✅ Rastrear reembolsos y cancelaciones
- ✅ No puede modificar reservas
- ✅ No puede crear precios
- ✅ No puede gestionar agentes

### 5. AGENTE DE VENTAS
**Creación de reservas - Representante de ventas**

Permisos:
- ✅ Crear reservas (solo propias)
- ✅ Ver información de cliente
- ✅ Asignar tripulaciones a propias reservas
- ✅ Ver rastreo de comisión
- ✅ No puede ver reservas de otros agentes
- ✅ No puede modificar precios o agentes
- ✅ No puede acceder a datos financieros

### 6. INSTRUCTOR
**Especialista en capacitación - Escuela de vela**

Permisos:
- ✅ Crear reservas de instrucción
- ✅ Rastrear tarifas por hora ganadas
- ✅ Ver reservas asignadas
- ✅ No puede modificar precios
- ✅ No puede gestionar otro personal

### 7. CAPITÁN
**Capitán de barco - Nivel de tripulación**

Permisos:
- ✅ Ver tours asignados próximos
- ✅ Ver tarifas ganadas por charter
- ✅ No puede crear reservas
- ✅ No puede modificar precios
- ✅ Experiencia optimizada para móvil

### 8. MARINERO
**Miembro de tripulación - Nivel de tripulación**

Permisos:
- ✅ Ver deberes de charter asignados
- ✅ Ver tarifas ganadas por charter
- ✅ No puede crear reservas
- ✅ No puede modificar nada
- ✅ Experiencia optimizada para móvil

### 9. ADMIN_EMPRESA (Legado)
**Retenido por compatibilidad hacia atrás - Usa ADMIN en su lugar**

---

## Características Principales por Rol

### Para ADMIN / GESTOR DE OPERACIONES

#### Descripción General del Dashboard
- Estadísticas rápidas: Barcos activos, reservas de hoy, pagos pendientes
- Resumen de ingresos: Ingresos totales, por barco, por agente
- Tours próximos: Próximos 7 días de un vistazo
- Desempeño del equipo: Reservas y comisión por agente
- Acciones rápidas: Nueva reserva, agregar barco, agregar agente

#### Páginas Disponibles
| Página | Propósito | Acceso |
|------|---------|--------|
| Dashboard | Descripción general del negocio | ✓ Todos los admins |
| Reservas | Lista completa de reservas | ✓ Todos los admins |
| Detalle de Reserva | Editar cualquier reserva | ✓ Todos los admins |
| Calendario | Línea de tiempo visual | ✓ Todos los admins |
| Reserva Avanzada | Crear reservas complejas | ✓ Todos los admins |
| Quick Book | Creación rápida de reservas | ✓ Todos los admins |
| Precios | Configurar tarifas | ✓ Admin, Gestor Ops |
| Flota | Gestionar barcos | ✓ Admin, Gestor Ops |
| Agentes | Gestionar personal | ✓ Admin, Gestor Ops |
| Clientes | Base de datos de clientes | ✓ Todos los admins |
| Pagos | Gestión de pagos | ✓ Admin, Contabilidad |
| Reportes | Análisis y reportes | ✓ Admin, Gestor Ops |
| Lista de Espera | Cola de clientes | ✓ Admin, Gestor Ops |
| Slots Bloqueados | Bloques de mantenimiento | ✓ Admin, Gestor Ops |
| Notificaciones | Historial de notificaciones | ✓ Todos los admins |
| Clima | Pronósticos marinos | ✓ Todos los admins |
| Configuración | Configuración del sistema | ✓ Solo Admin |

### Para AGENTE DE VENTAS

#### Dashboard
- Tus reservas próximas
- Rastreo de tu comisión
- Botón de creación rápida de reserva
- Acciones pendientes del cliente

#### Páginas Disponibles
- **Quick Book**: Creación rápida de reservas
- **Calendario**: Ver todos los barcos (solo lectura)
- **Mis Reservas**: Reservas que creaste
- **Clientes**: Búsqueda de clientes y notas
- **Lista de Espera**: Verificar preferencias del cliente
- **Notificaciones**: Alertas de tu reserva

**Restricciones:**
- No puede ver reservas de otros agentes
- No puede modificar precios
- No puede asignar marineros (solo capitán)
- No puede acceder a reportes financieros
- No puede gestionar configuración de empresa

### Para CAPITANES / MARINEROS (Tripulación)

#### Dashboard Móvil ("Mis Reservas")
- Tours asignados próximos
- Detalles del charter (fecha, hora, barco, cantidad de pasajeros)
- Tarifa ganada por cada charter
- Asignaciones y ganancias pasadas

#### Páginas Disponibles (Optimizado para Móvil)
- **Mis Reservas**: Tus charters asignados
- **Dashboard**: Vista previa rápida de charter (si está en escritorio)

**Restricciones:**
- No puede crear reservas
- No puede modificar detalles del charter
- No puede auto-asignarse
- Solo puede ver sus propias asignaciones
- No puede acceder a datos de precios o financieros

### Para PERSONAL DE OFICINA

#### Páginas Disponibles
- **Reservas**: Ver todas, crear/editar reservas
- **Quick Book**: Crear reservas rápidamente
- **Clientes**: Información de cliente y notas
- **Pagos**: Registrar pagos manuales
- **Notificaciones**: Gestionar preferencias de notificación
- **Lista de Espera**: Agregar/eliminar de lista de espera del cliente

**Restricciones:**
- No puede acceder a reportes financieros
- No puede modificar precios
- No puede gestionar agentes o capitanes
- No puede cambiar configuración de empresa
- No puede ver datos de comisión

---

## Gestión de Reservas

### Crear una Reserva

NaviBook proporciona dos métodos para crear reservas:

#### Método 1: Quick Book (Recomendado para Entrada Rápida)

**Perfecto para:** Creación rápida de charter, requisitos simples

1. Haz clic en **"Quick Book"** en navegación o Dashboard
2. **Selecciona Barco**
   - Lista desplegable de barcos disponibles
   - Muestra tipo de barco y capacidad

3. **Elige Fecha y Hora**
   - Selector de fecha muestra fechas no disponibles en gris
   - Selección de hora con formato de 24 horas
   - Menú desplegable de duración: 2h, 4h, 6h, 8h, día completo

4. **Ingresa Detalles del Cliente**
   - Nombre (requerido)
   - Apellido (requerido)
   - Correo electrónico (requerido)
   - Teléfono (opcional)
   - Cantidad de pasajeros (requerido)

5. **Selecciona Tipo de Paquete**
   - Solo charter (sin extras)
   - Con bebidas por persona
   - Con comida por persona
   - Premium (bebidas + comida)

6. **Asigna Capitán** (opcional)
   - Menú desplegable filtra capitanes disponibles a la hora seleccionada
   - Establece tarifa del capitán

7. **Revisa Precios**
   - Precio base: Barco + duración + paquete
   - Tarifa del capitán: Si se asigna
   - Precio total: Suma de todos los gastos

8. **Confirma Reserva**
   - Crea una **retención de 15 minutos**
   - La retención previene que otros usuarios reserven el mismo tiempo
   - Se envía correo de confirmación al cliente
   - Se puede enviar enlace de pago al cliente

**La Retención de 15 Minutos:**
- Una vez confirmada, el barco se reserva por 15 minutos
- Da tiempo al cliente para revisar detalles
- Expira automáticamente si no se confirma
- Las retenciones expiradas liberan el barco para otros

#### Método 2: Reserva Avanzada (Charters Complejos)

**Perfecto para:** Múltiples marineros, solicitudes especiales, precios complejos

1. Haz clic en **"Advanced Booking"** en navegación
2. **Paso 1: Barco y Fecha**
   - Selecciona barco y fecha/hora con verificación de disponibilidad
   - Selector de fecha multi-selección para ver slots bloqueados

3. **Paso 2: Duración y Pasajeros**
   - Elige duración (2h - 8h)
   - Ingresa número de pasajeros
   - Establece número de marineros requeridos

4. **Paso 3: Asignación de Capitán**
   - Menú desplegable de capitanes disponibles
   - Muestra tarifa por hora del capitán
   - Se puede dejar sin asignar

5. **Paso 4: Asignaciones de Marineros**
   - Busca y agrega marineros individualmente
   - Elimina marineros con botón ✕
   - Muestra tarifas por hora por marinero
   - Cada marinero aparece en "Mis Reservas"

6. **Paso 5: Paquete y Solicitudes**
   - Selecciona tipo de paquete
   - Campo de solicitudes/notas especiales
   - Monto de depósito de pago (opcional)

7. **Paso 6: Personalización de Precios**
   - Revisa todos los precios calculados
   - Puedes ajustar costos individuales
   - Precio final total

8. **Confirma y Crea**
   - Crea reserva con todos los detalles
   - Envía correo de confirmación
   - Comienza temporizador de retención (15 minutos)

### Editar una Reserva Existente

1. Ve a **Reservas** → Encuentra la reserva en la lista
2. Haz clic en la reserva para abrir página de detalle
3. Haz clic en botón **"Editar Reserva"** (arriba a la derecha)
4. Modifica cualquier campo:
   - Fecha/hora/duración
   - Detalles del cliente
   - Tipo de paquete
   - Asignaciones de capitán/marinero
   - Solicitudes especiales
   - Personalización de precios
5. Haz clic en **"Guardar Cambios"**
6. Correo de confirmación enviado al cliente si hay cambios mayores

**Qué puedes editar:**
- ✅ Fecha, hora, duración
- ✅ Detalles del cliente
- ✅ Tipo de paquete
- ✅ Tripulación de capitán/marinero
- ✅ Solicitudes especiales
- ✅ Monto de pago adeudado

**Qué no puedes editar:**
- ❌ Barco (crear nueva reserva en su lugar)
- ❌ Reservas completadas
- ❌ Reservas canceladas

### Flujo de Estado de Reserva

```
retención_pendiente (15 min)
    ↓
confirmada ←─── pago recibido
    ↓
completada ← charter terminado
    ↓
archivada

Rutas alternativas:
retención_pendiente → [expirada/tiempo agotado] → cancelada
confirmada → cancelada (por admin/cliente)
confirmada → sin_mostrar (cliente no apareció)
```

**Significados de Estado:**

| Estado | Significado | Acción Requerida |
|--------|-----------|-----------------|
| **retención_pendiente** | Reserva creada, esperando confirmación | Enviar enlace de pago al cliente |
| **confirmada** | Reserva confirmada, pago recibido | Día anterior: confirmación de tripulación |
| **completada** | Charter terminado con éxito | Archivar reserva |
| **cancelada** | Reserva cancelada por cliente/admin | Procesar reembolso si aplica |
| **sin_mostrar** | Cliente no apareció para charter | Registrar notas, procesar reembolso |

### Confirmar una Reserva Pendiente

Cuando el estado es `retención_pendiente`:

1. Abre reserva en lista de Reservas
2. Haz clic en botón **"Confirmar Reserva"**
   - O envía enlace de pago al cliente
   - O registra pago manualmente
3. Una vez recibido el pago, haz clic en **"Marcar como Pagado"**
4. El estado cambia a `confirmada`
5. La tripulación recibe notificación de asignación

### Cancelar una Reserva

1. Abre página de detalle de reserva
2. Haz clic en botón **"Cancelar Reserva"**
3. Confirma cancelación en diálogo
4. El sistema calcula automáticamente el reembolso:
   - Basado en política de cancelación
   - Basado en días hasta fecha del charter
   - Muestra monto del reembolso antes de confirmar
5. El estado de la reserva → `cancelada`
6. Cliente recibe notificación de reembolso

**Ejemplo de Política de Cancelación:**
- 7+ días antes: Reembolso 100%
- 3-7 días antes: Reembolso 50%
- Menos de 3 días: Reembolso 0% (no reembolsable)

---

## Gestión de Tripulación y Personal

### Agregar un Nuevo Miembro de Tripulación

1. Ve a página **Agents**
2. Haz clic en botón **"+ Agregar Nuevo Agente"**
3. Completa información personal:
   - Nombre (requerido)
   - Apellido (requerido)
   - Correo electrónico (requerido, único)
   - Teléfono (opcional)
4. Selecciona rol del menú desplegable:
   - **Agente de Ventas**: Crea reservas
   - **Capitán**: Tripulación, comanda barco
   - **Marinero**: Miembro de tripulación
   - **Instructor**: Instructor de vela
   - **Personal de Oficina**: Apoyo administrativo
5. Configura compensación:
   - **Comisión %**: Para agentes (% del precio de reserva)
   - **Comisión Fija**: Para agentes (cantidad fija por reserva)
   - **Tarifa por Hora**: Para capitanes/marineros (€/hora)
6. Establece **Estado Activo**:
   - Activo: Puede iniciar sesión y trabajar
   - Inactivo: No puede iniciar sesión, pero historial preservado (archivado)
7. Haz clic en **"Crear Agente"**
   - Se genera contraseña temporal
   - Se envía correo de activación al nuevo usuario
   - El usuario debe establecer su propia contraseña en primer inicio de sesión

### Editar Información de Tripulación

1. Ve a página **Agents**
2. Encuentra miembro de tripulación en lista (buscar o filtrar por rol)
3. Haz clic en **"Editar"** (icono de lápiz)
4. Modifica cualquier campo:
   - Nombre, correo, teléfono
   - Rol
   - Comisión/tarifas por hora
   - Estado activo/inactivo (para archivar)
5. Haz clic en **"Guardar Cambios"**

### Archivar (Desactivar) Tripulación

**¿Por qué archivar en lugar de eliminar?**
- Preserva datos históricos (reservas, ganancias, pagos)
- Mantiene pista de auditoría
- Puede reactivarse más tarde si es necesario
- Mejor para cumplimiento y reportes

**Para archivar:**
1. Ve a página **Agents**
2. Haz clic en **"Editar"** en miembro de tripulación
3. Desmarca **"Activo (agente puede iniciar sesión)"**
4. Haz clic en **"Guardar Cambios"**
5. Miembro de tripulación ya no aparece en lista activa
6. No puede iniciar sesión ni ser asignado a nuevos charters

**Para restaurar:**
1. Filtra agentes por estado **"Inactivo"**
2. Haz clic en **"Editar"** en miembro de tripulación archivado
3. Marca **"Activo (agente puede iniciar sesión)"**
4. Haz clic en **"Guardar Cambios"**
5. Miembro de tripulación puede ahora iniciar sesión y ser asignado

### Asignar Tripulación a Reservas

La asignación de tripulación ocurre durante creación/edición de reserva:

**Asignando Capitán:**
1. En formulario Quick Book o Advanced Booking
2. Encuentra campo **"Asignar Capitán"**
3. Haz clic en menú desplegable para ver capitanes disponibles
4. Sistema filtra capitanes NO ya reservados en ese momento
5. Selecciona capitán, confirma monto de tarifa
6. Si cambias a capitán diferente, la tarifa se actualiza automáticamente

**Asignando Marineros:**
1. En formulario Advanced Booking (Paso 4)
2. Encuentra sección **"Asignaciones de Marineros"**
3. Busca marinero por nombre o rol
4. Haz clic en **"+ Agregar"** para agregar marinero
5. Repite para múltiples marineros
6. Haz clic en **"Eliminar"** (✕) para desasignar marinero
7. Todos los marineros reciben notificación de asignación

**Capitán vs Marinero:**
- **Un capitán por reserva**: Comanda barco, responsable
- **Múltiples marineros por reserva**: Asistencia de tripulación
- **Ambos ganan tarifas**: Basado en tarifa por hora × duración
- **Ambos ven asignación**: En "Mis Reservas" en aplicación móvil

### Ver Ganancias de Tripulación

**Como Admin/Gestor:**
1. Ve a página **Agents**
2. Desplázate al fondo para ver estadísticas:
   - Total de reservas asignadas
   - Ingresos totales generados
   - Comisión pendiente adeudada
3. Haz clic en nombre de miembro de tripulación para historial detallado
4. Ve todas las reservas que crearon/trabajaron

**Como Capitán/Marinero:**
1. Inicia sesión y ve **"Mis Reservas"** (móvil)
2. Ve asignaciones próximas
3. Cada charter muestra tarifa ganada
4. Dashboard muestra ganancias totales este mes

---

## Precios y Tarifas

### Comprender Estructura de Precios

NaviBook usa **precios de cuatro niveles**:

```
Precio = Precio Base (barco + duración)
       + Extras de Paquete (bebidas/comida)
       + Tarifa del Capitán (si se asigna)
       + Tarifas de Marineros (si se asignan)
```

**Ejemplo:**
- Barco A: €200 base (2 horas)
- Paquete bebidas: €50 (5 pasajeros × €10/persona)
- Tarifa del capitán: €50/hora × 2 horas = €100
- Tarifa de marinero: €30/hora × 2 horas × 2 marineros = €120
- **Total: €470**

### Establecer Precios de Barco

1. Ve a página **Pricing**
2. Haz clic en **"+ Agregar Nuevo Precio"** o encuentra barco existente
3. Selecciona barco del menú desplegable
4. Para cada duración (2h, 4h, 6h, 8h, día completo):
   - Ingresa precio base para barco
   - Este es el precio sin tripulación o extras
5. Para cada tipo de paquete:
   - Establece precio adicional (sumado al base)
   - O margen porcentual
6. Haz clic en **"Guardar Precios"**

**Ejemplo de Estructura de Precios:**

| Barco | Duración | Precio Base | Solo Charter | +Bebidas | +Comida | +Premium |
|------|----------|-----------|--------------|---------|-------|----------|
| Velero A | 2h | €150 | €150 | €200 | €180 | €250 |
| Velero A | 4h | €280 | €280 | €380 | €340 | €480 |
| Lancha B | 2h | €200 | €200 | €280 | €250 | €350 |
| Lancha B | 4h | €350 | €350 | €530 | €480 | €680 |

### Copiar Precios en Lote

Para copiar precios de un barco a otro:

1. Ve a página **Pricing**
2. Haz clic en botón **"Copiar Precios"** en barco que deseas copiar DESDE
3. Selecciona barco(s) destino
4. Elige qué copiar:
   - ☐ Precios base
   - ☐ Extras de paquete
   - ☐ Sobrescribir existentes
5. Haz clic en **"Copiar Precios"**
6. Todos los precios copiados a barcos destino

**Útil para:**
- Crear barcos similares con mismo precio
- Desplegar cambios de precios en toda la flota
- Actualizar múltiples barcos a la vez

### Gestionar Costos de Extras de Paquete

Los costos de extras de paquete se configuran por empresa:

1. Ve a **Settings** → **Configuración de Empresa**
2. Encuentra sección **"Configuración de Paquete"**
3. Establece costos por persona:
   - **Costo de bebidas por persona**: €X por persona
   - **Costo de comida por persona**: €Y por persona
4. Guarda cambios

**Cómo funcionan los extras:**
- Cuando reserva con paquete "bebidas": costo_bebidas × pasajeros sumado al total
- Cuando reserva con paquete "comida": costo_comida × pasajeros sumado al total
- Cuando reserva con paquete "premium": (bebidas + comida) × pasajeros sumado

### Rastreo de Comisión

**Para Agentes de Ventas:**

La comisión se calcula automáticamente cuando creas una reserva:
- **Comisión Porcentaje**: % fijo del precio de reserva
- **Comisión Fija**: Monto fijo por reserva
- **Combinada**: Ambas aplicadas juntas

**Ejemplo:**
- Agente tiene: Comisión 10% + €5 fijo
- Precio de reserva: €400
- Comisión ganada: (€400 × 10%) + €5 = €45

**Ver Comisión:**
1. Ve a página **Agents**
2. Cada fila de agente muestra "Comisión Pendiente"
3. Haz clic en nombre de agente para breakdown detallado
4. Ve todas las reservas y comisiones ganadas

---

## Procesamiento de Pagos

### Comprender Estado de Pago

Las reservas tienen rastreo de pago:

| Estado | Significado | Acción Siguiente |
|--------|-----------|-------------|
| **Pendiente** | Pago aún no recibido | Enviar enlace de pago al cliente |
| **Parcial** | Algunos pago recibido | Cobrar monto restante |
| **Pagado** | Pago completo recibido | Listo para confirmación |
| **Reembolsado** | Reembolso de cliente procesado | Reserva archivada |
| **Cancelado** | Reserva cancelada, reembolso emitido | N/A |

### Registrar un Pago Manual

1. Ve a página **Payments**
2. Encuentra reserva en lista "Pagos Pendientes"
3. Haz clic en botón **"Registrar Pago"**
4. Ingresa detalles de pago:
   - **Método de Pago**:
     - Efectivo
     - Tarjeta de Crédito/Débito
     - Transferencia Bancaria
     - Otro
   - **Monto Pagado**: €X
   - **Referencia de Transacción**: Número de factura o ID de recibo
   - **Fecha de Pago**: Cuándo se recibió pago
   - **Notas**: Información adicional
5. Haz clic en **"Guardar Pago"**
6. El estado de la reserva se actualiza a "Pagado"
7. Correo de recibo enviado al cliente

**Métodos de Pago:**
- **Efectivo**: Pago en persona
- **Tarjeta**: Cliente pagó mediante terminal de tarjeta
- **Transferencia**: Cliente hizo transferencia bancaria
- **Otro**: Cheque, crédito, tarjeta de regalo, etc.

### Enviar Enlaces de Pago a Clientes

Para solicitar pago vía Stripe:

1. Abre página de detalle de reserva
2. Haz clic en botón **"Enviar Enlace de Pago"**
3. Se envía correo al cliente con:
   - Enlace a página de pago de Stripe
   - Monto adeudado
   - Detalles de reserva
   - Expiración de 30 días en enlace
4. Cliente hace clic en enlace, ingresa detalles de tarjeta
5. Pago procesado automáticamente
6. Recibes notificación cuando se paga
7. El estado de la reserva se actualiza a "Pagado"

**Limitaciones de Pago de Stripe:**
- Tarifa 2.9% + €0.30 por transacción
- Tarjetas internacionales soportadas
- 3D Secure para prevención de fraude
- Confirmación en tiempo real

**Alternativa: Registro Manual de Pago**
- Sin tarifas para efectivo/transferencia
- Confirmación mismo día
- Requiere número de referencia

### Reembolsos y Cancelaciones

Cuando se cancela reserva:

1. Abre página de detalle de reserva
2. Haz clic en botón **"Cancelar Reserva"**
3. Sistema calcula monto del reembolso:
   - Basado en política de cancelación
   - Basado en días hasta fecha del charter
   - Muestra porcentaje y monto
4. Confirma cancelación
5. El reembolso se calcula y registra
6. Si se pagó por Stripe: Reembolso automático emitido
7. Si se pagó efectivo/transferencia: Reembolso manual registrado

**Programación de Reembolso (Ejemplo):**
- **7+ días antes del charter**: Reembolso 100% (menos cualquier tarifa de plataforma)
- **3-6 días antes del charter**: Reembolso 50%
- **1-2 días antes del charter**: Reembolso 0% (no reembolsable)
- **Día del charter**: Reembolso 0%

**Nota:** Modifica programación de reembolso en **Settings** → **Políticas de Cancelación**

---

## Portal del Cliente

### Compartir una Reserva con Cliente

NaviBook proporciona enlaces seguros y compartibles para que los clientes puedan:
- Ver detalles de reserva
- Solicitar cambios
- Hacer pagos
- Verificar pronóstico del tiempo

**Para generar un enlace compartible:**

1. Abre página de detalle de reserva
2. Haz clic en botón **"Compartir con Cliente"**
3. Se genera un enlace seguro único
4. Copia enlace (aparece en pop-up)
5. Envía enlace al cliente vía:
   - Correo electrónico
   - WhatsApp
   - SMS
   - Otro mensajería
6. El enlace permanece activo por 30 días

### Qué Pueden Hacer los Clientes

**En el Portal del Cliente:**

1. **Ver Detalles de Reserva**
   - Fecha, hora, duración, barco
   - Nombres del capitán y tripulación
   - Número de pasajeros
   - Solicitudes especiales
   - Breakdown de precios
   - Pronóstico del tiempo para día del charter

2. **Solicitar Cambios**
   - Solicitar fecha/hora diferente
   - Solicitar paquete diferente
   - Solicitar número diferente de pasajeros
   - Enviar solicitudes/notas especiales
   - La solicitud se envía al personal de oficina para aprobación

3. **Hacer Pago**
   - Haz clic en botón "Pagar Ahora"
   - Paga de forma segura vía Stripe
   - Obtén recibo inmediatamente
   - Reserva se auto-confirma cuando se paga

4. **Ver Clima**
   - Pronóstico marino en tiempo real
   - Viento, olas, visibilidad
   - Recomendaciones de seguridad
   - Alertas de clima si condiciones pobres

### Procesar Solicitudes de Cambio

Cuando cliente presenta solicitud de cambio:

1. Recibes notificación
2. Ve a **Reservas** → sección **Solicitudes de Cambio**
3. Revisa cambio solicitado
4. Opciones:
   - **Aprobar**: Acepta cambio, confirma con cliente
   - **Rechazar**: Declina cambio, explica razón al cliente
   - **Modificar**: Ofrece cambio diferente
5. Haz clic en acción, notifica cliente
6. Reserva se actualiza y confirmación se envía

---

## Reportes y Análisis

### Descripción General del Dashboard (Admin/Gestor)

El dashboard principal muestra:

**Métricas Clave:**
- **Barcos Activos**: Cuántos barcos disponibles para reservar
- **Tours de Hoy**: Número de charters pasando ahora
- **Pagos Pendientes**: Ingresos totales esperando pago
- **Ingresos Este Mes**: Ingreso total del año a la fecha

**Estadísticas Rápidas:**
- Ingresos por agente (gráfico de barras)
- Reservas por estado (gráfico de pastel)
- Charters próximos (próximos 7 días)
- Desempeño del equipo (ventas, ingresos, comisión)

### Reportes de Ingresos

1. Ve a página **Reports**
2. Selecciona rango de fechas:
   - Preestablecido: Este mes, Mes pasado, Este año, Todo el tiempo
   - Personalizado: Elige fecha inicio y fin
3. Ve reportes:

**Resumen de Ingresos**
- Ingresos totales para período
- Costo total (tarifas de capitán, marinero, combustible)
- Ganancia neta
- Valor promedio de reserva

**Ingresos por Agente**
- Cada agente muestra:
  - Reservas creadas
  - Ingresos totales
  - Comisión adeudada
- Ordenable por cualquier columna
- Haz clic en agente para drill-down

**Ingresos por Barco**
- Cada barco muestra:
  - Reservas tomadas
  - Ingresos generados
  - Tasa de ocupación
  - Ganancias por barco
- Identificar barcos con mejor/peor desempeño

**Ingresos por Duración**
- Reservas de 2h, 4h, 6h, 8h
- Volumen e ingresos por duración
- Duraciones populares

### Reportes de Estado de Reserva

- **Confirmadas**: Reservas confirmadas por cliente
- **Canceladas**: Reservas canceladas por cliente (muestra % reembolso)
- **Sin Mostrar**: Cliente no apareció
- **Completadas**: Charter terminado exitosamente
- **Pendientes**: Esperando confirmación

**Análisis:**
- Tasa de cancelación (% de reservas canceladas)
- Tasa de sin mostrar (% que no apareció)
- Tasa de completación (% que sucedió)
- Tendencia en el tiempo

### Utilización de Barco

1. Selecciona barco del menú desplegable
2. Ve para período de tiempo seleccionado:
   - Horas totales disponibles
   - Horas totales reservadas
   - Porcentaje de utilización (reservadas ÷ disponibles)
   - Ingresos por hora
   - Duraciones más populares

**Usar para:**
- Identificar barcos con bajo rendimiento
- Planificar mantenimiento durante períodos de bajo reserva
- Ajustar precios basado en demanda
- Retirar barcos sin usar

### Reportes de Desempeño de Agentes

Ve métricas de cada agente:
- **Reservas creadas**: Total de reservas
- **Ingresos totales generados**: Suma de precios de reserva
- **Comisión adeudada**: Calculada según configuración
- **Valor promedio de reserva**: Ingresos ÷ reservas
- **Tasa de cancelación**: % de sus reservas canceladas

**Usar para:**
- Evaluar desempeño de agente
- Ajustar estructura de comisión
- Identificar top performers
- Planificar necesidades de capacitación

### Exportar Reportes

Para exportar datos de reporte:

1. Genera reporte con rango de fechas y filtros
2. Haz clic en botón **"Exportar a CSV"**
3. Archivo descarga a tu computadora
4. Abre en Excel, Google Sheets, etc.
5. Usa para análisis posterior, presentaciones, o registros

---

## Gestión de Flota de Barcos

### Agregar un Nuevo Barco

1. Ve a página **Fleet**
2. Haz clic en botón **"+ Agregar Nuevo Barco"**
3. Completa detalles del barco:

**Información Básica:**
- **Nombre**: Nombre único del barco (requerido)
- **Tipo**: Velero, Lancha Motora, o Jet Ski (requerido)
- **Capacidad**: Máximo de pasajeros (requerido)
- **Descripción**: Características, comodidades, notas (opcional)
- **Imagen**: Cargar foto de barco (opcional)

**Operaciones:**
- **Capitán Predeterminado**: Pre-selecciona capitán usual (opcional)
- **Estado**: Activo (puede ser reservado) o Inactivo
- **Consumo de Combustible**:
  - Para lanchas: Litros por hora
  - Para veleros: Tasa fija (cuenta para uso de motor)
  - Para jet skis: Consumo por hora

4. Haz clic en **"Crear Barco"**
5. Barco aparece en lista de Flota
6. Listo para aceptar reservas

### Editar Información de Barco

1. Ve a página **Fleet**
2. Encuentra barco en lista
3. Haz clic en **"Editar"** (icono de lápiz)
4. Modifica cualquier campo:
   - Nombre, tipo, capacidad
   - Descripción o características
   - Capitán predeterminado
   - Estado activo/inactivo
   - Tasas de consumo de combustible
5. Haz clic en **"Guardar Cambios"**

### Configurar Consumo de Combustible

Cada barco tiene rastreo de combustible para cálculos de costo:

1. Ve a página **Fleet**
2. Haz clic en nombre de barco para abrir detalle
3. Haz clic en sección **"Configuración de Combustible"**
4. Ingresa:
   - **Tasa de Consumo**: Litros por hora
   - **Precio de Combustible**: €/litro
5. Haz clic en **"Guardar Configuración"**

**Cálculo de Costo de Combustible:**
- Costo = Tasa de Consumo × Horas de Duración × Precio/Litro
- Ejemplo: 20L/h × 4 horas × €1.50/L = €120 costo de combustible
- Muestra en breakdown de costo de reserva
- Ayuda a identificar rentabilidad verdadera

### Establecer Capitán Predeterminado

Para pre-asignar un capitán a un barco:

1. Ve a página **Fleet**
2. Haz clic en barco para editar
3. Encuentra campo **"Capitán Predeterminado"**
4. Selecciona capitán del menú desplegable
5. Guarda cambios

**Cuando capitán predeterminado asignado:**
- Nuevas reservas auto-sugieren este capitán
- Puede anularse para reservas específicas
- Útil para barcos que capitán usualmente trabaja con

### Activar/Desactivar Barcos

**Para desactivar barco (remover de reservas):**

1. Ve a página **Fleet**
2. Haz clic en **"Editar"** en barco
3. Desmarca **"Estado Activo"**
4. Haz clic en **"Guardar Cambios"**
5. Barco ya no aparece en menús desplegables de reserva
6. Reservas existentes no afectadas

**Para reactivar barco:**

1. Ve a página **Fleet**
2. Haz clic en **"Editar"** en barco
3. Marca **"Estado Activo"**
4. Haz clic en **"Guardar Cambios"**
5. Barco disponible para reservas nuevamente

### Eliminar un Barco

Solo disponible si barco NO tiene reservas:

1. Ve a página **Fleet**
2. Haz clic en **"Editar"** en barco
3. Haz clic en botón **"Eliminar Barco"** al fondo
4. Confirma eliminación
5. Barco eliminado permanentemente (solo si sin reservas)

**Si barco tiene reservas:**
- No puede eliminar directamente
- Desactiva barco en su lugar
- Mantén datos para registros históricos

---

## Configuración del Sistema

### Configuración de Empresa (Solo Admin)

1. Ve a **Settings** → **Configuración de Empresa**
2. Configura:

**Información Básica:**
- **Nombre de Empresa**: Nombre de tu negocio
- **Descripción**: Acerca de tu empresa
- **Website**: Enlace a sitio web (opcional)

**Ubicación:**
- **Dirección**: Dirección de negocio
- **Ciudad y País**: Para características basadas en ubicación
- **Coordenadas**: Auto-establecidas para servicios de clima

**Información de Contacto:**
- **Teléfono**: Teléfono principal del negocio
- **Correo**: Correo de negocio para notificaciones
- **Correo de Soporte**: Contacto de soporte del cliente

**Tipos de Paquete:**
- **Paquetes disponibles**: Solo charter, con bebidas, con comida, con instrucción, con servicio premium
- **Habilitar/deshabilitar** paquetes por empresa

**Precios de Extras:**
- **Bebidas por persona**: €X cuando se selecciona paquete "bebidas"
- **Comida por persona**: €Y cuando se selecciona paquete "comida"
- Se suma automáticamente al total de reserva

### Políticas de Cancelación (Solo Admin)

Define porcentajes de reembolso según tiempo de cancelación:

1. Ve a **Settings** → **Políticas de Cancelación**
2. Edita política:

**Programación de Reembolso:**
- **7+ días antes**: X% reembolso
- **3-6 días antes**: X% reembolso
- **1-2 días antes**: X% reembolso
- **Día de/después**: X% reembolso (típicamente 0%)

**Ejemplo de Política:**
- 7+ días: Reembolso 100% (menos tarifas de plataforma)
- 3-6 días: Reembolso 50%
- 1-2 días: Reembolso 25%
- Día de: Reembolso 0% (no reembolsable)

3. Haz clic en **"Guardar Política"**
4. Se aplica automáticamente cuando cancelas reservas
5. Muestra monto de reembolso antes de confirmar cancelación

### Preferencias de Notificación

Habilita/deshabilita tipos de notificación:

1. Ve a página **Notifications**
2. Para cada tipo de evento, alterna:
   - ☐ Notificaciones por correo
   - ☐ Notificaciones SMS (si habilitadas)
   - ☐ Notificaciones en-app

**Eventos de Notificación:**
- Confirmación de reserva
- Recordatorio de pago (24h antes)
- Notificación de cancelación
- Pago recibido
- Solicitud de cambio recibida
- Notificaciones de agente/tripulación

---

## Guía de Aplicación Móvil

### Instalación

**iOS (Apple):**
1. Abre Safari
2. Ve a `https://navibook.com`
3. Toca botón Compartir (abajo)
4. Selecciona "Agregar a Pantalla de Inicio"
5. Nombra la app, toca "Agregar"
6. Icono de app aparece en pantalla de inicio

**Android (Google):**
1. Abre Chrome
2. Ve a `https://navibook.com`
3. Toca menú (⋮)
4. Selecciona "Instalar app" o "Agregar a Pantalla de Inicio"
5. Confirma instalación
6. La app aparece en cajón de apps

### Navegación

**Navegación Inferior (Móvil):**
- **Inicio**: Dashboard/acciones rápidas
- **Calendario**: Línea de tiempo visual de reservas
- **Reservas**: Lista de tus reservas
- **Clientes**: Búsqueda de cliente
- **Menú**: Páginas adicionales

### Vista de Tripulación (Capitanes y Marineros)

**Pestaña "Mis Reservas":**
- Muestra todos los charters asignados próximos
- Toca charter para ver detalles:
  - Fecha, hora, duración
  - Nombre y tipo de barco
  - Cantidad de pasajeros
  - Tu tarifa para este charter
  - Solicitudes especiales
  - Capitán/tripulación asignados
- Puedes ver charters pasados y ganancias

**Dashboard:**
- Estadísticas rápidas de ganancias
- Ganancias de este mes
- Asignaciones próximas
- Fecha de último pago

### Vista de Agente (Ventas)

**Pestaña Quick Book:**
- Formulario simplificado para entrada rápida
- Selecciona barco → fecha/hora → duración
- Ingresa info de cliente → confirma
- Sin campos complejos, solo lo esencial

**Calendario:**
- Línea de tiempo visual de todos los barcos
- Ve disponibilidad de un vistazo
- Toca slot de tiempo para crear reserva
- Arrastra para reprogramar si es necesario

**Reservas:**
- Tus reservas creadas
- Ordena por fecha o estado
- Toca para ver/editar detalles
- Envío de enlace de pago de un clic

### Características Móviles

**Diseño Responsivo:**
- Se ajusta automáticamente al tamaño de pantalla
- Una sola columna en teléfonos pequeños
- Botones más grandes para toque
- Scroll optimizado

**Soporte Offline:**
- Ve datos en caché offline
- Crea reservas (sincroniza cuando estés online)
- Ve reservas pasadas
- Limitado sin internet

**Notificaciones:**
- Notificaciones push para asignaciones
- Actualizaciones de estado de pago
- Recordatorios de reserva
- Mensajes del equipo

---

## Solución de Problemas

### Problemas de Inicio de Sesión

**Problema: No puedo iniciar sesión**

1. Verifica nombre de usuario (correo) sea correcto
2. Verifica contraseña:
   - Las contraseñas distinguen mayúsculas y minúsculas
   - Sin espacios al inicio/final
3. Intenta restablecer contraseña:
   - Haz clic en "Forgot Password" (Olvidé mi contraseña) en página de inicio de sesión
   - Ingresa correo
   - Verifica correo para enlace de restablecimiento
   - Haz clic en enlace para establecer contraseña nueva
4. Verifica navegador:
   - Borra cookies para navibook.com
   - Intenta navegador diferente (Chrome, Firefox, Safari)
   - Deshabilita extensiones del navegador
5. Si aún hay problemas:
   - Contacta admin con dirección de correo
   - Admin puede restablecer contraseña manualmente

**Problema: Cuenta bloqueada después de intentos fallidos de inicio de sesión**
- Espera 15 minutos, intenta nuevamente
- O restablece contraseña vía correo
- Contacta admin si persiste

### Problemas de Reserva

**Problema: Barco aparece no disponible pero no debería estarlo**

1. Verifica fechas cuidadosamente:
   - La fecha podría estar bloqueada por mantenimiento
   - El slot de tiempo podría superponerse con reserva existente
   - Verifica calendario para indicadores de color
2. Verifica disponibilidad de capitán:
   - El capitán seleccionado podría estar asignado en otro lugar
   - Intenta capitán diferente o déjalo sin asignar
3. Verifica slots bloqueados:
   - Ve a página **Blocked Slots**
   - Busca bloques de mantenimiento en esa fecha
   - Contacta admin para eliminar si es error
4. Intenta hora diferente:
   - Hora más temprana o más tarde podría estar disponible
   - Verifica incrementos de 15 minutos si disponible

**Problema: Retención expirada, reserva no confirmó**

1. Las retenciones de 15 minutos expiran automáticamente
2. Para re-reservar:
   - Ve a **Quick Book** nuevamente
   - Crea nueva reserva con mismos detalles
   - Completa pago prontamente
3. Para extender retención:
   - Contacta cliente
   - Reenvía enlace de pago
   - Confirma pago antes de que expire retención

**Problema: Información de cliente no se guardará**

1. Verifica todos los campos requeridos completados:
   - Nombre, apellido, correo
   - Correo debe ser válido (nombre@dominio.com)
   - Teléfono debe ser 10+ dígitos
2. Intenta actualizar página
3. Verifica consola del navegador para errores (F12)
4. Intenta navegador diferente
5. Contacta admin si error persiste

### Problemas de Pago

**Problema: Enlace de pago no funciona**

1. Verifica enlace no haya expirado (máximo 30 días)
2. Regenera enlace de pago:
   - Abre detalle de reserva
   - Haz clic en "Send Payment Link"
   - Se genera nuevo enlace
3. Verifica carpeta de spam de correo
4. Intenta navegador diferente
5. Verifica integración de Stripe está activa

**Problema: Cliente pagó pero reserva no se actualiza**

1. Verifica pago en página **Payments**:
   - Podría tomar 1-2 minutos para sincronizar
   - Actualiza página para ver cambios
2. Si usas Stripe:
   - Verifica panel de Stripe para transacción
   - Podría tomar hasta 5 minutos para procesar
3. Registro manual de pago:
   - Registra pago manualmente en sistema
   - Anota referencia de transacción
   - Reserva se actualiza inmediatamente

**Problema: Reembolso no procesado**

1. Verifica estado de reserva sea "Cancelada"
2. Para pagos de Stripe:
   - Reembolso auto-emitido a tarjeta
   - Tarda 3-5 días hábiles para aparecer
   - Verifica panel de Stripe para estado
3. Para reembolso manual:
   - Registra reembolso en sistema
   - Emite reembolso separadamente (efectivo/transferencia)
   - Mantén número de referencia

### Problemas de Asignación de Tripulación

**Problema: No puedo encontrar capitán para asignar**

1. Verifica capitán sea activo (no archivado)
2. Verifica capitán no ya está reservado:
   - Ve a **My Bookings** del capitán (si puedes)
   - O verifica vista de calendario
3. Verifica rol de capitán:
   - Ve a página **Agents**
   - Confirma persona tiene rol "Captain"
4. Filtra menú desplegable:
   - Escribe parte del nombre del capitán
   - Menú desplegable filtra mientras escribes
5. Crea nuevo capitán:
   - Si capitán no existe, agrégalo desde página **Agents**

**Problema: Marinero no se agregará a reserva**

1. Verifica marinero sea activo (no archivado)
2. Verifica marinero no ya asignado:
   - Marinero puede trabajar múltiples charters si tiempos no se superponen
   - Verifica calendario para conflictos
3. Verifica rol sea "Sailor":
   - Ve a página **Agents**
   - Confirma rol correcto asignado
4. Agregar nuevo marinero:
   - Haz clic en **+ Add Sailor**
   - Busca por nombre
   - Debe existir en sistema primero
5. Si marinero sigue desapareciendo:
   - Guarda reserva y re-edita
   - Verifica errores del sistema

### Problemas de Reporte

**Problema: Reportes muestran cero datos**

1. Verifica rango de fechas:
   - Podría necesitar ajustar fechas inicio/fin
   - "Este mes" solo muestra mes actual
   - Selecciona rango más amplio para ver más datos
2. Verifica filtros de reserva:
   - Podría estar filtrado por agente o barco
   - Elimina filtros para ver todos los datos
3. Verifica reservas existan:
   - Ve a página **Bookings**
   - Verifica reservas existan en sistema
   - Reportes extraen de reservas reales
4. Actualiza navegador:
   - F5 o Cmd+R
   - Borra caché si es necesario

**Problema: Archivo de exportación está vacío**

1. Asegúrate reporte tenga datos antes de exportar:
   - Verifica filtros no sean demasiado restrictivos
   - Ajusta rango de fechas si es necesario
2. Intenta exportar nuevamente:
   - A veces los archivos tardan en generarse
   - Reintenta exportar
3. Verifica carpeta de descargas del navegador:
   - El archivo podría haberse descargado sin notificación
   - Verifica carpeta Descargas para archivo CSV
4. Intenta navegador diferente:
   - Algunos navegadores bloquean descargas por defecto
   - Se recomienda Chrome o Firefox

### Problemas de Desempeño

**Problema: App es lenta o entrecortada**

1. Verifica conexión a Internet:
   - Prueba en speedtest.net
   - Necesitas mínimo 5Mbps
   - WiFi más rápido que datos móviles
2. Verifica recursos del dispositivo:
   - Cierra otras apps/pestañas del navegador
   - Reinicia teléfono si es necesario
   - Actualiza SO del móvil
3. Borra caché del navegador:
   - Chrome: Settings → Clear browsing data
   - Firefox: Settings → Clear data
4. Intenta navegador diferente:
   - Cambia entre Chrome, Firefox, Safari
   - Opciones de navegador ligero
5. Verifica actualizaciones de app:
   - Las actualizaciones incluyen mejoras de desempeño
   - Reinstala app si es necesario

**Problema: Los botones no responden**

1. Espera un momento:
   - Las solicitudes de red toman tiempo
   - No hagas doble clic en botones
2. Actualiza página:
   - F5 o Cmd+R
   - Actualización completa (Ctrl+Shift+R)
3. Verifica conexión a Internet:
   - Los botones no funcionarán sin conexión
   - Muévete a área con WiFi
4. Cierra sesión e inicia sesión nuevamente:
   - Ve a **Settings** → **Log Out**
   - Inicia sesión con credenciales
5. Borra caché del navegador (ver sección Desempeño)

### Problemas de Datos

**Problema: Las reservas desaparecieron**

1. Verifica filtros de estado:
   - Podría estar filtrado para mostrar solo "confirmadas"
   - Verifica todos los estados incluidos
2. Verifica rango de fechas:
   - Podría estar filtrado por fecha
   - Establece rango de fechas para incluir reserva
3. Verifica permisos de rol:
   - Los agentes solo ven sus propias reservas
   - Los admins ven todas las reservas
   - Verifica tu rol
4. Verifica aislamiento de empresa:
   - Las reservas de diferentes empresas no se muestran
   - Verifica estés en cuenta correcta de empresa
5. Contacta admin:
   - Si la reserva debería existir pero no aparece
   - El admin puede verificar logs de base de datos

**Problema: Comisión no se calcula**

1. Verifica comisión esté establecida:
   - Ve a **Agents** → Editar agente
   - Verifica comisión % o cantidad fija esté establecida
   - No establecido a 0%
2. Verifica reserva sea creada por agente:
   - Las reservas creadas por admin no generan comisión
   - Solo reservas creadas por agente activan comisión
3. Verifica reserva esté confirmada:
   - Las reservas pendientes no cuentan
   - Debe estar confirmada/pagada
4. Espera cálculo:
   - Tarda hasta 1 hora para que comisión aparezca
   - Actualiza dashboard después de esperar
5. Verifica en **Reports**:
   - El reporte de desempeño del agente muestra comisión detallada
   - Verifica que los montos sean correctos allí

### Contactar Soporte

Si los problemas persisten:

1. **Documenta el problema:**
   - Captura de pantalla del error (Print Screen)
   - Anota pasos exactos para reproducir
   - Registra hora y fecha ocurrió
   - Copia cualquier mensaje de error

2. **Contacta admin:**
   - Correo: admin@tuempresa.com
   - Teléfono: Teléfono de tu empresa
   - In-app: Botón Ayuda (esquina inferior derecha)

3. **Proporciona información:**
   - Tu nombre de usuario/correo
   - En qué página estabas
   - Qué intentabas hacer
   - El mensaje de error (si alguno)
   - Captura de pantalla del error

4. **Tiempo de respuesta:**
   - Problemas críticos: 1 hora
   - Alta prioridad: 4 horas
   - Estándar: 24 horas
   - Admin te contactará con actualizaciones

---

## Apéndice: Atajos de Teclado

### Navegación de Escritorio

| Atajo | Acción |
|----------|--------|
| `Ctrl/Cmd + B` | Ir a Reservas |
| `Ctrl/Cmd + Q` | Ir a Quick Book |
| `Ctrl/Cmd + K` | Abrir paleta de comandos |
| `Ctrl/Cmd + /` | Mostrar menú de ayuda |
| `Esc` | Cerrar diálogos |
| `Enter` | Enviar formularios |

### Vista de Calendario

| Atajo | Acción |
|----------|--------|
| `←` `→` | Mes anterior/siguiente |
| `Today` | Saltar a fecha actual |
| `T` | Cambiar a hoy |
| `M` | Vista de mes |
| `W` | Vista de semana |

### Diálogos

| Atajo | Acción |
|----------|--------|
| `Esc` | Cancelar/cerrar |
| `Enter` | Confirmar/enviar |
| `Tab` | Campo siguiente |
| `Shift+Tab` | Campo anterior |

---

## Apéndice: Términos Comunes

| Término | Significado |
|--------|-----------|
| **Charter** | Una reserva de alquiler de barco |
| **Retención** | Reserva de 15 minutos previniendo doble reserva |
| **Confirmada** | Pago recibido, reserva asegurada |
| **Tripulación** | Capitán y/o marineros asignados a reserva |
| **Comisión** | Pago a agente por crear reserva |
| **Reembolso** | Dinero devuelto a cliente por cancelación |
| **Sin Mostrar** | Cliente no apareció para charter reservado |
| **Depósito** | Pago adeudado por adelantado antes del charter |
| **Paquete** | Extras como bebidas o servicio de comida |
| **RLS** | Row-Level Security (control de acceso a base de datos) |
| **Portal** | Sitio web de autoservicio del cliente |
| **Webhook** | Notificación automática desde Stripe |

---

## Apéndice: FAQ

**P: ¿Cuánto tiempo dura una retención de reserva?**
R: 15 minutos. Después de eso, si no se confirma, el slot de tiempo abre para otros usuarios.

**P: ¿Pueden los clientes modificar sus reservas?**
R: Sí, vía el portal del cliente. Pueden solicitar cambios de fecha/hora. El admin aprueba/rechaza.

**P: ¿Qué sucede si un capitán cancela?**
R: Archívalo (establece inactivo). Se quedan en el sistema para registros históricos. Reasigna sus charters próximos a capitán diferente.

**P: ¿Puedo crear reservas en el pasado?**
R: No. Solo puedes reservar fechas futuras. Las reservas pasadas no pueden crearse.

**P: ¿Cómo hago backup de mis datos?**
R: Supabase hace backup automáticamente diariamente. Contacta al admin para exportaciones manuales.

**P: ¿Qué si un cliente pierde su enlace del portal?**
R: Genera nuevo enlace compartible desde la página de detalle de reserva. El enlace antiguo aún funciona.

**P: ¿Pueden los vendedores ver las reservas de otros vendedores?**
R: No. Los agentes solo ven reservas que crearon. Los admins ven todo.

**P: ¿Cómo puedo ajustar precios después de reservar?**
R: Edita el detalle de la reserva y ajusta el precio manualmente. Se envía confirmación al cliente.

**P: ¿Qué navegadores están soportados?**
R: Chrome, Firefox, Safari, Edge (versiones recientes). Navegadores móviles: Safari (iOS), Chrome (Android).

---

**Fin del Manual Completo del Usuario**

Para ayuda adicional, contacta a tu administrador del sistema o visita el portal de soporte.

Última Actualización: Diciembre 2025
Versión: 1.0

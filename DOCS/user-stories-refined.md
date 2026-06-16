# User Stories Refined — Sistema de Gestión de Tickets

> Documento refinado a partir de `user-stories-manual.md`.
> Incluye: prompt de generación, propuesta de tabla `Historico_gestion`, propuesta de arquitectura y puntos débiles identificados.

---

## 1. PROMPT DE GENERACIÓN — BACKEND (Node.js)

```
Actúa como Arquitecto de Software Senior para generar un proyecto Backend completo
en Node.js + Express.js + TypeORM para un sistema de gestión de tickets.

=== STACK TÉCNICO ===
- Runtime: Node.js 20 LTS
- Framework: Express.js
- ORM: TypeORM
- Base de datos: PostgreSQL
- Autenticación: JWT (algoritmo RS256, llave pública/privada)
- Documentación: Swagger (OpenAPI 3.0)
- Logs: Winston + política de rotación diaria (un archivo por día)
- Testing: Jest + Supertest
- Contenedores: Docker + Docker Compose

=== ARQUITECTURA ===
El proyecto debe seguir Spec Driven Development (SDD) con la siguiente estructura
de capas por módulo:

src/
├── config/               # Variables de entorno, conexión DB, JWT, CORS
├── modules/
│   ├── auth/
│   │   ├── auth.spec.ts          # Especificación del módulo
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── auth.routes.ts
│   │   └── auth.dto.ts
│   ├── users/
│   │   ├── users.spec.ts
│   │   ├── users.controller.ts
│   │   ├── users.service.ts
│   │   ├── users.routes.ts
│   │   └── users.dto.ts
│   ├── roles/
│   │   └── ... (misma estructura)
│   ├── tickets/
│   │   └── ... (misma estructura)
│   └── historico/
│       └── ... (misma estructura)
├── entities/             # Entidades TypeORM (mapeo directo a tablas)
├── migrations/           # Migraciones iniciales autogeneradas
├── seeders/              # Carga de datos iniciales (roles + usuario admin)
├── middlewares/
│   ├── auth.middleware.ts        # Validación JWT en rutas protegidas
│   ├── roles.middleware.ts       # Guard de roles por endpoint
│   ├── validate.middleware.ts    # Validación de DTOs con class-validator
│   └── error.middleware.ts       # Manejo centralizado de errores (último middleware)
├── shared/
│   ├── errors/           # Clases de error personalizadas y catálogo de códigos
│   │   ├── AppError.ts           # Clase base de error
│   │   ├── error-codes.ts        # Catálogo de códigos ERR por módulo
│   │   └── index.ts
│   ├── logger/           # Configuración Winston
│   ├── utils/            # Helpers reutilizables
│   └── types/            # Tipos e interfaces globales
├── tests/                # Suite de pruebas por módulo
├── logs/                 # Directorio de logs (excluir de git)
├── docs/                 # Especificaciones SDD en markdown
├── Dockerfile
├── Dockerfile.dev
├── docker-compose.yml
├── docker-compose-dev.yml
└── .env.example

=== AUTENTICACIÓN Y AUTORIZACIÓN ===
- Algoritmo JWT: RS256 con llave pública/privada (archivos .pem configurables vía env)
- Al login exitoso, emitir DOS cookies HttpOnly:
    · access_token  — vigencia 15 minutos
    · refresh_token — vigencia 7 días, valor opaco (UUID v4), almacenado en BD
- Los endpoints /api/auth/register y /api/auth/login NO llevan middleware de autenticación
- Todos los demás endpoints deben pasar por auth.middleware.ts
- El payload del access_token debe incluir: { sub: user_id, roles: string[], iat, exp }
- Control de acceso por rol via roles.middleware.ts aplicado por ruta

REFRESH TOKEN ROTATION (obligatorio):
- El refresh_token NO es un JWT; es un token opaco (UUID v4) almacenado en la
  tabla `refresh_tokens` (ver entidad en BASE DE DATOS).
- En cada llamada a POST /api/auth/refresh:
    1. Buscar el token en la BD; si no existe o está revocado → 401 AUTH-004
    2. Si está expirado → 401 AUTH-005; marcar como revocado
    3. Si es válido:
       a. Revocar el token actual (is_revoked = true)
       b. Emitir un nuevo access_token (JWT) y un nuevo refresh_token (UUID)
       c. Persistir el nuevo refresh_token en la BD
       d. Actualizar las cookies HttpOnly
- En logout: revocar el refresh_token activo del usuario en BD y limpiar cookies
- La tabla refresh_tokens debe tener un índice en (usuario_id, is_revoked)
  para consultas eficientes

=== VARIABLES DE ENTORNO (.env.example) ===
# Base de datos
DB_HOST=
DB_PORT=5432
DB_NAME=
DB_USER=
DB_PASSWORD=

# JWT (rutas a archivos .pem)
JWT_PRIVATE_KEY_PATH=./keys/private.pem
JWT_PUBLIC_KEY_PATH=./keys/public.pem
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d

# CORS (dominios separados por coma)
CORS_ORIGINS=http://localhost:3000,https://mi-app.com

# App
PORT=3001
NODE_ENV=development

=== BASE DE DATOS — ENTIDADES ===

** Roles **
- id: UUID PK
- nombre: varchar(100)
- key: varchar(50) UNIQUE   ('ADMIN' | 'OPERATIVO')
- is_active: boolean DEFAULT true
- created_at, updated_at, deleted_at (soft delete)

** Usuario **
- id: UUID PK
- email: varchar(255) UNIQUE
- nombre: varchar(150)
- password: varchar (hash bcrypt, salt 12)
- is_active: boolean DEFAULT true
- created_at, updated_at, deleted_at (soft delete)

** UsuarioRoles (tabla pivote) **
- id: UUID PK
- usuario_id: FK -> Usuario
- rol_id: FK -> Roles
- created_at

** Tickets **
- id: UUID PK
- titulo: varchar(255)
- descripcion: text
- prioridad: enum ('baja' | 'media' | 'alta' | 'critica')
- estado: enum ('abierto' | 'en_progreso' | 'resuelto' | 'cerrado')
- creado_por: FK -> Usuario
- asignado_a: FK -> Usuario (nullable)
- created_at, updated_at, deleted_at (soft delete)

** RefreshTokens **
- id: UUID PK
- token: varchar(255) UNIQUE  (valor opaco UUID v4)
- usuario_id: FK -> Usuario
- is_revoked: boolean DEFAULT false
- expires_at: TIMESTAMPTZ
- created_at: TIMESTAMPTZ DEFAULT NOW()
- Índice compuesto en (token, is_revoked) para búsqueda rápida
- Índice en (usuario_id, is_revoked) para revocar todos los tokens de un usuario

** Historico_gestion ** (ver sección 3 de este documento para el diseño completo)

=== SEEDERS ===
1. Roles: insertar ADMIN (key='ADMIN') y GESTIONADOR (key='OPERATIVO')
2. Usuario administrador: system@app.admin / Aa123456*+ con rol ADMIN

=== ENDPOINTS ===

-- SISTEMA --
GET    /health                      Health check: verifica estado del servidor y conexión a DB
                                    Respuesta: { status:'ok'|'degraded', db:'connected'|'error',
                                                 uptime: segundos, timestamp: ISO }
                                    No requiere autenticación. Usar para probes de Docker/K8s.

-- AUTH --
POST   /api/auth/register           Registro público (sin middleware)
POST   /api/auth/login              Login, emite cookies HttpOnly (sin middleware)
POST   /api/auth/refresh            Renueva access_token; ejecuta refresh token rotation
                                    (invalida el token anterior, emite uno nuevo)
POST   /api/auth/logout             Revoca refresh_token en BD y limpia las cookies
GET    /api/auth/me                 Retorna datos del usuario autenticado (hidrata sesión frontend)

-- USUARIOS (solo ADMIN) --
GET    /api/users                   Listar con paginación (?page&limit&search)
GET    /api/users/all               Listar todos sin paginación (para selectores)
GET    /api/users/:id               Obtener usuario por ID
POST   /api/users                   Crear usuario
PUT    /api/users/:id               Actualizar usuario
DELETE /api/users/:id               Soft delete de usuario
PUT    /api/users/:id/roles         Asignar/reemplazar roles de un usuario
PUT    /api/users/:id/toggle        Habilitar / inhabilitar usuario

-- ROLES (solo ADMIN) --
GET    /api/roles                   Listar todos los roles activos
POST   /api/roles                   Crear rol
PUT    /api/roles/:id               Actualizar rol
DELETE /api/roles/:id               Soft delete de rol

-- TICKETS --
GET    /api/tickets                 Listar tickets (filtros: estado, prioridad, asignado_a + paginación)
POST   /api/tickets                 Crear ticket (solo ADMIN)
GET    /api/tickets/unassigned      Listar tickets sin usuario asignado
GET    /api/tickets/stats           Resumen: tickets por estado y por prioridad
GET    /api/tickets/:id             Obtener ticket por ID
PUT    /api/tickets/:id             Actualizar ticket
DELETE /api/tickets/:id             Soft delete (solo ADMIN)
PUT    /api/tickets/assign          Asignar uno o varios tickets a un usuario (solo ADMIN)
GET    /api/tickets/user/:userId    Tickets asignados a un usuario específico
                                    Query params: ?page=1&limit=10&estado=abierto|en_progreso|resuelto|cerrado
                                    Ordenado por created_at DESC. Paginado igual que GET /api/tickets

-- HISTORIAL --
GET    /api/tickets/:id/history     Historial de gestiones del ticket (ordenado por created_at ASC)
POST   /api/tickets/:id/history     Agregar acción al historial (GESTIONADOR y ADMIN)

=== REGLAS DE NEGOCIO ===
- Un ticket solo puede estar asignado a un usuario a la vez
- Solo el ADMIN puede crear, eliminar y asignar tickets
- Un GESTIONADOR solo puede ver y gestionar los tickets asignados a él
- Un usuario no puede reducir la prioridad de un ticket (solo escalar)
- Todo cambio de estado o prioridad debe generar una entrada automática en Historico_gestion
- El borrado es siempre lógico (deleted_at), salvo Historico_gestion que es inmutable
- La asignación de ticket genera una entrada automática en Historico_gestion

=== DOCUMENTACIÓN SWAGGER ===
- Montar en /api/docs
- Documentar payload de request y schema de respuesta para cada endpoint
- Incluir ejemplos de respuesta exitosa y de error (400, 401, 403, 404, 500)
- Incluir esquema de seguridad BearerAuth / Cookie

=== LOGS ===
- Usar Winston con transports: consola (dev) + archivo rotativo diario (prod)
- Niveles: INFO | ERROR | WARNING | DEBUG
- Archivo de log: logs/YYYY-MM-DD.log
- Incluir: timestamp, nivel, módulo, mensaje, correlationId de request

=== MANEJO DE ERRORES Y EXCEPCIONES ===

-- MODELO BASE DE RESPUESTA --

Toda respuesta de la API debe seguir estos dos contratos:

Respuesta exitosa:
{
  "success": true,
  "data": <objeto | array | null>,
  "message": "Operación exitosa",
  "meta": {                          // solo en respuestas paginadas
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  },
  "timestamp": "ISO-8601"
}

Respuesta de error (lo que recibe el cliente):
{
  "success": false,
  "errorCode": "MODULE-NNN",         // código identificador del origen del error
  "message": "Descripción legible del error",
  "details": null | [                // solo en errores de validación
    { "field": "email", "message": "El email no es válido" }
  ],
  "timestamp": "ISO-8601",
  "correlationId": "uuid-v4"         // generado por request; presente también en logs
}

IMPORTANTE: el campo 'path' (ruta del endpoint) NO se incluye en la respuesta al cliente.
Solo se registra en el archivo de log junto con el stack trace del error.

-- CATÁLOGO DE CÓDIGOS DE ERROR --

Módulo AUTH:
  AUTH-001  Credenciales inválidas (email o contraseña incorrectos)
  AUTH-002  Access token expirado
  AUTH-003  Access token inválido o malformado
  AUTH-004  Refresh token no encontrado o ya revocado
  AUTH-005  Refresh token expirado
  AUTH-006  Acceso denegado — rol insuficiente
  AUTH-007  Usuario inactivo no puede autenticarse

Módulo USER:
  USER-001  Usuario no encontrado
  USER-002  El email ya está registrado
  USER-003  Usuario inactivo
  USER-004  No se puede eliminar al usuario administrador del sistema

Módulo TICKET:
  TKT-001   Ticket no encontrado
  TKT-002   No tienes permiso para gestionar este ticket (no asignado a ti)
  TKT-003   No se puede reducir la prioridad de un ticket (solo escalar)
  TKT-004   Ticket ya cerrado — no se permiten modificaciones
  TKT-005   El ticket ya está asignado a otro usuario

Módulo HISTORIAL:
  HIST-001  El campo 'comentario' es requerido para acciones de tipo COMENTARIO
  HIST-002  Tipo de acción inválido

Módulo VALIDACIÓN (errores de DTO / input):
  VAL-001   Error de validación — ver campo 'details' para campos inválidos

Módulo SISTEMA:
  SYS-001   Error interno del servidor
  SYS-002   Base de datos no disponible
  SYS-003   Servicio temporalmente no disponible

-- CLASES DE ERROR PERSONALIZADAS (src/shared/errors/) --

// AppError.ts — clase base
class AppError extends Error {
  constructor(
    public readonly errorCode: string,
    public readonly message: string,
    public readonly httpStatus: number,
    public readonly details?: ValidationDetail[]
  ) { super(message); }
}

// Subclases específicas (misma carpeta):
class ValidationError extends AppError    // 400 — VAL-001, details con campos
class NotFoundError extends AppError      // 404 — USER-001, TKT-001, etc.
class UnauthorizedError extends AppError  // 401 — AUTH-001 al AUTH-007
class ForbiddenError extends AppError     // 403 — AUTH-006, TKT-002
class BusinessRuleError extends AppError  // 422 — TKT-003, TKT-004, HIST-001
class ConflictError extends AppError      // 409 — USER-002, TKT-005
class SystemError extends AppError        // 500 — SYS-001, SYS-002

-- USO EN SERVICIOS (obligatorio en TODOS los endpoints) --

Cada método de servicio DEBE:
1. Lanzar la subclase de AppError correspondiente según el caso de negocio.
   Nunca lanzar Error genérico desde la capa de servicio.
2. Los controllers NO hacen try/catch — dejan propagar al error.middleware.ts.
3. El error.middleware.ts (último middleware de Express) intercepta cualquier
   error y construye la respuesta con el modelo base de error.
4. Registrar en el logger todo error con nivel ERROR incluyendo:
   { correlationId, módulo, errorCode, message, path, method, stack (solo dev/debug) }
   El campo 'path' va SOLO al log, nunca al body de la respuesta.

Ejemplo de uso en servicio:
  if (!ticket) throw new NotFoundError('TKT-001', 'Ticket no encontrado');
  if (nuevaPrioridad < ticket.prioridad)
    throw new BusinessRuleError('TKT-003', 'No se puede reducir la prioridad');

-- MIDDLEWARE DE ERRORES (error.middleware.ts) --

El middleware de errores debe:
1. Distinguir instancias de AppError (errores controlados) de errores inesperados.
2. Para AppError: usar su httpStatus y errorCode directamente.
3. Para errores de TypeORM (QueryFailedError, EntityNotFoundError): mapear a
   SYS-001 con status 500 y loguear el error original completo (nunca exponerlo al cliente).
4. Para errores de validación de class-validator: mapear a VAL-001 con status 400
   y construir el array 'details' a partir de los mensajes de class-validator.
5. Agregar al response el correlationId del request (generado por middleware de request-id).
6. En producción: nunca incluir stack trace en la respuesta.
7. En development: incluir stack trace en la respuesta para facilitar debugging.

-- MIDDLEWARE DE VALIDACIÓN (validate.middleware.ts) --

Aplicar en todos los endpoints que reciben body o query params:
1. Transformar el body con plainToInstance (class-transformer).
2. Validar con validate (class-validator).
3. Si hay errores: lanzar ValidationError('VAL-001', 'Error de validación', 400, details).
4. Si no hay errores: hacer next().

-- CORRELACIÓN DE REQUESTS --

Agregar middleware request-id al inicio del pipeline de Express:
- Generar un UUID v4 por cada request entrante.
- Adjuntarlo al objeto req como req.correlationId.
- Incluirlo en todos los logs generados durante el request.
- Retornarlo al cliente en la respuesta como header X-Correlation-Id.

=== TESTING ===
Generar suite de pruebas con Jest + Supertest que cubra:

-- Auth --
1.  POST /api/auth/login — login exitoso: retorna cookies HttpOnly access_token y refresh_token
2.  POST /api/auth/login — credenciales incorrectas: 401 con errorCode AUTH-001
3.  POST /api/auth/refresh — token rotation: responde con nuevas cookies y el token anterior queda revocado en BD
4.  POST /api/auth/refresh — refresh token ya revocado: 401 con errorCode AUTH-004
5.  POST /api/auth/logout — revoca refresh_token en BD y limpia cookies

-- Tickets --
6.  POST /api/tickets — creación de ticket con rol ADMIN: 201 con datos del ticket
7.  PUT /api/tickets/:id — intento de reducir prioridad: 422 con errorCode TKT-003
8.  DELETE /api/tickets/:id — intento de eliminar como GESTIONADOR: 403 con errorCode AUTH-006
9.  GET /api/tickets — GESTIONADOR solo ve sus tickets asignados (no los de otros)
10. GET /api/tickets/user/:userId — retorna resultados paginados con filtro de estado

-- Historial --
11. POST /api/tickets/:id/history — GESTIONADOR agrega gestión: 201 con registro en historial
12. POST /api/tickets/:id/history — tipo COMENTARIO sin comentario: 400 con errorCode HIST-001
13. GET /api/tickets/:id/history — historial ordenado por created_at ASC

-- Usuarios --
14. PUT /api/users/:id/roles — ADMIN asigna rol a usuario: 200 con roles actualizados
15. POST /api/users — email duplicado: 409 con errorCode USER-002

-- Health --
16. GET /health — retorna { status: 'ok', db: 'connected' } sin autenticación

-- Validación --
17. POST /api/auth/register — body inválido (sin email): 400 con errorCode VAL-001 y details[]

=== DOCKER ===
- Dockerfile: imagen producción (multi-stage build, node:20-alpine)
- Dockerfile.dev: imagen desarrollo con ts-node-dev (hot reload)
- docker-compose.yml: servicios app + postgres (producción)
- docker-compose-dev.yml: servicios app + postgres + pgAdmin (desarrollo)
- Volumen nombrado para persistencia de PostgreSQL
- Health check en el servicio de base de datos
```

---

## 2. PROMPT DE GENERACIÓN — FRONTEND (React)

```
Actúa como Desarrollador Frontend Senior para crear un aplicativo en React
para el sistema de gestión de tickets descrito en el prompt Backend anterior.

=== STACK TÉCNICO ===
- React 18 + TypeScript
- Vite como bundler
- React Router v6 (rutas protegidas por rol)
- TanStack Query (React Query) para fetching y cache de datos
- React Hook Form + Zod para formularios y validación
- Axios como cliente HTTP (interceptors para refresh de token)
- Zustand para estado global de sesión (user, roles)
- Vitest + Testing Library para pruebas unitarias

=== ESTRUCTURA DEL PROYECTO ===
src/
├── assets/
├── components/
│   ├── ui/               # Componentes del Design System reutilizables
│   ├── forms/            # Formularios compartidos
│   └── layout/           # Sidebar, Topbar, ProtectedRoute, RoleGuard
├── features/
│   ├── auth/             # Login, contexto de sesión
│   ├── users/            # CRUD de usuarios (solo ADMIN)
│   ├── tickets/          # CRUD de tickets, asignación, historial
│   └── dashboard/        # Estadísticas por rol
├── hooks/                # Custom hooks (useAuth, useTickets, etc.)
├── services/             # Clientes Axios por módulo
├── store/                # Zustand stores
├── types/                # Interfaces TypeScript
├── utils/                # Helpers, formateadores
└── tests/                # Pruebas unitarias

=== VISTAS ===

1. /login
   - Formulario: email + contraseña
   - Ícono de ojo para mostrar/ocultar contraseña
   - Validación de campos con Zod
   - Manejo de error 401 con mensaje amigable

2. /dashboard  (ruta raíz post-login)
   - ADMIN: widgets con estadísticas (tickets por estado, por prioridad)
   - GESTIONADOR: resumen de sus tickets asignados

3. /tickets  (ADMIN y GESTIONADOR)
   - Tabla paginada con filtros (estado, prioridad, usuario asignado)
   - ADMIN: botón Crear ticket, Asignar ticket, Eliminar
   - GESTIONADOR: solo ve sus tickets; puede gestionar (agregar acción al historial)
   - ADMIN: modal/drawer para asignar uno o varios tickets a un usuario
     usando el endpoint GET /api/users/all como selector

4. /tickets/:id  (detalle del ticket)
   - Datos del ticket: título, descripción, prioridad, estado, asignado a
   - Sección de historial de gestiones ordenadas por fecha (created_at ASC)
   - Formulario para agregar nueva acción (solo GESTIONADOR/ADMIN)
   - ADMIN puede cambiar estado y prioridad (con validación: no reducir prioridad)

5. /users  (solo ADMIN)
   - Tabla paginada con búsqueda por nombre/email
   - Crear, editar, inhabilitar usuario
   - Asignar roles desde el mismo formulario de edición

=== MENÚ POR ROL ===
- ADMIN: Dashboard | Tickets | Usuarios
- GESTIONADOR: Dashboard | Mis Tickets

=== SEGURIDAD FRONTEND ===
- Las rutas protegidas verifican el token almacenado en cookie HttpOnly
  (no accesible desde JS; usar un endpoint /api/auth/me para hidratar la sesión)
- Interceptor Axios: en respuesta 401, intentar refresh automático; si falla → logout
- RoleGuard component para esconder elementos de UI según rol
- No almacenar token en localStorage ni sessionStorage

=== PRUEBAS UNITARIAS (Vitest + Testing Library) ===
1. Login exitoso → redirige al dashboard
2. Login fallido → muestra mensaje de error
3. Creación de ticket → aparece en la lista
4. Restricción: usuario no puede reducir prioridad → botón/opción deshabilitado
5. Restricción: opción Eliminar no visible para GESTIONADOR
6. Vista de historial muestra gestiones ordenadas
7. Asignación de ticket a usuario → ticket aparece en lista del usuario
8. Toggle visibilidad contraseña en Login
```

---

## 3. DISEÑO DE TABLA — `Historico_gestion`

### 3.1 Objetivo
Registrar de forma **inmutable** cada acción que un usuario realiza sobre un ticket:
cambios de estado, cambios de prioridad, comentarios de gestión, asignaciones y
creación del ticket. Sirve como trazabilidad de auditoría completa.

### 3.2 Estructura propuesta

```sql
CREATE TABLE historico_gestion (
    id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id        UUID        NOT NULL REFERENCES tickets(id),
    usuario_id       UUID        NOT NULL REFERENCES usuario(id),

    -- Tipo de acción realizada
    tipo_accion      VARCHAR(50) NOT NULL,
    -- Valores posibles:
    --   'CREACION'          → ticket fue creado
    --   'ASIGNACION'        → ticket fue asignado o reasignado
    --   'ESTADO_CAMBIADO'   → cambio de estado
    --   'PRIORIDAD_CAMBIADA'→ cambio de prioridad
    --   'COMENTARIO'        → nota/acción libre de gestión
    --   'CIERRE'            → ticket cerrado definitivamente

    -- Valores anteriores (nullable, aplica a cambios de estado/prioridad)
    estado_anterior     VARCHAR(50)  NULL,
    estado_nuevo        VARCHAR(50)  NULL,
    prioridad_anterior  VARCHAR(20)  NULL,
    prioridad_nueva     VARCHAR(20)  NULL,

    -- Usuario al que se asignó (nullable, aplica a tipo_accion = 'ASIGNACION')
    asignado_a_id    UUID NULL REFERENCES usuario(id),

    -- Comentario libre obligatorio para tipo_accion = 'COMENTARIO'
    comentario       TEXT NULL,

    -- Metadatos adicionales en JSON para extensibilidad futura
    -- Ej: { "ip": "192.168.1.1", "source": "web", "duracion_minutos": 30 }
    metadata         JSONB NULL,

    -- Timestamp de creación (inmutable, no hay updated_at ni deleted_at)
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices recomendados
CREATE INDEX idx_hg_ticket_id    ON historico_gestion(ticket_id);
CREATE INDEX idx_hg_usuario_id   ON historico_gestion(usuario_id);
CREATE INDEX idx_hg_created_at   ON historico_gestion(created_at DESC);
CREATE INDEX idx_hg_tipo_accion  ON historico_gestion(tipo_accion);
```

### 3.3 Entidad TypeORM

```typescript
// src/entities/HistoricoGestion.entity.ts
@Entity('historico_gestion')
export class HistoricoGestion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Ticket, { nullable: false })
  @JoinColumn({ name: 'ticket_id' })
  ticket: Ticket;

  @ManyToOne(() => Usuario, { nullable: false, eager: true })
  @JoinColumn({ name: 'usuario_id' })
  usuario: Usuario;  // quien ejecutó la acción

  @Column({ name: 'tipo_accion', length: 50 })
  tipoAccion: TipoAccionEnum;

  @Column({ name: 'estado_anterior', nullable: true })
  estadoAnterior?: string;

  @Column({ name: 'estado_nuevo', nullable: true })
  estadoNuevo?: string;

  @Column({ name: 'prioridad_anterior', nullable: true })
  prioridadAnterior?: string;

  @Column({ name: 'prioridad_nueva', nullable: true })
  prioridadNueva?: string;

  @ManyToOne(() => Usuario, { nullable: true, eager: true })
  @JoinColumn({ name: 'asignado_a_id' })
  asignadoA?: Usuario;  // a quién se asignó (solo en ASIGNACION)

  @Column({ type: 'text', nullable: true })
  comentario?: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, unknown>;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
  // NO hay updatedAt ni deletedAt — este registro es inmutable
}

export enum TipoAccionEnum {
  CREACION            = 'CREACION',
  ASIGNACION          = 'ASIGNACION',
  ESTADO_CAMBIADO     = 'ESTADO_CAMBIADO',
  PRIORIDAD_CAMBIADA  = 'PRIORIDAD_CAMBIADA',
  COMENTARIO          = 'COMENTARIO',
  CIERRE              = 'CIERRE',
}
```

### 3.4 Reglas de negocio del historial

| Evento disparador | tipo_accion | Campos relevantes |
|---|---|---|
| Ticket creado | `CREACION` | comentario: "Ticket creado" |
| Ticket asignado/reasignado | `ASIGNACION` | asignado_a_id |
| Cambio de estado | `ESTADO_CAMBIADO` | estado_anterior, estado_nuevo |
| Cambio de prioridad | `PRIORIDAD_CAMBIADA` | prioridad_anterior, prioridad_nueva |
| Acción libre del gestionador | `COMENTARIO` | comentario (requerido) |
| Ticket cerrado | `CIERRE` | estado_anterior, comentario (opcional) |

**Restricciones:**
- `Historico_gestion` es de **solo inserción** — no se permiten UPDATE ni DELETE sobre esta tabla.
- El servicio de tickets debe llamar al servicio de historial dentro de una **transacción** al actualizar el ticket.
- El campo `metadata` puede usarse para registrar IP del cliente, dispositivo o duración de la gestión sin romper el schema.

---

## 4. PROPUESTA DE ARQUITECTURA

### 4.1 Microservicio Backend

```
[ Cliente React ]
       │ HTTPS / Cookie HttpOnly
       ▼
[ API Gateway / Nginx ]  ← (opcional a futuro)
       │
       ▼
┌─────────────────────────────────┐
│   ticket-service  :3001         │
│  ┌──────────────────────────┐   │
│  │  Presentation Layer      │   │  ← Controllers, Routes, Swagger
│  │  (Express.js)            │   │
│  ├──────────────────────────┤   │
│  │  Application Layer       │   │  ← Services, DTOs, Validators
│  │  (Business Logic)        │   │
│  ├──────────────────────────┤   │
│  │  Domain Layer            │   │  ← Entities, Enums, Interfaces
│  ├──────────────────────────┤   │
│  │  Infrastructure Layer    │   │  ← TypeORM Repositories, Logger, Config
│  └──────────────────────────┘   │
└─────────────────────────────────┘
       │
       ▼
[ PostgreSQL :5432 ]
```

**Consideración de escalabilidad horizontal:**
- El microservicio no guarda estado en memoria (stateless): los tokens viajan en cookies y son verificados con la llave pública RSA.
- En el futuro puede desplegarse con múltiples réplicas detrás de un load balancer sin cambios en el código.
- La llave pública puede publicarse en un endpoint `/.well-known/jwks.json` para que otros microservicios validen tokens sin llamar a este servicio.

### 4.2 Patrón de comunicación entre módulos

```
Ticket actualizado (estado/prioridad)
        │
        ├─► TicketService.update()   [transacción]
        │         │
        │         ├─► ticket_repository.save()
        │         │
        │         └─► historicoService.registrar({
        │                   ticketId, usuarioId,
        │                   tipoAccion, ...campos anteriores/nuevos
        │             })
        │
        └─► Logger.info({ modulo: 'tickets', accion: 'UPDATE', ticketId })
```

### 4.3 Estructura de carpetas recomendada (SDD)

Cada módulo tiene su propio archivo `.spec.ts` que actúa como **contrato** antes de
implementar. El spec define:
- Endpoints que expone
- DTOs de entrada y salida
- Reglas de negocio que debe cumplir
- Casos de prueba esperados

---

## 5. PUNTOS DÉBILES IDENTIFICADOS — MEJORAS PROPUESTAS

### 5.1 Seguridad

| # | Punto débil | Impacto | Propuesta |
|---|---|---|---|
| 1 | No hay **rate limiting** en `/register` y `/login` | Alto — ataques de fuerza bruta | Agregar `express-rate-limit` con máximo 5 intentos/min por IP |
| 2 | ✅ No hay **rotación de refresh token** | Alto — si se filtra, es válido 7 días | **INCORPORADO** — Refresh token opaco (UUID) almacenado en BD; cada uso lo revoca y emite uno nuevo. Ver sección AUTENTICACIÓN del prompt. |
| 3 | No hay **blacklist de tokens** para logout | Medio — token sigue válido hasta expirar | Usar Redis para almacenar tokens revocados (TTL = expiración del token) |
| 4 | No hay **verificación de email** en el registro | Medio — cualquiera puede registrarse con email falso | Flujo de verificación vía email con token de un solo uso |
| 5 | No hay **recuperación de contraseña** | Medio — UX bloqueante para usuarios reales | Endpoint `/api/auth/forgot-password` + `/api/auth/reset-password` |

### 5.2 Arquitectura y escalabilidad

| # | Punto débil | Impacto | Propuesta |
|---|---|---|---|
| 6 | No hay **versionado de API** (`/api/v1/...`) | Medio — romper cambios afectan todos los clientes | Prefijo `/api/v1/` desde el inicio; más fácil agregar `/v2/` |
| 7 | ✅ No hay **health check endpoint** | Medio — Docker/K8s no puede monitorear el servicio | **INCORPORADO** — `GET /health` sin autenticación; retorna `{ status, db, uptime, timestamp }`. Ver sección ENDPOINTS del prompt. |
| 8 | `Historico_gestion` sin **particionado** | Bajo ahora, alto a largo plazo | Particionar la tabla por rango de `created_at` cuando el volumen sea alto |
| 9 | No hay configuración de **connection pooling** | Medio — bajo carga alta se saturan conexiones a DB | Configurar `extra: { max: 10, idleTimeoutMillis: 30000 }` en TypeORM |
| 10 | No hay **caché** para endpoints de lectura frecuente (`/stats`, `/roles`) | Bajo-medio | Redis con TTL corto (60s) para endpoints de stats y listados de roles |

### 5.3 Funcionalidad y UX

| # | Punto débil | Impacto | Propuesta |
|---|---|---|---|
| 11 | No hay **notificaciones** cuando se asigna un ticket | Alto para UX | Sistema de notificaciones: email (Nodemailer) o WebSocket (Socket.io) |
| 12 | No hay **adjuntos/archivos** en tickets | Medio — tickets reales necesitan capturas, documentos | Endpoint para upload a S3/MinIO vinculado al ticket o al historial |
| 13 | La URL del **Design System** en el prompt apunta a un endpoint privado de Anthropic | Alto — no accesible para el equipo | Extraer el Design System a un repositorio/URL accesible o exportarlo como tokens Figma/Storybook |
| 14 | No hay **auditoría de usuarios** (solo de tickets) | Medio | Agregar tabla `Historico_usuario` o un módulo de audit log para acciones de administración |
| 15 | ✅ El gestionador ve "todos sus tickets" pero no hay **paginación** definida para esa vista | Medio | **INCORPORADO** — `GET /api/tickets/user/:userId` acepta `?page&limit&estado`. Ver sección ENDPOINTS del prompt. |

### 5.4 Calidad de código y operaciones

| # | Punto débil | Impacto | Propuesta |
|---|---|---|---|
| 16 | No hay **validación centralizada de DTOs** | Alto — inputs sin validar generan errores 500 | Usar `class-validator` + `class-transformer` en todos los DTOs; middleware global de validación |
| 17 | ✅ No hay estrategia de **manejo de errores** definida | Alto | **INCORPORADO** — Modelo de respuesta de error unificado, catálogo de códigos por módulo (AUTH/USER/TKT/HIST/VAL/SYS), jerarquía de clases AppError, middleware centralizado, correlationId por request. Ver sección MANEJO DE ERRORES del prompt. |
| 18 | Los **seeders** no son idempotentes por definición explícita | Medio — doble ejecución puede fallar o duplicar | Verificar existencia antes de insertar (`findOne` antes de `save`) |
| 19 | No hay **CI/CD** definido | Medio | Agregar `.github/workflows/ci.yml` con: lint + test + build en cada PR |
| 20 | No hay **linting/formatting** | Bajo | Agregar ESLint + Prettier con reglas TypeScript estrictas; pre-commit hook con Husky |

---

## 6. RESUMEN DE DEPENDENCIAS RECOMENDADAS

### Backend
```json
{
  "dependencies": {
    "express": "^4.18",
    "typeorm": "^0.3",
    "pg": "^8",
    "bcryptjs": "^2.4",
    "jsonwebtoken": "^9",
    "class-validator": "^0.14",
    "class-transformer": "^0.5",
    "reflect-metadata": "^0.2",   // requerido por class-transformer + TypeORM
    "winston": "^3",
    "winston-daily-rotate-file": "^5",
    "swagger-ui-express": "^5",
    "express-rate-limit": "^7",
    "cookie-parser": "^1.4",
    "cors": "^2.8",
    "dotenv": "^16",
    "uuid": "^9",
    "http-status-codes": "^2.3"   // constantes de status HTTP para error classes
  },
  "devDependencies": {
    "typescript": "^5",
    "ts-node-dev": "^2",
    "jest": "^29",
    "supertest": "^6",
    "@types/express": "^4",
    "eslint": "^8",
    "prettier": "^3"
  }
}
```

### Frontend
```json
{
  "dependencies": {
    "react": "^18",
    "react-router-dom": "^6",
    "@tanstack/react-query": "^5",
    "axios": "^1",
    "zustand": "^4",
    "react-hook-form": "^7",
    "zod": "^3",
    "@hookform/resolvers": "^3"
  },
  "devDependencies": {
    "vite": "^5",
    "vitest": "^1",
    "@testing-library/react": "^14",
    "@testing-library/user-event": "^14",
    "typescript": "^5",
    "eslint": "^8",
    "prettier": "^3"
  }
}
```

---

*Documento generado el 2026-06-16. Basado en `user-stories-manual.md`.*

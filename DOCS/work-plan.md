# Plan de Implementación — Sistema de Gestión de Tickets

> Basado en `user-stories-refined.md`.
> Repositorio: monorepo con carpetas `BACK/` (Node.js) y `FRONT/` (React).
> Al finalizar cada proyecto se genera su `CLAUDE.md` con las reglas del proyecto.

---

## Estructura de carpetas objetivo

```
/
├── BACK/          ← Microservicio Backend (Node.js + Express + TypeORM)
├── FRONT/         ← Aplicativo Frontend (React + Vite)
└── DOCS/          ← Documentación y especificaciones
    ├── user-stories-manual.md
    ├── user-stories-refined.md
    └── work-plan.md  (este archivo)
```

---

## Convenciones del plan

- **[B]** — Tarea del Backend (`BACK/`)
- **[F]** — Tarea del Frontend (`FRONT/`)
- **[X]** — Tarea transversal / entregable final
- Cada fase debe completarse y verificarse antes de iniciar la siguiente.
- Las tareas marcadas con `→ test` requieren prueba de integración o unitaria.

---

## FASE 0 — Scaffolding e infraestructura base

### [B-0.1] Inicializar proyecto Backend

**Carpeta:** `BACK/`

**Pasos:**
1. `npm init -y`
2. Instalar dependencias de producción:
   ```
   express typeorm pg bcryptjs jsonwebtoken class-validator class-transformer
   reflect-metadata winston winston-daily-rotate-file swagger-ui-express
   express-rate-limit cookie-parser cors dotenv uuid http-status-codes
   ```
3. Instalar dependencias de desarrollo:
   ```
   typescript ts-node-dev jest supertest @types/express @types/bcryptjs
   @types/jsonwebtoken @types/cookie-parser @types/cors @types/uuid
   @types/supertest ts-jest eslint prettier @typescript-eslint/parser
   @typescript-eslint/eslint-plugin
   ```
4. Configurar `tsconfig.json`:
   - `target: ES2021`, `module: CommonJS`
   - `experimentalDecorators: true`, `emitDecoratorMetadata: true`
   - `strict: true`
   - `outDir: ./dist`
5. Configurar `jest.config.ts` con `ts-jest` preset
6. Configurar `.eslintrc.json` y `.prettierrc`
7. Agregar scripts en `package.json`:
   - `start`: node dist/index.js
   - `dev`: ts-node-dev --respawn src/index.ts
   - `build`: tsc
   - `test`: jest --runInBand
   - `migration:run`: typeorm migration:run
   - `seed`: ts-node src/seeders/run.ts
8. Crear `.env.example` con todas las variables definidas en el prompt
9. Crear `.gitignore`: `node_modules/`, `dist/`, `.env`, `logs/`, `keys/`

**Archivos generados:**
- `BACK/package.json`
- `BACK/tsconfig.json`
- `BACK/jest.config.ts`
- `BACK/.eslintrc.json`
- `BACK/.prettierrc`
- `BACK/.env.example`
- `BACK/.gitignore`

---

### [B-0.2] Estructura de carpetas del proyecto

Crear la estructura completa de directorios:

```
BACK/src/
├── config/
│   ├── database.config.ts
│   ├── jwt.config.ts
│   └── env.config.ts
├── modules/
│   ├── auth/
│   │   ├── auth.spec.ts
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
│   │   ├── roles.spec.ts
│   │   ├── roles.controller.ts
│   │   ├── roles.service.ts
│   │   ├── roles.routes.ts
│   │   └── roles.dto.ts
│   ├── tickets/
│   │   ├── tickets.spec.ts
│   │   ├── tickets.controller.ts
│   │   ├── tickets.service.ts
│   │   ├── tickets.routes.ts
│   │   └── tickets.dto.ts
│   └── historico/
│       ├── historico.spec.ts
│       ├── historico.controller.ts
│       ├── historico.service.ts
│       ├── historico.routes.ts
│       └── historico.dto.ts
├── entities/
│   ├── Rol.entity.ts
│   ├── Usuario.entity.ts
│   ├── UsuarioRol.entity.ts
│   ├── RefreshToken.entity.ts
│   ├── Ticket.entity.ts
│   └── HistoricoGestion.entity.ts
├── migrations/
├── seeders/
│   ├── roles.seeder.ts
│   ├── admin-user.seeder.ts
│   └── run.ts
├── middlewares/
│   ├── auth.middleware.ts
│   ├── roles.middleware.ts
│   ├── validate.middleware.ts
│   ├── request-id.middleware.ts
│   └── error.middleware.ts
├── shared/
│   ├── errors/
│   │   ├── AppError.ts
│   │   ├── error-codes.ts
│   │   └── index.ts
│   ├── logger/
│   │   └── logger.ts
│   ├── utils/
│   │   ├── response.util.ts
│   │   └── jwt.util.ts
│   └── types/
│       └── express.d.ts
├── tests/
│   ├── auth.test.ts
│   ├── tickets.test.ts
│   ├── users.test.ts
│   ├── historico.test.ts
│   └── health.test.ts
├── health/
│   └── health.routes.ts
├── app.ts
└── index.ts
```

---

### [B-0.3] Infraestructura de errores y respuestas

**Archivos a implementar:**

1. `src/shared/errors/error-codes.ts`
   - Exportar objeto con todos los códigos del catálogo (AUTH-001..007, USER-001..004,
     TKT-001..005, HIST-001..002, VAL-001, SYS-001..003)

2. `src/shared/errors/AppError.ts`
   - Clase base `AppError extends Error` con: `errorCode`, `message`, `httpStatus`, `details?`
   - Subclases: `ValidationError` (400), `UnauthorizedError` (401), `ForbiddenError` (403),
     `NotFoundError` (404), `ConflictError` (409), `BusinessRuleError` (422), `SystemError` (500)

3. `src/shared/utils/response.util.ts`
   - `successResponse(data, message?, meta?)` → estructura `{ success: true, data, message, meta?, timestamp }`
   - `errorResponse(errorCode, message, correlationId, details?)` → estructura `{ success: false, errorCode, message, details, timestamp, correlationId }`

4. `src/middlewares/request-id.middleware.ts`
   - Genera UUID v4 en cada request → `req.correlationId`
   - Agrega header `X-Correlation-Id` a la respuesta

5. `src/middlewares/error.middleware.ts`
   - Captura `AppError` → usa su `httpStatus` y `errorCode`
   - Captura `QueryFailedError` de TypeORM → mapea a SYS-001 (500), loguea el error original
   - Captura errores de `class-validator` → mapea a VAL-001 (400) con `details[]`
   - Captura cualquier otro `Error` → SYS-001 (500), loguea con `ERROR` level
   - En `development`: incluye `stack` en la respuesta; en `production`: omite
   - Loguea: `{ correlationId, errorCode, message, path, method, stack }`

6. `src/middlewares/validate.middleware.ts`
   - Factory function `validate(DtoClass)` para usar en rutas
   - Transforma body con `plainToInstance`, valida con `validate`
   - Si hay errores: lanza `ValidationError` con `details[]` construidos desde
     los `ValidationError` de class-validator

**→ test:** Verificar que errores desconocidos retornan SYS-001 sin exponer stack en producción.

---

### [B-0.4] Logger y configuración

1. `src/shared/logger/logger.ts`
   - Winston con dos transports:
     - `Console` (solo en `development`)
     - `DailyRotateFile` — archivo `logs/YYYY-MM-DD.log`
   - Formato: `{ timestamp, level, correlationId?, module?, message, ...meta }`
   - Exportar función `createLogger(module: string)` para uso por módulo

2. `src/config/env.config.ts`
   - Leer y validar todas las variables de `.env` al arrancar
   - Si falta una variable crítica (DB, JWT keys): lanzar error y detener el proceso

3. `src/config/database.config.ts`
   - Configuración TypeORM con connection pooling (`max: 10`, `idleTimeoutMillis: 30000`)
   - Soft delete habilitado globalmente
   - Registrar todas las entidades

4. `src/config/jwt.config.ts`
   - Leer llaves `.pem` desde ruta configurada en env
   - Exportar `signAccessToken(payload)` y `verifyAccessToken(token)`

---

### [F-0.1] Inicializar proyecto Frontend

**Carpeta:** `FRONT/`

**Pasos:**
1. `npm create vite@latest . -- --template react-ts`
2. Instalar dependencias de producción:
   ```
   react-router-dom @tanstack/react-query axios zustand
   react-hook-form zod @hookform/resolvers
   ```
3. Instalar dependencias de desarrollo:
   ```
   vitest @testing-library/react @testing-library/user-event
   @testing-library/jest-dom @vitest/coverage-v8
   eslint prettier @typescript-eslint/eslint-plugin
   ```
4. Configurar `vite.config.ts`:
   - Plugin React
   - `test` con jsdom environment
   - Proxy `/api` → `http://localhost:3001` (dev)
5. Configurar `.eslintrc.json` y `.prettierrc`
6. Crear `.env.example`:
   ```
   VITE_API_URL=http://localhost:3001
   ```
7. Crear `.gitignore`: `node_modules/`, `dist/`, `.env`

**Archivos generados:**
- `FRONT/package.json`, `FRONT/vite.config.ts`
- `FRONT/tsconfig.json`, `FRONT/tsconfig.node.json`
- `FRONT/.eslintrc.json`, `FRONT/.prettierrc`
- `FRONT/.env.example`, `FRONT/.gitignore`

---

### [F-0.2] Estructura de carpetas Frontend

```
FRONT/src/
├── assets/
├── components/
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Badge.tsx
│   │   ├── Table.tsx
│   │   ├── Modal.tsx
│   │   ├── Pagination.tsx
│   │   └── index.ts
│   ├── forms/
│   └── layout/
│       ├── Sidebar.tsx
│       ├── Topbar.tsx
│       ├── ProtectedRoute.tsx
│       └── RoleGuard.tsx
├── features/
│   ├── auth/
│   │   ├── LoginPage.tsx
│   │   └── auth.service.ts
│   ├── dashboard/
│   │   └── DashboardPage.tsx
│   ├── tickets/
│   │   ├── TicketsPage.tsx
│   │   ├── TicketDetailPage.tsx
│   │   ├── TicketForm.tsx
│   │   ├── AssignTicketModal.tsx
│   │   └── tickets.service.ts
│   └── users/
│       ├── UsersPage.tsx
│       ├── UserForm.tsx
│       └── users.service.ts
├── hooks/
│   ├── useAuth.ts
│   └── useRoleGuard.ts
├── services/
│   └── api.client.ts    ← instancia Axios con interceptors
├── store/
│   └── auth.store.ts    ← Zustand: user, roles, isAuthenticated
├── types/
│   ├── auth.types.ts
│   ├── ticket.types.ts
│   ├── user.types.ts
│   └── api.types.ts     ← ApiResponse<T>, ApiError, PaginatedResponse<T>
├── utils/
│   └── format.util.ts
├── tests/
│   ├── auth.test.tsx
│   ├── tickets.test.tsx
│   └── users.test.tsx
├── App.tsx
├── main.tsx
└── router.tsx
```

---

## FASE 1 — Backend: Entidades, migraciones y seeders

### [B-1.1] Implementar entidades TypeORM

Implementar en orden (por dependencias entre FK):

1. **`Rol.entity.ts`** — `id`, `nombre`, `key`, `isActive`, `createdAt`, `updatedAt`, `deletedAt`
2. **`Usuario.entity.ts`** — `id`, `email`, `nombre`, `password`, `isActive`, `createdAt`, `updatedAt`, `deletedAt`
3. **`UsuarioRol.entity.ts`** — tabla pivote: `id`, `usuarioId`, `rolId`, `createdAt`
4. **`RefreshToken.entity.ts`** — `id`, `token`, `usuarioId`, `isRevoked`, `expiresAt`, `createdAt`
   - Índice compuesto en `(token, isRevoked)`
   - Índice en `(usuarioId, isRevoked)`
5. **`Ticket.entity.ts`** — `id`, `titulo`, `descripcion`, `prioridad` (enum), `estado` (enum),
   `creadoPorId`, `asignadoAId` (nullable), `createdAt`, `updatedAt`, `deletedAt`
6. **`HistoricoGestion.entity.ts`** — diseño completo según sección 3 de `user-stories-refined.md`
   - Sin `updatedAt` ni `deletedAt` (registro inmutable)
   - Índices en `ticketId`, `usuarioId`, `createdAt DESC`, `tipoAccion`

**→ test:** Iniciar TypeORM con `synchronize: false`; verificar que las entidades cargan sin error.

---

### [B-1.2] Generar y ejecutar migraciones iniciales

1. Configurar CLI de TypeORM en `package.json` apuntando a `src/config/database.config.ts`
2. Ejecutar `typeorm migration:generate` para cada entidad
3. Revisar SQL generado y ajustar si es necesario
4. Ejecutar `migration:run` y verificar tablas en PostgreSQL

**Orden de migración:**
```
001_create_roles
002_create_usuarios
003_create_usuario_roles
004_create_refresh_tokens
005_create_tickets
006_create_historico_gestion
```

---

### [B-1.3] Seeders

1. **`roles.seeder.ts`** — Insertar idempotente (verificar existencia antes de insertar):
   - `{ nombre: 'Administrador', key: 'ADMIN', isActive: true }`
   - `{ nombre: 'Gestionador', key: 'OPERATIVO', isActive: true }`

2. **`admin-user.seeder.ts`** — Insertar idempotente:
   - `system@app.admin` / `Aa123456*+` (hash bcrypt salt 12)
   - Asignar rol `ADMIN`

3. **`run.ts`** — Orquestador que ejecuta seeders en orden

**→ test:** Ejecutar `seed` dos veces; verificar que no duplica registros.

---

## FASE 2 — Backend: Infraestructura de autenticación

### [B-2.1] Módulo Auth

**Archivos:** `src/modules/auth/`

**`auth.dto.ts`:**
- `RegisterDto`: `email` (IsEmail), `nombre` (IsString, MinLength 3), `password` (IsString, Matches regex seguridad)
- `LoginDto`: `email` (IsEmail), `password` (IsString, IsNotEmpty)

**`auth.service.ts`:**
- `register(dto)`:
  1. Verificar que el email no exista → si existe: lanzar `ConflictError('USER-002', ...)`
  2. Hashear password con bcrypt (salt 12)
  3. Crear usuario con rol público (sin rol por defecto, solo registro)
  4. Retornar usuario sin password

- `login(dto)`:
  1. Buscar usuario por email → si no existe: `UnauthorizedError('AUTH-001', ...)`
  2. Verificar `isActive` → si inactivo: `UnauthorizedError('AUTH-007', ...)`
  3. Comparar password → si no coincide: `UnauthorizedError('AUTH-001', ...)`
  4. Generar `access_token` (JWT RS256, 15min, payload: `{ sub: id, roles: [keys] }`)
  5. Generar `refresh_token` (UUID v4), persistir en `refresh_tokens` con `expiresAt = now + 7 días`
  6. Retornar `{ accessToken, refreshToken, user: { id, email, nombre, roles } }`

- `refresh(tokenOpaco)`:
  1. Buscar token en BD → si no existe o `isRevoked`: `UnauthorizedError('AUTH-004', ...)`
  2. Verificar `expiresAt` → si expirado: revocar + `UnauthorizedError('AUTH-005', ...)`
  3. Revocar token actual (`isRevoked = true`)
  4. Generar nuevo `access_token` y nuevo `refresh_token`
  5. Persistir nuevo `refresh_token` en BD
  6. Retornar `{ accessToken, refreshToken }`

- `logout(tokenOpaco)`:
  1. Revocar token en BD
  2. Retornar confirmación

- `me(userId)`: Retornar datos del usuario autenticado con sus roles

**`auth.controller.ts`:**
- Cada método llama al servicio y retorna usando `successResponse()`
- No tiene try/catch; propaga al `error.middleware.ts`
- En login y refresh: emitir cookies HttpOnly con `Secure: true` en producción

**`auth.routes.ts`:**
- `POST /api/auth/register` → `validate(RegisterDto)` → `authController.register`
- `POST /api/auth/login` → `validate(LoginDto)` → `authController.login`
- `POST /api/auth/refresh` → `authController.refresh`
- `POST /api/auth/logout` → `authMiddleware` → `authController.logout`
- `GET  /api/auth/me` → `authMiddleware` → `authController.me`

**`src/middlewares/auth.middleware.ts`:**
- Leer cookie `access_token`
- Verificar JWT con llave pública → si expirado: `UnauthorizedError('AUTH-002', ...)`
- Si inválido: `UnauthorizedError('AUTH-003', ...)`
- Adjuntar `req.user = { id, roles }` al request

**`src/middlewares/roles.middleware.ts`:**
- Factory: `requireRoles(...roles: string[])` → middleware que verifica `req.user.roles`
- Si no tiene rol requerido: `ForbiddenError('AUTH-006', ...)`

**→ test (B-2.1):**
1. Login exitoso → cookies `access_token` y `refresh_token` presentes
2. Login con email incorrecto → 401 `AUTH-001`
3. Refresh con token válido → nuevas cookies, token anterior revocado en BD
4. Refresh con token revocado → 401 `AUTH-004`
5. Logout → token revocado en BD, cookies limpiadas

---

## FASE 3 — Backend: Módulos de negocio

### [B-3.1] Módulo Roles

**`roles.dto.ts`:** `CreateRolDto` (`nombre`, `key`), `UpdateRolDto` (parcial)

**`roles.service.ts`:**
- `findAll()` — Listar roles activos (no eliminados)
- `create(dto)` — Verificar `key` única → `ConflictError` si existe
- `update(id, dto)` — `NotFoundError('USER-001')` si no existe
- `softDelete(id)` — Marcar `deletedAt`

**`roles.routes.ts`:** Todas las rutas con `authMiddleware` + `requireRoles('ADMIN')`

---

### [B-3.2] Módulo Usuarios

**`users.dto.ts`:**
- `CreateUserDto`: `email`, `nombre`, `password`
- `UpdateUserDto`: parcial de `CreateUserDto`
- `AssignRolesDto`: `roleIds: string[]`
- `PaginationQueryDto`: `page`, `limit`, `search?`

**`users.service.ts`:**
- `findPaginated(query)` — Búsqueda por nombre/email con paginación
- `findAll()` — Sin paginación (para selectores de UI)
- `findById(id)` → `NotFoundError('USER-001')` si no existe
- `create(dto)` → `ConflictError('USER-002')` si email existe
- `update(id, dto)` → verificar email único si se cambia
- `softDelete(id)` → no permitir eliminar `system@app.admin` → `BusinessRuleError('USER-004')`
- `toggle(id)` — Activar / desactivar
- `assignRoles(id, dto)` — Reemplazar roles del usuario

**`users.routes.ts`:** Todas con `authMiddleware` + `requireRoles('ADMIN')`

**→ test:** Email duplicado → 409 `USER-002`.

---

### [B-3.3] Módulo Tickets

**`tickets.dto.ts`:**
- `CreateTicketDto`: `titulo`, `descripcion`, `prioridad` (enum), `estado` (por defecto `abierto`)
- `UpdateTicketDto`: parcial de `CreateTicketDto`
- `AssignTicketsDto`: `ticketIds: string[]`, `usuarioId: string`
- `TicketQueryDto`: `page`, `limit`, `estado?`, `prioridad?`, `asignadoA?`

**`tickets.service.ts`:**

Orden de prioridades para validación de escala:
```
baja(1) → media(2) → alta(3) → critica(4)
```

- `findPaginated(query, currentUser)`:
  - Si rol `ADMIN`: ver todos los tickets con filtros
  - Si rol `OPERATIVO`: filtrar solo `asignadoAId = currentUser.id`
- `findUnassigned()` — Tickets sin `asignadoAId`
- `getStats(currentUser)` — Contar por estado y por prioridad (filtrado por rol)
- `findById(id)` → `NotFoundError('TKT-001')`
- `create(dto, creadoPorId)`:
  1. Crear ticket con estado `abierto`
  2. Registrar en `HistoricoGestion` (tipo `CREACION`) dentro de la misma transacción
- `update(id, dto, currentUser)`:
  1. Verificar existencia → `NotFoundError('TKT-001')`
  2. Si estado `cerrado` → `BusinessRuleError('TKT-004')`
  3. Si se cambia prioridad hacia un nivel inferior → `BusinessRuleError('TKT-003')`
  4. Verificar que GESTIONADOR solo edita sus tickets → `ForbiddenError('TKT-002')`
  5. Actualizar ticket
  6. Si cambió estado → registrar `ESTADO_CAMBIADO` en historial
  7. Si cambió prioridad → registrar `PRIORIDAD_CAMBIADA` en historial
  (Todo en una misma transacción TypeORM)
- `softDelete(id)` — Solo ADMIN; marcar `deletedAt`
- `assign(dto)`:
  1. Verificar que cada ticketId existe
  2. Asignar `asignadoAId = dto.usuarioId`
  3. Registrar `ASIGNACION` en historial por cada ticket asignado
  (Transacción única para todos)
- `findByUser(userId, query)` — Paginado con filtro `estado?`

**`tickets.routes.ts`:**
- `GET    /api/tickets`              → `authMiddleware` (ADMIN y OPERATIVO)
- `POST   /api/tickets`              → `authMiddleware` + `requireRoles('ADMIN')`
- `GET    /api/tickets/unassigned`   → `authMiddleware` + `requireRoles('ADMIN')`
- `GET    /api/tickets/stats`        → `authMiddleware`
- `GET    /api/tickets/:id`          → `authMiddleware`
- `PUT    /api/tickets/:id`          → `authMiddleware`
- `DELETE /api/tickets/:id`          → `authMiddleware` + `requireRoles('ADMIN')`
- `PUT    /api/tickets/assign`       → `authMiddleware` + `requireRoles('ADMIN')`
- `GET    /api/tickets/user/:userId` → `authMiddleware`

**→ test:**
- Reducir prioridad → 422 `TKT-003`
- GESTIONADOR elimina ticket → 403 `AUTH-006`
- GESTIONADOR ve solo sus tickets

---

### [B-3.4] Módulo Historial

**`historico.dto.ts`:**
- `CreateHistoricoDto`: `tipoAccion` (enum), `comentario?` (requerido si tipo = COMENTARIO)

**`historico.service.ts`:**
- `registrar(data)` — Método interno; usado por tickets.service dentro de transacciones.
  No es llamado directamente desde el controller para entradas automáticas.
- `addGestion(ticketId, dto, currentUser)` — Llamado desde el controller para gestiones manuales:
  1. Verificar que ticket existe → `NotFoundError('TKT-001')`
  2. Si tipo = `COMENTARIO` y no hay comentario → `BusinessRuleError('HIST-001')`
  3. Verificar que GESTIONADOR tiene el ticket asignado → `ForbiddenError('TKT-002')`
  4. Insertar en `historico_gestion`
- `getHistory(ticketId)` — Retornar historial ordenado por `created_at ASC`
  con datos del usuario que realizó la gestión

**`historico.routes.ts`:**
- `GET  /api/tickets/:id/history` → `authMiddleware`
- `POST /api/tickets/:id/history` → `authMiddleware` + `validate(CreateHistoricoDto)`

---

### [B-3.5] Health Check

**`src/health/health.routes.ts`:**
- `GET /health` — Sin middleware de autenticación
- Verificar conexión a DB con `dataSource.query('SELECT 1')`
- Respuesta:
  ```json
  {
    "status": "ok",
    "db": "connected",
    "uptime": 3600,
    "timestamp": "ISO-8601"
  }
  ```
- Si la DB falla: `status: "degraded"`, `db: "error"`, HTTP 503

---

## FASE 4 — Backend: Documentación y Docker

### [B-4.1] Swagger / OpenAPI

- Montar `swagger-ui-express` en `/api/docs`
- Generar o escribir `swagger.yaml` / `swagger.json` documentando:
  - Todos los endpoints con método, ruta, descripción
  - Schema de request body (con ejemplos)
  - Schemas de respuesta exitosa y de error (usando los modelos base)
  - Esquema de seguridad: `cookieAuth` con cookies HttpOnly
  - Tags por módulo: Auth, Usuarios, Roles, Tickets, Historial, Sistema

---

### [B-4.2] Docker

**`BACK/Dockerfile`** (producción — multi-stage):
```dockerfile
# Stage 1: build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: runtime
FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json .
EXPOSE 3001
CMD ["node", "dist/index.js"]
```

**`BACK/Dockerfile.dev`** (desarrollo — hot reload):
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3001
CMD ["npm", "run", "dev"]
```

**`BACK/docker-compose.yml`** (producción):
- Servicio `app` (Dockerfile producción)
- Servicio `postgres` con health check
- Volumen nombrado para datos de PostgreSQL
- Red interna

**`BACK/docker-compose-dev.yml`** (desarrollo):
- Servicio `app` (Dockerfile.dev) con bind mount `./src`
- Servicio `postgres`
- Servicio `pgadmin`
- Volumen nombrado

---

## FASE 5 — Backend: Suite de pruebas

### [B-5.1] Implementar tests

**Archivo `BACK/src/tests/auth.test.ts`:**
1. Login exitoso → cookies `access_token` y `refresh_token` presentes
2. Login con email incorrecto → 401 `AUTH-001`
3. Refresh con token válido → nuevas cookies, token anterior revocado en BD
4. Refresh con token revocado → 401 `AUTH-004`
5. Logout → token revocado, cookies limpiadas

**Archivo `BACK/src/tests/tickets.test.ts`:**
6.  Crear ticket como ADMIN → 201
7.  Reducir prioridad → 422 `TKT-003`
8.  Eliminar como GESTIONADOR → 403 `AUTH-006`
9.  GESTIONADOR ve solo sus tickets asignados
10. `GET /api/tickets/user/:userId` con paginación y filtro de estado

**Archivo `BACK/src/tests/historico.test.ts`:**
11. GESTIONADOR agrega gestión → 201 con registro en historial
12. Tipo COMENTARIO sin comentario → 400 `HIST-001`
13. Historial ordenado por `created_at ASC`

**Archivo `BACK/src/tests/users.test.ts`:**
14. ADMIN asigna rol → 200 con roles actualizados
15. Email duplicado → 409 `USER-002`

**Archivo `BACK/src/tests/health.test.ts`:**
16. `GET /health` sin autenticación → 200 `{ status: 'ok' }`

**Archivo `BACK/src/tests/validation.test.ts`:**
17. `POST /api/auth/register` sin email → 400 `VAL-001` con `details[]`

---

## FASE 6 — Frontend: Infraestructura base

### [F-6.1] Cliente HTTP y tipos base

**`FRONT/src/types/api.types.ts`:**
```typescript
interface ApiResponse<T> {
  success: true;
  data: T;
  message: string;
  timestamp: string;
}
interface ApiError {
  success: false;
  errorCode: string;
  message: string;
  details?: { field: string; message: string }[];
  timestamp: string;
  correlationId: string;
}
interface PaginatedResponse<T> extends ApiResponse<T[]> {
  meta: { page: number; limit: number; total: number; totalPages: number };
}
```

**`FRONT/src/services/api.client.ts`:**
- Instancia Axios con `baseURL: import.meta.env.VITE_API_URL`
- `withCredentials: true` (para cookies HttpOnly)
- **Interceptor de respuesta:**
  - Si status 401 y la ruta NO es `/auth/login`:
    1. Intentar `POST /api/auth/refresh`
    2. Si refresh exitoso: reintentar request original
    3. Si refresh falla: limpiar store de Zustand + redirigir a `/login`
  - Cualquier otro error: propagar con el `ApiError` del backend

**`FRONT/src/store/auth.store.ts`:**
- Zustand store: `user`, `roles`, `isAuthenticated`
- Acciones: `setUser`, `clearUser`

---

### [F-6.2] Router y rutas protegidas

**`FRONT/src/router.tsx`:**
- `ProtectedRoute`: verifica `isAuthenticated` → redirige a `/login` si no autenticado
- `RoleGuard`: verifica que `roles` incluya el rol requerido → redirige o muestra 403
- Rutas:
  - `/login` — público
  - `/` → redirige a `/dashboard`
  - `/dashboard` → `ProtectedRoute` → `DashboardPage`
  - `/tickets` → `ProtectedRoute` → `TicketsPage`
  - `/tickets/:id` → `ProtectedRoute` → `TicketDetailPage`
  - `/users` → `ProtectedRoute` + `RoleGuard('ADMIN')` → `UsersPage`

---

## FASE 7 — Frontend: Features

### [F-7.1] Feature Auth — Login

**`FRONT/src/features/auth/LoginPage.tsx`:**
- Formulario con `react-hook-form` + `zod`: `email` (IsEmail), `password` (MinLength 6)
- Campo password con ícono de ojo para toggle visibilidad
- Al submit: `POST /api/auth/login`; si exitoso → `setUser()` en store → redirigir a `/dashboard`
- Si error 401: mostrar mensaje legible (usar `error.message` del backend)
- Estado de loading en el botón de submit

**`FRONT/src/features/auth/auth.service.ts`:**
- `login(email, password)` → llama API, retorna `{ user, roles }`
- `logout()` → llama `POST /api/auth/logout`, limpia store
- `getMe()` → llama `GET /api/auth/me` para hidratar la sesión al cargar la app

---

### [F-7.2] Feature Dashboard

**`FRONT/src/features/dashboard/DashboardPage.tsx`:**
- Llama `GET /api/tickets/stats` con `useQuery`
- **Vista ADMIN:** tarjetas con conteo de tickets por estado + por prioridad
- **Vista GESTIONADOR:** resumen de sus tickets (`abierto`, `en_progreso`) con link a `/tickets`

---

### [F-7.3] Feature Tickets

**`FRONT/src/features/tickets/TicketsPage.tsx`:**
- Tabla paginada con columnas: título, prioridad (badge coloreado), estado (badge), asignado a
- Filtros: estado, prioridad; buscador por título
- **ADMIN:** botón "Nuevo ticket", botón "Asignar tickets", botón "Eliminar" por fila
- **GESTIONADOR:** solo sus tickets; sin botones de crear/eliminar/asignar
- Click en fila → navegar a `/tickets/:id`

**`FRONT/src/features/tickets/TicketForm.tsx`:**
- Modal/drawer para crear y editar ticket
- Campos: título (requerido), descripción (textarea), prioridad (select enum), estado (select enum)
- En edición: si el usuario intenta bajar prioridad → mostrar mensaje de error y deshabilitar esa opción

**`FRONT/src/features/tickets/AssignTicketModal.tsx`:**
- Lista de tickets sin asignar (checkbox multi-selección)
- Selector de usuario usando `GET /api/users/all`
- Submit → `PUT /api/tickets/assign`

**`FRONT/src/features/tickets/TicketDetailPage.tsx`:**
- Cabecera con datos del ticket (título, descripción, prioridad badge, estado badge, asignado a)
- **ADMIN:** puede editar estado y prioridad (con validación de no reducir prioridad)
- Sección "Historial de gestiones" — lista cronológica (`created_at ASC`):
  - Por cada entrada: ícono de `tipoAccion`, nombre del usuario, timestamp formateado, comentario
- Formulario al final (GESTIONADOR y ADMIN): textarea de comentario + select de `tipoAccion` + botón "Agregar gestión"

**`FRONT/src/features/tickets/tickets.service.ts`:**
- `getTickets(query)`, `getTicketById(id)`, `createTicket(dto)`, `updateTicket(id, dto)`
- `deleteTicket(id)`, `assignTickets(dto)`, `getTicketHistory(id)`
- `addHistoricoGestion(ticketId, dto)`

---

### [F-7.4] Feature Usuarios

**`FRONT/src/features/users/UsersPage.tsx`:**
- Tabla paginada con búsqueda por nombre/email
- Columnas: nombre, email, roles (badges), estado activo/inactivo, acciones
- Acciones por fila: editar, habilitar/inhabilitar (toggle)

**`FRONT/src/features/users/UserForm.tsx`:**
- Modal para crear y editar usuario
- Campos: nombre, email, password (solo en creación), roles (multi-select con `GET /api/roles`)
- En edición: password es opcional (si no se llena, no se envía)

---

### [F-7.5] Componentes UI compartidos

Implementar componentes base siguiendo el Design System disponible:
- `Button` — variantes: `primary`, `secondary`, `danger`, `ghost`; estados: `loading`, `disabled`
- `Input` — con soporte para label, error message, ícono derecho (usado en password)
- `Badge` — colores semánticos por prioridad (`baja=verde`, `media=amarillo`, `alta=naranja`, `critica=rojo`) y por estado
- `Table` — con header, filas, empty state
- `Modal` — con overlay, header, body, footer, cierre con ESC
- `Pagination` — botones anterior/siguiente + indicador de página

---

## FASE 8 — Frontend: Suite de pruebas

### [F-8.1] Implementar tests

**`FRONT/src/tests/auth.test.tsx`:**
1. Login exitoso → redirige a `/dashboard`
2. Login fallido → muestra mensaje de error
3. Toggle visibilidad contraseña → input cambia a `type="text"`

**`FRONT/src/tests/tickets.test.tsx`:**
4. Crear ticket → aparece en la lista
5. Intento de reducir prioridad → opción deshabilitada / error mostrado
6. Opción Eliminar no visible para GESTIONADOR
7. Vista de historial muestra gestiones en orden cronológico

**`FRONT/src/tests/users.test.tsx`:**
8. Asignación de ticket a usuario → ticket aparece en lista del usuario

---

## FASE 9 — Entregables finales

### [X-9.1] Generar `BACK/CLAUDE.md`

Crear el archivo `BACK/CLAUDE.md` con las siguientes reglas para que Claude entienda y edite el proyecto:

```markdown
# CLAUDE.md — Backend (BACK/)

## Descripción del proyecto
Microservicio REST en Node.js + Express.js + TypeORM + PostgreSQL para gestión de tickets.
Arquitectura: Spec Driven Development (SDD). Cada módulo tiene su .spec.ts como contrato.

## Stack
- Node.js 20 LTS, Express.js 4, TypeORM 0.3, PostgreSQL
- JWT RS256 (access_token en cookie HttpOnly, 15min)
- Refresh token: UUID opaco almacenado en tabla refresh_tokens (rotación en cada uso)
- class-validator + class-transformer para validación de DTOs
- Winston + DailyRotateFile para logs (logs/YYYY-MM-DD.log)

## Estructura de módulos
Cada módulo en src/modules/<nombre>/ contiene:
  <nombre>.spec.ts        → contrato SDD (no modificar sin actualizar también las pruebas)
  <nombre>.controller.ts  → solo orquesta; nunca tiene try/catch; propaga al error middleware
  <nombre>.service.ts     → toda la lógica de negocio; lanza AppError y subclases
  <nombre>.routes.ts      → define rutas, aplica middlewares y validate()
  <nombre>.dto.ts         → DTOs con decoradores de class-validator

## Reglas de errores (obligatorias)
- NUNCA lanzar `new Error(...)` genérico desde un servicio; usar siempre la subclase de AppError correcta
- Los códigos de error están en src/shared/errors/error-codes.ts; no inventar códigos nuevos sin agregarlos ahí
- Los controllers NO tienen try/catch; todo error propaga a error.middleware.ts
- El campo 'path' del error va SOLO al log, nunca al body de la respuesta al cliente
- El modelo de respuesta de error es: { success, errorCode, message, details?, timestamp, correlationId }

## Reglas de base de datos
- Borrado siempre lógico (deletedAt); NUNCA usar DELETE SQL salvo que sea explícitamente requerido
- historico_gestion es inmutable: no tiene updatedAt ni deletedAt; nunca actualizar ni borrar registros de esta tabla
- Toda operación que modifica un ticket Y agrega al historial debe hacerse en una sola transacción TypeORM
- Los seeders son idempotentes: verificar existencia con findOne antes de insertar

## Reglas de autenticación
- El refresh_token es un UUID opaco, no un JWT; vive en la tabla refresh_tokens
- Al usar POST /api/auth/refresh: revocar el token anterior ANTES de emitir el nuevo
- Las cookies se emiten con HttpOnly: true y Secure: true en producción

## Reglas de testing
- Ejecutar tests con: npm test
- Los tests usan supertest contra una instancia real de Express (no mocks de Express)
- La base de datos de test debe ser una DB separada (DB_NAME_TEST en .env)
- Nunca mockear el repositorio de TypeORM en tests de integración

## Comandos frecuentes
- npm run dev          → servidor en modo desarrollo (hot reload)
- npm run build        → compilar TypeScript a dist/
- npm run migration:run → ejecutar migraciones pendientes
- npm run seed         → cargar datos iniciales
- npm test             → ejecutar suite de pruebas
- npm run lint         → ESLint
- npm run format       → Prettier
```

---

### [X-9.2] Generar `FRONT/CLAUDE.md`

Crear el archivo `FRONT/CLAUDE.md` con las reglas para editar el frontend:

```markdown
# CLAUDE.md — Frontend (FRONT/)

## Descripción del proyecto
Aplicativo React + TypeScript + Vite para gestión de tickets.
Usa TanStack Query para data fetching, Zustand para estado global de sesión,
React Hook Form + Zod para formularios, y Axios con interceptors para el manejo de auth.

## Stack
- React 18 + TypeScript, Vite 5
- React Router v6 (rutas protegidas por rol)
- TanStack Query v5 (caché y sincronización de datos del servidor)
- Zustand (estado de sesión: user, roles, isAuthenticated)
- Axios con interceptors (refresh automático de access_token en 401)
- React Hook Form + Zod (formularios y validación)
- Vitest + Testing Library (pruebas unitarias)

## Estructura por feature
Cada feature en src/features/<nombre>/ es autónoma:
  <nombre>Page.tsx      → componente de página (conectado a la ruta)
  <nombre>Form.tsx      → formulario (usa react-hook-form + zod)
  <nombre>.service.ts   → funciones que llaman al API client

## Reglas de seguridad (críticas)
- NUNCA almacenar access_token ni refresh_token en localStorage o sessionStorage
- Los tokens viajan en cookies HttpOnly gestionadas por el backend
- El API client usa withCredentials: true en todas las llamadas
- Para hidratar la sesión al cargar la app: llamar GET /api/auth/me en App.tsx
- El interceptor Axios maneja automáticamente el refresh en 401; no duplicar esta lógica

## Reglas de autorización en UI
- Usar RoleGuard para esconder elementos según rol (botones, menús, rutas)
- Los roles del usuario están en auth.store.ts (Zustand); no hacer fetch extra para consultarlos
- La regla de negocio "no reducir prioridad" debe validarse también en el frontend
  (deshabilitar la opción en el select; el backend también la valida)

## Reglas de formularios
- Todos los formularios usan react-hook-form + zod; NO usar estado local de React para formularios
- Los esquemas Zod de validación van en el mismo archivo del formulario o en <nombre>.schema.ts
- Los errores del backend (ApiError) se muestran al usuario con el campo `message`; no exponer errorCode

## Reglas de datos del servidor
- Usar TanStack Query para todo fetch de datos (no useState + useEffect para llamadas API)
- Los query keys son arrays descriptivos: ['tickets', userId], ['ticket', id], etc.
- Invalidar queries relacionados después de mutaciones (ej: invalidar ['tickets'] al crear ticket)

## Reglas de componentes UI
- Los componentes en src/components/ui/ son genéricos y reutilizables; no deben tener lógica de negocio
- No crear componentes nuevos en ui/ a menos que sean verdaderamente reutilizables en 2+ features
- Los badges de prioridad y estado tienen colores semánticos definidos:
    baja → verde, media → amarillo, alta → naranja, critica → rojo
    abierto → azul, en_progreso → amarillo, resuelto → verde, cerrado → gris

## Comandos frecuentes
- npm run dev      → servidor de desarrollo (http://localhost:5173)
- npm run build    → build de producción a dist/
- npm run preview  → preview del build de producción
- npm test         → ejecutar suite de pruebas con Vitest
- npm run lint     → ESLint
- npm run format   → Prettier
```

---

## Orden de ejecución recomendado

```
FASE 0  → Scaffolding (BACK y FRONT en paralelo)
FASE 1  → Entidades, migraciones, seeders
FASE 2  → Módulo Auth (base para todo lo demás)
FASE 3  → Módulos de negocio (Roles → Usuarios → Tickets → Historial → Health)
FASE 4  → Swagger + Docker
FASE 5  → Tests Backend
FASE 6  → Frontend: infraestructura base (client, store, router)
FASE 7  → Frontend: features (Auth → Dashboard → Tickets → Usuarios → UI components)
FASE 8  → Tests Frontend
FASE 9  → CLAUDE.md de cada proyecto ← entregables finales
```

---

## Criterios de aceptación global

| Criterio | Verificación |
|---|---|
| Auth con JWT RS256 + cookies HttpOnly | Login emite cookies; `/api/auth/me` retorna user |
| Refresh token rotation funcional | Token anterior queda `is_revoked=true` en BD tras cada refresh |
| Control de roles en todos los endpoints | GESTIONADOR no puede acceder a rutas de ADMIN |
| Historial inmutable | No existe endpoint ni lógica para UPDATE/DELETE en historico_gestion |
| Manejo de errores unificado | Todos los errores siguen el modelo `{ success, errorCode, message, ... }` |
| No se expone `path` en respuesta de error | Verificar que el body de error no incluye el campo `path` |
| Paginación en todos los listados | Todos los GET de colección aceptan `?page&limit` |
| Borrado lógico en todas las entidades | Verificar que DELETE marca `deletedAt` y no borra el registro |
| Health check sin autenticación | `GET /health` retorna 200 sin token |
| Suite de tests pasa completa | `npm test` en BACK y FRONT sin fallos |

---

*Plan generado el 2026-06-16. Basado en `user-stories-refined.md`.*

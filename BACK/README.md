# Backend — Sistema de Gestión de Tickets

API REST para gestión de tickets de soporte con autenticación JWT, control de roles y auditoría completa.

## Stack

| Tecnología | Versión | Rol |
|---|---|---|
| Node.js | 20 LTS | Runtime |
| Express.js | 5.x | Framework HTTP |
| TypeORM | 1.x | ORM |
| PostgreSQL | 16 | Base de datos |
| TypeScript | 6.x | Lenguaje |
| Jest + Supertest | — | Tests de integración |
| Winston | 3.x | Logging |

---

## Levantar en local

### Prerequisitos

- Node.js 20+
- PostgreSQL 16 corriendo localmente
- OpenSSL (para generar las claves JWT)

### 1. Instalar dependencias

```bash
cd BACK
npm install
```

### 2. Configurar variables de entorno

```bash
cp .env.example .env
```

Editar `.env` con los valores correspondientes:

```env
NODE_ENV=development
PORT=3001

DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=tickets_db
DB_NAME_TEST=tickets_test_db

JWT_PRIVATE_KEY_PATH=./keys/private.pem
JWT_PUBLIC_KEY_PATH=./keys/public.pem
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

CORS_ORIGIN=http://localhost:5173

LOG_LEVEL=info
```

### 3. Generar claves RSA para JWT

```bash
mkdir -p keys
openssl genrsa -out keys/private.pem 2048
openssl rsa -in keys/private.pem -pubout -out keys/public.pem
```

### 4. Crear la base de datos

```bash
psql -U postgres -c "CREATE DATABASE tickets_db;"
psql -U postgres -c "CREATE DATABASE tickets_test_db;"
```

### 5. Ejecutar migraciones y seeders

```bash
npm run migration:run
npm run seed
```

### 6. Iniciar el servidor

```bash
# Modo desarrollo con hot reload
npm run dev

# Modo producción (requiere build previo)
npm run build
npm start
```

El servidor queda disponible en `http://localhost:3001`.
La documentación Swagger en `http://localhost:3001/api/docs`.

---

## Levantar con Docker

### Modo desarrollo (con hot reload y pgAdmin)

```bash
# Desde el directorio BACK/
docker compose -f docker-compose-dev.yml up --build
```

| Servicio | URL |
|---|---|
| API | http://localhost:3001 |
| pgAdmin | http://localhost:5050 (admin@admin.com / admin) |

El volumen `./src` se monta en el contenedor, por lo que los cambios en código se reflejan en caliente.

### Modo producción

```bash
docker compose up --build
```

El contenedor de la API espera a que PostgreSQL esté saludable antes de arrancar.

> **Nota:** las claves RSA deben existir en `./keys/` antes de levantar los contenedores, o pasarse como variables de entorno.

---

## Ejecutar pruebas unitarias / integración

Las pruebas usan Supertest contra una instancia real de Express y una base de datos PostgreSQL separada (`DB_NAME_TEST`).

```bash
# Asegurarse que la DB de test existe
psql -U postgres -c "CREATE DATABASE tickets_test_db;"

# Ejecutar todos los tests (--runInBand para evitar colisiones de BD)
npm test

# Ver cobertura
npm test -- --coverage
```

Los archivos de test se encuentran en `src/tests/`:

| Archivo | Qué cubre |
|---|---|
| `auth.test.ts` | Login, register, refresh, logout, /me |
| `tickets.test.ts` | CRUD tickets, asignación, filtros por rol |
| `users.test.ts` | CRUD usuarios, toggle activo/inactivo |
| `historico.test.ts` | Historial de gestiones por ticket |
| `health.test.ts` | Health check endpoint |
| `validation.test.ts` | Validaciones de DTOs con class-validator |

---

## Estructura del proyecto

```
BACK/
├── keys/                          # Claves RSA (no versionar)
├── logs/                          # Logs rotativos (generados en runtime)
├── src/
│   ├── config/
│   │   ├── database.config.ts     # Configuración TypeORM + DataSource
│   │   ├── env.config.ts          # Carga y validación de variables de entorno
│   │   └── jwt.config.ts          # Configuración JWT RS256
│   ├── entities/                  # Entidades TypeORM (mapeo a tablas)
│   │   ├── Usuario.entity.ts
│   │   ├── Rol.entity.ts
│   │   ├── UsuarioRol.entity.ts
│   │   ├── Ticket.entity.ts
│   │   ├── RefreshToken.entity.ts
│   │   └── HistoricoGestion.entity.ts
│   ├── migrations/                # Migraciones de base de datos (TypeORM)
│   ├── middlewares/
│   │   ├── auth.middleware.ts     # Verifica access_token en cookie
│   │   ├── roles.middleware.ts    # requireRoles(...) — verifica rol del usuario
│   │   ├── validate.middleware.ts # Valida DTOs con class-validator
│   │   ├── error.middleware.ts    # Manejo centralizado de errores
│   │   └── request-id.middleware.ts # Inyecta correlationId en cada request
│   ├── modules/                   # Módulos de dominio
│   │   ├── auth/                  # Autenticación y sesión
│   │   ├── tickets/               # CRUD y lógica de tickets
│   │   ├── users/                 # Gestión de usuarios
│   │   ├── roles/                 # Gestión de roles
│   │   └── historico/             # Historial de gestiones
│   ├── seeders/                   # Datos iniciales (roles + admin)
│   ├── shared/
│   │   ├── errors/                # AppError, subclases y códigos de error
│   │   ├── logger/                # Configuración Winston
│   │   ├── types/                 # Extensiones de tipos (express.d.ts)
│   │   └── utils/                 # jwt.util, response.util
│   ├── health/                    # Endpoint /health
│   ├── app.ts                     # Configuración Express (middlewares, rutas)
│   ├── index.ts                   # Entry point (arranque del servidor)
│   └── swagger.ts                 # Definición OpenAPI 3.0
├── .env.example
├── Dockerfile                     # Imagen de producción (multi-stage)
├── Dockerfile.dev                 # Imagen de desarrollo con ts-node-dev
├── docker-compose.yml             # Stack completo producción
├── docker-compose-dev.yml         # Stack desarrollo + pgAdmin
├── jest.config.ts
├── tsconfig.json
└── package.json
```

### Anatomía de un módulo

Cada módulo dentro de `src/modules/<nombre>/` sigue la misma estructura:

```
<nombre>.routes.ts      → define rutas, aplica middlewares y validate()
<nombre>.controller.ts  → orquesta la request; NO tiene try/catch
<nombre>.service.ts     → lógica de negocio; lanza AppError y subclases
<nombre>.dto.ts         → DTOs con decoradores class-validator
```

---

## Buenas prácticas de desarrollo

### Errores

- Nunca lanzar `new Error(...)` genérico desde un servicio — usar siempre una subclase de `AppError` (`NotFoundError`, `ConflictError`, `UnauthorizedError`, etc.).
- Los códigos de error están centralizados en `src/shared/errors/error-codes.ts`; no inventar códigos nuevos sin agregarlos ahí.
- Los controllers **no tienen** `try/catch`; todos los errores propagan al `error.middleware.ts`.
- El campo `path` del error va solo al log, nunca en el body de respuesta al cliente.

### Base de datos

- Borrado siempre lógico (`deletedAt`); nunca usar `DELETE` SQL directo salvo requerimiento explícito.
- `historico_gestion` es inmutable: no tiene `updatedAt` ni `deletedAt`; nunca actualizar ni borrar sus registros.
- Toda operación que modifica un ticket y agrega al historial debe ejecutarse en una **sola transacción** TypeORM.
- Los seeders son idempotentes: verifican existencia con `findOne` antes de insertar.

### Autenticación

- El `access_token` (JWT RS256, 15 min) viaja en cookie `HttpOnly`.
- El `refresh_token` es un UUID opaco, no un JWT; se almacena en la tabla `refresh_tokens`.
- Al renovar: revocar el token anterior **antes** de emitir el nuevo.
- Las cookies se emiten con `HttpOnly: true` y `Secure: true` en producción.

### Testing

- No mockear el repositorio TypeORM en tests de integración — los tests golpean una BD real.
- Usar una base de datos separada (`DB_NAME_TEST`) para no contaminar datos de desarrollo.
- Ejecutar con `--runInBand` para serializar tests y evitar colisiones de estado en BD.

### Logging

- Usar el logger Winston (`src/shared/logger/logger.ts`) en lugar de `console.log`.
- Los logs se escriben en `logs/YYYY-MM-DD.log` con rotación diaria.
- En producción el nivel de log es `info`; en desarrollo se puede usar `debug`.

### Formato de respuesta

Todas las respuestas del API siguen el mismo contrato:

```json
// Éxito
{ "success": true, "data": {}, "message": "...", "timestamp": "...", "correlationId": "..." }

// Error
{ "success": false, "errorCode": "TKT-001", "message": "...", "details": [], "timestamp": "...", "correlationId": "..." }
```

---

## Comandos de referencia

```bash
npm run dev            # Servidor desarrollo con hot reload
npm run build          # Compilar TypeScript → dist/
npm start              # Servidor producción (requiere build)
npm test               # Ejecutar suite de pruebas
npm run migration:run  # Ejecutar migraciones pendientes
npm run seed           # Cargar datos iniciales (roles + admin)
npm run lint           # ESLint
npm run format         # Prettier
```

## Usuario administrador por defecto

Después de ejecutar `npm run seed`:

| Campo | Valor |
|---|---|
| Email | system@app.admin |
| Contraseña | Aa123456*+ |
| Rol | ADMIN |

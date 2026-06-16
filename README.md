# Sistema de Gestión de Tickets

Aplicación full-stack para gestión de tickets de soporte con autenticación JWT, control de roles (ADMIN / AGENTE) e historial de gestiones.

## Proyectos

| Directorio | Tecnología | Puerto | README |
|---|---|---|---|
| `BACK/` | Node.js 20 + Express 5 + TypeORM + PostgreSQL | 3001 | [BACK/README.md](./BACK/README.md) |
| `FRONT/` | React 19 + TypeScript + Vite | 5173 | [FRONT/README.md](./FRONT/README.md) |
| `DOCS/` | Documentación del proyecto | — | — |

---

## Inicio rápido

### 1. Levantar el backend

```bash
cd BACK
cp .env.example .env          # Editar credenciales de BD y claves JWT
mkdir -p keys
openssl genrsa -out keys/private.pem 2048
openssl rsa -in keys/private.pem -pubout -out keys/public.pem
npm install
npm run migration:run
npm run seed
npm run dev
```

### 2. Levantar el frontend

```bash
cd FRONT
npm install
npm run dev
```

Acceder a `http://localhost:5173` con las credenciales del administrador por defecto:

| Campo | Valor |
|---|---|
| Email | system@app.admin |
| Contraseña | Aa123456*+ |

La documentación Swagger del API está en `http://localhost:3001/api/docs`.

---

## Levantar con Docker (modo desarrollo)

```bash
# Desde BACK/ levanta API + PostgreSQL + pgAdmin
cd BACK
docker compose -f docker-compose-dev.yml up --build
```

```bash
# Frontend se levanta localmente apuntando al backend en Docker
cd FRONT
npm run dev
```

---

## Arquitectura general

```
┌─────────────────────────────────────────────────────────┐
│  FRONT (React + Vite — :5173)                           │
│  ┌───────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │ Auth/     │  │ Tickets/     │  │ Users/           │  │
│  │ Zustand   │  │ TanStack Q   │  │ React Hook Form  │  │
│  └───────────┘  └──────────────┘  └──────────────────┘  │
│         │  Axios withCredentials (cookies HttpOnly)      │
└─────────┼───────────────────────────────────────────────┘
          │  /api/*
┌─────────▼───────────────────────────────────────────────┐
│  BACK (Express 5 — :3001)                               │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────┐  │
│  │ auth/        │  │ tickets/     │  │ users/        │  │
│  │ JWT RS256    │  │ TypeORM      │  │ bcryptjs      │  │
│  └──────────────┘  └──────────────┘  └───────────────┘  │
│         │  Winston logs                                  │
└─────────┼───────────────────────────────────────────────┘
          │
┌─────────▼───────────────────────────────────────────────┐
│  PostgreSQL 16                                          │
│  tickets_db / tickets_test_db                           │
└─────────────────────────────────────────────────────────┘
```

### Flujo de autenticación

- El backend emite `access_token` (JWT RS256, 15 min) y `refresh_token` (UUID opaco, 7 días) en cookies `HttpOnly`.
- El frontend nunca accede a los tokens directamente — el interceptor Axios renueva el access token automáticamente en caso de 401.
- Los roles del usuario se almacenan en Zustand tras hidratar la sesión con `GET /api/auth/me` al inicio.

---

## Documentación

La carpeta `DOCS/` contiene:

- `work-plan.md` — Plan de trabajo e implementación
- `user-stories-refined.md` — Historias de usuario detalladas
- `user-stories-manual.md` — Casos de uso manuales
- `# Prueba Técnica — Desarrollador Middle.md` — Enunciado original de la prueba

---

## Ejecutar pruebas

```bash
# Backend (Jest + Supertest — requiere PostgreSQL)
cd BACK && npm test

# Frontend (Vitest + Testing Library — no requiere backend)
cd FRONT && npm test
```

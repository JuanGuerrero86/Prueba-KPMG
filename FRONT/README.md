# Frontend — Sistema de Gestión de Tickets

Aplicativo web para gestión de tickets de soporte con autenticación basada en roles, construido con React 19 + TypeScript + Vite.

## Stack

| Tecnología | Versión | Rol |
|---|---|---|
| React | 19.x | UI framework |
| TypeScript | 6.x | Lenguaje |
| Vite | 8.x | Bundler / dev server |
| React Router | v7 | Navegación y rutas protegidas |
| TanStack Query | v5 | Data fetching y caché del servidor |
| Zustand | 5.x | Estado global de sesión |
| Axios | 1.x | Cliente HTTP con interceptors |
| React Hook Form + Zod | — | Formularios y validación |
| Vitest + Testing Library | — | Pruebas unitarias de componentes |

---

## Levantar en local

### Prerequisitos

- Node.js 20+
- Backend corriendo en `http://localhost:3001` (ver `BACK/README.md`)

### 1. Instalar dependencias

```bash
cd FRONT
npm install
```

### 2. Iniciar el servidor de desarrollo

```bash
npm run dev
```

La aplicación queda disponible en `http://localhost:5173`.

El servidor de desarrollo incluye un proxy configurado en `vite.config.ts` que redirige `/api/*` hacia `http://localhost:3001`, por lo que no se necesita configurar CORS manualmente durante el desarrollo.

### 3. Build de producción

```bash
npm run build
```

Los archivos estáticos se generan en `dist/`. Para previsualizar el build:

```bash
npm run preview
```

---

## Levantar con Docker

El frontend se sirve como archivos estáticos. Para incluirlo en el stack Docker completo, construir el build y servirlo con Nginx o un servidor estático, o bien levantarlo junto al backend usando el `docker-compose` de la raíz del proyecto.

Para desarrollo local se recomienda usar `npm run dev` directamente.

---

## Ejecutar pruebas

Las pruebas usan Vitest + Testing Library con jsdom como entorno de browser simulado.

```bash
# Ejecutar una vez (CI)
npm test

# Modo watch (desarrollo)
npm run test:watch

# Con cobertura
npm test -- --coverage
```

Los archivos de test se encuentran en `src/tests/`:

| Archivo | Qué cubre |
|---|---|
| `auth.test.tsx` | LoginPage, flujo de autenticación, redirección |
| `tickets.test.tsx` | TicketsPage, listado, filtros, creación de ticket |
| `users.test.tsx` | UsersPage, listado, toggle activo/inactivo |

El archivo `src/tests/setup.ts` configura los matchers de `@testing-library/jest-dom` y los mocks globales necesarios (Axios, React Router).

---

## Estructura del proyecto

```
FRONT/
├── public/                        # Assets estáticos servidos directamente
├── src/
│   ├── assets/                    # Imágenes y SVGs importados en código
│   ├── components/
│   │   ├── layout/
│   │   │   ├── ProtectedRoute.tsx # Redirige a /login si no hay sesión
│   │   │   ├── RoleGuard.tsx      # Oculta contenido según rol del usuario
│   │   │   ├── Sidebar.tsx        # Navegación lateral
│   │   │   └── Topbar.tsx         # Barra superior con usuario y logout
│   │   └── ui/                    # Componentes genéricos reutilizables
│   │       ├── Badge.tsx          # Badge de estado/prioridad con color semántico
│   │       ├── Button.tsx
│   │       ├── Input.tsx
│   │       ├── Modal.tsx
│   │       ├── Pagination.tsx
│   │       ├── Table.tsx
│   │       └── index.ts           # Re-exporta todos los componentes UI
│   ├── features/                  # Módulos de dominio (autónomos por feature)
│   │   ├── auth/
│   │   │   ├── LoginPage.tsx
│   │   │   └── auth.service.ts    # Llamadas al API de autenticación
│   │   ├── dashboard/
│   │   │   └── DashboardPage.tsx  # Estadísticas y resumen
│   │   ├── tickets/
│   │   │   ├── TicketsPage.tsx    # Listado con filtros y paginación
│   │   │   ├── TicketDetailPage.tsx
│   │   │   ├── TicketForm.tsx     # Crear / editar ticket
│   │   │   ├── AssignTicketModal.tsx
│   │   │   └── tickets.service.ts
│   │   └── users/
│   │       ├── UsersPage.tsx
│   │       ├── UserForm.tsx
│   │       └── users.service.ts
│   ├── hooks/
│   │   ├── useAuth.ts             # Accede al store de sesión
│   │   └── useRoleGuard.ts        # Comprueba si el usuario tiene un rol
│   ├── services/
│   │   └── api.client.ts          # Instancia Axios con interceptors de auth
│   ├── store/
│   │   └── auth.store.ts          # Zustand: user, roles, isAuthenticated
│   ├── tests/
│   ├── types/                     # Interfaces TypeScript compartidas
│   │   ├── api.types.ts           # ApiResponse, ApiError
│   │   ├── auth.types.ts
│   │   ├── ticket.types.ts
│   │   └── user.types.ts
│   ├── utils/
│   │   └── format.util.ts         # Formateo de fechas, textos, etc.
│   ├── router.tsx                 # Definición de rutas con React Router
│   ├── App.tsx                    # Raíz: hidrata sesión con GET /api/auth/me
│   ├── App.css
│   ├── main.tsx                   # Entry point (ReactDOM.createRoot)
│   └── index.css
├── index.html
├── vite.config.ts                 # Config Vite: proxy, Vitest
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
├── .eslintrc.json
└── package.json
```

### Flujo de autenticación

```
App.tsx arranca
  → GET /api/auth/me (cookie HttpOnly)
    → OK: hidrata auth.store con user + roles
    → 401: el interceptor Axios intenta POST /api/auth/refresh
      → OK: reintenta GET /api/auth/me
      → Falla: redirige a /login
```

---

## Buenas prácticas de desarrollo

### Seguridad y tokens

- **Nunca** almacenar `access_token` ni `refresh_token` en `localStorage` o `sessionStorage`.
- Los tokens viajan exclusivamente en cookies `HttpOnly` gestionadas por el backend.
- El cliente Axios usa `withCredentials: true` en todas las llamadas.
- El interceptor en `api.client.ts` maneja el refresco automático en 401; no duplicar esta lógica en los services.

### Estado y data fetching

- Usar **TanStack Query** para todo fetch de datos — no usar `useState` + `useEffect` para llamadas al API.
- Los query keys son arrays descriptivos: `['tickets']`, `['ticket', id]`, `['users', page]`.
- Invalidar queries relacionados después de mutaciones (`queryClient.invalidateQueries(['tickets'])` al crear un ticket).
- El estado de sesión (user, roles, isAuthenticated) vive en **Zustand** (`auth.store.ts`); no consultar el API extra para obtener roles.

### Formularios

- Todos los formularios usan **React Hook Form + Zod**; no usar estado local `useState` para formularios.
- Los esquemas de validación Zod van en el mismo archivo del formulario o en un archivo `<nombre>.schema.ts` junto a él.
- Los errores del backend (`ApiError.message`) se muestran al usuario; no exponer el campo `errorCode`.

### Autorización en UI

- Usar `<RoleGuard roles={['ADMIN']}>` para ocultar elementos según rol (botones, columnas de tabla, rutas).
- La regla de negocio "no reducir prioridad" se valida también en el frontend (deshabilitar la opción en el select); el backend la valida igualmente.

### Componentes UI

- Los componentes de `src/components/ui/` son genéricos y sin lógica de negocio; no agregar lógica de dominio ahí.
- Solo crear un nuevo componente en `ui/` si es genuinamente reutilizable en 2 o más features.
- Los colores semánticos de badges están definidos y no deben cambiarse sin ajustar también el backend:

| Prioridad | Color |
|---|---|
| baja | verde |
| media | amarillo |
| alta | naranja |
| critica | rojo |

| Estado | Color |
|---|---|
| abierto | azul |
| en_progreso | amarillo |
| resuelto | verde |
| cerrado | gris |

### Estructura por feature

Cada feature en `src/features/<nombre>/` es autónoma. El archivo `<nombre>Page.tsx` conecta la feature con el router; el `<nombre>.service.ts` es la única capa que conoce la URL del API.

---

## Comandos de referencia

```bash
npm run dev         # Servidor de desarrollo en http://localhost:5173
npm run build       # Build de producción → dist/
npm run preview     # Preview del build de producción
npm test            # Ejecutar suite de pruebas con Vitest
npm run test:watch  # Pruebas en modo watch
npm run lint        # ESLint
npm run format      # Prettier
```

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

# CLAUDE.md — Backend (BACK/)

## Descripción del proyecto
Microservicio REST en Node.js + Express.js + TypeORM + PostgreSQL para gestión de tickets.
Arquitectura: módulos por dominio. Cada módulo contiene controller, service, routes y dto.

## Stack
- Node.js 20 LTS, Express.js, TypeORM 1.x, PostgreSQL
- JWT HS256/RS256 (access_token en cookie HttpOnly, 15min)
- Refresh token: UUID opaco almacenado en tabla refresh_tokens (rotación en cada uso)
- class-validator + class-transformer para validación de DTOs
- Winston + DailyRotateFile para logs (logs/YYYY-MM-DD.log)

## Estructura de módulos
Cada módulo en src/modules/<nombre>/ contiene:
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

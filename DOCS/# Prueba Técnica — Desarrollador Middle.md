# Prueba Técnica — Desarrollador Middle

> **Tiempo total:** 2 horas
> **Modalidad:** Repositorio Git público o privado (compartir acceso al finalizar)

---

## Contexto

Se debe construir un **sistema de gestión de tickets de soporte interno** compuesto por una API REST y un frontend básico.

La metodología a aplicar es **Spec Driven Development (SDD)**: la especificación es la fuente de verdad y el código se deriva de ella, no al revés. Se evaluará tanto el proceso como el resultado.

---

## Estructura esperada del repositorio

```
/
├── docs/
│   ├── user-stories-manual.md      ← Fase 1
│   ├── user-stories-refined.md     ← Fase 2
│   ├── work-plan.md                ← Fase 3
│   ├── openapi.yaml                ← Fase 4
│   └── ai-workflow.md              ← Fase 5 y cierre
├── backend/
└── frontend/
```

---

## Fase 1 — Historias de usuario (manual, sin IA)

> ⏱ Tiempo sugerido: 15 min

Redactar manualmente en `docs/user-stories-manual.md` las historias de usuario del sistema. **No usar IA en esta fase.**

Las historias deben cubrir al menos:

- Registro e inicio de sesión de usuarios
- CRUD de tickets con los siguientes campos:
  - Título, descripción
  - Prioridad: `baja | media | alta | crítica`
  - Estado: `abierto | en progreso | resuelto | cerrado`
  - Asignado a (usuario)
- Historial de cambios de estado (fecha, hora, usuario)
- Filtrado y paginación de tickets
- Resumen estadístico (tickets por estado, tickets por prioridad)

Usar el formato estándar:

```
Como [rol], quiero [acción] para [beneficio].
Criterios de aceptación:
  - ...
```

> **Este archivo no debe modificarse después de esta fase.** Es evidencia de tu razonamiento previo a la IA.

---

## Fase 2 — Refinamiento con IA

> ⏱ Tiempo sugerido: 15 min

Usar un agente de IA (Claude, Copilot, Cursor, etc.) para revisar y afinar las historias de usuario.

Guardar el resultado en `docs/user-stories-refined.md`.

**Incluir al inicio del archivo:**

```markdown
## Cambios respecto a la versión manual

- [Lista de lo que el agente sugirió o ajustó y por qué lo aceptaste o rechazaste]
```

> Se evaluará el criterio con que se aceptaron o descartaron las sugerencias de la IA.

**Reglas de negocio que deben quedar documentadas en este archivo:**

- Un usuario no puede reducir la prioridad de un ticket (solo aumentarla)
- Solo un administrador puede eliminar tickets
- El historial de cambios de estado es inmutable

---

## Fase 3 — Plan de trabajo

> ⏱ Tiempo sugerido: 10 min

Con ayuda de un agente de IA, generar un plan de trabajo en `docs/work-plan.md` basado en las historias refinadas.

El plan debe incluir:

- Tareas ordenadas por dependencia
- Separación clara entre tareas de **backend** y **frontend**
- Indicación de qué se cubrirá con pruebas unitarias

> Antes de ejecutar cualquier código, el plan y las specs deben estar listos.

---

## Fase 4 — Especificación OpenAPI

> ⏱ Tiempo sugerido: 15 min

Documentar los endpoints en `docs/openapi.yaml` usando el estándar OpenAPI 3.0 (Swagger).

Endpoints requeridos:

| Método    | Ruta                          | Descripción                           |
| ---------- | ----------------------------- | -------------------------------------- |
| `POST`   | `/api/auth/register`        | Registro de usuario                    |
| `POST`   | `/api/auth/login`           | Login, retorna JWT                     |
| `GET`    | `/api/tickets`              | Listar tickets (filtros + paginación) |
| `POST`   | `/api/tickets`              | Crear ticket                           |
| `GET`    | `/api/tickets/{id}`         | Obtener ticket por ID                  |
| `PUT`    | `/api/tickets/{id}`         | Actualizar ticket                      |
| `DELETE` | `/api/tickets/{id}`         | Eliminar ticket (solo admin)           |
| `GET`    | `/api/tickets/{id}/history` | Historial de cambios                   |
| `GET`    | `/api/tickets/stats`        | Resumen estadístico                   |

Cada endpoint debe tener definidos: parámetros, request body, responses y esquemas de datos.

---

## Fase 5 — Implementación

> ⏱ Tiempo sugerido: 50 min (backend + frontend)

> Usar un agente de IA para ejecutar la implementación, tomando como entrada los documentos de las fases anteriores. Documentar los prompts utilizados en `docs/ai-workflow.md`.

### Backend

Proyecto independiente en `/backend`. Elegir **una** tecnología:

- .NET Core 8+ · C# · Entity Framework Core
- Node.js · TypeScript · Express + TypeORM o Sequelize
- PHP 8.3+ · Laravel 11+ · Eloquent

**Requisitos:**

- Autenticación JWT con middleware aplicado
- Autorización por roles (`admin` / `user`)
- Validación de reglas de negocio de la spec
- Migraciones y seeders funcionales
- Relaciones correctamente definidas en el ORM

**Pruebas unitarias (mínimo 5):**

1. Login exitoso
2. Login fallido (credenciales incorrectas)
3. Creación de ticket
4. Restricción: usuario no puede reducir prioridad
5. Restricción: solo admin puede eliminar
6. (Bonus) Historial de cambios se registra correctamente

### Frontend

Proyecto independiente en `/frontend` con **React + TypeScript**.

**Requisitos:**

- Pantalla de login con manejo de JWT
- Listado de tickets con filtros por estado y prioridad (paginado)
- Formulario de creación y edición de ticket
- Indicador visual de prioridad (badges o colores)

### Docker (opcional)

Si se implementa, incluir en la raíz del proyecto:

- `Dockerfile` para el backend
- `docker-compose.yml` con servicio de app + base de datos

---

## Fase 6 — Cierre y documentación del proceso

Completar `docs/ai-workflow.md` con:

- Herramienta(s) de IA utilizadas
- Prompts clave empleados (copia textual o resumen)
- Qué se ajustó manualmente y por qué
- Decisiones tomadas que la IA no pudo tomar sola

---

## Criterios de evaluación

| Criterio                                                | Peso |
| ------------------------------------------------------- | ---- |
| Calidad y claridad de las historias de usuario (manual) | 15%  |
| Criterio aplicado al refinar con IA                     | 10%  |
| Especificación OpenAPI completa y coherente            | 15%  |
| Backend funcional con seguridad y reglas de negocio     | 25%  |
| Frontend funcional conectado a la API                   | 15%  |
| Pruebas unitarias                                       | 10%  |
| Documentación del proceso con IA                       | 10%  |

---

## Entregable

- Repositorio Git con **commits descriptivos** por fase
- Rama principal con el código final
- `README.md` en cada proyecto (`/backend` y `/frontend`) con instrucciones para correrlo localmente

> Si no alcanza a completar todo, prioriza la calidad de lo entregado sobre la cantidad. Un backend sólido con buena documentación vale más que un proyecto incompleto sin spec.
 
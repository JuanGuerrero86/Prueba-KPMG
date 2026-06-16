import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'Sistema de Gestión de Tickets API',
    version: '1.0.0',
    description: 'API REST para gestión de tickets de soporte con control de roles',
  },
  servers: [{ url: 'http://localhost:3001', description: 'Development' }],
  tags: [
    { name: 'Auth', description: 'Autenticación y sesión' },
    { name: 'Usuarios', description: 'Gestión de usuarios' },
    { name: 'Roles', description: 'Gestión de roles' },
    { name: 'Tickets', description: 'Gestión de tickets' },
    { name: 'Historial', description: 'Historial de gestiones' },
    { name: 'Sistema', description: 'Estado del sistema' },
  ],
  components: {
    securitySchemes: {
      cookieAuth: { type: 'apiKey', in: 'cookie', name: 'access_token' },
    },
    schemas: {
      ApiResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          data: { type: 'object' },
          message: { type: 'string' },
          timestamp: { type: 'string', format: 'date-time' },
        },
      },
      ApiError: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          errorCode: { type: 'string', example: 'AUTH-001' },
          message: { type: 'string' },
          details: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                field: { type: 'string' },
                message: { type: 'string' },
              },
            },
          },
          timestamp: { type: 'string', format: 'date-time' },
          correlationId: { type: 'string', format: 'uuid' },
        },
      },
      LoginDto: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email', example: 'system@app.admin' },
          password: { type: 'string', example: 'Aa123456*+' },
        },
      },
      RegisterDto: {
        type: 'object',
        required: ['email', 'nombre', 'password'],
        properties: {
          email: { type: 'string', format: 'email' },
          nombre: { type: 'string', minLength: 3 },
          password: {
            type: 'string',
            description: 'Min 8 chars, uppercase, lowercase, number, special char',
          },
        },
      },
      Ticket: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          titulo: { type: 'string' },
          descripcion: { type: 'string' },
          prioridad: { type: 'string', enum: ['baja', 'media', 'alta', 'critica'] },
          estado: { type: 'string', enum: ['abierto', 'en_progreso', 'resuelto', 'cerrado'] },
          creadoPor: { $ref: '#/components/schemas/UserSummary' },
          asignadoA: { $ref: '#/components/schemas/UserSummary', nullable: true },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      UserSummary: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          nombre: { type: 'string' },
          email: { type: 'string' },
        },
      },
      CreateTicketDto: {
        type: 'object',
        required: ['titulo', 'descripcion', 'prioridad'],
        properties: {
          titulo: { type: 'string', maxLength: 255 },
          descripcion: { type: 'string' },
          prioridad: { type: 'string', enum: ['baja', 'media', 'alta', 'critica'] },
        },
      },
      HistoricoGestion: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          tipoAccion: {
            type: 'string',
            enum: ['CREACION', 'ESTADO_CAMBIADO', 'PRIORIDAD_CAMBIADA', 'ASIGNACION', 'COMENTARIO'],
          },
          comentario: { type: 'string', nullable: true },
          estadoAnterior: { type: 'string', nullable: true },
          estadoNuevo: { type: 'string', nullable: true },
          prioridadAnterior: { type: 'string', nullable: true },
          prioridadNueva: { type: 'string', nullable: true },
          usuario: { $ref: '#/components/schemas/UserSummary' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
    },
  },
  paths: {
    '/health': {
      get: {
        tags: ['Sistema'],
        summary: 'Health check',
        responses: {
          '200': {
            description: 'Sistema operativo',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'ok' },
                    db: { type: 'string', example: 'connected' },
                    uptime: { type: 'number' },
                    timestamp: { type: 'string' },
                  },
                },
              },
            },
          },
          '503': { description: 'Sistema degradado' },
        },
      },
    },
    '/api/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Iniciar sesión',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/LoginDto' } } },
        },
        responses: {
          '200': { description: 'Login exitoso — emite cookies HttpOnly access_token y refresh_token' },
          '401': {
            description: 'Credenciales inválidas (AUTH-001)',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } },
          },
        },
      },
    },
    '/api/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Registrar nuevo usuario',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/RegisterDto' } } },
        },
        responses: {
          '201': { description: 'Usuario registrado' },
          '400': { description: 'Validación fallida (VAL-001)' },
          '409': { description: 'Email ya registrado (USER-002)' },
        },
      },
    },
    '/api/auth/refresh': {
      post: {
        tags: ['Auth'],
        summary: 'Renovar access token usando refresh token en cookie',
        responses: {
          '200': { description: 'Nuevas cookies emitidas' },
          '401': { description: 'Refresh token inválido o expirado (AUTH-004, AUTH-005)' },
        },
      },
    },
    '/api/auth/logout': {
      post: {
        tags: ['Auth'],
        summary: 'Cerrar sesión',
        security: [{ cookieAuth: [] }],
        responses: { '200': { description: 'Sesión cerrada' } },
      },
    },
    '/api/auth/me': {
      get: {
        tags: ['Auth'],
        summary: 'Obtener usuario autenticado',
        security: [{ cookieAuth: [] }],
        responses: {
          '200': { description: 'Datos del usuario' },
          '401': { description: 'No autenticado' },
        },
      },
    },
    '/api/tickets': {
      get: {
        tags: ['Tickets'],
        summary: 'Listar tickets (paginado, filtrado por rol)',
        security: [{ cookieAuth: [] }],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
          {
            name: 'estado',
            in: 'query',
            schema: { type: 'string', enum: ['abierto', 'en_progreso', 'resuelto', 'cerrado'] },
          },
          {
            name: 'prioridad',
            in: 'query',
            schema: { type: 'string', enum: ['baja', 'media', 'alta', 'critica'] },
          },
        ],
        responses: { '200': { description: 'Lista paginada de tickets' } },
      },
      post: {
        tags: ['Tickets'],
        summary: 'Crear ticket (ADMIN)',
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/CreateTicketDto' } },
          },
        },
        responses: {
          '201': { description: 'Ticket creado' },
          '403': { description: 'Requiere rol ADMIN' },
        },
      },
    },
    '/api/tickets/stats': {
      get: {
        tags: ['Tickets'],
        summary: 'Estadísticas de tickets por estado y prioridad',
        security: [{ cookieAuth: [] }],
        responses: { '200': { description: 'Estadísticas' } },
      },
    },
    '/api/tickets/unassigned': {
      get: {
        tags: ['Tickets'],
        summary: 'Tickets sin asignar (ADMIN)',
        security: [{ cookieAuth: [] }],
        responses: { '200': { description: 'Lista de tickets sin asignar' } },
      },
    },
    '/api/tickets/assign': {
      put: {
        tags: ['Tickets'],
        summary: 'Asignar tickets a usuario (ADMIN)',
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['ticketIds', 'usuarioId'],
                properties: {
                  ticketIds: { type: 'array', items: { type: 'string', format: 'uuid' } },
                  usuarioId: { type: 'string', format: 'uuid' },
                },
              },
            },
          },
        },
        responses: { '200': { description: 'Tickets asignados' } },
      },
    },
    '/api/tickets/{id}': {
      get: {
        tags: ['Tickets'],
        summary: 'Obtener ticket por ID',
        security: [{ cookieAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
        ],
        responses: {
          '200': {
            description: 'Ticket',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/Ticket' } },
            },
          },
          '404': { description: 'Ticket no encontrado (TKT-001)' },
        },
      },
      put: {
        tags: ['Tickets'],
        summary: 'Actualizar ticket',
        security: [{ cookieAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  titulo: { type: 'string' },
                  descripcion: { type: 'string' },
                  prioridad: { type: 'string', enum: ['baja', 'media', 'alta', 'critica'] },
                  estado: {
                    type: 'string',
                    enum: ['abierto', 'en_progreso', 'resuelto', 'cerrado'],
                  },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Ticket actualizado' },
          '422': { description: 'Reducción de prioridad no permitida (TKT-003)' },
        },
      },
      delete: {
        tags: ['Tickets'],
        summary: 'Eliminar ticket (ADMIN, borrado lógico)',
        security: [{ cookieAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
        ],
        responses: {
          '200': { description: 'Ticket eliminado' },
          '403': { description: 'Requiere rol ADMIN' },
        },
      },
    },
    '/api/tickets/{id}/history': {
      get: {
        tags: ['Historial'],
        summary: 'Obtener historial del ticket',
        security: [{ cookieAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
        ],
        responses: {
          '200': {
            description: 'Historial ordenado cronológicamente (ASC)',
            content: {
              'application/json': {
                schema: { type: 'array', items: { $ref: '#/components/schemas/HistoricoGestion' } },
              },
            },
          },
        },
      },
      post: {
        tags: ['Historial'],
        summary: 'Agregar gestión manual al historial',
        security: [{ cookieAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['tipoAccion'],
                properties: {
                  tipoAccion: { type: 'string', enum: ['COMENTARIO'] },
                  comentario: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          '201': { description: 'Gestión registrada' },
          '400': { description: 'Comentario requerido para tipo COMENTARIO (HIST-001)' },
        },
      },
    },
    '/api/users': {
      get: {
        tags: ['Usuarios'],
        summary: 'Listar usuarios (paginado, ADMIN)',
        security: [{ cookieAuth: [] }],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
          { name: 'search', in: 'query', schema: { type: 'string' } },
        ],
        responses: { '200': { description: 'Lista paginada de usuarios' } },
      },
      post: {
        tags: ['Usuarios'],
        summary: 'Crear usuario (ADMIN)',
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/RegisterDto' } } },
        },
        responses: {
          '201': { description: 'Usuario creado' },
          '409': { description: 'Email duplicado (USER-002)' },
        },
      },
    },
    '/api/users/all': {
      get: {
        tags: ['Usuarios'],
        summary: 'Todos los usuarios sin paginación (para selectores)',
        security: [{ cookieAuth: [] }],
        responses: { '200': { description: 'Lista completa de usuarios' } },
      },
    },
    '/api/users/{id}': {
      get: {
        tags: ['Usuarios'],
        summary: 'Obtener usuario por ID (ADMIN)',
        security: [{ cookieAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
        ],
        responses: {
          '200': { description: 'Usuario' },
          '404': { description: 'No encontrado (USER-001)' },
        },
      },
      put: {
        tags: ['Usuarios'],
        summary: 'Actualizar usuario (ADMIN)',
        security: [{ cookieAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
        ],
        responses: { '200': { description: 'Usuario actualizado' } },
      },
      delete: {
        tags: ['Usuarios'],
        summary: 'Eliminar usuario (ADMIN, borrado lógico)',
        security: [{ cookieAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
        ],
        responses: {
          '200': { description: 'Usuario eliminado' },
          '422': { description: 'No se puede eliminar system@app.admin (USER-004)' },
        },
      },
    },
    '/api/users/{id}/toggle': {
      patch: {
        tags: ['Usuarios'],
        summary: 'Activar/desactivar usuario (ADMIN)',
        security: [{ cookieAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
        ],
        responses: { '200': { description: 'Estado actualizado' } },
      },
    },
    '/api/users/{id}/roles': {
      post: {
        tags: ['Usuarios'],
        summary: 'Asignar roles a usuario (ADMIN)',
        security: [{ cookieAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  roleIds: { type: 'array', items: { type: 'string', format: 'uuid' } },
                },
              },
            },
          },
        },
        responses: { '200': { description: 'Roles asignados' } },
      },
    },
    '/api/roles': {
      get: {
        tags: ['Roles'],
        summary: 'Listar roles activos (ADMIN)',
        security: [{ cookieAuth: [] }],
        responses: { '200': { description: 'Lista de roles' } },
      },
      post: {
        tags: ['Roles'],
        summary: 'Crear rol (ADMIN)',
        security: [{ cookieAuth: [] }],
        responses: { '201': { description: 'Rol creado' } },
      },
    },
  },
};

export function setupSwagger(app: Express) {
  app.use(
    '/api/docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerDocument, { customSiteTitle: 'Tickets API Docs' }),
  );
}

Actua como Arquitecto de software para generar un proyecto Backend en Nodejs, Express.js TypeORM para los sigueintes casos de uso y caracteristicas del sistema.

Caracteristicas:
- Arquitectura del proyecto Spec Driven Development (SDD)
- Se debe contar con control de acceso a niveles internos del sistema con JWT, Algoritno RS256, se manejara llave publica y privada siendoe ste un microservicio con posibilidad provee informacion a otros microservicios.
- Se tendra un endpoint de registro y de login los cuales no estaran protegidos por medio de un middelware, por lo demas los endpoint deberan estar ptoegidos por medio de un middelware
- Cuando se ejcute un login exitoso debera provee dos cookies HttpONly con el acces_toklen y el refresh_token para la autenticacion del usuario
- access_token debera tener una vigencia de 15min
- refresh_token debera tener una vigencia de  7 dias
- Se debe contar con un archivo de configuracion de variables de entorno para configurar, Conexcion a bases de datos, Llaves publica y privada apra JWT, Tiempos de exipiracion de token, CORS, siendo que se puedan encadenar por medio una (,) los diferentes dominio con acceso al recurso
- Para este proyecto se tendra un control de roles para lo caul dentro de los claims del token se debera cargar el user_id y los reoles a lso cuales el usuaro tiene acceso
- Este proyecto debera contener la documentacion sobre los endpoints expuestos por medio de Swagger[OpenIA], Debera documentar Payload y respuestas de las mismas.
- Este proyecto debera tambien contener los archivo Dockerfile y Dockerfile.dev para los ambientes de produccion y desarrollo
- Este proyecto debera contener los archivos docker-compose.yml y docker-compose-dev.yml para los ambientes de desarrollo y produccion respectivamente
- Se debe contar con una carpeta de LOGs, la cual registrara los eventos INFO | ERROR | WARNING | DEBUG,
- Para los logs se debera manejar una politica de un archivo de logs por dia
- Se be contar con las migraciones iniciales para la base de datos tenitendo encuenta las tablas especificadas en el apartado BASE_DATOS
- Se debe contar on un SET de pruebas sober los endpoints desarrollados.
-El sistema manejara unicamente borrado logico, no se ejecutaran acciones de DELETE directamente sobre la base de datos amenos de que algun endpoint en especifico lo requiera

- Es sisteme debe contar con sedders  para cargar los roles iniciales, Administrador - ADMIN , GESTIONADOR - OPERATIVO
- Se debe generar el primer usuario como adnistridaro general del sistema system@app.admin - Aa123456*+



Casos de uso:
El sistema debera contener la logica de negocio mencionada en este aprtado:

Todos los usuarios contaran con 
-Login via correo y contraseña
-Registro de usuario publico

- 
Como [Administrador], quiero [crear][editar][softdelete][listar][paginar] usuario del sistemas
Como [Administrador], quiero  [asingar] roles a un usuario
Como [Administrador], quiero inhabilitar usuarios
Como [Administrador], quiero [crear] tickets
Como [Administrador], quiero  [asignar] titckets
Como [Administrador], quiero  [actualizar] un ticket
Como [Administrador], quiero  [conulstar] estadisticas de los tickets  [tickets por estado, tickets por prioridad]


Como [Gestionardor], quiero [consultar] mis tockets asignados, finalizados
Como [Gestionardor], quiero [gestionar] poder agregar acciones osber el historico del tocket y asctualziar su estado segun sea conveniente
Como [Gestionardor], quiero 
Como [Gestionardor], quiero  [conulstar] estadisticas de mis tickets  [tickets por estado, tickets por prioridad]


BASE_DATOS

Roles
- nombre
- key
- is_active
- current_stamps [created_at, deleted_at, update_at]


Roles Usuario
- usuario_id
- roles_id

Usuario
- email
- nombre
- password
- is_active
- current_stamps [created_at, deleted_at, update_at]




Tickets
- Título 
- descripción
- Prioridad: `baja | media | alta | crítica`
- Estado: `abierto | en progreso | resuelto | cerrado`
- Asignado a (usuario)

Hitorico_gestion


ENDPOINTS BASE

| Método    | Ruta                          | Descripción                           |
| ---------- | ----------------------------- | -------------------------------------- |
| `POST`   | `/api/auth/register`        | Registro de usuario                    |
| `POST`   | `/api/auth/login`           | Login, retorna JWT    HttpONly                 |
| `GET`    | `/api/tickets`              | Listar tickets (filtros + paginación) |
| `POST`   | `/api/tickets`              | Crear ticket                           |
| `GET`    | `/api/tickets/{id}`         | Obtener ticket por ID                  |
| `PUT`    | `/api/tickets/{id}`         | Actualizar ticket                      |
| `DELETE` | `/api/tickets/{id}`         | Eliminar ticket (solo admin)           |
| `GET`    | `/api/tickets/{id}/history` | Historial de cambios                   |
| `GET`    | `/api/tickets/stats`        | Resumen estadístico                   |


Se debera tener adicional a estos:

Endpoints para CRUD de usuarios
Endpoints para CRUD de roles

Endpoint para listar usuarios sin paginacion
Endpoint para lsitar usuario con paginacion
Endpoint para lsitar todos los roles activos
Endpoint para listar todos los tickets  que no tengan usuario asignado
Endpoint para asignar Uno o varios tocket a un usuario
Endpoint para consultar los tockets que tiene asignado un usuario.
Este endpoint debe estar organizado por fecha de creacion, /api/tickets/{id}/history y debe mostrar la persona que realizo esa gestion



FRONTEND
Actua como un desarrollador SENIOR React, para desarrollar un aplicativo en REACT con este disgnSystem https://api.anthropic.com/v1/design/h/rYcQVOUehfKFkbWbhlpDNg?open_file=Design+System.dc.html.

Este proyecto tendra una vista incial de Login correo y contraseña, la contraseña debe contener el icono de ojo que permita ver la contraseña sin los ****

 -Una vez se ejecute de manera exitosa el Login, se debera pasar al dashboar el cual puede ser orientado apra dos tipos de usuarios inicial mente
ADMIN,
 - El usuario admisnitrador podra ver los menus de Usuario y tickets, el usuario Gestionador podra ver solo el menu de tickets
 - Se bdera tener una visual para el CRUD de tickets teniendo en cueenta el modelo de base de datos de la seccion BASE_DATOS-
 - Se debe tener un apartado donde se podra realizar la asignacion de tockets a un usuario siendo que un usuario peude tener uno o muchos tockets asignados, para esto se dbera usar el endpoint de listar usuarios desde el apartado de tickets.
 - Un ticket solo podra estar gestionado por un usuario
 - Se debe tener una visual para realziar el CRUD de Usuarios, 
 - Se debe tener una visual donde se pueda visializar el historico de gestion que va a tener un tocket ordenado por su timestamp de created_at
 - Este proyecto debe contener pruebas unitarias donde se cubran como minimo estos casos:
    1. Login exitoso
    2. Login fallido (credenciales incorrectas)
    3. Creación de ticket
    4. Restricción: usuario no puede reducir prioridad
    5. Restricción: solo admin puede eliminar
ademas de los demas escenarios de logica de negocio
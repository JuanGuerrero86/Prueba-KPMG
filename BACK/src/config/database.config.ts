import { DataSource } from 'typeorm';
import { env } from './env.config';
import { Rol } from '../entities/Rol.entity';
import { Usuario } from '../entities/Usuario.entity';
import { UsuarioRol } from '../entities/UsuarioRol.entity';
import { RefreshToken } from '../entities/RefreshToken.entity';
import { Ticket } from '../entities/Ticket.entity';
import { HistoricoGestion } from '../entities/HistoricoGestion.entity';
import { CreateRoles1750000000000 } from '../migrations/1750000000000-CreateRoles';
import { CreateUsuarios1750000001000 } from '../migrations/1750000001000-CreateUsuarios';
import { CreateUsuarioRoles1750000002000 } from '../migrations/1750000002000-CreateUsuarioRoles';
import { CreateRefreshTokens1750000003000 } from '../migrations/1750000003000-CreateRefreshTokens';
import { CreateTickets1750000004000 } from '../migrations/1750000004000-CreateTickets';
import { CreateHistoricoGestion1750000005000 } from '../migrations/1750000005000-CreateHistoricoGestion';

const isTest = env.NODE_ENV === 'test';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: env.DB.HOST,
  port: env.DB.PORT,
  username: env.DB.USER,
  password: env.DB.PASSWORD,
  database: isTest ? env.DB.NAME_TEST : env.DB.NAME,
  entities: [Rol, Usuario, UsuarioRol, RefreshToken, Ticket, HistoricoGestion],
  migrations: [
    CreateRoles1750000000000,
    CreateUsuarios1750000001000,
    CreateUsuarioRoles1750000002000,
    CreateRefreshTokens1750000003000,
    CreateTickets1750000004000,
    CreateHistoricoGestion1750000005000,
  ],
  synchronize: false,
  logging: env.NODE_ENV === 'development',
  extra: {
    max: 10,
    idleTimeoutMillis: 30000,
  },
});

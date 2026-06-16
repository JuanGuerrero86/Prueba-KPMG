import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
} from 'typeorm';
import { UsuarioRol } from './UsuarioRol.entity';
import { RefreshToken } from './RefreshToken.entity';
import { Ticket } from './Ticket.entity';

@Entity('usuarios')
export class Usuario {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 255 })
  email: string;

  @Column({ length: 255 })
  nombre: string;

  @Column()
  password: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date | null;

  @OneToMany(() => UsuarioRol, (ur) => ur.usuario)
  usuarioRoles: UsuarioRol[];

  @OneToMany(() => RefreshToken, (rt) => rt.usuario)
  refreshTokens: RefreshToken[];

  @OneToMany(() => Ticket, (t) => t.creadoPor)
  ticketsCreados: Ticket[];

  @OneToMany(() => Ticket, (t) => t.asignadoA)
  ticketsAsignados: Ticket[];
}

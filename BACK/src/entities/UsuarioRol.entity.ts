import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Usuario } from './Usuario.entity';
import { Rol } from './Rol.entity';

@Entity('usuario_roles')
export class UsuarioRol {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  usuarioId: string;

  @Column()
  rolId: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Usuario, (u) => u.usuarioRoles, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'usuarioId' })
  usuario: Usuario;

  @ManyToOne(() => Rol, (r) => r.usuarioRoles, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'rolId' })
  rol: Rol;
}

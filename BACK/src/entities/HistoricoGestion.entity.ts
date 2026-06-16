import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Ticket } from './Ticket.entity';
import { Usuario } from './Usuario.entity';

export enum TipoAccion {
  CREACION = 'CREACION',
  ASIGNACION = 'ASIGNACION',
  ESTADO_CAMBIADO = 'ESTADO_CAMBIADO',
  PRIORIDAD_CAMBIADA = 'PRIORIDAD_CAMBIADA',
  COMENTARIO = 'COMENTARIO',
}

@Entity('historico_gestion')
@Index(['ticketId'])
@Index(['usuarioId'])
@Index(['tipoAccion'])
export class HistoricoGestion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  ticketId: string;

  @Column()
  usuarioId: string;

  @Column({ type: 'enum', enum: TipoAccion })
  tipoAccion: TipoAccion;

  @Column({ type: 'text', nullable: true })
  comentario: string | null;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, unknown> | null;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Ticket, (t) => t.historico, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ticketId' })
  ticket: Ticket;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'usuarioId' })
  usuario: Usuario;
}

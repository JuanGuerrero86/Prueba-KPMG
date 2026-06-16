import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Usuario } from './Usuario.entity';
import { HistoricoGestion } from './HistoricoGestion.entity';

export enum Prioridad {
  BAJA = 'baja',
  MEDIA = 'media',
  ALTA = 'alta',
  CRITICA = 'critica',
}

export enum EstadoTicket {
  ABIERTO = 'abierto',
  EN_PROGRESO = 'en_progreso',
  RESUELTO = 'resuelto',
  CERRADO = 'cerrado',
}

@Entity('tickets')
export class Ticket {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  titulo: string;

  @Column({ type: 'text' })
  descripcion: string;

  @Column({ type: 'enum', enum: Prioridad })
  prioridad: Prioridad;

  @Column({ type: 'enum', enum: EstadoTicket, default: EstadoTicket.ABIERTO })
  estado: EstadoTicket;

  @Column()
  creadoPorId: string;

  @Column({ nullable: true })
  asignadoAId: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date | null;

  @ManyToOne(() => Usuario, (u) => u.ticketsCreados)
  @JoinColumn({ name: 'creadoPorId' })
  creadoPor: Usuario;

  @ManyToOne(() => Usuario, (u) => u.ticketsAsignados, { nullable: true })
  @JoinColumn({ name: 'asignadoAId' })
  asignadoA: Usuario | null;

  @OneToMany(() => HistoricoGestion, (h) => h.ticket)
  historico: HistoricoGestion[];
}

import {
  IsString,
  IsOptional,
  IsEnum,
  IsArray,
  IsUUID,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Prioridad, EstadoTicket } from '../../entities/Ticket.entity';

export class CreateTicketDto {
  @IsString()
  titulo: string;

  @IsString()
  descripcion: string;

  @IsEnum(Prioridad)
  prioridad: Prioridad;

  @IsOptional()
  @IsEnum(EstadoTicket)
  estado?: EstadoTicket;
}

export class UpdateTicketDto {
  @IsOptional()
  @IsString()
  titulo?: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsEnum(Prioridad)
  prioridad?: Prioridad;

  @IsOptional()
  @IsEnum(EstadoTicket)
  estado?: EstadoTicket;
}

export class AssignTicketsDto {
  @IsArray()
  @IsUUID('4', { each: true })
  ticketIds: string[];

  @IsUUID('4')
  usuarioId: string;
}

export class TicketQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @IsOptional()
  @IsEnum(EstadoTicket)
  estado?: EstadoTicket;

  @IsOptional()
  @IsEnum(Prioridad)
  prioridad?: Prioridad;

  @IsOptional()
  @IsUUID()
  asignadoA?: string;
}

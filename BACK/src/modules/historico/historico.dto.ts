import { IsEnum, IsOptional, IsString, ValidateIf } from 'class-validator';
import { TipoAccion } from '../../entities/HistoricoGestion.entity';

export class CreateHistoricoDto {
  @IsEnum(TipoAccion)
  tipoAccion: TipoAccion;

  @ValidateIf((o) => o.tipoAccion === TipoAccion.COMENTARIO)
  @IsString()
  comentario?: string;
}

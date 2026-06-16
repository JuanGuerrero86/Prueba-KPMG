import { IsString, MinLength, IsOptional, IsBoolean } from 'class-validator';

export class CreateRolDto {
  @IsString()
  @MinLength(2)
  nombre: string;

  @IsString()
  @MinLength(2)
  key: string;
}

export class UpdateRolDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  nombre?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

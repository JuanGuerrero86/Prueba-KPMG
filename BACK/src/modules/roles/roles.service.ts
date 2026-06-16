import { AppDataSource } from '../../config/database.config';
import { Rol } from '../../entities/Rol.entity';
import { ConflictError, NotFoundError } from '../../shared/errors/AppError';
import { CreateRolDto, UpdateRolDto } from './roles.dto';

export class RolesService {
  private get repo() {
    return AppDataSource.getRepository(Rol);
  }

  async findAll() {
    return this.repo.find({ where: { isActive: true } });
  }

  async create(dto: CreateRolDto) {
    const exists = await this.repo.findOne({ where: { key: dto.key } });
    if (exists) throw new ConflictError('USER-003', `Role key '${dto.key}' already exists`);
    const rol = this.repo.create(dto);
    return this.repo.save(rol);
  }

  async update(id: string, dto: UpdateRolDto) {
    const rol = await this.repo.findOne({ where: { id } });
    if (!rol) throw new NotFoundError('USER-001', 'Role not found');
    Object.assign(rol, dto);
    return this.repo.save(rol);
  }

  async softDelete(id: string) {
    const rol = await this.repo.findOne({ where: { id } });
    if (!rol) throw new NotFoundError('USER-001', 'Role not found');
    await this.repo.softDelete(id);
    return { message: 'Role deleted' };
  }
}

export const rolesService = new RolesService();

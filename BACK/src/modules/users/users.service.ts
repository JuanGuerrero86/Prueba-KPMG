import bcrypt from 'bcryptjs';
import { ILike, In } from 'typeorm';
import { AppDataSource } from '../../config/database.config';
import { Usuario } from '../../entities/Usuario.entity';
import { UsuarioRol } from '../../entities/UsuarioRol.entity';
import { Rol } from '../../entities/Rol.entity';
import { NotFoundError, ConflictError, BusinessRuleError } from '../../shared/errors/AppError';
import { CreateUserDto, UpdateUserDto, AssignRolesDto, PaginationQueryDto } from './users.dto';

const ADMIN_EMAIL = 'system@app.admin';

export class UsersService {
  private get repo() {
    return AppDataSource.getRepository(Usuario);
  }
  private get urRepo() {
    return AppDataSource.getRepository(UsuarioRol);
  }
  private get rolRepo() {
    return AppDataSource.getRepository(Rol);
  }

  async findPaginated(query: PaginationQueryDto) {
    const { page = 1, limit = 10, search } = query;
    const where = search
      ? ([{ nombre: ILike(`%${search}%`) }, { email: ILike(`%${search}%`) }] as any)
      : undefined;
    const [data, total] = await this.repo.findAndCount({
      where,
      relations: { usuarioRoles: { rol: true } },
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });
    return { data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async findAll() {
    return this.repo.find({ relations: { usuarioRoles: { rol: true } } });
  }

  async findById(id: string) {
    const user = await this.repo.findOne({
      where: { id },
      relations: { usuarioRoles: { rol: true } },
    });
    if (!user) throw new NotFoundError('USER-001', 'User not found');
    return user;
  }

  async create(dto: CreateUserDto) {
    const exists = await this.repo.findOne({ where: { email: dto.email } });
    if (exists) throw new ConflictError('USER-002', 'Email already registered');
    const hashed = await bcrypt.hash(dto.password, 12);
    const user = this.repo.create({ ...dto, password: hashed });
    return this.repo.save(user);
  }

  async update(id: string, dto: UpdateUserDto) {
    const user = await this.findById(id);
    if (dto.email && dto.email !== user.email) {
      const exists = await this.repo.findOne({ where: { email: dto.email } });
      if (exists) throw new ConflictError('USER-002', 'Email already registered');
    }
    if (dto.password) {
      dto.password = await bcrypt.hash(dto.password, 12);
    }
    Object.assign(user, dto);
    return this.repo.save(user);
  }

  async softDelete(id: string) {
    const user = await this.findById(id);
    if (user.email === ADMIN_EMAIL) {
      throw new BusinessRuleError('USER-004', 'Cannot delete system admin');
    }
    await this.repo.softDelete(id);
    return { message: 'User deleted' };
  }

  async toggle(id: string) {
    const user = await this.findById(id);
    user.isActive = !user.isActive;
    return this.repo.save(user);
  }

  async assignRoles(id: string, dto: AssignRolesDto) {
    await this.findById(id);
    await this.urRepo.delete({ usuarioId: id });
    const roles = await this.rolRepo.findBy({ id: In(dto.roleIds) });
    const newRoles = roles.map((rol) => this.urRepo.create({ usuarioId: id, rolId: rol.id }));
    await this.urRepo.save(newRoles);
    return this.findById(id);
  }
}

export const usersService = new UsersService();

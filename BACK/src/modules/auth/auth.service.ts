import bcrypt from 'bcryptjs';
import { randomUUID as uuidv4 } from 'crypto';
import { AppDataSource } from '../../config/database.config';
import { signAccessToken } from '../../config/jwt.config';
import { env } from '../../config/env.config';
import { Usuario } from '../../entities/Usuario.entity';
import { RefreshToken } from '../../entities/RefreshToken.entity';
import { UsuarioRol } from '../../entities/UsuarioRol.entity';
import { Rol } from '../../entities/Rol.entity';
import {
  UnauthorizedError,
  ConflictError,
} from '../../shared/errors/AppError';
import { RegisterDto, LoginDto } from './auth.dto';

export class AuthService {
  private get userRepo() {
    return AppDataSource.getRepository(Usuario);
  }

  private get tokenRepo() {
    return AppDataSource.getRepository(RefreshToken);
  }

  private get rolRepo() {
    return AppDataSource.getRepository(Rol);
  }

  async register(dto: RegisterDto) {
    const exists = await this.userRepo.findOne({ where: { email: dto.email } });
    if (exists) {
      throw new ConflictError('USER-002', 'Email already registered');
    }
    const hashed = await bcrypt.hash(dto.password, 12);
    const user = this.userRepo.create({ email: dto.email, nombre: dto.nombre, password: hashed });
    await this.userRepo.save(user);
    const { password: _p, ...safe } = user;
    return safe;
  }

  async login(dto: LoginDto) {
    const user = await this.userRepo.findOne({
      where: { email: dto.email },
      relations: { usuarioRoles: { rol: true } },
    });
    if (!user) throw new UnauthorizedError('AUTH-001', 'Invalid credentials');
    if (!user.isActive) throw new UnauthorizedError('AUTH-007', 'Account is inactive');

    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) throw new UnauthorizedError('AUTH-001', 'Invalid credentials');

    const roles = user.usuarioRoles.map((ur) => ur.rol.key);
    const accessToken = signAccessToken({ sub: user.id, roles });
    const refreshTokenValue = uuidv4();

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const refreshToken = this.tokenRepo.create({
      token: refreshTokenValue,
      usuarioId: user.id,
      expiresAt,
    });
    await this.tokenRepo.save(refreshToken);

    return {
      accessToken,
      refreshToken: refreshTokenValue,
      user: { id: user.id, email: user.email, nombre: user.nombre, roles },
    };
  }

  async refresh(tokenOpaco: string) {
    const tokenRecord = await this.tokenRepo.findOne({
      where: { token: tokenOpaco },
      relations: { usuario: { usuarioRoles: { rol: true } } },
    });

    if (!tokenRecord || tokenRecord.isRevoked) {
      throw new UnauthorizedError('AUTH-004', 'Invalid refresh token');
    }

    if (tokenRecord.expiresAt < new Date()) {
      tokenRecord.isRevoked = true;
      await this.tokenRepo.save(tokenRecord);
      throw new UnauthorizedError('AUTH-005', 'Refresh token expired');
    }

    tokenRecord.isRevoked = true;
    await this.tokenRepo.save(tokenRecord);

    const user = tokenRecord.usuario;
    const roles = user.usuarioRoles.map((ur) => ur.rol.key);
    const accessToken = signAccessToken({ sub: user.id, roles });
    const newRefreshTokenValue = uuidv4();

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const newToken = this.tokenRepo.create({
      token: newRefreshTokenValue,
      usuarioId: user.id,
      expiresAt,
    });
    await this.tokenRepo.save(newToken);

    return { accessToken, refreshToken: newRefreshTokenValue };
  }

  async logout(tokenOpaco: string) {
    await this.tokenRepo.update({ token: tokenOpaco }, { isRevoked: true });
    return { message: 'Logged out successfully' };
  }

  async me(userId: string) {
    const user = await this.userRepo.findOne({
      where: { id: userId },
      relations: { usuarioRoles: { rol: true } },
    });
    if (!user) throw new UnauthorizedError('AUTH-001', 'User not found');
    const roles = user.usuarioRoles.map((ur) => ur.rol.key);
    return { id: user.id, email: user.email, nombre: user.nombre, roles };
  }
}

export const authService = new AuthService();

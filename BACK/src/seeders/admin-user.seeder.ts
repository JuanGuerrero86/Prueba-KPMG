import bcrypt from 'bcryptjs';
import { AppDataSource } from '../config/database.config';
import { Usuario } from '../entities/Usuario.entity';
import { Rol } from '../entities/Rol.entity';
import { UsuarioRol } from '../entities/UsuarioRol.entity';

const ADMIN_EMAIL = 'system@app.admin';

export async function seedAdminUser() {
  const userRepo = AppDataSource.getRepository(Usuario);
  const rolRepo = AppDataSource.getRepository(Rol);
  const urRepo = AppDataSource.getRepository(UsuarioRol);

  let admin = await userRepo.findOne({ where: { email: ADMIN_EMAIL } });
  if (!admin) {
    const hashed = await bcrypt.hash('Aa123456*+', 12);
    admin = await userRepo.save(
      userRepo.create({ email: ADMIN_EMAIL, nombre: 'System Admin', password: hashed }),
    );
    console.log('Admin user created');
  } else {
    console.log('Admin user already exists');
  }

  const adminRol = await rolRepo.findOne({ where: { key: 'ADMIN' } });
  if (adminRol) {
    const hasRole = await urRepo.findOne({
      where: { usuarioId: admin.id, rolId: adminRol.id },
    });
    if (!hasRole) {
      await urRepo.save(urRepo.create({ usuarioId: admin.id, rolId: adminRol.id }));
      console.log('Admin role assigned');
    }
  }
}

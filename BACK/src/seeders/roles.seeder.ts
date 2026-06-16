import { AppDataSource } from '../config/database.config';
import { Rol } from '../entities/Rol.entity';

export async function seedRoles() {
  const repo = AppDataSource.getRepository(Rol);
  const roles = [
    { nombre: 'Administrador', key: 'ADMIN', isActive: true },
    { nombre: 'Gestionador', key: 'OPERATIVO', isActive: true },
  ];

  for (const r of roles) {
    const exists = await repo.findOne({ where: { key: r.key } });
    if (!exists) {
      await repo.save(repo.create(r));
      console.log(`Role ${r.key} created`);
    } else {
      console.log(`Role ${r.key} already exists`);
    }
  }
}

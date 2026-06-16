import 'reflect-metadata';
import { AppDataSource } from '../config/database.config';
import { seedRoles } from './roles.seeder';
import { seedAdminUser } from './admin-user.seeder';

async function run() {
  await AppDataSource.initialize();
  await seedRoles();
  await seedAdminUser();
  await AppDataSource.destroy();
  console.log('Seeding complete');
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});

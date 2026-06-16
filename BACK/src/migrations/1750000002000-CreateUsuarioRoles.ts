import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUsuarioRoles1750000002000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "usuario_roles" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "usuarioId" uuid NOT NULL,
        "rolId" uuid NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_usuario_roles" PRIMARY KEY ("id"),
        CONSTRAINT "FK_usuario_roles_usuario" FOREIGN KEY ("usuarioId")
          REFERENCES "usuarios"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_usuario_roles_rol" FOREIGN KEY ("rolId")
          REFERENCES "roles"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX "UQ_usuario_roles_usuario_rol" ON "usuario_roles" ("usuarioId", "rolId")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "usuario_roles"`);
  }
}

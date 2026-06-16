import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTickets1750000004000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "ticket_prioridad_enum" AS ENUM ('baja', 'media', 'alta', 'critica')
    `);
    await queryRunner.query(`
      CREATE TYPE "ticket_estado_enum" AS ENUM ('abierto', 'en_progreso', 'resuelto', 'cerrado')
    `);
    await queryRunner.query(`
      CREATE TABLE "tickets" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "titulo" character varying(255) NOT NULL,
        "descripcion" text NOT NULL,
        "prioridad" "ticket_prioridad_enum" NOT NULL,
        "estado" "ticket_estado_enum" NOT NULL DEFAULT 'abierto',
        "creadoPorId" uuid NOT NULL,
        "asignadoAId" uuid,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "deletedAt" TIMESTAMP,
        CONSTRAINT "PK_tickets" PRIMARY KEY ("id"),
        CONSTRAINT "FK_tickets_creado_por" FOREIGN KEY ("creadoPorId")
          REFERENCES "usuarios"("id"),
        CONSTRAINT "FK_tickets_asignado_a" FOREIGN KEY ("asignadoAId")
          REFERENCES "usuarios"("id") ON DELETE SET NULL
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "tickets"`);
    await queryRunner.query(`DROP TYPE "ticket_estado_enum"`);
    await queryRunner.query(`DROP TYPE "ticket_prioridad_enum"`);
  }
}

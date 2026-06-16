import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateHistoricoGestion1750000005000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "historico_tipo_accion_enum" AS ENUM (
        'CREACION', 'ESTADO_CAMBIADO', 'PRIORIDAD_CAMBIADA', 'ASIGNACION', 'COMENTARIO'
      )
    `);
    await queryRunner.query(`
      CREATE TABLE "historico_gestion" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "ticketId" uuid NOT NULL,
        "usuarioId" uuid NOT NULL,
        "tipoAccion" "historico_tipo_accion_enum" NOT NULL,
        "comentario" text,
        "estadoAnterior" character varying(50),
        "estadoNuevo" character varying(50),
        "prioridadAnterior" character varying(50),
        "prioridadNueva" character varying(50),
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_historico_gestion" PRIMARY KEY ("id"),
        CONSTRAINT "FK_historico_ticket" FOREIGN KEY ("ticketId")
          REFERENCES "tickets"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_historico_usuario" FOREIGN KEY ("usuarioId")
          REFERENCES "usuarios"("id")
      )
    `);
    await queryRunner.query(`CREATE INDEX "IDX_hg_ticketId" ON "historico_gestion" ("ticketId")`);
    await queryRunner.query(`CREATE INDEX "IDX_hg_usuarioId" ON "historico_gestion" ("usuarioId")`);
    await queryRunner.query(`CREATE INDEX "IDX_hg_createdAt" ON "historico_gestion" ("createdAt" DESC)`);
    await queryRunner.query(`CREATE INDEX "IDX_hg_tipoAccion" ON "historico_gestion" ("tipoAccion")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "historico_gestion"`);
    await queryRunner.query(`DROP TYPE "historico_tipo_accion_enum"`);
  }
}

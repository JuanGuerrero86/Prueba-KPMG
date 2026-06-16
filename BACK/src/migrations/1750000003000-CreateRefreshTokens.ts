import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateRefreshTokens1750000003000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "refresh_tokens" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "token" character varying(255) NOT NULL,
        "usuarioId" uuid NOT NULL,
        "isRevoked" boolean NOT NULL DEFAULT false,
        "expiresAt" TIMESTAMP NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_refresh_tokens" PRIMARY KEY ("id"),
        CONSTRAINT "FK_refresh_tokens_usuario" FOREIGN KEY ("usuarioId")
          REFERENCES "usuarios"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(`CREATE INDEX "IDX_rt_token_revoked" ON "refresh_tokens" ("token", "isRevoked")`);
    await queryRunner.query(`CREATE INDEX "IDX_rt_usuario_revoked" ON "refresh_tokens" ("usuarioId", "isRevoked")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "refresh_tokens"`);
  }
}

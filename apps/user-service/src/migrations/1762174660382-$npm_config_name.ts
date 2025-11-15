import { MigrationInterface, QueryRunner } from "typeorm";

export class  $npmConfigName1762174660382 implements MigrationInterface {
    name = ' $npmConfigName1762174660382'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user_entity\` DROP COLUMN \`note\``);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user_entity\` ADD \`note\` varchar(255) NOT NULL DEFAULT ''`);
    }

}

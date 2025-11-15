import { MigrationInterface, QueryRunner } from "typeorm";

export class  $npmConfigName1762188502419 implements MigrationInterface {
    name = ' $npmConfigName1762188502419'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user_security_entity\` ADD \`passwordConfirm\` varchar(255) NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user_security_entity\` DROP COLUMN \`passwordConfirm\``);
    }

}

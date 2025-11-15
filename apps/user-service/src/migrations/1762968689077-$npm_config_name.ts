import { MigrationInterface, QueryRunner } from "typeorm";

export class  $npmConfigName1762968689077 implements MigrationInterface {
    name = ' $npmConfigName1762968689077'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user_security_entity\` DROP COLUMN \`passwordConfirm\``);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user_security_entity\` ADD \`passwordConfirm\` varchar(255) NOT NULL`);
    }

}

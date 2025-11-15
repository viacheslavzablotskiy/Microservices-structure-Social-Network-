import { MigrationInterface, QueryRunner } from "typeorm";

export class  $npmConfigName1762264950741 implements MigrationInterface {
    name = ' $npmConfigName1762264950741'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX \`IDX_48574988bda742dc436132943c\` ON \`user_profile_entity\``);
        await queryRunner.query(`ALTER TABLE \`user_profile_entity\` DROP COLUMN \`avatarUrl\``);
        await queryRunner.query(`ALTER TABLE \`user_profile_entity\` DROP COLUMN \`coverUrl\``);
        await queryRunner.query(`ALTER TABLE \`user_profile_entity\` DROP COLUMN \`login\``);
        await queryRunner.query(`ALTER TABLE \`user_entity\` ADD \`login\` varchar(255) NOT NULL DEFAULT ''`);
        await queryRunner.query(`ALTER TABLE \`user_entity\` ADD UNIQUE INDEX \`IDX_e74b542753b5bf00d728607f81\` (\`login\`)`);
        await queryRunner.query(`ALTER TABLE \`user_entity\` ADD \`avatarUrl\` varchar(255) NOT NULL DEFAULT ''`);
        await queryRunner.query(`ALTER TABLE \`user_entity\` ADD \`coverUrl\` varchar(255) NOT NULL DEFAULT ''`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user_entity\` DROP COLUMN \`coverUrl\``);
        await queryRunner.query(`ALTER TABLE \`user_entity\` DROP COLUMN \`avatarUrl\``);
        await queryRunner.query(`ALTER TABLE \`user_entity\` DROP INDEX \`IDX_e74b542753b5bf00d728607f81\``);
        await queryRunner.query(`ALTER TABLE \`user_entity\` DROP COLUMN \`login\``);
        await queryRunner.query(`ALTER TABLE \`user_profile_entity\` ADD \`login\` varchar(255) NOT NULL DEFAULT ''`);
        await queryRunner.query(`ALTER TABLE \`user_profile_entity\` ADD \`coverUrl\` varchar(255) NOT NULL DEFAULT ''`);
        await queryRunner.query(`ALTER TABLE \`user_profile_entity\` ADD \`avatarUrl\` varchar(255) NOT NULL DEFAULT ''`);
        await queryRunner.query(`CREATE UNIQUE INDEX \`IDX_48574988bda742dc436132943c\` ON \`user_profile_entity\` (\`login\`)`);
    }

}

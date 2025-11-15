import { MigrationInterface, QueryRunner } from "typeorm";

export class  $npmConfigName1762113118577 implements MigrationInterface {
    name = ' $npmConfigName1762113118577'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`user_profile_entity\` (\`id\` int NOT NULL AUTO_INCREMENT, \`firstname\` varchar(255) NOT NULL DEFAULT '', \`lastname\` varchar(255) NOT NULL DEFAULT '', \`login\` varchar(255) NOT NULL DEFAULT '', \`bio\` varchar(255) NOT NULL DEFAULT '', \`avatarUrl\` varchar(255) NOT NULL DEFAULT '', \`coverUrl\` varchar(255) NOT NULL DEFAULT '', \`location\` varchar(255) NOT NULL DEFAULT '', \`website\` varchar(255) NOT NULL DEFAULT '', \`birthday\` date NULL, \`gender\` enum ('none', 'women', 'man') NOT NULL DEFAULT 'none', UNIQUE INDEX \`IDX_48574988bda742dc436132943c\` (\`login\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`user_settings_entity\` (\`id\` int NOT NULL AUTO_INCREMENT, \`theme\` enum ('dark', 'white') NOT NULL DEFAULT 'white', \`language\` varchar(255) NOT NULL DEFAULT 'English', \`isPrivate\` tinyint NOT NULL DEFAULT 0, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`user_security_entity\` (\`id\` int NOT NULL AUTO_INCREMENT, \`email\` varchar(255) NOT NULL, \`passwordHash\` varchar(255) NOT NULL, \`twoFactorEnabled\` tinyint NOT NULL DEFAULT 0, UNIQUE INDEX \`IDX_8efc9e4b24e86d17f9ff49de6f\` (\`email\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`user_realation_entity\` (\`id\` int NOT NULL AUTO_INCREMENT, \`typeAction\` enum ('friend', 'follow', 'block') NOT NULL DEFAULT 'follow', \`sourceUserId\` int NULL, \`targetUserId\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`user_entity\` (\`id\` int NOT NULL AUTO_INCREMENT, \`isActivate\` tinyint NOT NULL DEFAULT 1, \`isVerified\` tinyint NOT NULL DEFAULT 0, \`note\` varchar(255) NOT NULL DEFAULT '', \`role\` enum ('admin', 'user', 'ghost') NOT NULL DEFAULT 'ghost', \`createdAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, \`updatedAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`profileId\` int NULL, \`settingsId\` int NULL, \`securityId\` int NULL, \`statsId\` int NULL, UNIQUE INDEX \`REL_861abf5759299b717c5e2780a7\` (\`profileId\`), UNIQUE INDEX \`REL_5fa332aab78d8f57365ac123c2\` (\`settingsId\`), UNIQUE INDEX \`REL_9a409e78965dd1efe92400ed1f\` (\`securityId\`), UNIQUE INDEX \`REL_6bd439baf8a0419126753e23d4\` (\`statsId\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`user_stats_entity\` (\`id\` int NOT NULL AUTO_INCREMENT, \`postsCount\` int NOT NULL DEFAULT '0', \`followersCount\` int NOT NULL DEFAULT '0', \`followingCount\` int NOT NULL DEFAULT '0', \`likesCount\` int NOT NULL DEFAULT '0', PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`user_realation_entity\` ADD CONSTRAINT \`FK_b77193e054ed10df683fc8a6cfd\` FOREIGN KEY (\`sourceUserId\`) REFERENCES \`user_entity\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`user_realation_entity\` ADD CONSTRAINT \`FK_cd5ebc4ba6254a11222725bd945\` FOREIGN KEY (\`targetUserId\`) REFERENCES \`user_entity\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`user_entity\` ADD CONSTRAINT \`FK_861abf5759299b717c5e2780a78\` FOREIGN KEY (\`profileId\`) REFERENCES \`user_profile_entity\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`user_entity\` ADD CONSTRAINT \`FK_5fa332aab78d8f57365ac123c21\` FOREIGN KEY (\`settingsId\`) REFERENCES \`user_settings_entity\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`user_entity\` ADD CONSTRAINT \`FK_9a409e78965dd1efe92400ed1f5\` FOREIGN KEY (\`securityId\`) REFERENCES \`user_security_entity\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`user_entity\` ADD CONSTRAINT \`FK_6bd439baf8a0419126753e23d44\` FOREIGN KEY (\`statsId\`) REFERENCES \`user_stats_entity\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user_entity\` DROP FOREIGN KEY \`FK_6bd439baf8a0419126753e23d44\``);
        await queryRunner.query(`ALTER TABLE \`user_entity\` DROP FOREIGN KEY \`FK_9a409e78965dd1efe92400ed1f5\``);
        await queryRunner.query(`ALTER TABLE \`user_entity\` DROP FOREIGN KEY \`FK_5fa332aab78d8f57365ac123c21\``);
        await queryRunner.query(`ALTER TABLE \`user_entity\` DROP FOREIGN KEY \`FK_861abf5759299b717c5e2780a78\``);
        await queryRunner.query(`ALTER TABLE \`user_realation_entity\` DROP FOREIGN KEY \`FK_cd5ebc4ba6254a11222725bd945\``);
        await queryRunner.query(`ALTER TABLE \`user_realation_entity\` DROP FOREIGN KEY \`FK_b77193e054ed10df683fc8a6cfd\``);
        await queryRunner.query(`DROP TABLE \`user_stats_entity\``);
        await queryRunner.query(`DROP INDEX \`REL_6bd439baf8a0419126753e23d4\` ON \`user_entity\``);
        await queryRunner.query(`DROP INDEX \`REL_9a409e78965dd1efe92400ed1f\` ON \`user_entity\``);
        await queryRunner.query(`DROP INDEX \`REL_5fa332aab78d8f57365ac123c2\` ON \`user_entity\``);
        await queryRunner.query(`DROP INDEX \`REL_861abf5759299b717c5e2780a7\` ON \`user_entity\``);
        await queryRunner.query(`DROP TABLE \`user_entity\``);
        await queryRunner.query(`DROP TABLE \`user_realation_entity\``);
        await queryRunner.query(`DROP INDEX \`IDX_8efc9e4b24e86d17f9ff49de6f\` ON \`user_security_entity\``);
        await queryRunner.query(`DROP TABLE \`user_security_entity\``);
        await queryRunner.query(`DROP TABLE \`user_settings_entity\``);
        await queryRunner.query(`DROP INDEX \`IDX_48574988bda742dc436132943c\` ON \`user_profile_entity\``);
        await queryRunner.query(`DROP TABLE \`user_profile_entity\``);
    }

}

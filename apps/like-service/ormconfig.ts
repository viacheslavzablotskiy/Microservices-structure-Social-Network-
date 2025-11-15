import {DataSource} from 'typeorm'
import {config} from 'dotenv'

config()

export default new DataSource({
    type:'mysql',
    host: process.env.DB_HOST,
    port: +process.env.DB_PORT!,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    entities: ['dist/**/*.entity{.js,.ts}'],
    migrations: ['dist/src/migrations/*.js'],
    migrationsTableName: '_migrationsLike'
})
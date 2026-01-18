import {Db} from 'mongodb'
import {JsonSchema, stringField, dateField, boolField, intField} from '../schemas/commonSchemas' 

export const roomSchema: JsonSchema = {
    bsonType: 'object',
    required: ['name', 'participiants', 'createdAt', 'updatedAt', 'isGroup'],
    additionalProperties: false,
    properties: {
        name: stringField(),
        participiants: {
            bsonType: 'array',
            items: intField()
        },
        isGroup: boolField(),
        createdAt: dateField(),
        updatedAt: dateField()
    }
}

export async function up(db: Db) {
    await db.createCollection('rooms', {validator: {$jsonSchema: roomSchema}})
    await db.collection('rooms').createIndex({name: 1})
    
}

export async function down(db: Db) {
    await db.collection('rooms').drop()
}

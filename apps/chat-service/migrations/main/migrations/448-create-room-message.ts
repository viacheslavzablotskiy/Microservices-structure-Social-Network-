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

export const messageSchema: JsonSchema = {
    bsonType: 'object',
    required: ['roomId', 'senderId', 'isEdited', 'isDeleted', 'createdAt', 'updatedAt'],
    additionalProperties: false,
    properties: {
        roomId: {bsonType: 'objectId', description: 'Reference to Room'},
        senderId: intField(),
        attachments: {bsonType: 'array', items: stringField()},
        isEdited: boolField(),
        isDeleted: boolField(),
        createdAt: dateField(),
        updatedAt: dateField()
    }
}

export async function up(db: Db) {
    await db.createCollection('rooms', {validator: {$jsonSchema: roomSchema}})
    await db.createCollection('messages', {validator: {$jsonSchema: messageSchema}})
    await db.collection('rooms').createIndex({name: 1})
    await db.collection('messages').createIndex({roomId: 1, createdAt: -1})
    
}

export async function down(db: Db) {
    await db.collection('rooms').drop()
    await db.collection('messages').drop()
}

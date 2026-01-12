import {Db} from 'mongodb'
import {type JsonSchema, stringField, intField, boolField, dateField} from '../schemas/commonSchemas'
import {roomSchema as previousRoomShema, messageSchema as previousMessageShema} from './448-create-room-message'

export const roomSchema: JsonSchema = {
    bsonType: 'object',
    required: ['name', 'participiants', 'authorId', 'createdAt', 'updatedAt', 'isGroup'],
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
    required: ['roomId', 'senderId', 'isEdited', 'isDeleted', 'createdAt', 'updatedAt', 'message'],
    additionalProperties: false,
    properties: {
        roomId: {bsonType: 'objectId', description: 'Reference to Room'},
        senderId: intField(),
        attachments: {bsonType: 'array', items: stringField()},
        isEdited: boolField(),
        isDeleted: boolField(),
        createdAt: dateField(),
        updatedAt: dateField(),
        message: intField()
    }
}

export async function up(db:Db) {
    await db.command({
        collMod: 'rooms',
        validator: {$jsonSchema: roomSchema}
    })

    await db.command({
        collMod: 'messages',
        validator: {$jsonSchema: messageSchema}
    })

    await db.collection('rooms').updateMany({}, {$set: {authorId: 0}})
    await db.collection('messages').updateMany({}, {$set: {message: ''}})
}

export async function down(db:Db) {
    await db.command({
        collMod: 'rooms',
        validator: {$jsonSchema: previousRoomShema}
    })

    await db.command({
        collMod: 'messages',
        validator: {$jsonSchema: previousMessageShema}
    })

    await db.collection('rooms').updateMany({}, {$unset: {authorId: 0}})
    await db.collection('messages').updateMany({}, {$unset: {message: ''}})
}
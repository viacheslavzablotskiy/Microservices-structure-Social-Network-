import {Db} from 'mongodb'
import { JsonSchema, intField, stringField, boolField, dateField } from '../schemas/commonSchemas'

export const notificationSchema: JsonSchema = {
    bsonType: 'object',
    additionalProperties: false,
    required: ['type', 'roomId', 'event', 'payload', 'createdAt', 'updatedAt'],
    properties: {
        type: {bsonType: 'string', enum: ['notification']},
        roomId: {bsonType: 'objectId', description: 'Link ot the Room'},
        event: {
            bsonType: 'string',
            enum: ['group_created', 'added_member', 'deleted_member'],
            description: 'Type of the event'
        },
        payload: {
            bsonType: 'object',
            required: ['subject', 'object', 'objectType'],
            properties: {
                subject: intField(),
                object: stringField(),
                objectType: {
                    bsonType: 'string',
                    enum: ['room', 'user'],
                    description: 'type of the object'
                }
            }
        },
        createdAt: dateField(),
        updatedAt: dateField()
    }
}

const messageSchema: JsonSchema = {
    bsonType: 'object',
    additionalProperties: false,
    required: ['type', 'roomId', 'senderId', 'isDeleted', 'isEdited', 'createdAt', 'updatedAt', 'message'],
    properties: {
        type: {bsonType: 'string', enum: ['message']},
        roomId: {bsonType: 'objectId', description: 'link to the Room'},
        attachments: {bsonType: 'array', items: stringField()},
        senderId: intField(),
        message: stringField(),
        isDeleted: boolField(),
        isEdited: boolField(),
        createdAt: dateField(),
        updatedAt: dateField()
    }
}


export async function up(db: Db) {
    await db.createCollection('message_notifications', {
        validator: {
            $jsonSchema: {
                oneOf: [notificationSchema,messageSchema]
            }
        }
    })
    await db.collection('message_notifications').createIndex({roomId: 1})
    await db.collection('message_notifications').createIndex({type: 1})
}
export async function down(db: Db) {
    const collections = await db.listCollections().toArray()
    if (collections.some(collection => collection.name === 'message_notifications')) {
        await db.collection('message_notifications').drop()
    }
}
import {Db} from 'mongodb'
import { type JsonSchema, intField, stringField, dateField} from '../schemas/commonSchemas'



export const notificationSchema: JsonSchema = {
    bsonType: 'object',
    additionalProperties: false,
    required: ['roomId', 'event', 'payload', 'createdAt', 'updatedAt'],
    properties: {
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


export async function up(db:Db) {
    await db.createCollection('notifications', {
        validator: {
            $jsonSchema: notificationSchema
        }
    })

    await db.collection('notifications').createIndex({roomId: 1})
}

export async function down(db:Db) {
    await db.collection('notifications').drop()
}   

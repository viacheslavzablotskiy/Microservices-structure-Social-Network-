"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationSchema = void 0;
exports.up = up;
exports.down = down;
const commonSchemas_1 = require("../schemas/commonSchemas");
exports.notificationSchema = {
    bsonType: 'object',
    additionalProperties: false,
    required: ['type', 'roomId', 'event', 'payload', 'createdAt', 'updatedAt'],
    properties: {
        type: { bsonType: 'string', enum: ['notification'] },
        roomId: { bsonType: 'objectId', description: 'Link ot the Room' },
        event: {
            bsonType: 'string',
            enum: ['group_created', 'added_member', 'deleted_member'],
            description: 'Type of the event'
        },
        payload: {
            bsonType: 'object',
            required: ['subject', 'object', 'objectType'],
            properties: {
                subject: (0, commonSchemas_1.intField)(),
                object: (0, commonSchemas_1.stringField)(),
                objectType: {
                    bsonType: 'string',
                    enum: ['room', 'user'],
                    description: 'type of the object'
                }
            }
        },
        createdAt: (0, commonSchemas_1.dateField)(),
        updatedAt: (0, commonSchemas_1.dateField)()
    }
};
const messageSchema = {
    bsonType: 'object',
    additionalProperties: false,
    required: ['type', 'roomId', 'senderId', 'isDeleted', 'isEdited', 'createdAt', 'updatedAt', 'message'],
    properties: {
        type: { bsonType: 'string', enum: ['message'] },
        roomId: { bsonType: 'objectId', description: 'link to the Room' },
        attachments: { bsonType: 'array', items: (0, commonSchemas_1.stringField)() },
        senderId: (0, commonSchemas_1.intField)(),
        message: (0, commonSchemas_1.stringField)(),
        isDeleted: (0, commonSchemas_1.boolField)(),
        isEdited: (0, commonSchemas_1.boolField)(),
        createdAt: (0, commonSchemas_1.dateField)(),
        updatedAt: (0, commonSchemas_1.dateField)()
    }
};
async function up(db) {
    await db.createCollection('message_notifications', {
        validator: {
            $jsonSchema: {
                oneOf: [exports.notificationSchema, messageSchema]
            }
        }
    });
    await db.collection('message_notifications').createIndex({ roomId: 1 });
    await db.collection('message_notifications').createIndex({ type: 1 });
}
async function down(db) {
    const collections = await db.listCollections().toArray();
    if (collections.some(collection => collection.name === 'message_notifications')) {
        await db.collection('message_notifications').drop();
    }
}

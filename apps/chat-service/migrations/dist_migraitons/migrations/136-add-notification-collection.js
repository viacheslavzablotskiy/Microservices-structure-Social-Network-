"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationSchema = void 0;
exports.up = up;
exports.down = down;
const commonSchemas_1 = require("../schemas/commonSchemas");
exports.notificationSchema = {
    bsonType: 'object',
    additionalProperties: false,
    required: ['roomId', 'event', 'payload', 'createdAt', 'updatedAt'],
    properties: {
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
async function up(db) {
    await db.createCollection('notifications', {
        validator: {
            $jsonSchema: exports.notificationSchema
        }
    });
    await db.collection('notifications').createIndex({ roomId: 1 });
}
async function down(db) {
    await db.collection('notifications').drop();
}

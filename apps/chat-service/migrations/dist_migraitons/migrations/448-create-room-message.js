"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.messageSchema = exports.roomSchema = void 0;
exports.up = up;
exports.down = down;
const commonSchemas_1 = require("../schemas/commonSchemas");
exports.roomSchema = {
    bsonType: 'object',
    required: ['name', 'participiants', 'createdAt', 'updatedAt', 'isGroup'],
    additionalProperties: false,
    properties: {
        name: (0, commonSchemas_1.stringField)(),
        participiants: {
            bsonType: 'array',
            items: (0, commonSchemas_1.intField)()
        },
        isGroup: (0, commonSchemas_1.boolField)(),
        createdAt: (0, commonSchemas_1.dateField)(),
        updatedAt: (0, commonSchemas_1.dateField)()
    }
};
exports.messageSchema = {
    bsonType: 'object',
    required: ['roomId', 'senderId', 'isEdited', 'isDeleted', 'createdAt', 'updatedAt'],
    additionalProperties: false,
    properties: {
        roomId: { bsonType: 'objectId', description: 'Reference to Room' },
        senderId: (0, commonSchemas_1.intField)(),
        attachments: { bsonType: 'array', items: (0, commonSchemas_1.stringField)() },
        isEdited: (0, commonSchemas_1.boolField)(),
        isDeleted: (0, commonSchemas_1.boolField)(),
        createdAt: (0, commonSchemas_1.dateField)(),
        updatedAt: (0, commonSchemas_1.dateField)()
    }
};
async function up(db) {
    await db.createCollection('rooms', { validator: { $jsonSchema: exports.roomSchema } });
    await db.createCollection('messages', { validator: { $jsonSchema: exports.messageSchema } });
    await db.collection('rooms').createIndex({ name: 1 });
    await db.collection('messages').createIndex({ roomId: 1, createdAt: -1 });
}
async function down(db) {
    await db.collection('rooms').drop();
    await db.collection('messages').drop();
}

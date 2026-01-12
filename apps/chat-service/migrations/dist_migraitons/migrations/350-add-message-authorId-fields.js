"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.messageSchema = exports.roomSchema = void 0;
exports.up = up;
exports.down = down;
const commonSchemas_1 = require("../schemas/commonSchemas");
const _448_create_room_message_1 = require("./448-create-room-message");
exports.roomSchema = {
    bsonType: 'object',
    required: ['name', 'participiants', 'authorId', 'createdAt', 'updatedAt', 'isGroup'],
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
    required: ['roomId', 'senderId', 'isEdited', 'isDeleted', 'createdAt', 'updatedAt', 'message'],
    additionalProperties: false,
    properties: {
        roomId: { bsonType: 'objectId', description: 'Reference to Room' },
        senderId: (0, commonSchemas_1.intField)(),
        attachments: { bsonType: 'array', items: (0, commonSchemas_1.stringField)() },
        isEdited: (0, commonSchemas_1.boolField)(),
        isDeleted: (0, commonSchemas_1.boolField)(),
        createdAt: (0, commonSchemas_1.dateField)(),
        updatedAt: (0, commonSchemas_1.dateField)(),
        message: (0, commonSchemas_1.intField)()
    }
};
async function up(db) {
    await db.command({
        collMod: 'rooms',
        validator: { $jsonSchema: exports.roomSchema }
    });
    await db.command({
        collMod: 'messages',
        validator: { $jsonSchema: exports.messageSchema }
    });
    await db.collection('rooms').updateMany({}, { $set: { authorId: 0 } });
    await db.collection('messages').updateMany({}, { $set: { message: '' } });
}
async function down(db) {
    await db.command({
        collMod: 'rooms',
        validator: { $jsonSchema: _448_create_room_message_1.roomSchema }
    });
    await db.command({
        collMod: 'messages',
        validator: { $jsonSchema: _448_create_room_message_1.messageSchema }
    });
    await db.collection('rooms').updateMany({}, { $unset: { authorId: 0 } });
    await db.collection('messages').updateMany({}, { $unset: { message: '' } });
}

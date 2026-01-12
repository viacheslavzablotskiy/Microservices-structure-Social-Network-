"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.roomSchema = void 0;
exports.up = up;
exports.down = down;
const uuid_1 = require("uuid");
const commonSchemas_1 = require("../schemas/commonSchemas");
const _350_add_message_authorId_fields_1 = require("./350-add-message-authorId-fields");
exports.roomSchema = {
    bsonType: 'object',
    additionalProperties: false,
    required: ['name', 'participiants', 'createdAt', 'updatedAt', 'isGroup', 'roomId'],
    properties: {
        name: (0, commonSchemas_1.stringField)(),
        participiants: {
            bsonType: 'array',
            items: (0, commonSchemas_1.intField)()
        },
        createdAt: (0, commonSchemas_1.dateField)(),
        updatedAt: (0, commonSchemas_1.dateField)(),
        isGroup: (0, commonSchemas_1.boolField)(),
        roomId: (0, commonSchemas_1.stringField)()
    }
};
async function up(db) {
    await db.command({
        collMod: 'rooms',
        validator: { $jsonSchema: exports.roomSchema }
    });
    const cursor = db.collection('rooms').find({});
    for await (const doc of cursor) {
        await db.collection('rooms').updateOne({ _id: doc._id }, { $set: { roomId: (0, uuid_1.v4)() } });
    }
}
async function down(db) {
    await db.command({
        collMod: 'rooms',
        validator: { $jsonSchema: _350_add_message_authorId_fields_1.roomSchema }
    });
    await db.collection('rooms').updateMany({}, { $unset: { roomId: '' } });
}

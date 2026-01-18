"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.roomSchema = void 0;
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
async function up(db) {
    await db.createCollection('rooms', { validator: { $jsonSchema: exports.roomSchema } });
    await db.collection('rooms').createIndex({ name: 1 });
}
async function down(db) {
    await db.collection('rooms').drop();
}

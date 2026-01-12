import {Db} from 'mongodb'
import {v4 as uuidv4} from 'uuid'
import {JsonSchema, intField, stringField, boolField, dateField} from '../schemas/commonSchemas'
import {roomSchema as previousRoomSchema} from './350-add-message-authorId-fields'



export const roomSchema: JsonSchema = {
    bsonType: 'object',
    additionalProperties: false,
    required: ['name', 'participiants', 'createdAt', 'updatedAt', 'isGroup', 'roomId'],
    properties: {
        name: stringField(),
        participiants: {
            bsonType: 'array',
            items: intField()
        },
        createdAt: dateField(),
        updatedAt: dateField(),
        isGroup: boolField(),
        roomId: stringField()
    }
}


export async function up(db:Db) {
    await db.command({
        collMod: 'rooms',
        validator: {$jsonSchema: roomSchema}
    })

    const cursor = db.collection('rooms').find({})
    for await (const doc of cursor) {
        await db.collection('rooms').updateOne(
            {_id: doc._id},
            {$set: {roomId: uuidv4()}}
        )
    }
}


export async function down(db:Db) {
    await db.command({
        collMod: 'rooms',
        validator: {$jsonSchema: previousRoomSchema}
    })

    await db.collection('rooms').updateMany({}, {$unset: {roomId: ''}})
}

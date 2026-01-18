export interface JsonSchema {
    bsonType: string | string[],
    description?: string,
    required?: string[],
    properties?: Record<string, JsonSchema>,
    items?: JsonSchema,
    enum?: any[],
    additionalProperties?: boolean 
}



export const stringField = (options: Partial<JsonSchema> = {}): JsonSchema => ({...options, bsonType: 'string'})
export const intField = (options: Partial<JsonSchema> = {}): JsonSchema => ({...options, bsonType: 'int'})
export const boolField = (options: Partial<JsonSchema> = {}): JsonSchema => ({...options, bsonType: 'bool'})
export const dateField = (options: Partial<JsonSchema> = {}): JsonSchema => ({...options, bsonType: 'date'})
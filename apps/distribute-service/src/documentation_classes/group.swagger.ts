import {createNewGroupSchema, addNewMemberGroupSchema, deleteMemberGroupSchema} from '@repo/user-interfaces'
import { createZodDto } from 'nestjs-zod';


export class CreateNewGroupSwagger extends createZodDto(createNewGroupSchema) {}

export class AddNewMemberSwagger extends createZodDto(addNewMemberGroupSchema) {}

export class DeleteMemberSwagger extends createZodDto(deleteMemberGroupSchema) {}
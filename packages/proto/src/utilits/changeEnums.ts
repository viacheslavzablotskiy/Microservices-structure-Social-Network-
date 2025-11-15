import {UserRole} from '@repo/static-data'
import {UserRolePtroto} from '../intefaceProto/Login_User_Enity_Proto'

export function fromProtoRoleToEntity(role: UserRolePtroto): UserRole {
    switch (role) {
        case UserRolePtroto.ADMIN: return UserRole.ADMIN;
        case UserRolePtroto.GHOST: return UserRole.GHOST;
        case UserRolePtroto.USER: return UserRole.USER;
        default: throw new Error('Unknow input data')
    }
} 

export function entityToProto(role: UserRole): UserRolePtroto {
  switch (role) {
    case UserRole.ADMIN:
      return UserRolePtroto.ADMIN;
    case UserRole.USER:
      return UserRolePtroto.USER;
    case UserRole.GHOST:
      return UserRolePtroto.GHOST;
  }
}
import { MessageEntityProtoOne } from "./main_message_interfaces";
import { NotificationTypeDataProto } from "./main_notification_interface";

export enum ActionType {
    MESSAGE_TYPE='message',
    NOTIFICATION_TYPE='notification'
}

export enum ActionTypeProto {
    ACTION_TYPE_UNSPECIFIED = 0,
    ACTOIN_TYPE_MESSAGE = 1,
    ACTION_TYPE_NOTIFICATION = 2
}

export function mapActionTypeToProto(data: ActionType): ActionTypeProto {
    switch (data) {
        case ActionType.MESSAGE_TYPE: return ActionTypeProto.ACTOIN_TYPE_MESSAGE;
        case ActionType.NOTIFICATION_TYPE: return ActionTypeProto.ACTION_TYPE_NOTIFICATION;
        default: return ActionTypeProto.ACTION_TYPE_UNSPECIFIED
    }
}

export function mapActionTypeToBack(data: ActionTypeProto): ActionType {
    switch (data) {
        case ActionTypeProto.ACTOIN_TYPE_MESSAGE: return ActionType.MESSAGE_TYPE;
        case ActionTypeProto.ACTION_TYPE_NOTIFICATION: return ActionType.NOTIFICATION_TYPE;
        default: return ActionType.MESSAGE_TYPE
    }
}


export interface MessageNotificationTypeData {
    id: string,
    type: ActionType,
    createdAt: Date,
    updatedAt: Date
}

export interface MessageNotificationProtoData {
    payload: (MessageEntityProtoOne | NotificationTypeDataProto)[]
}
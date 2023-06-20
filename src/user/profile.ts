import {EUserLocale} from "./locale";
import {EUserProfileActiveStatus} from "./active";
import {EUserProfileDeletedStatus} from "./deleted";
import {EUserProfileType} from "./type";

interface IUserProfileBase {
    active: EUserProfileActiveStatus;

    username: string;
    email_address: string;

    locale: EUserLocale;

    [fieldKey: string]: any;
}

export interface IUserProfileCreateInfo extends IUserProfileBase {
    password: string;

    type: EUserProfileType;
}

export interface IUserProfileUpdateInfo {
    readonly id: number;

    active?: EUserProfileActiveStatus;

    username?: string;
    email_address?: string;

    password?: string;

    locale?: EUserLocale;

    [fieldKey: string]: any;
}

export interface IUserProfile extends IUserProfileBase {
    readonly id: number;

    readonly deleted: EUserProfileDeletedStatus;

    readonly time_last_login: number;
    readonly time_created: number;
    readonly time_updated: number;
    readonly time_deleted: number;

    readonly type: EUserProfileType;
}

export interface IUserProfileList {
    profiles: IUserProfile[];
    total: number;
}
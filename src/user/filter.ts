import {EUserProfileType} from "./type";

export interface IUserProfileFilter {
    active?: boolean;

    deleted?: boolean;

    page?: number;

    rows?: 5 | 10 | 25 | 50 | 100;

    search?: {
        field: string,
        query: boolean | number | string
    },

    type: EUserProfileType;

    username?: string;
}
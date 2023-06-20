import {Credentials_c, ICredentials} from "../core/credentials";
import {IUserProfile, IUserProfileCreateInfo, IUserProfileList, IUserProfileUpdateInfo} from "./profile";
import {E} from "../core/error";
import {IUserProfileFilter} from "./filter";
import {fromBoolean, toBoolean} from "../utils/boolean";
import {AxiosError} from "axios";

function responseToUserProfile(json: any): IUserProfile {
    const profile: IUserProfile = {
        id: json.id,

        username: json.username,
        email_address: json.email_address,

        type: json.type,

        locale: json.locale,

        active: json.active,
        deleted: json.deleted,

        time_last_login: json.time_last_login,
        time_created: json.time_created,
        time_updated: json.time_updated,
        time_deleted: json.time_deleted
    };

    for(const fieldKey in json.fields) {
        profile[fieldKey] = json.fields[fieldKey];
    }

    return profile;
}
function sortProfilesById(profiles: IUserProfile[]) {
    profiles.sort((p1: IUserProfile, p2: IUserProfile): number => {
        return p1.id < p2.id ? -1 : p1.id > p2.id ? 1 : 0;
    });
}

const profileFields: string[] = [
    'active',
    'deleted',
    'email_address',
    'id',
    'locale',
    'password',
    'type',
    'username',
    'time_last_login',
    'time_created',
    'time_updated',
    'time_deleted'
];
const mutableProfileFields: string[] = [
    'active',
    'email_address',
    'locale',
    'password',
    'username'
];

class UserManager extends Credentials_c {
    async createProfile(profileCreateInfo: IUserProfileCreateInfo): Promise<IUserProfile> {
        try {
            const d: any = {
                id: 0,
                username: profileCreateInfo.username,
                password_raw: profileCreateInfo.password,
                email_address: '',
                type: profileCreateInfo.type,
                locale: 'tr-TR',
                active: 1
            };

            const fields: any = {};

            for(const key in profileCreateInfo) {
                if(!(key in d) && 'password' !== key) {
                    fields[key] = profileCreateInfo[key];
                }
            }

            d.fields = fields;

            const response = await this.axios.post('/user/create', JSON.stringify(d));

            const data = response.data;
            if(typeof data !== 'object') {
                return Promise.reject(E.UNEXPECTED_ERROR());
            }

            return responseToUserProfile(data);
        } catch (e: any) {
            return Promise.reject(E.Interpret(e));
        }
    }

    async deleteProfile(identifier: number | string): Promise<number | string> {
        const identifierType = (typeof identifier === 'number') ? 'id' : 'username';

        try {
            await this.axios.delete(`/user/${identifier}?${identifierType}=0`);
            return identifier;
        } catch (e) {
            return Promise.reject(E.Interpret(e));
        }
    }

    async updateProfile(profile: IUserProfileUpdateInfo): Promise<void> {
        let numChangedFields: number = 0;

        const d: any = {
            id: profile.id,
            fields: {}
        };

        for(const fieldKey in profile) {
            if('id' === fieldKey) {
                continue;
            }

            if(typeof profile[fieldKey] === 'boolean') {
                profile[fieldKey] = fromBoolean(profile[fieldKey]);
            }

            const isProfileField: boolean = (-1 !== profileFields.indexOf(fieldKey));
            if(isProfileField) {
                const isMutable: boolean = (-1 !== mutableProfileFields.indexOf(fieldKey));
                if(!isMutable) {
                    return Promise.reject(E.USER_UPDATE_IMMUTABLE(fieldKey));
                }

                d[fieldKey] = profile[fieldKey];
            }else {
                d.fields[fieldKey] = profile[fieldKey];
            }

            ++numChangedFields;
        }

        if(0 === numChangedFields) {
            return Promise.reject(E.USER_UPDATE_NO_FIELDS());
        }

        try {
            const response = await this.axios.post(`/user/up/${d.id}`, JSON.stringify(d));
            return;
        } catch (e) {
            return Promise.reject(E.Interpret(e));
        }
    }

    async listProfiles(filter: IUserProfileFilter): Promise<IUserProfileList> {
        filter = filter || {};

        if(filter.search) {
            if(typeof filter.search.query === 'boolean') {
                filter.search.query = (filter.search.query ? '1' : '0');
            }else if(typeof filter.search.query === 'number') {
                filter.search.query = filter.search.query.toString();
            }
        }

        const fd: any = filter;
        fd.domain = fd.type;
        delete fd.type;

        try {
            const response = await this.axios.post(`/user/list`, JSON.stringify(filter));

            const data = response.data;
            if(typeof data !== 'object') {
                return Promise.reject(E.UNEXPECTED_ERROR());
            }

            const result: IUserProfileList = {
                profiles: [],
                total: data.total
            };

            for(const profile of data.profiles) {
                result.profiles.push(responseToUserProfile(profile));
            }

            return result;
        } catch (e) {
            return Promise.reject(E.Interpret(e));
        }
    }

    async resolveProfiles(profileIds: number[]) : Promise<IUserProfile[]> {
        const ids: number[] = [];

        profileIds.forEach((profileId) => {
            if(0 < profileId && -1 === ids.indexOf(profileId)) {
                ids.push(profileId);
            }
        });

        if(0 === ids.length) {
            return [];
        }

        if(100 < ids.length) {
            return Promise.reject(E.TOO_MANY_USERS_TO_RESOLVE());
        }

        try {
            const response = await this.axios.post('/user/resolve', JSON.stringify(ids));

            const data = response.data;
            if(!Array.isArray(data)) {
                return Promise.reject(E.UNEXPECTED_ERROR());
            }

            const profiles: IUserProfile[] = [];

            for(const profile of data) {
                profiles.push(responseToUserProfile(profile));
            }

            sortProfilesById(profiles);

            return profiles;
        } catch (e) {
            return Promise.reject(E.Interpret(e));
        }
    }
}

export function createUserManager(credentials: ICredentials): UserManager {
    return new UserManager(credentials);
}
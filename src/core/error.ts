import {AxiosError, AxiosHeaderValue, RawAxiosResponseHeaders} from "axios";

class Error_c extends Error {
    readonly code: number;

    constructor(code: number, key: string, message: string) {
        super(message);

        this.code = code;
    }
}

export namespace E {
    export const UNEXPECTED_ERROR = () => new Error_c(Number.MAX_SAFE_INTEGER, 'UNEXPECTED_ERROR', 'Unexpected error.');
    export const INVALID_API_KEY = () => new Error_c(1000, 'INVALID_API_KEY', 'Invalid API key.');
    export const TOO_MANY_USERS_TO_RESOLVE = () => new Error_c(4000, 'TOO_MANY_USERS_TO_RESOLVE', 'Too many user ids provided for resolving. Limit is 100.');
    export const USER_UPDATE_NO_FIELDS = () => new Error_c(4100, 'USER_UPDATE_NO_FIELDS', 'No fields found to be updated.');
    export const USER_UPDATE_IMMUTABLE = (f: string) => new Error_c(4101, 'USER_UPDATE_NOT_MUTABLE', `Targeted field '${f}' is immutable.`);

    export function Interpret(error: any): Error_c {
        if(!(error instanceof AxiosError)) {
            return UNEXPECTED_ERROR();
        }

        const status = (error?.response?.status || 0);
        if(!status) {
            return UNEXPECTED_ERROR();
        }

        const ApiStatusCodeHN: string = 'API-Status-Code'.toLocaleLowerCase('en-US');
        const ApiStatusNameHN: string = 'API-Status-Name'.toLocaleLowerCase('en-US');

        let statusCode: number | null = null;
        let statusName: string | null = null;

        const headers: RawAxiosResponseHeaders = (error?.response?.headers || {});
        for(const name in headers) {
            const lcName = name.toLocaleLowerCase('en-US');

            if(lcName === ApiStatusCodeHN) {
                const val: AxiosHeaderValue | undefined = headers[name];
                if(!!val) {
                    statusCode = parseInt(val.toString());
                    if(isNaN(statusCode)) {
                        statusCode = null;
                    }
                }
            }else if(lcName === ApiStatusNameHN) {
                const val: AxiosHeaderValue | undefined = headers[name];
                if(!!val) {
                    statusName = val.toString();
                }
            }
        }

        if(null !== statusCode && null !== statusName) {
            return new Error_c(statusCode, statusName, statusName);
        }

        return UNEXPECTED_ERROR();
    }
}
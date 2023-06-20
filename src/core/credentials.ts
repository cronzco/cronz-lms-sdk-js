import { Base64 } from "js-base64";
import axios, {AxiosInstance} from "axios";
import {E} from "./error";

export interface ICredentials {
    token?: string;
    endpoint?: string;
    institute?: string;

    axios?: AxiosInstance;
}

export class Credentials_c {
    #credentials: ICredentials;
    get credentials(): ICredentials {
        return this.#credentials;
    }

    get axios(): AxiosInstance {
        return <AxiosInstance> this.credentials.axios;
    }

    constructor(credentials: ICredentials) {
        this.#credentials = credentials;
    }
}

function findAtIndex(str: string): number {
    const index = str.indexOf('@');

    if(-1 === index) {
        throw E.INVALID_API_KEY();
    }

    return index;
}
function interpretCredentials(apiKey: string): ICredentials {
    const credentials: ICredentials = {};

    try {
        const raw: string = Base64.decode(apiKey);

        const parts = raw.split('@');

        credentials.token = parts[0];
        credentials.institute = parts[1];
        credentials.endpoint = parts[2];

        credentials.axios = axios.create();
        credentials.axios.defaults.baseURL = `http://${credentials.endpoint}:2421/`;
        credentials.axios.defaults.headers.common['Authorization'] = `${credentials.token}@${credentials.institute}`;
    } catch (e) {
        throw E.INVALID_API_KEY();
    }

    return credentials;
}

export function createCredentials(apiKey: string): ICredentials {
    return interpretCredentials(apiKey);
}
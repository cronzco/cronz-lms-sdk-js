import {createCredentials, ICredentials} from "../core/credentials";
import {createUserManager} from "../user";

class Client {
    private readonly credentials: ICredentials;

    users: any;

    constructor(apiKey: string) {
        this.credentials = createCredentials(apiKey);

        this.users = createUserManager(this.credentials);
    }
}

export function createClient(apiKey: string): Client {
    return new Client(apiKey);
}
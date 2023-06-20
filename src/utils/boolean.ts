export function toBoolean(val: any): boolean {
    if(typeof val === 'number') {
        return 1 === val;
    }

    if(typeof val === 'boolean') {
        return val;
    }

    return false;
}

export function fromBoolean(val: boolean): number {
    return val ? 1 : 0;
}
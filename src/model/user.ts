export class User {

    name:string;

    constructor(name:string) {
        this.name = name;
    }

    public toString():string {
        return JSON.stringify(this);
    }
}
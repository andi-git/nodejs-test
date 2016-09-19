import {injectable} from "inversify";
import "reflect-metadata";

export class IdGenerator {

    private static s4(): string {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }

    public static guid(): string {
        let id: string = "";
        let first: boolean = true;
        for (let i: number = 0; i < 8; i++) {
            if (first === false) {
                id += '-';
            }
            id += IdGenerator.s4();
            first = false;
        }
        return id;
    }
}

export interface IdGenerator2 {

    guid(): string;
}

@injectable()
export class IdGenerator2Basic implements IdGenerator2 {

    guid(): string {
        let id: string = "";
        let first: boolean = true;
        for (let i: number = 0; i < 8; i++) {
            if (first === false) {
                id += '-';
            }
            id += this.s4();
            first = false;
        }
        return id;
    }

    //noinspection JSMethodCanBeStatic
    private s4(): string {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }
}
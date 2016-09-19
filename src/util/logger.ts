import {AsyncEvent} from "ts-events/dist/lib/index";
import {User} from "../model/user";

export class Logger {

    event = new AsyncEvent<string>();

    constructor() {
        this.event.attach(function (message:string) {
            console.log(message);
        });
    }

    public info(message:string, user?:User):void {
        this.event.post(Logger.createMessage(LogLevel.INFO, message, user));
    }

    public warn(message:string, user?:User):void {
        this.event.post(Logger.createMessage(LogLevel.WARN, message, user));
    }

    public error(message:string, user?:User):void {
        this.event.post(Logger.createMessage(LogLevel.ERROR, message, user));
    }

    private static createMessage(logLevel:LogLevel, message:string, user?:User):string {
        let username:string = user != null ? user.name : "undefined";
        return new Date().toISOString() + ' ' + LogLevel[logLevel] + '  | ' + username + ': ' + message;
    }
}


export enum LogLevel {
    INFO,
    WARN,
    ERROR
}
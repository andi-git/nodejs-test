import {injectable} from 'inversify';
import 'reflect-metadata';
import {AsyncEvent} from 'ts-events/dist/lib/index';
import {User} from '../model/user';

export interface Logger {

    info(message: string, user?: User);

    warn(message: string, user?: User);

    error(message: string, user?: User);

    getLogEvent(): AsyncEvent<string>;
}

@injectable()
export class LoggerBasic implements Logger {

    event = new AsyncEvent<string>();

    constructor() {
        this.event.attach(function (message: string) {
            console.log(message);
        });
        this.info('create ' + this.constructor.name);
    }

    public info(message: string, user?: User): void {
        this.event.post(this.createMessage(LogLevel.INFO, message, user));
    }

    public warn(message: string, user?: User): void {
        this.event.post(this.createMessage(LogLevel.WARN, message, user));
    }

    public error(message: string, user?: User): void {
        this.event.post(this.createMessage(LogLevel.ERROR, message, user));
    }

    public getLogEvent(): AsyncEvent<string> {
        return this.event;
    }

    //noinspection JSMethodCanBeStatic
    private createMessage(logLevel: LogLevel, message: string, user?: User): string {
        let username: string = user != null ? user.name : 'undefined';
        return new Date().toISOString() + ' ' + this.getLogLevelString(logLevel) + ' | ' + username + ': ' + message;
    }

    //noinspection JSMethodCanBeStatic
    private getLogLevelString(logLevel: LogLevel): string {
        let result: string = LogLevel[logLevel];
        if (LogLevel[logLevel].length < 5) {
            result = result + ' ';
        }
        return result;
    }
}

export enum LogLevel {
    INFO,
    WARN,
    ERROR
}
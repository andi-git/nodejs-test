import {injectable} from 'inversify';
import 'reflect-metadata';
import {AsyncEvent} from 'ts-events/dist/lib/index';
import {User} from '../model-db/user';

export interface Logger {

    info(message: string, user?: User);

    warn(message: string, user?: User);

    error(message: string, user?: User);

    getLogEventInfo(): AsyncEvent<string>;

    getLogEventWarning(): AsyncEvent<string>;

    getLogEventError(): AsyncEvent<string>;
}

@injectable()
export class LoggerBasic implements Logger {

    eventInfo = new AsyncEvent<string>();
    eventWarning = new AsyncEvent<string>();
    eventError = new AsyncEvent<string>();
    winston = require('winston');

    constructor() {
        var logger = new (this.winston.Logger)({
            exitOnError: false, //don't crash on exception
            transports: [
                new (this.winston.transports.Console)({}),
                new (this.winston.transports.File)({filename: 'elleho.log'})
            ]
        });
        this.eventInfo.attach(function (message: string) {
            logger.info(message);
        });
        this.eventWarning.attach(function (message: string) {
            logger.info(message);
        });
        this.eventError.attach(function (message: string) {
            logger.info(message);
        });
        this.info('create ' + this.constructor.name);
    }

    public info(message: string, user?: User): void {
        this.eventInfo.post(this.createMessage(LogLevel.INFO, message, user));
    }

    public warn(message: string, user?: User): void {
        this.eventWarning.post(this.createMessage(LogLevel.WARN, message, user));
    }

    public error(message: string, user?: User): void {
        this.eventError.post(this.createMessage(LogLevel.ERROR, message, user));
    }

    public getLogEventInfo(): AsyncEvent<string> {
        return this.eventInfo;
    }

    public getLogEventWarning(): AsyncEvent<string> {
        return this.eventWarning;
    }

    public getLogEventError(): AsyncEvent<string> {
        return this.eventError;
    }

    //noinspection JSMethodCanBeStatic
    private createMessage(logLevel: LogLevel, message: string, user?: User): string {
        let username: string = user != null ? user.username : 'undefined';
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
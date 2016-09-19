import {injectable} from 'inversify';
import 'reflect-metadata';
import {Logger} from './logger';
import TYPES from '../types';
import {inject} from 'inversify';
import 'reflect-metadata';

export interface IdGenerator {

    guid(): string;
}

@injectable()
export class IdGeneratorBasic implements IdGenerator {

    constructor(@inject(TYPES.Logger) logger: Logger) {
        logger.info('create ' + this.constructor.name);
    }

    guid(): string {
        let id: string = '';
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
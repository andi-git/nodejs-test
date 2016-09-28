import {injectable, inject} from "inversify";
import TYPES from "../types";
import {Logger} from "./logger";
import {Result, ResultBasic} from "./result";
import {User} from "../model/user";

export interface GoogleDistanceMatrixKey {

    key(user: User): Result<string>;
}

@injectable()
export class GoogleDistanceMatrixKeyBasic implements GoogleDistanceMatrixKey {

    private logger: Logger;

    constructor(@inject(TYPES.Logger) logger: Logger) {
        this.logger = logger;
        this.logger.info('create ' + this.constructor.name);
    }

    public key(user: User): Result<string> {
        let result: Result<string> = new ResultBasic<string>();
        let file: string = __dirname + '/../../../conf/googleDistanceMatrix.key';
        require('fs').readFile(file, 'utf-8', (err: any, data: Buffer) => {
                if (err) {
                    this.logger.error('error on reading GoogleDistanceMatrixKey from ' + file, user);
                    result.error(err);
                } else {
                    let key = data.toString();
                    this.logger.info('read GoogleDistanceMatrixKey from ' + file + ': ' + key, user);
                    result.success(key);
                }
            }
        );
        return result;
    }
}

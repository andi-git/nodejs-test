import {injectable, inject} from "inversify";
import TYPES from "../types";
import {Logger} from "./logger";
import {Result, ResultBasic} from "./result";

export interface GoogleDistanceMatrixKey {

    key(): Result<string>;
}

@injectable()
export class GoogleDistanceMatrixKeyBasic implements GoogleDistanceMatrixKey {

    private keyCache: string;
    private logger: Logger;

    constructor(@inject(TYPES.Logger) logger: Logger) {
        this.logger = logger;
        this.logger.info('create ' + this.constructor.name);
    }

    public key(): Result<string> {
        let result: Result<string> = new ResultBasic<string>();
        let file: string = 'conf/googleDistanceMatrix.key';
        if (this.keyCache === undefined) {
            require('fs').readFile(file, 'utf-8', (err: any, data: Buffer) => {
                    if (err) {
                        this.logger.error('error on reading GoogleDistanceMatrixKey from ' + file);
                        result.error(err);
                    } else {
                        this.logger.info('read GoogleDistanceMatrixKey from ' + file + ': ' + this.keyCache);
                        result.success(data.toString());
                    }
                }
            );
        }
        return result;
    }
}

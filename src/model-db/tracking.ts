import mongoose = require('mongoose');
import {injectable, inject} from "inversify";
import {Logger} from "../util/logger";
import TYPES from "../types";
import {User} from "../model-db/user";
import {Schema} from "mongoose";
import {Repository, AbstractRepository} from "./modelHelper";
import {Result, ResultBasic} from "../util/result";

export interface Tracking extends mongoose.Document {
    user: User,
    date: Date,
    location: {type: [Number], index: '2d'},
    mode: string
}

//noinspection ReservedWordAsName
export const TrackingSchema = new mongoose.Schema({
    user: {type: Schema.Types.ObjectId, ref: 'User', required: false},
    date: {type: Date, required: true},
    location: {type: [Number], index: '2d', required: true},
    mode: {type: String, required: false, default: 'unknown'}
});

export const TrackingModel = mongoose.model<Tracking>('Tracking', TrackingSchema);

export interface TrackingRepository extends Repository<Tracking> {

    findSingleBetween(dateFrom: Date, dateTo: Date, currentUser: User): Result<Tracking>;
}

@injectable()
export class TrackingRepositoryBasic extends AbstractRepository<Tracking> implements TrackingRepository {

    constructor(@inject(TYPES.Logger) logger: Logger) {
        super(logger, TrackingModel, 'tracking');
        this.logger.info('create ' + this.constructor.name);
    }

    findSingleBetween(dateFrom: Date, dateTo: Date, currentUser: User): Result<Tracking> {
        let self = this;
        let result: Result<Tracking> = new ResultBasic<Tracking>();
        this.find(
            {
                user: currentUser,
                date: {
                    $gte: dateFrom,
                    $lt: dateTo
                }
            },
            null,
            null,
            (tracking: Array<Tracking>) => {
                if (tracking && tracking[0]) {
                    self.logger.info('found tracking "' + tracking[0].date + '": ' + tracking[0].location);
                    result.success(tracking[0]);
                } else {
                    result.error('no tracking found between ' + dateFrom + ' and ' + dateTo);
                }
            },
            (err: any) => {
                self.logger.error(err);
                result.error();
            });
        return result;
    }
}
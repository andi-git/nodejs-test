import mongoose = require('mongoose');
import {injectable, inject} from "inversify";
import {Logger} from "../util/logger";
import TYPES from "../types";
import {User} from "../model-db/user";
import {Schema} from "mongoose";
import {Repository, AbstractRepository} from "./modelHelper";

export interface Tracking extends mongoose.Document {
    user: User,
    date: Date,
    location: {type: [Number], index: '2d'},
}

export const TrackingSchema = new mongoose.Schema({
    user: {type: Schema.Types.ObjectId, ref: 'User', required: false},
    date: {type: Date, required: true},
    location: {type: [Number], index: '2d', required: true}
});

export const TrackingModel = mongoose.model<Tracking>('Tracking', TrackingSchema);

export interface TrackingRepository extends Repository<Tracking> {

}

@injectable()
export class TrackingRepositoryBasic extends AbstractRepository<Tracking> implements TrackingRepository {

    constructor(@inject(TYPES.Logger) logger: Logger) {
        super(logger, TrackingModel, 'tracking');
        this.logger.info('create ' + this.constructor.name);
    }
}
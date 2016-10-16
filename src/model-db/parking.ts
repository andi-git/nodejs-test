import mongoose = require('mongoose');
import {Query} from "mongoose";
import {injectable} from "inversify";
import {Logger} from "../util/logger";
import TYPES from "../types";
import {inject} from "inversify";
import {User} from "../model-db/user";
import {ResultBasic, Result} from "../util/result";
import {GeoLocation} from "../model/position";
import {Schema} from "mongoose";
import {Repository, AbstractRepository} from "./modelHelper";

export interface Parking extends mongoose.Document {
    parkingId: String, // TODO replace this id with _id
    user: User,
    date: Date,
    location: {type: [Number], index: '2d'},
    state: String,
    meters: number,
    seconds: number;
    address: string;
}

export const ParkingSchema = new mongoose.Schema({
    parkingId: {type: String, required: true},
    user: {type: Schema.Types.ObjectId, ref:'User', required: false},
    date: {type: Date, required: true},
    location: {type: [Number], index: '2d', required: true},
    state: {type: String, required: true},
    meters: {type: Number, required: false},
    seconds: {type: Number, required: false},
    address: {type: String, required: false}
});

export const ParkingModel = mongoose.model<Parking>('Parking', ParkingSchema);

export class Parkings {

    public static asGeoLocation(parking:Parking):GeoLocation {
        return new GeoLocation(parking.location[0], parking.location[1]);
    }
}

export interface ParkingRepository extends Repository<Parking> {

    removeByUser(user: User): Result<void>;
}

@injectable()
export class ParkingRepositoryBasic extends AbstractRepository<Parking> implements ParkingRepository {

    constructor(@inject(TYPES.Logger) logger: Logger) {
        super(logger, ParkingModel, 'parking');
        this.logger.info('create ' + this.constructor.name);
    }

    removeByUser(user: User): Result<void> {
        let self = this;
        let result: Result<void> = new ResultBasic<void>();
        ParkingModel
            .find({user: user})
            .remove({}, (err) => {
                if (err) {
                    self.logger.error('error on removing parking-offers of user', user);
                    result.error();
                } else {
                    self.logger.info('removed all parking-offers of user', user);
                    result.success(null);
                }
            });
        return result;
    }
}
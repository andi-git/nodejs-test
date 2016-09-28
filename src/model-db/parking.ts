import mongoose = require('mongoose');
import {Query} from "mongoose";
import {injectable} from "inversify";
import {Logger} from "../util/logger";
import TYPES from "../types";
import {inject} from "inversify";
import {User} from "../model/user";
import {ResultBasic, Result} from "../util/result";
import {GeoLocation} from "../model/position";

export interface Parking extends mongoose.Document {
    parkingId: String,
    user: String,
    date: Date,
    location: {type: [Number], index: '2d'},
    state: String,
    meters: number,
    seconds: number;
    address: string;
}

export const ParkingSchema = new mongoose.Schema({
    parkingId: {type: String, required: true},
    user: {type: String, required: true},
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

export interface ParkingRepository<Parking> {

    count(condition: Object): Result<number>;

    find(condition: Object, limit: number, sort: string, onSuccess: (parkings: Parking[]) => void, onError: (err: any) => void): void;

    findOne(condition: Object, limit: number, sort: Object, onSuccess: (parking: Parking) => void, onError: (err: any) => void): void;

    removeAll(): Result<void>;

    removeByUser(user: User): Result<void>;

    save(parking: Parking, user: User): Result<Parking>;
}

@injectable()
export class ParkingRepositoryBasic implements ParkingRepository<Parking> {

    private logger: Logger;

    constructor(@inject(TYPES.Logger) logger: Logger) {
        this.logger = logger;
        this.logger.info('create ' + this.constructor.name);
    }

    count(condition: Object): Result<number> {
        let self = this;
        let result: Result<number> = new ResultBasic<number>();
        ParkingModel.count(condition, function (err, count) {
            if (err) {
                self.logger.error('error on counting parkings: ' + err);
                result.error(err);
            } else {
                self.logger.info('number of parkings: ' + count);
                result.success(count);
            }
        });
        return result;
    }

    findOne(condition: Object, limit: number, sort: Object, onSuccess: (parking: Parking) => void, onError: (err: any) => void): void {
        this.addConditionsToQueryAndExecute(ParkingModel.findOne(condition), limit, sort, onSuccess, onError);
    }

    find(condition: Object, limit: number, sort: Object, onSuccess: (parkings: Parking[]) => void, onError: (err: any) => void): void {
        this.addConditionsToQueryAndExecute(ParkingModel.find(condition), limit, sort, onSuccess, onError);
    }

    private addConditionsToQueryAndExecute<T>(query: Query<T>, limit: number, sort: Object, onSuccess: (res: T) => void, onError: (err: any) => void) {
        query = this.addLimitToQuery(query, limit);
        query = this.addSortToQuery(query, sort);
        this.executeQuery(query, onSuccess, onError);
    }

    //noinspection JSMethodCanBeStatic
    private addLimitToQuery<T>(query: Query<T>, limit: number): Query<T> {
        if (limit) {
            return query.limit(limit);
        } else {
            return query;
        }
    }

    //noinspection JSMethodCanBeStatic
    private addSortToQuery<T>(query: Query<T>, sort: Object): Query<T> {
        if (sort) {
            return query.sort(sort);
        } else {
            return query;
        }
    }

    private executeQuery<T>(query: Query<T>, onSuccess: (res: T) => void, onError: (err: any) => void): void {
        query.exec((err, res) => {
            if (err) {
                onError.call(this);
            } else {
                onSuccess.call(this, res);
            }
        });
    }

    removeAll(): Result<void> {
        let self = this;
        let result: Result<void> = new ResultBasic<void>();
        ParkingModel.remove({}, function (err) {
            if (err) {
                self.logger.error('error on removing all parkings: ' + err);
                result.error(err);
            } else {
                self.logger.info('remove all parkings');
                result.success(null);
            }
        });
        return result;
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

    save(parking: Parking, user: User): Result<Parking> {
        let self = this;
        let result: Result<Parking> = new ResultBasic<Parking>();
        parking.save((err) => {
            if (err) {
                self.logger.error(err, user);
                result.error();
            } else {
                self.logger.info('parking ' + parking.parkingId + ' saved', user);
                result.success(parking);
            }
        });
        return result;
    }
}
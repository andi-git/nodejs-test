import mongoose = require('mongoose');
import {Query} from "mongoose";
import {injectable} from "inversify";
import {Logger} from "../util/logger";
import TYPES from "../types";
import {inject} from "inversify";
import {User} from "../model/user";
import {ResultBasic, Result} from "../util/result";

export interface Parking extends mongoose.Document {
    parkingId: String,
    user: String,
    date: Date,
    location: {type: [Number], index: '2d'},
    state: String
}

export const ParkingSchema = new mongoose.Schema({
    parkingId: {type: String, required: true},
    user: {type: String, required: true},
    date: {type: Date, required: true},
    location: {type: [Number], index: '2d', required: true},
    state: {type: String, required: true}
});

export const ParkingModel = mongoose.model<Parking>('Parking', ParkingSchema);

export interface ParkingRepository<Parking> {

    find(condition: Object, limit: number, sort: string, onSuccess: (parkings: Parking[]) => void, onError: (err: any) => void): void;

    findOne(condition: Object, limit: number, sort: Object, onSuccess: (parking: Parking) => void, onError: (err: any) => void): void;

    removeByUser(user: User): Result<void>;

    save(parking: Parking, user: User): Result<Parking>;
}

@injectable()
export class ParkingRepositoryBasic implements ParkingRepository<Parking> {

    private logger: Logger;

    constructor(@inject(TYPES.Logger) logger: Logger) {
        this.logger = logger;
        logger.info('create ' + this.constructor.name);
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

    removeByUser(user: User): Result<void> {
        let result: Result<void> = new ResultBasic<void>();
        ParkingModel
            .find({user: user})
            .remove({}, (err) => {
                if (err) {
                    this.logger.error('error on removing parking-offers of user', user);
                    result.error();
                } else {
                    this.logger.info('removed all parking-offers of user', user);
                    result.success(null);
                }
            });
        return result;
    }

    save(parking: Parking, user: User): Result<Parking> {
        let result: Result<Parking> = new ResultBasic<Parking>();
        parking.save((err) => {
            if (err) {
                this.logger.error(err, user);
                result.error();
            } else {
                this.logger.info('parking ' + parking.parkingId + ' saved', user);
                result.success(parking);
            }
        });
        return result;
    }
}
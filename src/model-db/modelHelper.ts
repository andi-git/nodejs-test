import mongoose = require('mongoose');
import {Logger} from "../util/logger";
import {Result, ResultBasic} from "../util/result";
import {Model} from "mongoose";
import {Query} from "mongoose";
import {User} from "./user";
import {injectable, inject, unmanaged} from "inversify";
import TYPES from "../types";

export interface Repository<T extends mongoose.Document> {

    count(condition: Object): Result<number>;

    find(condition: Object, limit: number, sort: string, onSuccess: (model: T[]) => void, onError: (err: any) => void): void;

    findOne(condition: Object, limit: number, sort: Object, onSuccess: (model: T) => void, onError: (err: any) => void): void;

    removeAll(): Result<void>;

    save(model: T, currentUser: User): Result<T>;

    getType(): string;
}

@injectable()
export abstract class AbstractRepository<T extends mongoose.Document> implements Repository<T> {

    protected logger: Logger;

    private model: Model<T>;

    private type: string;

    constructor(@inject(TYPES.Logger) logger: Logger, @unmanaged() model: Model<T>, @unmanaged() type: string) {
        this.logger = logger;
        this.model = model;
        this.type = type;
    }

    getType(): string {
        return this.type;
    }

    count(condition: Object): Result<number> {
        let self = this;
        let result: Result<number> = new ResultBasic<number>();
        this.model.count(condition, function (err, count) {
            if (err) {
                self.logger.error('error on counting ' + this.model.constructor.name + ': ' + err);
                result.error(err);
            } else {
                self.logger.info('number of ' + this.model.constructor.name + ': ' + count);
                result.success(count);
            }
        });
        return result;
    }

    findOne(condition: Object, limit: number, sort: Object, onSuccess: (model: T) => void, onError: (err: any) => void): void {
        this.addConditionsToQueryAndExecute(this.model.findOne(condition), limit, sort, onSuccess, onError);
    }

    find(condition: Object, limit: number, sort: Object, onSuccess: (model: T[]) => void, onError: (err: any) => void): void {
        this.addConditionsToQueryAndExecute(this.model.find(condition), limit, sort, onSuccess, onError);
    }

    protected addConditionsToQueryAndExecute<T>(query: Query<T>, limit: number, sort: Object, onSuccess: (res: T) => void, onError: (err: any) => void) {
        query = this.addLimitToQuery(query, limit);
        query = this.addSortToQuery(query, sort);
        this.executeQuery(query, onSuccess, onError);
    }

    //noinspection JSMethodCanBeStatic
    protected addLimitToQuery<T>(query: Query<T>, limit: number): Query<T> {
        if (limit) {
            return query.limit(limit);
        } else {
            return query;
        }
    }

    //noinspection JSMethodCanBeStatic
    protected addSortToQuery<T>(query: Query<T>, sort: Object): Query<T> {
        if (sort) {
            return query.sort(sort);
        } else {
            return query;
        }
    }

    protected executeQuery<T>(query: Query<T>, onSuccess: (res: T) => void, onError: (err: any) => void): void {
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
        this.model.remove({}, function (err) {
            if (err) {
                self.logger.error('error on removing all ' + self.getType() + 's: ' + err);
                result.error(err);
            } else {
                self.logger.info('remove all ' + self.getType() + 's');
                result.success(null);
            }
        });
        return result;
    }

    save(model: T, currentUser: User): Result<T> {
        let self = this;
        let result: Result<T> = new ResultBasic<T>();
        model.save((err) => {
            if (err) {
                self.logger.error(err, currentUser);
                result.error();
            } else {
                self.logger.info(self.getType() + ' saved', currentUser);
                result.success(model);
            }
        });
        return result;
    }
}
import mongoose = require('mongoose');
import {injectable} from "inversify";
import {Logger} from "../util/logger";
import TYPES from "../types";
import {inject} from "inversify";
import {Parking} from "./parking";
import {Schema} from "mongoose";
import {Repository, AbstractRepository} from "./modelHelper";
import {Result, ResultBasic} from "../util/result";

export interface User extends mongoose.Document {
    username: string,
    firstname: string,
    lastname: string,
    password: string,
    email: string,
    paypal: string,
    cartype: string,
    carbrand: string,
    carcategory: string,
    city: string,
    zip: string,
    street: string,
    parking: Parking
}

export const UserSchema = new mongoose.Schema({
    username: {type: String, required: true},
    firstname: {type: String, required: true},
    lastname: {type: String, required: true},
    password: {type: String, required: true},
    email: {type: String, required: true},
    paypal: {type: String, required: true},
    cartype: {type: String, required: true},
    carbrand: {type: String, required: true},
    carcategory: {type: String, required: true},
    city: {type: String, required: true},
    zip: {type: String, required: true},
    street: {type: String, required: true},
    parking: {type: Schema.Types.ObjectId, ref:'Parking', required: false}
});

export const UserModel = mongoose.model<User>('User', UserSchema);

export interface UserRepository extends Repository<User> {

    findUserByUsernameAndPassword(username: string, password: string): Result<User>;

    findUserByUsername(username: string): Result<User>;
}

@injectable()
export class UserRepositoryBasic extends AbstractRepository<User> implements UserRepository {

    constructor(@inject(TYPES.Logger) logger: Logger) {
        super(logger, UserModel, 'user');
        this.logger.info('create ' + this.constructor.name);
    }

    public findUserByUsernameAndPassword(username: string, password: string): Result<User> {
        let self = this;
        let result: Result<User> = new ResultBasic<User>();
        this.findOne(
            {username: username, password: password},
            null,
            null,
            (user: User) => {
                self.logger.info('found user "' + username + '" with password "' + password + '": ' + user._id);
                result.success(user);
            },
            (err: any) => {
                self.logger.error(err);
                result.error();
            });
        return result;
    }

    public findUserByUsername(username: string): Result<User> {
        let self = this;
        let result: Result<User> = new ResultBasic<User>();
        this.findOne(
            {username: username},
            null,
            null,
            (user: User) => {
                self.logger.info('found user "' + username + '": ' + user._id);
                result.success(user);
            },
            (err: any) => {
                self.logger.error(err);
                result.error();
            });
        return result;
    }
}
import {injectable} from 'inversify';
import 'reflect-metadata';
import {Result, ResultBasic} from '../util/result';
import {User} from '../model-db/user';
import {Logger} from '../util/logger';
import TYPES from '../types';
import {inject} from 'inversify';
import 'reflect-metadata';
import {UserModel, UserRepository} from "../model-db/user";

export interface UserService {

    checkPassword(username: string, password: string): Result<User>;

    all(currentUser: User): Result<Array<User>>;

    getUserByUserame(username: string): Result<User>;

    getUserByEmail(email: string): Result<User>;

    save(userAttributes: Object, currentUser: User): Result<User>;

    update(username: string,
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
           currentUser: User): Result<User>;
}

@injectable()
export class UserServiceBasic implements UserService {

    logger: Logger;
    userRepository: UserRepository;

    constructor(@inject(TYPES.Logger) logger: Logger,
                @inject(TYPES.UserRepository) userRepository: UserRepository) {
        this.logger = logger;
        this.userRepository = userRepository;
        logger.info('create ' + this.constructor.name);
    }

    public checkPassword(username: string, password: string): Result<User> {
        return this.userRepository.findUserByUsernameAndPassword(username, password);
    }

    public all(currentUser: User): Result<Array<User>> {
        let result: Result<Array<User>> = new ResultBasic<Array<User>>();
        this.logger.info('get all users', currentUser);
        this.userRepository.find(
            {},
            null,
            '_id',
            (users: User[]) => {
                result.success(users);
            },
            (err: any) => {
                result.error(err);
            });
        return result;
    }

    public getUserByUserame(username: string): Result<User> {
        return this.userRepository.findUserByUsername(username);
    }

    public getUserByEmail(email: string): Result<User> {
        return this.userRepository.findUserByEmail(email);
    }

    public save(userAttributes: Object, currentUser: User): Result<User> {
        return this.userRepository.save(new UserModel(userAttributes), currentUser);
    }

    public update(username: string,
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
                  currentUser: User): Result<User> {
        return this.userRepository.update(username,
            firstname,
            lastname,
            password,
            email,
            paypal,
            cartype,
            carbrand,
            carcategory,
            city,
            zip,
            street,
            currentUser);
    }
}

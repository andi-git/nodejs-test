import {injectable} from 'inversify';
import 'reflect-metadata';
import {Result, ResultBasic} from '../util/result';
import {User} from '../model-db/user';
import {Logger} from '../util/logger';
import TYPES from '../types';
import {inject} from 'inversify';
import 'reflect-metadata';
import {UserRepository} from "../model-db/user";

export interface UserService {

    checkPassword(username: string, password: string): Result<User>;

    all(currentUser: User): Result<Array<User>>;

    getUserByUserame(username: string): Result<User>;
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
        this.logger.info('get all parkings', currentUser);
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
}

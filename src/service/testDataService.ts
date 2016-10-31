import {ParkingModel, ParkingRepository, Parking} from '../model-db/parking';
import {Logger} from '../util/logger';
import {GeoLocation} from '../model/position';
import TYPES from '../types';
import {inject, injectable} from 'inversify';
import 'reflect-metadata';
import {Result, ResultBasic} from "../util/result";
import {UserModel, UserRepository, User} from "../model-db/user";
import {TrackingRepository, Tracking, TrackingModel} from "../model-db/tracking";

export interface TestDataService {

    resetAll();
}

@injectable()
export class TestDataServiceBasic implements TestDataService {

    logger: Logger;
    userRepository: UserRepository;
    parkingRepository: ParkingRepository;
    trackingRepository: TrackingRepository;

    constructor(@inject(TYPES.Logger) logger: Logger,
                @inject(TYPES.UserRepository) userRepository: UserRepository,
                @inject(TYPES.ParkingRepository) parkingRepository: ParkingRepository,
                @inject(TYPES.TrackingRepository) trackingRepository: TrackingRepository) {
        this.logger = logger;
        this.userRepository = userRepository;
        this.parkingRepository = parkingRepository;
        this.trackingRepository = trackingRepository;
        logger.info('create ' + this.constructor.name);
    }

    public resetAll(): Result<void> {
        let result: Result<void> = new ResultBasic<void>();
        this.resetUser().onSuccess(() => {
            this.resetParking().onSuccess(() => {
                this.resetTracking().onSuccess(() => {
                    result.success(null);
                });
            });
        });
        return result;
    }

    private resetUser(): Result<void> {
        let self = this;
        let result: Result<void> = new ResultBasic<void>();
        // clear schema
        this.userRepository.removeAll()
            .onSuccess(() => {
                let usersToCreate: Array<UserToCreate> = [];
                usersToCreate.push(new UserToCreate('elle', 'elleho', 'App', 'ho', 'elle@ho.com', '1234567890', 'Opel', 'Astra', 'medium', 'Wien', '1000', 'MyStreet 1'));
                usersToCreate.push(new UserToCreate('test', 'test', 'User', '123', 'test@user.com', '0987654321', 'Ford', 'Galaxy', 'large', 'Wien', '1001', 'Backstreet 6'));
                usersToCreate.push(new UserToCreate('user1', 'user', 'one', '123', 'user1@test.com', '1', 'VW', 'Golf', 'mdeium', 'Wien', '1000', 'Street 1'));
                usersToCreate.push(new UserToCreate('user2', 'user', 'two', '123', 'user2@test.com', '2', 'VW', 'Golf', 'mdeium', 'Wien', '1000', 'Street 2'));
                usersToCreate.push(new UserToCreate('user3', 'user', 'three', '123', 'user3@test.com', '3', 'VW', 'Golf', 'mdeium', 'Wien', '1000', 'Street 3'));
                usersToCreate.push(new UserToCreate('user4', 'user', 'four', '123', 'user4@test.com', '4', 'VW', 'Golf', 'mdeium', 'Wien', '1000', 'Street 4'));
                usersToCreate.push(new UserToCreate('user5', 'user', 'five', '123', 'user5@test.com', '5', 'VW', 'Golf', 'mdeium', 'Wien', '1000', 'Street 5'));
                require('async').each(usersToCreate,
                    function (userToCreate, callback) {
                        self.saveUser(userToCreate).onSuccess(() => {
                            callback();
                        }).onError((err: any) => {
                            callback(err);
                        })
                    }, function (err) {
                        if (err) {
                            result.error(err);
                        } else {
                            result.success(null);
                        }
                    });
            });
        return result;
    }

    private resetParking(): Result<void> {
        let self = this;
        let result: Result<void> = new ResultBasic<void>();
        // clear schema
        this.parkingRepository.removeAll()
            .onSuccess(() => {
                let parkingsToCreate: Array<ParkingToCreate> = [];
                parkingsToCreate.push(new ParkingToCreate('user1', new GeoLocation(48.213678, 16.348490)));
                parkingsToCreate.push(new ParkingToCreate('user2', new GeoLocation(48.213125, 16.345820)));
                parkingsToCreate.push(new ParkingToCreate('user3', new GeoLocation(48.214842, 16.353348)));
                parkingsToCreate.push(new ParkingToCreate('user4', new GeoLocation(48.221406, 16.352793)));
                parkingsToCreate.push(new ParkingToCreate('user5', new GeoLocation(48.254887, 16.415753)));
                require('async').each(parkingsToCreate,
                    function (parkingToCreate: ParkingToCreate, callback) {
                        self.userRepository.findUserByUsername(parkingToCreate.username)
                            .onSuccess((user: User) => {
                                self.saveParking(parkingToCreate, user).onSuccess(() => {
                                    callback();
                                }).onError((err: any) => {
                                    callback(err);
                                })
                            })
                            .onError((err) => {
                                callback(err);
                            });
                    }, function (err) {
                        if (err) {
                            result.error(err);
                        } else {
                            result.success(null);
                        }
                    });

            });
        return result;
    }

    private resetTracking(): Result<void> {
        let self = this;
        let result: Result<void> = new ResultBasic<void>();
        // clear schema
        this.trackingRepository.removeAll()
            .onSuccess(() => {
                let trackingsToCreate: Array<TrackingToCreate> = [];
                let date: Date = new Date();
                trackingsToCreate.push(new TrackingToCreate('elle', date.getTime(), new GeoLocation(48.213678, 16.348490), 'drive'));
                date.setSeconds(date.getSeconds() - 10);
                trackingsToCreate.push(new TrackingToCreate('elle', date.getTime(), new GeoLocation(48.213677, 16.348490), 'drive'));
                date.setSeconds(date.getSeconds() - 10);
                trackingsToCreate.push(new TrackingToCreate('elle', date.getTime(), new GeoLocation(48.213676, 16.348490), 'drive'));
                date.setSeconds(date.getSeconds() - 10);
                trackingsToCreate.push(new TrackingToCreate('elle', date.getTime(), new GeoLocation(48.213676, 16.348491), 'walk'));
                date.setSeconds(date.getSeconds() - 10);
                trackingsToCreate.push(new TrackingToCreate('elle', date.getTime(), new GeoLocation(48.213676, 16.348492), 'walk'));
                require('async').each(trackingsToCreate,
                    function (trackingToCreate: TrackingToCreate, callback) {
                        self.userRepository.findUserByUsername(trackingToCreate.username)
                            .onSuccess((user: User) => {
                                self.saveTracking(trackingToCreate, user).onSuccess(() => {
                                    callback();
                                }).onError((err: any) => {
                                    callback(err);
                                })
                            })
                            .onError((err) => {
                                callback(err);
                            });
                    }, function (err) {
                        if (err) {
                            result.error(err);
                        } else {
                            result.success(null);
                        }
                    });

            });
        return result;
    }

    private saveUser(userToCreate: UserToCreate): Result<User> {
        return this.userRepository.save(new UserModel({
            username: userToCreate.username,
            firstname: userToCreate.firstname,
            lastname: userToCreate.lastname,
            password: userToCreate.password,
            email: userToCreate.email,
            paypal: userToCreate.paypal,
            cartype: userToCreate.cartype,
            carbrand: userToCreate.carbrand,
            carcategory: userToCreate.carcategory,
            city: userToCreate.city,
            zip: userToCreate.zip,
            street: userToCreate.street
        }), null);
    }

    private saveParking(parkingToCreate: ParkingToCreate, user: User): Result<Parking> {
        return this.parkingRepository.save(new ParkingModel({
            user: user,
            date: parkingToCreate.date,
            location: parkingToCreate.location,
            state: parkingToCreate.state
        }), null);
    }

    private saveTracking(trackingToCreate: TrackingToCreate, user: User): Result<Tracking> {
        return this.trackingRepository.save(new TrackingModel({
            user: user,
            date: trackingToCreate.date,
            location: trackingToCreate.location,
            mode: trackingToCreate.mode
        }), null);
    }
}

export class UserToCreate {
    username: string;
    firstname: string;
    lastname: string;
    password: string;
    email: string;
    paypal: string;
    cartype: string;
    carbrand: string;
    carcategory: string;
    city: string;
    zip: string;
    street: string;

    constructor(username: string, firstname: string, lastname: string, password: string, email: string, paypal: string, cartype: string, carbrand: string, carcategory: string, city: string, zip: string, street: string) {
        this.username = username;
        this.firstname = firstname;
        this.lastname = lastname;
        this.password = password;
        this.email = email;
        this.paypal = paypal;
        this.cartype = cartype;
        this.carbrand = carbrand;
        this.carcategory = carcategory;
        this.city = city;
        this.zip = zip;
        this.street = street;
    }
}

export class ParkingToCreate {

    username: string;
    date: number;
    location: any;
    state: string;

    constructor(username: string, geoLocation: GeoLocation) {
        this.username = username;
        this.date = Date.now();
        this.location = [geoLocation.latitude, geoLocation.longitude];
        this.state = 'OFFER';
    }
}

export class TrackingToCreate {

    username: string;
    date: number;
    location: any;
    mode: string;

    constructor(username: string, date: number, geoLocation: GeoLocation, mode: string) {
        this.username = username;
        this.date = date;
        this.location = [geoLocation.latitude, geoLocation.longitude];
        this.mode = mode;
    }
}
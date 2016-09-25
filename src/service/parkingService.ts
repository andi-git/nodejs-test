import {injectable} from 'inversify';
import 'reflect-metadata';
import {Parking, ParkingModel} from '../model-db/parking';
import {Result, ResultBasic} from '../util/result';
import {IdGenerator} from '../util/idGenerator';
import {GeoLocation} from '../model/position';
import {User} from '../model/user';
import {Logger} from '../util/logger';
import TYPES from '../types';
import {inject} from 'inversify';
import 'reflect-metadata';

export interface ParkingService {

    offer(user: User, geoLocation: GeoLocation): Result<Parking>;

    current(user: User): Result<Parking>;

    nearest(user: User, geoLocation: GeoLocation): Result<Parking>;

    near(user: User, geoLocation: GeoLocation): Result<Array<Parking>>;

    all(user: User): Result<Array<Parking>>;
}

@injectable()
export class ParkingServiceBasic implements ParkingService {

    logger: Logger;
    idGenerator: IdGenerator;

    constructor(@inject(TYPES.Logger) logger: Logger,
                @inject(TYPES.IdGenerator) idGenerator: IdGenerator) {
        this.logger = logger;
        this.idGenerator = idGenerator;
        logger.info('create ' + this.constructor.name);
    }

    public offer(user: User, geoLocation: GeoLocation): Result<Parking> {
        let self = this;
        let result: Result<Parking> = new ResultBasic<Parking>();
        let parkingId = this.idGenerator.guid();
        self.logger.info('offers parking ' + parkingId + ' at ' + geoLocation, user);
        ParkingModel.find({user: user}).remove({}, (err) => {
            self.logger.info('remove all parking-offer of user', user);
            var parking = new ParkingModel({
                parkingId: parkingId,
                user: user.name,
                date: Date.now(),
                location: [geoLocation.latitude, geoLocation.longitude],
                state: 'OFFER'
            });
            parking.save((err) => {
                if (err) {
                    self.logger.error(err, user);
                    result.error();
                }
                else {
                    self.logger.info('parking ' + parkingId + ' saved', user);
                    result.success(parking);
                }
            });
        });
        return result;
    }

    public current(user: User): Result<Parking> {
        let self = this;
        let result: Result<Parking> = new ResultBasic<Parking>();
        self.logger.info('checks current offered parking', user);
        ParkingModel.findOne({user: user.name}, {}, {sort: {'date': -1}}, (err, parking) => {
            if (err) {
                self.logger.error(err, user);
                result.error();
            } else {
                self.logger.info('current offered parking is ' + parking, user);
                result.success(parking);
            }
        });
        return result;
    }

    public nearest(user: User, geoLocation: GeoLocation): Result<Parking> {
        let self = this;
        let result: Result<Parking> = new ResultBasic<Parking>();
        self.logger.info('checks nearest for ' + geoLocation, user);
        this.parkings(geoLocation, 1, 100)
            .onSuccess((parkings: Array<Parking>) => {
                result.success(parkings[0]);
            })
            .onError((parkings: Array<Parking>) => {
                result.error(parkings[0]);
            });
        return result;
    }

    public near(user: User, geoLocation: GeoLocation): Result<Array<Parking>> {
        let self = this;
        let result: Result<Array<Parking>> = new ResultBasic<Array<Parking>>();
        self.logger.info('checks near for ' + geoLocation, user);
        this.parkings(geoLocation, 3, 100)
            .onSuccess((parkings: Array<Parking>) => {
                result.success(parkings);
            })
            .onError((parkings: Array<Parking>) => {
                result.error(parkings);
            });
        return result;
    }

    public all(user: User): Result<Array<Parking>> {
        let self = this;
        let result: Result<Array<Parking>> = new ResultBasic<Array<Parking>>();
        self.logger.info('get all parkings', user);
        ParkingModel.find({}).sort('date').exec((err, parkings) => {
            if (err) {
                result.error();
            } else {
                result.success(parkings);
            }
        });
        return result;
    }

    private parkings(geoLocation: GeoLocation, limit: number, maxDistance: number): Result<Array<Parking>> {
        let result: Result<Array<Parking>> = new ResultBasic<Array<Parking>>();
        ParkingModel.find({
            location: {
                $near: [geoLocation.latitude, geoLocation.longitude],
                $maxDistance: maxDistance
            }
        }).limit(limit).exec((err, parkings) => {
            if (err) {
                result.error();
            } else {
                result.success(parkings);
            }
        });
        return result;
    }
}
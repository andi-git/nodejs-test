import {injectable} from 'inversify';
import 'reflect-metadata';
import {Parking, ParkingModel, ParkingRepository, Parkings} from '../model-db/parking';
import {Result, ResultBasic} from '../util/result';
import {IdGenerator} from '../util/idGenerator';
import {GeoLocation} from '../model/position';
import {User} from '../model/user';
import {Logger} from '../util/logger';
import TYPES from '../types';
import {inject} from 'inversify';
import 'reflect-metadata';
import {DistanceService} from "./distanceService";
import {Distance} from "../model/distance";

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
    parkingRepository: ParkingRepository<Parking>;
    distanceService: DistanceService;

    constructor(@inject(TYPES.Logger) logger: Logger,
                @inject(TYPES.IdGenerator) idGenerator: IdGenerator,
                @inject(TYPES.ParkingRepository) parkingRepository: ParkingRepository<Parking>,
                @inject(TYPES.DistanceService) distanceService: DistanceService) {
        this.logger = logger;
        this.idGenerator = idGenerator;
        this.parkingRepository = parkingRepository;
        this.distanceService = distanceService;
        logger.info('create ' + this.constructor.name);
    }

    public offer(user: User, geoLocation: GeoLocation): Result<Parking> {
        let result: Result<Parking> = new ResultBasic<Parking>();
        let parkingId = this.idGenerator.guid();
        this.logger.info('offers parking ' + parkingId + ' at ' + geoLocation, user);
        var parkingOffered = new ParkingModel({
            parkingId: parkingId,
            user: user.name,
            date: Date.now(),
            location: [geoLocation.latitude, geoLocation.longitude],
            state: 'OFFER'
        });
        this.parkingRepository.removeByUser(user)
            .onSuccess(() => {
                this.parkingRepository.save(parkingOffered, user)
                    .onSuccess((parking: Parking) => {
                        result.success(parking);
                    })
                    .onError((parking: Parking) => {
                        result.error(parking);
                    });
            })
            .onError(() => {
                result.error(null);
            });
        return result;
    }

    public current(user: User): Result<Parking> {
        let self = this;
        let result: Result<Parking> = new ResultBasic<Parking>();
        self.logger.info('checks current offered parking', user);
        this.parkingRepository.findOne(
            {user: user.name},
            null,
            {'date': -1},
            (parking: Parking) => {
                self.logger.info('current offered parking is ' + parking, user);
                result.success(parking);
            },
            (err: any) => {
                self.logger.error(err, user);
                result.error();
            });
        return result;
    }

    public nearest(user:User, geoLocation:GeoLocation):Result<Parking> {
        let self = this;
        let result:Result<Parking> = new ResultBasic<Parking>();
        this.logger.info('check nearest for ' + geoLocation, user);
        // get 3 possible parkings from mongo-db
        this.parkings(geoLocation, 3, 300)
            .onSuccess((parkingsForLocation:Array<Parking>) => {
                // get the real distance for all parkings
                self.addRealDistanceToParkings(geoLocation, parkingsForLocation, user)
                    .onSuccess((parkingsForLocationWithRealDistances: Array<Parking>) => {
                        result.success(self.distanceService.sortParkingsByDistance(user, parkingsForLocationWithRealDistances, 1)[0]);
                    })
                    .onError((err: any) => {
                        result.error(err);
                    });
            })
            .onError(function (parkings:Array<Parking>) {
                result.error(parkings[0]);
            });
        return result;
    }

    public near(user: User, geoLocation: GeoLocation): Result<Array<Parking>> {
        let self = this;
        let result: Result<Array<Parking>> = new ResultBasic<Array<Parking>>();
        this.logger.info('checks near for ' + geoLocation, user);
        this.parkings(geoLocation, 5, 100)
            .onSuccess((parkingsForLocation: Array<Parking>) => {
                // get the real distance for all parkings
                self.addRealDistanceToParkings(geoLocation, parkingsForLocation, user)
                    .onSuccess((parkingsForLocationWithRealDistances: Array<Parking>) => {
                        result.success(self.distanceService.sortParkingsByDistance(user, parkingsForLocationWithRealDistances, 3));
                    })
                    .onError((err: any) => {
                        result.error(err);
                    });
            })
            .onError((parkings: Array<Parking>) => {
                result.error(parkings);
            });
        return result;
    }

    public near2(user: User, geoLocation: GeoLocation): Result<Array<Parking>> {
        let result: Result<Array<Parking>> = new ResultBasic<Array<Parking>>();
        this.logger.info('checks near for ' + geoLocation, user);
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
        let result: Result<Array<Parking>> = new ResultBasic<Array<Parking>>();
        this.logger.info('get all parkings', user);
        this.parkingRepository.find(
            {},
            null,
            'date',
            (parkings: Parking[]) => {
                result.success(parkings);
            },
            (err: any) => {
                result.error(err);
            });
        return result;
    }

    private parkings(geoLocation: GeoLocation, limit: number, maxDistance: number): Result<Array<Parking>> {
        let result: Result<Array<Parking>> = new ResultBasic<Array<Parking>>();
        this.parkingRepository.find({
                location: {
                    $near: [geoLocation.latitude, geoLocation.longitude],
                    $maxDistance: maxDistance
                }
            },
            limit,
            null,
            (parkings: Parking[]) => {
                result.success(parkings);
            },
            (err: any) => {
                result.error(err);
            });
        return result;
    }

    private addRealDistanceToParkings(geoLocation: GeoLocation, parkings: Array<Parking>, user: User): Result<Array<Parking>> {
        let self = this;
        let result: Result<Array<Parking>> = new ResultBasic<Array<Parking>>();
        let newParkings: Array<Parking> = [];
        let count: number = 0;
        parkings.forEach(parking => {
            this.logger.info('check real distance for parking: ' + parking.parkingId, user);
            self.distanceService.distance(user, geoLocation, Parkings.asGeoLocation(parking))
                .onSuccess(function (distance:Distance) {
                    self.logger.info('set real distance for parking: ' + parking.parkingId, user);
                    parking.meters = distance.meters;
                    parking.seconds = distance.seconds;
                    parking.address = distance.toAddress;
                    newParkings.push(parking);
                    count++;
                    if (count === parkings.length) {
                        result.success(newParkings);
                    }
                })
                .onError(function () {
                    self.logger.error("error on calculating distance between " + geoLocation + " and " + parking, user);
                    result.error();
                });
        });
        return result;
    }
}
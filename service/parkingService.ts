import {Parking, ParkingModel} from "../model-db/parking";
import {Result, ResultBasic} from "../util/result";
import {IdGenerator} from "../util/idGenerator";
import {GeoLocation} from "../model/position";
import {User} from "../model/user";
import {Logger} from "../util/logger";

export class ParkingService {

    logger:Logger = new Logger();

    constructor() {
    }

    public offer(user:User, geoLocation:GeoLocation):Result<Parking> {
        let result:Result<Parking> = new ResultBasic<Parking>();
        let parkingId = IdGenerator.guid();
        this.logger.info('offers parking ' + parkingId + ' at ' + geoLocation, user);
        ParkingModel.find({user: user}).remove({}, function (err) {
            new Logger().info('remove all parking-offer of user', user);
            var parking = new ParkingModel({
                parkingId: parkingId,
                user: user.name,
                date: Date.now(),
                location: [geoLocation.latitude, geoLocation.longitude],
                state: 'OFFER'
            });
            parking.save(function (err) {
                if (err) {
                    new Logger().error(err, user);
                    result.error();
                }
                else {
                    new Logger().info('parking ' + parkingId + ' saved', user);
                    result.success(parking);
                }
            });
        });
        return result;
    }

    public current(user:User):Result<Parking> {
        let result:Result<Parking> = new ResultBasic<Parking>();
        this.logger.info('checks current offered parking', user);
        ParkingModel.findOne({user: user.name}, {}, {sort: {'date': -1}}, function (err, parking) {
            if (err) {
                new Logger().error(err, user);
                result.error();
            } else {
                new Logger().info('current offered parking is ' + parking, user);
                result.success(parking);
            }
        });
        return result;
    }

    public nearest(user:User, geoLocation:GeoLocation):Result<Parking> {
        let result:Result<Parking> = new ResultBasic<Parking>();
        this.logger.info('checks nearest for ' + geoLocation, user);
        this.parkings(geoLocation, 1, 100)
            .onSuccess(function (parkings:Array<Parking>) {
                result.success(parkings[0]);
            })
            .onError(function (parkings:Array<Parking>) {
                result.error(parkings[0]);
            });
        return result;
    }

    public near(user:User, geoLocation:GeoLocation):Result<Array<Parking>> {
        let result:Result<Array<Parking>> = new ResultBasic<Array<Parking>>();
        this.logger.info('checks near for ' + geoLocation, user);
        this.parkings(geoLocation, 3, 100)
            .onSuccess(function (parkings:Array<Parking>) {
                result.success(parkings);
            })
            .onError(function (parkings:Array<Parking>) {
                result.error(parkings);
            });
        return result;
    }

    private parkings(geoLocation:GeoLocation, limit:number, maxDistance:number):Result<Array<Parking>> {
        let result:Result<Array<Parking>> = new ResultBasic<Array<Parking>>();
        ParkingModel.find({
            location: {
                $near: [geoLocation.latitude, geoLocation.longitude],
                $maxDistance: maxDistance
            }
        }).limit(limit).exec(function (err, parkings) {
            if (err) {
                result.error();
            } else {
                result.success(parkings);
            }
        });
        return result;
    }
}
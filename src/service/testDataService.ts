import {ParkingModel} from '../model-db/parking';
import {IdGenerator} from '../util/idGenerator';
import {Logger} from '../util/logger';
import {GeoLocation} from '../model/position';
import TYPES from '../types';
import {inject, injectable} from 'inversify';
import 'reflect-metadata';

export interface TestDataService {

    resetParking();
}

@injectable()
export class TestDataServiceBasic implements TestDataService {

    logger: Logger;
    idGenerator: IdGenerator;

    constructor(@inject(TYPES.Logger) logger: Logger,
                @inject(TYPES.IdGenerator) idGenerator: IdGenerator) {
        this.logger = logger;
        this.idGenerator = idGenerator;
        logger.info('create ' + this.constructor.name);
    }

    public resetParking() {
        var self = this;
        // clear schema
        ParkingModel.remove({}, function (err) {
            self.logger.info('remove all parkings');
        });
        // add entries to schema
        this.saveParking('user1', new GeoLocation(48.213678, 16.348490));
        this.saveParking('user2', new GeoLocation(48.213125, 16.345820));
        this.saveParking('user3', new GeoLocation(48.214842, 16.353348));
        this.saveParking('user4', new GeoLocation(48.221406, 16.352793));
        this.saveParking('user5', new GeoLocation(48.254887, 16.415753));
        ParkingModel.count({}, function (err, count) {
            self.logger.info('number of offered parkings: ' + count);
        });
    }

    private saveParking(user: string, geoLocation: GeoLocation) {
        new ParkingModel({
            parkingId: this.idGenerator.guid(),
            user: user,
            date: Date.now(),
            location: [geoLocation.latitude, geoLocation.longitude],
            state: 'OFFER'
        }).save();
    }
}

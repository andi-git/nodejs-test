import {ParkingModel, ParkingRepository, Parking} from '../model-db/parking';
import {IdGenerator} from '../util/idGenerator';
import {Logger} from '../util/logger';
import {GeoLocation} from '../model/position';
import TYPES from '../types';
import {inject, injectable} from 'inversify';
import 'reflect-metadata';
import {Result, ResultBasic} from "../util/result";

export interface TestDataService {

    resetParking(): Result<number>;
}

@injectable()
export class TestDataServiceBasic implements TestDataService {

    logger: Logger;
    idGenerator: IdGenerator;
    parkingRepository: ParkingRepository<Parking>;

    constructor(@inject(TYPES.Logger) logger: Logger,
                @inject(TYPES.IdGenerator) idGenerator: IdGenerator,
                @inject(TYPES.ParkingRepository) parkingRepository: ParkingRepository<Parking>) {
        this.logger = logger;
        this.idGenerator = idGenerator;
        this.parkingRepository = parkingRepository;
        logger.info('create ' + this.constructor.name);
    }

    public resetParking(): Result<number> {
        let result: Result<number> = new ResultBasic<number>();
        var self = this;
        // clear schema
        this.parkingRepository.removeAll()
            .onSuccess(() => {
                // add entries to schema
                this.saveParking('user1', new GeoLocation(48.213678, 16.348490));
                this.saveParking('user2', new GeoLocation(48.213125, 16.345820));
                this.saveParking('user3', new GeoLocation(48.214842, 16.353348));
                this.saveParking('user4', new GeoLocation(48.221406, 16.352793));
                this.saveParking('user5', new GeoLocation(48.254887, 16.415753));
                this.parkingRepository.count({}).onSuccess((count: number) => {
                    result.success(count);
                });
            });
        return result;
    }

    private saveParking(user: string, geoLocation: GeoLocation) {
        this.parkingRepository.save(new ParkingModel({
            parkingId: this.idGenerator.guid(),
            user: user,
            date: Date.now(),
            location: [geoLocation.latitude, geoLocation.longitude],
            state: 'OFFER'
        }), null);
    }
}

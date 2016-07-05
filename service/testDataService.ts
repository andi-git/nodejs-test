import {ParkingModel} from "../model-db/parking";
import {IdGenerator} from "../util/idGenerator";
import {Logger} from "../util/logger";
import {GeoLocation} from "../model/position";

export class TestDataService {

    logger:Logger = new Logger();

    public resetParking() {
        // clear schema
        ParkingModel.remove({}, function (err) {
            new Logger().info('remove all parkings');
        });
        // add entries to schema
        this.saveParking("user1", new GeoLocation(48.213678, 16.348490));
        this.saveParking("user2", new GeoLocation(48.213125, 16.345820));
        this.saveParking("user3", new GeoLocation(48.214842, 16.353348));
        this.saveParking("user4", new GeoLocation(48.221406, 16.352793));
        this.saveParking("user5", new GeoLocation(48.254887, 16.415753));
        ParkingModel.count({}, function (err, count) {
            new Logger().info('number of offered parkings: ' + count);
        });
    }

    private saveParking(user:string, geoLocation:GeoLocation) {
        new ParkingModel({
            parkingId: IdGenerator.guid(),
            user: user,
            date: Date.now(),
            location: [geoLocation.latitude, geoLocation.longitude],
            state: 'OFFER'
        }).save();
    }
}

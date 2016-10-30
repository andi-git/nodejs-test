import {injectable, inject} from "inversify";
import "reflect-metadata";
import {Result, ResultBasic} from "../util/result";
import {User} from "../model-db/user";
import {Logger} from "../util/logger";
import TYPES from "../types";
import {TrackingRepository, TrackingModel, Tracking} from "../model-db/tracking";
import {GeoLocation} from "../model/position";

export interface TrackingService {

    all(currentUser: User): Result<Array<Tracking>>;

    track(geoLocation: GeoLocation, currentUser: User): Result<Tracking>;
}

@injectable()
export class TrackingServiceBasic implements TrackingService {

    logger: Logger;
    trackingRepository: TrackingRepository;

    constructor(@inject(TYPES.Logger) logger: Logger,
                @inject(TYPES.TrackingRepository) trackingRepository: TrackingRepository) {
        this.logger = logger;
        this.trackingRepository = trackingRepository;
        logger.info('create ' + this.constructor.name);
    }

    track(geoLocation: GeoLocation, currentUser: User): Result<Tracking> {
        let result: Result<Tracking> = new ResultBasic<Tracking>();
        var trackingNew = new TrackingModel({
            user: currentUser,
            date: Date.now(),
            location: [geoLocation.latitude, geoLocation.longitude]
        });
        this.trackingRepository.save(trackingNew, currentUser)
            .onSuccess((trackingSaved: Tracking) => {
                this.logger.info('track ' + trackingSaved._id + ' at ' + trackingSaved.location + ' on ' + trackingSaved.date, currentUser);
                result.success(trackingSaved);
            })
            .onError((err) => {
                result.error(err);
            });
        return result;
    }

    public all(currentUser: User): Result<Array<Tracking>> {
        let result: Result<Array<Tracking>> = new ResultBasic<Array<Tracking>>();
        this.logger.info('get all trackings', currentUser);
        this.trackingRepository.find(
            {},
            null,
            '_id',
            (trackings: Tracking[]) => {
                result.success(trackings);
            },
            (err: any) => {
                result.error(err);
            });
        return result;
    }
}
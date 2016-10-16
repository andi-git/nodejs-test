import {Result, ResultBasic} from "../util/result";
import {Logger} from "../util/logger";
import {GeoLocation} from "../model/position";
import {User} from "../model-db/user";
import {Distance} from "../model/distance";
import {GoogleDistanceMatrixKey} from "../util/googleDistanceMatrixKey";
import {Parking} from "../model-db/parking";
import {injectable, inject} from "inversify";
import TYPES from "../types";

export interface DistanceService {

    distance(user: User, from: GeoLocation, to: GeoLocation): Result<Distance>;

    sortParkingsByDistance(user: User, parkings: Array<Parking>, max: number): Array<Parking>;
}

@injectable()
export class DistanceServiceBasic implements DistanceService {

    googleDistanceMatrix = require('google-distance-matrix');
    private logger: Logger;
    private googleDistanceMatrixKey: GoogleDistanceMatrixKey;

    constructor(@inject(TYPES.Logger) logger: Logger,
                @inject(TYPES.GoogleDistanceMatrixKey) googleDistanceMatricKey: GoogleDistanceMatrixKey) {
        this.logger = logger;
        this.googleDistanceMatrixKey = googleDistanceMatricKey;
        this.logger.info('create ' + this.constructor.name);
    }

    public distance(user: User, from: GeoLocation, to: GeoLocation): Result<Distance> {
        this.logger.info('get distance for ' + from.toString() + ' to ' + to.toString(), user);
        let self = this;
        let distanceResult: Result<Distance> = new ResultBasic<Distance>();
        var origins = [from.toGoogleDistanceMatrixPosition()];
        var destinations = [to.toGoogleDistanceMatrixPosition()];
        this.googleDistanceMatrixKey.key(user)
            .onSuccess((key: string) => {
                this.logger.info('get key for GoogleDistanceMatrix', user);
                this.googleDistanceMatrix.key(key);
                this.googleDistanceMatrix.matrix(origins, destinations, function (err, distances) {
                    if (err) {
                        self.logger.error("error on distances between " + from + " and " + to + ": " + err, user);
                        distanceResult.error(err);
                    }
                    if (!distances) {
                        self.logger.error("no distances between " + from + " and " + to, user);
                        distanceResult.error();
                    }
                    if (distances.status == 'OK') {
                        self.logger.error("distance status for " + from + " to " + to + ' is OK', user);
                        for (var i = 0; i < origins.length; i++) {
                            for (var j = 0; j < destinations.length; j++) {
                                var fromAddress = distances.origin_addresses[i];
                                var toAddress = distances.destination_addresses[j];
                                self.logger.info('state from ' + fromAddress + ' to ' + toAddress + ': ' +  distances.rows[0].elements[j].status, user);
                                if (distances.rows[0].elements[j].status == 'OK') {
                                    let meters: number = distances.rows[i].elements[j].distance.value;
                                    let seconds: number = distances.rows[i].elements[j].duration.value;
                                    let distance: Distance = new Distance(from, fromAddress, to, toAddress, meters, seconds);
                                    self.logger.info('distance between ' + from + ' and ' + to + ' is ' + distance, user);
                                    distanceResult.success(distance);
                                } else {
                                    self.logger.error(to + " (" + toAddress + ") is not reachable from " + from + " (" + fromAddress + ")", user);
                                    distanceResult.error();
                                }
                            }
                        }
                    } else {
                        self.logger.error("distance status for " + from + " to " + to + ' is NOT OK: ' + distances.status, user);
                    }
                });
            })
            .onError((err: any) => {
                self.logger.warn('no key for GoogleDistanceMatrix is available: ' + err, user);
                distanceResult.success(new Distance(from, '', to, '', 0, 0));
            });
        return distanceResult;
    }

    //noinspection JSMethodCanBeStatic
    public sortParkingsByDistance(user: User, parkings: Array<Parking>, max: number): Array<Parking> {
        this.logger.info('sort parkings by distance', user);
        let ordered: Array<Parking> = parkings.sort((p1, p2) => p1.seconds - p2.seconds);
        if (ordered.length > max) {
            return ordered.slice(0, max);
        } else {
            return ordered;
        }
    }
}

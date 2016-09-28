import {Result, ResultBasic} from "../util/result";
import {Logger} from "../util/logger";
import {GeoLocation} from "../model/position";
import {User} from "../model/user";
import {Distance} from "../model/distance";
import {GoogleDistanceMatrixKey} from "../util/googleDistanceMatrixKey";
import {Parking} from "../model-db/parking";
import {injectable, inject} from "inversify";
import TYPES from "../types";

export interface DistanceService {

    distance(user:User, from:GeoLocation, to:GeoLocation):Result<Distance>;
}

@injectable()
export class DistanceServiceBasic {

    googleDistanceMatrix = require('google-distance-matrix');
    private logger: Logger;
    private googleDistanceMatrixKey: GoogleDistanceMatrixKey;

    constructor(@inject(TYPES.Logger) logger: Logger,
                @inject(TYPES.GoogleDistanceMatrixKey) googleDistanceMatricKey: GoogleDistanceMatrixKey) {
        this.logger = logger;
        this.googleDistanceMatrixKey = googleDistanceMatricKey;
        this.logger.info('create ' + this.constructor.name);
    }

    public distance(user:User, from:GeoLocation, to:GeoLocation):Result<Distance> {
        let self = this;
        let distance:Result<Distance> = new ResultBasic<Distance>();
        var origins = [from.toString()];
        var destinations = [to.toString()];
        this.googleDistanceMatrix.key(this.googleDistanceMatrixKey.key());
        this.googleDistanceMatrix.matrix(origins, destinations, function (err, distances) {
            if (err) {
                self.logger.error("error on distances between " + from + " and " + to + ": " + err, user);
                distance.error();
            }
            if (!distances) {
                self.logger.error("no distances between " + from + " and " + to, user);
                distance.error();
            }
            if (distances.status == 'OK') {
                for (var i = 0; i < origins.length; i++) {
                    for (var j = 0; j < destinations.length; j++) {
                        var fromAddress = distances.origin_addresses[i];
                        var toAddress = distances.destination_addresses[j];
                        if (distances.rows[0].elements[j].status == 'OK') {
                            var meters = distances.rows[i].elements[j].distance.value;
                            var seconds = distances.rows[i].elements[j].duration.value;
                            distance.success(new Distance(from, fromAddress, to, toAddress, meters, seconds));
                        } else {
                            self.logger.error(to + " (" + toAddress + ") is not reachable from " + from + " (" + fromAddress + ")", user);
                            distance.error();
                        }
                    }
                }
            }
        });
        return distance;
    }

    public nearest(user:User, parkings:Array<Parking>, max:number):Result<Array<Parking>> {
        let result:Result<Array<Parking>> = new ResultBasic<Array<Parking>>();
        let ordered = parkings.sort((p1, p2) => p1.seconds - p2.seconds);
        if (ordered.length > max) {
            result.success(ordered.slice(0, max - 1));
        } else {
            result.success(ordered);
        }
        return result;
    }
}

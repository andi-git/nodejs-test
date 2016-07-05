"use strict";
var parking_1 = require("../model-db/parking");
var result_1 = require("../util/result");
var idGenerator_1 = require("../util/idGenerator");
var logger_1 = require("../util/logger");
var ParkingService = (function () {
    function ParkingService() {
        this.logger = new logger_1.Logger();
    }
    ParkingService.prototype.offer = function (user, geoLocation) {
        var result = new result_1.ResultBasic();
        var parkingId = idGenerator_1.IdGenerator.guid();
        this.logger.info('offers parking ' + parkingId + ' at ' + geoLocation, user);
        parking_1.ParkingModel.find({ user: user }).remove({}, function (err) {
            new logger_1.Logger().info('remove all parking-offer of user', user);
            var parking = new parking_1.ParkingModel({
                parkingId: parkingId,
                user: user.name,
                date: Date.now(),
                location: [geoLocation.latitude, geoLocation.longitude],
                state: 'OFFER'
            });
            parking.save(function (err) {
                if (err) {
                    new logger_1.Logger().error(err, user);
                    result.error();
                }
                else {
                    new logger_1.Logger().info('parking ' + parkingId + ' saved', user);
                    result.success(parking);
                }
            });
        });
        return result;
    };
    ParkingService.prototype.current = function (user) {
        var result = new result_1.ResultBasic();
        this.logger.info('checks current offered parking', user);
        parking_1.ParkingModel.findOne({ user: user.name }, {}, { sort: { 'date': -1 } }, function (err, parking) {
            if (err) {
                new logger_1.Logger().error(err, user);
                result.error();
            }
            else {
                new logger_1.Logger().info('current offered parking is ' + parking, user);
                result.success(parking);
            }
        });
        return result;
    };
    ParkingService.prototype.nearest = function (user, geoLocation) {
        var result = new result_1.ResultBasic();
        this.logger.info('checks nearest for ' + geoLocation, user);
        this.parkings(geoLocation, 1, 100)
            .onSuccess(function (parkings) {
            result.success(parkings[0]);
        })
            .onError(function (parkings) {
            result.error(parkings[0]);
        });
        return result;
    };
    ParkingService.prototype.near = function (user, geoLocation) {
        var result = new result_1.ResultBasic();
        this.logger.info('checks near for ' + geoLocation, user);
        this.parkings(geoLocation, 3, 100)
            .onSuccess(function (parkings) {
            result.success(parkings);
        })
            .onError(function (parkings) {
            result.error(parkings);
        });
        return result;
    };
    ParkingService.prototype.parkings = function (geoLocation, limit, maxDistance) {
        var result = new result_1.ResultBasic();
        parking_1.ParkingModel.find({
            location: {
                $near: [geoLocation.latitude, geoLocation.longitude],
                $maxDistance: maxDistance
            }
        }).limit(limit).exec(function (err, parkings) {
            if (err) {
                result.error();
            }
            else {
                result.success(parkings);
            }
        });
        return result;
    };
    return ParkingService;
}());
exports.ParkingService = ParkingService;
//# sourceMappingURL=parkingService.js.map
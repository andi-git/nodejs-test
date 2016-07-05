"use strict";
var parking_1 = require("../model-db/parking");
var idGenerator_1 = require("../util/idGenerator");
var logger_1 = require("../util/logger");
var position_1 = require("../model/position");
var TestDataService = (function () {
    function TestDataService() {
        this.logger = new logger_1.Logger();
    }
    TestDataService.prototype.resetParking = function () {
        // clear schema
        parking_1.ParkingModel.remove({}, function (err) {
            new logger_1.Logger().info('remove all parkings');
        });
        // add entries to schema
        this.saveParking("user1", new position_1.GeoLocation(48.213678, 16.348490));
        this.saveParking("user2", new position_1.GeoLocation(48.213125, 16.345820));
        this.saveParking("user3", new position_1.GeoLocation(48.214842, 16.353348));
        this.saveParking("user4", new position_1.GeoLocation(48.221406, 16.352793));
        this.saveParking("user5", new position_1.GeoLocation(48.254887, 16.415753));
        parking_1.ParkingModel.count({}, function (err, count) {
            new logger_1.Logger().info('number of offered parkings: ' + count);
        });
    };
    TestDataService.prototype.saveParking = function (user, geoLocation) {
        new parking_1.ParkingModel({
            parkingId: idGenerator_1.IdGenerator.guid(),
            user: user,
            date: Date.now(),
            location: [geoLocation.latitude, geoLocation.longitude],
            state: 'OFFER'
        }).save();
    };
    return TestDataService;
}());
exports.TestDataService = TestDataService;
//# sourceMappingURL=testDataService.js.map
/**
 * This is a simple server where you can store some parking-locations and search for it (near/nearest).
 * The data is stored with the help of mongodb.
 * The server offers a rest-api for the client.
 * The nodejs-Framework express is used for some basic web-app-functionality.
 * To have the benefit of types, TypeScript is used.
 */
"use strict";
var _this = this;
var express = require('express');
var position_1 = require("./model/position");
var user_1 = require("./model/user");
var logger_1 = require("./util/logger");
var parkingService_1 = require("./service/parkingService");
var testDataService_1 = require("./service/testDataService");
var version_0_0_1 = "0.0.1";
var version_0_0_2 = "0.0.2";
var logger = new logger_1.Logger();
// mongodb (with mongoose) connection
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/test');
mongoose.connection.on('error', console.error.bind(console, 'connection error:'));
// services
var serverError = function (message, user, response) {
    this.logger.error(message, user);
    response.writeHead(500);
    response.end();
};
var offerParking = function (user, geoLocation, response) {
    new parkingService_1.ParkingService().offer(user, geoLocation)
        .onSuccess(function (parking) {
        return response.json({
            user: parking.user,
            parkingId: parking.parkingId,
            state: parking.state,
            latitude: parking.location[0],
            longitude: parking.location[1]
        });
    })
        .onError(function (parking) {
        this.serverError("error on offer parking " + parking, user, response);
    });
};
var currentParking = function (user, response) {
    var _this = this;
    new parkingService_1.ParkingService().current(user)
        .onSuccess(function (parking) {
        return response.json({
            user: parking.user,
            parkingId: parking.parkingId,
            state: parking.state,
            latitude: parking.location[0],
            longitude: parking.location[1]
        });
    })
        .onError(function (parking) {
        _this.serverError("error on current parking " + parking, user, response);
    });
};
var nearest = function (user, geoLocation, response) {
    var _this = this;
    new parkingService_1.ParkingService().nearest(user, geoLocation)
        .onSuccess(function (parking) {
        return response.json(parking);
    })
        .onError(function (result) {
        _this.serverError("error on nearest parking", user, response);
    });
};
var near = function (user, geoLocation, response) {
    var _this = this;
    new parkingService_1.ParkingService().near(user, geoLocation)
        .onSuccess(function (parkings) {
        return response.json(parkings);
    })
        .onError(function (result) {
        _this.serverError("error on near parking", user, response);
    });
};
var app = express();
// ping
app.get("/ping", function (request, response) {
    response.writeHead(200);
    response.write("OK");
    response.end();
});
// welcome
app.get("/", function (request, response) {
    response.writeHead(200);
    response.write("Welcome to Node.js");
    response.end();
});
// interceptor for logging
app.use(function (request, response, next) {
    var fullUrl = request.protocol + '://' + request.get('host') + request.originalUrl;
    var ip = request.headers['x-forwarded-for'] || request.connection.remoteAddress;
    logger.info(ip + ' calls ' + fullUrl);
    next();
});
// interceptor for authorization
app.use(function (request, response, next) {
    var fullUrl = request.protocol + '://' + request.get('host') + request.originalUrl;
    if (fullUrl.indexOf(version_0_0_1) > -1) {
        next();
    }
    else {
        if (restResourceFromRequest(request) === '/parking/resettestdata' ||
            restResourceFromRequest(request) === '/parking') {
            next();
        }
        else {
            // authenticate the user
            var username = request.get("username");
            var password = request.get("password");
            if ((username === "test" && password === "1234") || (username === "elle" && password === "ho")) {
                next();
            }
            else {
                logger.warn('wrong password: ' + password, new user_1.User(username));
                response.writeHead(401);
                response.end();
            }
        }
    }
});
// offer a new parking
app.get("/elleho/" + version_0_0_1 + "/parking/offer/:username/:latitude/:longitude", function (request, response) {
    return offerParking(request.params.username, new position_1.GeoLocation(request.params.latitude, request.params.longitude), response);
});
// offer a new parking
app.post("/elleho/" + version_0_0_2 + "/parking/offer/:latitude/:longitude", function (request, response) {
    return offerParking(userFromRequest(request), new position_1.GeoLocation(request.params.latitude, request.params.longitude), response);
});
// get the current offer of a user
app.get("/elleho/" + version_0_0_1 + "/parking/offer/:username/current", function (request, response) {
    return currentParking(request.params.username, response);
});
// get the current offer of a user
app.get("/elleho/" + version_0_0_2 + "/parking/offer/current", function (request, response) {
    return currentParking(userFromRequest(request), response);
});
// get the nearest parking with help of mongodb-function 'near'
app.get("/elleho/" + version_0_0_1 + "/parking/nearest/:latitude/:longitude", function (request, response) {
    return nearest(new user_1.User("n/a"), new position_1.GeoLocation(request.params.latitude, request.params.longitude), response);
});
// get the nearest parking with help of mongodb-function 'near'
app.get("/elleho/" + version_0_0_2 + "/parking/nearest/:latitude/:longitude", function (request, response) {
    return nearest(userFromRequest(request), new position_1.GeoLocation(request.params.latitude, request.params.longitude), response);
});
// get all near parkings within 50m with help of mongodb-function 'near'
app.get("/elleho/" + version_0_0_1 + "/parking/near/:latitude/:longitude", function (request, response) {
    return near(new user_1.User("n/a"), new position_1.GeoLocation(request.params.latitude, request.params.longitude), response);
});
// get all near parkings within 50m with help of mongodb-function 'near'
app.get("/elleho/" + version_0_0_2 + "/parking/near/:latitude/:longitude", function (request, response) {
    return near(userFromRequest(request), new position_1.GeoLocation(request.params.latitude, request.params.longitude), response);
});
// get all parkings in the database
app.get("/elleho/" + version_0_0_2 + "/parking", function (request, response) {
    new parkingService_1.ParkingService().all(userFromRequest(request))
        .onSuccess(function (parkings) {
        return response.json(parkings);
    })
        .onError(function (result) {
        _this.serverError("error on all parkings", userFromRequest(request), response);
    });
});
// reset the test-data: clear the database and insert new data
app.get("/elleho/" + version_0_0_1 + "/parking/resettestdata", function (request, response) {
    new testDataService_1.TestDataService().resetParking();
    response.send("Testdaten erneuert");
});
// reset the test-data: clear the database and insert new data
app.get("/elleho/" + version_0_0_2 + "/parking/resettestdata", function (request, response) {
    new testDataService_1.TestDataService().resetParking();
    response.send("Testdaten erneuert");
});
// run the server on port 9090
app.listen(9090, function () {
    console.log("Node.js (express) server listening on port %d in %s mode", 9090, app.settings.env);
});
function userFromRequest(request) {
    return new user_1.User(request.get("username"));
}
function restResourceFromRequest(request) {
    var split = request.originalUrl.split('/');
    return request.originalUrl.substr(split[0].length + split[1].length + split[2].length + 2);
}

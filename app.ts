/**
 * This is a simple server where you can store some parking-locations and search for it (near/nearest).
 * The data is stored with the help of mongodb.
 * The server offers a rest-api for the client.
 * The nodejs-Framework express is used for some basic web-app-functionality.
 * To have the benefit of types, TypeScript is used.
 */

import express = require('express');
import {EventEmitter} from "events";
import {GeoLocation} from "./model/position";
import {Response} from "express";

let version_0_0_1 = "0.0.1";
let version_0_0_2 = "0.0.2";

// just a simple logger
let logger = new EventEmitter();
logger.on('info', function (user, message) {
    console.log(new Date().toISOString() + ' INFO  | ' + user + ': ' + message);
});
logger.on('warn', function (user, message) {
    console.log(new Date().toISOString() + ' WARN  | ' + user + ': ' + message);
});
logger.on('error', function (user, message) {
    console.log(new Date().toISOString() + ' ERROR | ' + user + '' + message);
});

var offerParking = function (username:string, geoLocation:GeoLocation, response:Response) {
    let parkingId = guid();
    logger.emit('info', username, 'offers parking ' + parkingId + ' at ' + geoLocation);

    Parking.find({user: username}).remove({}, function (err) {
        logger.emit('info', username, 'remove all parking-offer of user');
        var currentParking = new Parking({
            parkingId: parkingId,
            user: username,
            date: Date.now(),
            location: [geoLocation.latitude, geoLocation.longitude],
            state: 'OFFER'
        });
        currentParking.save(function (err) {
            if (err)
                logger.emit('error', username, err);
            else
                logger.emit('info', username, 'parking ' + parkingId + ' saved');
        });
        return response.json({
            user: username,
            parkingId: parkingId,
            state: 'OFFER',
            latitude: geoLocation.latitude,
            longitude: geoLocation.longitude
        });
    });
};

var currentParking = function (username:string, response:Response) {
    logger.emit('info', username, 'checks current offered parking');
    Parking.findOne({user: username}, {}, {sort: {'date': -1}}, function (err, parkingData) {
        if (err) {
            logger.emit('error', username, err);
            response.writeHead(500);
            response.end();
        } else {
            logger.emit('info', username, 'current offered parking is ' + parkingData);
            return response.json({
                user: username,
                parkingId: parkingData.parkingId,
                state: parkingData.state,
                latitude: parkingData.location[0],
                longitude: parkingData.location[1]
            });
        }
    });
};

var nearest = function (username:string, geoLocation:GeoLocation, response:Response) {
    logger.emit('info', username, 'checks nearest for ' + geoLocation);
    return getParkings(geoLocation, 1, 50, response);
};

var near = function (username:string, geoLocation:GeoLocation, response:Response) {
    logger.emit('info', username, 'checks near for ' + geoLocation);
    return getParkings(geoLocation, 3, 10, response);
};

var getParkings = function (geoLocation:GeoLocation, limit:number, maxDistance:number, response:Response) {
    Parking.find({
        location: {
            $near: [geoLocation.latitude, geoLocation.longitude],
            $maxDistance: maxDistance
        }
    }).limit(limit).exec(function (err, parkings) {
        if (err) {
            return response.json(500, err);
        } else {
            return response.json(parkings);
        }
    });
};

let app = express();

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

// mongodb (with mongoose) connection
var Parking;
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/test');
mongoose.connection.on('error', console.error.bind(console, 'connection error:'));
// model for a parking
mongoose.connection.once('open', function () {
    var parkingSchema = mongoose.Schema({
        parkingId: String,
        user: String,
        date: Date,
        location: {type: [Number], index: '2d'},
        state: String
    });
    Parking = mongoose.model('Parking', parkingSchema);
});

// interceptor for logging
app.use(function (request, response, next) {
    var fullUrl = request.protocol + '://' + request.get('host') + request.originalUrl;
    var ip = request.headers['x-forwarded-for'] || request.connection.remoteAddress;
    logger.emit('info', 'n/a', ip + ' calls ' + fullUrl);
    next();
});

// interceptor for authorization
app.use(function (request, response, next) {
    var fullUrl = request.protocol + '://' + request.get('host') + request.originalUrl;
    if (fullUrl.indexOf(version_0_0_1) > -1) {
        next();
    } else {
        // authenticate the user
        let username = request.get("username");
        let password = request.get("password");
        if ((username === "test" && password === "1234") || (username === "elle" && password === "ho")) {
            next();
        } else {
            logger.emit('warn', username, 'wrong password: ' + password);
            response.writeHead(401);
            response.end();
        }
    }
});

// offer a new parking
app.get("/elleho/" + version_0_0_1 + "/parking/offer/:username/:latitude/:longitude", function (request, response) {
    return offerParking(request.params.username, new GeoLocation(request.params.latitude, request.params.longitude), response);
});

// offer a new parking
app.post("/elleho/" + version_0_0_2 + "/parking/offer/:latitude/:longitude", function (request, response) {
    return offerParking(request.get("username"), new GeoLocation(request.params.latitude, request.params.longitude), response);
});

// get the current offer of a user
app.get("/elleho/" + version_0_0_1 + "/parking/offer/:username/current", function (request, response) {
    return currentParking(request.params.username, response);
});

// get the current offer of a user
app.get("/elleho/" + version_0_0_2 + "/parking/offer/current", function (request, response) {
    return currentParking(request.get("username"), response);
});

// get the nearest parking with help of mongodb-function 'near'
app.get("/elleho/" + version_0_0_1 + "/parking/nearest/:latitude/:longitude", function (request, response) {
    return nearest("n/a", new GeoLocation(request.params.latitude, request.params.longitude), response);
});

// get the nearest parking with help of mongodb-function 'near'
app.get("/elleho/" + version_0_0_2 + "/parking/nearest/:latitude/:longitude", function (request, response) {
    return nearest(request.get("username"), new GeoLocation(request.params.latitude, request.params.longitude), response);
});

// get all near parkings within 50m with help of mongodb-function 'near'
app.get("/elleho/" + version_0_0_1 + "/parking/near/:latitude/:longitude", function (request, response) {
    return near("n/a", new GeoLocation(request.params.latitude, request.params.longitude), response);
});

// get all near parkings within 50m with help of mongodb-function 'near'
app.get("/elleho/" + version_0_0_2 + "/parking/near/:latitude/:longitude", function (request, response) {
    return near(request.get("username"), new GeoLocation(request.params.latitude, request.params.longitude), response);
});

// reset the test-data: clear the database and insert new data
app.get("/elleho/" + version_0_0_1 + "/parking/resettestdata", function (request, response) {
    // clear schema
    Parking.remove({}, function (err) {
        logger.emit('info', null, 'remove all parkings');
    });

    // add entries to schema
    var parkingGeo = new Parking({
        parkingId: guid(),
        user: "user1",
        date: Date.now(),
        location: [48.213678, 16.348490],
        state: 'OFFER'
    });
    parkingGeo.save();
    var parkingGeo = new Parking({
        parkingId: guid(),
        user: "user2",
        date: Date.now(),
        location: [48.213125, 16.345820],
        state: 'OFFER'
    });
    parkingGeo.save();
    var parkingGeo = new Parking({
        parkingId: guid(),
        user: "user3",
        date: Date.now(),
        location: [48.214842, 16.353348],
        state: 'OFFER'
    });
    parkingGeo.save();
    var parkingGeo = new Parking({
        parkingId: guid(),
        user: "user4",
        date: Date.now(),
        location: [48.221406, 16.352793],
        state: 'OFFER'
    });
    parkingGeo.save();
    var parkingGeo = new Parking({
        parkingId: guid(),
        user: "user5",
        date: Date.now(),
        location: [48.254887, 16.415753],
        state: 'OFFER'
    });
    parkingGeo.save();
    Parking.count({}, function (err, count) {
        logger.emit('info', null, 'number of offered parkings: ' + count);
    });
    response.send("Testdaten erneuert");
});

// run the server on port 9090
app.listen(9090, function () {
    console.log("Node.js (express) server listening on port %d in %s mode", 9090, app.settings.env);
});

// generate an id
function guid() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }

    return s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4();
}

/**
 * This is a simple server where you can store some parking-locations and search for it (near/nearest).
 * The data is stored with the help of mongodb.
 * The server offers a rest-api for the client.
 * The nodejs-Framework express is used for some basic web-app-functionality.
 * To have the benefit of types, TypeScript is used.
 */

import express = require('express');
import {GeoLocation} from "./model/position";
import {User} from "./model/user";
import {Parking} from "./model-db/parking";
import {Logger} from "./util/logger";
import {ParkingService} from "./service/parkingService";
import {TestDataService} from "./service/testDataService";
import {Response, Request} from "express";

let version = "0.0.3";
let logger = new Logger();

// mongodb (with mongoose) connection
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/test');
mongoose.connection.on('error', console.error.bind(console, 'connection error:'));

var serverError = function (message: string, user: User, response: Response) {
    this.logger.error(message, user);
    response.writeHead(500);
    response.end();
};

let app = express();
// var bodyParser = require("body-parser");
// app.use(bodyParser.urlencoded());
// app.use(bodyParser.json());

// ping
app.get("/ping", (request, response) => {
    response.writeHead(200);
    response.write("OK");
    response.end();
});

// welcome
app.get("/", (request, response) => {
    response.writeHead(200);
    response.write("Welcome to Node.js");
    response.end();
});

// interceptor for logging
app.use((request, response, next) => {
    var fullUrl = request.protocol + '://' + request.get('host') + request.originalUrl;
    var ip = request.headers['x-forwarded-for'] || request.connection.remoteAddress;
    logger.info(ip + ' calls ' + fullUrl);
    next();
});

// interceptor for authorization
app.use((request, response, next) => {
    var fullUrl = request.protocol + '://' + request.get('host') + request.originalUrl;
    if (restResourceFromRequest(request) === '/parking/resettestdata' ||
        restResourceFromRequest(request) === '/parking') {
        next();
    } else {
        // authenticate the user
        let username = request.get("username");
        let password = request.get("password");
        if ((username === "test" && password === "1234") || (username === "elle" && password === "ho")) {
            next();
        } else {
            logger.warn('wrong password: ' + password, new User(username));
            response.writeHead(401);
            response.end();
        }
    }
});

// offer a new parking
app.post("/elleho/" + version + "/parking/offer/:latitude/:longitude", (request, response) => {
    let user: User = userFromRequest(request);
    let geoLocation: GeoLocation = new GeoLocation(request.params.latitude, request.params.longitude);
    new ParkingService().offer(user, geoLocation)
        .onSuccess((parking: Parking) => {
            return response.json({
                user: parking.user,
                parkingId: parking.parkingId,
                state: parking.state,
                latitude: parking.location[0],
                longitude: parking.location[1]
            });
        })
        .onError(function (parking: Parking) {
            this.serverError("error on offer parking " + parking, user, response);
        });
});

// get the current offer of a user
app.get("/elleho/" + version + "/parking/offer/current", (request, response) => {
    let user: User = userFromRequest(request);
    new ParkingService().current(user)
        .onSuccess((parking: Parking) => {
            return response.json({
                user: parking.user,
                parkingId: parking.parkingId,
                state: parking.state,
                latitude: parking.location[0],
                longitude: parking.location[1]
            });
        })
        .onError((parking: Parking) => {
            this.serverError("error on current parking " + parking, user, response);
        });
});

// get the nearest parking with help of mongodb-function 'near'
app.get("/elleho/" + version + "/parking/nearest/:latitude/:longitude", (request, response) => {
    let user: User = userFromRequest(request);
    let geoLocation: GeoLocation = new GeoLocation(request.params.latitude, request.params.longitude);
    new ParkingService().nearest(user, geoLocation)
        .onSuccess((parking: Parking) => {
            return response.json(parking);
        })
        .onError((result: Parking) => {
            this.serverError("error on nearest parking", user, response);
        });
});

// get all near parkings within 50m with help of mongodb-function 'near'
app.get("/elleho/" + version + "/parking/near/:latitude/:longitude", (request, response) => {
    let user: User = userFromRequest(request);
    let geoLocation: GeoLocation = new GeoLocation(request.params.latitude, request.params.longitude);
    new ParkingService().near(user, geoLocation)
        .onSuccess((parkings: Array<Parking>) => {
            return response.json(parkings);
        })
        .onError((result: Array<Parking>) => {
            this.serverError("error on near parking", user, response);
        });
});

// get all parkings in the database
app.get("/elleho/" + version + "/parking", (request, response) => {
    new ParkingService().all(userFromRequest(request))
        .onSuccess((parkings: Array<Parking>) => {
            return response.json(parkings);
        })
        .onError((result: Array<Parking>) => {
            this.serverError("error on all parkings", userFromRequest(request), response);
        });
});

// reset the test-data: clear the database and insert new data
app.get("/elleho/" + version + "/parking/resettestdata", (request, response) => {
    new TestDataService().resetParking();
    response.send("Testdaten erneuert");
});

// run the server on port 9090
app.listen(9090, function () {
    console.log("Node.js (express) server listening on port %d in %s mode", 9090, app.settings.env);
});

function userFromRequest(request: Request): User {
    return new User(request.get("username"));
}

function restResourceFromRequest(request: Request): string {
    let split: Array<string> = request.originalUrl.split('/');
    return request.originalUrl.substr(split[0].length + split[1].length + split[2].length + 2);
}
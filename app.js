"use strict";
var express = require('express');
var events_1 = require("events");
var position_1 = require("./model/position");
var version = "1.0.0";
var logger = new events_1.EventEmitter();
logger.on('info', function (user, message) {
    console.log(new Date().toISOString() + ' INFO  | ' + user + ': ' + message);
});
logger.on('warn', function (user, message) {
    console.log(new Date().toISOString() + ' WARN  | ' + user + ': ' + message);
});
logger.on('error', function (user, message) {
    console.log(new Date().toISOString() + ' ERROR | ' + user + '' + message);
});
var app = express();
app.get("/ping", function (request, response) {
    response.writeHead(200);
    response.write("OK");
    response.end();
});
app.get("/", function (request, response) {
    response.writeHead(200);
    response.write("Welcome to Node.js");
    response.end();
});
app.get("/hello/:username", function (request, response) {
    var username = request.params.username;
    logger.emit('info', 'say hello to ' + username);
    response.json({ message: "Hello " + username + "!" });
});
app.get("/elleho/" + version + "/offer", function (request, response) {
    response.writeHead(200);
    response.write("elleho");
    response.end();
});
var Parking;
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/test');
mongoose.connection.on('error', console.error.bind(console, 'connection error:'));
mongoose.connection.once('open', function () {
    var parkingSchema = mongoose.Schema({
        parkingId: String,
        user: String,
        date: Date,
        latitude: String,
        longitude: String,
        state: String
    });
    Parking = mongoose.model('Parking', parkingSchema);
});
app.use(function (request, response, next) {
    var fullUrl = request.protocol + '://' + request.get('host') + request.originalUrl;
    var ip = request.headers['x-forwarded-for'] || request.connection.remoteAddress;
    logger.emit('info', 'n/a', ip + ' calls ' + fullUrl);
    next();
});
app.use(function (request, response, next) {
    // authenticate the user
    // let username = request.params.username;
    // let password = request.params.password;
    // if (username === "test" && password === "1234") {
    next();
    // } else {
    //     logger.emit('warn', username, 'wrong password: ' + password);
    //     response.writeHead(401);
    //     response.end();
    // }
});
app.get("/elleho/" + version + "/parking/offer/:latitude/:longitude/:username/:password", function (request, response) {
    var username = request.params.username;
    var password = request.params.password;
    if (username === "test" && password === "1234") {
        var geoLocation = new position_1.GeoLocation(request.params.latitude, request.params.longitude);
        var parkingId_1 = guid();
        logger.emit('info', username, 'offers parking ' + parkingId_1 + ' at ' + geoLocation);
        var currentParking = new Parking({
            parkingId: parkingId_1,
            user: username,
            date: Date.now(),
            latitude: geoLocation.latitude,
            longitude: geoLocation.longitude,
            state: 'OFFER'
        });
        currentParking.save(function (err) {
            if (err)
                logger.emit('error', username, err);
            else
                logger.emit('info', username, 'parking ' + parkingId_1 + ' saved');
        });
        response.json({
            user: username,
            parkingId: parkingId_1,
            state: 'OFFER',
            latitude: geoLocation.latitude,
            longitude: geoLocation.longitude
        });
    }
    else {
        logger.emit('warn', username, 'wrong password: ' + password);
        response.writeHead(401);
        response.end();
    }
});
app.get("/elleho/" + version + "/parking/offer/current/:username/:password", function (request, response) {
    var username = request.params.username;
    var password = request.params.password;
    if (username === "test" && password === "1234") {
        logger.emit('info', username, 'checks current offered parking');
        Parking.findOne({ user: username }, {}, { sort: { 'date': -1 } }, function (err, parkingData) {
            if (err) {
                logger.emit('error', username, err);
                response.writeHead(500);
                response.end();
            }
            else {
                logger.emit('info', username, 'current offered parking is ' + parkingData);
                response.json({
                    user: username,
                    parkingId: parkingData.parkingId,
                    state: parkingData.state,
                    latitude: parkingData.latitude,
                    longitude: parkingData.longitude
                });
            }
        });
    }
    else {
        logger.emit('warn', username, 'wrong password: ' + password);
        response.writeHead(401);
        response.end();
    }
});
app.listen(9090, function () {
    console.log("Node.js (express) server listening on port %d in %s mode", 9090, app.settings.env);
});
function guid() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }
    return s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4();
}
//# sourceMappingURL=app.js.map
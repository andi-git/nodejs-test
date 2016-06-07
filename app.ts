import express = require('express');
import {EventEmitter} from "events";
import {GeoLocation} from "./model/position";

let version = "1.0.0";

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

let app = express();

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
    response.json({message: "Hello " + username + "!"});
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
        location: {type: [Number], index: '2d'},
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

app.get("/elleho/" + version + "/parking/offer/:username/:latitude/:longitude", function (request, response) {
    let username = request.params.username;
    let geoLocation:GeoLocation = new GeoLocation(request.params.latitude, request.params.longitude);
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
});

app.get("/elleho/" + version + "/parking/offer/:username/current", function (request, response) {
    let username = request.params.username;
    logger.emit('info', username, 'checks current offered parking');
    Parking.findOne({user: username}, {}, {sort: {'date': -1}}, function (err, parkingData) {
        if (err) {
            logger.emit('error', username, err);
            response.writeHead(500);
            response.end();
        } else {
            logger.emit('info', username, 'current offered parking is ' + parkingData);
            response.json({
                user: username,
                parkingId: parkingData.parkingId,
                state: parkingData.state,
                latitude: parkingData.location[0],
                longitude: parkingData.location[1]
            });
        }
    });
});

app.get("/elleho/" + version + "/parking/resettestdata", function (request, response) {
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

app.get("/elleho/" + version + "/parking/nearest/:latitude/:longitude", function (request, response) {
    Parking.find({
        location: {
            $near: [request.params.latitude, request.params.longitude],
            $maxDistance: 50
        }
    }).limit(1).exec(function (err, parkings) {
        if (err) {
            return response.json(500, err);
        } else {
            return response.json(parkings);
        }
    });
});

app.get("/elleho/" + version + "/parking/near/:latitude/:longitude", function (request, response) {
    Parking.find({
        location: {
            $near: [request.params.latitude, request.params.longitude],
            $maxDistance: 50
        }
    }).limit(3).exec(function (err, parkings) {
        if (err) {
            return response.json(500, err);
        } else {
            return response.json(parkings);
        }
    });
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

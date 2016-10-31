/**
 * This is a simple server where you can store some parking-locations and search for it (near/nearest).
 * The data is stored with the help of mongodb.
 * The server offers a rest-api for the client.
 * The nodejs-Framework express is used for some basic web-app-functionality.
 * To have the benefit of types, TypeScript is used.
 */

import express = require('express');
import 'reflect-metadata';
import {Kernel} from 'inversify';
import {GeoLocation} from './model/position';
import {User, UserRepository, UserRepositoryBasic} from './model-db/user';
import {Parking, ParkingRepository, ParkingRepositoryBasic} from './model-db/parking';
import {Logger, LoggerBasic} from './util/logger';
import {ParkingService, ParkingServiceBasic} from './service/parkingService';
import {TestDataService, TestDataServiceBasic} from './service/testDataService';
import {Response, Request} from 'express';
import TYPES from './types';
import {GoogleDistanceMatrixKey, GoogleDistanceMatrixKeyBasic} from "./util/googleDistanceMatrixKey";
import {DistanceServiceBasic, DistanceService} from "./service/distanceService";
import {UserServiceBasic, UserService} from "./service/userService";
import {Result, ResultBasic} from "./util/result";
import {TrackingRepositoryBasic, TrackingRepository, Tracking} from "./model-db/tracking";
import {TrackingServiceBasic, TrackingService} from "./service/trackingService";

// config inversify (dependency injection)
var kernel = new Kernel();
kernel.bind<Logger>(TYPES.Logger).to(LoggerBasic).inSingletonScope();
kernel.bind<ParkingService>(TYPES.ParkingService).to(ParkingServiceBasic);
kernel.bind<UserService>(TYPES.UserService).to(UserServiceBasic);
kernel.bind<TestDataService>(TYPES.TestDataService).to(TestDataServiceBasic).inSingletonScope();
kernel.bind<DistanceService>(TYPES.DistanceService).to(DistanceServiceBasic);
kernel.bind<TrackingService>(TYPES.TrackingService).to(TrackingServiceBasic);
kernel.bind<ParkingRepository>(TYPES.ParkingRepository).to(ParkingRepositoryBasic).inSingletonScope();
kernel.bind<UserRepository>(TYPES.UserRepository).to(UserRepositoryBasic).inSingletonScope();
kernel.bind<TrackingRepository>(TYPES.TrackingRepository).to(TrackingRepositoryBasic).inSingletonScope();
kernel.bind<GoogleDistanceMatrixKey>(TYPES.GoogleDistanceMatrixKey).to(GoogleDistanceMatrixKeyBasic).inSingletonScope();

// some variables
let version = '0.1.3';
let logger: Logger = kernel.get<Logger>(TYPES.Logger);
let parkingService: ParkingService = kernel.get<ParkingService>(TYPES.ParkingService);
let testDataService: TestDataService = kernel.get<TestDataService>(TYPES.TestDataService);
let userService: UserService = kernel.get<UserService>(TYPES.UserService);
let trackingService: TrackingService = kernel.get<TrackingService>(TYPES.TrackingService);

// mongodb (with mongoose) connection
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/test');
mongoose.connection.on('error', console.error.bind(console, 'connection error:'));

var serverError = function (response: Response, message: string, user?: User) {
    logger.error(message, user);
    response.type('application/json; charset=utf-8');
    response.writeHead(500);
    response.write('{"error": "' + message + '"}');
    response.end();
};

let app = express();
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded());
app.use(bodyParser.json());

// ping
app.get('/elleho/' + version + '/ping', (request, response) => {
    response.type('text/plain');
    response.writeHead(200);
    response.write('OK');
    response.end();
});

// interceptor for logging
app.use((request, response, next) => {
    var fullUrl = request.protocol + '://' + request.get('host') + request.originalUrl;
    var ip = request.headers['x-forwarded-for'] || request.connection.remoteAddress;
    logger.info(ip + ' calls ' + fullUrl + ', username: ' + request.get('username'));
    next();
});

// interceptor for authorization
app.use((request, response, next) => {
    if (restResourceFromRequest(request) === '/ping' ||
        restResourceFromRequest(request) === '/resettestdata' ||
        restResourceFromRequest(request) === '/parking' ||
        restResourceFromRequest(request) === '/user' ||
        restResourceFromRequest(request) === 'noSecurity') {
        next();
    } else {
        // authenticate the user
        let username = request.get('username');
        let password = request.get('password');
        userService.checkPassword(username, password)
            .onSuccess(() => {
                next();
            })
            .onError(() => {
                logger.warn('wrong password: ' + password + 'for username ' + username);
                response.writeHead(401);
                response.end();
            });
    }
});

// offer a new parking
app.post('/elleho/' + version + '/parking/offer', (request, response) => {
    getUser(request)
        .onSuccess((user: User) => {
            let geoLocation: GeoLocation = new GeoLocation(request.body.latitude, request.body.longitude);
            parkingService.offer(user, geoLocation)
                .onSuccess((parking: Parking) => {
                    return response.json({
                        user: parking.user,
                        parkingId: parking._id,
                        state: parking.state,
                        latitude: parking.location[0],
                        longitude: parking.location[1]
                    });
                })
                .onError((err: any) => {
                    serverError(response, 'error on offer parking: ' + err, user);
                });
        })
        .onError((err: any) => {
            serverError(response, 'error on offer parking: ' + err);
        });
});

// get the current offer of a user
app.get('/elleho/' + version + '/parking/offer', (request, response) => {
    getUser(request)
        .onSuccess((user: User) => {
            parkingService.current(user)
                .onSuccess((parking: Parking) => {
                    return response.json({
                        user: parking.user,
                        parkingId: parking._id,
                        state: parking.state,
                        latitude: parking.location[0],
                        longitude: parking.location[1]
                    });
                })
                .onError((err: any) => {
                    serverError(response, 'error on current parking ' + err, user);
                });
        })
        .onError((err: any) => {
            serverError(response, 'error on current parking ' + err);
        });
});

// get the nearest parking with help of mongodb-function 'near'
app.put('/elleho/' + version + '/parking/nearest', (request, response) => {
    getUser(request)
        .onSuccess((user: User) => {
            let geoLocation: GeoLocation = new GeoLocation(request.body.latitude, request.body.longitude);
            parkingService.nearest(user, geoLocation)
                .onSuccess((parking: Parking) => {
                    return response.json(parking);
                })
                .onError((err: any) => {
                    serverError(response, 'error on nearest parking: ' + err, user);
                });
        })
        .onError((err: any) => {
            serverError(response, 'error on nearest parking ' + err);
        });
});

// get all near parkings within 50m with help of mongodb-function 'near'
app.put('/elleho/' + version + '/parking/near', (request, response) => {
    getUser(request)
        .onSuccess((user: User) => {
            let geoLocation: GeoLocation = new GeoLocation(request.body.latitude, request.body.longitude);
            parkingService.near(user, geoLocation)
                .onSuccess((parkings: Array<Parking>) => {
                    return response.json(parkings);
                })
                .onError((err: any) => {
                    serverError(response, 'error on near parking: ' + err, user);
                });
        })
        .onError((err: any) => {
            serverError(response, 'error on near parking ' + err);
        });
});

// get all parkings in the database
app.get('/elleho/' + version + '/parking', (request, response) => {
    getUser(request)
        .onSuccess((user: User) => {
            parkingService.all(user)
                .onSuccess((parkings: Array<Parking>) => {
                    return response.json(parkings);
                })
                .onError((err: any) => {
                    serverError(response, 'error on all parkings: ' + err, user);
                });
        })
        .onError((err: any) => {
            serverError(response, 'error on all parkings ' + err);
        });
});

// get all users from the database
app.get('/elleho/' + version + '/user', (request, response) => {
    getUser(request)
        .onSuccess((user: User) => {
            logger.info('getting all users', user);
            userService.all(user)
                .onSuccess((users: Array<User>) => {
                    return response.json(users);
                })
                .onError((err: any) => {
                    serverError(response, 'error on getting all users: ' + err, user);
                });
        })
        .onError((err: any) => {
            serverError(response, 'error on getting all user ' + err);
        });
});

// get a user by it's username
app.get('/elleho/' + version + '/user/find/username/:username', (request, response) => {
    getUser(request)
        .onSuccess((user: User) => {
            logger.info('getting user by username "' + request.params.username + '"', user);
            return response.json(user);
        })
        .onError((err: any) => {
            serverError(response, 'error on getting user by username ' + err);
        });
});

// get a user by it's email
app.get('/elleho/' + version + '/user/find/email/:email', (request, response) => {
    getUser(request)
        .onSuccess((user: User) => {
            userService.getUserByEmail(request.params.email)
                .onSuccess((user: User) => {
                    return response.json(user);
                })
                .onError((err: any) => {
                    serverError(response, 'error on getting user by email ' + err, user);
                });
        })
        .onError((err: any) => {
            serverError(response, 'error on getting user by email ' + err);
        });
});

// insert a new user to the database
app.post('/elleho/' + version + '/user', (request, response) => {
    getUser(request)
        .onSuccess((user: User) => {
            logger.info('add a new user', user);
            userService.save(request.body.user, user)
                .onSuccess((user: User) => {
                    return response.json(user);
                })
                .onError((err: any) => {
                    serverError(response, 'error on saving new user: ' + err, user);
                });
        })
        .onError((err: any) => {
            serverError(response, 'error on saving new user ' + err);
        });
});

// update an existing user
app.put('/elleho/' + version + '/user', (request, response) => {
    getUser(request)
        .onSuccess((user: User) => {
            logger.info('update an existing user', user);
            userService.update(
                request.body.user.username,
                request.body.user.firstname,
                request.body.user.lastname,
                request.body.user.password,
                request.body.user.email,
                request.body.user.paypal,
                request.body.user.cartype,
                request.body.user.carbrand,
                request.body.user.carcategory,
                request.body.user.city,
                request.body.user.zip,
                request.body.user.street,
                user)
                .onSuccess((user: User) => {
                    return response.json(user);
                })
                .onError((err: any) => {
                    serverError(response, 'error on updating user: ' + err, user);
                });
        })
        .onError((err: any) => {
            serverError(response, 'error on updating user ' + err);
        });
});

// get all trackings from the database
app.get('/elleho/' + version + '/tracking', (request, response) => {
    getUser(request)
        .onSuccess((user: User) => {
            logger.info('getting all trackings', user);
            trackingService.all(user)
                .onSuccess((trackings: Array<Tracking>) => {
                    return response.json(trackings);
                })
                .onError((err: any) => {
                    serverError(response, 'error on getting all trackings: ' + err, user);
                });
        })
        .onError((err: any) => {
            serverError(response, 'error on getting all trackings: ' + err);
        });
});

// insert a new tracking to the database
app.post('/elleho/' + version + '/tracking', (request, response) => {
    getUser(request)
        .onSuccess((user: User) => {
            logger.info('add a new tracking', user);
            trackingService.track(request.body.tracking.position, request.body.tracking.mode, user)
                .onSuccess((tracking: Tracking) => {
                    return response.json({
                        trackingId: tracking._id,
                        user: tracking.user.username,
                        date: tracking.date,
                        position: {
                            latitude: tracking.location[0],
                            longitude: tracking.location[1]
                        },
                        mode: tracking.mode
                    });
                })
                .onError((err: any) => {
                    serverError(response, 'error on tracking a position: ' + err, user);
                });
        })
        .onError((err: any) => {
            serverError(response, 'error on tracking a position ' + err);
        });
});

// reset the test-data for user: clear the database-entries and insert new data
app.post('/elleho/' + version + '/resettestdata', (request, response) => {
    testDataService.resetAll()
        .onSuccess(() => {
            response.type('text/plain');
            response.send('alle Testdaten erneuert');
        })
        .onError((err: any) => {
            serverError(response, 'error on resetting testdata ' + err);
        });
});

// run the server on a port specified in nodejs.port
let port: string = '9000';
let portFile = __dirname + '/../../conf/nodejs.port';
var fs = require('fs');
if (fs.existsSync(portFile) === true) {
    port = fs.readFileSync(portFile, 'utf-8');
}
app.listen(port, function () {
    console.log('Node.js (express) server listening on port %d in %s mode', port, app.settings.env);
});

function getUser(request: Request): Result<User> {
    let result: Result<User> = new ResultBasic<User>();
    let username = request.get('username');
    let password = request.get('password');
    userService.getUserByUserame(username)
        .onSuccess((user: User) => {
            result.success(user);
        })
        .onError((err: any) => {
            result.error(err);
        });
    return result;
}

function restResourceFromRequest(request: Request): string {
    let split: Array<string> = request.originalUrl.split('/');
    if (split.length >= 2) {
        return request.originalUrl.substr(split[0].length + split[1].length + split[2].length + 2);
    } else {
        return 'noSecurity';
    }
}
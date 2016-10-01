import std = require('typescript-stl');
import 'reflect-metadata';
import {IntegrationtestConfig} from "../../../data/integrationtest.config";
import {IntegrationtestData} from "../../../data/integrationtest.data";

var api = require('nodeunit-httpclient').create({
        port: IntegrationtestConfig.port(),
        path: IntegrationtestConfig.pathPrefix() + '/parking/near',
        headers: {'content-type': 'application/json; charset=utf-8'}
    }
);

exports.testNearestParking = function (test) {

    IntegrationtestData.resetParkingData(() => {
        IntegrationtestData.insertParking(() => {
            test.expect(13);
            api.put(test, '', {
                headers: {
                    username: 'elle',
                    password: 'ho'
                },
                body: {
                    latitude: '48.212559',
                    longitude: '16.348461'
                }
            }, {
                status: 200
            }, function (res) {
                test.ok(res.body.includes('"address":"Laudongasse 43, 1080 Wien, Austria"'));
                test.ok(res.body.includes('"seconds":163'));
                test.ok(res.body.includes('"meters":713'));
                test.ok(res.body.includes('"address":"Lederergasse 31-33, 1080 Wien, Austria"'));
                test.ok(res.body.includes('"seconds":177'));
                test.ok(res.body.includes('"meters":729'));
                test.ok(res.body.includes('"address":"Alser Str. 4, 1080 Wien, Austria'));
                test.ok(res.body.includes('"seconds":326'));
                test.ok(res.body.includes('"meters":1415'));
                test.ok(res.body.indexOf('Laudongasse') < res.body.indexOf('Lederergasse'));
                test.ok(res.body.indexOf('Lederergasse') < res.body.indexOf('Alser'));
                test.done();
            });
        });
    });
};
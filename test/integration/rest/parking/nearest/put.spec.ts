import std = require('typescript-stl');
import 'reflect-metadata';
import {IntegrationtestConfig} from "../../../conf/integrationtest.config";
import {IntegrationtestData} from "../../../conf/integrationtest.data";

var api = require('nodeunit-httpclient').create({
        port: IntegrationtestConfig.port(),
        path: IntegrationtestConfig.pathPrefix() + '/parking/nearest',
        headers: {'content-type': 'application/json; charset=utf-8'}
    }
);

exports.testNearestParking = function (test) {

    IntegrationtestData.resetParkingData(() => {
        IntegrationtestData.insertParking(() => {
            test.expect(9);
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
                test.ok(res.body.includes('48.213125'));
                test.ok(res.body.includes('16.34582'));
                test.ok(res.body.includes('OFFER'));
                test.ok(res.body.includes('user2'));
                test.done();
            });
        });
    });
};
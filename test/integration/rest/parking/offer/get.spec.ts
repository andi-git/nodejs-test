import std = require('typescript-stl');
import 'reflect-metadata';
import {IntegrationtestConfig} from "../../../data/integrationtest.config";
import {IntegrationtestData} from "../../../data/integrationtest.data";

var api = require('nodeunit-httpclient').create({
        port: IntegrationtestConfig.port(),
        host: IntegrationtestConfig.host(),
        path: IntegrationtestConfig.pathPrefix() + '/parking/offer',
        headers: {'content-type': 'application/json; charset=utf-8'}
    }
);

exports.testGetCurrent = function (test) {

    IntegrationtestData.resetParkingData(() => {
        IntegrationtestData.insertParking(() => {
            test.expect(5);
            api.get(test, '', {
                headers: {
                    username: 'elle',
                    password: 'ho'
                }
            }, {
                status: 200
            }, function (res) {
                test.ok(res.body.includes('48.224092'));
                test.ok(res.body.includes('16.396591'));
                test.ok(res.body.includes('OFFER'));
                test.done();
            });
        });
    });
};
import std = require('typescript-stl');
import 'reflect-metadata';
import {IntegrationtestConfig} from "../../../conf/integrationtest.config";
import {IntegrationtestData} from "../../../conf/integrationtest.data";

var api = require('nodeunit-httpclient').create({
        port: IntegrationtestConfig.port(),
        path: IntegrationtestConfig.pathPrefix() + '/parking/offer',
        headers: {'content-type': 'application/json; charset=utf-8'}
    }
);

exports.testOfferParking = function (test) {

    IntegrationtestData.resetParkingData(() => {
        test.expect(5);
        api.post(test, '', {
            headers: {
                username: 'elle',
                password: 'ho'
            },
            body: {
                latitude: '48.224092',
                longitude: '16.396591'
            }
        }, {
            status: 200
        }, function (res) {
            test.ok(res.body.toString().includes('48.224092'));
            test.ok(res.body.toString().includes('16.396591'));
            test.ok(res.body.toString().includes('OFFER'));
            test.done();
        });

    });
};
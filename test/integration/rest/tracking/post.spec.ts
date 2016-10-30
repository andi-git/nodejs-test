import std = require('typescript-stl');
import 'reflect-metadata';
import {IntegrationtestConfig} from "../../data/integrationtest.config";
import {IntegrationtestData} from "../../data/integrationtest.data";

var api = require('nodeunit-httpclient').create({
        port: IntegrationtestConfig.port(),
        host: IntegrationtestConfig.host(),
        path: IntegrationtestConfig.pathPrefix() + '/tracking',
        headers: {'content-type': 'application/json; charset=utf-8'}
    }
);

exports.testPostTrack = function (test) {

    IntegrationtestData.resetTestData(() => {
        test.expect(7);
        api.post(test, '', {
            headers: {
                username: 'elle',
                password: 'ho'
            },
            body: {
                position: {
                    latitude: '48.224092',
                    longitude: '16.396591'
                }
            }
        }, {
            status: 200
        }, function (res) {
            test.ok(res.body.includes('date'));
            test.ok(res.body.includes('trackingId'));
            test.ok(res.body.includes('elle'));
            test.ok(res.body.includes('48.224092'));
            test.ok(res.body.includes('16.396591'));
            test.done();
        });

    });
};
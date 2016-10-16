import std = require('typescript-stl');
import 'reflect-metadata';
import {IntegrationtestConfig} from "../../data/integrationtest.config";
import {IntegrationtestData} from "../../data/integrationtest.data";

var api = require('nodeunit-httpclient').create({
        port: IntegrationtestConfig.port(),
        host: IntegrationtestConfig.host(),
        path: IntegrationtestConfig.pathPrefix() + '/parking',
        headers: {'content-type': 'application/json; charset=utf-8'}
    }
);

exports.testGetParkings = function (test) {

    IntegrationtestData.resetTestData(() => {
        IntegrationtestData.insertParking(() => {
            test.expect(3);
            api.get(test, '', {
                headers: {
                    username: 'elle',
                    password: 'ho'
                }
            }, {
                status: 200
            }, function (res) {
                test.equals((res.body.match(/parkingId/g) || []).length, 6);
                test.done();
            });
        });
    });
};
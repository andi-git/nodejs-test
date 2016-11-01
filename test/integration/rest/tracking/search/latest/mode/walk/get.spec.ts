import std = require('typescript-stl');
import 'reflect-metadata';
import {IntegrationtestConfig} from "../../../../../../data/integrationtest.config";
import {IntegrationtestData} from "../../../../../../data/integrationtest.data";

var api = require('nodeunit-httpclient').create({
        port: IntegrationtestConfig.port(),
        host: IntegrationtestConfig.host(),
        path: IntegrationtestConfig.pathPrefix() + '/tracking/search/latest/mode/walk',
        headers: {'content-type': 'application/json; charset=utf-8'}
    }
);

exports.testGetTracks = function (test) {

    IntegrationtestData.resetTestData(() => {
        test.expect(4);
        api.get(test, '', {
            headers: {
                username: 'elle',
                password: 'ho'
            }
        }, {
            status: 200
        }, function (res) {
            test.ok(res.body.includes('48.213676'));
            test.ok(res.body.includes('16.348491'));
            test.done();
        });
    });
};
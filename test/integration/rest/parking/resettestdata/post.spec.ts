import std = require('typescript-stl');
import 'reflect-metadata';
import {IntegrationtestConfig} from "../../../data/integrationtest.config";

var api = require('nodeunit-httpclient').create({
        port: IntegrationtestConfig.port(),
        path: IntegrationtestConfig.pathPrefix() + '/parking/resettestdata',
        headers: {'content-type': 'text/plain; charset=utf-8'}
    }
);

exports.testResettestdataPost = function (test) {
    test.expect(3);
    api.post(test, '', {
        headers: {
            username: 'elle',
            password: 'ho'
        }
    }, {
        status: 200
    }, function (res) {
        test.equals(res.body, 'Testdaten erneuert');
        test.done();
    });
};
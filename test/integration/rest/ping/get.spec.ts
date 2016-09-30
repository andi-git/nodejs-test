import std = require('typescript-stl');
import 'reflect-metadata';
import {IntegrationtestConfig} from "../../conf/integrationtest.config";

var http = require('http');

var api = require('nodeunit-httpclient').create({
        port: IntegrationtestConfig.port(),
        path: IntegrationtestConfig.pathPrefix() + '/ping',
        headers: {'content-type': 'text/plain; charset=utf-8'}
    }
);

exports.testPingGet = function (test) {
    test.expect(3);
    api.get(test, '', { }, {
        status: 200
    }, function (res) {
        test.equals(res.body, 'OK');
        test.done();
    });
};
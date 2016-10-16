import std = require('typescript-stl');
import 'reflect-metadata';
import {IntegrationtestConfig} from "../../data/integrationtest.config";
import {IntegrationtestData} from "../../data/integrationtest.data";

var api = require('nodeunit-httpclient').create({
        port: IntegrationtestConfig.port(),
        host: IntegrationtestConfig.host(),
        path: IntegrationtestConfig.pathPrefix() + '/user',
        headers: {'content-type': 'application/json; charset=utf-8'}
    }
);

exports.testUpdateUser = function (test) {
    IntegrationtestData.resetTestData(() => {
        test.expect(6);
        api.put(test, '', {
            headers: {
                username: 'elle',
                password: 'ho'
            },
            body: {
                user: {
                    username: 'elle',
                    carbrand: 'Zafira',
                    street: 'HotStreet 1'
                }
            }
        }, {
            status: 200
        }, function (res) {
            test.ok(res.body.includes('elle'));
            test.ok(res.body.includes('_id'));
            test.ok(res.body.includes('Zafira'));
            test.ok(res.body.includes('HotStreet 1'));
            test.done();
        });
    });
};
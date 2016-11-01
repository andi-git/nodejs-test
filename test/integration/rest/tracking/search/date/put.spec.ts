import std = require('typescript-stl');
import 'reflect-metadata';
import {IntegrationtestConfig} from "../../../../data/integrationtest.config";
import {IntegrationtestData} from "../../../../data/integrationtest.data";

var api = require('nodeunit-httpclient').create({
        port: IntegrationtestConfig.port(),
        host: IntegrationtestConfig.host(),
        path: IntegrationtestConfig.pathPrefix() + '/tracking/search/date',
        headers: {'content-type': 'application/json; charset=utf-8'}
    }
);

exports.testPutTrackingSearchByDate_Drive = function (test) {

    IntegrationtestData.resetTestData(() => {
        test.expect(3);
        let date: Date = new Date();
        date.setSeconds(date.getSeconds() - 10);
        api.put(test, '', {
            headers: {
                username: 'elle',
                password: 'ho'
            },
            body: {
                date: date
            }
        }, {
            status: 200
        }, function (res) {
            test.ok(res.body.includes('drive'));
            test.done();
        });
    });
};

exports.testPutTrackingSearchByDate_Walk = function (test) {

    IntegrationtestData.resetTestData(() => {
        test.expect(3);
        let date: Date = new Date();
        date.setSeconds(date.getSeconds() - 30);
        api.put(test, '', {
            headers: {
                username: 'elle',
                password: 'ho'
            },
            body: {
                date: date
            }
        }, {
            status: 200
        }, function (res) {
            test.ok(res.body.includes('walk'));
            test.done();
        });
    });
};

exports.testPutTrackingSearchByDate_Unknown = function (test) {

    IntegrationtestData.resetTestData(() => {
        test.expect(3);
        let date: Date = new Date();
        date.setSeconds(date.getSeconds() - 60);
        api.put(test, '', {
            headers: {
                username: 'elle',
                password: 'ho'
            },
            body: {
                date: date
            }
        }, {
            status: 500
        }, function (res) {
            test.ok(res.body.includes('error'));
            test.done();
        });
    });
};

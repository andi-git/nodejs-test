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

exports.testSaveUser = function (test) {
    IntegrationtestData.resetTestData(() => {
        test.expect(4);
        api.post(test, '', {
            headers: {
                username: 'elle',
                password: 'ho'
            },
            body: {
                user: {
                    username: 'NewUser',
                    firstname: 'New',
                    lastname: 'User',
                    password: 'NewPassword',
                    email: 'new@user.com',
                    paypal: '456123789',
                    cartype: 'Seat',
                    carbrand: 'Alhambra',
                    carcategory: 'large',
                    city: 'Wien',
                    zip: '1002',
                    street: 'NewStreet 3'
                }
            }
        }, {
            status: 200
        }, function (res) {
            test.ok(res.body.includes('NewUser'));
            test.ok(res.body.includes('_id'));
            test.done();
        });
    });
};
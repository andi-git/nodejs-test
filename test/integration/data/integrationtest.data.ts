import {IntegrationtestConfig} from "./integrationtest.config";

export class IntegrationtestData {

    public static resetTestData(afterResetTestData: Function) {
        require('unirest').post(IntegrationtestConfig.pathPrefixWithHostAndUrl() + '/resettestdata')
            .headers({})
            .send({})
            .end(function (response) {
                afterResetTestData.call(this);
            });
    }

    public static insertParking(afterInsertParking: Function) {
        require('unirest').post(IntegrationtestConfig.pathPrefixWithHostAndUrl() + '/parking/offer')
            .headers({
                username: 'elle',
                password: 'ho'
            })
            .send({
                latitude: '48.224092',
                longitude: '16.396591'
            })
            .end(function (response) {
                afterInsertParking.call(this);
            });
    }
}
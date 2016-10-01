import {IntegrationtestConfig} from "./integrationtest.config";

export class IntegrationtestData {

    public static resetParkingData(afterResetParkingData: Function) {
        require('unirest').post(IntegrationtestConfig.pathPrefix() + '/parking/resettestdata')
            .headers({})
            .send({})
            .end(function (response) {
                afterResetParkingData.call(this);
            });
    }

    public static insertParking(afterInsertParking: Function) {
        require('unirest').post(IntegrationtestConfig.pathPrefix() + '/parking/offer')
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
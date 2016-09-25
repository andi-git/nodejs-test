import std = require('typescript-stl');
import 'reflect-metadata';
import {Kernel} from 'inversify';
import {LoggerBasic, Logger} from '../../src/util/logger';
import TYPES from '../../src/types';
import {User} from "../../src/model/user";

var kernel = new Kernel();
kernel.bind<Logger>(TYPES.Logger).to(LoggerBasic).inSingletonScope();
let logger: Logger = kernel.get<Logger>(TYPES.Logger);

let user: User = new User('testuser');

var testCase = require('nodeunit').testCase;

let assertMessage: string = '';
let finish: boolean = false;

var handler = function (message: string) {
    assertMessage = message;
    finish = true;
};

function waitloop(njtest: any, callback: Function) {
    setTimeout(function () {
        if (finish === false) {
            waitloop(njtest, callback);
        } else {
            callback.call(this, njtest, assertMessage);
        }
    }, 100);
}

exports.groupOne = testCase({

    setUp: function (njcallback) {
        logger.getLogEvent().attach(handler);
        finish = false;
        njcallback();
    },

    tearDown: function (njcallback) {
        logger.getLogEvent().detach(handler);
        njcallback();
    },

    testLogInfo: function (njtest) {
        logger.info('hello', user);
        waitloop(njtest, function (njtest, message) {
            console.log('message: ' + message);
            njtest.expect(2);
            njtest.equal(message.length, 48);
            njtest.ok(message.includes('INFO  | testuser: hello'));
            njtest.done();
        });
    },

    testLogWarn: function (njtest) {
        logger.warn('hello', user);
        waitloop(njtest, function (njtest, message) {
            njtest.expect(2);
            njtest.equal(message.length, 48);
            njtest.ok(message.includes('WARN  | testuser: hello'));
            njtest.done();
        });
    },

    testLogError: function (njtest) {
        logger.error('hello', user);
        waitloop(njtest, function (njtest, message) {
            njtest.expect(2);
            njtest.equal(message.length, 48);
            njtest.ok(message.includes('ERROR | testuser: hello'));
            njtest.done();
        });
    }
});
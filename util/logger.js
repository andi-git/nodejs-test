"use strict";
var index_1 = require("ts-events/dist/lib/index");
var Logger = (function () {
    function Logger() {
        this.event = new index_1.AsyncEvent();
        this.event.attach(function (message) {
            console.log(message);
        });
    }
    Logger.prototype.info = function (message, user) {
        this.event.post(Logger.createMessage(LogLevel.INFO, message, user));
    };
    Logger.prototype.warn = function (message, user) {
        this.event.post(Logger.createMessage(LogLevel.WARN, message, user));
    };
    Logger.prototype.error = function (message, user) {
        this.event.post(Logger.createMessage(LogLevel.ERROR, message, user));
    };
    Logger.createMessage = function (logLevel, message, user) {
        var username = user != null ? user.name : "undefined";
        return new Date().toISOString() + ' ' + LogLevel[logLevel] + '  | ' + username + ': ' + message;
    };
    return Logger;
}());
exports.Logger = Logger;
(function (LogLevel) {
    LogLevel[LogLevel["INFO"] = 0] = "INFO";
    LogLevel[LogLevel["WARN"] = 1] = "WARN";
    LogLevel[LogLevel["ERROR"] = 2] = "ERROR";
})(exports.LogLevel || (exports.LogLevel = {}));
var LogLevel = exports.LogLevel;

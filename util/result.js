"use strict";
var index_1 = require("ts-events/dist/lib/index");
var ResultBasic = (function () {
    function ResultBasic(result, success) {
        this._value = null;
        this._success = false;
        this._successEvent = new index_1.SyncEvent();
        this._errorEvent = new index_1.SyncEvent();
        if (result != null) {
            this._value = result;
        }
        if (success != null) {
            this._success = success;
        }
    }
    ResultBasic.prototype.value = function () {
        return this._value;
    };
    ResultBasic.prototype.success = function (result) {
        this._value = result;
        this._successEvent.post(this._value);
    };
    ResultBasic.prototype.error = function (result) {
        this._value = result;
        this._errorEvent.post(this._value);
    };
    ResultBasic.prototype.isSuccess = function () {
        return this._success === true;
    };
    ResultBasic.prototype.isError = function () {
        return this._success === false;
    };
    ResultBasic.prototype.onSuccess = function (callback) {
        this._successEvent.attach(callback);
        return this;
    };
    ResultBasic.prototype.onError = function (callback) {
        this._errorEvent.attach(callback);
        return this;
    };
    ResultBasic.prototype.toString = function () {
        return JSON.stringify(this);
    };
    return ResultBasic;
}());
exports.ResultBasic = ResultBasic;
//# sourceMappingURL=result.js.map
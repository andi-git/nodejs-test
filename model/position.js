"use strict";
var GeoLocation = (function () {
    function GeoLocation(latitude, longitude) {
        this.latitude = latitude;
        this.longitude = longitude;
    }
    GeoLocation.prototype.toString = function () {
        return JSON.stringify(this);
    };
    return GeoLocation;
}());
exports.GeoLocation = GeoLocation;
//# sourceMappingURL=position.js.map
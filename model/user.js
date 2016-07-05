"use strict";
var User = (function () {
    function User(name) {
        this.name = name;
    }
    User.prototype.toString = function () {
        return JSON.stringify(this);
    };
    return User;
}());
exports.User = User;
//# sourceMappingURL=user.js.map
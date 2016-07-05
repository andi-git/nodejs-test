"use strict";
var IdGenerator = (function () {
    function IdGenerator() {
    }
    IdGenerator.s4 = function () {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    };
    IdGenerator.guid = function () {
        var id = "";
        var first = true;
        for (var i = 0; i < 8; i++) {
            if (first === false) {
                id += '-';
            }
            id += IdGenerator.s4();
            first = false;
        }
        return id;
    };
    return IdGenerator;
}());
exports.IdGenerator = IdGenerator;
//# sourceMappingURL=idGenerator.js.map
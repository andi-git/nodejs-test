import {IdGenerator} from '../../src/util/idGenerator';
import std = require('typescript-stl');

'use strict';

exports.testLengthOfGeneratedId = function (test) {
    test.expect(1);
    test.equal(IdGenerator.guid().length, 39);
    test.done();
};

exports.testUniquenessOfGeneratedIds = function (test) {
    test.expect(1);
    let ids: std.HashSet<string> = new std.HashSet<string>();
    var numberOfIds = 10000;
    for (let i = 0; i < numberOfIds; i++) {
        ids.push(IdGenerator.guid());
    }
    test.equal(ids.size(), numberOfIds);
    test.done();
};

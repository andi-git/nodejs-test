import {IdGenerator, IdGenerator2, IdGenerator2Basic} from '../../src/util/idGenerator';
import std = require('typescript-stl');
import "reflect-metadata";
import {Kernel} from "inversify";
'use strict';

let TYPES = {
    IdGenerator2: Symbol("IdGenerator2")
};
var kernel = new Kernel();
kernel.bind<IdGenerator2>(TYPES.IdGenerator2).to(IdGenerator2Basic);
let idGenerator: IdGenerator2 = kernel.get<IdGenerator2>(TYPES.IdGenerator2);

exports.testLengthOfGeneratedId = function (test) {
    test.expect(1);
    test.equal(idGenerator.guid().length, 39);
    test.done();
};

exports.testUniquenessOfGeneratedIds = function (test) {
    test.expect(1);
    let ids: std.HashSet<string> = new std.HashSet<string>();
    var numberOfIds = 10000;
    for (let i = 0; i < numberOfIds; i++) {
        ids.push(idGenerator.guid());
    }
    test.equal(ids.size(), numberOfIds);
    test.done();
};

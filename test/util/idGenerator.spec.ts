import {IdGenerator, IdGeneratorBasic} from '../../src/util/idGenerator';
import std = require('typescript-stl');
import "reflect-metadata";
import {Kernel} from "inversify";
'use strict';

let TYPES = {
    IdGenerator: Symbol("IdGenerator")
};
var kernel = new Kernel();
kernel.bind<IdGenerator>(TYPES.IdGenerator).to(IdGeneratorBasic);
let idGenerator: IdGenerator = kernel.get<IdGenerator>(TYPES.IdGenerator);

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

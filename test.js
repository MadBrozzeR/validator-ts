"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
exports.__esModule = true;
var index_1 = require("./index");
var values = {
    stringField: 'string',
    numberField: 41,
    anotherNumber: 99,
    yetAnotherNumber: 50
};
var CMD = '\x1b';
var STYLE = {
    CLEAR: CMD + '[0m',
    YELLOW: CMD + '[33m',
    RED: CMD + '[31m'
};
var validator = new index_1["default"]({
    stringField: [
        index_1["default"].RULES.Required('Required field'),
        index_1["default"].RULES.Match(/^[a-zA-Z]+$/, 'Should use literals'),
        index_1["default"].RULES.NotLonger(6, 'Max of 6 symbols is allowed'),
        index_1["default"].RULES.NotShorter(3, 'Min of 3 symbols is allowed')
    ],
    numberField: [
        index_1["default"].RULES.Required('Required field'),
        index_1["default"].RULES.Between(10, 100, 'Should be between 10 and 100')
    ],
    anotherNumber: [
        index_1["default"].RULES.MoreThen(10, 'Should be more then 10'),
        index_1["default"].RULES.LessThen(100, 'Should be less then 100')
    ],
    yetAnotherNumber: [
        index_1["default"].RULES.NotLessThen(10, 'Should not be less then 10'),
        index_1["default"].RULES.NotMoreThen(100, 'Should not be more then 100')
    ]
});
function stringify(data) {
    return JSON.stringify(data, null, 2);
}
var test = {
    'Should be OK': function (resolve, fail) {
        var validation = validator.validate(values);
        if (validation.valid) {
            resolve();
        }
        else {
            fail(stringify(validation));
        }
    },
    'Should fail RE and NotLonger string checks': function (resolve, fail) {
        var validation = validator.validate(__assign(__assign({}, values), { stringField: 'alltherest5' }));
        if (!validation.valid &&
            validation.errors.stringField.length === 2,
            validation.errors.stringField[0] === 'Should use literals' &&
                validation.errors.stringField[1] === 'Max of 6 symbols is allowed') {
            resolve();
        }
        else {
            fail(stringify(validation));
        }
    },
    'Should fail NotShorter string check': function (resolve, fail) {
        var validation = validator.validate(__assign(__assign({}, values), { stringField: 'st' }));
        if (!validation.valid &&
            validation.errors.stringField.length === 1 &&
            validation.errors.stringField[0] === 'Min of 3 symbols is allowed') {
            resolve();
        }
        else {
            fail(stringify(validation));
        }
    },
    'Should fail Required checks': function (resolve, fail) {
        var validation = validator.validate({
            stringField: '',
            numberField: null,
            anotherNumber: null,
            yetAnotherNumber: null
        });
        if (!validation.valid &&
            validation.errors.stringField[0] === 'Required field' &&
            validation.errors.numberField[0] === 'Required field') {
            resolve();
        }
        else {
            fail(stringify(validation));
        }
    },
    'Should succeed on right edge check': function (resolve, fail) {
        var validation = validator.validate(__assign(__assign({}, values), { numberField: 100, anotherNumber: 99, yetAnotherNumber: 100 }));
        if (validation.valid) {
            resolve();
        }
        else {
            fail(stringify(validation));
        }
    },
    'Should succeed on left edge check': function (resolve, fail) {
        var validation = validator.validate(__assign(__assign({}, values), { numberField: 10, anotherNumber: 11, yetAnotherNumber: 10 }));
        if (validation.valid) {
            resolve();
        }
        else {
            fail(stringify(validation));
        }
    },
    'Should fail on right edge check': function (resolve, fail) {
        var validation = validator.validate(__assign(__assign({}, values), { numberField: 101, anotherNumber: 100, yetAnotherNumber: 101 }));
        if (!validation.valid &&
            validation.errors.numberField[0] === 'Should be between 10 and 100' &&
            validation.errors.anotherNumber[0] === 'Should be less then 100' &&
            validation.errors.yetAnotherNumber[0] === 'Should not be more then 100') {
            resolve();
        }
        else {
            fail(stringify(validation));
        }
    },
    'Should fail on left edge check': function (resolve, fail) {
        var validation = validator.validate(__assign(__assign({}, values), { numberField: 9, anotherNumber: 10, yetAnotherNumber: 9 }));
        if (!validation.valid &&
            validation.errors.numberField[0] === 'Should be between 10 and 100' &&
            validation.errors.anotherNumber[0] === 'Should be more then 10' &&
            validation.errors.yetAnotherNumber[0] === 'Should not be less then 10') {
            resolve();
        }
        else {
            fail(stringify(validation));
        }
    }
};
var cases = Object.keys(test);
var counter = 0;
var failed = false;
function resolve() {
    process.stdout.write(STYLE.YELLOW + ' OK\n' + STYLE.CLEAR);
    nextTest();
}
function fail(reason) {
    process.stdout.write(STYLE.RED + ' FAIL\n' + reason + STYLE.CLEAR + '\n');
    failed = true;
    nextTest();
}
function nextTest() {
    var currentCase = cases[counter++];
    if (currentCase) {
        process.stdout.write(currentCase);
        test[currentCase](resolve, fail);
    }
    else if (failed) {
        process.exit(1);
    }
}
nextTest();

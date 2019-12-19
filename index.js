"use strict";
exports.__esModule = true;
var RULES = {
    Required: function (message) {
        return function (value, field) {
            if (value == undefined || value === '' || value === null) {
                this.error(field, message);
            }
        };
    },
    LessThen: function (limit, message) {
        return function (value, field) {
            if (value >= limit) {
                this.error(field, message);
            }
        };
    },
    NotLessThen: function (limit, message) {
        return function (value, field) {
            if (value < limit) {
                this.error(field, message);
            }
        };
    },
    MoreThen: function (limit, message) {
        return function (value, field) {
            if (value <= limit) {
                this.error(field, message);
            }
        };
    },
    NotMoreThen: function (limit, message) {
        return function (value, field) {
            if (value > limit) {
                this.error(field, message);
            }
        };
    },
    Between: function (min, max, message) {
        return function (value, field) {
            if (value < min || value > max) {
                this.error(field, message);
            }
        };
    },
    Match: function (regExp, message) {
        return function (value, field) {
            if (!regExp.test(value)) {
                this.error(field, message);
            }
        };
    },
    NotLonger: function (limit, message) {
        return function (value, field) {
            if (value.length > limit) {
                this.error(field, message);
            }
        };
    },
    NotShorter: function (limit, message) {
        return function (value, field) {
            if (value.length < limit) {
                this.error(field, message);
            }
        };
    }
};
var Validation = /** @class */ (function () {
    function Validation(values, schema) {
        this.valid = true;
        this.errors = {};
        this.values = values;
        this.schema = schema;
    }
    Validation.prototype.error = function (field, message) {
        this.valid = false;
        if (this.errors[field]) {
            this.errors[field].push(message);
        }
        else {
            this.errors[field] = [message];
        }
    };
    Validation.prototype.useRules = function (value, field, rules) {
        for (var index = 0; index < rules.length; ++index) {
            rules[index].call(this, value, field);
        }
    };
    Validation.prototype.validateField = function (field) {
        var rule = this.schema[field];
        if (isRuleArray(rule)) {
            for (var index = 0; index < rule.length; ++index) {
                if (isRule(rule[index])) {
                    rule[index].call(this, this.values[field], field);
                }
            }
        }
        else if (isRule(rule)) {
            rule.call(this, this.values[field], field);
        }
        return this;
    };
    Validation.prototype.valueOf = function () {
        return {
            valid: this.valid,
            errors: this.errors
        };
    };
    return Validation;
}());
exports.Validation = Validation;
function isRuleArray(rule) {
    return rule instanceof Array;
}
function isRule(rule) {
    return rule instanceof Function;
}
function checkIfErrorsAreEqual(left, right) {
    var result = true;
    if (left && right) {
        if (left.length === right.length) {
            for (var index = 0; index < left.length; ++index) {
                if (left[index] !== right[index]) {
                    result = false;
                    break;
                }
            }
        }
        else {
            result = false;
        }
    }
    else if (left === right) {
        result = true;
    }
    return result;
}
function updateResult(previous, current, field) {
    var result = previous;
    if (previous) {
        if (checkIfErrorsAreEqual(previous.errors[field], current.errors[field])) {
            result = previous;
        }
        else {
            result = {
                errors: {},
                valid: true
            };
            for (var key in previous.errors) {
                if (key !== field || current.errors[field]) {
                    result.errors[key] = current.errors[key];
                    result.valid = false;
                }
            }
        }
    }
    return result;
}
var Validator = /** @class */ (function () {
    function Validator(schema) {
        this.schema = schema;
    }
    Validator.prototype.validate = function (values, params) {
        if (params === void 0) { params = {}; }
        var validation = new Validation(values, this.schema);
        if (params.field) {
            validation.validateField(params.field);
            if (params.compare) {
                return updateResult(params.compare, validation, params.field);
            }
        }
        else {
            for (var field in this.schema) {
                validation.validateField(field);
            }
        }
        return validation.valueOf();
    };
    Validator.RULES = RULES;
    return Validator;
}());
exports["default"] = Validator;

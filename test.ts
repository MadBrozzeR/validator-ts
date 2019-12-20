import { test } from 'mbr-test';

import Validator from './index';

const values = {
  stringField: 'string',
  numberField: 41,
  anotherNumber: 99,
  yetAnotherNumber: 50
}

type Values = typeof values;

type Params = {
  check?: number;
};

const CMD = '\x1b';

const STYLE = {
  CLEAR: CMD + '[0m',
  GREEN: CMD + '[32m',
  RED: CMD + '[31m'
};

const CustomRule = Validator.createRule<Values, number, Params>(function (value, field) {
  if (this.params && this.params.check && value !== this.params.check) {
    this.error(field, 'Value must be exactly ' + this.params.check);
  }
});

const validator = new Validator<Values, Params>({
  stringField: [
    Validator.RULES.Required('Required field'),
    Validator.RULES.Match(/^[a-zA-Z]+$/, 'Should use literals'),
    Validator.RULES.NotLonger(6, 'Max of 6 symbols is allowed'),
    Validator.RULES.NotShorter(3, 'Min of 3 symbols is allowed')
  ],
  numberField: [
    Validator.RULES.Required('Required field'),
    Validator.RULES.Between(10, 100, 'Should be between 10 and 100')
  ],
  anotherNumber: [
    Validator.RULES.MoreThen(10, 'Should be more then 10'),
    Validator.RULES.LessThen(100, 'Should be less then 100')
  ],
  yetAnotherNumber: [
    Validator.RULES.NotLessThen(10, 'Should not be less then 10'),
    Validator.RULES.NotMoreThen(100, 'Should not be more then 100'),
    CustomRule
  ]
});

function stringify (data) {
  return JSON.stringify(data, null, 2);
}

test({
  'Should be OK': function (resolve, fail) {
    const validation = validator.validate(values, {params: {check: 50}});

    if (validation.valid) {
      resolve();
    } else {
      fail(stringify(validation));
    }
  },
  'Should fail RE and NotLonger string checks': function (resolve, fail) {
    const validation = validator.validate({
      ...values,
      stringField: 'alltherest5'
    });

    if (
      !validation.valid &&
      validation.errors.stringField.length === 2,
      validation.errors.stringField[0] === 'Should use literals' &&
      validation.errors.stringField[1] === 'Max of 6 symbols is allowed'
    ) {
      resolve()
    } else {
      fail(stringify(validation));
    }
  },
  'Should fail NotShorter string check': function (resolve, fail) {
    const validation = validator.validate({
      ...values,
      stringField: 'st'
    });

    if (
      !validation.valid &&
      validation.errors.stringField.length === 1 &&
      validation.errors.stringField[0] === 'Min of 3 symbols is allowed'
    ) {
      resolve();
    } else {
      fail(stringify(validation));
    }
  },
  'Should fail Required checks': function (resolve, fail) {
    const validation = validator.validate({
      stringField: '',
      numberField: null,
      anotherNumber: null,
      yetAnotherNumber: null
    });

    if (
      !validation.valid &&
      validation.errors.stringField[0] === 'Required field' &&
      validation.errors.numberField[0] === 'Required field'
    ) {
      resolve();
    } else {
      fail(stringify(validation));
    }
  },
  'Should succeed on right edge check': function (resolve, fail) {
    const validation = validator.validate({
      ...values,
      numberField: 100,
      anotherNumber: 99,
      yetAnotherNumber: 100
    });

    if (validation.valid) {
      resolve();
    } else {
      fail(stringify(validation));
    }
  },
  'Should succeed on left edge check': function (resolve, fail) {
    const validation = validator.validate({
      ...values,
      numberField: 10,
      anotherNumber: 11,
      yetAnotherNumber: 10
    });

    if (validation.valid) {
      resolve();
    } else {
      fail(stringify(validation));
    }
  },
  'Should fail on right edge check': function (resolve, fail) {
    const validation = validator.validate({
      ...values,
      numberField: 101,
      anotherNumber: 100,
      yetAnotherNumber: 101
    });

    if (
      !validation.valid &&
      validation.errors.numberField[0] === 'Should be between 10 and 100' &&
      validation.errors.anotherNumber[0] === 'Should be less then 100' &&
      validation.errors.yetAnotherNumber[0] === 'Should not be more then 100'
    ) {
      resolve();
    } else {
      fail(stringify(validation));
    }
  },
  'Should fail on left edge check': function (resolve, fail) {
    const validation = validator.validate({
      ...values,
      numberField: 9,
      anotherNumber: 10,
      yetAnotherNumber: 9
    });

    if (
      !validation.valid &&
      validation.errors.numberField[0] === 'Should be between 10 and 100' &&
      validation.errors.anotherNumber[0] === 'Should be more then 10' &&
      validation.errors.yetAnotherNumber[0] === 'Should not be less then 10'
    ) {
      resolve();
    } else {
      fail(stringify(validation));
    }
  },
  'Should fail custom check': function (resolve, fail) {
    const validation = validator.validate(values, { params: { check: 3 } });

    if (
      !validation.valid &&
      validation.errors.yetAnotherNumber[0] === 'Value must be exactly 3'
    ) {
      resolve();
    } else {
      fail(stringify(validation));
    }
  }
});

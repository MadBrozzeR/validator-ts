type Values = {
  [field: string]: any;
};

export type Rule<VS extends Values, F extends keyof VS, PS = void> = (
  this: Validation<VS, PS | void>,
  value: VS[F],
  field: F
) => void;

export type Schema<VS extends Values, PS = void> = {
  [F in keyof VS]?: Rule<VS, F, PS> | Rule<VS, F, PS>[];
}

type Errors = Record<string, string[]>;

export type ValidationBase = {
  valid: boolean;
  errors: Errors;
};

export type ValidationParams<VS extends Values, PS> = {
  field?: keyof VS;
  compare?: ValidationBase;
  params?: PS;
};

interface CreatedRule {
  <VS extends Values, PS, F extends keyof VS>(this: Validation<VS, PS>, value: VS[F], field: F): void;
}

const RULES = {
  Required: function (message: string): CreatedRule {
    return function (value, field) {
      if (value == undefined || value === '' || value === null) {
        this.error(String(field), message);
      }
    }
  },
  LessThen: function (limit: number, message: string): CreatedRule {
    return function (value, field) {
      if (value >= limit) {
        this.error(String(field), message);
      }
    }
  },
  NotLessThen: function (limit: number, message: string): CreatedRule {
    return function (value, field) {
      if (value < limit) {
        this.error(String(field), message);
      }
    }
  },
  MoreThen: function (limit: number, message: string): CreatedRule {
    return function (value, field) {
      if (value <= limit) {
        this.error(String(field), message);
      }
    }
  },
  NotMoreThen: function (limit: number, message: string): CreatedRule {
    return function (value, field) {
      if (value > limit) {
        this.error(String(field), message);
      }
    }
  },
  Between: function (min: number, max: number, message: string): CreatedRule {
    return function (value, field) {
      if (value < min || value > max) {
        this.error(String(field), message);
      }
    }
  },
  Match: function (regExp: RegExp, message: string): CreatedRule {
    return function (value, field) {
      if (!regExp.test(value)) {
        this.error(String(field), message);
      }
    }
  },
  NotLonger: function (limit: number, message: string): CreatedRule {
    return function (value, field) {
      if (value.length > limit) {
        this.error(String(field), message);
      }
    }
  },
  NotShorter: function (limit: number, message: string): CreatedRule {
    return function (value, field) {
      if (value.length < limit) {
        this.error(String(field), message);
      }
    }
  }
};

export class Validation<VS extends Values, PS> {
  valid: boolean = true;
  errors: Errors = {};
  values: VS;
  schema: Schema<VS, PS>;
  params: PS | void;

  constructor (values: VS, params: PS, schema: Schema<VS, PS>) {
    this.values = values;
    this.schema = schema;
    this.params = params;
  }

  error (field: string, message: string) {
    this.valid = false;
    const errors = this.errors[field];

    if (errors) {
      errors.push(message);
    } else {
      this.errors[field] = [message];
    }
  }

  useRules<F extends keyof VS> (value: VS[F], field: F, rules: Rule<VS, F, PS>[]) {
    for (let index = 0 ; index < rules.length ; ++index) {
      rules[index].call(this, value, field);
    }
  }

  validateField<F extends keyof VS>(field: F) {
    const rule = this.schema[field];

    if (isRuleArray(rule)) {
      for (let index = 0 ; index < rule.length ; ++index) {
        if (isRule(rule[index])) {
          rule[index].call(this, this.values[field], field);
        }
      }
    } else if (isRule(rule)) {
      rule.call(this, this.values[field], field);
    }

    return this;
  }

  valueOf(): ValidationBase {
    return {
      valid: this.valid,
      errors: this.errors
    };
  }
}

function isRuleArray<VS extends Values, PS, F extends keyof VS> (rule: Schema<VS, PS>[F]): rule is Rule<VS, F, PS>[] {
  return rule instanceof Array;
}

function isRule<VS extends Values, PS, F extends keyof VS> (rule: Schema<VS, PS>[F]): rule is Rule<VS, F, PS> {
  return rule instanceof Function;
}

function checkIfErrorsAreEqual (left: string[] | undefined, right: string[] | undefined): boolean {
  let result = true;

  if (left && right) {
    if (left.length === right.length) {
      for (let index = 0 ; index < left.length ; ++index) {
        if (left[index] !== right[index]) {
          result = false;
          break;
        }
      }
    } else {
      result = false;
    }
  } else if (left === right) {
    result = true;
  }

  return result;
}

function updateResult<VS extends Values, PS> (
  previous: ValidationBase,
  current: Validation<VS, PS>,
  field: string
) {
  let result: ValidationBase = previous;

  if (previous) {
    if (!checkIfErrorsAreEqual(previous.errors[field], current.errors[field])) {
      result = {
        errors: {},
        valid: true
      };

      for (let key in previous.errors) {
        if (key !== field || current.errors[field]) {
          result.errors[key] = current.errors[key];
          result.valid = false;
        }
      }
    }
  }

  return result;
}

class Validator<VS extends Values, PS = void> {
  static RULES = RULES;
  static createRule<VS extends Values, V, PS = void>(
    rule: (this: Validation<VS, PS>, value: V, field: keyof VS) => void
  ) {
    return rule;
  }

  schema: Schema<VS, PS>;

  constructor (schema: Schema<VS, PS>) {
    this.schema = schema;
  }

  validate (values: VS, params: ValidationParams<VS, PS> = {}) {
    const validation = new Validation(values, params.params, this.schema);

    if (params.field) {
      validation.validateField(params.field);

      if (params.compare) {
        return updateResult(params.compare, validation, String(params.field));
      }
    } else {
      for (const field in this.schema) {
        validation.validateField(field);
      }
    }

    return validation.valueOf();
  }
}

export default Validator;

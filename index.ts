type Values = {
  [field: string]: any;
};

type Rule<VS extends Values, F extends keyof VS> = (this: Validation<VS>, value: VS[F], field?: F) => void;

type Schema<VS extends Values> = {
  [F in keyof VS]?: Rule<VS, F> | Rule<VS, F>[];
}

type Errors<VS extends Values> = {[field in keyof VS]?: string[]};

type ValidationBase<VS extends Values> = {
  valid: boolean;
  errors: Errors<VS>;
};

type ValidationParams<VS extends Values> = {
  field?: keyof VS;
  compare?: ValidationBase<VS>;
};

interface CreatedRule {
  <VS extends Values, F extends keyof VS>(this: Validation<VS>, value: VS[F], field?: F): void;
}

const RULES = {
  Required: function (message: string): CreatedRule {
    return function (value, field) {
      if (value == undefined || value === '') {
        this.error(field, message);
      }
    }
  },
  LessThen: function (limit: number, message: string): CreatedRule {
    return function (value, field) {
      if (value >= limit) {
        this.error(field, message);
      }
    }
  },
  NotLessThen: function (limit: number, message: string): CreatedRule {
    return function (value, field) {
      if (value < limit) {
        this.error(field, message);
      }
    }
  },
  MoreThen: function (limit: number, message: string): CreatedRule {
    return function (value, field) {
      if (value <= limit) {
        this.error(field, message);
      }
    }
  },
  NotMoreThen: function (limit: number, message: string): CreatedRule {
    return function (value, field) {
      if (value > limit) {
        this.error(field, message);
      }
    }
  },
  Between: function (min: number, max: number, message: string): CreatedRule {
    return function (value, field) {
      if (value < min || value > max) {
        this.error(field, message);
      }
    }
  },
  Match: function (regExp: RegExp, message: string): CreatedRule {
    return function (value, field) {
      if (!regExp.test(value)) {
        this.error(field, message);
      }
    }
  },
  NotLonger: function (limit: number, message: string): CreatedRule {
    return function (value, field) {
      if (value.length > limit) {
        this.error(field, message);
      }
    }
  },
  NotShorter: function (limit: number, message: string): CreatedRule {
    return function (value, field) {
      if (value.length < limit) {
        this.error(field, message);
      }
    }
  }
};

class Validation<VS extends Values> {
  valid: boolean = true;
  errors: Errors<VS> = {};
  values: VS;
  schema: Schema<VS>;

  constructor (values: VS, schema: Schema<VS>) {
    this.values = values;
    this.schema = schema;
  }

  error (field: keyof VS, message: string) {
    this.valid = false;

    if (this.errors[field]) {
      this.errors[field].push(message);
    } else {
      this.errors[field] = [message];
    }
  }

  useRules<F extends keyof VS> (value: VS[F], field: F, rules: Rule<VS, F>[]) {
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

  valueOf(): ValidationBase<VS> {
    return {
      valid: this.valid,
      errors: this.errors
    };
  }
}

function isRuleArray<VS extends Values, F extends keyof VS> (rule: Schema<VS>[F]): rule is Rule<VS, F>[] {
  return rule instanceof Array;
}

function isRule<VS extends Values, F extends keyof VS> (rule: Schema<VS>[F]): rule is Rule<VS, F> {
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

function updateResult<VS extends Values> (previous: ValidationBase<VS>, current: Validation<VS>, field: keyof VS) {
  let result: ValidationBase<VS>;

  if (previous) {
    if (checkIfErrorsAreEqual(previous.errors[field], current.errors[field])) {
      result = previous;
    } else {
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

class Validator<VS extends Values> {
  static RULES = RULES;
  schema: Schema<VS>;

  constructor (schema: Schema<VS>) {
    this.schema = schema;
  }

  validate (values: VS, params: ValidationParams<VS> = {}) {
    const validation = new Validation<VS>(values, this.schema);

    if (params.field) {
      validation.validateField(params.field);

      if (params.compare) {
        return updateResult(params.compare, validation, params.field);
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

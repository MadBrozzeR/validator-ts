# mbr-validator
[![npm][npm-img]][npm]

[npm-img]:https://img.shields.io/npm/v/mbr-validator
[npm]:https://www.npmjs.com/package/mbr-validator

Simple form validation utility by MadBrozzeR. Validation is performed by using predefined schema.
TypeScript (TS) support is included and should treat types pretty well.

## Constructor

Validator conctructor is simple class with two TS genecric parameters and one constructor argument.

```
const validator = new Validator<TForm, TParams>(Schema);
```

**TForm** - Form structure. See Form structure section.

**TParams** - Optional. External (perhaps variable) params that your validation may rely on. See Validation params section.

**Schema** - Main validation schema. See Validation schema section. With TS it is good idea to initialize
schema right inside constructor, as TS will put all required types into it using provided TForm and TParams.

## Form structure

This validator considers your validation data as plain object with flat structure:

```
const form = {
  field1: value1,
  field2: value2,
  ...
}
```
All keys are being treated as field names and values as field values. Deep structure is still possible, but it is highly
not recommended, as there is no default approach for that and it will be difficult to understand and maintain.

## Validation schema

Heart and soul of your validation. Schema is also a flat object. Keys considered to have field names to validate.
You can omit fields that don't require validation.

Values can be either a single rule, or array of rules.

```
const schema: Schema<TForm, TParams> = {
  field1: SingleRule,
  field2: [Rule1, Rule2]
}
```

**TForm** - Form structure. See Form structure section.

**TParams** -- Optional. See Validation params section.

**SingleRule**, **Rule1**, **Rule2** - Rules to validate field. See Validation rule section.

## Validation rule

Each rule is a function with context (so it should not be an arrow function, or function with bound context)
and two arguments.

```
const SomeRule: Rule<TForm, 'field1', TParams> = function (value, field) {
  const allFormValues = this.values;
  const externalParams = this.params;

  const condition = (value === 'Some condition');

  if (!condition) {
    this.error(field, 'Should fulfill condition!');
  }
}
```

**TForm** - Form structure. See Form structure section.

**field1** - field name to apply rule to.

**TParams** - Optional. See Validation params section.

**value** - Current field value to be validated.

**field** - Field name.

**this.values** - Set of all form values in case of your field depends on some other fields.

**this.params** - External (variable) params in case of your field relies on them. You should always check if its
value is defined if you going to use it in your rule, as it is optional and may be not provided.

**this.error(field, message)** - Method to set validation error. It will record provided error message
for given field and fail validation in general.

## Default rules

You can also use default rules provided by `Validator.RULES` set. All of them are functions with one or more arguments
(last one is always an error message).

```
const schema<...> = {
  field1: Validator.RULES.Required('This field is required'),
  field2: Validator.RULES.LessThen(10, 'This value should be less then 10'),
  field3: Validator.RULES.NotLessThen(10, 'This value should be more or equal to 10'),
  field4: Validator.RULES.MoreThen(10, 'This value should be more then 10'),
  field5: Validator.RULES.NotMoreThen(10, 'This value should be less or equal to 10'),
  field6: Validator.RULES.Between(10, 20, 'This value should be between 10 and 20 inclusively'),
  field7: Validator.RULES.Match(/SomeRegExp/, 'This string value should match regular expression'),
  field8: Validator.RULES.NotLonger(10, 'This string value should not be longer then 10 symbols'),
  field9: Validator.RULES.NotShorter(10, 'This string value should not be shorter then 10 symbols')
}
```

## Validation itself

When your validation schema is ready and you are going to validate your values, you should call to
`validate` method from `validator` instance, created by Validator constructor.

```
const validation = validator.validate(form, props);
```

**form** - Form values to validate. It should contain all current form values, not only ones to be validated.

**props** - Optional. See Extended validation props section.

Validation result will have following structure

```
// succeed validation
{
  valid: true,
  errors: {}
}

// failed validation
{
  valid: false,
  errors: {
    field1: ['Error message 1'],
    field5: ['Error message 2', 'Error message 3']
  }
}
```

`valid` property describes if validation succeed or failed in general.

`errors` is set of encountered errors. It uses field names as keys and array of error messages as values.
It contains only failed fields, successfully validated fields won't be added to object.

## Extended validation props

Validation props is an object with structure (all fields are optional):

```
{
  field: 'field1',
  compare: PreviousValidationResult,
  params: ValidationParams
}
```

**field** - Validate this field only.

**compare** - Update previous validation result with currently validated field. `field` property should
also be provided for it to work, otherwise it will be ignored.

**params** - External validation params. See Validation params section.

## Validation params

You can optionaly provide your validation with external parameters. In such case don't forget to provide their TS type
in your validation rule.

Params value can be of any type, even a single primitive, but it is good idea to give it some structure that
make sense.

```
type TParams = {
  test: number;
}
const validationParams: TParams = {
  test: 15
};

const SomeRule: Rule<TForm, 'field1', TParams> = function (value, field) {
  // Don't forget to check if params is defined, as it may be not provided to validation method.
  const testParam = this.params && this.params.test;

  if (testParam && value !== testParam) {
    this.error(field, `Value should match ${testParam}`)
  }
}

// Create validator with our rule
const validator = new Validation<TForm, TParams>({
  field1: SomeRule
});

// Validate form; provide validation with external parameters.
const validation = validator.validate(form, { params: validationParams });
```

If `TParams` type parameter is not provided to generic, TS should not let you use it in your validation rule.

## Reusable rules

From time to time you will need to apply single validation rule to different fields. With vanilla JS you can simply
create required function, but with TS you can easily get messed up with types, so there is `Validator.createRule`
static method to make it simple.

```
const SomeCustomRule = Validator.createRule<TForm, TValueType, TParams>(
  function (value, field) { ... }
);

const validator = new Validator<...>({
  field1: SomeCustomRule,
  field2: [SomeCustomRule, SomeOtherRule]
});
```

**TForm** - Form structure. See Form structure section.

**TValueType** - Field value type to manipulate in your validation rule.

**TParams** - Optional. See Validation params section.

## Close to real-world example

```
type TStructured = { structuredValue: string };

type TForm = {
  field1: number;
  field2: string;
  field3: TStructured | null;
  field4: string;
}

type TParams = {
  assertion1: number;
  assertion2: string;
};

const CustomRule = Validator.createRule<TForm, TStructured, TParams>(function (value, field) {
  const length = this.params && this.params.assertion1;
  const substring = this.params && this.params.assertion2;
  const otherFieldValue = this.values.field4;

  // It's actually not a good idea to include several assertions in one rule, but it is still possible.
  if (length && value.structuredValue.length !== length) {
    this.error(field, `Value should be exactly ${length} symbols long`);
  }

  if (substring && value.structuredValue.indexOf(substring) === -1) {
    this.error(field, `Value should contain '${substring}'`)
  }

  if (value.structuredValue === otherFieldValue) {
    this.error(field, 'Value should not be equal to field4 value');
  }
});

const validator = new Validator<TForm, TParams>({
  field1: Validator.RULES.MoreThen(20, 'Should be more then 20'),
  field2: [
    Validator.RULES.Required('Required field'),
    Validator.RULES.NotLonger(10, 'Value should not be longer then 10')
  ],
  field3: [
    Validator.RULES.Required('Required field'),
    CustomRule
  ]
  // field4 doesn't require validation, so there's no need to include it into validation schema.
});

// ---------------------------------

const form = {
  field1: 10,
  field2: '1234567890',
  field3: { structuredValue: 'abcdefgh' },
  field4: ''
};

const validationParams = {
  assertion1: 9,
  assertion2: 'cdE'
};

const validation = validator.validate(form, { params: validationParams });

/* Validation will fail with result object:
 *
 * {
 *   valid: false,
 *   errors: {
 *     field1: ['Should be more then 20'],
 *     field3: [
 *        'Value should be exactly 9 symbols long',
 *        'Value should contain 'cdE''
 *     ]
 *   }
 * }
 */
```

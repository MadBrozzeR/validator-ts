declare type Values = {
    [field: string]: any;
};
declare type Rule<VS extends Values, F extends keyof VS> = (this: Validation<VS>, value: VS[F], field?: F) => void;
declare type Schema<VS extends Values> = {
    [F in keyof VS]?: Rule<VS, F> | Rule<VS, F>[];
};
declare type Errors<VS extends Values> = {
    [field in keyof VS]?: string[];
};
declare type ValidationBase<VS extends Values> = {
    valid: boolean;
    errors: Errors<VS>;
};
declare type ValidationParams<VS extends Values> = {
    field?: keyof VS;
    compare?: ValidationBase<VS>;
};
interface CreatedRule {
    <VS extends Values, F extends keyof VS>(this: Validation<VS>, value: VS[F], field?: F): void;
}
declare class Validation<VS extends Values> {
    valid: boolean;
    errors: Errors<VS>;
    values: VS;
    schema: Schema<VS>;
    constructor(values: VS, schema: Schema<VS>);
    error(field: keyof VS, message: string): void;
    useRules<F extends keyof VS>(value: VS[F], field: F, rules: Rule<VS, F>[]): void;
    validateField<F extends keyof VS>(field: F): this;
    valueOf(): ValidationBase<VS>;
}
declare class Validator<VS extends Values> {
    static RULES: {
        Required: (message: string) => CreatedRule;
        LessThen: (limit: number, message: string) => CreatedRule;
        NotLessThen: (limit: number, message: string) => CreatedRule;
        MoreThen: (limit: number, message: string) => CreatedRule;
        NotMoreThen: (limit: number, message: string) => CreatedRule;
        Between: (min: number, max: number, message: string) => CreatedRule;
        Match: (regExp: RegExp, message: string) => CreatedRule;
        NotLonger: (limit: number, message: string) => CreatedRule;
        NotShorter: (limit: number, message: string) => CreatedRule;
    };
    schema: Schema<VS>;
    constructor(schema: Schema<VS>);
    validate(values: VS, params?: ValidationParams<VS>): ValidationBase<VS>;
}
export default Validator;
